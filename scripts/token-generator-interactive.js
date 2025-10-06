#!/usr/bin/env node

/**
 * Vinscent MVP 토큰 생성기 - 인터랙티브 버전
 * 
 * 사용자가 생년월일과 전화번호를 입력하면 자동으로 역할을 매칭하고 토큰 생성
 * 서버의 /src/lib/auth/token-generator.ts와 100% 동일한 로직 사용
 */

const crypto = require('crypto');
const readline = require('readline');

// SHA-256 해시 생성 (서버와 동일)
async function createSHA256Hash(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

// 팀원 정보 (하드코딩)
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
 */
async function generateDailyToken(date, role) {
  const member = TEAM_INFO[role];
  if (!member) {
    throw new Error(`Invalid role: ${role}`);
  }

  const tokenIngredients = [
    date,
    member.birthDate,
    member.phoneLastFour,
    member.role,
    PROJECT_SECRET,
  ].join('|');

  const hash = await createSHA256Hash(tokenIngredients);
  const formattedToken = `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}`;
  
  return formattedToken;
}

/**
 * 생년월일과 전화번호로 역할 찾기
 */
function findRoleByCredentials(birthDate, phone) {
  for (const [role, info] of Object.entries(TEAM_INFO)) {
    if (info.birthDate === birthDate && info.phoneLastFour === phone) {
      return role;
    }
  }
  return null;
}

/**
 * 인터랙티브 입력 받기
 */
function question(rl, prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer.trim());
    });
  });
}

/**
 * 종료 전 대기
 */
function waitForExit(rl) {
  return new Promise((resolve) => {
    rl.question('\nEnter 키를 눌러 종료하세요...', () => {
      resolve();
    });
  });
}

/**
 * 메인 인터랙티브 함수
 */
async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.clear();
  console.log('='.repeat(60));
  console.log('        Vinscent MVP 토큰 생성기 (인터랙티브)');
  console.log('='.repeat(60));
  console.log('');
  
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const todayFormatted = today.toLocaleDateString('ko-KR');
  
  console.log(`오늘 날짜: ${todayFormatted} (${dateStr})`);
  console.log('');
  console.log('본인 정보를 입력해주세요:');
  console.log('');

  try {
    // 생년월일 입력
    const birthDate = await question(rl, '생년월일 (YYYYMMDD): ');
    
    // 유효성 검사
    if (!/^\d{8}$/.test(birthDate)) {
      console.log('');
      console.log('오류: 생년월일은 8자리 숫자여야 합니다. (예: 20020317)');
      console.log('');
      await waitForExit(rl);
      rl.close();
      process.exit(1);
    }

    // 전화번호 입력
    const phone = await question(rl, '전화번호: ');
    
    // 유효성 검사
    if (!/^\d{10,11}$/.test(phone)) {
      console.log('');
      console.log('오류: 전화번호는 10-11자리 숫자여야 합니다. (예: 01092034239)');
      console.log('');
      await waitForExit(rl);
      rl.close();
      process.exit(1);
    }

    console.log('');
    console.log('처리 중...');
    console.log('');

    // 역할 찾기
    const role = findRoleByCredentials(birthDate, phone);
    
    if (!role) {
      console.log('등록되지 않은 팀원입니다.');
      console.log('');
      console.log('입력하신 정보:');
      console.log(`  생년월일: ${birthDate}`);
      console.log(`  전화번호: ${phone}`);
      console.log('');
      console.log('관리자에게 문의하세요.');
      console.log('');
      await waitForExit(rl);
      rl.close();
      process.exit(1);
    }

    // 토큰 생성
    const token = await generateDailyToken(dateStr, role);

    // 역할 이모지
    const roleEmoji = {
      developer: '💻',
      designer: '🎨',
      marketing: '📢',
      pm: '👔'
    }[role] || '👤';

    const roleName = {
      developer: '개발자',
      designer: '디자이너',
      marketing: '마케팅',
      pm: 'PM'
    }[role] || role;

    // 결과 출력
    console.log('='.repeat(60));
    console.log('                    토큰 생성 완료!');
    console.log('='.repeat(60));
    console.log('');
    console.log(`${roleEmoji} 역할: ${roleName} (${role})`);
    console.log('');
    console.log('━'.repeat(60));
    console.log(`   ${token}`);
    console.log('━'.repeat(60));
    console.log('');
    console.log('사용 방법:');
    console.log('  1. 위의 토큰을 복사하세요 (마우스로 드래그 후 Ctrl+C)');
    console.log('  2. 어드민 페이지에 접속하세요');
    console.log('  3. 토큰을 입력하고 로그인하세요');
    console.log('');
    console.log('주의사항:');
    console.log('  - 이 토큰은 오늘만 유효합니다');
    console.log('  - 내일은 새로운 토큰이 필요합니다');
    console.log('  - 토큰을 타인과 공유하지 마세요');
    console.log('');

    // 종료 대기
    await waitForExit(rl);

  } catch (error) {
    console.error('오류 발생:', error.message);
    console.log('');
    await waitForExit(rl);
    rl.close();
    process.exit(1);
  }

  rl.close();
}

// 스크립트 실행
if (require.main === module) {
  main().catch((error) => {
    console.error('치명적 오류:', error);
    process.exit(1);
  });
}

module.exports = {
  generateDailyToken,
  findRoleByCredentials,
  TEAM_INFO
};
