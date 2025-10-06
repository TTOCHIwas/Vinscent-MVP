/**
 * 🧪 활동 로그 테스트 데이터 삽입 스크립트
 * @description 수동으로 테스트 활동 로그를 추가하여 시스템 작동 확인
 */

const { db } = require('../src/lib/db/index.js');

async function insertTestActivityLogs() {
  try {
    console.log('🧪 테스트 활동 로그 삽입 중...');
    
    const testLogs = [
      {
        action: 'create',
        tableName: 'magazines',
        recordId: 48,
        adminName: 'developer_admin',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 Test Browser',
        changes: JSON.stringify({
          title: '테스트 매거진 #48',
          status: 'draft',
          category: 'official'
        }),
        timestamp: new Date(Date.now() - 3600000) // 1시간 전
      },
      {
        action: 'update',
        tableName: 'magazines', 
        recordId: 48,
        adminName: 'developer_admin',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 Test Browser',
        changes: JSON.stringify({
          title: '테스트 매거진 #48 수정됨',
          status: 'published',
          category: 'official'
        }),
        timestamp: new Date(Date.now() - 1800000) // 30분 전
      },
      {
        action: 'create',
        tableName: 'magazines',
        recordId: 49,
        adminName: 'pm_admin', 
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 Test Browser',
        changes: JSON.stringify({
          title: '테스트 매거진 #49',
          status: 'published',
          category: 'unofficial'
        }),
        timestamp: new Date(Date.now() - 900000) // 15분 전
      },
      {
        action: 'update',
        tableName: 'magazines',
        recordId: 48,
        adminName: 'developer_admin',
        ipAddress: '127.0.0.1', 
        userAgent: 'Mozilla/5.0 Test Browser',
        changes: JSON.stringify({
          title: '테스트 매거진 #48 재수정',
          status: 'published',
          category: 'official'
        }),
        timestamp: new Date(Date.now() - 300000) // 5분 전
      }
    ];

    // 직접 SQL로 삽입 (Drizzle ORM 문법 복잡성 회피)
    for (const log of testLogs) {
      await db.execute(`
        INSERT INTO admin_activity_logs 
        (action, table_name, record_id, admin_name, ip_address, user_agent, changes, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        log.action,
        log.tableName, 
        log.recordId,
        log.adminName,
        log.ipAddress,
        log.userAgent,
        log.changes,
        log.timestamp
      ]);
    }

    console.log('✅ 테스트 활동 로그 삽입 완료!');
    console.log(`📊 삽입된 로그: ${testLogs.length}개`);
    console.log('');
    console.log('🎯 이제 어드민 대시보드에서 확인하세요:');
    console.log('   http://localhost:3000/admin/dashboard');
    console.log('   http://localhost:3000/admin/logs'); 
    
  } catch (error) {
    console.error('❌ 테스트 로그 삽입 실패:', error);
  } finally {
    process.exit(0);
  }
}

insertTestActivityLogs();
