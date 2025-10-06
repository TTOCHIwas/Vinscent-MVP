import { NextResponse } from 'next/server';
import { getLatestMagazineCards } from '@/lib/db/operations/magazines/cards';

export async function GET() {
  try {
    const result = await getLatestMagazineCards(8);
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: result.data || []
    });
  } catch (error) {
    console.error('Carousel magazines API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch carousel magazines'
    }, { status: 500 });
  }
}
