import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import httpx
import json
from typing import Dict, List, Any

# 환경변수에서 설정 가져오기
GATEWAY_NAME = os.getenv("GATEWAY_NAME", "greensteel-gateway")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")

# CORS 허용 오리진 파싱
allowed_origins = [origin.strip() for origin in ALLOWED_ORIGINS.split(",") if origin.strip()]

# FastAPI 애플리케이션 생성
app = FastAPI(
    title=f"{GATEWAY_NAME} - AI Gateway",
    description="프론트엔드에서 AI 모델로 데이터를 전달하는 간단한 게이트웨이",
    version="1.0.0"
)

# CORS 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# 통일된 컬럼명 정의
UNIFIED_COLUMNS = [
    "로트번호",      # Lot Number
    "생산품명",      # Product Name  
    "생산수량",      # Production Quantity
    "투입일",        # Input Date
    "종료일",        # End Date
    "공정",          # Process
    "투입물명",      # Input Material Name
    "수량",          # Quantity
    "단위",          # Unit
    "AI추천답변"     # AI Recommendation
]

# 헬스체크 엔드포인트
@app.get("/health")
async def health_check():
    """게이트웨이 헬스체크"""
    return {"status": "healthy", "service": GATEWAY_NAME}

# 스트리밍 AI 모델을 활용한 데이터 처리 엔드포인트
@app.post("/ai-process-stream")
async def ai_process_data_stream(data: dict):
    """스트리밍 방식으로 AI 모델을 활용하여 투입물명을 자동으로 수정합니다."""
    
    async def generate_ai_response():
        try:
            print(f"스트리밍 AI 모델 처리 요청 받음: {data.get('filename', 'unknown')}")
            
            # 데이터 검증 및 컬럼명 통일
            excel_data = data.get('data', [])
            if not excel_data:
                yield f"data: {json.dumps({'error': '데이터가 없습니다'})}\n\n"
                return
            
            # 첫 번째 행에서 컬럼명 추출
            first_row = excel_data[0]
            original_columns = list(first_row.keys())
            
            # 컬럼명 매핑 및 통일
            column_mapping = {}
            for unified_col in UNIFIED_COLUMNS[:-1]:  # AI추천답변 제외
                # 1. 정확한 매칭 먼저 시도
                exact_match = None
                for orig_col in original_columns:
                    if unified_col.strip() == orig_col.strip():
                        exact_match = orig_col
                        break
                
                if exact_match:
                    column_mapping[exact_match] = unified_col
                    continue
                
                # 2. 부분 매칭 시도 (더 유연하게)
                for orig_col in original_columns:
                    # 공백 제거 후 비교
                    clean_unified = unified_col.strip().lower().replace(' ', '').replace('_', '')
                    clean_orig = orig_col.strip().lower().replace(' ', '').replace('_', '')
                    
                    # 완전 포함 관계 확인
                    if clean_unified in clean_orig or clean_orig in clean_unified:
                        column_mapping[orig_col] = unified_col
                        break
                
                # 3. 매칭되지 않은 경우 로깅
                if unified_col not in column_mapping.values():
                    print(f"경고: 컬럼 '{unified_col}'에 대한 매칭을 찾을 수 없습니다.")
                    print(f"사용 가능한 컬럼: {original_columns}")
            
            # 매핑 결과 로깅
            print(f"컬럼 매핑 결과: {column_mapping}")
            
            # 통일된 컬럼명으로 데이터 재구성
            unified_data = []
            for row in excel_data:
                unified_row = {}
                for orig_col, unified_col in column_mapping.items():
                    unified_row[unified_col] = row.get(orig_col, '')
                
                # 매핑되지 않은 컬럼은 원본 그대로 유지
                for orig_col in original_columns:
                    if orig_col not in column_mapping:
                        unified_row[orig_col] = row.get(orig_col, '')
                
                unified_row['AI추천답변'] = ''  # AI 추천 답변 컬럼 추가
                unified_data.append(unified_row)
            
            # 진행 상황 전송
            yield f"data: {json.dumps({'status': 'processing', 'message': '데이터 전처리 완료', 'total_rows': len(unified_data)})}\n\n"
            
            # datagather_service로 AI 처리 요청 전송
            async with httpx.AsyncClient(timeout=120.0) as client:
                # 투입물명만 추출하여 AI 처리 요청
                input_materials = [row.get('투입물명', '') for row in unified_data if row.get('투입물명')]
                
                ai_request_data = {
                    "filename": data.get('filename', 'unknown'),
                    "input_materials": input_materials,
                    "total_rows": len(unified_data),
                    "columns": UNIFIED_COLUMNS
                }
                
                print(f"=== 게이트웨이 → AI 전송 데이터 ===")
                print(f"AI 요청 데이터: {ai_request_data}")
                print(f"투입물명 목록: {input_materials}")
                print(f"통일된 컬럼: {UNIFIED_COLUMNS}")
                print(f"=================================")
                
                yield f"data: {json.dumps({'status': 'ai_request', 'message': f'AI 모델에 {len(input_materials)}개 투입물명 전송', 'request_data': ai_request_data})}\n\n"
                
                response = await client.post(
                    "http://localhost:8083/ai-process-stream",
                    json=ai_request_data
                )
                
                if response.status_code == 200:
                    # 스트리밍 응답 처리
                    async for line in response.aiter_lines():
                        if line.startswith('data: '):
                            ai_data = json.loads(line[6:])
                            
                            if ai_data.get('status') == 'ai_processed':
                                # AI 처리 결과를 통일된 데이터에 적용
                                ai_recommendations = ai_data.get('ai_recommendations', [])
                                
                                print(f"AI 처리 결과 수신: {len(ai_recommendations)}개 추천")
                                print(f"AI 추천 샘플: {ai_recommendations[:3]}")
                                
                                for i, row in enumerate(unified_data):
                                    if i < len(ai_recommendations):
                                        ai_rec = ai_recommendations[i]
                                        recommended_name = ai_rec.get('recommended_name', row.get('투입물명', ''))
                                        confidence = ai_rec.get('confidence', 0)
                                        
                                        # AI 추천 답변을 항상 적용 (신뢰도 필터링 제거)
                                        row['AI추천답변'] = recommended_name
                                        print(f"행 {i}: {row.get('투입물명', '')} → {recommended_name} (유사도: {confidence:.1f}%)")
                                        
                                        # 디버깅: AI 응답 구조 확인
                                        print(f"🔍 AI 응답 구조: {ai_rec}")
                                
                                # 최종 결과 전송
                                final_result = {
                                    "status": "completed",
                                    "message": "AI 모델 처리가 완료되었습니다",
                                    "filename": data.get('filename', 'unknown'),
                                    "total_rows": len(unified_data),
                                    "processed_rows": len([r for r in unified_data if r.get('AI추천답변')]),
                                    "data": unified_data,
                                    "columns": UNIFIED_COLUMNS
                                }
                                
                                print(f"최종 결과 전송: {len(unified_data)}행, 컬럼: {UNIFIED_COLUMNS}")
                                yield f"data: {json.dumps(final_result)}\n\n"
                                break
                            else:
                                # 진행 상황 전송
                                yield f"data: {json.dumps(ai_data)}\n\n"
                else:
                    error_msg = f"AI 모델 처리 오류: {response.status_code}"
                    yield f"data: {json.dumps({'error': error_msg})}\n\n"
                    
        except Exception as e:
            error_msg = f"스트리밍 AI 처리 중 오류 발생: {str(e)}"
            print(error_msg)
            yield f"data: {json.dumps({'error': error_msg})}\n\n"
    
    return StreamingResponse(
        generate_ai_response(),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream"
        }
    )

