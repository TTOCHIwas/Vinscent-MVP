import { NextRequest, NextResponse } from 'next/server';
import { getPublishedMagazineCards } from '@/lib/db/operations/magazines/cards';

/**
 * GET handler for retrieving published magazine cards with pagination and filtering
 * 
 * Purpose: 메인 페이지와 매거진 목록 페이지에서 사용할 최적화된 카드 데이터 제공
 * 
 * Query parameters:
 * - page: 페이지 번호 (기본값: 1)
 * - limit: 페이지당 항목 수 (기본값: 9)  
 * - category: 매거진 카테고리 ('official' | 'unofficial', 선택사항)
 * 
 * Response format:
 * {
 *   success: boolean,
 *   data: MagazinePublishCard[],
 *   pagination: {
 *     page: number,
 *     limit: number,
 *     total: number,
 *     totalPages: number
 *   }
 * }
 * 
 * @param request - Next.js request object with query parameters
 * @returns JSON response with paginated magazine card data
 */
export async function GET(request: NextRequest) {
  try {
    // URL 쿼리 파라미터 추출 및 기본값 설정
    const { searchParams } = new URL(request.url);
    
    // 페이지네이션 파라미터 처리
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '9');
    
    // 카테고리 필터 처리 (optional)
    const category = searchParams.get('category') as 'official' | 'unofficial' | null;
    
    // 입력 검증 - 사용자 친화적 에러 메시지 제공
    if (page < 1) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Page number must be greater than 0',
          hint: 'Try using page=1 for the first page'
        },
        { status: 400 }
      );
    }
    
    if (limit < 1 || limit > 50) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Limit must be between 1 and 50',
          hint: 'Use limit=9 for optimal performance'
        },
        { status: 400 }
      );
    }
    
    if (category && !['official', 'unofficial'].includes(category)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid category. Must be "official" or "unofficial"',
          hint: 'Omit category parameter to get all magazines'
        },
        { status: 400 }
      );
    }
    
    // 매거진 카드 데이터 조회 - 발행된 것만 + 페이지네이션
    console.log(`Fetching magazine cards: page=${page}, limit=${limit}, category=${category || 'all'}`);
    
    // 함수 시그니처에 맞춰 개별 파라미터로 전달
    const result = await getPublishedMagazineCards(
      page,
      limit, 
      category || undefined // null을 undefined로 변환
    );
    
    // 성공 응답 - 클라이언트가 기대하는 정확한 형식
    if (result.success && result.data) {
      return NextResponse.json({
        success: true,
        data: result.data, // MagazinePublishCard[] 타입
        pagination: result.pagination, // 페이지네이션 정보
        meta: {
          requestedPage: page,
          requestedLimit: limit,
          appliedCategory: category,
          timestamp: new Date().toISOString(),
          cacheHint: 'public, max-age=300', // 5분 캐싱 권장
        },
      });
    } else {
      // 데이터 조회 실패 - 구체적인 에러 정보 제공
      console.error('Failed to fetch magazine cards:', result.error);
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || 'Failed to fetch magazine cards',
          debug: {
            requestedParams: { page, limit, category },
            timestamp: new Date().toISOString(),
          }
        },
        { status: 500 }
      );
    }
  } catch (error) {
    // 예상치 못한 서버 에러 - 개발자를 위한 상세 로깅
    console.error('Magazine Cards API unexpected error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error while fetching magazine cards',
        message: 'Please try again later or contact support if the problem persists'
      },
      { status: 500 }
    );
  }
}