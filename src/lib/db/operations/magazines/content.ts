import { db } from '../../index';
import { magazines } from '../../schema';
import { eq, desc } from 'drizzle-orm';
import { MagazineWithBlocks, ApiResponse } from '@/types';
import { 
  transformToMagazineWithBlocks,
  handleMagazineOperationError 
} from './helpers';

/**
 * 매거진 상세 조회
 * @description 블록 데이터 포함
 */
export async function getMagazineById(id: number): Promise<ApiResponse<MagazineWithBlocks>> {
  try {
    console.log('[DEBUG] Getting magazine by ID:', id);
    
    const [magazine] = await db.select()
      .from(magazines)
      .where(eq(magazines.id, id));
    
    if (!magazine) {
      return { success: false, error: 'Magazine not found' };
    }
    
    const result = await transformToMagazineWithBlocks(magazine);
    
    console.log(`[DEBUG] Magazine loaded with ${result.blocks.length} blocks`);
    return { success: true, data: result as MagazineWithBlocks };
    
  } catch (error) {
    return handleMagazineOperationError(error, 'getMagazineById');
  }
}

/**
 * 모든 매거진 조회 (어드민용)
 * @description 모든 상태 포함
 */
export async function getAllMagazines(): Promise<ApiResponse<MagazineWithBlocks[]>> {
  try {
    console.log('[DEBUG] Getting all magazines for admin');
    
    const magazineResults = await db.select()
      .from(magazines)
      .orderBy(desc(magazines.updatedDate));

    const magazinesWithBlocks: MagazineWithBlocks[] = [];

    for (const magazine of magazineResults) {
      const magazineWithBlocks = await transformToMagazineWithBlocks(magazine);
      magazinesWithBlocks.push(magazineWithBlocks as MagazineWithBlocks);
    }
    
    console.log(`[DEBUG] Found ${magazinesWithBlocks.length} magazines`);
    return { success: true, data: magazinesWithBlocks };
    
  } catch (error) {
    return handleMagazineOperationError(error, 'getAllMagazines');
  }
}