import { NextRequest, NextResponse } from 'next/server';
import { getPublishedMagazineCardById } from '@/lib/db/operations/magazines/cards';
import { getMagazineById } from '@/lib/db/operations/magazines/content';

/**
 * GET handler for retrieving a specific magazine by ID
 * 
 * Query parameters:
 * - cardOnly: If 'true', returns optimized card data instead of full data
 * 
 * @param request - Next.js request object
 * @param params - Route parameters containing magazine ID
 * @returns JSON response with magazine data (card or full)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('[DEBUG] Magazine API: Starting request');
    
    const { id } = await params;
    console.log('[DEBUG] Magazine API: Received ID:', id);
    
    const magazineId = parseInt(id);
    const { searchParams } = new URL(request.url);
    const cardOnly = searchParams.get('cardOnly') === 'true';
    
    console.log('[DEBUG] Magazine API: Parsed ID:', magazineId, 'cardOnly:', cardOnly);
    
    if (isNaN(magazineId)) {
      console.error('[DEBUG] Magazine API: Invalid magazine ID');
      return NextResponse.json(
        { success: false, error: 'Invalid magazine ID' },
        { status: 400 }
      );
    }

    if (cardOnly) {
      console.log('[DEBUG] Magazine API: Fetching card data only');
      const result = await getPublishedMagazineCardById(magazineId);
      
      console.log('[DEBUG] Magazine API: Card result:', result.success, result.error);
      
      if (result.success && result.data) {
        return NextResponse.json({
          success: true,
          magazine: result.data,
          type: 'card',
          message: 'Magazine card data loaded (optimized)',
          timestamp: new Date().toISOString(),
        });
      } else {
        return NextResponse.json(
          { success: false, error: result.error || 'Magazine card not found' },
          { status: 404 }
        );
      }
    }

    // 전체 매거진 정보 조회 (상세 페이지용)
    console.log('[DEBUG] Magazine API: Fetching full magazine data');
    const result = await getMagazineById(magazineId);
    
    console.log('[DEBUG] Magazine API: Full result success:', result.success);
    if (result.error) {
      console.error('[DEBUG] Magazine API: Full result error:', result.error);
    }
    if (result.data) {
      console.log('[DEBUG] Magazine API: Magazine found:', {
        id: result.data.id,
        title: result.data.title,
        status: result.data.status,
        hasBlocks: result.data.blocks?.length || 0,
        brandName: result.data.brandName
      });
    }
    
    if (result.success && result.data) {
      // 발행된 매거진만 공개
      if (result.data.status !== 'published') {
        console.log('[DEBUG] Magazine API: Magazine not published:', result.data.status);
        return NextResponse.json(
          { success: false, error: 'Magazine not found' },
          { status: 404 }
        );
      }
      
      console.log('[DEBUG] Magazine API: Returning successful response');
      return NextResponse.json({
        success: true,
        magazine: result.data,
        type: 'full',
        message: 'Full magazine data loaded',
        timestamp: new Date().toISOString(),
      });
    } else {
      console.log('[DEBUG] Magazine API: Magazine not found or failed');
      return NextResponse.json(
        { success: false, error: result.error || 'Magazine not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('[DEBUG] Magazine API: Unexpected error:', error);
    console.error('[DEBUG] Magazine API: Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        debug: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
      },
      { status: 500 }
    );
  }
}