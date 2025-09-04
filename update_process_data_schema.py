#!/usr/bin/env python3
"""
공정 데이터 테이블 스키마 업데이트 스크립트
- 공정명, 생산제품, 세부공정 컬럼을 String(500)으로 확장
- 공정설명 컬럼명 통일 (공정_설명 -> 공정설명)
"""

import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# 환경 변수에서 데이터베이스 URL 가져오기
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://postgres:password@localhost:5432/greensteel')

def update_process_data_schema():
    """공정 데이터 테이블 스키마 업데이트"""
    try:
        # 데이터베이스 연결
        engine = create_engine(DATABASE_URL)
        Session = sessionmaker(bind=engine)
        
        print("공정 데이터 테이블 스키마 업데이트 시작...")
        
        # 각 작업을 개별 세션으로 처리
        def execute_sql(sql, description):
            try:
                with Session() as session:
                    session.execute(text(sql))
                    session.commit()
                    print(f"✓ {description} 완료")
                    return True
            except Exception as e:
                print(f"❌ {description} 실패: {e}")
                return False
        
        # 1. 공정설명 컬럼이 없다면 추가
        execute_sql("""
            ALTER TABLE process_data 
            ADD COLUMN IF NOT EXISTS "공정설명" TEXT;
        """, "공정설명 컬럼 추가")
        
        # 2. 공정명 컬럼 크기 확장
        execute_sql("""
            ALTER TABLE process_data 
            ALTER COLUMN "공정명" TYPE VARCHAR(500);
        """, "공정명 컬럼 크기를 VARCHAR(500)으로 확장")
        
        # 3. 생산제품 컬럼 크기 확장
        execute_sql("""
            ALTER TABLE process_data 
            ALTER COLUMN "생산제품" TYPE VARCHAR(500);
        """, "생산제품 컬럼 크기를 VARCHAR(500)으로 확장")
        
        # 4. 세부공정 컬럼 크기 확장
        execute_sql("""
            ALTER TABLE process_data 
            ALTER COLUMN "세부공정" TYPE VARCHAR(500);
        """, "세부공정 컬럼 크기를 VARCHAR(500)으로 확장")
        
        # 5. 공정설명 컬럼을 TEXT 타입으로 설정
        execute_sql("""
            ALTER TABLE process_data 
            ALTER COLUMN "공정설명" TYPE TEXT;
        """, "공정설명 컬럼을 TEXT 타입으로 설정")
        
        print("✓ 모든 스키마 업데이트가 완료되었습니다!")
            
    except Exception as e:
        print(f"❌ 스키마 업데이트 실패: {e}")
        sys.exit(1)

if __name__ == "__main__":
    update_process_data_schema()
