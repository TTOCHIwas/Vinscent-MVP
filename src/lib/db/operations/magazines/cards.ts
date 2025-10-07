import { db } from '../../index';
import { magazines } from '../../schema'; 
import { eq, and, desc, count, SQL } from 'drizzle-orm';
import { MagazinePublishCard, ApiResponse, PaginatedResponse } from '@/types';
import { 
  magazineCardSelectFields, 
  transformToMagazineCard, 
  handleMagazineOperationError,
  filterValidMagazineCards
} from './helpers';

/**
 * 최신 매거진 카드 조회 (캐러셀용)
 * @description magazine_blocks에서 썸네일 추출
 */
export async function getLatestMagazineCards(limit = 8): Promise<ApiResponse<MagazinePublishCard[]>> {
  try {
    const results = await db
      .select(magazineCardSelectFields)
      .from(magazines)
      .where(eq(magazines.status, 'published'))
      .orderBy(desc(magazines.publishedDate))
      .limit(limit);

    if (results.length === 0) {
      return { success: true, data: [] };
    }

    const magazineCards = await Promise.all(
      results.map(async (magazine) => transformToMagazineCard(magazine))
    );

    const filteredCards = filterValidMagazineCards(magazineCards);

    console.log(`[DEBUG] Returning ${filteredCards.length} cards with valid thumbnails`);
    return { success: true, data: filteredCards };
    
  } catch (error) {
    return handleMagazineOperationError(error, 'getLatestMagazineCards');
  }
}

/**
 * 인기 매거진 카드 조회 (히어로용)
 * @description 조회수 순으로 정렬
 */
export async function getTopMagazineCards(limit = 3): Promise<ApiResponse<MagazinePublishCard[]>> {
  try {
    console.log(`[DEBUG] Getting top ${limit} magazine cards by view count`);
    
    const results = await db
      .select(magazineCardSelectFields)
      .from(magazines)
      .where(eq(magazines.status, 'published'))
      .orderBy(
        desc(magazines.viewCount),
        desc(magazines.publishedDate),
        desc(magazines.id)
      )
      .limit(limit);
    
    if (results.length === 0) {
      console.log('[DEBUG] No published magazines found for top cards');
      return { success: true, data: [] };
    }

    console.log(`[DEBUG] Found ${results.length} top magazines:`, 
      results.map(m => ({ id: m.id, title: m.title, viewCount: m.viewCount })));
    
    const magazineCards = await Promise.all(
      results.map(async (magazine) => {
        const card = await transformToMagazineCard(magazine);
        if (card) {
          console.log(`[DEBUG] Top magazine ${magazine.id} with thumbnail:`, card.thumbnail.imageUrl);
        }
        return card;
      })
    );
    
    const filteredCards = filterValidMagazineCards(magazineCards);
    
    console.log(`[DEBUG] Returning ${filteredCards.length} top cards with valid thumbnails`);
    return { success: true, data: filteredCards };
    
  } catch (error) {
    return handleMagazineOperationError(error, 'getTopMagazineCards');
  }
}

/**
 * 발행된 매거진 카드 조회
 * @description 단일 매거진 카드 데이터
 */
export async function getPublishedMagazineCardById(id: number): Promise<ApiResponse<MagazinePublishCard>> {
  try {
    console.log('[DEBUG] Getting published magazine card by ID:', id);
    
    const [result] = await db
      .select(magazineCardSelectFields)
      .from(magazines)
      .where(and(
        eq(magazines.id, id),
        eq(magazines.status, 'published')
      )!);
    
    if (!result) {
      return { success: false, error: 'Published magazine not found' };
    }
    
    const magazineCard = await transformToMagazineCard(result);
    
    if (!magazineCard) {
      return { success: false, error: 'Magazine thumbnail not found' };
    }
    
    console.log('[DEBUG] Magazine card found:', magazineCard.id);
    return { success: true, data: magazineCard };
    
  } catch (error) {
    return handleMagazineOperationError(error, 'getPublishedMagazineCardById');
  }
}

/**
 * 발행된 매거진 ID 목록 조회 (generateStaticParams용)
 * @description 빌드 시 정적 페이지 생성을 위한 ID 목록
 */
export async function getPublishedMagazineIds(): Promise<number[]> {
  try {
    console.log('[DEBUG] Getting published magazine IDs for static generation');
    
    const results = await db
      .select({ id: magazines.id })
      .from(magazines)
      .where(eq(magazines.status, 'published'))
      .orderBy(desc(magazines.publishedDate));
    
    const ids = results.map(r => r.id);
    console.log('[DEBUG] Found published magazine IDs:', ids);
    
    return ids;
  } catch (error) {
    console.error('[ERROR] getPublishedMagazineIds failed:', error);
    return [];
  }
}

/**
 * 발행된 매거진 카드 조회 (리스트용)
 * @description 페이지네이션 지원
 */
export async function getPublishedMagazineCards(
  page = 1,
  limit = 9,
  category?: 'official' | 'unofficial'
): Promise<PaginatedResponse<MagazinePublishCard>> {
  try {
    console.log(`[DEBUG] Getting published magazine cards: page ${page}, limit ${limit}, category: ${category}`);
    
    const offset = (page - 1) * limit;
    
    let whereCondition: SQL<unknown> = eq(magazines.status, 'published');
    
    if (category) {
      whereCondition = and(
        eq(magazines.status, 'published'),
        eq(magazines.category, category)
      )!;
    }
    
    const results = await db
      .select(magazineCardSelectFields)
      .from(magazines)
      .where(whereCondition)
      .orderBy(desc(magazines.publishedDate))
      .limit(limit)
      .offset(offset);
    
    const [countResult] = await db.select({ count: count() })
      .from(magazines)
      .where(whereCondition);
    
    const totalCount = countResult.count;
    
    console.log(`[DEBUG] Found ${results.length} magazines, total: ${totalCount}`);

    const magazineCards = await Promise.all(
      results.map(async (magazine) => transformToMagazineCard(magazine))
    );
    
    const filteredCards = filterValidMagazineCards(magazineCards);
    
    console.log(`[DEBUG] Returning ${filteredCards.length} cards with valid thumbnails`);
    
    return {
      success: true,
      data: filteredCards,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  } catch (error) {
    const errorResult = handleMagazineOperationError(error, 'getPublishedMagazineCards');
    return {
      ...errorResult,
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0,
      },
    };
  }
}