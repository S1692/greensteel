#!/usr/bin/env python3
"""
데이터베이스 스키마 일관성 검증 스크립트
CBAM 스키마와 기존 스키마 간의 일관성을 확인
"""

import psycopg2
import psycopg2.extras
from typing import Dict, List, Any
import json

def validate_schema_consistency():
    """데이터베이스 스키마 일관성 검증"""
    print("🔍 데이터베이스 스키마 일관성 검증 시작...")
    print("=" * 60)
    
    # 데이터베이스 연결
    try:
        conn = psycopg2.connect(
            "postgresql://postgres:lUAkUKpUxubYDvmqzGKxJLKgZCWMjaQy@switchyard.proxy.rlwy.net:51947/railway"
        )
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        print("✅ 데이터베이스 연결 성공!")
        
    except Exception as e:
        print(f"❌ 데이터베이스 연결 실패: {e}")
        return
    
    try:
        # 1. CBAM 스키마 테이블 검증
        print("\n1️⃣ CBAM 스키마 테이블 검증")
        cbam_tables = [
            'install', 'product', 'process', 'product_process', 
            'process_input', 'edge', 'emission_factors', 
            'emission_attribution', 'product_emissions'
        ]
        
        for table in cbam_tables:
            try:
                cursor.execute(f"SELECT COUNT(*) FROM {table}")
                count = cursor.fetchone()['count']
                print(f"   ✅ {table}: {count}행")
            except Exception as e:
                print(f"   ❌ {table}: 테이블 없음 또는 접근 불가 - {e}")
        
        # 2. 기존 스키마 테이블 검증
        print("\n2️⃣ 기존 스키마 테이블 검증")
        legacy_tables = [
            'base', 'input', 'output', 'performance', 'transport'
        ]
        
        for table in legacy_tables:
            try:
                cursor.execute(f"SELECT COUNT(*) FROM {table}")
                count = cursor.fetchone()['count']
                print(f"   ✅ {table}: {count}행")
            except Exception as e:
                print(f"   ❌ {table}: 테이블 없음 또는 접근 불가 - {e}")
        
        # 3. 핵심 테이블 구조 검증
        print("\n3️⃣ 핵심 테이블 구조 검증")
        
        # install 테이블 구조
        print("\n   📊 install 테이블 구조:")
        try:
            cursor.execute("""
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns 
                WHERE table_name = 'install' 
                ORDER BY ordinal_position
            """)
            columns = cursor.fetchall()
            for col in columns:
                print(f"     - {col['column_name']}: {col['data_type']} {'NULL' if col['is_nullable'] == 'YES' else 'NOT NULL'}")
        except Exception as e:
            print(f"     ❌ install 테이블 구조 확인 실패: {e}")
        
        # product 테이블 구조
        print("\n   📊 product 테이블 구조:")
        try:
            cursor.execute("""
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns 
                WHERE table_name = 'product' 
                ORDER BY ordinal_position
            """)
            columns = cursor.fetchall()
            for col in columns:
                print(f"     - {col['column_name']}: {col['data_type']} {'NULL' if col['is_nullable'] == 'YES' else 'NOT NULL'}")
        except Exception as e:
            print(f"     ❌ product 테이블 구조 확인 실패: {e}")
        
        # process 테이블 구조
        print("\n   📊 process 테이블 구조:")
        try:
            cursor.execute("""
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns 
                WHERE table_name = 'process' 
                ORDER BY ordinal_position
            """)
            columns = cursor.fetchall()
            for col in columns:
                print(f"     - {col['column_name']}: {col['data_type']} {'NULL' if col['is_nullable'] == 'YES' else 'NOT NULL'}")
        except Exception as e:
            print(f"     ❌ process 테이블 구조 확인 실패: {e}")
        
        # 4. 외래키 제약조건 검증
        print("\n4️⃣ 외래키 제약조건 검증")
        try:
            cursor.execute("""
                SELECT 
                    tc.table_name, 
                    kcu.column_name, 
                    ccu.table_name AS foreign_table_name,
                    ccu.column_name AS foreign_column_name 
                FROM 
                    information_schema.table_constraints AS tc 
                    JOIN information_schema.key_column_usage AS kcu
                      ON tc.constraint_name = kcu.constraint_name
                      AND tc.table_schema = kcu.table_schema
                    JOIN information_schema.constraint_column_usage AS ccu
                      ON ccu.constraint_name = tc.constraint_name
                      AND ccu.table_schema = tc.table_schema
                WHERE tc.constraint_type = 'FOREIGN KEY'
                ORDER BY tc.table_name, kcu.column_name
            """)
            foreign_keys = cursor.fetchall()
            
            if foreign_keys:
                for fk in foreign_keys:
                    print(f"   🔗 {fk['table_name']}.{fk['column_name']} → {fk['foreign_table_name']}.{fk['foreign_column_name']}")
            else:
                print("   ⚠️ 외래키 제약조건이 없습니다")
                
        except Exception as e:
            print(f"   ❌ 외래키 검증 실패: {e}")
        
        # 5. 데이터 일관성 검증
        print("\n5️⃣ 데이터 일관성 검증")
        
        # install-product 관계 검증
        print("\n   🔍 install-product 관계 검증:")
        try:
            cursor.execute("""
                SELECT 
                    i.id as install_id,
                    i.name as install_name,
                    COUNT(p.id) as product_count
                FROM install i
                LEFT JOIN product p ON i.id = p.install_id
                GROUP BY i.id, i.name
                ORDER BY i.id
            """)
            install_products = cursor.fetchall()
            
            for row in install_products:
                print(f"     - {row['install_name']} (ID: {row['install_id']}): {row['product_count']}개 제품")
                
        except Exception as e:
            print(f"     ❌ install-product 관계 검증 실패: {e}")
        
        # product-process 관계 검증
        print("\n   🔍 product-process 관계 검증:")
        try:
            cursor.execute("""
                SELECT 
                    p.id as product_id,
                    p.product_name,
                    COUNT(pp.process_id) as process_count
                FROM product p
                LEFT JOIN product_process pp ON p.id = pp.product_id
                GROUP BY p.id, p.product_name
                ORDER BY p.id
            """)
            product_processes = cursor.fetchall()
            
            for row in product_processes:
                print(f"     - {row['product_name']} (ID: {row['product_id']}): {row['process_count']}개 공정")
                
        except Exception as e:
            print(f"     ❌ product-process 관계 검증 실패: {e}")
        
        # 6. 스키마 문제점 요약
        print("\n6️⃣ 스키마 문제점 요약")
        
        # CBAM 필수 테이블 존재 여부
        missing_cbam_tables = []
        for table in cbam_tables:
            try:
                cursor.execute(f"SELECT 1 FROM {table} LIMIT 1")
            except:
                missing_cbam_tables.append(table)
        
        if missing_cbam_tables:
            print(f"   ❌ 누락된 CBAM 테이블: {', '.join(missing_cbam_tables)}")
        else:
            print("   ✅ 모든 CBAM 테이블이 존재합니다")
        
        # 데이터 타입 일관성 검증
        print("\n   🔍 데이터 타입 일관성:")
        try:
            cursor.execute("""
                SELECT 
                    table_name,
                    column_name,
                    data_type
                FROM information_schema.columns 
                WHERE table_name IN ('install', 'product', 'process')
                AND column_name IN ('id', 'name', 'created_at', 'updated_at')
                ORDER BY table_name, column_name
            """)
            type_consistency = cursor.fetchall()
            
            for row in type_consistency:
                print(f"     - {row['table_name']}.{row['column_name']}: {row['data_type']}")
                
        except Exception as e:
            print(f"     ❌ 데이터 타입 일관성 검증 실패: {e}")
        
        print("\n" + "=" * 60)
        print("🎉 스키마 일관성 검증 완료!")
        
        # 권장사항
        print("\n💡 권장사항:")
        if missing_cbam_tables:
            print("   1. 누락된 CBAM 테이블을 생성하세요")
        print("   2. 데이터 타입 일관성을 유지하세요")
        print("   3. 외래키 제약조건을 적절히 설정하세요")
        print("   4. 정기적으로 스키마 검증을 수행하세요")
        
    except Exception as e:
        print(f"❌ 스키마 검증 중 오류 발생: {e}")
    
    finally:
        cursor.close()
        conn.close()
        print("\n🔌 데이터베이스 연결 종료")

if __name__ == "__main__":
    validate_schema_consistency()
