import { NextRequest, NextResponse } from 'next/server';
import { incrementViewCount } from '@/lib/db/operations/magazines/statistics';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    const resolvedParams = await params;
    const magazineId = parseInt(resolvedParams.id);
    
    // 이제 안전하게 매거진 ID를 검증할 수 있습니다
    if (isNaN(magazineId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid magazine ID' },
        { status: 400 }
      );
    }
    
    // 조회수 증가 로직 실행
    const result = await incrementViewCount(magazineId);
    
    if (result.success) {
      return NextResponse.json({ 
        success: true,
        message: 'View count incremented'
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to increment view count' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('View count API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}