#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def cleanup_old_tables():
    """불필요한 구 테이블들을 제거하여 새로운 datagather_* 테이블로 대체"""
    
    try:
        # 데이터베이스 연결
        conn = psycopg2.connect('postgresql://postgres:lUAkUKpUxubYDvmqzGKxJLKgZCWMjaQy@switchyard.proxy.rlwy.net:51947/railway')
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        
        with conn.cursor() as cursor:
            print("=== 불필요한 구 테이블 정리 시작 ===")
            
            # 제거할 테이블 목록 (새로운 datagather_* 테이블로 대체됨)
            tables_to_remove = [
                'base',           # datagather_* 테이블로 대체
                'input',          # datagather_input으로 대체
                'output',         # datagather_output으로 대체
                'performance',    # datagather_performance로 대체
                'transport'       # datagather_transport로 대체
            ]
            
            for table_name in tables_to_remove:
                try:
                    # 테이블 존재 여부 확인
                    cursor.execute("""
                        SELECT EXISTS (
                            SELECT FROM information_schema.tables 
                            WHERE table_schema = 'public' 
                            AND table_name = %s
                        )
                    """, (table_name,))
                    
                    exists = cursor.fetchone()[0]
                    
                    if exists:
                        # 테이블 데이터 수 확인
                        cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
                        count = cursor.fetchone()[0]
                        
                        if count > 0:
                            print(f"⚠️  {table_name} 테이블에 {count}개 데이터가 있습니다. 데이터를 백업하시겠습니까?")
                            print(f"   계속 진행하려면 Enter를 누르세요...")
                            input()
                        
                        # 테이블 제거
                        cursor.execute(f"DROP TABLE IF EXISTS {table_name} CASCADE")
                        print(f"✅ {table_name} 테이블 제거 완료")
                    else:
                        print(f"ℹ️  {table_name} 테이블이 이미 존재하지 않습니다")
                        
                except Exception as e:
                    print(f"❌ {table_name} 테이블 제거 실패: {e}")
                    continue
            
            # 정리 후 테이블 목록 확인
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                ORDER BY table_name
            """)
            
            remaining_tables = cursor.fetchall()
            print(f"\n=== 정리 후 남은 테이블들 ({len(remaining_tables)}개) ===")
            for table in remaining_tables:
                print(f"  - {table[0]}")
            
            print("\n🎉 구 테이블 정리 완료!")
            print("✅ CBAM Service: process, process_input, product_process, product, install, emission_* 등")
            print("✅ DataGather Service: datagather_* 테이블들")
            print("✅ 공통: companies, users, edge")
            
    except Exception as e:
        print(f'❌ 오류 발생: {e}')
        import traceback
        traceback.print_exc()
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    cleanup_old_tables()
