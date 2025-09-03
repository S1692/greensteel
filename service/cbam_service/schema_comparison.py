import psycopg2

# PostgreSQL 연결
conn = psycopg2.connect('postgresql://postgres:lUAkUKpUxubYDvmqzGKxJLKgZCWMjaQy@switchyard.proxy.rlwy.net:51947/railway')
cur = conn.cursor()

# database.md에서 정의된 주요 테이블들
expected_tables = {
    'install': {
        'columns': ['id', 'name', 'created_at', 'updated_at'],
        'types': ['integer', 'text', 'timestamp', 'timestamp']
    },
    'product': {
        'columns': ['id', 'install_id', 'product_name', 'product_category', 'prostart_period', 'proend_period', 'product_cncode', 'goods_name', 'aggrgoods_name', 'product_amount', 'product_sell', 'product_eusell', 'created_at', 'updated_at'],
        'types': ['integer', 'integer', 'text', 'text', 'date', 'date', 'text', 'text', 'text', 'float', 'float', 'float', 'timestamp', 'timestamp']
    },
    'process': {
        'columns': ['id', 'process_name', 'start_period', 'end_period', 'created_at', 'updated_at'],
        'types': ['integer', 'text', 'date', 'date', 'timestamp', 'timestamp']
    },
    'hs_cn_mapping': {
        'columns': ['id', 'hscode', 'aggregoods_name', 'aggregoods_engname', 'cncode_total', 'goods_name', 'goods_engname'],
        'types': ['integer', 'character varying', 'text', 'text', 'character varying', 'text', 'text']
    }
}

print("=== database.md vs 실제 PostgreSQL 테이블 구조 비교 ===\n")

for table_name, expected in expected_tables.items():
    print(f"🔍 {table_name.upper()} 테이블 분석")
    print("-" * 50)
    
    # 실제 테이블 컬럼 정보 조회
    cur.execute("""
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = %s 
        ORDER BY ordinal_position;
    """, (table_name,))
    
    actual_columns = cur.fetchall()
    
    if not actual_columns:
        print(f"❌ {table_name} 테이블이 존재하지 않습니다.")
        continue
    
    # database.md에서 예상한 컬럼들
    expected_cols = set(expected['columns'])
    # 실제 DB의 컬럼들
    actual_cols = set([col[0] for col in actual_columns])
    
    print(f"📋 database.md 예상 컬럼: {sorted(expected_cols)}")
    print(f"🗄️ 실제 DB 컬럼: {sorted(actual_cols)}")
    
    # 차이점 분석
    missing_in_db = expected_cols - actual_cols
    extra_in_db = actual_cols - expected_cols
    
    if missing_in_db:
        print(f"❌ DB에 없는 컬럼: {sorted(missing_in_db)}")
    
    if extra_in_db:
        print(f"➕ DB에만 있는 컬럼: {sorted(extra_in_db)}")
    
    if not missing_in_db and not extra_in_db:
        print("✅ 컬럼 구조가 일치합니다!")
    
    # 상세 컬럼 정보
    print(f"\n📊 실제 컬럼 상세 정보:")
    for col in actual_columns:
        nullable = "NULL" if col[2] == "YES" else "NOT NULL"
        default = f" DEFAULT {col[3]}" if col[3] else ""
        print(f"  - {col[0]}: {col[1]} {nullable}{default}")
    
    print("\n" + "="*60 + "\n")

cur.close()
conn.close()
