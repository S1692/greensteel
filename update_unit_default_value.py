#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def update_unit_default_value():
    """input_data 테이블의 단위 컬럼 기본값을 't'로 변경"""
    
    try:
        # 데이터베이스 연결
        conn = psycopg2.connect('postgresql://postgres:lUAkUKpUxubYDvmqzGKxJLKgZCWMjaQy@switchyard.proxy.rlwy.net:51947/railway')
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        
        with conn.cursor() as cursor:
            print("=== input_data 테이블의 단위 컬럼 기본값 변경 시작 ===")
            
            # 현재 단위 컬럼 정보 확인
            cursor.execute("""
                SELECT column_name, data_type, column_default, is_nullable
                FROM information_schema.columns 
                WHERE table_name = 'input_data' 
                AND column_name = '단위'
            """)
            
            column_info = cursor.fetchone()
            
            if column_info:
                print(f"현재 단위 컬럼 정보:")
                print(f"  - 컬럼명: {column_info[0]}")
                print(f"  - 데이터타입: {column_info[1]}")
                print(f"  - 기본값: {column_info[2]}")
                print(f"  - NULL 허용: {column_info[3]}")
                
                # 기본값을 't'로 변경
                cursor.execute("ALTER TABLE input_data ALTER COLUMN 단위 SET DEFAULT 't'")
                print("✅ 단위 컬럼 기본값을 't'로 변경 완료")
                
                # 변경 후 확인
                cursor.execute("""
                    SELECT column_name, data_type, column_default, is_nullable
                    FROM information_schema.columns 
                    WHERE table_name = 'input_data' 
                    AND column_name = '단위'
                """)
                
                updated_info = cursor.fetchone()
                print(f"\n변경 후 단위 컬럼 정보:")
                print(f"  - 컬럼명: {updated_info[0]}")
                print(f"  - 데이터타입: {updated_info[1]}")
                print(f"  - 기본값: {updated_info[2]}")
                print(f"  - NULL 허용: {updated_info[3]}")
                
            else:
                print("❌ 단위 컬럼을 찾을 수 없습니다")
            
            print("\n🎉 단위 컬럼 기본값 변경 작업 완료!")
            
    except Exception as e:
        print(f'❌ 오류 발생: {e}')
        import traceback
        traceback.print_exc()
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    update_unit_default_value()
