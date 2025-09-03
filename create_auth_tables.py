#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Auth 서비스용 DB 테이블 생성 스크립트

이 스크립트는 Auth 서비스에서 필요한 테이블들을 생성합니다:
- companies: 회사/기업 정보
- users: 사용자 정보
"""

import asyncio
import asyncpg
import os
import logging
from typing import Optional

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)-8s | %(name)s:%(funcName)s:%(lineno)d - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

def get_database_url() -> Optional[str]:
    """데이터베이스 URL 가져오기"""
    return os.getenv("DATABASE_URL")

async def create_auth_tables():
    """Auth 서비스용 테이블 생성"""
    connection = None
    try:
        database_url = get_database_url()
        if not database_url:
            logger.error("DATABASE_URL 환경변수가 설정되지 않았습니다.")
            return False
        
        logger.info("데이터베이스 연결 중...")
        connection = await asyncpg.connect(database_url)
        logger.info("✅ 데이터베이스 연결 성공")
        
        # ============================================================================
        # 🏢 companies 테이블 생성
        # ============================================================================
        logger.info("🏢 companies 테이블 생성 중...")
        await connection.execute("""
            CREATE TABLE IF NOT EXISTS companies (
                id SERIAL PRIMARY KEY,
                company_id VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                installation VARCHAR(255) NOT NULL,
                installation_en VARCHAR(255),
                economic_activity VARCHAR(255),
                economic_activity_en VARCHAR(255),
                representative VARCHAR(100),
                representative_en VARCHAR(100),
                email VARCHAR(255),
                telephone VARCHAR(50),
                street VARCHAR(255),
                street_en VARCHAR(255),
                number VARCHAR(50),
                number_en VARCHAR(50),
                postcode VARCHAR(20),
                city VARCHAR(100),
                city_en VARCHAR(100),
                country VARCHAR(100),
                country_en VARCHAR(100),
                unlocode VARCHAR(10),
                source_latitude DECIMAL(10, 8),
                source_longitude DECIMAL(11, 8),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # companies 테이블 인덱스 생성
        await connection.execute("""
            CREATE INDEX IF NOT EXISTS idx_companies_company_id ON companies(company_id);
        """)
        
        await connection.execute("""
            CREATE INDEX IF NOT EXISTS idx_companies_email ON companies(email);
        """)
        
        logger.info("✅ companies 테이블 생성 완료")
        
        # ============================================================================
        # 👥 users 테이블 생성
        # ============================================================================
        logger.info("👥 users 테이블 생성 중...")
        await connection.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                full_name VARCHAR(100) NOT NULL,
                company_id VARCHAR(100) NOT NULL,
                role VARCHAR(20) DEFAULT '승인 전',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE CASCADE
            )
        """)
        
        # users 테이블 인덱스 생성
        await connection.execute("""
            CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
        """)
        
        await connection.execute("""
            CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
        """)
        
        await connection.execute("""
            CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
        """)
        
        logger.info("✅ users 테이블 생성 완료")
        
        # ============================================================================
        # 🔄 업데이트 트리거 생성
        # ============================================================================
        logger.info("🔄 업데이트 트리거 생성 중...")
        
        # companies 테이블 업데이트 트리거
        await connection.execute("""
            CREATE OR REPLACE FUNCTION update_companies_updated_at()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql';
        """)
        
        await connection.execute("""
            DROP TRIGGER IF EXISTS trigger_update_companies_updated_at ON companies;
            CREATE TRIGGER trigger_update_companies_updated_at
                BEFORE UPDATE ON companies
                FOR EACH ROW
                EXECUTE FUNCTION update_companies_updated_at();
        """)
        
        # users 테이블 업데이트 트리거
        await connection.execute("""
            CREATE OR REPLACE FUNCTION update_users_updated_at()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql';
        """)
        
        await connection.execute("""
            DROP TRIGGER IF EXISTS trigger_update_users_updated_at ON users;
            CREATE TRIGGER trigger_update_users_updated_at
                BEFORE UPDATE ON users
                FOR EACH ROW
                EXECUTE FUNCTION update_users_updated_at();
        """)
        
        logger.info("✅ 업데이트 트리거 생성 완료")
        
        # ============================================================================
        # 📊 테이블 정보 확인
        # ============================================================================
        logger.info("📊 생성된 테이블 정보 확인 중...")
        
        # companies 테이블 정보
        companies_info = await connection.fetch("""
            SELECT 
                column_name, 
                data_type, 
                is_nullable, 
                column_default
            FROM information_schema.columns 
            WHERE table_name = 'companies' 
            ORDER BY ordinal_position;
        """)
        
        logger.info("🏢 companies 테이블 구조:")
        for row in companies_info:
            logger.info(f"  - {row['column_name']}: {row['data_type']} {'NULL' if row['is_nullable'] == 'YES' else 'NOT NULL'}")
        
        # users 테이블 정보
        users_info = await connection.fetch("""
            SELECT 
                column_name, 
                data_type, 
                is_nullable, 
                column_default
            FROM information_schema.columns 
            WHERE table_name = 'users' 
            ORDER BY ordinal_position;
        """)
        
        logger.info("👥 users 테이블 구조:")
        for row in users_info:
            logger.info(f"  - {row['column_name']}: {row['data_type']} {'NULL' if row['is_nullable'] == 'YES' else 'NOT NULL'}")
        
        # 외래키 제약조건 확인
        fk_info = await connection.fetch("""
            SELECT 
                tc.table_name, 
                kcu.column_name, 
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name 
            FROM 
                information_schema.table_constraints AS tc 
                JOIN information_schema.key_column_usage AS kcu
                  ON tc.constraint_name = kcu.constraint_name
                  AND tc.table_schema = kcu.table_schema
                JOIN information_schema.constraint_column_usage AS ccu
                  ON ccu.constraint_name = tc.constraint_name
                  AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY' 
            AND tc.table_name IN ('companies', 'users');
        """)
        
        logger.info("🔗 외래키 제약조건:")
        for row in fk_info:
            logger.info(f"  - {row['table_name']}.{row['column_name']} → {row['foreign_table_name']}.{row['foreign_column_name']}")
        
        logger.info("🎉 Auth 서비스용 DB 테이블 생성이 완료되었습니다!")
        return True
        
    except Exception as e:
        logger.error(f"❌ 테이블 생성 실패: {str(e)}")
        return False
    finally:
        if connection:
            await connection.close()
            logger.info("데이터베이스 연결 종료")

async def verify_tables():
    """생성된 테이블 검증"""
    connection = None
    try:
        database_url = get_database_url()
        if not database_url:
            logger.error("DATABASE_URL 환경변수가 설정되지 않았습니다.")
            return False
        
        connection = await asyncpg.connect(database_url)
        
        # 테이블 존재 확인
        tables = await connection.fetch("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('companies', 'users')
            ORDER BY table_name;
        """)
        
        logger.info("📋 생성된 테이블 목록:")
        for table in tables:
            logger.info(f"  ✅ {table['table_name']}")
        
        # 테이블별 레코드 수 확인
        companies_count = await connection.fetchval("SELECT COUNT(*) FROM companies")
        users_count = await connection.fetchval("SELECT COUNT(*) FROM users")
        
        logger.info(f"📊 테이블 레코드 수:")
        logger.info(f"  - companies: {companies_count}개")
        logger.info(f"  - users: {users_count}개")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ 테이블 검증 실패: {str(e)}")
        return False
    finally:
        if connection:
            await connection.close()

async def main():
    """메인 함수"""
    logger.info("🚀 Auth 서비스용 DB 테이블 생성 시작")
    
    # 테이블 생성
    success = await create_auth_tables()
    if not success:
        logger.error("테이블 생성에 실패했습니다.")
        return
    
    # 테이블 검증
    logger.info("\n🔍 생성된 테이블 검증 중...")
    verify_success = await verify_tables()
    if not verify_success:
        logger.error("테이블 검증에 실패했습니다.")
        return
    
    logger.info("\n🎉 모든 작업이 완료되었습니다!")
    logger.info("이제 Auth 서비스가 정상적으로 작동할 수 있습니다.")

if __name__ == "__main__":
    asyncio.run(main())
