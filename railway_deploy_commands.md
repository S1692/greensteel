# Railway에서 국가 데이터 로드 방법

## 방법 1: Railway CLI 사용 (권장)

### 1. Railway CLI 설치
```bash
npm install -g @railway/cli
```

### 2. Railway 로그인
```bash
railway login
```

### 3. 프로젝트 연결
```bash
railway link
```

### 4. 환경변수 설정 (DATABASE_URL이 이미 설정되어 있다면 생략)
```bash
railway variables set DATABASE_URL="your_railway_postgresql_url"
```

### 5. 국가 데이터 로드 실행
```bash
railway run python service/auth_service/load_country_data_railway.py
```

## 방법 2: Railway 대시보드에서 직접 실행

### 1. Railway 대시보드 접속
- https://railway.app/dashboard

### 2. 프로젝트 선택

### 3. Deployments 탭에서 "Deploy" 클릭

### 4. 환경변수에 DATABASE_URL이 설정되어 있는지 확인

### 5. 배포 후 서비스 로그에서 데이터 로드 확인

## 방법 3: 서비스 시작 시 자동 로드

### 1. main.py에 데이터 로드 로직 추가
```python
# service/auth_service/app/main.py
from load_country_data_railway import load_country_data_railway

@app.on_event("startup")
async def startup_event():
    # 기존 코드...
    
    # 국가 데이터 자동 로드
    try:
        load_country_data_railway()
    except Exception as e:
        logger.warning(f"국가 데이터 자동 로드 실패: {e}")
```

## 확인 방법

### 1. Railway 대시보드에서 로그 확인
- Deployments → 최신 배포 → Logs

### 2. DB 직접 확인
```bash
railway run python -c "
from app.common.db import get_db
from app.domain.entities.country import Country
db = next(get_db())
count = db.query(Country).count()
print(f'국가 데이터 개수: {count}')
sample = db.query(Country).limit(3).all()
for c in sample:
    print(f'{c.code}: {c.country_name} ({c.korean_name})')
"
```

## 주의사항

1. **DATABASE_URL 환경변수**가 Railway에 설정되어 있어야 합니다.
2. **pandas, openpyxl** 패키지가 requirements.txt에 포함되어 있어야 합니다.
3. **엑셀 파일**이 프로젝트 루트에 있어야 합니다.
4. **기존 데이터**가 있다면 삭제 후 새로 로드됩니다.

## 예상 결과

```
국가 코드 데이터 로더 (Railway) 시작...
✅ Railway DB 연결: postgresql://...
엑셀 컬럼: ['code', 'country name', '한국이름']
데이터 개수: 266
진행상황: 50/266
진행상황: 100/266
진행상황: 150/266
진행상황: 200/266
진행상황: 250/266
국가 데이터 로드 완료:
  - 성공: 265개
  - 오류: 0개
  - DB 총 개수: 265개

샘플 데이터:
  HK: Hong Kong (홍콩)
  XO: Australian Oceania (호주 오세아니아)
  HU: Hungary (헝가리)
  HM: Heard Island and McDonald Islands (허드 맥도널드 제도)
  PN: Pitcairn (핏케언)
✅ 국가 데이터 로드 완료!
```
