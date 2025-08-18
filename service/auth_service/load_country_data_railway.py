#!/usr/bin/env python3
"""
국가 코드 데이터 로더 (Railway PostgreSQL)
엑셀 파일에서 국가 데이터를 읽어서 Railway DB에 저장
"""

import pandas as pd
import sys
import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# 프로젝트 루트 경로 추가
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from app.domain.entities.country import Country
from app.common.logger import auth_logger

def load_country_data_railway():
    """엑셀 파일에서 국가 데이터를 읽어서 Railway DB에 저장"""
    
    # 엑셀 파일 경로
    excel_file = Path(__file__).parent.parent.parent / "Country_Code_Selected.xlsx"
    
    if not excel_file.exists():
        auth_logger.error(f"엑셀 파일을 찾을 수 없습니다: {excel_file}")
        return False
    
    try:
        # 엑셀 파일 읽기
        auth_logger.info(f"엑셀 파일 읽기: {excel_file}")
        df = pd.read_excel(excel_file)
        
        # 컬럼명 확인 및 정리
        print(f"엑셀 컬럼: {df.columns.tolist()}")
        print(f"데이터 개수: {len(df)}")
        
        # Railway 외부 연결 URL 사용
        railway_db_url = "postgresql://postgres:lUAkUKpUxubYDvmqzGKxJLKgZCWMjaQy@switchyard.proxy.rlwy.net:51947/railway"
        
        print(f"DB URL: {railway_db_url}")
        
        # DB 엔진 직접 생성
        engine = create_engine(railway_db_url, echo=False)
        
        # 테이블 생성
        from app.common.db import Base
        Base.metadata.create_all(bind=engine)
        
        # 세션 생성
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        # 기존 데이터 삭제 (선택사항)
        existing_count = db.query(Country).count()
        if existing_count > 0:
            auth_logger.info(f"기존 국가 데이터 {existing_count}개 삭제")
            db.query(Country).delete()
            db.commit()
        
        # 새 데이터 삽입
        success_count = 0
        error_count = 0
        
        for index, row in df.iterrows():
            try:
                # 데이터 정리
                code = str(row['code']).strip() if pd.notna(row['code']) else ''
                country_name = str(row['country name']).strip() if pd.notna(row['country name']) else ''
                korean_name = str(row['한국이름']).strip() if pd.notna(row['한국이름']) else ''
                
                # 빈 데이터 건너뛰기
                if not code or not country_name or not korean_name:
                    auth_logger.warning(f"빈 데이터 건너뛰기: {row}")
                    continue
                
                # 중복 확인
                existing = db.query(Country).filter(Country.code == code).first()
                if existing:
                    auth_logger.warning(f"중복 국가 코드 건너뛰기: {code}")
                    continue
                
                # 새 Country 객체 생성
                country = Country(
                    code=code,
                    country_name=country_name,
                    korean_name=korean_name
                )
                
                db.add(country)
                success_count += 1
                
                # 진행상황 출력
                if success_count % 50 == 0:
                    print(f"진행상황: {success_count}/{len(df)}")
                
            except Exception as e:
                auth_logger.error(f"데이터 삽입 오류 (행 {index}): {str(e)}")
                error_count += 1
                continue
        
        # 커밋
        db.commit()
        
        # 결과 출력
        final_count = db.query(Country).count()
        auth_logger.info(f"국가 데이터 로드 완료:")
        auth_logger.info(f"  - 성공: {success_count}개")
        auth_logger.info(f"  - 오류: {error_count}개")
        auth_logger.info(f"  - DB 총 개수: {final_count}개")
        
        # 샘플 데이터 출력
        sample_countries = db.query(Country).limit(5).all()
        print("\n샘플 데이터:")
        for country in sample_countries:
            print(f"  {country.code}: {country.country_name} ({country.korean_name})")
        
        return True
        
    except Exception as e:
        auth_logger.error(f"국가 데이터 로드 중 오류: {str(e)}")
        return False
    
    finally:
        db.close()

if __name__ == "__main__":
    print("국가 코드 데이터 로더 (Railway) 시작...")
    
    # Railway 외부 연결 URL 설정
    railway_db_url = "postgresql://postgres:lUAkUKpUxubYDvmqzGKxJLKgZCWMjaQy@switchyard.proxy.rlwy.net:51947/railway"
    
    print(f"✅ Railway DB 연결: {railway_db_url[:30]}...")
    
    success = load_country_data_railway()
    
    if success:
        print("✅ 국가 데이터 로드 완료!")
    else:
        print("❌ 국가 데이터 로드 실패!")
        sys.exit(1)
