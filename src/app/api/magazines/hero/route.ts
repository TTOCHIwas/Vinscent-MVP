import { NextResponse } from 'next/server';
import { getTopMagazineCards } from '@/lib/db/operations/magazines/cards';

export async function GET() {
  try {
    const result = await getTopMagazineCards(3);
    
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
    console.error('Hero magazines API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch hero magazines'
    }, { status: 500 });
  }
}
