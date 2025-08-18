import os
from typing import List
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

class Settings(BaseSettings):
    """DataGather 서비스 설정"""
    
    # 서비스 기본 정보
    SERVICE_NAME: str = "datagather-service"
    
    # 데이터베이스 설정
    DATABASE_URL: str = ""
    DB_ECHO: bool = False
    
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
        
        # DATABASE_URL이 비어있으면 SQLite 폴백
        if not self.DATABASE_URL:
            self.DATABASE_URL = "sqlite:///./datagather.db"
    
    @property
    def origins_list(self) -> List[str]:
        """ALLOWED_ORIGINS를 콤마로 분리하여 리스트 반환"""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

# 전역 설정 인스턴스
settings = Settings()
