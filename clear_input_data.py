#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
input_data 테이블 데이터 삭제 스크립트
"""

import os
import sys
from pathlib import Path

# 프로젝트 루트 경로 추가
project_root = Path(__file__).parent
sys.path.append(str(project_root / "service" / "cbam_service" / "cbam-service"))

from sqlalchemy import create_engine, text

# 환경 변수 설정
DB_URL = os.getenv("DATABASE_URL", "postgresql://username:password@localhost:5432/dbname")

def create_engine_and_session():
    """데이터베이스 엔진 생성"""
    try:
        engine = create_engine(DB_URL)
        return engine
    except Exception as e:
        print(f"데이터베이스 연결 실패: {e}")
        return None

def clear_input_data_table(engine):
    """input_data 테이블의 모든 데이터 삭제"""
    try:
        with engine.connect() as conn:
            # 테이블 존재 여부 확인
            result = conn.execute(text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'input_data'
                );
            """))
            exists = result.scalar()
            
            if not exists:
                print("❌ input_data 테이블이 존재하지 않습니다.")
                return False
            
            # 테이블의 현재 데이터 수 확인
            count_result = conn.execute(text("SELECT COUNT(*) FROM input_data"))
            current_count = count_result.scalar()
            
            if current_count == 0:
                print("ℹ️ input_data 테이블에 데이터가 없습니다.")
                return True
            
            # 모든 데이터 삭제
            conn.execute(text("DELETE FROM input_data"))
            conn.commit()
            
            print(f"✅ input_data 테이블에서 {current_count}개의 데이터가 삭제되었습니다.")
            return True
            
    except Exception as e:
        print(f"❌ input_data 테이블 데이터 삭제 실패: {e}")
        return False

def main():
    """메인 함수"""
    print("🚀 input_data 테이블 데이터 삭제를 시작합니다...")
    
    # 데이터베이스 연결
    engine = create_engine_and_session()
    if not engine:
        print("❌ 데이터베이스 연결에 실패했습니다.")
        return
    
    try:
        # input_data 테이블 비우기
        if clear_input_data_table(engine):
            print("\n🎉 input_data 테이블 데이터 삭제가 완료되었습니다!")
        else:
            print("\n❌ input_data 테이블 데이터 삭제에 실패했습니다.")
        
    except Exception as e:
        print(f"❌ 작업 중 오류 발생: {e}")
    
    finally:
        engine.dispose()

if __name__ == "__main__":
    main()
