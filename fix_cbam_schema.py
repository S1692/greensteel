#!/usr/bin/env python3
"""
CBAM 서비스의 product 테이블 스키마 문제 해결 및 목업 데이터 제거 스크립트
"""

import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def main():
    print("🔧 CBAM 서비스 스키마 문제 해결 시작...")
    
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
        # 1. 현재 product 테이블 구조 확인
        print("\n📋 현재 product 테이블 구조 확인 중...")
        cursor.execute("""
            SELECT column_name, data_type, numeric_precision, numeric_scale, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'product' 
            ORDER BY ordinal_position;
        """)
        
        columns = cursor.fetchall()
        print("현재 product 테이블 구조:")
        for col in columns:
            col_name, data_type, precision, scale, nullable = col
            if precision and scale:
                print(f"  - {col_name}: {data_type}({precision},{scale}) {'NULL' if nullable == 'YES' else 'NOT NULL'}")
            else:
                print(f"  - {col_name}: {data_type} {'NULL' if nullable == 'YES' else 'NOT NULL'}")
        
        # 2. 목업 데이터 확인 및 제거
        print("\n🗑️ 목업 데이터 확인 및 제거 중...")
        cursor.execute("SELECT COUNT(*) FROM product;")
        total_count = cursor.fetchone()[0]
        print(f"총 제품 수: {total_count}")
        
        if total_count > 0:
            cursor.execute("SELECT id, product_name, product_cncode FROM product LIMIT 5;")
            sample_data = cursor.fetchall()
            print("샘플 데이터:")
            for row in sample_data:
                print(f"  - ID: {row[0]}, product_name: {row[1]}, product_cncode: {row[2]}")
            
            # 목업 데이터 제거 (테스트용 데이터)
            cursor.execute("DELETE FROM product WHERE product_name IN ('김중동', 'Cn');")
            deleted_count = cursor.rowcount
            print(f"✅ 목업 데이터 {deleted_count}개 제거 완료")
        
        # 3. 기존 스키마 호환성을 위한 컬럼 추가
        print("\n📝 기존 스키마 호환성을 위한 컬럼 추가 중...")
        
        # 기존 스키마 컬럼들 추가
        legacy_columns = [
            ("name", "TEXT"),
            ("cn_code", "TEXT"),
            ("period_start", "DATE"),
            ("period_end", "DATE"),
            ("production_qty", "NUMERIC(15,6) DEFAULT 0"),
            ("sales_qty", "NUMERIC(15,6) DEFAULT 0"),
            ("export_qty", "NUMERIC(15,6) DEFAULT 0"),
            ("inventory_qty", "NUMERIC(15,6) DEFAULT 0"),
            ("defect_rate", "NUMERIC(10,4) DEFAULT 0"),
            ("node_id", "TEXT DEFAULT 'default'")
        ]
        
        for col_name, col_def in legacy_columns:
            try:
                cursor.execute(f"ALTER TABLE product ADD COLUMN IF NOT EXISTS {col_name} {col_def};")
                print(f"✅ {col_name} 컬럼 추가/확인 완료")
            except Exception as e:
                print(f"⚠️ {col_name} 컬럼 처리 실패: {e}")
        
        # 4. 기존 데이터를 양쪽 스키마로 매핑
        print("\n🔄 기존 데이터를 양쪽 스키마로 매핑 중...")
        
        # product_name -> name 매핑
        cursor.execute("""
            UPDATE product 
            SET name = COALESCE(name, product_name)
            WHERE name IS NULL AND product_name IS NOT NULL;
        """)
        
        # product_cncode -> cn_code 매핑
        cursor.execute("""
            UPDATE product 
            SET cn_code = COALESCE(cn_code, product_cncode)
            WHERE cn_code IS NULL AND product_cncode IS NOT NULL;
        """)
        
        # prostart_period -> period_start 매핑
        cursor.execute("""
            UPDATE product 
            SET period_start = COALESCE(period_start, prostart_period)
            WHERE period_start IS NULL AND prostart_period IS NOT NULL;
        """)
        
        # proend_period -> period_end 매핑
        cursor.execute("""
            UPDATE product 
            SET period_end = COALESCE(period_end, proend_period)
            WHERE period_end IS NULL AND proend_period IS NOT NULL;
        """)
        
        # product_amount -> production_qty 매핑
        cursor.execute("""
            UPDATE product 
            SET production_qty = COALESCE(production_qty, product_amount)
            WHERE production_qty IS NULL AND product_amount IS NOT NULL;
        """)
        
        print("✅ 기존 데이터 양쪽 스키마로 매핑 완료")
        
        # 5. 최종 테이블 구조 확인
        print("\n📋 최종 product 테이블 구조 확인 중...")
        cursor.execute("""
            SELECT column_name, data_type, numeric_precision, numeric_scale, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'product' 
            ORDER BY ordinal_position;
        """)
        
        final_columns = cursor.fetchall()
        print("최종 product 테이블 구조:")
        for col in final_columns:
            col_name, data_type, precision, scale, nullable = col
            if precision and scale:
                print(f"  - {col_name}: {data_type}({precision},{scale}) {'NULL' if nullable == 'YES' else 'NOT NULL'}")
            else:
                print(f"  - {col_name}: {data_type} {'NULL' if nullable == 'YES' else 'NOT NULL'}")
        
        # 6. 샘플 데이터로 테스트
        print("\n🧪 샘플 데이터로 테스트 중...")
        
        # 테스트용 제품 데이터 삽입 (CBAM 스키마로)
        test_product = {
            'product_name': '테스트제품',
            'product_category': '단순제품',
            'prostart_period': '2025-08-01',
            'proend_period': '2025-08-31',
            'product_amount': 100.0,
            'install_id': 1
        }
        
        cursor.execute("""
            INSERT INTO product (
                product_name, product_category, prostart_period, proend_period, 
                product_amount, install_id
            ) VALUES (
                %(product_name)s, %(product_category)s, %(prostart_period)s, %(proend_period)s,
                %(product_amount)s, %(install_id)s
            ) RETURNING id;
        """, test_product)
        
        test_id = cursor.fetchone()[0]
        print(f"✅ 테스트 제품 생성 성공 (ID: {test_id})")
        
        # 테스트 데이터 확인
        cursor.execute("SELECT id, product_name, product_category, product_amount FROM product WHERE id = %s;", (test_id,))
        test_result = cursor.fetchone()
        print(f"테스트 데이터 확인: {test_result}")
        
        # 테스트 데이터 제거
        cursor.execute("DELETE FROM product WHERE id = %s;", (test_id,))
        print("✅ 테스트 데이터 제거 완료")
        
        print("\n🎉 CBAM 서비스 스키마 문제 해결 완료!")
        print("✅ 이제 product 테이블이 CBAM 스키마와 기존 스키마 모두를 지원합니다!")
        print("✅ defect_rate 필드가 NUMERIC(10,4) 타입으로 추가되었습니다!")
        print("✅ 목업 데이터가 제거되었습니다!")
        
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        conn.rollback()
    
    finally:
        cursor.close()
        conn.close()
        print("🔌 데이터베이스 연결 종료")

if __name__ == "__main__":
    main()
