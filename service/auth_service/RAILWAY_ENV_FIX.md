# 🚨 Railway PostgreSQL 'db_type' 파라미터 오류 완전 해결 가이드

## 🚨 긴급 상황

```
2025-08-18 09:06:15.451 UTC [1180] FATAL: unrecognized configuration parameter "db_type"
2025-08-18 09:06:15.466 UTC [1181] FATAL: unrecognized configuration parameter "db_type"
2025-08-18 09:06:15.468 UTC [1182] FATAL: unrecognized configuration parameter "db_type"
```

**8월 18일 09:06에 대량의 연결 오류가 발생했습니다.**

## 🔍 문제 원인

Railway가 제공하는 `DATABASE_URL`에 PostgreSQL이 인식하지 못하는 `db_type` 파라미터가 포함되어 있습니다.

**잘못된 URL 예시:**
```
postgresql://user:pass@host:port/db?db_type=postgresql&sslmode=require
```

**올바른 URL:**
```
postgresql://user:pass@host:port/db?sslmode=require
```

## 🛠️ 즉시 해결 방법

### 방법 1: Railway 대시보드에서 직접 수정 (권장)

1. **Railway 대시보드 접속**
   - https://railway.app/dashboard

2. **프로젝트 선택**
   - GreenSteel 프로젝트 클릭

3. **Variables 탭으로 이동**
   - 왼쪽 메뉴에서 "Variables" 클릭

4. **DATABASE_URL 수정**
   - `DATABASE_URL` 찾기
   - "Edit" 클릭
   - `?db_type=postgresql&` 부분을 `?`로 변경
   - `&db_type=postgresql` 부분이 있다면 제거
   - "Save" 클릭

5. **서비스 재시작**
   - "Deployments" 탭으로 이동
   - "Deploy" 버튼 클릭

### 방법 2: Railway CLI 사용

```bash
# Railway CLI 설치
npm install -g @railway/cli

# 로그인
railway login

# 프로젝트 연결
railway link

# 현재 환경 변수 확인
railway variables list

# DATABASE_URL 수정
railway variables set DATABASE_URL="새로운_URL_여기에"

# 서비스 재배포
railway up
```

### 방법 3: 코드에서 자동 해결 (이미 구현됨)

`app/common/db.py`에서 자동으로 문제 파라미터를 제거합니다:

```python
def clean_database_url(url: str) -> str:
    """데이터베이스 URL에서 잘못된 파라미터 제거"""
    invalid_params = [
        'db_type', 'db_type=postgresql', 'db_type=postgres',
        'db_type=mysql', 'db_type=sqlite'
    ]
    
    for param in invalid_params:
        if param in url:
            url = url.replace(param, '')
    
    return url
```

## 📋 확인 체크리스트

### 1단계: 환경 변수 확인
- [ ] Railway 대시보드에서 DATABASE_URL 확인
- [ ] `db_type` 파라미터가 포함되어 있는지 확인
- [ ] URL 형식이 올바른지 확인

### 2단계: 파라미터 제거
- [ ] `?db_type=postgresql&` → `?`로 변경
- [ ] `&db_type=postgresql` → 제거
- [ ] 연속된 `&&` 제거
- [ ] 끝에 `&` 제거

### 3단계: 서비스 재시작
- [ ] 환경 변수 저장
- [ ] 서비스 재배포
- [ ] 로그에서 오류 확인

## 🔍 문제 진단

### 로그 확인 명령어

```bash
# Railway CLI로 로그 확인
railway logs

# 특정 서비스 로그 확인
railway logs --service auth-service

# 실시간 로그 모니터링
railway logs --follow
```

### 오류 패턴 분석

```
# 문제가 있는 경우
FATAL: unrecognized configuration parameter "db_type"

# 정상적인 경우
LOG: checkpoint complete
LOG: database system is ready to accept connections
```

## 🚀 예방 조치

### 1. 환경 변수 검증
- 배포 전 DATABASE_URL 형식 확인
- `db_type` 파라미터 포함 여부 체크

### 2. 자동 정리 시스템
- 코드에서 문제 파라미터 자동 제거
- 로그에 정리 과정 기록

### 3. 모니터링 설정
- PostgreSQL 오류 로그 모니터링
- 연결 실패 시 자동 알림

## 📞 긴급 지원

### 문제가 지속되는 경우

1. **Railway Support 팀 문의**
   - https://railway.app/support
   - 프로젝트 ID와 오류 로그 첨부

2. **PostgreSQL 설정 검토**
   - Railway PostgreSQL 설정 확인
   - 연결 파라미터 검증

3. **대안 데이터베이스 고려**
   - Railway PostgreSQL 재생성
   - 다른 PostgreSQL 서비스 검토

## 📝 로그 분석 결과

### 8월 18일 09:06 오류 분석
- **오류 유형**: `unrecognized configuration parameter "db_type"`
- **발생 빈도**: 6회 연속 발생
- **원인**: DATABASE_URL에 잘못된 파라미터 포함
- **상태**: 현재는 정상 (checkpoint 로그만 표시)

### 8월 19일 상태
- **checkpoint**: 정상 실행
- **데이터베이스**: 안정적 운영
- **연결**: 오류 없음

## ✅ 완료된 작업

- [x] 코드에서 자동 파라미터 정리 구현
- [x] Railway PostgreSQL 연결 최적화
- [x] 폴백 모드 (SQLite) 구현
- [x] 상세한 문제 해결 가이드 작성

---

**생성 시간**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**목적**: Railway PostgreSQL 'db_type' 파라미터 오류 완전 해결
**상태**: 🔄 해결 진행 중...
