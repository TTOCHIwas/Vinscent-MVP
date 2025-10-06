import { NextRequest, NextResponse } from 'next/server';
import { getTokenRole, generateDailyToken } from '@/lib/auth/token-generator';

/**
 * 디버깅용 토큰 검증 API
 * 개발 환경에서만 사용 가능
 */
export async function GET(request: NextRequest) {
  // 개발 환경에서만 접근 허용
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This API is only available in development' },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token parameter is required' },
        { status: 400 }
      );
    }

    // 현재 날짜 정보
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    
    // 토큰 검증
    const role = await getTokenRole(token);
    
    // 디버깅 정보: 모든 역할의 예상 토큰 생성
    const expectedTokens: Record<string, string> = {};
    const roles = ['developer', 'designer', 'marketing', 'pm'] as const;
    
    for (const r of roles) {
      try {
        expectedTokens[r] = await generateDailyToken(dateStr, r);
      } catch (error) {
        expectedTokens[r] = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    }

    return NextResponse.json({
      success: true,
      debug: {
        receivedToken: token,
        currentDate: dateStr,
        currentDateTime: today.toISOString(),
        validRole: role,
        isValid: role !== null,
        expectedTokens: expectedTokens,
        environmentInfo: {
          DEV_BIRTH: process.env.DEV_BIRTH ? '설정됨' : '미설정',
          DEV_PHONE: process.env.DEV_PHONE ? '설정됨' : '미설정',
          DESIGN_BIRTH: process.env.DESIGN_BIRTH ? '설정됨' : '미설정',
          DESIGN_PHONE: process.env.DESIGN_PHONE ? '설정됨' : '미설정',
          MARKETING_BIRTH: process.env.MARKETING_BIRTH ? '설정됨' : '미설정',
          MARKETING_PHONE: process.env.MARKETING_PHONE ? '설정됨' : '미설정',
          PM_BIRTH: process.env.PM_BIRTH ? '설정됨' : '미설정',
          PM_PHONE: process.env.PM_PHONE ? '설정됨' : '미설정',
          PROJECT_SECRET: process.env.PROJECT_SECRET ? '설정됨' : '미설정',
        },
        serverInfo: {
          nodeEnv: process.env.NODE_ENV,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          platform: process.platform,
          nodeVersion: process.version,
        }
      },
      result: role ? {
        valid: true,
        role: role,
        message: `Valid token for role: ${role}`
      } : {
        valid: false,
        role: null,
        message: 'Invalid token'
      }
    });

  } catch (error) {
    console.error('Debug token API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        debug: {
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          errorStack: error instanceof Error ? error.stack : undefined
        }
      },
      { status: 500 }
    );
  }
}