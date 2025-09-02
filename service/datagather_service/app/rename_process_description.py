#!/usr/bin/env python3
"""
process_data 테이블의 공정설명 컬럼명을 '공정 설명'으로 변경하는 스크립트
"""
import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

def rename_process_description():
    """process_data 테이블의 공정설명 컬럼명을 변경합니다."""
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("❌ DATABASE_URL 환경변수가 설정되지 않았습니다.")
        return False
    
    try:
        engine = create_engine(
            database_url,
            pool_pre_ping=True,
            pool_recycle=300,
            echo=False,
            connect_args={
                "connect_timeout": 10,
                "application_name": "rename_process_description"
            }
        )
        
        with Session(engine) as session:
            try:
                print("🔍 process_data 테이블 컬럼명 변경 시작...")
                
                # 공정설명 컬럼을 공정 설명으로 변경
                try:
                    session.execute(text("ALTER TABLE process_data RENAME COLUMN 공정설명 TO \"공정 설명\""))
                    print("✅ '공정설명' 컬럼명을 '공정 설명'으로 변경 완료")
                except Exception as e:
                    print(f"❌ 컬럼명 변경 실패: {e}")
                    return False
                
                session.commit()
                
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
                
                print("\n✅ process_data 테이블 컬럼명 변경 완료!")
                return True
                
            except Exception as e:
                print(f"❌ 테이블 변경 실패: {e}")
                session.rollback()
                return False
                
    except Exception as e:
        print(f"❌ 데이터베이스 연결 실패: {e}")
        return False

if __name__ == "__main__":
    success = rename_process_description()
    if success:
        print("\n🎉 모든 작업이 성공적으로 완료되었습니다!")
        sys.exit(0)
    else:
        print("\n💥 작업 중 오류가 발생했습니다.")
        sys.exit(1)
