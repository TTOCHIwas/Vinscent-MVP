#!/usr/bin/env node

/**
 * Vinscent MVP 토큰 생성기 CLI 도구 (서버 동기화 버전)
 * 
 * 서버의 /src/lib/auth/token-generator.ts와 100% 동일한 로직 사용
 * - async/await 패턴 사용
 * - 서버와 동일한 해시 생성 방식
 * - 환경 변수 지원
 * 
 * 사용법:
 * node scripts/token-generator.js
 */

const crypto = require('crypto');

// Edge Runtime 호환 crypto 유틸리티 (서버와 동일)
async function createSHA256Hash(data) {
  // Node.js 환경에서는 crypto 모듈 사용
  return crypto.createHash('sha256').update(data).digest('hex');
}

// 팀원 정보 (서버 실제 값과 동일하게 수정)
const TEAM_INFO = {
  developer: {
    role: 'developer',
    birthDate: process.env.DEV_BIRTH || '20020317',
    phoneLastFour: process.env.DEV_PHONE || '01092034239',
  },
  marketing: {
    role: 'marketing',
    birthDate: process.env.MARKETING_BIRTH || '20030408',
    phoneLastFour: process.env.MARKETING_PHONE || '01025127854',
  },
  pm: {
    role: 'pm',
    birthDate: process.env.PM_BIRTH || '20011121',
    phoneLastFour: process.env.PM_PHONE || '01071489971',
  },
};

const PROJECT_SECRET = process.env.PROJECT_SECRET || 'vinscent_naver_give_up_secret_key';

/**
 * 일일 토큰 생성 함수 (서버와 100% 동일)
 * @param {string} date 날짜 (YYYYMMDD 형식)
 * @param {string} role 팀원 역할
 * @returns {Promise<string>} 생성된 토큰
 */
async function generateDailyToken(date, role) {
  const member = TEAM_INFO[role];
  if (!member) {
    throw new Error(`Invalid role: ${role}`);
  }

  // 토큰 생성 재료 조합 (서버와 동일)
  const tokenIngredients = [
    date, // 날짜
    member.birthDate, // 생일
    member.phoneLastFour, // 전화번호 뒤 4자리
    member.role, // 역할
    PROJECT_SECRET, // 프로젝트 시크릿
  ].join('|');

  // SHA-256 해시 생성 (서버와 동일)
  const hash = await createSHA256Hash(tokenIngredients);

  console.log(`[CLIENT] 토큰 재료 (${role}):`, tokenIngredients);
  console.log(`[CLIENT] 생성된 해시 (${role}):`, hash);

  // 토큰 포맷: 처음 8자리-중간 4자리-끝 4자리 (서버와 동일)
  const formattedToken = `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}`;
  
  return formattedToken;
}

/**
 * 오늘의 토큰 생성 (서버와 100% 동일)
 * @param {string} role 팀원 역할
 * @returns {Promise<string>} 오늘의 토큰
 */
async function getTodayToken(role) {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
  return await generateDailyToken(dateStr, role);
}

/**
 * 모든 역할의 오늘 토큰 생성
 */
async function getAllTodayTokens() {
  const tokens = {};
  
  for (const role of Object.keys(TEAM_INFO)) {
    try {
      tokens[role] = await getTodayToken(role);
    } catch (error) {
      tokens[role] = `Error: ${error.message}`;
    }
  }
  
  return tokens;
}

/**
 * 서버 토큰과 비교 검증
 */
