import { NextRequest, NextResponse } from 'next/server';
import { 
  getMagazineCount
} from '@/lib/db/operations/magazines/statistics';
import { getPublishedMagazineCards } from '@/lib/db/operations/magazines/cards';

/**
 * GET handler for retrieving published magazine cards with pagination and filtering
 * 
 * Query parameters:
 * - page: Page number for pagination (default: 1)
 * - limit: Items per page (default: 9)
 * - category: Filter by 'official' or 'unofficial'
 * - count: If 'true', returns only count instead of data
 * 
 * @param request - Next.js request object
 * @returns JSON response with magazine cards or count
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '9');
    const category = searchParams.get('category') as 'official' | 'unofficial' | null;
    const countOnly = searchParams.get('count') === 'true';

    // 개수만 조회하는 경우
    if (countOnly) {
      const result = await getMagazineCount(
        'published', // 발행된 것만
        category || undefined
      );
      
      if (result.success && result.data) {
        return NextResponse.json({
          success: true,
          count: result.data.count,
          timestamp: new Date().toISOString(),
        });
      } else {
        return NextResponse.json(
          { success: false, error: result.error || 'Failed to get count' },
          { status: 500 }
        );
      }
    }

    // MagazinePublishCard 조회
    const result = await getPublishedMagazineCards(
      page,
      limit,
      category || undefined
    );
    
    if (result.success && result.data) {
      return NextResponse.json({
        success: true,
        magazines: result.data,
        pagination: result.pagination,
        message: `${result.data.length} magazine cards loaded (optimized)`,
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to get magazine cards' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Magazine Cards GET API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}