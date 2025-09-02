#!/usr/bin/env python3
"""
process_data 테이블 정리 스크립트
불필요한 컬럼(공정유형, 공정단계, 공정효율)을 제거합니다.
"""

import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

def cleanup_process_data():
    """process_data 테이블에서 불필요한 컬럼을 제거합니다."""
    
    # 환경변수에서 데이터베이스 URL 가져오기
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("❌ DATABASE_URL 환경변수가 설정되지 않았습니다.")
        return False
    
    try:
        # 데이터베이스 연결
        engine = create_engine(
            database_url,
            pool_pre_ping=True,
            pool_recycle=300,
            echo=False,
            connect_args={
                "connect_timeout": 10,
                "application_name": "process_data_cleanup"
            }
        )
        
        with Session(engine) as session:
            try:
                print("🔍 process_data 테이블 정리 시작...")
                
                # 불필요한 컬럼들 제거
                columns_to_drop = ['공정유형', '공정단계', '공정효율']
                
                for column in columns_to_drop:
                    try:
                        # 컬럼 존재 여부 확인
                        column_exists = session.execute(text(f"""
                            SELECT EXISTS (
                                SELECT FROM information_schema.columns 
                                WHERE table_name = 'process_data' 
                                AND column_name = '{column}'
                            )
                        """)).scalar()
                        
                        if column_exists:
                            print(f"🗑️  컬럼 '{column}' 제거 중...")
                            session.execute(text(f"ALTER TABLE process_data DROP COLUMN {column}"))
                            print(f"✅ 컬럼 '{column}' 제거 완료")
                        else:
                            print(f"ℹ️  컬럼 '{column}'는 이미 존재하지 않음")
                    
                    except Exception as e:
                        print(f"❌ 컬럼 '{column}' 제거 실패: {e}")
                        continue
                
                # 최종 테이블 구조 확인
                print("\n📋 최종 테이블 구조:")
                result = session.execute(text("""
                    SELECT column_name, data_type 
                    FROM information_schema.columns 
                    WHERE table_name = 'process_data' 
                    ORDER BY ordinal_position
                """))
                
                for row in result:
                    print(f"  - {row.column_name}: {row.data_type}")
                
                print("\n✅ process_data 테이블 정리 완료!")
                return True
                
            except Exception as e:
                print(f"❌ 테이블 정리 실패: {e}")
                session.rollback()
                return False
                
    except Exception as e:
        print(f"❌ 데이터베이스 연결 실패: {e}")
        return False

if __name__ == "__main__":
    success = cleanup_process_data()
    if success:
        print("\n🎉 모든 작업이 성공적으로 완료되었습니다!")
        sys.exit(0)
    else:
        print("\n💥 작업 중 오류가 발생했습니다.")
        sys.exit(1)
