# GreenSteel API 엔드포인트 문서

## 🚪 게이트웨이 서비스

### 헬스 체크
- `GET /health` - 게이트웨이 상태 확인
- `GET /routing` - 라우팅 정보
- `GET /status` - 서비스 상태
- `GET /architecture` - 아키텍처 정보

### 챗봇 서비스
- `POST /chatbot/chat` - 챗봇 대화
- `GET /chatbot/health` - 챗봇 서비스 상태
- `* /chatbot/{path:path}` - 챗봇 서비스 프록시

### CBAM 서비스
- `* /api/cbam/{path:path}` - CBAM API 프록시
- `* /cbam/{path:path}` - CBAM 서비스 프록시
- `GET /cbam/health` - CBAM 서비스 상태
- `GET /cbam/db/status` - CBAM 데이터베이스 상태

### 인증 서비스
- `* /api/auth/{path:path}` - 인증 API 프록시
- `* /auth/{path:path}` - 인증 서비스 프록시

### LCA 서비스
- `* /api/lci/{path:path}` - LCA API 프록시
- `* /lci/{path:path}` - LCA 서비스 프록시

### 데이터 수집 서비스
- `* /api/datagather/{path:path}` - 데이터 수집 API 프록시
- `* /datagather/{path:path}` - 데이터 수집 서비스 프록시

### 데이터 처리
- `POST /ai-process-stream` - AI 데이터 처리
- `POST /save-processed-data` - 처리된 데이터 저장
- `POST /classify-data` - 데이터 분류
- `DELETE /delete-classification` - 분류 데이터 삭제

### 데이터 저장 (레거시)
- `POST /save-transport-data` - 운송 데이터 저장 (레거시)
- `POST /save-process-data` - 공정 데이터 저장 (레거시)
- `POST /save-output-data` - 산출물 데이터 저장 (레거시)

### 데이터 조회
- `GET /api/datagather/input-data` - 투입물 데이터 조회
- `GET /api/datagather/output-data` - 산출물 데이터 조회
- `GET /api/datagather/transport-data` - 운송 데이터 조회
- `GET /api/datagather/process-data` - 공정 데이터 조회

## 📊 데이터 수집 서비스

### 헬스 체크
- `GET /health` - 서비스 상태
- `GET /` - 서비스 정보

### 데이터 처리
- `POST /ai-process-stream` - AI 데이터 처리
- `POST /save-processed-data` - 처리된 데이터 저장

### 데이터 분류
- `POST /classify-data` - 데이터 분류
- `DELETE /delete-classification` - 분류 데이터 삭제

### 데이터 조회
- `GET /api/datagather/input-data` - 투입물 데이터 조회
- `GET /api/datagather/output-data` - 산출물 데이터 조회
- `GET /api/datagather/transport-data` - 운송 데이터 조회
- `GET /api/datagather/process-data` - 공정 데이터 조회

## 🏭 CBAM 서비스

### 헬스 체크
- `GET /health` - 서비스 상태
- `GET /db/status` - 데이터베이스 상태
- `GET /` - 서비스 정보

## 🔐 인증 서비스

### 헬스 체크
- `GET /` - 서비스 상태
- `GET /health` - 서비스 상태

## 🤖 챗봇 서비스

### 헬스 체크
- `GET /` - 서비스 상태
- `GET /health` - 서비스 상태

## 📈 LCA 서비스

### 헬스 체크
- `GET /` - 서비스 상태
- `GET /health` - 서비스 상태

## 📝 사용법

### 프론트엔드에서 API 호출
```javascript
// 게이트웨이를 통한 API 호출
const response = await fetch('/api/datagather/input-data');
const data = await response.json();

// AI 처리
const aiResponse = await fetch('/ai-process-stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ filename: 'data.xlsx', data: rows })
});

// 데이터 저장
const saveResponse = await fetch('/save-processed-data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ filename: 'data.xlsx', data: rows })
});
```

### 환경 변수 설정
```bash
# 게이트웨이
GATEWAY_NAME=greensteel-gateway
ALLOWED_ORIGINS=https://greensteel.site,http://localhost:3000

# 서비스 URL
CHATBOT_SERVICE_URL=http://localhost:8081
CBAM_SERVICE_URL=http://localhost:8082
AUTH_SERVICE_URL=http://localhost:8083
LCA_SERVICE_URL=http://localhost:8084
DATAGATHER_SERVICE_URL=http://localhost:8085
```

## ⚠️ 주의사항

1. **레거시 엔드포인트**: 일부 데이터 저장 엔드포인트는 레거시로 표시되어 있으며, 새로운 `/save-processed-data` 엔드포인트 사용을 권장합니다.

2. **프록시 라우팅**: `{path:path}` 패턴은 해당 서비스의 모든 엔드포인트를 프록시합니다.

3. **CORS 설정**: 모든 서비스에서 CORS가 적절히 설정되어 있습니다.

4. **데이터베이스 스키마**: 실제 데이터베이스 스키마와 SQLAlchemy 모델이 일치하도록 업데이트되었습니다.
