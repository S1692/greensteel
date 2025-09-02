#!/usr/bin/env python3
"""
process_data 테이블 마이그레이션 스크립트
생산제품과 세부공정 컬럼을 추가합니다.
"""

import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

def migrate_process_data():
    """process_data 테이블에 필요한 컬럼을 추가합니다."""
    
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
                "application_name": "process_data_migration"
            }
        )
        
        with Session(engine) as session:
            try:
                # 1. 테이블 존재 여부 확인
                table_exists = session.execute(text("""
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_name = 'process_data'
                    )
                """)).scalar()
                
                if not table_exists:
                    print("❌ process_data 테이블이 존재하지 않습니다.")
                    return False
                
                print("✅ process_data 테이블 확인됨")
                
                # 2. 현재 테이블 구조 확인
                columns_info = session.execute(text("""
                    SELECT column_name, data_type 
                    FROM information_schema.columns 
                    WHERE table_name = 'process_data' 
                    ORDER BY ordinal_position
                """))
                
                existing_columns = [col[0] for col in columns_info.fetchall()]
                print(f"현재 컬럼: {existing_columns}")
                
                # 3. 필요한 컬럼 추가
                if '생산제품' not in existing_columns:
                    print("➕ 생산제품 컬럼 추가 중...")
                    session.execute(text("""
                        ALTER TABLE process_data 
                        ADD COLUMN "생산제품" VARCHAR(255)
                    """))
                    print("✅ 생산제품 컬럼 추가 완료")
                else:
                    print("ℹ️ 생산제품 컬럼이 이미 존재합니다.")
                
                if '세부공정' not in existing_columns:
                    print("➕ 세부공정 컬럼 추가 중...")
                    session.execute(text("""
                        ALTER TABLE process_data 
                        ADD COLUMN "세부공정" VARCHAR(255)
                    """))
                    print("✅ 세부공정 컬럼 추가 완료")
                else:
                    print("ℹ️ 세부공정 컬럼이 이미 존재합니다.")
                
                # 4. 기존 데이터에 기본값 설정 (필요한 경우)
                if '생산제품' not in existing_columns or '세부공정' not in existing_columns:
                    print("🔄 기존 데이터에 기본값 설정 중...")
                    session.execute(text("""
                        UPDATE process_data 
                        SET "생산제품" = COALESCE("생산제품", ''),
                            "세부공정" = COALESCE("세부공정", '')
                        WHERE "생산제품" IS NULL OR "세부공정" IS NULL
                    """))
                    print("✅ 기본값 설정 완료")
                
                # 5. 변경사항 커밋
                session.commit()
                print("✅ 마이그레이션 완료!")
                
                # 6. 최종 테이블 구조 확인
                final_columns = session.execute(text("""
                    SELECT column_name, data_type 
                    FROM information_schema.columns 
                    WHERE table_name = 'process_data' 
                    ORDER BY ordinal_position
                """))
                
                print("\n📋 최종 테이블 구조:")
                for col in final_columns.fetchall():
                    print(f"  - {col[0]}: {col[1]}")
                
                return True
                
            except Exception as e:
                session.rollback()
                print(f"❌ 마이그레이션 실패: {e}")
                return False
                
    except Exception as e:
        print(f"❌ 데이터베이스 연결 실패: {e}")
        return False

if __name__ == "__main__":
    print("🚀 process_data 테이블 마이그레이션 시작...")
    success = migrate_process_data()
    
    if success:
        print("\n🎉 마이그레이션이 성공적으로 완료되었습니다!")
        sys.exit(0)
    else:
        print("\n💥 마이그레이션에 실패했습니다.")
        sys.exit(1)
