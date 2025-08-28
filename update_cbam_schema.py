#!/usr/bin/env python3
"""
겹치는 테이블을 CBAM 스키마로 업데이트하는 스크립트
"""

import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def main():
    print("🔄 겹치는 테이블을 CBAM 스키마로 업데이트 중...")
    
    try:
        conn = psycopg2.connect(
            host='switchyard.proxy.rlwy.net',
            database='railway',
            user='postgres',
            password='lUAkUKpUxubYDvmqzGKxJLKgZCWMjaQy',
            port=51947
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        print("✅ 데이터베이스 연결 성공!")
    except Exception as e:
        print(f"❌ 데이터베이스 연결 실패: {e}")
        return
    
    cursor = conn.cursor()
    
    try:
        # 현재 테이블 목록 확인
        cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;")
        tables = cursor.fetchall()
        print("\n현재 테이블 목록:")
        for table in tables:
            print(f"  - {table[0]}")
        
        # 1. process 테이블을 CBAM 스키마로 업데이트
        print("\n🔄 process 테이블 CBAM 스키마로 업데이트 중...")
        try:
            cursor.execute("ALTER TABLE process ADD COLUMN IF NOT EXISTS start_period DATE DEFAULT CURRENT_DATE;")
            cursor.execute("ALTER TABLE process ADD COLUMN IF NOT EXISTS end_period DATE DEFAULT CURRENT_TIMESTAMP;")
            print("✅ process 테이블 CBAM 스키마로 업데이트 완료")
        except Exception as e:
            print(f"⚠️ process 테이블 업데이트 실패: {e}")
        
        # 2. product 테이블을 CBAM 스키마로 업데이트
        print("\n🔄 product 테이블 CBAM 스키마로 업데이트 중...")
        try:
            cursor.execute("ALTER TABLE product ADD COLUMN IF NOT EXISTS install_id INTEGER;")
            cursor.execute("ALTER TABLE product ADD COLUMN IF NOT EXISTS product_category TEXT DEFAULT '단순제품';")
            cursor.execute("ALTER TABLE product ADD COLUMN IF NOT EXISTS prostart_period DATE DEFAULT CURRENT_DATE;")
            cursor.execute("ALTER TABLE product ADD COLUMN IF NOT EXISTS proend_period DATE DEFAULT CURRENT_DATE;")
            cursor.execute("ALTER TABLE product ADD COLUMN IF NOT EXISTS product_cncode TEXT;")
            cursor.execute("ALTER TABLE product ADD COLUMN IF NOT EXISTS goods_name TEXT;")
            cursor.execute("ALTER TABLE product ADD COLUMN IF NOT EXISTS aggrgoods_name TEXT;")
            cursor.execute("ALTER TABLE product ADD COLUMN IF NOT EXISTS product_amount FLOAT DEFAULT 0;")
            cursor.execute("ALTER TABLE product ADD COLUMN IF NOT EXISTS product_sell FLOAT;")
            cursor.execute("ALTER TABLE product ADD COLUMN IF NOT EXISTS product_eusell FLOAT;")
            cursor.execute("ALTER TABLE product ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;")
            print("✅ product 테이블 CBAM 스키마로 업데이트 완료")
        except Exception as e:
            print(f"⚠️ product 테이블 업데이트 실패: {e}")
        
        # 3. 기존 데이터를 CBAM 스키마로 매핑
        print("\n🔄 기존 데이터 CBAM 스키마로 매핑 중...")
        try:
            cursor.execute("""
                UPDATE product 
                SET product_category = '단순제품',
                    prostart_period = COALESCE(period_start, CURRENT_DATE),
                    proend_period = COALESCE(period_end, CURRENT_DATE),
                    product_cncode = cn_code,
                    product_amount = COALESCE(production_qty, 0)
                WHERE product_category IS NULL;
            """)
            print("✅ product 테이블 기존 데이터 CBAM 스키마로 업데이트 완료")
        except Exception as e:
            print(f"⚠️ product 데이터 업데이트 실패: {e}")
        
        # 4. 업데이트된 테이블 구조 확인
        print("\n📋 업데이트된 테이블 구조 확인 중...")
        
        # process 테이블 구조
        cursor.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'process' ORDER BY ordinal_position;")
        process_columns = cursor.fetchall()
        print("\nprocess 테이블 구조:")
        for col in process_columns:
            print(f"  - {col[0]}: {col[1]}")
        
        # product 테이블 구조
        cursor.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'product' ORDER BY ordinal_position;")
        product_columns = cursor.fetchall()
        print("\nproduct 테이블 구조:")
        for col in product_columns:
            print(f"  - {col[0]}: {col[1]}")
        
        print("\n🎉 CBAM 스키마 통합 완료!")
        print("✅ 이제 기존 테이블들이 CBAM 스키마와 호환됩니다!")
        
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        conn.rollback()
    
    finally:
        cursor.close()
        conn.close()
        print("🔌 데이터베이스 연결 종료")

if __name__ == "__main__":
    main()
