"""
CBAM 서비스 데이터베이스 초기화 스크립트
PostgreSQL 데이터베이스에 필요한 테이블을 생성합니다.
"""

import os
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import logging

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 데이터베이스 연결 정보
DATABASE_URL = "postgresql://postgres:password@postgres-production-8f21.up.railway.app:5432/railway"

def get_connection():
    """데이터베이스 연결을 가져옵니다."""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        return conn
    except Exception as e:
        logger.error(f"데이터베이스 연결 실패: {e}")
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

def get_table_schema(conn, table_name):
    """테이블의 현재 스키마를 가져옵니다."""
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = %s
                ORDER BY ordinal_position;
            """, (table_name,))
            return cursor.fetchall()
    except Exception as e:
        logger.error(f"테이블 스키마 조회 실패: {e}")
        return []

def drop_table(conn, table_name):
    """테이블을 삭제합니다."""
    try:
        with conn.cursor() as cursor:
            cursor.execute(f"DROP TABLE IF EXISTS {table_name} CASCADE;")
            logger.info(f"테이블 {table_name} 삭제 완료")
    except Exception as e:
        logger.error(f"테이블 {table_name} 삭제 실패: {e}")

def create_cbam_tables(conn):
    """CBAM 서비스에 필요한 테이블들을 생성합니다."""
    
    # 1. 제품 테이블
    product_table_sql = """
    CREATE TABLE IF NOT EXISTS cbam_products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        cn_code VARCHAR(50),
        description TEXT,
        category VARCHAR(100),
        unit VARCHAR(50),
        carbon_intensity DECIMAL(10,6),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """
    
    # 2. CBAM 계산 테이블
    calculation_table_sql = """
    CREATE TABLE IF NOT EXISTS cbam_calculations (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES cbam_products(id),
        calculation_date DATE NOT NULL,
        production_quantity DECIMAL(15,2),
        export_quantity DECIMAL(15,2),
        carbon_emission DECIMAL(15,6),
        cbam_charge DECIMAL(15,2),
        currency VARCHAR(10) DEFAULT 'EUR',
        status VARCHAR(50) DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """
    
    # 3. 사용자 테이블
    users_table_sql = """
    CREATE TABLE IF NOT EXISTS cbam_users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        full_name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'user',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """
    
    # 4. 계산 이력 테이블
    history_table_sql = """
    CREATE TABLE IF NOT EXISTS cbam_calculation_history (
        id SERIAL PRIMARY KEY,
        calculation_id INTEGER REFERENCES cbam_calculations(id),
        action VARCHAR(100) NOT NULL,
        old_values JSONB,
        new_values JSONB,
        user_id INTEGER REFERENCES cbam_users(id),
        action_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ip_address INET,
        user_agent TEXT
    );
    """
    
    # 5. 설정 테이블
    settings_table_sql = """
    CREATE TABLE IF NOT EXISTS cbam_settings (
        id SERIAL PRIMARY KEY,
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value TEXT,
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """
    
    tables = [
        ("cbam_products", product_table_sql),
        ("cbam_calculations", calculation_table_sql),
        ("cbam_users", users_table_sql),
        ("cbam_calculation_history", history_table_sql),
        ("cbam_settings", settings_table_sql)
    ]
    
    for table_name, create_sql in tables:
        try:
            if check_table_exists(conn, table_name):
                current_schema = get_table_schema(conn, table_name)
                logger.info(f"테이블 {table_name} 이미 존재함")
                logger.info(f"현재 스키마: {current_schema}")
                
                # 스키마가 다르면 테이블 재생성
                if not is_schema_compatible(table_name, current_schema):
                    logger.info(f"스키마가 다름 - 테이블 {table_name} 재생성")
                    drop_table(conn, table_name)
                    with conn.cursor() as cursor:
                        cursor.execute(create_sql)
                    logger.info(f"테이블 {table_name} 재생성 완료")
                else:
                    logger.info(f"스키마가 동일함 - 테이블 {table_name} 유지")
            else:
                logger.info(f"테이블 {table_name} 생성 중...")
                with conn.cursor() as cursor:
                    cursor.execute(create_sql)
                logger.info(f"테이블 {table_name} 생성 완료")
                
        except Exception as e:
            logger.error(f"테이블 {table_name} 생성/업데이트 실패: {e}")

def is_schema_compatible(table_name, current_schema):
    """현재 스키마가 필요한 스키마와 호환되는지 확인합니다."""
    # 간단한 호환성 검사 (필수 컬럼 존재 여부)
    required_columns = {
        "cbam_products": ["id", "name", "created_at"],
        "cbam_calculations": ["id", "product_id", "calculation_date", "created_at"],
        "cbam_users": ["id", "username", "email", "created_at"],
        "cbam_calculation_history": ["id", "calculation_id", "action", "action_timestamp"],
        "cbam_settings": ["id", "setting_key", "setting_value", "created_at"]
    }
    
    if table_name not in required_columns:
        return True
    
    current_column_names = [col[0] for col in current_schema]
    required_column_names = required_columns[table_name]
    
    for required_col in required_column_names:
        if required_col not in current_column_names:
            return False
    
    return True

def insert_initial_data(conn):
    """초기 데이터를 삽입합니다."""
    try:
        # 기본 설정 데이터
        with conn.cursor() as cursor:
            cursor.execute("""
                INSERT INTO cbam_settings (setting_key, setting_value, description)
                VALUES 
                    ('cbam_rate_2024', '0.00', '2024년 CBAM 세율 (EUR/ton CO2)'),
                    ('cbam_rate_2025', '0.00', '2025년 CBAM 세율 (EUR/ton CO2)'),
                    ('cbam_rate_2026', '0.00', '2026년 CBAM 세율 (EUR/ton CO2)'),
                    ('default_currency', 'EUR', '기본 통화'),
                    ('carbon_intensity_unit', 'tCO2/t', '탄소집약도 단위')
                ON CONFLICT (setting_key) DO NOTHING;
            """)
        
        # 기본 사용자 (관리자)
        with conn.cursor() as cursor:
            cursor.execute("""
                INSERT INTO cbam_users (username, email, full_name, role)
                VALUES ('admin', 'admin@cbam.com', 'CBAM Administrator', 'admin')
                ON CONFLICT (username) DO NOTHING;
            """)
        
        logger.info("초기 데이터 삽입 완료")
        
    except Exception as e:
        logger.error(f"초기 데이터 삽입 실패: {e}")

def main():
    """메인 함수"""
    logger.info("CBAM 서비스 데이터베이스 초기화 시작...")
    
    conn = get_connection()
    if not conn:
        logger.error("데이터베이스 연결 실패")
        return
    
    try:
        # 테이블 생성
        create_cbam_tables(conn)
        
        # 초기 데이터 삽입
        insert_initial_data(conn)
        
        logger.info("데이터베이스 초기화 완료!")
        
    except Exception as e:
        logger.error(f"데이터베이스 초기화 실패: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    main()
