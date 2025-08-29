import asyncpg
from app.common.settings import settings
from app.common.logger import auth_logger

async def get_database_connection():
    """데이터베이스 연결 풀 생성"""
    try:
        connection = await asyncpg.connect(settings.DATABASE_URL)
        auth_logger.info("Database connection established")
        return connection
    except Exception as e:
        auth_logger.error(f"Database connection failed: {str(e)}")
        raise e

async def close_database_connection(connection):
    """데이터베이스 연결 종료"""
    try:
        await connection.close()
        auth_logger.info("Database connection closed")
    except Exception as e:
        auth_logger.error(f"Database connection close failed: {str(e)}")

async def create_tables():
    """필요한 테이블들을 생성합니다 (테이블이 없을 때만)"""
    connection = None
    try:
        connection = await get_database_connection()
        
        # companies 테이블 생성
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
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # users 테이블 생성
        await connection.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                full_name VARCHAR(100) NOT NULL,
                company_id VARCHAR(100) NOT NULL,
                role VARCHAR(20) DEFAULT '승인 전',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE CASCADE
            )
        """)
        
        auth_logger.info("Database tables created successfully")
    except Exception as e:
        auth_logger.error(f"Table creation failed: {str(e)}")
        # 테이블 생성 실패해도 서비스는 계속 실행
        auth_logger.warning("Service will continue without table creation")
    finally:
        await close_database_connection(connection)
