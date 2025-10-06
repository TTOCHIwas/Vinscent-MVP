import { NextResponse } from 'next/server';
import { 
  getTopMagazineCards,
  getLatestMagazineCards 
} from '@/lib/db/operations/magazines';

// 메인 페이지 전용 API - 조회수 상위 3개 + 최신 8개 동시 제공
export async function GET() {
  try {
    const [topResult, latestResult] = await Promise.all([
      getTopMagazineCards(3),   // 조회수 상위 3개
      getLatestMagazineCards(8) // 최신 8개
    ]);
    
    // 에러 체크
    if (!topResult.success) {
      console.error('Top magazines error:', topResult.error);
      return NextResponse.json(
        { success: false, error: 'Failed to load top magazines' },
        { status: 500 }
      );
    }
    
    if (!latestResult.success) {
      console.error('Latest magazines error:', latestResult.error);
      return NextResponse.json(
        { success: false, error: 'Failed to load latest magazines' },
        { status: 500 }
      );
    }
    
    // 성공 응답 - 메인 페이지에 필요한 모든 데이터
    return NextResponse.json(
      {
        success: true,
        data: {
          topMagazines: topResult.data || [],
          latestMagazines: latestResult.data || [],
        },
        meta: {
          topCount: topResult.data?.length || 0,
          latestCount: latestResult.data?.length || 0,
          cacheHint: '5-minute-cache',
        },
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
          'Content-Type': 'application/json',
        }
      }
    );
    
  } catch (error) {
    console.error('Home magazines API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json(
    { message: 'OK' },
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}