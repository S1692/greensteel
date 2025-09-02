# 데이터 업로드 스키마 업데이트 문서

## 개요
기존 데이터 업로드 시스템을 새로운 스키마에 맞게 업데이트했습니다. 템플릿 엑셀 파일의 칼럼 구조를 기반으로 데이터베이스 테이블과 프론트엔드 검증 로직을 개선했습니다.

## 주요 변경사항

### 1. 데이터 타입 개선
- **수량 필드**: `string | number` → `number` (소수점 허용)
- **날짜 필드**: `string | number` → `string` (YYYY-MM-DD 형식)
- **텍스트 필드**: 최대 길이 제한을 20자에서 50자로 확장

### 2. 새로운 데이터베이스 스키마

#### Input Data (투입물 데이터)
```sql
CREATE TABLE input_data (
    id SERIAL PRIMARY KEY,
    로트번호 VARCHAR(50) NOT NULL,
    생산품명 VARCHAR(100) NOT NULL,
    생산수량 DECIMAL(15,3) NOT NULL CHECK (생산수량 > 0),
    투입일 DATE,
    종료일 DATE,
    공정 VARCHAR(100) NOT NULL,
    투입물명 VARCHAR(200) NOT NULL,
    수량 DECIMAL(15,3) NOT NULL CHECK (수량 > 0),
    단위 VARCHAR(20) NOT NULL DEFAULT 't',
    AI추천답변 TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Output Data (산출물 데이터)
```sql
CREATE TABLE output_data (
    id SERIAL PRIMARY KEY,
    로트번호 VARCHAR(50) NOT NULL,
    생산품명 VARCHAR(100) NOT NULL,
    생산수량 DECIMAL(15,3) NOT NULL CHECK (생산수량 > 0),
    투입일 DATE,
    종료일 DATE,
    공정 VARCHAR(100) NOT NULL,
    산출물명 VARCHAR(200) NOT NULL,
    수량 DECIMAL(15,3) NOT NULL CHECK (수량 > 0),
    단위 VARCHAR(20) NOT NULL DEFAULT 't',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Transport Data (운송 데이터)
```sql
CREATE TABLE transport_data (
    id SERIAL PRIMARY KEY,
    생산품명 VARCHAR(100) NOT NULL,
    로트번호 VARCHAR(50) NOT NULL,
    운송물질 VARCHAR(200) NOT NULL,
    운송수량 DECIMAL(15,3) NOT NULL CHECK (운송수량 > 0),
    운송일자 DATE,
    도착공정 VARCHAR(100) NOT NULL,
    출발지 VARCHAR(200) NOT NULL,
    이동수단 VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Process Data (공정 데이터)
```sql
CREATE TABLE process_data (
    id SERIAL PRIMARY KEY,
    공정명 VARCHAR(100) NOT NULL,
    공정설명 TEXT,
    공정유형 VARCHAR(100) NOT NULL,
    공정단계 VARCHAR(100) NOT NULL,
    공정효율 DECIMAL(5,2) CHECK (공정효율 >= 0 AND 공정효율 <= 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. 프론트엔드 검증 로직 개선

#### 데이터 타입 검증
- **수량 필드**: 0보다 큰 숫자만 허용
- **날짜 필드**: YYYY-MM-DD 형식 검증
- **텍스트 필드**: 50자 이하 제한

#### 실시간 오류 표시
- 행별 오류 상태 관리
- 필드별 유효성 검사 결과 표시
- 사용자 친화적인 오류 메시지

### 4. 템플릿 파일 구조

#### 실적_데이터_인풋.xlsx
- 로트번호, 생산품명, 생산수량, 투입일, 종료일, 공정, 투입물명, 수량, 단위, AI추천답변

#### 실적_데이터_아웃풋.xlsx
- 로트번호, 생산품명, 생산수량, 투입일, 종료일, 공정, 산출물명, 수량, 단위

#### 실적_데이터_운송정보.xlsx
- 생산품명, 로트번호, 운송물질, 운송수량, 운송일자, 도착공정, 출발지, 이동수단

#### 실적_데이터_공정정보.xlsx
- 공정명, 공정설명, 공정유형, 공정단계, 공정효율

## 적용 방법

### 1. 데이터베이스 업데이트
```bash
# PostgreSQL에 연결하여 새로운 테이블 생성
psql -U username -d database_name -f create_new_tables.sql
```

### 2. 프론트엔드 업데이트
- 기존 코드는 이미 새로운 스키마에 맞게 수정됨
- 타입 정의가 `src/lib/types.ts`에 추가됨

### 3. 기존 데이터 마이그레이션 (필요시)
- 기존 테이블의 데이터를 새로운 스키마에 맞게 변환
- 데이터 타입 검증 및 정리

## 장점

1. **데이터 무결성 향상**: CHECK 제약조건으로 데이터 유효성 보장
2. **성능 개선**: 적절한 인덱스와 데이터 타입으로 쿼리 성능 향상
3. **사용자 경험 개선**: 실시간 검증과 명확한 오류 메시지
4. **확장성**: 새로운 필드 추가가 용이한 구조

## 주의사항

1. **기존 데이터**: 기존 테이블을 삭제하므로 데이터 백업 필요
2. **API 호환성**: 백엔드 API도 새로운 스키마에 맞게 수정 필요
3. **데이터 검증**: 업로드된 데이터의 타입 변환 및 검증 로직 확인

## 다음 단계

1. 백엔드 API 업데이트
2. 데이터 마이그레이션 스크립트 작성
3. 테스트 데이터 생성 및 검증
4. 사용자 교육 및 문서화
