#!/usr/bin/env python3
"""
GreenSteel 프로젝트 테이블 정리 스크립트
이미지에 있는 테이블들만 삭제하고 product 테이블만 재생성합니다.
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

def drop_table(conn, table_name):
    """테이블을 삭제합니다."""
    try:
        with conn.cursor() as cursor:
            cursor.execute(f"DROP TABLE IF EXISTS {table_name} CASCADE;")
            logger.info(f"🗑️ 테이블 {table_name} 삭제 완료")
    except Exception as e:
        logger.error(f"❌ 테이블 {table_name} 삭제 실패: {e}")

def drop_image_tables(conn):
    """이미지에 있는 테이블들만 삭제합니다."""
    # 이미지에 있는 테이블들 (삭제 대상)
    image_tables = [
        "cbam_calculations",
        "cbam_fuels", 
        "cbam_materials",
        "cbam_products",
        "input_data",
        "lca_impact_categories",
        "lca_products",
        "lca_results",
        "output_data",
        "upload_history",
        "product"
    ]
    
    logger.info("🗑️ 이미지에 있는 테이블들 삭제 시작...")
    
    for table_name in image_tables:
        if check_table_exists(conn, table_name):
            drop_table(conn, table_name)
        else:
            logger.info(f"ℹ️ 테이블 {table_name}은 이미 존재하지 않음")
    
    logger.info("✅ 이미지 테이블들 삭제 완료")

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
    logger.info("🚀 GreenSteel 프로젝트 테이블 정리 시작...")
    
    conn = get_connection()
    if not conn:
        logger.error("데이터베이스 연결 실패")
        sys.exit(1)
    
    try:
        # 1단계: 이미지에 있는 테이블들만 삭제
        drop_image_tables(conn)
        
        # 2단계: product 테이블만 생성
        create_product_table(conn)
        
        logger.info("🎉 테이블 정리 완료!")
        logger.info("ℹ️ 이미지에 없는 테이블들(users 등)은 그대로 유지됨")
        
    except Exception as e:
        logger.error(f"테이블 정리 실패: {e}")
    finally:
        conn.close()
        logger.info("🔌 데이터베이스 연결 종료")

if __name__ == "__main__":
    main()
