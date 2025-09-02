# ============================================================================
# ⚙️ Settings - 애플리케이션 설정 관리
# ============================================================================

from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    """애플리케이션 설정"""
    
    # 애플리케이션 기본 설정
    app_name: str = "DataGather Service"
    app_version: str = "1.0.0"
    debug: bool = False
    
    # 서버 설정
    host: str = "0.0.0.0"
    port: int = 8083
    
    # 데이터베이스 설정
    database_url: str = "postgresql+asyncpg://postgres:password@localhost:5432/datagather"
    db_echo: bool = False
    db_pool_size: int = 10
    db_max_overflow: int = 20
    
    # 로깅 설정
    log_level: str = "INFO"
    log_format: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    # 보안 설정
    secret_key: str = "your-secret-key-here-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # 파일 업로드 설정
    max_file_size: int = 100 * 1024 * 1024  # 100MB
    allowed_file_types: list = ["xlsx", "xls", "csv", "json", "txt"]
    upload_dir: str = "./uploads"
    
    # API 설정
    api_prefix: str = "/api/v1"
    cors_origins: list = ["*"]
    rate_limit_requests: int = 100
    rate_limit_window: int = 3600  # 1시간
    
    # 데이터 처리 설정
    max_batch_size: int = 1000
    processing_timeout: int = 300  # 5분
    retry_attempts: int = 3
    retry_delay: int = 5  # 5초
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        
        # 환경 변수에서 설정값 로드
        self.database_url = os.getenv("DATABASE_URL", self.database_url)
        self.debug = os.getenv("DEBUG", str(self.debug)).lower() == "true"
        self.secret_key = os.getenv("SECRET_KEY", self.secret_key)
        self.host = os.getenv("HOST", self.host)
        self.port = int(os.getenv("PORT", self.port))
        
        # 데이터베이스 URL을 비동기용으로 변환
        if self.database_url.startswith("postgresql://"):
            self.database_url = self.database_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    
    def get_database_config(self) -> dict:
        """데이터베이스 설정 반환"""
        return {
            "url": self.database_url,
            "echo": self.db_echo,
            "pool_size": self.db_pool_size,
            "max_overflow": self.db_max_overflow
        }
    
    def get_server_config(self) -> dict:
        """서버 설정 반환"""
        return {
            "host": self.host,
            "port": self.port,
            "debug": self.debug
        }
    
    def get_security_config(self) -> dict:
        """보안 설정 반환"""
        return {
            "secret_key": self.secret_key,
            "algorithm": self.algorithm,
            "access_token_expire_minutes": self.access_token_expire_minutes
        }
    
    def get_file_upload_config(self) -> dict:
        """파일 업로드 설정 반환"""
        return {
            "max_file_size": self.max_file_size,
            "allowed_file_types": self.allowed_file_types,
            "upload_dir": self.upload_dir
        }
    
    def get_api_config(self) -> dict:
        """API 설정 반환"""
        return {
            "prefix": self.api_prefix,
            "cors_origins": self.cors_origins,
            "rate_limit_requests": self.rate_limit_requests,
            "rate_limit_window": self.rate_limit_window
        }
    
    def get_processing_config(self) -> dict:
        """데이터 처리 설정 반환"""
        return {
            "max_batch_size": self.max_batch_size,
            "processing_timeout": self.processing_timeout,
            "retry_attempts": self.retry_attempts,
            "retry_delay": self.retry_delay
        }
    
    def validate(self) -> bool:
        """설정 유효성 검증"""
        try:
            # 필수 설정값 검증
            if not self.database_url:
                raise ValueError("DATABASE_URL이 설정되지 않았습니다.")
            
            # SECRET_KEY 검증 완화 (개발/테스트 환경에서는 기본값 허용)
            if not self.secret_key:
                print("⚠️ SECRET_KEY가 설정되지 않았습니다. 기본값을 사용합니다.")
                self.secret_key = "default-secret-key-for-development"
            
            # 포트 번호 검증
            if not (1 <= self.port <= 65535):
                raise ValueError("포트 번호가 유효하지 않습니다.")
            
            # 파일 업로드 디렉토리 생성
            os.makedirs(self.upload_dir, exist_ok=True)
            
            return True
            
        except Exception as e:
            print(f"❌ 설정 유효성 검증 실패: {e}")
            return False

# 전역 설정 인스턴스
settings = Settings()
