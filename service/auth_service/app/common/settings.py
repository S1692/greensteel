import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """애플리케이션 설정"""
    SERVICE_NAME: str = "Simple Auth Service"
    SERVICE_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    PORT: int = 8001
    
    # API Keys
    KAKAO_API_KEY: str = os.getenv("KAKAO_API_KEY", "")
    
    # CORS
    CORS_ORIGINS: list = ["*"]
    
    class Config:
        env_file = ".env"

settings = Settings()
