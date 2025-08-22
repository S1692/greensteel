#!/usr/bin/env python3
"""
GreenSteel 프로젝트 프론트엔드 연계 핵심 테이블 생성 스크립트
프론트엔드에서 실제로 사용하는 테이블만 생성합니다.
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

def create_frontend_tables(conn):
    """프론트엔드와 연계되는 핵심 테이블들만 생성합니다."""
    
    # ============================================================================
    # 🏭 CBAM 서비스 - 프론트엔드 연계 테이블
    # ============================================================================
    
    # 1. CBAM 제품 테이블 (프론트엔드 제품 관리)
    cbam_products_sql = """
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
    
    # 2. CBAM 계산 테이블 (프론트엔드 계산 결과)
    cbam_calculations_sql = """
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
    
    # 3. CBAM 연료 테이블 (프론트엔드 연료 선택)
    cbam_fuels_sql = """
    CREATE TABLE IF NOT EXISTS cbam_fuels (
        id SERIAL PRIMARY KEY,
        fuel_name VARCHAR(255) NOT NULL,
        fuel_eng VARCHAR(255),
        fuel_emfactor DECIMAL(10,6) NOT NULL DEFAULT 0,
        net_calory DECIMAL(10,6) NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """
    
    # 4. CBAM 원료 테이블 (프론트엔드 원료 선택)
    cbam_materials_sql = """
    CREATE TABLE IF NOT EXISTS cbam_materials (
        id SERIAL PRIMARY KEY,
        item_name VARCHAR(255) NOT NULL,
        item_eng VARCHAR(255),
        carbon_factor DECIMAL(5,2) DEFAULT 0.0,
        em_factor DECIMAL(10,6) DEFAULT 0.0,
        cn_code VARCHAR(50),
        cn_code1 VARCHAR(50),
        cn_code2 VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """
    
    # ============================================================================
    # 📊 DataGather 서비스 - 프론트엔드 연계 테이블
    # ============================================================================
    
    # 5. Input 데이터 테이블 (프론트엔드 data-upload 페이지)
    input_data_sql = """
    CREATE TABLE IF NOT EXISTS input_data (
        id SERIAL PRIMARY KEY,
        status VARCHAR(50) DEFAULT 'active',
        lot_number VARCHAR(100),
        product_name VARCHAR(255),
        input_date DATE,
        end_date DATE,
        sequence_order INTEGER,
        part_number VARCHAR(100),
        item_name VARCHAR(255),
        quantity DECIMAL(15,2),
        instruction_number VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """
    
    # 6. Output 데이터 테이블 (프론트엔드 data-upload 페이지)
    output_data_sql = """
    CREATE TABLE IF NOT EXISTS output_data (
        id SERIAL PRIMARY KEY,
        status VARCHAR(50) DEFAULT 'active',
        lot_number VARCHAR(100),
        product_name VARCHAR(255),
        input_date DATE,
        end_date DATE,
        sequence_order INTEGER,
        part_number VARCHAR(100),
        item_name VARCHAR(255),
        quantity DECIMAL(15,2),
        instruction_number VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """
    
    # 7. 데이터 업로드 이력 테이블 (프론트엔드 업로드 추적)
    upload_history_sql = """
    CREATE TABLE IF NOT EXISTS upload_history (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        file_type VARCHAR(50) NOT NULL,
        file_size BIGINT,
        upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        processing_status VARCHAR(50) DEFAULT 'pending',
        row_count INTEGER,
        column_count INTEGER,
        user_id VARCHAR(255),
        notes TEXT
    );
    """
    
    # ============================================================================
    # 🔐 Auth 서비스 - 프론트엔드 로그인 연계
    # ============================================================================
    
    # 8. 사용자 테이블 (프론트엔드 로그인/회원가입)
    users_sql = """
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE,
        is_verified BOOLEAN DEFAULT FALSE,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
    );
    """
    
    # ============================================================================
    # 🔄 LCA 서비스 - 프론트엔드 연계 테이블
    # ============================================================================
    
    # 9. LCA 제품 테이블 (프론트엔드 LCA 페이지)
    lca_products_sql = """
    CREATE TABLE IF NOT EXISTS lca_products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        unit VARCHAR(50),
        functional_unit TEXT,
        system_boundary TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """
    
    # 10. LCA 영향 카테고리 테이블 (프론트엔드 LCIA 페이지)
    lca_impact_categories_sql = """
    CREATE TABLE IF NOT EXISTS lca_impact_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        unit VARCHAR(50) NOT NULL,
        category_type VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """
    
    # 11. LCA 계산 결과 테이블 (프론트엔드 LCA 결과)
    lca_results_sql = """
    CREATE TABLE IF NOT EXISTS lca_results (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES lca_products(id),
        impact_category_id INTEGER REFERENCES lca_impact_categories(id),
        impact_value DECIMAL(15,6) NOT NULL,
        calculation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        methodology VARCHAR(100),
        notes TEXT
    );
    """
    
    # 프론트엔드 연계 핵심 테이블 정의
    tables = [
        # CBAM 서비스
        ("cbam_products", cbam_products_sql),
        ("cbam_calculations", cbam_calculations_sql),
        ("cbam_fuels", cbam_fuels_sql),
        ("cbam_materials", cbam_materials_sql),
        
        # DataGather 서비스
        ("input_data", input_data_sql),
        ("output_data", output_data_sql),
        ("upload_history", upload_history_sql),
        
        # Auth 서비스
        ("users", users_sql),
        
        # LCA 서비스
        ("lca_products", lca_products_sql),
        ("lca_impact_categories", lca_impact_categories_sql),
        ("lca_results", lca_results_sql)
    ]
    
    # 테이블 생성
    for table_name, create_sql in tables:
        try:
            if check_table_exists(conn, table_name):
                current_schema = get_table_schema(conn, table_name)
                logger.info(f"테이블 {table_name} 이미 존재함")
                
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
        "cbam_fuels": ["id", "fuel_name", "fuel_emfactor", "created_at"],
        "cbam_materials": ["id", "item_name", "em_factor", "created_at"],
        "input_data": ["id", "item_name", "quantity", "created_at"],
        "output_data": ["id", "item_name", "quantity", "created_at"],
        "upload_history": ["id", "filename", "file_type", "upload_date", "created_at"],
        "users": ["id", "username", "email", "password_hash", "created_at"],
        "lca_products": ["id", "name", "created_at"],
        "lca_impact_categories": ["id", "name", "unit", "created_at"],
        "lca_results": ["id", "product_id", "impact_category_id", "impact_value", "created_at"]
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
        # 기본 사용자 (관리자)
        with conn.cursor() as cursor:
            cursor.execute("""
                INSERT INTO users (username, email, password_hash, full_name, role, is_verified)
                VALUES ('admin', 'admin@greensteel.com', 'admin_hash', 'GreenSteel Administrator', 'admin', TRUE)
                ON CONFLICT (username) DO NOTHING;
            """)
        
        # 기본 LCA 영향 카테고리
        with conn.cursor() as cursor:
            cursor.execute("""
                INSERT INTO lca_impact_categories (name, description, unit, category_type)
                VALUES 
                    ('기후변화', '지구온난화 잠재력', 'kg CO2-eq', '환경'),
                    ('산성화', '산성화 잠재력', 'kg SO2-eq', '환경'),
                    ('부영양화', '부영양화 잠재력', 'kg PO4-eq', '환경')
                ON CONFLICT (name) DO NOTHING;
            """)
        
        logger.info("초기 데이터 삽입 완료")
        
    except Exception as e:
        logger.error(f"초기 데이터 삽입 실패: {e}")

def main():
    """메인 함수"""
    logger.info("🚀 GreenSteel 프로젝트 프론트엔드 연계 핵심 테이블 생성 시작...")
    
    conn = get_connection()
    if not conn:
        logger.error("데이터베이스 연결 실패")
        sys.exit(1)
    
    try:
        # 프론트엔드 연계 테이블 생성
        create_frontend_tables(conn)
        
        # 초기 데이터 삽입
        insert_initial_data(conn)
        
        logger.info("🎉 프론트엔드 연계 핵심 테이블 생성 완료!")
        
    except Exception as e:
        logger.error(f"데이터베이스 초기화 실패: {e}")
    finally:
        conn.close()
        logger.info("🔌 데이터베이스 연결 종료")

if __name__ == "__main__":
    main()
