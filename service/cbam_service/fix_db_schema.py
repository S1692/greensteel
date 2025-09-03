import psycopg2

# PostgreSQL 연결
conn = psycopg2.connect('postgresql://postgres:lUAkUKpUxubYDvmqzGKxJLKgZCWMjaQy@switchyard.proxy.rlwy.net:51947/railway')
cur = conn.cursor()

print("=== database.md에 맞춰 DB 스키마 수정 ===\n")

try:
    # 1. install 테이블 수정
    print("🔧 install 테이블 수정 중...")
    
    # install_name을 name으로 변경
    cur.execute("""
        ALTER TABLE install RENAME COLUMN install_name TO name;
    """)
    print("  ✅ install_name → name 컬럼명 변경")
    
    # reporting_year 컬럼 삭제
    cur.execute("""
        ALTER TABLE install DROP COLUMN IF EXISTS reporting_year;
    """)
    print("  ✅ reporting_year 컬럼 삭제")
    
    # 2. product 테이블 수정
    print("\n🔧 product 테이블 수정 중...")
    
    # cncode_total을 product_cncode로 변경
    cur.execute("""
        ALTER TABLE product RENAME COLUMN cncode_total TO product_cncode;
    """)
    print("  ✅ cncode_total → product_cncode 컬럼명 변경")
    
    # 불필요한 컬럼들 삭제
    cur.execute("""
        ALTER TABLE product DROP COLUMN IF EXISTS goods_engname;
    """)
    print("  ✅ goods_engname 컬럼 삭제")
    
    cur.execute("""
        ALTER TABLE product DROP COLUMN IF EXISTS aggrgoods_engname;
    """)
    print("  ✅ aggrgoods_engname 컬럼 삭제")
    
    cur.execute("""
        ALTER TABLE product DROP COLUMN IF EXISTS attr_em;
    """)
    print("  ✅ attr_em 컬럼 삭제")
    
    # product_amount를 FLOAT에서 NUMERIC으로 변경
    cur.execute("""
        ALTER TABLE product ALTER COLUMN product_amount TYPE NUMERIC(15,6);
    """)
    print("  ✅ product_amount 타입을 NUMERIC(15,6)으로 변경")
    
    # product_sell, product_eusell을 NUMERIC으로 변경
    cur.execute("""
        ALTER TABLE product ALTER COLUMN product_sell TYPE NUMERIC(15,6);
    """)
    print("  ✅ product_sell 타입을 NUMERIC(15,6)으로 변경")
    
    cur.execute("""
        ALTER TABLE product ALTER COLUMN product_eusell TYPE NUMERIC(15,6);
    """)
    print("  ✅ product_eusell 타입을 NUMERIC(15,6)으로 변경")
    
    # 변경사항 커밋
    conn.commit()
    print("\n✅ 모든 스키마 수정 완료!")
    
except Exception as e:
    print(f"\n❌ 스키마 수정 실패: {e}")
    conn.rollback()
    raise
finally:
    cur.close()
    conn.close()

print("\n=== 수정된 테이블 구조 확인 ===")

# 수정된 테이블 구조 확인
conn = psycopg2.connect('postgresql://postgres:lUAkUKpUxubYDvmqzGKxJLKgZCWMjaQy@switchyard.proxy.rlwy.net:51947/railway')
cur = conn.cursor()

tables_to_check = ['install', 'product']

for table_name in tables_to_check:
    print(f"\n--- {table_name.upper()} 테이블 ---")
    
    cur.execute("""
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = %s 
        ORDER BY ordinal_position;
    """, (table_name,))
    
    columns = cur.fetchall()
    for col in columns:
        nullable = "NULL" if col[2] == "YES" else "NOT NULL"
        default = f" DEFAULT {col[3]}" if col[3] else ""
        print(f"  {col[0]}: {col[1]} {nullable}{default}")

cur.close()
conn.close()
