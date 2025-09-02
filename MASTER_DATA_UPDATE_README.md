# 🗄️ 마스터 데이터 업데이트 가이드

이 가이드는 `masterdb/` 폴더의 엑셀 파일 데이터를 데이터베이스에 반영하는 방법을 설명합니다.

## 📋 업데이트 대상 테이블

1. **fuel_master** - 연료 마스터 데이터
2. **material_master** - 원재료 마스터 데이터  
3. **hs_cn_mapping** - HS-CN 코드 매핑 데이터

## 🚀 사용 방법

### 1단계: 환경 설정

데이터베이스 연결 정보를 환경 변수로 설정하세요:

```bash
# Windows PowerShell
$env:DATABASE_URL="postgresql://username:password@localhost:5432/dbname"

# Windows CMD
set DATABASE_URL=postgresql://username:password@localhost:5432/dbname

# Linux/Mac
export DATABASE_URL="postgresql://username:password@localhost:5432/dbname"
```

### 2단계: 테이블 생성

기존 테이블을 삭제하고 새로운 테이블을 생성합니다:

```bash
cd greensteel
python create_master_tables.py
```

### 3단계: 데이터 업데이트

엑셀 파일의 데이터를 데이터베이스에 반영합니다:

```bash
python update_master_data.py
```

## 📊 엑셀 파일 구조

### fuel_master.xlsx
- `fuel_name`: 연료명 (한글)
- `fuel_engname`: 연료명 (영문)
- `fuel_factor`: 연료 배출계수
- `net_calory`: 순발열량

### material_master.xlsx
- `mat_name`: 원재료명 (한글)
- `mat_engname`: 원재료명 (영문)
- `carbon_content`: 탄소 함량
- `mat_factor`: 원재료 배출계수

### hs_cn_mapping.xlsx
- `hscode`: HS 코드 (6자리)
- `aggregoods_name`: 제품 대분류 (한글)
- `aggregoods_engname`: 제품 대분류 (영문)
- `cncode_total`: CN 코드 (8자리)
- `goods_name`: 상세 품명 (한글)
- `goods_engname`: 상세 품명 (영문)

## 🔧 문제 해결

### 데이터베이스 연결 실패
- 데이터베이스가 실행 중인지 확인
- 연결 정보가 올바른지 확인
- 방화벽 설정 확인

### 패키지 설치 오류
```bash
cd service/cbam_service/cbam-service
pip install -r requirements.txt
```

### 테이블 생성 실패
- 데이터베이스 권한 확인
- 기존 테이블 충돌 여부 확인

## 📝 주의사항

⚠️ **중요**: 이 스크립트는 기존 데이터를 모두 삭제하고 새로 생성합니다.
- 실행 전 데이터 백업 권장
- 프로덕션 환경에서는 주의해서 사용

## 🎯 예상 결과

성공적으로 실행되면 다음과 같은 메시지가 표시됩니다:

```
✅ fuel_master 테이블의 기존 데이터가 삭제되었습니다.
✅ 연료 마스터 데이터 5개가 성공적으로 업데이트되었습니다.
✅ material_master 테이블의 기존 데이터가 삭제되었습니다.
✅ 원재료 마스터 데이터 2개가 성공적으로 업데이트되었습니다.
✅ hs_cn_mapping 테이블의 기존 데이터가 삭제되었습니다.
✅ HS-CN 매핑 데이터 5개가 성공적으로 업데이트되었습니다.
🎉 모든 마스터 데이터 업데이트가 완료되었습니다!
```

## 🔗 관련 파일

- `create_master_tables.py`: 테이블 생성 스크립트
- `update_master_data.py`: 데이터 업데이트 스크립트
- `masterdb/`: 엑셀 파일 폴더
- `service/cbam_service/cbam-service/app/domain/`: 엔티티 정의 파일들
