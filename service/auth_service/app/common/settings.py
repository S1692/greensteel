import os
import secrets
from typing import List
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

class Settings(BaseSettings):
    """Auth 서비스 설정"""
    
    # 서비스 기본 정보
    SERVICE_NAME: str = "auth-service"
    
    # 데이터베이스 설정
    DATABASE_URL: str = ""
    DB_ECHO: bool = False
    
    # JWT 설정
    JWT_SECRET: str = ""
    JWT_ALG: str = "HS256"
    ACCESS_EXPIRES_MIN: int = 30
    
    # CORS 설정
    ALLOWED_ORIGINS: str = "https://greensteel.site,https://www.greensteel.site"
    ALLOWED_ORIGIN_REGEX: str = "^https://.*\\.vercel\\.app$|^https://.*\\.up\\.railway\\.app$"
    
    # 로깅 설정
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = True
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        
        # JWT_SECRET이 없으면 임시 랜덤 생성
        if not self.JWT_SECRET:
            self.JWT_SECRET = secrets.token_urlsafe(32)
        
        # DATABASE_URL이 비어있으면 SQLite 폴백
        if not self.DATABASE_URL:
            self.DATABASE_URL = "sqlite:///./auth.db"
    
    @property
    def origins_list(self) -> List[str]:
        """ALLOWED_ORIGINS를 콤마로 분리하여 리스트 반환"""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]
    
    @property
    def database_url(self) -> str:
        """데이터베이스 URL 반환 (PostgreSQL 우선, SQLite 폴백)"""
        return self.DATABASE_URL
    
    @property
    def jwt_secret(self) -> str:
        """JWT 시크릿 키 반환"""
        return self.JWT_SECRET
    
    @property
    def jwt_algorithm(self) -> str:
        """JWT 알고리즘 반환"""
        return self.JWT_ALG
    
    @property
    def access_expires_minutes(self) -> int:
        """액세스 토큰 만료 시간(분) 반환"""
        return self.ACCESS_EXPIRES_MIN

# 전역 설정 인스턴스
settings = Settings()
