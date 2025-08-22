#!/usr/bin/env python3
"""
GreenSteel 프로젝트 핵심 테이블 생성 스크립트
product 테이블만 생성합니다.
"""

import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import logging
import sys

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# 데이터베이스 연결 정보
DB_HOST = "switchyard.proxy.rlwy.net"
DB_NAME = "railway"
DB_USER = "postgres"
DB_PASSWORD = "lUAkUKpUxubYDvmqzGKxJLKgZCWMjaQy"
DB_PORT = 51947

def get_connection():
    """데이터베이스 연결을 가져옵니다."""
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            port=DB_PORT,
            connect_timeout=30
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        logger.info("✅ 데이터베이스 연결 성공!")
        return conn
    except Exception as e:
        logger.error(f"❌ 데이터베이스 연결 실패: {e}")
        return None

def check_table_exists(conn, table_name):
    """테이블이 존재하는지 확인합니다."""
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = %s
                );
            """, (table_name,))
            return cursor.fetchone()[0]
    except Exception as e:
        logger.error(f"테이블 존재 확인 실패: {e}")
        return False

def create_product_table(conn):
    """product 테이블만 생성합니다."""
    try:
        # product 테이블 생성 (CalculationRepository와 동일한 스키마)
        product_sql = """
        CREATE TABLE IF NOT EXISTS product (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            cn_code VARCHAR(50),
            period_start DATE,
            period_end DATE,
            production_qty DECIMAL(10,2) DEFAULT 0,
            sales_qty DECIMAL(10,2) DEFAULT 0,
            export_qty DECIMAL(10,2) DEFAULT 0,
            inventory_qty DECIMAL(10,2) DEFAULT 0,
            defect_rate DECIMAL(5,4) DEFAULT 0,
            node_id VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        
        with conn.cursor() as cursor:
            cursor.execute(product_sql)
            conn.commit()
            logger.info("✅ product 테이블 생성 완료")
            
    except Exception as e:
        logger.error(f"❌ product 테이블 생성 실패: {e}")
        raise

def main():
    """메인 함수"""
    logger.info("🚀 GreenSteel 프로젝트 product 테이블 생성 시작...")
    
    conn = get_connection()
    if not conn:
        logger.error("데이터베이스 연결 실패")
        sys.exit(1)
    
    try:
        # product 테이블만 생성
        create_product_table(conn)
        
        logger.info("🎉 product 테이블 생성 완료!")
        
    except Exception as e:
        logger.error(f"데이터베이스 초기화 실패: {e}")
    finally:
        conn.close()
        logger.info("🔌 데이터베이스 연결 종료")

if __name__ == "__main__":
    main()
