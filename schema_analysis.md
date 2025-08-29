# 🔍 데이터베이스 스키마 불일치 분석 보고서

## 📋 개요

각 서비스와 프론트엔드 간의 데이터베이스 스키마 불일치를 분석한 결과입니다. 현재 데이터베이스 스키마와 각 서비스의 모델, 프론트엔드 타입 정의 간의 차이점을 정리했습니다.

## 🗄️ 현재 데이터베이스 스키마 (기준)

### 핵심 테이블 구조
```sql
-- install (사업장)
id SERIAL PRIMARY KEY
name TEXT NOT NULL
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

-- product (제품)
id SERIAL PRIMARY KEY
install_id INT NOT NULL REFERENCES install(id) ON DELETE CASCADE
product_name TEXT NOT NULL
product_category TEXT NOT NULL CHECK (product_category IN ('단순제품', '복합제품'))
prostart_period DATE NOT NULL
proend_period DATE NOT NULL
product_cncode TEXT
goods_name TEXT
aggrgoods_name TEXT
product_amount FLOAT NOT NULL
product_sell FLOAT
product_eusell FLOAT
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

-- process (공정)
id SERIAL PRIMARY KEY
process_name TEXT NOT NULL
start_period DATE NOT NULL
end_period DATE NOT NULL
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

-- process_input (공정 투입물)
id SERIAL PRIMARY KEY
process_id INT NOT NULL REFERENCES process(id) ON DELETE CASCADE
input_type input_type_enum NOT NULL
input_name TEXT NOT NULL
amount FLOAT NOT NULL
factor FLOAT DEFAULT 1.0
oxy_factor FLOAT DEFAULT 1.0
direm_emission FLOAT
indirem_emission FLOAT
emission_factor_id INTEGER REFERENCES emission_factors(id) ON DELETE SET NULL
allocation_method allocation_method_enum DEFAULT 'direct'
allocation_ratio DECIMAL(5,4) DEFAULT 1.0
measurement_uncertainty DECIMAL(5,4)
data_quality TEXT
verification_status TEXT DEFAULT 'pending'
notes TEXT
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

## 🚨 주요 불일치 사항

### 1. **CBAM Service vs 데이터베이스 스키마**

#### ❌ Install 엔티티 불일치
```python
# CBAM Service Entity
class Install(Base):
    id = Column(Integer, primary_key=True, index=True)
    name = Column(Text, nullable=False, index=True)
    reporting_year = Column(Integer, nullable=False, default=datetime.now().year)  # ❌ 추가 필드
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

**문제점**: `reporting_year` 필드가 데이터베이스 스키마에 없음

#### ❌ Process 엔티티 불일치
```python
# CBAM Service Entity
class Process(Base):
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("product.id"), nullable=False, index=True)  # ❌ 직접 관계
    process_name = Column(Text, nullable=False, index=True)
    start_period = Column(Date, nullable=False)
    end_period = Column(Date, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

**문제점**: 
- `product_id` 필드가 데이터베이스 스키마에 없음
- 데이터베이스는 `product_process` 중간 테이블을 통한 다대다 관계

#### ❌ ProcessInput 엔티티 불일치
```python
# CBAM Service Entity
class ProcessInput(Base):
    id = Column(Integer, primary_key=True, index=True)
    process_id = Column(Integer, ForeignKey("process.id"), nullable=False, index=True)
    input_type = Column(Text, nullable=False)  # ❌ ENUM 타입이 아님
    input_name = Column(Text, nullable=False)
    amount = Column(Numeric(15, 6), nullable=False, default=0)
    factor = Column(Numeric(15, 6))
    oxy_factor = Column(Numeric(15, 6))
    direm_emission = Column(Numeric(15, 6))
    indirem_emission = Column(Numeric(15, 6))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

**문제점**:
- `input_type`이 ENUM 타입이 아닌 TEXT
- `emission_factor_id`, `allocation_method`, `allocation_ratio`, `measurement_uncertainty`, `data_quality`, `verification_status`, `notes` 필드 누락

