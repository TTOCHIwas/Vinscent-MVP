import { db } from '../../index';
import { magazines } from '../../schema'; 
import { eq, and, sql, count, SQL, gte } from 'drizzle-orm';
import { ApiResponse, MagazineStatistics } from '@/types';
import { handleMagazineOperationError } from './helpers';

/**
 * 매거진 개수 조회
 * @description 상태별, 카테고리별 필터링 지원
 */
export async function getMagazineCount(
  status?: 'draft' | 'published', 
  category?: 'official' | 'unofficial'
): Promise<ApiResponse<{ count: number }>> {
  try {
    let whereCondition: SQL<unknown> | undefined = undefined;
    
    if (status && category) {
      whereCondition = and(
        eq(magazines.status, status),
        eq(magazines.category, category)
      )!;
    } else if (status) {
      whereCondition = eq(magazines.status, status);
    } else if (category) {
      whereCondition = eq(magazines.category, category);
    }
    
    const [result] = await db.select({ count: count() })
      .from(magazines)
      .where(whereCondition);
    
    return { success: true, data: { count: result.count } };
  } catch (error) {
    return handleMagazineOperationError(error, 'getMagazineCount');
  }
}

/**
 * 매거진 조회수 증가
 * @description 매거진 조회수 증가
 */
export async function incrementViewCount(magazineId: number): Promise<ApiResponse> {
  try {
    console.log('[DEBUG] Incrementing view count for magazine:', magazineId);
    
    const [magazine] = await db.select()
      .from(magazines)
      .where(eq(magazines.id, magazineId));
      
    if (!magazine) {
      return { success: false, error: 'Magazine not found' };
    }
    
    await db.update(magazines)
      .set({ viewCount: sql`view_count + 1` })
      .where(eq(magazines.id, magazineId));
    
    console.log('[DEBUG] View count incremented for magazine:', magazineId);
    return { success: true };
    
  } catch (error) {
    return handleMagazineOperationError(error, 'incrementViewCount');
  }
}

/**
 * 매거진 통계 및 로그 조회 (어드민 전용)
 * @description 실제 활동 로그 테이블에서 모든 CRU 활동 추적
 */
export async function getMagazineStatistics(): Promise<ApiResponse<MagazineStatistics>> {
  try {
    const { getRecentActivityLogs } = await import('../activity-logs');
    
    const [totalMagazines] = await db.select({ count: count() })
      .from(magazines);

    const [publishedCount] = await db.select({ count: count() })
      .from(magazines) 
      .where(eq(magazines.status, 'published'));

    const [draftCount] = await db.select({ count: count() })
      .from(magazines)
      .where(eq(magazines.status, 'draft'));

    const [totalViews] = await db.select({ 
      total: sql<number>`SUM(${magazines.viewCount})` 
    }).from(magazines);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const [recentCreated] = await db.select({ count: count() })
      .from(magazines)
      .where(gte(magazines.createdDate, sevenDaysAgo));

    const [recentUpdated] = await db.select({ count: count() })
      .from(magazines)
      .where(gte(magazines.updatedDate, sevenDaysAgo));

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const dailyViews = await db.select({
      date: sql<string>`DATE(${magazines.updatedDate})`,
      count: sql<number>`SUM(${magazines.viewCount})`
    }).from(magazines)
      .where(and(
        eq(magazines.status, 'published'),
        gte(magazines.updatedDate, thirtyDaysAgo)
      )!)
      .groupBy(sql`DATE(${magazines.updatedDate})`)
      .orderBy(sql`DATE(${magazines.updatedDate}) ASC`);

    const activityLogsResult = await getRecentActivityLogs(50);
    const activityLogs = (activityLogsResult.success && activityLogsResult.data) 
      ? activityLogsResult.data 
      : [];
    
    const recentActivity = activityLogs
      .filter(log => log.tableName === 'magazines')
      .map((log) => {
        let snapshot = null;
        
        try {
          if (log.changes) {
            const parsedChanges = JSON.parse(log.changes);
            snapshot = parsedChanges.snapshot;
          }
        } catch (error) {
          console.warn('로그 데이터 파싱 실패:', error);
        }
        
        const title = snapshot?.title || '매거진 제목 없음';
        const status = snapshot?.status || 'unknown';
        const category = snapshot?.category || 'unknown';
        
        const timestamp = log.timestamp instanceof Date 
        ? log.timestamp.toISOString() 
        : log.timestamp;
        
        return {
          id: log.recordId,
          title,
          action: log.action.toUpperCase() as 'CREATE' | 'UPDATE' | 'DELETE',
          timestamp,
          status,
          category
        };
      });

    return {
      success: true,
      data: {
        totalMagazines: totalMagazines.count,
        publishedCount: publishedCount.count,
        draftCount: draftCount.count,
        totalViews: totalViews.total || 0,
        recentCreated: recentCreated.count,
        recentUpdated: recentUpdated.count,
        dailyViews: dailyViews.map(item => ({
          date: item.date,
          count: Number(item.count) || 0
        })),
        recentActivity
      }
    };
  } catch (error) {
    return handleMagazineOperationError(error, 'getMagazineStatistics');
  }
}