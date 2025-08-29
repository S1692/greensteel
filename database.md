# 🗄️ CBAM/LCA 데이터베이스 스키마 문서

이 파일은 backend 및 db의 사항을 종합하고 커서에게 명령을 내리기 위한 파일입니다.

## 📋 현재 데이터베이스 구조

### 1. install 테이블 (사업장)
```sql
CREATE TABLE install (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. product 테이블 (제품)
```sql
CREATE TABLE product (
    id SERIAL PRIMARY KEY,
    install_id INT NOT NULL REFERENCES install(id) ON DELETE CASCADE,
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. process 테이블 (공정)
```sql
CREATE TABLE process (
    id SERIAL PRIMARY KEY,
    process_name TEXT NOT NULL,
    start_period DATE NOT NULL,
    end_period DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. product_process 테이블 (제품-공정 다대다 관계)
```sql
CREATE TABLE product_process (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES product(id) ON DELETE CASCADE,
    process_id INTEGER NOT NULL REFERENCES process(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, process_id)
);
```

### 5. process_input 테이블 (공정 투입물)
```sql
-- ENUM 타입 정의
CREATE TYPE input_type_enum AS ENUM ('material', 'fuel', 'electricity');
CREATE TYPE allocation_method_enum AS ENUM ('direct', 'proportional', 'time_based', 'mass_based', 'energy_based');

CREATE TABLE process_input (
    id SERIAL PRIMARY KEY,
    process_id INT NOT NULL REFERENCES process(id) ON DELETE CASCADE,
    input_type input_type_enum NOT NULL,
    input_name TEXT NOT NULL,
    amount FLOAT NOT NULL, -- input_amount에서 amount로 통일
    factor FLOAT DEFAULT 1.0,
    oxy_factor FLOAT DEFAULT 1.0,
    direm_emission FLOAT, -- direm에서 direm_emission으로 명확화
    indirem_emission FLOAT, -- indirem에서 indirem_emission으로 명확화
    emission_factor_id INTEGER REFERENCES emission_factors(id) ON DELETE SET NULL,
    allocation_method allocation_method_enum DEFAULT 'direct',
    allocation_ratio DECIMAL(5,4) DEFAULT 1.0,
    measurement_uncertainty DECIMAL(5,4),
    data_quality TEXT,
    verification_status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 6. edge 테이블 (노드 간 연결)
```sql
-- ENUM 타입 정의
CREATE TYPE edge_kind_enum AS ENUM ('consume', 'produce', 'continue');

CREATE TABLE edge (
    id SERIAL PRIMARY KEY,
    source_id INT NOT NULL,
    target_id INT NOT NULL,
    edge_kind edge_kind_enum NOT NULL,
    qty FLOAT,
    source_type TEXT NOT NULL CHECK (source_type IN ('product', 'process')), -- 소스 타입 명시
    target_type TEXT NOT NULL CHECK (target_type IN ('product', 'process')), -- 타겟 타입 명시
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 7. emission_factors 테이블 (배출계수)
```sql
-- ENUM 타입 정의
CREATE TYPE factor_type_enum AS ENUM ('direct', 'indirect', 'precursor');

CREATE TABLE emission_factors (
    id SERIAL PRIMARY KEY,
    factor_type factor_type_enum NOT NULL,
    material_name TEXT NOT NULL,
    emission_factor NUMERIC NOT NULL,
    unit TEXT NOT NULL,
    source TEXT,
    valid_from DATE,
    valid_to DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 8. emission_attribution 테이블 (배출량 배분)
```sql
-- ENUM 타입 정의
CREATE TYPE emission_type_enum AS ENUM ('direct', 'indirect', 'precursor');
CREATE TYPE attribution_method_enum AS ENUM ('activity', 'economic', 'physical');

CREATE TABLE emission_attribution (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES product(id) ON DELETE CASCADE,
    process_id INTEGER REFERENCES process(id) ON DELETE CASCADE,
    emission_type emission_type_enum NOT NULL,
    emission_amount NUMERIC NOT NULL,
    attribution_method attribution_method_enum NOT NULL,
    allocation_ratio NUMERIC,
    calculation_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 9. product_emissions 테이블 (제품별 배출량)
```sql
CREATE TABLE product_emissions (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES product(id) ON DELETE CASCADE,
    direct_emission NUMERIC NOT NULL,
    indirect_emission NUMERIC NOT NULL,
    precursor_emission NUMERIC NOT NULL,
    total_emission NUMERIC NOT NULL,
    emission_intensity NUMERIC,
    calculation_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id)
);
```

### 10. cbam_declaration 테이블 (CBAM 신고)
```sql
CREATE TABLE cbam_declaration (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES product(id) ON DELETE CASCADE,
    declaration_period TEXT NOT NULL,
    total_emission NUMERIC NOT NULL,
    embedded_emission NUMERIC NOT NULL,
    carbon_price NUMERIC,
    declaration_status TEXT DEFAULT 'pending',
    submitted_at TIMESTAMP,
    approved_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 11. companies 테이블 (회사 정보)
```sql
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    company_name TEXT NOT NULL,
    business_number TEXT UNIQUE,
    address TEXT,
    installation TEXT,
    source_latitude DECIMAL(10, 8),
    source_longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 12. users 테이블 (사용자 정보)
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔄 DataGather Service 테이블들

### 13. datagather_process 테이블 (데이터 수집용 공정)
```sql
CREATE TABLE datagather_process (
    id SERIAL PRIMARY KEY,
    process_name TEXT NOT NULL,
    process_description TEXT,
    process_type TEXT,
    process_stage TEXT,
    process_efficiency NUMERIC,
    source_file TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 14. datagather_transport 테이블 (운송 데이터)
```sql
CREATE TABLE datagather_transport (
    id SERIAL PRIMARY KEY,
    transport_date DATE,
    departure_location TEXT,
    arrival_location TEXT,
    transport_mode TEXT,
    transport_distance NUMERIC,
    transport_cost NUMERIC,
    transport_volume NUMERIC,
    unit TEXT,
    source_file TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 15. datagather_input 테이블 (입력 데이터)
```sql
CREATE TABLE datagather_input (
    id SERIAL PRIMARY KEY,
    lot_number TEXT,
    product_name TEXT,
    production_quantity NUMERIC,
    input_date DATE,
    end_date DATE,
    process_name TEXT,
    input_material TEXT,
    quantity NUMERIC,
    unit TEXT,
    ai_recommendation TEXT,
    source_file TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 16. datagather_output 테이블 (출력 데이터)
```sql
CREATE TABLE datagather_output (
    id SERIAL PRIMARY KEY,
    output_name TEXT,
    output_type TEXT,
    output_quantity NUMERIC,
    unit TEXT,
    quality_grade TEXT,
    source_file TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 17. datagather_performance 테이블 (성과 데이터)
```sql
CREATE TABLE datagather_performance (
    id SERIAL PRIMARY KEY,
    process_name TEXT,
    production_amount NUMERIC,
    unit TEXT,
    efficiency_rate NUMERIC,
    quality_score NUMERIC,
    source_file TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔗 테이블 관계도

```
install (사업장)
    ↓ (1:N)
product (제품)
    ↓ (N:M via product_process)
process (공정)
    ↓ (1:N)
process_input (공정 투입물)
    ↓ (N:1)
emission_factors (배출계수)

edge (노드 간 연결)
    ↓ (참조)
product/process (소스/타겟)

emission_attribution (배출량 귀속)
    ↓ (N:1)
product, process

product_emissions (제품별 총 배출량)
    ↓ (1:1)
product

cbam_declaration (CBAM 신고)
    ↓ (N:1)
product
```

## 📊 주요 인덱스

```sql
-- product 테이블
CREATE INDEX idx_product_name ON product(product_name);
CREATE INDEX idx_product_install_id ON product(install_id);
CREATE INDEX idx_product_category ON product(product_category);

-- process 테이블
CREATE INDEX idx_process_name ON process(process_name);
CREATE INDEX idx_process_period ON process(start_period, end_period);

-- product_process 테이블
CREATE INDEX idx_product_process_product_id ON product_process(product_id);
CREATE INDEX idx_product_process_process_id ON product_process(process_id);
CREATE UNIQUE INDEX idx_product_process_unique ON product_process(product_id, process_id);

-- process_input 테이블
CREATE INDEX idx_process_input_process_id ON process_input(process_id);
CREATE INDEX idx_process_input_type ON process_input(input_type);
CREATE INDEX idx_process_input_name ON process_input(input_name);
CREATE INDEX idx_process_input_factor_id ON process_input(emission_factor_id);
CREATE INDEX idx_process_input_allocation ON process_input(allocation_method);
CREATE INDEX idx_process_input_verification ON process_input(verification_status);

-- edge 테이블
CREATE INDEX idx_edge_source ON edge(source_id, source_type);
CREATE INDEX idx_edge_target ON edge(target_id, target_type);
CREATE INDEX idx_edge_kind ON edge(edge_kind);

-- emission_factors 테이블
CREATE INDEX idx_emission_factors_type ON emission_factors(factor_type);
CREATE INDEX idx_emission_factors_material ON emission_factors(material_name);
CREATE INDEX idx_emission_factors_validity ON emission_factors(valid_from, valid_to);

-- emission_attribution 테이블
CREATE INDEX idx_emission_attribution_product ON emission_attribution(product_id);
CREATE INDEX idx_emission_attribution_process ON emission_attribution(process_id);
CREATE INDEX idx_emission_attribution_type ON emission_attribution(emission_type);

-- product_emissions 테이블
CREATE UNIQUE INDEX idx_product_emissions_unique ON product_emissions(product_id);

-- cbam_declaration 테이블
CREATE INDEX idx_cbam_declaration_product ON cbam_declaration(product_id);
CREATE INDEX idx_cbam_declaration_period ON cbam_declaration(declaration_period);
CREATE INDEX idx_cbam_declaration_status ON cbam_declaration(declaration_status);
```

## 🎯 설계 원칙

### 1. 마스터 데이터 기반 설계
- **사업장 기준정보(마스터층)**: 사업장 단위로 생산하는 제품(Product) 목록을 먼저 등록
- **제품별 공정 정의**: 각 제품별로 생산에 필요한 공정(Process)을 미리 연결
- **산정경계 제한**: 사용자가 특정 사업장에서 노드를 추가할 때는 해당 사업장에 등록된 제품/공정만 선택 가능

### 2. 데이터 무결성 보장
- **외래키 제약조건**: 모든 관계에 적절한 외래키 제약조건 설정
- **체크 제약조건**: ENUM 타입과 CHECK 제약조건으로 데이터 유효성 검증
- **UNIQUE 제약조건**: 중복 데이터 방지를 위한 고유성 제약조건
- **CASCADE/SET NULL**: 적절한 참조 무결성 정책 적용

### 3. CBAM 규정 준수
- **배출계수 기반 계산 시스템**: emission_factors 테이블을 통한 체계적 관리
- **직접/간접/전구체 배출량 구분**: emission_type_enum으로 명확한 구분
- **다양한 배분 방법 지원**: allocation_method_enum으로 배분 방법 표준화
- **측정 불확실성 및 데이터 품질 관리**: process_input 테이블의 메타데이터 컬럼들

### 4. 확장성 고려
- **메타데이터 컬럼**: 모든 테이블에 created_at, updated_at 컬럼 추가
- **상태 관리**: declaration_status 등 상태 추적을 위한 컬럼들
- **유연한 관계**: product_process 테이블을 통한 다대다 관계 지원

## 🔧 최근 주요 변경사항

1. **컬럼명 통일**: `input_amount` → `amount`, `direm` → `direm_emission` 등
2. **ENUM 타입 정의**: `allocation_method_enum` 등 누락된 타입 정의 추가
3. **외래키 제약조건**: 모든 관계에 적절한 참조 무결성 정책 적용
4. **CBAM 신고 테이블**: CBAM 규정 준수를 위한 신고 관리 테이블 추가
5. **인덱스 최적화**: 쿼리 성능 향상을 위한 전략적 인덱스 설계

## 📝 커서 명령어 예시

### 새로운 테이블 생성 시
```
커서야, [테이블명] 테이블을 만들어줘.
다음 컬럼들이 필요해:
- [컬럼명]: [데이터타입] [제약조건]
- [외래키]: [참조테이블]([참조컬럼])
```

### 기존 테이블 수정 시
```
커서야, [테이블명] 테이블에 [컬럼명] 컬럼을 추가해줘.
- 데이터타입: [타입]
- 제약조건: [조건]
```

### 인덱스 생성 시
```
커서야, [테이블명] 테이블에 [컬럼명] 컬럼에 대한 인덱스를 생성해줘.
```