import { db } from '../../index';
import { magazines, magazineBlocks } from '../../schema'; 
import { eq } from 'drizzle-orm';
import {
  CreateMagazineData,
  UpdateMagazineData,
  MagazineWithBlocks,
  ApiResponse
} from '@/types';
import { 
  insertMagazineBlocks,
  handleMagazineOperationError 
} from './helpers';

/**
 * 매거진 생성
 * @description 블록 데이터와 함께 생성
 */
export async function createMagazine(data: CreateMagazineData): Promise<ApiResponse<MagazineWithBlocks>> {
  try {
    console.log('[DEBUG] Creating magazine:', data.title);
    
    if (!data.title?.trim()) {
      return { success: false, error: 'Magazine title is required' };
    }
    
    if (!data.brandName?.trim()) {
      return { success: false, error: 'Brand name is required' };
    }
    
    // ✅ PostgreSQL: .returning()으로 삽입된 행 반환
    const magazineResult = await db.insert(magazines).values({
      title: data.title.trim(),
      subtitle: data.subtitle?.trim() || null,
      category: data.category || 'official',
      status: data.status || 'draft',
      publishedDate: data.status === 'published' ? new Date() : null,
      brandName: data.brandName.trim(),
      brandUrl: data.brandUrl?.trim() || null,
      viewCount: 0,
      credits: data.credits ? JSON.stringify(data.credits) : null,
    }).returning({ id: magazines.id });

    const magazineId = magazineResult[0].id;
    console.log('[DEBUG] Magazine created with ID:', magazineId);

    if (data.blocks && data.blocks.length > 0) {
      await insertMagazineBlocks(magazineId, data.blocks);
    }

    const { getMagazineById } = await import('./content');
    const result = await getMagazineById(magazineId);
    
    if (result.success && result.data) {
      console.log(`[DEBUG] Magazine '${data.title}' created successfully`);
      return {
        success: true,
        data: result.data,
        message: 'Magazine created successfully'
      };
    } else {
      throw new Error('Failed to retrieve created magazine');
    }
    
  } catch (error) {
    return handleMagazineOperationError(error, 'createMagazine');
  }
}

/**
 * 매거진 수정
 * @description 블록 데이터 전체 교체
 */
export async function updateMagazine(id: number, data: UpdateMagazineData): Promise<ApiResponse<MagazineWithBlocks>> {
  try {
    console.log('[DEBUG] Updating magazine:', id);
    
    // ✅ PostgreSQL: updatedDate 명시적 추가
    await db.update(magazines)
      .set({
        title: data.title,
        subtitle: data.subtitle,
        category: data.category,
        status: data.status,
        publishedDate: data.status === 'published' ? new Date() : undefined,
        brandName: data.brandName,
        brandUrl: data.brandUrl,
        credits: data.credits ? JSON.stringify(data.credits) : undefined,
        updatedDate: new Date(),
      })
      .where(eq(magazines.id, id));
    
    await db.delete(magazineBlocks).where(eq(magazineBlocks.magazineId, id));
    
    if (data.blocks && data.blocks.length > 0) {
      await insertMagazineBlocks(id, data.blocks);
    }
    
    const { getMagazineById } = await import('./content');
    const result = await getMagazineById(id);
    
    if (result.success && result.data) {
      return {
        success: true,
        data: result.data,
        message: 'Magazine updated successfully'
      };
    } else {
      throw new Error('Failed to retrieve updated magazine');
    }
    
  } catch (error) {
    return handleMagazineOperationError(error, 'updateMagazine');
  }
}

/**
 * 매거진 삭제
 * @description 매거진과 모든 블록 데이터 삭제
 */
export async function deleteMagazine(id: number): Promise<ApiResponse> {
  try {
    console.log('[DEBUG] Deleting magazine:', id);
    
    await db.delete(magazineBlocks).where(eq(magazineBlocks.magazineId, id));
    
    // ✅ PostgreSQL: .returning()으로 삭제된 행 반환
    const deletedResult = await db.delete(magazines)
      .where(eq(magazines.id, id))
      .returning({ id: magazines.id });
    
    if (deletedResult.length > 0) {
      console.log('[DEBUG] Magazine deleted successfully:', id);
      return { 
        success: true, 
        message: 'Magazine deleted successfully'
      };
    } else {
      return { success: false, error: 'Magazine not found' };
    }
    
  } catch (error) {
    return handleMagazineOperationError(error, 'deleteMagazine');
  }
}
