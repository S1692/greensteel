#!/usr/bin/env python3
"""
간단한 데이터베이스 연결 테스트
"""

import psycopg2
import sys

# 데이터베이스 연결 정보 (실제 비밀번호로 변경 필요)
DB_HOST = "postgres-production-8f21.up.railway.app"
DB_NAME = "railway"
DB_USER = "postgres"
DB_PASSWORD = "password"  # 이 부분을 실제 비밀번호로 변경해야 합니다
DB_PORT = 5432

def test_connection():
    """데이터베이스 연결을 테스트합니다."""
    print("🔌 데이터베이스 연결 테스트 시작...")
    print(f"호스트: {DB_HOST}")
    print(f"포트: {DB_PORT}")
    print(f"데이터베이스: {DB_NAME}")
    print(f"사용자: {DB_USER}")
    
    try:
        print("\n📡 연결 시도 중...")
        conn = psycopg2.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            port=DB_PORT,
            connect_timeout=10
        )
        
        print("✅ 데이터베이스 연결 성공!")
        
        # 연결 정보 출력
        with conn.cursor() as cursor:
            cursor.execute("SELECT version();")
            version = cursor.fetchone()
            print(f"PostgreSQL 버전: {version[0]}")
            
            # 현재 데이터베이스 정보
            cursor.execute("SELECT current_database(), current_user;")
            db_info = cursor.fetchone()
            print(f"현재 데이터베이스: {db_info[0]}")
            print(f"현재 사용자: {db_info[1]}")
        
        conn.close()
        print("🔌 연결 종료")
        
    except psycopg2.OperationalError as e:
        print(f"❌ 연결 실패 (OperationalError): {e}")
        print("\n💡 해결 방법:")
        print("1. 데이터베이스 호스트 주소 확인")
        print("2. 포트 번호 확인")
        print("3. 사용자명과 비밀번호 확인")
        print("4. 방화벽 설정 확인")
        
    except psycopg2.Error as e:
        print(f"❌ PostgreSQL 오류: {e}")
        
    except Exception as e:
        print(f"❌ 예상치 못한 오류: {e}")

if __name__ == "__main__":
    test_connection()
