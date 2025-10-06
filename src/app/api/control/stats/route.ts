import { NextRequest, NextResponse } from 'next/server';
import { getMagazineStatistics } from '@/lib/db/operations/magazines/statistics';
import { getTokenRole } from '@/lib/auth/token-generator';

// GET: 통계 조회 (어드민 전용)
export async function GET(request: NextRequest) {
  try {
    // 토큰 검증
    const token = request.nextUrl.searchParams.get('token');
    const role = getTokenRole(token || '');
    
    if (!role) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await getMagazineStatistics();
    
    if (result.success && result.data) {
      // 주별, 월별 통계 계산
      const dailyViews = result.data.dailyViews || [];
      
      // 주별 통계 계산
      const weeklyViews: { week: string; count: number }[] = [];
      const weeklyMap = new Map<string, number>();
      
      dailyViews.forEach(({ date, count }) => {
        const d = new Date(date);
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        const weekKey = weekStart.toISOString().split('T')[0];
        
        weeklyMap.set(weekKey, (weeklyMap.get(weekKey) || 0) + count);
      });
      
      weeklyMap.forEach((count, week) => {
        weeklyViews.push({ week, count });
      });
      
      // 월별 통계 계산
      const monthlyViews: { month: string; count: number }[] = [];
      const monthlyMap = new Map<string, number>();
      
      dailyViews.forEach(({ date, count }) => {
        const monthKey = date.substring(0, 7); // YYYY-MM
        monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + count);
      });
      
      monthlyMap.forEach((count, month) => {
        monthlyViews.push({ month, count });
      });
      
      return NextResponse.json({
        success: true,
        statistics: {
          ...result.data,
          weeklyViews: weeklyViews.sort((a, b) => a.week.localeCompare(b.week)),
          monthlyViews: monthlyViews.sort((a, b) => a.month.localeCompare(b.month)),
        },
        adminRole: role,
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to get statistics' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Statistics API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}