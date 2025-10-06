
// Edge Runtime 호환 crypto 유틸리티
const createSHA256Hash = async (data: string): Promise<string> => {
  // Edge Runtime 체크
  const isEdgeRuntime = process.env.NEXT_RUNTIME === 'edge';
  
  // Web Crypto API 사용 (Edge Runtime 및 브라우저)
  if (globalThis.crypto?.subtle) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  // Edge Runtime에서는 여기까지만 (Node.js crypto 사용 불가)
  if (isEdgeRuntime) {
    throw new Error('Web Crypto API not available in Edge Runtime');
  }
  
  // Node.js crypto fallback (서버사이드 전용)
  if (typeof require !== 'undefined') {
    const crypto = await import('crypto');
    return crypto.createHash('sha256').update(data).digest('hex');
  }
  
  throw new Error('No crypto implementation available');
};

/**
 * Interface for team member information used in token generation
 */
interface TeamMember {
  role: 'developer' | 'designer' | 'marketing' | 'pm';
  birthDate: string; // YYYYMMDD
  phoneLastFour: string; // 전화번호 뒤 4자리
}

/**
 * Team member configuration loaded from environment variables
 * Contains role-based authentication credentials for daily token generation
 */
const TEAM_INFO: Record<string, TeamMember> = {
  developer: {
    role: 'developer',
    birthDate: process.env.DEV_BIRTH || '20020317',
    phoneLastFour: process.env.DEV_PHONE || '01092034239',
  },
  designer: {
    role: 'designer',
    birthDate: process.env.DESIGN_BIRTH || '00000000',
    phoneLastFour: process.env.DESIGN_PHONE || '00000000000',
  },
  marketing: {
    role: 'marketing',
    birthDate: process.env.MARKETING_BIRTH || '00000000',
    phoneLastFour: process.env.MARKETING_PHONE || '00000000000',
  },
  pm: {
    role: 'pm',
    birthDate: process.env.PM_BIRTH || '00000000',
    phoneLastFour: process.env.PM_PHONE || '00000000000',
  },
};

/**
 * Project secret key used for token generation, loaded from environment variables
 */
const PROJECT_SECRET = process.env.PROJECT_SECRET || 'vinscent_mvp_2025_secret_key';

/**
 * 일일 토큰 생성 함수 (Edge Runtime 호환)
 * @param date 날짜 (YYYYMMDD 형식)
 * @param role 팀원 역할
 * @returns 생성된 토큰
 */
export async function generateDailyToken(date: string, role: keyof typeof TEAM_INFO): Promise<string> {
  const member = TEAM_INFO[role];
  if (!member) {
    throw new Error(`Invalid role: ${role}`);
  }

  // 토큰 생성 재료 조합
  const tokenIngredients = [
    date, // 날짜
    member.birthDate, // 생일
    member.phoneLastFour, // 전화번호 뒤 4자리
    member.role, // 역할
    PROJECT_SECRET, // 프로젝트 시크릿
  ].join('|');

  // SHA-256 해시 생성 (Edge Runtime 호환)
  const hash = await createSHA256Hash(tokenIngredients);

  // 토큰 포맷: 처음 8자리-중간 4자리-끝 4자리
  const formattedToken = `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}`;
  
  return formattedToken;
}

export async function getTodayToken(role: keyof typeof TEAM_INFO): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
  return await generateDailyToken(dateStr, role);
}

export async function validateToken(token: string, role?: keyof typeof TEAM_INFO): Promise<boolean> {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

  try {
    // 특정 역할이 지정된 경우
    if (role) {
      const expectedToken = await generateDailyToken(dateStr, role);
      return token === expectedToken;
    }

    // 모든 역할에 대해 검증
    for (const memberRole of Object.keys(TEAM_INFO)) {
      const expectedToken = await generateDailyToken(dateStr, memberRole as keyof typeof TEAM_INFO);
      if (token === expectedToken) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
}

/**
 * 어드민 역할 확인 (Edge Runtime 호환)
 * @param token 토큰
 * @returns 해당 토큰의 역할 또는 null
 */
export async function getTokenRole(token: string): Promise<keyof typeof TEAM_INFO | null> {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

  try {
    for (const role of Object.keys(TEAM_INFO)) {
      const expectedToken = await generateDailyToken(dateStr, role as keyof typeof TEAM_INFO);
      if (token === expectedToken) {
        return role as keyof typeof TEAM_INFO;
      }
    }

    return null;
  } catch (error) {
    console.error('Token role determination error:', error);
    return null;
  }
}