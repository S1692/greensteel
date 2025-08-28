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
    product_id INTEGER NOT NULL,
    process_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, process_id),
    FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE,
    FOREIGN KEY (process_id) REFERENCES process(id) ON DELETE CASCADE
);
```

### 5. process_input 테이블 (공정 투입물)
```sql
-- ENUM 타입 정의
CREATE TYPE input_type_enum AS ENUM ('material', 'fuel', 'electricity');

CREATE TABLE process_input (
    id SERIAL PRIMARY KEY,
    process_id INT NOT NULL REFERENCES process(id),
    input_type input_type_enum NOT NULL,
    input_name TEXT NOT NULL,
    input_amount FLOAT NOT NULL,
    factor FLOAT DEFAULT 1.0,
    oxy_factor FLOAT DEFAULT 1.0,
    direm FLOAT,
    indirem FLOAT,
    emission_factor_id INTEGER REFERENCES emission_factors(id),
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 7. emission_factors 테이블 (배출계수)
```sql
-- ENUM 타입 정의
CREATE TYPE factor_type_enum AS ENUM ('fuel', 'electricity', 'process', 'precursor');

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
```

### 8. emission_attribution 테이블 (배출량 귀속)
```sql
-- ENUM 타입 정의
CREATE TYPE emission_type_enum AS ENUM ('direct', 'indirect', 'precursor');
CREATE TYPE allocation_method_enum AS ENUM ('direct', 'proportional', 'time_based', 'mass_based', 'energy_based');

CREATE TABLE emission_attribution (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES product(id) ON DELETE CASCADE,
    process_id INTEGER REFERENCES process(id) ON DELETE CASCADE,
    emission_type emission_type_enum NOT NULL,
    emission_amount DECIMAL(15,6) NOT NULL DEFAULT 0,
    attribution_method allocation_method_enum NOT NULL,
    allocation_ratio DECIMAL(5,4) DEFAULT 1.0,
    calculation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 9. product_emissions 테이블 (제품별 총 배출량)
```sql
CREATE TABLE product_emissions (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES product(id) ON DELETE CASCADE,
    direct_emission DECIMAL(15,6) NOT NULL DEFAULT 0,
    indirect_emission DECIMAL(15,6) NOT NULL DEFAULT 0,
    precursor_emission DECIMAL(15,6) NOT NULL DEFAULT 0,
    total_emission DECIMAL(15,6) NOT NULL DEFAULT 0,
    emission_intensity DECIMAL(15,6), -- tCO2/ton
    calculation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
```

## 📊 주요 인덱스

```sql
-- product 테이블
CREATE INDEX idx_product_name ON product(product_name);
CREATE INDEX idx_product_install_id ON product(install_id);

-- process 테이블
CREATE INDEX idx_process_name ON process(process_name);

-- product_process 테이블
CREATE INDEX idx_product_process_product_id ON product_process(product_id);
CREATE INDEX idx_product_process_process_id ON product_process(process_id);

-- process_input 테이블
CREATE INDEX idx_process_input_process_id ON process_input(process_id);
CREATE INDEX idx_process_input_factor_id ON process_input(emission_factor_id);
CREATE INDEX idx_process_input_allocation ON process_input(allocation_method);
CREATE INDEX idx_process_input_verification ON process_input(verification_status);

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
```

## 🎯 설계 원칙

### 1. 마스터 데이터 기반 설계
- **사업장 기준정보(마스터층)**: 사업장 단위로 생산하는 제품(Product) 목록을 먼저 등록
- **제품별 공정 정의**: 각 제품별로 생산에 필요한 공정(Process)을 미리 연결
- **산정경계 제한**: 사용자가 특정 사업장에서 노드를 추가할 때는 해당 사업장에 등록된 제품/공정만 선택 가능

### 2. 데이터 무결성 보장
- 다른 사업장에서 쓰지 않는 제품·공정은 선택할 수 없어 데이터 무결성 보장
- 각 사업장별로 생산 체계가 다르더라도, 미리 설정된 틀 안에서만 노드/엣지를 추가

### 3. CBAM 규정 준수
- 배출계수 기반 계산 시스템
- 직접/간접/전구체 배출량 구분
- 다양한 배분 방법 지원 (직접, 비례, 시간, 질량, 에너지 기반)
- 측정 불확실성 및 데이터 품질 관리

## 🔧 최근 주요 변경사항

1. **다대다 관계 도입**: product와 process 간의 관계를 product_process 중간 테이블로 변경
2. **배출계수 시스템**: emission_factors 테이블을 통한 체계적인 배출계수 관리
3. **배출량 귀속 시스템**: emission_attribution과 product_emissions 테이블을 통한 정밀한 배출량 계산
4. **메타데이터 추가**: 모든 테이블에 created_at, updated_at 컬럼 추가
5. **확장된 process_input**: CBAM 규정에 맞는 추가 컬럼들 (배분방법, 측정불확실성 등)

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