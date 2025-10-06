import { db } from '../../index';
import { magazines, magazineBlocks } from '../../schema';
import { eq, and, sql } from 'drizzle-orm';
import { MagazineBlockDisplay, MagazinePublishCard } from '@/types';

/**
 * 매거진 기본 정보 조회를 위한 select 객체
 */
export const magazineCardSelectFields = {
  id: magazines.id,
  title: magazines.title,
  subtitle: magazines.subtitle,
  viewCount: magazines.viewCount,
  category: magazines.category,
  publishedDate: magazines.publishedDate,
  brandName: magazines.brandName,
  brandUrl: magazines.brandUrl,
  createdDate: magazines.createdDate,
  updatedDate: magazines.updatedDate,
};

/**
 * 매거진의 썸네일 이미지 추출
 */
export async function extractMagazineThumbnail(magazineId: number) {
  const [firstImageBlock] = await db.select({
    id: magazineBlocks.id,
    imageUrl: magazineBlocks.imageUrl,
    blockOrder: magazineBlocks.blockOrder,
    magazineId: magazineBlocks.magazineId,
  })
    .from(magazineBlocks)
    .where(and(
      eq(magazineBlocks.magazineId, magazineId),
      eq(magazineBlocks.blockType, 'image'),
      sql`${magazineBlocks.imageUrl} IS NOT NULL AND ${magazineBlocks.imageUrl} != ''`
    )!)
    .orderBy(magazineBlocks.blockOrder)
    .limit(1);
    
  if (firstImageBlock?.imageUrl) {
    return {
      id: firstImageBlock.id,
      imageUrl: firstImageBlock.imageUrl,
      imageOrder: firstImageBlock.blockOrder,
      magazineId: firstImageBlock.magazineId,
    };
  }
  
  return null;
}

/**
 * 매거진 데이터를 카드 형태로 변환 (썸네일 포함)
 */
export async function transformToMagazineCard(magazine: unknown): Promise<MagazinePublishCard | null> {
  const m = magazine as { id: number; title: string; subtitle: string; viewCount: number; category: 'official' | 'unofficial'; publishedDate: Date; brandName: string; brandUrl: string | null; createdDate: Date; updatedDate: Date };
  const thumbnail = await extractMagazineThumbnail(m.id);
  
  if (!thumbnail) {
    console.warn(`[WARNING] Magazine ${m.id} has no valid images - skipping`);
    return null;
  }

  return {
    id: m.id,
    title: m.title,
    subtitle: m.subtitle,
    viewCount: m.viewCount,
    category: m.category,
    publishedDate: m.publishedDate,
    brandName: m.brandName,
    brandUrl: m.brandUrl,
    createdDate: m.createdDate,
    updatedDate: m.updatedDate,
    thumbnail,
  };
}

/**
 * 매거진 블록 데이터 조회
 */
export async function getMagazineBlocks(magazineId: number): Promise<MagazineBlockDisplay[]> {
  return await db.select({
    id: magazineBlocks.id,
    type: magazineBlocks.blockType,
    order: magazineBlocks.blockOrder,
    content: {
      markdown: magazineBlocks.textContent,
      imageUrl: magazineBlocks.imageUrl,
      imageSource: magazineBlocks.imageSource,
    }
  })
    .from(magazineBlocks)
    .where(eq(magazineBlocks.magazineId, magazineId))
    .orderBy(magazineBlocks.blockOrder);
}

/**
 * 크레딧 정보 파싱
 */
export function parseCredits(creditsString: string | null): Array<{ role: string; name: string }> {
  if (!creditsString) return [];
  
  try {
    return JSON.parse(creditsString);
  } catch (error) {
    console.warn('[DEBUG] Credits parsing failed:', error);
    return [];
  }
}

/**
 * 매거진 블록 데이터 삽입
 */
export async function insertMagazineBlocks(magazineId: number, blocks: unknown[]) {
  if (!blocks || blocks.length === 0) return;
  
  const blockData = blocks.map(block => {
    const b = block as { type: 'text' | 'image'; order: number; content: { markdown?: string; imageUrl?: string; imageSource?: string } };
    return {
      magazineId,
      blockType: b.type,
      blockOrder: b.order,
      textContent: b.type === 'text' ? b.content.markdown || null : null,
      imageUrl: b.type === 'image' ? b.content.imageUrl || null : null,
      imageSource: b.type === 'image' ? b.content.imageSource || null : null,
    };
  });
  
  await db.insert(magazineBlocks).values(blockData);
  console.log(`[DEBUG] Inserted ${blockData.length} blocks`);
}

/**
 * 매거진 데이터를 MagazineWithBlocks 형태로 변환
 */
export async function transformToMagazineWithBlocks(magazine: unknown) {
  const m = magazine as {
    id: number;
    title: string;
    subtitle?: string | null;
    category: 'official' | 'unofficial';
    viewCount: number;
    status: 'draft' | 'published';
    publishedDate?: Date | null;
    brandName: string;
    brandUrl?: string | null;
    credits: string | null;
    createdDate: Date;
    updatedDate: Date;
  };
  const blocks = await getMagazineBlocks(m.id);
  const credits = parseCredits(m.credits);
  
  return {
    ...m,
    blocks: blocks.map(block => ({
      id: block.id,
      type: block.type as 'text' | 'image',
      order: block.order,
      content: block.content,
    })),
    credits
  };
}

/**
 * 공통 에러 처리 함수
 */
export function handleMagazineOperationError(error: unknown, operationName: string) {
  console.error(`${operationName} error:`, error);
  return { 
    success: false, 
    error: error instanceof Error ? error.message : 'Unknown error' 
  };
}

/**
 * 타입 가드: MagazinePublishCard 배열에서 null 제거
 */
export function filterValidMagazineCards(cards: (MagazinePublishCard | null)[]): MagazinePublishCard[] {
  return cards.filter((card): card is MagazinePublishCard => card !== null);
}