# 기존 AI 처리 엔드포인트 (하위 호환성 유지)
@app.post("/ai-process")
async def ai_process_data(data: dict):
    """AI 모델을 활용하여 투입물명을 자동으로 수정합니다."""
    try:
        print(f"AI 모델 처리 요청 받음: {data.get('filename', 'unknown')}")
        
        # datagather_service로 AI 처리 요청 전송 (포트 8083, 올바른 경로)
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                "http://localhost:8083/filtering/ai-process",
                json=data
            )
            
            if response.status_code == 200:
                response_data = response.json()
                print(f"AI 모델 처리 성공: {data.get('filename', 'unknown')}")
                
                return {
                    "message": "AI 모델을 통해 투입물명이 성공적으로 수정되었습니다",
                    "status": "ai_processed",
                    "data": response_data
                }
            else:
                print(f"AI 모델 처리 오류: {response.status_code}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"AI 모델 처리 오류: {response.text}"
                )
                
    except httpx.TimeoutException:
        print("AI 모델 처리 시간 초과")
        raise HTTPException(status_code=504, detail="AI 모델 처리 시간 초과")
    except httpx.ConnectError:
        print("datagather_service 연결 실패")
        raise HTTPException(status_code=503, detail="datagather_service에 연결할 수 없습니다")
    except Exception as e:
        print(f"AI 모델 처리 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI 모델 처리 오류: {str(e)}")

# 사용자 피드백 처리 엔드포인트
@app.post("/feedback")
async def process_feedback(feedback_data: dict):
    """사용자 피드백을 받아 AI 모델을 재학습시킵니다."""
    try:
        print(f"사용자 피드백 처리 요청 받음")
        
        # 피드백 데이터 로깅
        print(f"피드백 데이터: {feedback_data}")
        
        # datagather_service로 피드백 데이터 전송 (포트 8083, 올바른 경로)
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "http://localhost:8083/feedback",
                json=feedback_data
            )
            
            if response.status_code == 200:
                response_data = response.json()
                print(f"피드백 처리 성공: {response_data}")
                
                return {
                    "message": "피드백이 성공적으로 처리되었습니다. AI 모델이 이 정보를 학습합니다.",
                    "status": "feedback_processed",
                    "data": response_data
                }
            else:
                print(f"피드백 처리 오류: {response.status_code}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"피드백 처리 오류: {response.text}"
                )
                
    except httpx.TimeoutException:
        print("피드백 처리 시간 초과")
        raise HTTPException(status_code=504, detail="피드백 처리 시간 초과")
    except httpx.ConnectError:
        print("datagather_service 연결 실패")
        raise HTTPException(status_code=503, detail="datagather_service에 연결할 수 없습니다")
    except Exception as e:
        print(f"피드백 처리 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail=f"피드백 처리 오류: {str(e)}")

# 루트 경로
@app.get("/")
async def root():
    """루트 경로"""
    return {
        "message": f"{GATEWAY_NAME} - AI Gateway",
        "version": "1.0.0",
        "endpoints": {
            "health_check": "/health",
            "ai_process": "/ai-process",
            "ai_process_stream": "/ai-process-stream",
            "feedback": "/feedback",
            "documentation": "/docs"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8080,
        reload=False
    )
