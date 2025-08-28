#!/usr/bin/env python3
"""
모든 테이블을 삭제하고 CBAM 스키마와 기존 테이블을 모두 재생성하는 스크립트
"""

import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def main():
    print("🚀 모든 테이블 재생성 시작...")
    
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
        # 1. 모든 테이블 삭제
        print("\n🗑️ 모든 테이블 삭제 중...")
        
        tables_to_drop = [
            'base', 'companies', 'edge', 'emission_attribution', 'emission_factors',
            'input', 'install', 'output', 'performance', 'process', 'process_input',
            'product', 'product_emissions', 'product_process', 'users'
        ]
        
        for table in tables_to_drop:
            try:
                cursor.execute(f"DROP TABLE IF EXISTS {table} CASCADE;")
                print(f"✅ {table} 테이블 삭제 완료")
            except Exception as e:
                print(f"⚠️ {table} 테이블 삭제 실패: {e}")
        
        # 2. ENUM 타입 재생성
        print("\n📝 ENUM 타입 재생성 중...")
        
        enums = [
            ("input_type_enum", "('material', 'fuel', 'electricity')"),
            ("edge_kind_enum", "('consume', 'produce', 'continue')"),
            ("factor_type_enum", "('fuel', 'electricity', 'process', 'precursor')"),
            ("emission_type_enum", "('direct', 'indirect', 'precursor')"),
            ("allocation_method_enum", "('direct', 'proportional', 'time_based', 'mass_based', 'energy_based')")
        ]
        
        for enum_name, enum_values in enums:
            try:
                cursor.execute(f"CREATE TYPE {enum_name} AS ENUM {enum_values};")
                print(f"✅ {enum_name} 생성 완료")
            except Exception as e:
                print(f"⚠️ {enum_name} 생성 실패: {e}")
        
        # 3. CBAM 스키마 테이블 생성
        print("\n📊 CBAM 스키마 테이블 생성 중...")
        
        # install 테이블 (사업장)
        cursor.execute("""
            CREATE TABLE install (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        print("✅ install 테이블 생성 완료")
        
        # process 테이블 (공정)
        cursor.execute("""
            CREATE TABLE process (
                id SERIAL PRIMARY KEY,
                process_name TEXT NOT NULL,
                start_period DATE NOT NULL,
                end_period DATE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        print("✅ process 테이블 생성 완료")
        
        # emission_factors 테이블 (배출계수)
        cursor.execute("""
            CREATE TABLE emission_factors (
                id SERIAL PRIMARY KEY,
                factor_type factor_type_enum NOT NULL,
                material_name TEXT NOT NULL,
                emission_factor DECIMAL(10,6) NOT NULL,
                unit TEXT NOT NULL,
                source TEXT,
                valid_from DATE DEFAULT CURRENT_DATE,
                valid_to DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        print("✅ emission_factors 테이블 생성 완료")
        
        # product 테이블 (제품)
        cursor.execute("""
            CREATE TABLE product (
                id SERIAL PRIMARY KEY,
                install_id INT NOT NULL,
                product_name TEXT NOT NULL,
                product_category TEXT NOT NULL CHECK (product_category IN ('단순제품', '복합제품')),
                prostart_period DATE NOT NULL,
                proend_period DATE NOT NULL,
                product_cncode TEXT,
                goods_name TEXT,
                aggrgoods_name TEXT,
                product_amount FLOAT NOT NULL,
                product_sell FLOAT,
                product_eusell FLOAT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (install_id) REFERENCES install(id) ON DELETE CASCADE
            );
        """)
        print("✅ product 테이블 생성 완료")
        
        # product_process 테이블 (제품-공정 다대다 관계)
        cursor.execute("""
            CREATE TABLE product_process (
                id SERIAL PRIMARY KEY,
                product_id INTEGER NOT NULL,
                process_id INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(product_id, process_id),
                FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE,
                FOREIGN KEY (process_id) REFERENCES process(id) ON DELETE CASCADE
            );
        """)
        print("✅ product_process 테이블 생성 완료")
        
        # process_input 테이블 (공정 투입물)
        cursor.execute("""
            CREATE TABLE process_input (
                id SERIAL PRIMARY KEY,
                process_id INT NOT NULL,
                input_type input_type_enum NOT NULL,
                input_name TEXT NOT NULL,
                input_amount FLOAT NOT NULL,
                factor FLOAT DEFAULT 1.0,
                oxy_factor FLOAT DEFAULT 1.0,
                direm FLOAT,
                indirem FLOAT,
                emission_factor_id INTEGER,
                allocation_method allocation_method_enum DEFAULT 'direct',
                allocation_ratio DECIMAL(5,4) DEFAULT 1.0,
                measurement_uncertainty DECIMAL(5,4),
                data_quality TEXT,
                verification_status TEXT DEFAULT 'pending',
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (process_id) REFERENCES process(id) ON DELETE CASCADE,
                FOREIGN KEY (emission_factor_id) REFERENCES emission_factors(id) ON DELETE SET NULL
            );
        """)
        print("✅ process_input 테이블 생성 완료")
        
        # edge 테이블 (노드 간 연결)
        cursor.execute("""
            CREATE TABLE edge (
                id SERIAL PRIMARY KEY,
                source_id INT NOT NULL,
                target_id INT NOT NULL,
                edge_kind edge_kind_enum NOT NULL,
                qty FLOAT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        print("✅ edge 테이블 생성 완료")
        
        # emission_attribution 테이블 (배출량 귀속)
        cursor.execute("""
            CREATE TABLE emission_attribution (
                id SERIAL PRIMARY KEY,
                product_id INTEGER,
                process_id INTEGER,
                emission_type emission_type_enum NOT NULL,
                emission_amount DECIMAL(15,6) NOT NULL DEFAULT 0,
                attribution_method allocation_method_enum NOT NULL,
                allocation_ratio DECIMAL(5,4) DEFAULT 1.0,
                calculation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE,
                FOREIGN KEY (process_id) REFERENCES process(id) ON DELETE CASCADE
            );
        """)
        print("✅ emission_attribution 테이블 생성 완료")
        
        # product_emissions 테이블 (제품별 총 배출량)
        cursor.execute("""
            CREATE TABLE product_emissions (
                id SERIAL PRIMARY KEY,
                product_id INTEGER,
                direct_emission DECIMAL(15,6) NOT NULL DEFAULT 0,
                indirect_emission DECIMAL(15,6) NOT NULL DEFAULT 0,
                precursor_emission DECIMAL(15,6) NOT NULL DEFAULT 0,
                total_emission DECIMAL(15,6) NOT NULL DEFAULT 0,
                emission_intensity DECIMAL(15,6),
                calculation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE
            );
        """)
        print("✅ product_emissions 테이블 생성 완료")
        
        # 4. 기존 테이블 생성
        print("\n📊 기존 테이블 생성 중...")
        
        # companies 테이블
        cursor.execute("""
            CREATE TABLE companies (
                id SERIAL PRIMARY KEY,
                company_id VARCHAR NOT NULL,
                password VARCHAR NOT NULL,
                installation VARCHAR NOT NULL,
                installation_en VARCHAR,
                economic_activity VARCHAR,
                economic_activity_en VARCHAR,
                representative VARCHAR,
                representative_en VARCHAR,
                email VARCHAR,
                telephone VARCHAR,
                street VARCHAR,
                street_en VARCHAR,
                number VARCHAR,
                number_en VARCHAR,
                postcode VARCHAR,
                city VARCHAR,
                city_en VARCHAR,
                country VARCHAR,
                country_en VARCHAR,
                unlocode VARCHAR,
                sourcelatitude NUMERIC,
                sourcelongitude NUMERIC,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        print("✅ companies 테이블 생성 완료")
        
        # users 테이블
        cursor.execute("""
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                username VARCHAR NOT NULL,
                email VARCHAR NOT NULL,
                password_hash VARCHAR NOT NULL,
                full_name VARCHAR,
                is_active BOOLEAN DEFAULT true,
                is_verified BOOLEAN DEFAULT false,
                role VARCHAR DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP
            );
        """)
        print("✅ users 테이블 생성 완료")
        
        # base 테이블
        cursor.execute("""
            CREATE TABLE base (
                로트번호 VARCHAR,
                생산품명 VARCHAR,
                생산수량 INTEGER,
                투입일 TIMESTAMP,
                종료일 TIMESTAMP,
                공정 VARCHAR,
                투입물명 VARCHAR,
                수량 INTEGER,
                단위 VARCHAR
            );
        """)
        print("✅ base 테이블 생성 완료")
        
        # input 테이블
        cursor.execute("""
            CREATE TABLE input (
                상태 VARCHAR,
                로트번호 VARCHAR,
                생산품명 VARCHAR,
                수집일 TIMESTAMP,
                순서 INTEGER,
                품번 VARCHAR,
                품명 VARCHAR,
                수량 INTEGER,
                지시번호 VARCHAR
            );
        """)
        print("✅ input 테이블 생성 완료")
        
        # output 테이블
        cursor.execute("""
            CREATE TABLE output (
                로트번호 VARCHAR,
                생산품명 VARCHAR,
                생산수량 INTEGER,
                투입일 TIMESTAMP,
                종료일 TIMESTAMP,
                공정 VARCHAR,
                산출물명 VARCHAR,
                수량 INTEGER,
                단위 VARCHAR
            );
        """)
        print("✅ output 테이블 생성 완료")
        
        # performance 테이블
        cursor.execute("""
            CREATE TABLE performance (
                로트번호 VARCHAR,
                생산품명 VARCHAR,
                생산수량 INTEGER,
                투입일 TIMESTAMP,
                종료일 TIMESTAMP,
                공정 VARCHAR,
                산출물명 VARCHAR,
                수량 INTEGER,
                단위 VARCHAR
            );
        """)
        print("✅ performance 테이블 생성 완료")
        
        # transport 테이블 (누락되었던 테이블)
        cursor.execute("""
            CREATE TABLE transport (
                생산품명 VARCHAR,
                로트번호 VARCHAR,
                운송_물질 VARCHAR,
                운송_수량 INTEGER,
                운송_일자 TIMESTAMP,
                도착_공정 VARCHAR,
                출발지 VARCHAR,
                이동_수단 VARCHAR
            );
        """)
        print("✅ transport 테이블 생성 완료")
        
        # 5. 인덱스 생성
        print("\n🔍 인덱스 생성 중...")
        
        indexes = [
            "CREATE INDEX idx_product_name ON product(product_name);",
            "CREATE INDEX idx_product_install_id ON product(install_id);",
            "CREATE INDEX idx_process_name ON process(process_name);",
            "CREATE INDEX idx_product_process_product_id ON product_process(product_id);",
            "CREATE INDEX idx_product_process_process_id ON product_process(process_id);",
            "CREATE INDEX idx_process_input_process_id ON process_input(process_id);",
            "CREATE INDEX idx_emission_factors_type ON emission_factors(factor_type);",
            "CREATE INDEX idx_emission_factors_material ON emission_factors(material_name);",
            "CREATE UNIQUE INDEX idx_product_emissions_unique ON product_emissions(product_id);",
            "CREATE INDEX idx_companies_company_id ON companies(company_id);",
            "CREATE INDEX idx_users_username ON users(username);",
            "CREATE INDEX idx_users_email ON users(email);"
        ]
        
        for index_sql in indexes:
            try:
                cursor.execute(index_sql)
            except Exception as e:
                print(f"⚠️ 인덱스 생성 실패: {e}")
        
        print("✅ 인덱스 생성 완료")
        
        # 6. 트리거 생성
        print("\n⚡ 트리거 생성 중...")
        
        # updated_at 자동 업데이트 함수
        cursor.execute("""
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql';
        """)
        
        # 각 테이블에 트리거 적용
        cbam_tables = ['install', 'product', 'process', 'product_process', 'process_input', 'edge', 'emission_factors', 'emission_attribution', 'product_emissions']
        
        for table in cbam_tables:
            try:
                cursor.execute(f"DROP TRIGGER IF EXISTS update_{table}_updated_at ON {table};")
                cursor.execute(f"""
                    CREATE TRIGGER update_{table}_updated_at
                        BEFORE UPDATE ON {table}
                        FOR EACH ROW
                        EXECUTE FUNCTION update_updated_at_column();
                """)
            except Exception as e:
                print(f"⚠️ {table} 트리거 생성 실패: {e}")
        
        print("✅ 트리거 생성 완료")
        
        # 7. 샘플 데이터 삽입
        print("\n📝 샘플 데이터 삽입 중...")
        
        # 샘플 사업장 추가
        cursor.execute("""
            INSERT INTO install (name) VALUES 
            ('포항제철 1공장'),
            ('포항제철 2공장'),
            ('광양제철 1공장');
        """)
        print("✅ 샘플 사업장 데이터 삽입 완료")
        
        # 샘플 제품 추가
        cursor.execute("""
            INSERT INTO product (install_id, product_name, product_category, prostart_period, proend_period, product_amount) VALUES 
            (1, '열연코일', '단순제품', '2025-01-01', '2025-12-31', 1000000),
            (1, '냉연코일', '단순제품', '2025-01-01', '2025-12-31', 800000),
            (2, '후판', '단순제품', '2025-01-01', '2025-12-31', 500000);
        """)
        print("✅ 샘플 제품 데이터 삽입 완료")
        
        # 샘플 공정 추가
        cursor.execute("""
            INSERT INTO process (process_name, start_period, end_period) VALUES 
            ('제선공정', '2025-01-01', '2025-12-31'),
            ('제강공정', '2025-01-01', '2025-12-31'),
            ('압연공정', '2025-01-01', '2025-12-31');
        """)
        print("✅ 샘플 공정 데이터 삽입 완료")
        
        # 샘플 배출계수 추가
        cursor.execute("""
            INSERT INTO emission_factors (factor_type, material_name, emission_factor, unit) VALUES 
            ('fuel', '석탄', 2.5, 'tCO2/t'),
            ('fuel', '천연가스', 2.1, 'tCO2/t'),
            ('electricity', '전력', 0.5, 'tCO2/MWh');
        """)
        print("✅ 샘플 배출계수 데이터 삽입 완료")
        
        # companies 샘플 데이터
        cursor.execute("""
            INSERT INTO companies (company_id, password, installation, installation_en, economic_activity, representative, email) VALUES 
            ('POSCO', 'hashed_password_123', '포항제철', 'Pohang Steelworks', '철강제조업', '김철수', 'posco@posco.com'),
            ('HYUNDAI_STEEL', 'hashed_password_456', '현대제철', 'Hyundai Steel', '철강제조업', '이철수', 'hyundai@hyundai.com');
        """)
        print("✅ companies 샘플 데이터 삽입 완료")
        
        # users 샘플 데이터
        cursor.execute("""
            INSERT INTO users (username, email, password_hash, full_name, role) VALUES 
            ('admin', 'admin@greensteel.com', 'hashed_admin_password', '관리자', 'admin'),
            ('user1', 'user1@greensteel.com', 'hashed_user_password', '사용자1', 'user');
        """)
        print("✅ users 샘플 데이터 삽입 완료")
        
        # 8. 생성된 테이블 확인
        print("\n📋 생성된 테이블 확인 중...")
        cursor.execute("""
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        """)
        
        tables = cursor.fetchall()
        print("생성된 테이블 목록:")
        for table in tables:
            print(f"  - {table[0]}")
        
        print(f"\n🎉 총 {len(tables)}개 테이블이 성공적으로 생성되었습니다!")
        
        # 9. 테이블 분류
        cbam_tables = ['install', 'product', 'process', 'product_process', 'process_input', 'edge', 'emission_factors', 'emission_attribution', 'product_emissions']
        existing_tables = ['companies', 'users', 'base', 'input', 'output', 'performance', 'transport']
        
        print(f"\n🔍 테이블 분류:")
        print(f"CBAM 스키마 테이블: {len(cbam_tables)}개")
        print(f"기존 테이블: {len(existing_tables)}개")
        print(f"총 테이블: {len(tables)}개")
        
        print("\n🎉 모든 테이블 재생성이 완료되었습니다!")
        
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        conn.rollback()
    
    finally:
        cursor.close()
        conn.close()
        print("🔌 데이터베이스 연결 종료")

if __name__ == "__main__":
    main()
