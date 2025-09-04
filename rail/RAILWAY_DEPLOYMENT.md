# Railway 배포 가이드

이 문서는 강철 산업 재료 분류 모델을 Railway에 배포하는 방법을 설명합니다.

## 📋 사전 준비사항

1. **Railway 계정**: [railway.app](https://railway.app)에서 계정 생성
2. **GitHub 저장소**: 이 프로젝트를 GitHub에 업로드
3. **Railway CLI** (선택사항): 로컬에서 배포하려는 경우

## 🚀 배포 방법

### 방법 1: Railway 웹 대시보드 사용 (권장)

1. **Railway 대시보드 접속**
   - [railway.app](https://railway.app)에 로그인
   - "New Project" 클릭

2. **프로젝트 연결**
   - "Deploy from GitHub repo" 선택
   - GitHub 저장소 선택
   - "Deploy Now" 클릭

3. **환경 변수 설정** (필요시)
   - 프로젝트 설정에서 Environment Variables 추가
   - 현재는 추가 환경 변수가 필요하지 않음

4. **배포 확인**
   - 배포가 완료되면 제공된 URL로 접속
   - `/health` 엔드포인트로 서버 상태 확인

### 방법 2: Railway CLI 사용

```bash
# Railway CLI 설치
npm install -g @railway/cli

# Railway 로그인
railway login

# 프로젝트 초기화
railway init

# 배포
railway up
```

## 📁 프로젝트 구조

```
├── app.py                 # Flask API 서버
├── config.json           # 모델 설정
├── pytorch_model.bin     # 훈련된 모델
├── vectorizer.pkl        # TF-IDF 벡터라이저
├── requirements.txt      # Python 의존성
├── Dockerfile           # Docker 설정
├── railway.json         # Railway 설정
├── .dockerignore        # Docker 무시 파일
└── README.md           # 프로젝트 설명
```

## 🔧 API 엔드포인트

### 1. 홈페이지
```
GET /
```
서비스 정보 및 사용 가능한 엔드포인트 목록

### 2. 재료 분류 예측
```
POST /predict
Content-Type: application/json

{
  "text": "철광석을 고로에서 환원하여 선철을 제조하는 과정"
}
```

**응답 예시:**
```json
{
  "input_text": "철광석을 고로에서 환원하여 선철을 제조하는 과정",
  "prediction": {
    "predicted_label": "철광석",
    "confidence": 0.95,
    "top5_predictions": [
      {"label": "철광석", "confidence": 0.95},
      {"label": "선철", "confidence": 0.03},
      {"label": "고로가스", "confidence": 0.01},
      {"label": "일산화탄소", "confidence": 0.005},
      {"label": "석회석", "confidence": 0.005}
    ]
  }
}
```

### 3. 사용 가능한 라벨 목록
```
GET /labels
```

### 4. 헬스 체크
```
GET /health
```

## 🧪 테스트 방법

### cURL 사용
```bash
# 헬스 체크
curl https://your-railway-url.railway.app/health

# 재료 분류 예측
curl -X POST https://your-railway-url.railway.app/predict \
  -H "Content-Type: application/json" \
  -d '{"text": "철광석을 고로에서 환원하여 선철을 제조하는 과정"}'

# 라벨 목록 조회
curl https://your-railway-url.railway.app/labels
```

### Python 사용
```python
import requests

# API URL (Railway에서 제공된 URL로 변경)
API_URL = "https://your-railway-url.railway.app"

# 재료 분류 예측
response = requests.post(f"{API_URL}/predict", json={
    "text": "철광석을 고로에서 환원하여 선철을 제조하는 과정"
})

result = response.json()
print(f"예측 결과: {result['prediction']['predicted_label']}")
print(f"신뢰도: {result['prediction']['confidence']:.4f}")
```

## 🔍 모니터링 및 로그

1. **Railway 대시보드**
   - 배포 상태 확인
   - 로그 실시간 모니터링
   - 리소스 사용량 확인

2. **애플리케이션 로그**
   - 모델 로드 상태
   - API 요청/응답 로그
   - 오류 로그

## 🚨 문제 해결

### 일반적인 문제들

1. **모델 로드 실패**
   - 파일 경로 확인
   - 파일 권한 확인
   - 모델 파일 크기 확인

2. **메모리 부족**
   - Railway 플랜 업그레이드 고려
   - 모델 최적화

3. **배포 실패**
   - Dockerfile 문법 확인
   - requirements.txt 의존성 확인
   - 로그에서 오류 메시지 확인

### 로그 확인 방법
```bash
# Railway CLI 사용
railway logs

# 또는 웹 대시보드에서 실시간 로그 확인
```

## 📊 성능 최적화

1. **모델 최적화**
   - 모델 양자화
   - ONNX 변환 고려

2. **캐싱**
   - Redis 캐싱 추가
   - 자주 사용되는 예측 결과 캐싱

3. **배치 처리**
   - 여러 텍스트 동시 처리
   - 비동기 처리 구현

## 🔒 보안 고려사항

1. **API 키 인증** (필요시)
2. **Rate Limiting** 구현
3. **입력 검증** 강화
4. **HTTPS** 사용 (Railway에서 자동 제공)

## 📈 확장성

1. **수평 확장**: Railway에서 자동 스케일링
2. **로드 밸런싱**: Railway에서 자동 처리
3. **데이터베이스**: 필요시 PostgreSQL 추가

## 💰 비용 최적화

1. **무료 티어**: 월 5달러 크레딧
2. **사용량 모니터링**: Railway 대시보드에서 확인
3. **자동 스케일링**: 필요시에만 리소스 사용

## 📞 지원

- Railway 문서: [docs.railway.app](https://docs.railway.app)
- Railway 커뮤니티: [Discord](https://discord.gg/railway)
- 이슈 리포트: GitHub Issues 사용
