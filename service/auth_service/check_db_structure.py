#!/usr/bin/env python3
"""
Railway PostgreSQL DB 테이블 구조 확인
companies, countries, users 테이블의 컬럼 정보 확인
"""

import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

def check_db_structure():
    """Railway DB의 테이블 구조 확인"""
    
    # Railway 외부 연결 URL
    railway_db_url = "postgresql://postgres:lUAkUKpUxubYDvmqzGKxJLKgZCWMjaQy@switchyard.proxy.rlwy.net:51947/railway"
    
    print(f"🔗 Railway DB 연결: {railway_db_url[:30]}...")
    
    try:
        # DB 엔진 생성
        engine = create_engine(railway_db_url, echo=False)
        
        # 세션 생성
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        # 테이블 목록 확인
        print("\n📋 현재 DB 테이블 목록:")
        result = db.execute(text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        """))
        
        tables = [row[0] for row in result]
        for table in tables:
            print(f"  - {table}")
        
        # 각 테이블의 컬럼 구조 확인
        for table in tables:
            print(f"\n📊 {table} 테이블 구조:")
            result = db.execute(text(f"""
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns 
                WHERE table_schema = 'public' AND table_name = '{table}'
                ORDER BY ordinal_position
            """))
            
            for row in result:
                nullable = "NULL" if row[2] == "YES" else "NOT NULL"
                default = f"DEFAULT {row[3]}" if row[3] else ""
                print(f"  - {row[0]}: {row[1]} {nullable} {default}")
        
        # 샘플 데이터 확인
        print(f"\n📋 샘플 데이터:")
        for table in tables:
            result = db.execute(text(f"SELECT COUNT(*) FROM {table}"))
            count = result.fetchone()[0]
            print(f"  - {table}: {count}개 레코드")
            
            if count > 0:
                result = db.execute(text(f"SELECT * FROM {table} LIMIT 3"))
                rows = result.fetchall()
                print(f"    샘플:")
                for i, row in enumerate(rows, 1):
                    print(f"      {i}. {row}")
        
        return True
        
    except Exception as e:
        print(f"❌ 오류 발생: {str(e)}")
        return False
    
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 DB 구조 확인 스크립트 시작...")
    
    success = check_db_structure()
    
    if success:
        print("\n✅ 작업 완료!")
    else:
        print("\n❌ 작업 실패!")
        sys.exit(1)
