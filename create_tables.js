const { Client } = require('pg');

// Railway PostgreSQL 연결 정보
const connectionString = 'postgresql://postgres:lUAkUKpUxubYDvmqzGKxJLKgZCWMjaQy@switchyard.proxy.rlwy.net:51947/railway';

const client = new Client({
  connectionString: connectionString,
});

async function createTables() {
  try {
    await client.connect();
    console.log('데이터베이스에 연결되었습니다.');

    // foutput 테이블 삭제
    await client.query('DROP TABLE IF EXISTS foutput CASCADE;');
    console.log('foutput 테이블이 삭제되었습니다.');

    // output 테이블 생성
    await client.query(`
      CREATE TABLE IF NOT EXISTS output (
        "로트번호" VARCHAR(255),
        "생산품명" VARCHAR(255),
        "생산수량" INTEGER,
        "투입일" TIMESTAMP,
        "종료일" TIMESTAMP,
        "공정" VARCHAR(255),
        "산출물명" VARCHAR(255),
        "수량" INTEGER,
        "단위" VARCHAR(50)
      );
    `);
    console.log('output 테이블이 생성되었습니다.');

    // 테이블 목록 확인
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('\n현재 테이블 목록:');
    result.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });

    console.log('\nfoutput → output 테이블 변경이 완료되었습니다!');

  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    await client.end();
    console.log('데이터베이스 연결이 종료되었습니다.');
  }
}

createTables();