#### ❌ Edge 엔티티 불일치
```python
# CBAM Service Entity
class Edge(Base):
    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, nullable=False, index=True)
    target_id = Column(Integer, nullable=False, index=True)
    edge_kind = Column(Text, nullable=False)  # ❌ ENUM 타입이 아님
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

**문제점**:
- `edge_kind`가 ENUM 타입이 아닌 TEXT
- `qty`, `source_type`, `target_type` 필드 누락

### 2. **Auth Service vs 데이터베이스 스키마**

#### ❌ Companies 테이블 불일치
```sql
-- Auth Service에서 생성하는 테이블
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    company_id VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    Installation VARCHAR(255) NOT NULL,  # ❌ 대문자 시작
    Installation_en VARCHAR(255),        # ❌ 대문자 시작
    economic_activity VARCHAR(255),
    economic_activity_en VARCHAR(255),
    representative VARCHAR(100),
    representative_en VARCHAR(100),
    email VARCHAR(255),
    telephone VARCHAR(50),
    street VARCHAR(255),
    street_en VARCHAR(255),
    number VARCHAR(50),
    number_en VARCHAR(50),
    postcode VARCHAR(20),
    city VARCHAR(100),
    city_en VARCHAR(100),
    country VARCHAR(100),
    country_en VARCHAR(100),
    unlocode VARCHAR(10),
    sourcelatitude DECIMAL(10, 8),      # ❌ 소문자
    sourcelongitude DECIMAL(11, 8),     # ❌ 소문자
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

**문제점**:
- `Installation`, `Installation_en` 필드명이 대문자로 시작
- `sourcelatitude`, `sourcelongitude` 필드명이 소문자
- 데이터베이스 스키마와 완전히 다른 구조

### 3. **DataGather Service vs 데이터베이스 스키마**

#### ❌ 모델 불일치
```python
# DataGather Service Models
class InputData(Base):
    __tablename__ = "input"  # ❌ 테이블명 불일치
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    type = Column(String(100))
    category = Column(String(100))
    unit = Column(String(50))
    quantity = Column(Float)
    source = Column(String(255))
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class ProcessData(Base):
    __tablename__ = "process"  # ❌ 테이블명 충돌
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    type = Column(String(100))
    energy_consumption = Column(Float)
    energy_unit = Column(String(50))
    duration_hours = Column(Float)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
```

**문제점**:
- `InputData`가 `input` 테이블을 사용하지만 데이터베이스에는 `process_input` 테이블만 존재
- `ProcessData`가 `process` 테이블을 사용하지만 데이터베이스의 `process` 테이블과 구조가 완전히 다름

### 4. **프론트엔드 vs 데이터베이스 스키마**

#### ❌ 타입 정의 불일치
```typescript
// 프론트엔드 타입 정의
interface DataPreview {
  filename: string;
  fileSize: string;
  data: any[];  // ❌ 구체적인 타입 정의 없음
  columns: string[];
}

interface AIProcessedData {
  status: string;
  message: string;
  filename: string;
  total_rows: number;
  processed_rows: number;
  data: any[];  // ❌ 구체적인 타입 정의 없음
  columns: string[];
}
```

**문제점**:
- `data` 필드가 `any[]` 타입으로 정의되어 타입 안전성 부족
- 데이터베이스 스키마와 일치하는 구체적인 타입 정의 없음

## 🛠️ 해결 방안

### 1. **CBAM Service 수정**
- `Install` 엔티티에서 `reporting_year` 필드 제거
- `Process` 엔티티에서 `product_id` 필드 제거하고 `product_process` 관계 테이블 사용
- `ProcessInput` 엔티티에 누락된 필드 추가 및 `input_type`을 ENUM 타입으로 변경
- `Edge` 엔티티에 누락된 필드 추가 및 `edge_kind`를 ENUM 타입으로 변경

### 2. **Auth Service 수정**
- `companies` 테이블 구조를 데이터베이스 스키마와 일치하도록 수정
- 필드명을 표준 네이밍 컨벤션에 맞게 수정

### 3. **DataGather Service 수정**
- 모델을 데이터베이스 스키마와 일치하도록 수정
- 테이블명 충돌 해결
- 올바른 테이블 구조에 맞는 모델 정의

### 4. **프론트엔드 타입 정의 수정**
- 데이터베이스 스키마와 일치하는 구체적인 타입 정의 생성
- `any[]` 타입을 구체적인 인터페이스로 대체

### 5. **통합 스키마 관리**
- 모든 서비스가 동일한 데이터베이스 스키마를 참조하도록 통일
- 스키마 변경 시 모든 서비스에 동기화
- 마이그레이션 스크립트 작성 및 관리

## 📊 우선순위

1. **높음**: CBAM Service - 핵심 비즈니스 로직에 영향
2. **중간**: DataGather Service - 데이터 처리에 영향
3. **낮음**: Auth Service - 인증 로직에만 영향
4. **낮음**: 프론트엔드 - 타입 안전성 개선

## 🔄 다음 단계

1. 각 서비스별로 수정 계획 수립
2. 단계별 마이그레이션 실행
3. 테스트 및 검증
4. 문서 업데이트
