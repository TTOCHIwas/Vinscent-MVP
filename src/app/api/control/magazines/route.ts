import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';  // 🔧 추가: 캐시 재검증
import { getAllMagazines } from '@/lib/db/operations/magazines/content';
import { createMagazine } from '@/lib/db/operations/magazines/management';
import { getMagazineCount } from '@/lib/db/operations/magazines/statistics';
import { getTokenRole } from '@/lib/auth/token-generator';
import { logAdminActivity } from '@/lib/db/operations/activity-logs';

// GET: 모든 매거진 조회 (어드민용 - 모든 상태 포함)
export async function GET(request: NextRequest) {
  try {
    // 토큰 검증 (미들웨어에서 이미 체크했지만 추가 검증)
    const token = request.nextUrl.searchParams.get('token');
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const role = await getTokenRole(token);
    if (!role) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') as 'draft' | 'published' | null;
    const category = searchParams.get('category') as 'official' | 'unofficial' | null;
    const countOnly = searchParams.get('count') === 'true';

    // 개수만 조회하는 경우
    if (countOnly) {
      const result = await getMagazineCount(
        status || undefined,
        category || undefined
      );
      
      if (result.success && result.data) {
        return NextResponse.json({
          success: true,
          data: { count: result.data.count },  // ✅ 구조 통일
          adminRole: role,
        });
      } else {
        return NextResponse.json(
          { success: false, error: result.error || 'Failed to get count' },
          { status: 500 }
        );
      }
    }

    // 전체 매거진 조회 (모든 상태 포함)
    const result = await getAllMagazines();
    
    if (result.success && result.data) {
      // 필터링
      let magazines = result.data;
      
      if (status) {
        magazines = magazines.filter(m => m.status === status);
      }
      
      if (category) {
        magazines = magazines.filter(m => m.category === category);
      }
      
      // 정렬 (최신순)
      magazines.sort((a, b) => {
        const dateA = new Date(a.createdDate || 0).getTime();
        const dateB = new Date(b.createdDate || 0).getTime();
        return dateB - dateA;
      });
      
      // 페이지네이션
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedMagazines = magazines.slice(startIndex, endIndex);
      
      return NextResponse.json({
        success: true,
        data: paginatedMagazines,  // ✅ 'data' 필드로 통일
        pagination: {
          page,
          limit,
          total: magazines.length,
          totalPages: Math.ceil(magazines.length / limit),
        },
        adminRole: role,
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to get magazines' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Admin Magazine GET API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: 블록 기반 매거진 생성 (어드민 전용)
export async function POST(request: NextRequest) {
  try {
    // 토큰에서 역할 확인
    const token = request.nextUrl.searchParams.get('token');
    const role = await getTokenRole(token || '');
    
    if (!role) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('[DEBUG] Block-based magazine creation request:', {
      title: body.title,
      blocksCount: body.blocks?.length || 0,
      brandName: body.brandName
    });
    
    // 🆕 블록 기반 데이터 검증
    if (!body.title?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Magazine title is required' },
        { status: 400 }
      );
    }

    if (!body.brandName?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Brand name is required' },
        { status: 400 }
      );
    }

    // 블록 데이터 검증
    if (!body.blocks || !Array.isArray(body.blocks) || body.blocks.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one block is required' },
        { status: 400 }
      );
    }

    // 블록 데이터 상세 검증
    for (let i = 0; i < body.blocks.length; i++) {
    const block = body.blocks[i];
    
    if (!block.type || !['text', 'image'].includes(block.type)) {
    return NextResponse.json(
    { success: false, error: `Block ${i + 1}: Invalid block type. Must be 'text' or 'image'` },
    { status: 400 }
    );
    }
    
    if (typeof block.order !== 'number') {
    return NextResponse.json(
    { success: false, error: `Block ${i + 1}: Block order must be a number` },
    { status: 400 }
    );
    }
    
    if (block.type === 'text' && !block.content?.markdown?.trim()) {
    return NextResponse.json(
    { success: false, error: `Block ${i + 1}: Text block must have markdown content` },
    { status: 400 }
    );
    }
    
    if (block.type === 'image' && !block.content?.imageUrl?.trim()) {
    return NextResponse.json(
    { success: false, error: `Block ${i + 1}: Image block must have imageUrl` },
    { status: 400 }
    );
    }
    }

      // Credit 문자열을 배열로 변환
      const convertCreditsStringToArray = (creditsString: string) => {
        if (!creditsString?.trim()) return [];
        
        return creditsString
          .split('\n')
          .filter(line => line.trim())
          .map(line => {
            const colonIndex = line.indexOf(':');
            if (colonIndex === -1) {
              return { role: '기타', name: line.trim() };
            }
            return {
              role: line.substring(0, colonIndex).trim(),
              name: line.substring(colonIndex + 1).trim()
            };
          })
          .filter(item => item.role && item.name);
      };

    // 매거진 데이터 구성
    const magazineData = {
    title: body.title.trim(),
    subtitle: body.subtitle?.trim() || null,
    category: body.category || 'official',
    status: body.status || 'published',
    
    // 브랜드 정보 직접 입력
    brandName: body.brandName.trim(),
    brandUrl: body.brandUrl?.trim() || null,
    
    // Credits 문자열을 배열로 변환
    credits: typeof body.credits === 'string' 
      ? convertCreditsStringToArray(body.credits)
      : (Array.isArray(body.credits) ? body.credits : []),
    
    // 블록 데이터
    blocks: body.blocks.map((block: unknown) => {
      const b = block as { type: string; order: number; content: { markdown?: string; imageUrl?: string; imageSource?: string; imageCaption?: string; imageDescription?: string } };
      return {
        type: b.type,
        order: b.order,
        content: {
          // 텍스트 블록
          markdown: b.type === 'text' ? b.content.markdown : undefined,
          // 이미지 블록
          imageUrl: b.type === 'image' ? b.content.imageUrl : undefined,
          imageSource: b.type === 'image' ? b.content.imageSource : undefined,
          imageCaption: b.type === 'image' ? b.content.imageCaption : undefined,
          imageDescription: b.type === 'image' ? b.content.imageDescription : undefined,
        }
      };
    })
      };

    console.log('[DEBUG] Processed magazine data:', {
      title: magazineData.title,
      blocksCount: magazineData.blocks.length,
      brandName: magazineData.brandName,
      status: magazineData.status
    });

    // 블록 기반 매거진 생성
    const result = await createMagazine(magazineData);
    
    if (result.success && result.data) {
      // 스냅샷 데이터와 함께 활동 로그 기록
      await logAdminActivity({
        action: 'create',
        tableName: 'magazines',
        recordId: result.data.id,
        token: token!,
        request,
        changes: {
          title: magazineData.title,
          status: magazineData.status,
          category: magazineData.category,
          brandName: magazineData.brandName
        },
        snapshot: {
          title: result.data.title,
          status: result.data.status,
          category: result.data.category,
          brandName: result.data.brandName
        }
      });
      
      // 🔧 추가: 새 매거진 생성 시 캐시 재검증
      try {
        // 1. 새 매거진 상세 페이지 생성
        revalidatePath(`/magazine/${result.data.id}`, 'page');
        
        // 2. 메인 페이지 재검증 (히어로/캐러셀 데이터 갱신)
        revalidatePath('/', 'page');
        
        // 3. 매거진 리스트 페이지 재검증
        revalidatePath('/magazine', 'page');
        
        console.log(`[DEBUG] 캐시 재검증 완료: /magazine/${result.data.id}`);
      } catch (revalidateError) {
        console.error('[ERROR] revalidatePath 실패:', revalidateError);
        // 재검증 실패해도 생성은 성공으로 처리
      }
      
      console.log('[DEBUG] Block-based magazine created successfully:', result.data.id);
      
      return NextResponse.json({
        success: true,
        message: 'Block-based magazine created successfully',
        magazine: result.data,
        createdBy: role,
        timestamp: new Date().toISOString(),
      }, { status: 201 });
    } else {
      console.error('[DEBUG] Magazine creation failed:', result.error);
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to create magazine' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Admin Magazine POST API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}