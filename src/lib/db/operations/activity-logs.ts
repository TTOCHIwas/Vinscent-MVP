import { db } from '../index';
import { adminActivityLogs } from '../schema';
import { getTokenRole } from '../../auth/token-generator';
import { and, eq, desc, gte, lt } from 'drizzle-orm';
import { NextRequest } from 'next/server';

export async function logAdminActivity(params: {
  action: 'create' | 'update' | 'delete';
  tableName: string;
  recordId: number;
  token: string;
  request?: NextRequest;
  changes?: object;
  snapshot?: {
    title: string;
    status: string;
    category: string;
    brandName?: string;
  };
}) {
  try {
    const { action, tableName, recordId, token, request, changes, snapshot } = params;
    
    // 토큰에서 관리자 정보 추출
    const role = getTokenRole(token);
    const adminName = role ? `${role}_admin` : 'unknown';
    
    // IP 주소 추출 (Vercel/Next.js 환경 고려)
    let ipAddress = '127.0.0.1';
    if (request) {
      const forwardedFor = request.headers.get('x-forwarded-for');
      const realIP = request.headers.get('x-real-ip');
      ipAddress = forwardedFor?.split(',')[0] || realIP || '127.0.0.1';
    }
    
    // User Agent 추출
    const userAgent = request?.headers.get('user-agent') || 'Unknown';
    
    // 스냅샷과 변경사항을 함께 저장
    const logData = {
      action,
      tableName,
      recordId,
      adminName,
      ipAddress,
      userAgent,
      changes: JSON.stringify({
        snapshot: snapshot || null, // 활동 시점 매거진 정보
        changes: changes || null    // 변경된 필드들
      }),
    };
    
    await db.insert(adminActivityLogs).values(logData);
    
    console.log(`[ACTIVITY LOG] ${action.toUpperCase()} ${tableName}#${recordId} by ${adminName}`);
    
  } catch (error) {
    console.error('활동 로그 기록 실패:', error);
    // 로그 기록 실패는 메인 작업에 영향주지 않음
  }
}

/**
 * 최근 30일 활동 로그 조회
 */
export async function getRecentActivityLogs(limit = 50) {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const logs = await db
      .select({
        id: adminActivityLogs.id,
        action: adminActivityLogs.action,
        tableName: adminActivityLogs.tableName,
        recordId: adminActivityLogs.recordId,
        adminName: adminActivityLogs.adminName,
        timestamp: adminActivityLogs.timestamp,
        changes: adminActivityLogs.changes,
      })
      .from(adminActivityLogs)
      .where(
        gte(adminActivityLogs.timestamp, thirtyDaysAgo)
      )
      .orderBy(desc(adminActivityLogs.timestamp))
      .limit(limit);
    
    return { success: true, data: logs };
    
  } catch (error) {
    console.error('활동 로그 조회 실패:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * 매거진별 활동 로그 조회 (특정 매거진의 모든 활동)
 */
export async function getMagazineActivityLogs(magazineId: number) {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const logs = await db
      .select()
      .from(adminActivityLogs)
      .where(
        and(
          eq(adminActivityLogs.tableName, 'magazines'),
          eq(adminActivityLogs.recordId, magazineId),
          gte(adminActivityLogs.timestamp, thirtyDaysAgo)
        )
      )
      .orderBy(desc(adminActivityLogs.timestamp));
    
    return { success: true, data: logs };
    
  } catch (error) {
    console.error('매거진 활동 로그 조회 실패:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * 30일 이상 된 로그 정리 (크론잡 또는 주기적 실행용)
 */
export async function cleanupOldActivityLogs() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const result = await db
      .delete(adminActivityLogs)
      .where(
        lt(adminActivityLogs.timestamp, thirtyDaysAgo)
      );
    
    // Drizzle ORM MySQL delete 결과는 배열 형태로 반환됨
    const deletedCount = result[0]?.affectedRows || 0;
    
    console.log(`[CLEANUP] ${deletedCount}개의 오래된 활동 로그 삭제됨`);
    
    return { success: true, deletedCount };
    
  } catch (error) {
    console.error('활동 로그 정리 실패:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
