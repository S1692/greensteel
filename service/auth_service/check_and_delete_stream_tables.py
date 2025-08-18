#!/usr/bin/env python3
"""
Railway PostgreSQL DB에서 stream 관련 테이블 삭제
stream_audits, stream_events, stream_snapshots 테이블 제거
"""

import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

def check_and_delete_stream_tables():
    """Railway DB에서 stream 관련 테이블 확인 및 삭제"""
    
    # Railway 외부 연결 URL
    railway_db_url = "postgresql://postgres:lUAkUKpUxubYDvmqzGKxJLKgZCWMjaQy@switchyard.proxy.rlwy.net:51947/railway"
    
    print(f"🔗 Railway DB 연결: {railway_db_url[:30]}...")
    
    try:
        # DB 엔진 생성
        engine = create_engine(railway_db_url, echo=False)
        
        # 세션 생성
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        # 현재 테이블 목록 확인
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
        
        # Stream 관련 테이블 확인
        stream_tables = ['stream_audits', 'stream_events', 'stream_snapshots']
        existing_stream_tables = [table for table in stream_tables if table in tables]
        
        if not existing_stream_tables:
            print(f"\n✅ Stream 관련 테이블이 존재하지 않습니다.")
            print(f"   찾는 테이블: {stream_tables}")
            return True
        
        print(f"\n🗑️ 삭제할 Stream 관련 테이블:")
        for table in existing_stream_tables:
            print(f"  - {table}")
        
        # 사용자 확인
        confirm = input(f"\n❓ 위 테이블들을 삭제하시겠습니까? (y/N): ").strip().lower()
        
        if confirm != 'y':
            print("❌ 테이블 삭제가 취소되었습니다.")
            return False
        
        # 테이블 삭제
        print(f"\n🗑️ 테이블 삭제 중...")
        for table in existing_stream_tables:
            try:
                # 테이블 삭제
                db.execute(text(f"DROP TABLE IF EXISTS {table} CASCADE"))
                print(f"  ✅ {table} 테이블 삭제 완료")
            except Exception as e:
                print(f"  ❌ {table} 테이블 삭제 실패: {str(e)}")
        
        # 커밋
        db.commit()
        
        # 삭제 후 테이블 목록 재확인
        print(f"\n📋 삭제 후 DB 테이블 목록:")
        result = db.execute(text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        """))
        
        remaining_tables = [row[0] for row in result]
        for table in remaining_tables:
            print(f"  - {table}")
        
        # Stream 테이블이 남아있는지 확인
        remaining_stream_tables = [table for table in stream_tables if table in remaining_tables]
        
        if remaining_stream_tables:
            print(f"\n⚠️ 삭제되지 않은 Stream 테이블:")
            for table in remaining_stream_tables:
                print(f"  - {table}")
        else:
            print(f"\n✅ 모든 Stream 관련 테이블이 성공적으로 삭제되었습니다!")
        
        return True
        
    except Exception as e:
        print(f"❌ 오류 발생: {str(e)}")
        return False
    
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Stream 테이블 삭제 스크립트 시작...")
    
    success = check_and_delete_stream_tables()
    
    if success:
        print("\n✅ 작업 완료!")
    else:
        print("\n❌ 작업 실패!")
        sys.exit(1)