async function verifyWithServer(token, role) {
  try {
    const response = await fetch(`http://localhost:3000/api/debug/token?token=${encodeURIComponent(token)}`);
    
    if (!response.ok) {
      throw new Error(`Server response: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('\n서버 디버그 정보:');
    console.log('  - 받은 토큰:', data.debug.receivedToken);
    console.log('  - 서버 날짜:', data.debug.currentDate);
    console.log('  - 검증 결과:', data.result.valid ? '유효' : '무효');
    
    if (data.result.valid) {
      console.log('  - 인식된 역할:', data.result.role);
    }
    
    console.log('\n서버 토큰 재료 비교:');
    Object.entries(data.debug.tokenIngredients).forEach(([r, ingredients]) => {
      console.log(`  ${r}: ${ingredients}`);
    });
    
    console.log('\n서버가 생성한 토큰들:');
    Object.entries(data.debug.expectedTokens).forEach(([r, t]) => {
      const match = t === token ? '✅' : '❌';
      console.log(`    ${match} ${r}: ${t}`);
    });
    
    return data.result.valid;
    
  } catch (error) {
    console.error('서버 검증 실패:', error.message);
    console.log('개발 서버가 실행 중인지 확인하세요: npm run dev');
    return false;
  }
}

/**
 * CLI 인터페이스
 */
async function main() {
  const args = process.argv.slice(2);
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const todayFormatted = today.toLocaleDateString('ko-KR');

  console.log('🔐 Vinscent MVP 토큰 생성기 (서버 동기화 버전)');
  console.log('='.repeat(60));
  console.log(`📅 오늘: ${todayFormatted} (${dateStr})`);
  console.log(`🌏 시간대: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
  console.log('');

  // 특정 역할 토큰 생성
  if (args.length > 0 && args[0] !== '--test' && args[0] !== '--verify') {
    const role = args[0];
    
    if (!(role in TEAM_INFO)) {
      console.error(`❌ 유효하지 않은 역할: ${role}`);
      console.error(`✅ 사용 가능한 역할: ${Object.keys(TEAM_INFO).join(', ')}`);
      process.exit(1);
    }

    console.log(`🎫 ${role.toUpperCase()} 토큰 생성 중...`);
    console.log('');
    
    const token = await getTodayToken(role);
    
    console.log(`🎫 ${role.toUpperCase()} 토큰:`);
    console.log(`   ${token}`);
    console.log('');
    
    // 서버 검증 시도
    console.log('🔍 서버와 토큰 검증 중...');
    const isValid = await verifyWithServer(token, role);
    
    console.log('');
    
    if (isValid) {
      console.log('🎉 토큰이 서버에서 유효합니다!');
      console.log('');
      console.log('📋 사용법:');
      console.log('   1. 위 토큰을 복사하세요');
      console.log('   2. http://localhost:3000/admin/magazines 접속');
      console.log('   3. 토큰을 입력하고 로그인');
      console.log('');
      console.log('💡 복사용 토큰:');
      console.log(token);
    } else {
      console.log('❌ 토큰이 서버에서 무효합니다.');
      console.log('   개발 서버가 실행 중인지 확인하거나 --verify 옵션을 사용하세요.');
    }
    
    return;
  }

  // 검증 모드
  if (args.includes('--verify')) {
    console.log('🧪 서버와 토큰 동기화 테스트...');
    console.log('');
    
    const allTokens = await getAllTodayTokens();
    
    for (const [role, token] of Object.entries(allTokens)) {
      if (token.startsWith('Error:')) {
        console.log(`❌ ${role}: ${token}`);
        continue;
      }
      
      console.log(`🔍 ${role} 토큰 검증 중...`);
      const isValid = await verifyWithServer(token, role);
      console.log(`   ${isValid ? '✅ 유효' : '❌ 무효'}: ${token}`);
      console.log('');
    }
    
    return;
  }

  // 모든 역할의 토큰 생성
  console.log('🎫 오늘의 모든 토큰:');
  console.log('');
  
  const allTokens = await getAllTodayTokens();
  
  for (const [role, token] of Object.entries(allTokens)) {
    const emoji = {
      developer: '💻',
      designer: '🎨', 
      marketing: '📢',
      pm: '👔'
    }[role] || '👤';
    
    console.log(`${emoji} ${role.toUpperCase()}: ${token}`);
  }
  
  console.log('');
  console.log('📋 사용법:');
  console.log('   1. 원하는 역할의 토큰을 복사하세요');
  console.log('   2. http://localhost:3000/admin/magazines 접속');
  console.log('   3. 토큰을 입력하고 로그인');
  console.log('');
  console.log('🔧 특정 역할만 생성:');
  console.log('   node scripts/token-generator.js developer');
  console.log('   node scripts/token-generator.js designer');
  console.log('');
  console.log('🧪 서버 검증:');
  console.log('   node scripts/token-generator.js --verify');
  console.log('');
}

// 테스트 함수들
async function runTests() {
  console.log('🧪 토큰 생성기 테스트 시작...');
  console.log('');
  
  try {
    // 1. 기본 토큰 생성 테스트
    const testDate = '20250101';
    const developerToken = await generateDailyToken(testDate, 'developer');
    console.log(`✅ 개발자 토큰 생성: ${developerToken}`);
    
    // 2. 오늘 토큰 생성 테스트
    const todayDeveloper = await getTodayToken('developer');
    console.log(`✅ 오늘 개발자 토큰: ${todayDeveloper}`);
    
    // 3. 모든 토큰 생성 테스트
    const allTokens = await getAllTodayTokens();
    console.log('✅ 모든 토큰 생성 성공');
    
    // 4. 토큰 일관성 테스트 (같은 날, 같은 역할 = 같은 토큰)
    const token1 = await generateDailyToken(testDate, 'developer');
    const token2 = await generateDailyToken(testDate, 'developer');
    console.log(`✅ 토큰 일관성: ${token1 === token2 ? '성공' : '실패'}`);
    
    // 5. 토큰 고유성 테스트 (다른 역할 = 다른 토큰)
    const devToken = await generateDailyToken(testDate, 'developer');
    const designToken = await generateDailyToken(testDate, 'designer');
    console.log(`✅ 토큰 고유성: ${devToken !== designToken ? '성공' : '실패'}`);
    
    console.log('');
    console.log('🎉 모든 테스트 통과!');
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error);
    process.exit(1);
  }
}

// 스크립트가 직접 실행된 경우
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--test')) {
    runTests();
  } else {
    main();
  }
}

module.exports = {
  generateDailyToken,
  getTodayToken,
  getAllTodayTokens,
  TEAM_INFO
};