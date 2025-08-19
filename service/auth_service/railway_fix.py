#!/usr/bin/env python3
"""
Railway PostgreSQL 연결 문제 해결 스크립트
이 스크립트는 Railway에서 발생하는 'db_type' 파라미터 오류를 해결합니다.
"""

import os
import re
import logging
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def fix_railway_database_url(database_url: str) -> str:
    """
    Railway PostgreSQL URL에서 잘못된 파라미터를 제거하고 정리합니다.
    
    Args:
        database_url (str): 원본 데이터베이스 URL
        
    Returns:
        str: 정리된 데이터베이스 URL
    """
    if not database_url:
        return database_url
    
    logger.info(f"원본 DATABASE_URL: {database_url}")
    
    try:
        # URL 파싱
        parsed = urlparse(database_url)
        
        # 쿼리 파라미터 파싱
        query_params = parse_qs(parsed.query)
        
        # 문제가 되는 파라미터들 제거
        problematic_params = [
            'db_type', 'db_type=postgresql', 'db_type=postgres',
            'db_type=mysql', 'db_type=sqlite', 'db_type=mongodb'
        ]
        
        # 쿼리 파라미터에서 문제 파라미터 제거
        cleaned_params = {}
        for key, values in query_params.items():
            if key not in problematic_params:
                cleaned_params[key] = values
        
        # 새로운 쿼리 문자열 생성
        new_query = urlencode(cleaned_params, doseq=True)
        
        # URL 재구성
        fixed_url = urlunparse((
            parsed.scheme,
            parsed.netloc,
            parsed.path,
            parsed.params,
            new_query,
            parsed.fragment
        ))
        
        # 추가 정리 작업
        # 연속된 & 제거
        fixed_url = re.sub(r'&&+', '&', fixed_url)
        fixed_url = re.sub(r'&+$', '', fixed_url)
        
        # URL 시작이 ?로 시작하면 &로 변경
        if '?' in fixed_url and fixed_url.split('?')[1].startswith('&'):
            fixed_url = fixed_url.replace('?&', '?')
        
        # 끝에 &가 있으면 제거
        if fixed_url.endswith('&'):
            fixed_url = fixed_url[:-1]
        
        logger.info(f"정리된 DATABASE_URL: {fixed_url}")
        
        return fixed_url
        
    except Exception as e:
        logger.error(f"URL 정리 중 오류 발생: {str(e)}")
        return database_url

def create_railway_env_file():
    """
    Railway 환경 변수 파일을 생성합니다.
    """
    env_content = """# Railway PostgreSQL 연결 설정 (자동 생성)
# 이 파일은 Railway PostgreSQL 연결 문제를 해결하기 위해 생성되었습니다.

# 기본 데이터베이스 설정
DATABASE_URL=${DATABASE_URL}
DATABASE_SSL_MODE=require

# Railway PostgreSQL 최적화 설정
DB_ECHO=false
DB_POOL_SIZE=10
DB_MAX_OVERFLOW=20
DB_POOL_RECYCLE=300

# 연결 타임아웃 설정
DB_CONNECT_TIMEOUT=10
DB_POOL_TIMEOUT=30

# 애플리케이션 설정
SERVICE_NAME=greensteel-auth-service
SERVICE_VERSION=3.0.0
LOG_LEVEL=INFO
PORT=8081
HOST=0.0.0.0

# JWT 설정
JWT_SECRET=${JWT_SECRET:-your_jwt_secret_key_here}
JWT_ALGORITHM=HS256
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# CORS 설정
ALLOWED_ORIGINS=https://greensteel.site,https://www.greensteel.site
ALLOWED_ORIGIN_REGEX=^https://.*\\.vercel\\.app$|^https://.*\\.up\\.railway\\.app$

# 보안 설정
SECRET_KEY=${SECRET_KEY:-your_secret_key_here}
PASSWORD_SALT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
LOGIN_LOCKOUT_DURATION=300

# 환경 설정
ENVIRONMENT=production
DEBUG=false
RELOAD=false
"""
    
    with open('.env.railway', 'w', encoding='utf-8') as f:
        f.write(env_content)
    
    logger.info("Railway 환경 변수 파일 생성 완료: .env.railway")

def main():
    """
    메인 함수
    """
    logger.info("Railway PostgreSQL 연결 문제 해결 스크립트 시작")
    
    # 현재 DATABASE_URL 확인
    database_url = os.getenv('DATABASE_URL')
    
    if database_url:
        logger.info("DATABASE_URL 환경 변수 발견")
        
        # URL 정리
        fixed_url = fix_railway_database_url(database_url)
        
        if fixed_url != database_url:
            logger.info("DATABASE_URL이 수정되었습니다.")
            logger.info(f"수정 전: {database_url}")
            logger.info(f"수정 후: {fixed_url}")
            
            # 환경 변수 파일 생성
            create_railway_env_file()
            
            # 수정된 URL을 환경 변수로 설정
            os.environ['DATABASE_URL'] = fixed_url
            logger.info("수정된 DATABASE_URL이 환경 변수에 설정되었습니다.")
        else:
            logger.info("DATABASE_URL에 문제가 없습니다.")
    else:
        logger.warning("DATABASE_URL 환경 변수가 설정되지 않았습니다.")
    
    logger.info("스크립트 실행 완료")

if __name__ == "__main__":
    main()
