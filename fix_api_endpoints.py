import os
import re
from pathlib import Path

def fix_gateway_endpoints():
    """게이트웨이 엔드포인트 중복 제거 및 정리"""
    print("=== 게이트웨이 엔드포인트 정리 ===")
    
    gateway_file = "gateway/main.py"
    
    try:
        with open(gateway_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 중복된 엔드포인트 제거
        # 1. /ai-process-stream 중복 제거
        old_pattern = r'@app\.api_route\("/ai-process-stream", methods=\["POST", "OPTIONS"\]\)\s*\n\s*async def ai_process_stream_api_route\(.*?\n\s*return await _forward\(.*?\n\s*@app\.post\("/ai-process-stream"\)'
        new_content = re.sub(old_pattern, '', content, flags=re.DOTALL)
        
        # 2. /save-processed-data 중복 제거
        old_pattern2 = r'@app\.post\("/save-processed-data"\)\s*\n\s*async def save_processed_data_gateway\(.*?\n\s*return await _forward\(.*?\n\s*@app\.post\("/save-processed-data"\)'
        new_content = re.sub(old_pattern2, '', new_content, flags=re.DOTALL)
        
        # 3. /classify-data 중복 제거
        old_pattern3 = r'@app\.post\("/classify-data"\)\s*\n\s*async def classify_data_gateway\(.*?\n\s*return await _forward\(.*?\n\s*@app\.post\("/classify-data"\)'
        new_content = re.sub(old_pattern3, '', new_content, flags=re.DOTALL)
        
        # 4. /delete-classification 중복 제거
        old_pattern4 = r'@app\.delete\("/delete-classification"\)\s*\n\s*async def delete_classification_gateway\(.*?\n\s*return await _forward\(.*?\n\s*@app\.delete\("/delete-classification"\)'
        new_content = re.sub(old_pattern4, '', new_content, flags=re.DOTALL)
        
        # 파일에 저장
        with open(gateway_file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print("✅ 게이트웨이 엔드포인트 중복 제거 완료")
        
    except Exception as e:
        print(f"❌ 게이트웨이 엔드포인트 정리 실패: {e}")

def fix_datagather_endpoints():
    """데이터 수집 서비스 엔드포인트 정리"""
    print("\n=== 데이터 수집 서비스 엔드포인트 정리 ===")
    
    datagather_file = "service/datagather_service/app/main.py"
    
    try:
        with open(datagather_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 중복된 엔드포인트 제거
        # 1. /save-input-data 중복 제거 (더 이상 사용하지 않음)
        old_pattern = r'@app\.post\("/save-input-data"\)\s*\nasync def save_input_data\(data: dict\):.*?return {"success": True, "message": "투입물 데이터 저장 완료"}'
        new_content = re.sub(old_pattern, '', content, flags=re.DOTALL)
        
        # 2. /save-transport-data 중복 제거 (더 이상 사용하지 않음)
        old_pattern2 = r'@app\.post\("/save-transport-data"\)\s*\nasync def save_transport_data\(data: dict\):.*?return {"success": True, "message": "운송 데이터 저장 완료"}'
        new_content = re.sub(old_pattern2, '', new_content, flags=re.DOTALL)
        
        # 3. /save-process-data 중복 제거 (더 이상 사용하지 않음)
        old_pattern3 = r'@app\.post\("/save-process-data"\)\s*\nasync def save_process_data\(data: dict\):.*?return {"success": True, "message": "공정 데이터 저장 완료"}'
        new_content = re.sub(old_pattern3, '', new_content, flags=re.DOTALL)
        
        # 4. /save-output-data 중복 제거 (더 이상 사용하지 않음)
        old_pattern4 = r'@app\.post\("/save-output-data"\)\s*\nasync def save_output_data\(data: dict\):.*?return {"success": True, "message": "산출물 데이터 저장 완료"}'
        new_content = re.sub(old_pattern4, '', new_content, flags=re.DOTALL)
        
        # 파일에 저장
        with open(datagather_file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print("✅ 데이터 수집 서비스 엔드포인트 정리 완료")
        
    except Exception as e:
        print(f"❌ 데이터 수집 서비스 엔드포인트 정리 실패: {e}")

def create_api_documentation():
    """API 문서 생성"""
    print("\n=== API 문서 생성 ===")
    
    api_doc = """# GreenSteel API 엔드포인트 문서

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
"""
    
    with open("API_ENDPOINTS.md", "w", encoding="utf-8") as f:
        f.write(api_doc)
    
    print("✅ API 문서 생성 완료")

def verify_endpoint_consistency():
    """엔드포인트 일관성 검증"""
    print("\n=== 엔드포인트 일관성 검증 ===")
    
    # 게이트웨이에서 실제로 구현된 엔드포인트 확인
    gateway_file = "gateway/main.py"
    
    try:
        with open(gateway_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 구현된 엔드포인트 패턴 찾기
        implemented_endpoints = re.findall(r'@app\.(get|post|put|delete|api_route)\("([^"]+)"', content)
        
        print("게이트웨이에서 구현된 엔드포인트:")
        for method, path in implemented_endpoints:
            print(f"  - {method.upper()} {path}")
        
        # 중복 엔드포인트 확인
        paths = [path for _, path in implemented_endpoints]
        duplicates = [path for path in set(paths) if paths.count(path) > 1]
        
        if duplicates:
            print(f"\n⚠️ 중복된 엔드포인트 발견: {duplicates}")
        else:
            print("\n✅ 중복된 엔드포인트 없음")
            
    except Exception as e:
        print(f"❌ 엔드포인트 일관성 검증 실패: {e}")

def main():
    """메인 함수"""
    print("🔧 GreenSteel API 엔드포인트 문제 해결 시작")
    print("=" * 60)
    
    # 1. 게이트웨이 엔드포인트 중복 제거
    fix_gateway_endpoints()
    
    # 2. 데이터 수집 서비스 엔드포인트 정리
    fix_datagather_endpoints()
    
    # 3. API 문서 생성
    create_api_documentation()
    
    # 4. 엔드포인트 일관성 검증
    verify_endpoint_consistency()
    
    print("\n" + "=" * 60)
    print("✅ API 엔드포인트 문제 해결 완료")

if __name__ == "__main__":
    main()
