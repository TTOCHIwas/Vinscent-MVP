import { NextRequest, NextResponse } from 'next/server';
import { getMagazineById } from '@/lib/db/operations/magazines/content';
import { 
  updateMagazine, 
  deleteMagazine 
} from '@/lib/db/operations/magazines/management';
import { getTokenRole } from '@/lib/auth/token-generator';
import { logAdminActivity } from '@/lib/db/operations/activity-logs';

// GET: 특정 매거진 조회 (어드민용 - 모든 상태 조회 가능)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 토큰 검증
    const token = request.nextUrl.searchParams.get('token');
    const role = await getTokenRole(token || '');
    
    if (!role) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // NextJS 15에서는 params를 await해야 합니다
    const { id } = await params;
    const magazineId = parseInt(id);
    
    if (isNaN(magazineId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid magazine ID' },
        { status: 400 }
      );
    }

    const result = await getMagazineById(magazineId);
    
    if (result.success && result.data) {
      return NextResponse.json({
        success: true,
        data: result.data,  // 🔧 수정: magazine → data (타입 일관성)
        adminRole: role,
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || 'Magazine not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Admin Magazine GET by ID API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: 매거진 수정 (어드민 전용)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 토큰 검증
    const token = request.nextUrl.searchParams.get('token');
    const role = await getTokenRole(token || '');
    
    if (!role) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // NextJS 15에서는 params를 await해야 합니다
    const { id } = await params;
    const magazineId = parseInt(id);
    
    if (isNaN(magazineId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid magazine ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    console.log('[DEBUG] 🔧 PUT API 요청 데이터 수신:', {
      magazineId,
      bodyKeys: Object.keys(body),
      title: body.title,
      hasBlocks: !!body.blocks,
      blocksCount: body.blocks?.length || 0,
      brandName: body.brandName,
      brandUrl: body.brandUrl
    });
    
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
    
    // 블록 기반 수정 데이터 준비
    const updateData = {
      title: body.title,
      subtitle: body.subtitle,
      category: body.category,
      status: body.status,
      brandName: body.brandName, // brandId 대신 brandName 사용
      brandUrl: body.brandUrl,
      // 블록 데이터 포함
      blocks: body.blocks,
      // Credits 문자열을 배열로 변환
      credits: typeof body.credits === 'string' 
        ? convertCreditsStringToArray(body.credits)
        : (Array.isArray(body.credits) ? body.credits : []),
      // 레거시 호환성
      content: null, // 블록 기반에서는 content는 null
      images: null   // 블록 기반에서는 별도 images 테이블 사용하지 않음
    };

    // undefined 값 제거 (null은 유지)
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData];
      }
    });

    const result = await updateMagazine(magazineId, updateData);
    
    if (result.success && result.data) {
      // 스냅샷 데이터와 함께 활동 로그 기록
      await logAdminActivity({
        action: 'update',
        tableName: 'magazines',
        recordId: magazineId,
        token: token!,
        request,
        changes: {
          title: updateData.title,
          status: updateData.status,
          category: updateData.category,
          brandName: updateData.brandName,
          blocksCount: updateData.blocks?.length || 0
        },
        snapshot: {
          title: result.data.title,
          status: result.data.status,
          category: result.data.category,
          brandName: result.data.brandName
        }
      });
      
      return NextResponse.json({
        success: true,
        message: 'Magazine updated successfully',
        data: result.data,  // 🔧 수정: magazine → data
        updatedBy: role,
        timestamp: new Date().toISOString(),
      });
    } else {
      console.error('[ERROR] updateMagazine 실패:', result.error);
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to update magazine' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Admin Magazine PUT API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: 매거진 삭제 (어드민 전용)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 토큰 검증
    const token = request.nextUrl.searchParams.get('token');
    const role = await getTokenRole(token || '');
    
    if (!role) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const magazineId = parseInt(id);
    
    if (isNaN(magazineId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid magazine ID' },
        { status: 400 }
      );
    }

    // 삭제 전 매거진 정보 가져오기 (스냅샷용)
    const magazineInfo = await getMagazineById(magazineId);
    const magazine = magazineInfo.success && magazineInfo.data ? magazineInfo.data : null;
    
    const result = await deleteMagazine(magazineId);
    
    if (result.success) {
      // 스냅샷 데이터와 함께 활동 로그 기록
      await logAdminActivity({
        action: 'delete',
        tableName: 'magazines',
        recordId: magazineId,
        token: token!,
        request,
        changes: {
          deletedId: magazineId
        },
        snapshot: magazine ? {
          title: magazine.title,
          status: magazine.status,
          category: magazine.category,
          brandName: magazine.brandName
        } : {
          title: `매거진 #${magazineId}`,
          status: 'unknown',
          category: 'unknown',
          brandName: 'unknown'
        }
      });
      
      return NextResponse.json({
        success: true,
        message: 'Magazine deleted successfully',
        deletedId: magazineId,
        deletedBy: role,
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to delete magazine' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Admin Magazine DELETE API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}