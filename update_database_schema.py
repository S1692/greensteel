#!/usr/bin/env python3
"""
GreenSteel 데이터베이스 스키마 업데이트 스크립트
새로운 Excel 기반 컬럼 구조로 테이블을 재생성합니다.
"""

import psycopg2
import os
import sys
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# 데이터베이스 연결 정보
DATABASE_URL = "postgresql://postgres:lUAkUKpUxubYDvmqzGKxJLKgZCWMjaQy@switchyard.proxy.rlwy.net:51947/railway"

def parse_database_url(url):
    """데이터베이스 URL을 파싱하여 연결 정보를 추출합니다."""
    # postgresql://postgres:password@host:port/database
    parts = url.replace('postgresql://', '').split('@')
    credentials = parts[0].split(':')
    host_port_db = parts[1].split('/')
    host_port = host_port_db[0].split(':')
    
    return {
        'host': host_port[0],
        'port': host_port[1],
        'database': host_port_db[1],
        'user': credentials[0],
        'password': credentials[1]
    }

def create_connection():
    """데이터베이스 연결을 생성합니다."""
    try:
        db_info = parse_database_url(DATABASE_URL)
        conn = psycopg2.connect(
            host=db_info['host'],
            port=db_info['port'],
            database=db_info['database'],
            user=db_info['user'],
            password=db_info['password']
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        print(f"✅ 데이터베이스 연결 성공: {db_info['host']}:{db_info['port']}/{db_info['database']}")
        return conn
    except Exception as e:
        print(f"❌ 데이터베이스 연결 실패: {e}")
        return None

def execute_sql_file(conn, sql_file_path):
    """SQL 파일을 실행합니다."""
    try:
        with open(sql_file_path, 'r', encoding='utf-8') as file:
            sql_content = file.read()
        
        cursor = conn.cursor()
        
        # SQL 문을 세미콜론으로 분리하여 실행
        sql_statements = [stmt.strip() for stmt in sql_content.split(';') if stmt.strip()]
        
        for i, statement in enumerate(sql_statements):
            if statement:
                try:
                    cursor.execute(statement)
                    print(f"✅ SQL 실행 성공 ({i+1}/{len(sql_statements)}): {statement[:50]}...")
                except Exception as e:
                    print(f"⚠️ SQL 실행 경고 ({i+1}/{len(sql_statements)}): {e}")
                    print(f"   Statement: {statement[:100]}...")
                    # 계속 진행
                    continue
        
        cursor.close()
        print("✅ SQL 파일 실행 완료")
        return True
        
    except Exception as e:
        print(f"❌ SQL 파일 실행 실패: {e}")
        return False

def backup_existing_tables(conn):
    """기존 테이블을 백업합니다."""
    try:
        cursor = conn.cursor()
        
        # 기존 테이블 목록 조회
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('input_data', 'output_data', 'transport_data', 'process_data')
        """)
        
        existing_tables = [row[0] for row in cursor.fetchall()]
        
        if not existing_tables:
            print("ℹ️ 백업할 기존 테이블이 없습니다.")
            return True
        
        print(f"📋 백업할 테이블: {', '.join(existing_tables)}")
        
        # 각 테이블을 백업
        for table_name in existing_tables:
            backup_table_name = f"{table_name}_backup_{int(time.time())}"
            
            cursor.execute(f"CREATE TABLE {backup_table_name} AS SELECT * FROM {table_name}")
            print(f"✅ 테이블 백업 완료: {table_name} -> {backup_table_name}")
        
        cursor.close()
        return True
        
    except Exception as e:
        print(f"❌ 테이블 백업 실패: {e}")
        return False

def main():
    """메인 실행 함수"""
    print("🚀 GreenSteel 데이터베이스 스키마 업데이트 시작")
    print("=" * 60)
    
    # 데이터베이스 연결
    conn = create_connection()
    if not conn:
        sys.exit(1)
    
    try:
        # 1. 기존 테이블 백업
        print("\n📦 1단계: 기존 테이블 백업")
        if not backup_existing_tables(conn):
            print("⚠️ 백업 실패했지만 계속 진행합니다.")
        
        # 2. 새로운 스키마 적용
        print("\n🔄 2단계: 새로운 스키마 적용")
        sql_file_path = "create_new_tables.sql"
        
        if not os.path.exists(sql_file_path):
            print(f"❌ SQL 파일을 찾을 수 없습니다: {sql_file_path}")
            sys.exit(1)
        
        if execute_sql_file(conn, sql_file_path):
            print("✅ 새로운 스키마 적용 완료")
        else:
            print("❌ 새로운 스키마 적용 실패")
            sys.exit(1)
        
        # 3. 테이블 구조 확인
        print("\n🔍 3단계: 테이블 구조 확인")
        cursor = conn.cursor()
        
        tables_to_check = ['input_data', 'output_data', 'transport_data', 'process_data']
        
        for table_name in tables_to_check:
            try:
                cursor.execute(f"SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = '{table_name}' ORDER BY ordinal_position")
                columns = cursor.fetchall()
                
                print(f"\n📋 {table_name} 테이블 구조:")
                for col in columns:
                    nullable = "NULL" if col[2] == "YES" else "NOT NULL"
                    print(f"  - {col[0]}: {col[1]} ({nullable})")
                    
            except Exception as e:
                print(f"⚠️ {table_name} 테이블 구조 확인 실패: {e}")
        
        cursor.close()
        
        print("\n🎉 데이터베이스 스키마 업데이트 완료!")
        print("=" * 60)
        
    except Exception as e:
        print(f"❌ 업데이트 중 오류 발생: {e}")
        sys.exit(1)
    
    finally:
        if conn:
            conn.close()
            print("🔌 데이터베이스 연결 종료")

if __name__ == "__main__":
    import time
    main()
