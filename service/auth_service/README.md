# Auth Service

인증 서비스 - 기업 및 사용자 관리

## 주요 기능

- 사용자 인증 및 권한 관리
- 기업 정보 관리
- 스트림 데이터 관리
- **국가 정보 검색 및 관리 (신규)**

## 국가 검색 기능

### 데이터베이스 스키마

`countries` 테이블에 다음 필드들이 포함됩니다:

- `id`: 기본 키
- `code`: 국가 코드 (예: KR, US, JP)
- `country_name`: 영문 국가명
- `korean_name`: 한국어 국가명
- `unlocode`: UNLOCODE (선택사항)
- `created_at`, `updated_at`: 타임스탬프

### API 엔드포인트

#### 국가 검색
```
GET /api/v1/countries/search?query={검색어}&limit={결과수}
```

#### 국가 코드로 조회
```
GET /api/v1/countries/code/{국가코드}
```

#### UNLOCODE로 조회
```
GET /api/v1/countries/unlocode/{unlocode}
```

#### 전체 국가 목록
```
GET /api/v1/countries?limit={조회수}
```

### 사용 예시

#### 백엔드 (Python)
```python
from app.domain.services.country_service import CountryService

# 국가 검색
country_service = CountryService(db)
countries = country_service.search_countries("한국")

# 코드로 국가 조회
country = country_service.get_country_by_code("KR")

# UNLOCODE로 국가 조회
country = country_service.get_country_by_unlocode("KR")
```

#### 프론트엔드 (React)
```tsx
import { CountryInputWithSearch } from '../components/CountrySearchButton';

function AddressForm() {
  const [countryName, setCountryName] = useState('');
  
  const handleCountrySelect = (country) => {
    setCountryName(country.korean_name);
    // 다른 필드들도 자동으로 설정
    setCountryCode(country.code);
    setUnlocode(country.unlocode);
  };

  return (
    <CountryInputWithSearch
      value={countryName}
      onChange={setCountryName}
      onCountrySelect={handleCountrySelect}
      label="국가명"
      required
    />
  );
}
```

## 설치 및 실행

### 1. 의존성 설치
```bash
pip install -r requirements.txt
```

### 2. 환경 변수 설정
```bash
cp env.example .env
# .env 파일을 편집하여 데이터베이스 연결 정보 설정
```

### 3. 데이터베이스 마이그레이션
```bash
python -m app.main
```

### 4. 국가 데이터 로드
```bash
python load_country_data_railway.py
```

### 5. 서비스 실행
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## 개발 환경

- Python 3.8+
- FastAPI
- SQLAlchemy
- PostgreSQL (Railway)

## API 문서

서비스 실행 후 다음 URL에서 API 문서를 확인할 수 있습니다:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
