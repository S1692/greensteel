# Gateway 프로덕션 배포 가이드

## 🚀 **프로덕션 배포 단계**

### **1. 환경 변수 설정**

`.env` 파일을 생성하고 다음 설정을 추가하세요:

```bash
# Gateway 프로덕션 환경 변수
GATEWAY_NAME=greensteel-gateway
LOG_LEVEL=INFO

# CORS 설정
ALLOWED_ORIGINS=https://greensteel.site,https://www.greensteel.site
ALLOWED_ORIGIN_REGEX=^https://.*\.vercel\.app$|^https://.*\.up\.railway\.app$

# DDD 도메인 서비스 URL (프로덕션)
AUTH_SERVICE_URL=https://auth.greensteel.site
CBAM_SERVICE_URL=https://cbam.greensteel.site
DATAGATHER_SERVICE_URL=https://datagather.greensteel.site
LCI_SERVICE_URL=https://lci.greensteel.site

# 타임아웃 설정
CONNECT_TIMEOUT=15
READ_TIMEOUT=300
WRITE_TIMEOUT=60
POOL_TIMEOUT=30

# 보안 설정
TRUSTED_HOSTS=*
MAX_REQUEST_SIZE=10485760

# 로깅 설정
LOG_FORMAT=json
LOG_LEVEL=INFO
LOG_FILE=gateway.log

# 모니터링 설정
ENABLE_METRICS=true
METRICS_PORT=9090
HEALTH_CHECK_INTERVAL=30

# 프로덕션 환경
DEBUG=false
RELOAD=false
```

### **2. 의존성 설치**

```bash
pip install -r requirements.txt
```

### **3. Gateway 서비스 실행**

```bash
# 개발 모드
uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload

# 프로덕션 모드
uvicorn app.main:app --host 0.0.0.0 --port 8080 --workers 4
```

### **4. Docker 배포 (권장)**

```bash
# Docker 이미지 빌드
docker build -t greensteel-gateway .

# Docker 컨테이너 실행
docker run -d \
  --name greensteel-gateway \
  -p 8080:8080 \
  --env-file .env \
  greensteel-gateway
```

### **5. Railway 배포**

```bash
# Railway CLI 설치
npm install -g @railway/cli

# 로그인
railway login

# 프로젝트 연결
railway link

# 배포
railway up
```

## 🔧 **문제 해결**

### **503 오류 해결 방법**

1. **Gateway 서비스 상태 확인**
   ```bash
   curl https://gateway.greensteel.site/health
   ```

2. **로그 확인**
   ```bash
   tail -f gateway.log
   ```

3. **포트 확인**
   ```bash
   netstat -tulpn | grep :8080
   ```

4. **서비스 재시작**
   ```bash
   # Docker
   docker restart greensteel-gateway
   
   # 직접 실행
   pkill -f "uvicorn app.main:app"
   uvicorn app.main:app --host 0.0.0.0 --port 8080
   ```

### **CORS 오류 해결**

1. **ALLOWED_ORIGINS 확인**
2. **프론트엔드 도메인 추가**
3. **CORS 미들웨어 재설정**

## 📊 **모니터링**

### **헬스체크 엔드포인트**

- **GET** `/health` - Gateway 상태
- **GET** `/status` - 서비스 상태
- **GET** `/routing` - 라우팅 정보
- **GET** `/architecture` - 아키텍처 정보

### **로그 모니터링**

```bash
# 실시간 로그
tail -f gateway.log

# 오류 로그
grep "ERROR" gateway.log

# 성능 로그
grep "X-Process-Time" gateway.log
```

## 🚨 **긴급 상황 대응**

### **Gateway 다운 시**

1. **서비스 상태 확인**
2. **로그 분석**
3. **의존성 서비스 확인**
4. **서비스 재시작**
5. **롤백 계획 실행**

### **연락처**

- **개발팀**: 개발팀 채널
- **운영팀**: 운영팀 채널
- **긴급**: 긴급 연락망
