#!/usr/bin/env python3
"""
데이터베이스 연결 및 테이블 구조 확인 스크립트
"""

import psycopg2
import sys

# 데이터베이스 연결 정보
DB_HOST = "postgres-production-8f21.up.railway.app"
DB_NAME = "railway"
DB_USER = "postgres"
DB_PASSWORD = "password"  # 실제 비밀번호로 변경 필요
DB_PORT = 5432

def connect_db():
    """데이터베이스에 연결합니다."""
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            port=DB_PORT
        )
        print("✅ 데이터베이스 연결 성공!")
        return conn
    except Exception as e:
        print(f"❌ 데이터베이스 연결 실패: {e}")
        return None

def check_tables(conn):
    """현재 테이블 목록을 확인합니다."""
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT table_name, table_type 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name;
            """)
            tables = cursor.fetchall()
            
            if tables:
                print("\n📋 현재 테이블 목록:")
                for table_name, table_type in tables:
                    print(f"  - {table_name} ({table_type})")
            else:
                print("\n📋 테이블이 없습니다.")
                
    except Exception as e:
        print(f"❌ 테이블 목록 조회 실패: {e}")

def check_table_schema(conn, table_name):
    """특정 테이블의 스키마를 확인합니다."""
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = %s
                ORDER BY ordinal_position;
            """, (table_name,))
            columns = cursor.fetchall()
            
            if columns:
                print(f"\n🔍 테이블 '{table_name}' 스키마:")
                for col_name, data_type, nullable, default_val in columns:
                    nullable_str = "NULL" if nullable == "YES" else "NOT NULL"
                    default_str = f"DEFAULT {default_val}" if default_val else ""
                    print(f"  - {col_name}: {data_type} {nullable_str} {default_str}")
            else:
                print(f"❌ 테이블 '{table_name}'을 찾을 수 없습니다.")
                
    except Exception as e:
        print(f"❌ 테이블 스키마 조회 실패: {e}")

def main():
    """메인 함수"""
    print("🚀 CBAM 서비스 데이터베이스 구조 확인 시작...")
    
    # 데이터베이스 연결
    conn = connect_db()
    if not conn:
        sys.exit(1)
    
    try:
        # 테이블 목록 확인
        check_tables(conn)
        
        # 특정 테이블이 있다면 스키마 확인
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT table_name FROM information_schema.tables 
                WHERE table_schema = 'public'
                LIMIT 1;
            """)
            result = cursor.fetchone()
            
            if result:
                table_name = result[0]
                check_table_schema(conn, table_name)
        
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
    finally:
        conn.close()
        print("\n🔌 데이터베이스 연결 종료")

if __name__ == "__main__":
    main()
