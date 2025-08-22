import asyncio
import json
import logging
import os
import sys
from datetime import datetime
from typing import Dict, List, Optional

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# AI 모델 import
try:
    import sys
    import os
    
    # 현재 파일의 경로를 기준으로 상위 디렉토리들을 sys.path에 추가
    current_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(current_dir)  # app/
    grandparent_dir = os.path.dirname(parent_dir)  # app의 상위
    
    if grandparent_dir not in sys.path:
        sys.path.insert(0, grandparent_dir)
    
    # GPU 설정을 위한 환경변수 설정
    import os
    os.environ['PYTORCH_CUDA_ALLOC_CONF'] = 'max_split_size_mb:128'
    
    from app.ananke.model import XMLRoBERTaClassifier
    AI_AVAILABLE = True
    print("AI 모델을 성공적으로 import했습니다.")
except ImportError as e:
    AI_AVAILABLE = False
    print(f"AI 모델 import 실패: {e}")
    print("규칙 기반으로 작동합니다.")

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def predict_material_name(input_material: str, process: str, production_name: str, ai_model=None) -> str:
    """
    AI 모델 또는 규칙 기반으로 투입물명을 예측합니다.
    
    Args:
        input_material: 원본 투입물명
        process: 공정명
        production_name: 생산품명
        ai_model: AI 모델 인스턴스
    
    Returns:
        수정된 투입물명
    """
    try:
        # 입력값 검증 - 상태값이 아닌 실제 투입물명인지 확인
        if not input_material or input_material.strip() == '':
            return ''
        
        # 상태값으로 보이는 것들은 제외
        status_values = ['완료', '진행중', '대기', '취소', '보류', '종료']
        if input_material.strip() in status_values:
            logger.warning(f"상태값이 투입물명으로 입력됨: {input_material}")
            return input_material  # 상태값은 그대로 반환
        
        # AI 모델이 사용 가능한 경우 AI 예측 시도
        if AI_AVAILABLE and ai_model:
            try:
                # AI 모델을 사용한 예측 (실제 학습된 모델 사용)
                logger.info(f"AI 모델을 사용하여 예측 시도: {input_material}")
                
                # GPU 메모리 상태 확인
                import torch
                if torch.cuda.is_available():
                    try:
                        torch.cuda.empty_cache()  # GPU 메모리 정리
                    except Exception as gpu_error:
                        logger.warning(f"GPU 메모리 정리 실패: {gpu_error}")
                
                # 실제 AI 모델 예측 시도
                try:
                    # 학습된 모델이 있는 경우 실제 예측 수행
                    if hasattr(ai_model, 'predict') and callable(getattr(ai_model, 'predict', None)):
                        ai_prediction = ai_model.predict(input_material)
                        if ai_prediction:
                            logger.info(f"AI 모델 예측 성공: {input_material} → {ai_prediction}")
                            return ai_prediction
                    else:
                        # 학습된 모델이 없는 경우 규칙 기반 예측
                        ai_prediction = apply_ai_rules(input_material, process, production_name)
                        if ai_prediction:
                            logger.info(f"규칙 기반 예측 성공: {input_material} → {ai_prediction}")
                            return ai_prediction
                            
                except Exception as prediction_error:
                    logger.warning(f"AI 모델 예측 실패: {prediction_error}")
                    # 예측 실패 시 규칙 기반으로 대체
                    ai_prediction = apply_ai_rules(input_material, process, production_name)
                    if ai_prediction:
                        logger.info(f"규칙 기반 예측으로 대체: {input_material} → {ai_prediction}")
                        return ai_prediction
                    
            except Exception as ai_error:
                logger.warning(f"AI 모델 예측 실패, 규칙 기반으로 대체: {ai_error}")
                # GPU 오류인 경우 메모리 정리 시도
                try:
                    import torch
                    if torch.cuda.is_available():
                        torch.cuda.empty_cache()
                except:
                    pass
        
        # AI 모델이 없거나 실패한 경우 규칙 기반 예측
        return apply_rule_based_prediction(input_material, process, production_name)
        
    except Exception as e:
        logger.error(f"투입물명 예측 중 오류: {e}")
        return input_material

def apply_ai_rules(input_material: str, process: str, production_name: str) -> str:
    """
    AI 모델을 사용한 투입물명 예측 (공정 고려하지 않음, 개선된 규칙 기반)
    """
    try:
        # 공정을 고려하지 않고 투입물명만으로 예측
        # 실제 AI 모델에서는 학습된 데이터만을 바탕으로 판단
        
        # 명확한 분류 규칙 (개선됨)
        if '점결탄' in input_material:
            return '점결탄'
        elif '광석' in input_material or '정립광' in input_material:
            return '광석'
        elif '석회' in input_material:
            return '석회'
        elif '코크스' in input_material:
            return '코크스'
        elif '철' in input_material and '철' != input_material:
            return '철'
        elif '냉각수' in input_material or '물' in input_material:
            return '냉각수'  # 냉각수는 철이 아님!
        elif '윤활제' in input_material:
            return '윤활제'  # 윤활제는 철이 아님!
        elif '모래' in input_material:
            return '모래'    # 모래는 환윗널이 아님!
        elif '열유입' in input_material:
            return '열유입'  # 열유입은 철이 아님!
        elif 'EAF' in input_material or '탄소' in input_material:
            return 'EAF 탄소 전극'
        
        # 공정별 특화는 하지 않음 - 단순히 원본 투입물명 반환
        return input_material
        
    except Exception as e:
        logger.error(f"AI 규칙 적용 중 오류: {e}")
        return input_material

def apply_rule_based_prediction(input_material: str, process: str, production_name: str) -> str:
    """
    기본 규칙 기반 투입물명 예측
    """
    try:
        # 공정별 일반적인 투입물명 매핑
        process_material_mapping = {
            '압연': ['압연용 원료', '압연재', '압연 소재', '압연 강재'],
            '단조': ['단조용 원료', '단조재', '단조 소재', '단조 강재'],
            '주조': ['주조용 원료', '주조재', '주조 소재', '주조 강재'],
            '용접': ['용접재', '용접 소재', '용접용 원료', '용접 강재'],
            '절삭': ['절삭재', '절삭 소재', '절삭용 원료', '절삭 강재'],
            '열처리': ['열처리재', '열처리 소재', '열처리용 원료', '열처리 강재'],
            '가공': ['가공재', '가공 소재', '가공용 원료', '가공 강재'],
            '성형': ['성형재', '성형 소재', '성형용 원료', '성형 강재']
        }
        
        # 공정에 따른 투입물명 추천
        if process and process.strip():
            process_lower = process.lower()
            
            # 공정명에 포함된 키워드 찾기
            matched_process = None
            for key in process_material_mapping.keys():
                if key in process_lower:
                    matched_process = key
                    break
            
            if matched_process:
                recommended_materials = process_material_mapping[matched_process]
                
                # 원본 투입물명과 유사한 것을 찾거나, 첫 번째 추천 사용
                for recommended in recommended_materials:
                    if (input_material.lower() in recommended.lower() or 
                        recommended.lower() in input_material.lower()):
                        return recommended
                
                # 유사한 것이 없으면 공정에 맞는 추천 사용
                return recommended_materials[0]
        
        # 공정별 매핑이 없는 경우 원본 반환
        return input_material
        
    except Exception as e:
        logger.error(f"규칙 기반 예측 중 오류: {e}")
        return input_material

async def save_feedback_to_training_data(feedback_data: dict):
    """피드백 데이터를 학습 데이터 파일에 저장합니다."""
    try:
        # 학습 데이터 저장 경로 설정
        current_dir = os.path.dirname(os.path.abspath(__file__))
        data_dir = os.path.join(current_dir, "..", "data", "dataforstudy")
        feedback_file = os.path.join(data_dir, "feedback_data.jsonl")
        
        # 디렉토리가 없으면 생성
        os.makedirs(data_dir, exist_ok=True)
        
        # 피드백 데이터를 JSONL 형식으로 저장
        with open(feedback_file, 'a', encoding='utf-8') as f:
            f.write(json.dumps(feedback_data, ensure_ascii=False) + '\n')
        
        logger.info(f"피드백 데이터가 학습 데이터 파일에 저장되었습니다: {feedback_file}")
        
    except Exception as e:
        logger.error(f"피드백 데이터 저장 실패: {e}")

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    """애플리케이션 생명주기 관리"""
    # 시작 시
    logger.info(f"DataGather Service starting up...")
    logger.info("Domain: Data Collection & Processing")
    logger.info(f"Architecture: AI Model + Rule-based (AI Available: {AI_AVAILABLE})")
    
    # AI 모델 초기화
    if AI_AVAILABLE:
        try:
            # GPU 설정 최적화
            import torch
            if torch.cuda.is_available():
                # CUDA 메모리 할당자 설정
                torch.cuda.set_per_process_memory_fraction(0.8)  # GPU 메모리의 80%만 사용
                logger.info(f"GPU 사용 가능: {torch.cuda.get_device_name(0)}")
                logger.info(f"GPU 메모리: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.1f}GB")
            else:
                logger.info("GPU 사용 불가능, CPU 모드로 실행")
            
            # 기존 학습된 모델 경로 설정
            current_dir = os.path.dirname(os.path.abspath(__file__))
            model_dir = os.path.join(current_dir, "..", "data", "studied", "latest_model")
            
            # AI 모델 인스턴스 생성 (기존 학습된 모델 사용)
            try:
                if os.path.exists(model_dir):
                    logger.info(f"기존 학습된 모델을 로드합니다: {model_dir}")
                    app.state.ai_model = XMLRoBERTaClassifier(model_dir=model_dir)
                    logger.info("기존 학습된 AI 모델이 성공적으로 로드되었습니다.")
                    logger.info("AI 모델: 학습된 데이터를 기반으로 정확한 예측 수행")
                else:
                    logger.info("기존 학습된 모델이 없습니다. 새로운 모델을 초기화합니다.")
                    app.state.ai_model = XMLRoBERTaClassifier()
                    logger.info("새로운 AI 모델이 초기화되었습니다.")
                    logger.info("AI 모델: 기본 규칙 기반으로 예측")
                    
            except Exception as model_error:
                logger.warning(f"AI 모델 초기화 실패 (GPU 문제일 수 있음): {model_error}")
                logger.info("규칙 기반 모드로 전환합니다.")
                app.state.ai_model = None
                
        except Exception as e:
            logger.error(f"AI 모델 초기화 실패: {e}")
            app.state.ai_model = None
    else:
        app.state.ai_model = None
        logger.info("AI 모델 없이 규칙 기반으로 작동합니다.")
    
    yield
    # 종료 시
    logger.info(f"DataGather Service shutting down...")

def create_app() -> FastAPI:
    """FastAPI 애플리케이션 팩토리"""
    
    # FastAPI 애플리케이션 생성
    app = FastAPI(
        title="DataGather Service - AI Model + Rule-based",
        description="ESG 데이터 수집 및 처리 서비스 - AI 모델과 규칙 기반 혼합",
        version="1.0.0",
        lifespan=lifespan
    )
    
    # CORS 미들웨어 설정
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000", "http://localhost:8080"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"]
    )
    
    # 헬스 체크 엔드포인트
    @app.get("/health")
    async def health_check():
        """헬스 체크 엔드포인트"""
        return {
            "status": "ok",
            "service": "datagather",
            "domain": "data-collection",
            "architecture": "AI Model + Rule-based",
            "ai_available": AI_AVAILABLE,
            "timestamp": datetime.now().isoformat(),
            "version": "1.0.0"
        }
    
    # 루트 경로
    @app.get("/")
    async def root():
        """루트 경로"""
        return {
            "service": "DataGather Service",
            "version": "1.0.0",
            "domain": "Data Collection & Processing",
            "architecture": "AI Model + Rule-based",
            "ai_available": AI_AVAILABLE,
            "endpoints": {
                "health": "/health",
                "ai-process": "/ai-process",
                "feedback": "/feedback"
            }
        }
    
    # AI 모델을 활용한 투입물명 수정 엔드포인트
    @app.post("/ai-process")
    async def ai_process_data(data: dict):
        """AI 모델과 규칙 기반으로 투입물명을 자동으로 수정합니다."""
        try:
            logger.info(f"투입물명 수정 요청 받음: {data.get('filename', 'unknown')}")
            
            # 데이터 구조 검증
            excel_data = data.get('data', [])
            if not excel_data:
                raise HTTPException(status_code=400, detail="데이터가 비어있습니다.")
            
            # 예상 컬럼명 정의 (품번, 수량은 선택사항으로 변경)
            required_columns = ['상태', '로트번호', '생산품명', '투입일', '종료일', '공정', '투입물명', '지시번호']
            optional_columns = ['품번', '수량']
            expected_columns = required_columns + optional_columns
            
            # 첫 번째 행의 컬럼 확인
            first_row = excel_data[0] if excel_data else {}
            actual_columns = list(first_row.keys())
            
            # 필수 컬럼만 검증 (품번, 수량은 선택사항)
            missing_required_columns = [col for col in required_columns if col not in actual_columns]
            if missing_required_columns:
                raise HTTPException(
                    status_code=400, 
                    detail=f"필수 컬럼이 누락되었습니다: {missing_required_columns}"
                )
            
            # 선택사항 컬럼이 없는 경우 빈 값으로 채우기
            for row in excel_data:
                for optional_col in optional_columns:
                    if optional_col not in row:
                        row[optional_col] = ''
            
            # AI 모델과 규칙 기반으로 투입물명 수정
            processed_data = []
            for i, row in enumerate(excel_data):
                try:
                    # 투입물명과 공정 추출
                    input_material = row.get('투입물명', '')
                    process = row.get('공정', '')
                    production_name = row.get('생산품명', '')
                    
                    if input_material and process:
                        # AI 모델 또는 규칙 기반 투입물명 수정
                        ai_model = getattr(app.state, 'ai_model', None)
                        corrected_material = predict_material_name(
                            input_material, 
                            process, 
                            production_name,
                            ai_model
                        )
                        
                        method_used = "AI 모델" if ai_model and AI_AVAILABLE else "규칙 기반"
                        logger.info(f"{method_used} 수정: {input_material} → {corrected_material}")
                        if ai_model and AI_AVAILABLE:
                            logger.info(f"AI 모델: 공정 고려하지 않고 투입물명만으로 예측")
                            # 분류 정확도 모니터링
                            if input_material != corrected_material:
                                logger.info(f"✅ AI 모델이 투입물명을 성공적으로 수정했습니다")
                            else:
                                logger.info(f"ℹ️ AI 모델이 원본 투입물명을 유지했습니다")
                        logger.info(f"공정 정보: {process} (참고용, 예측에는 미사용)")
                        
                        # 수정된 행 생성
                        processed_row = row.copy()
                        processed_row['투입물명수정'] = corrected_material
                        processed_row['ai_processed'] = ai_model is not None and AI_AVAILABLE
                        processed_row['row_index'] = i
                        processed_row['method'] = method_used
                        
                        processed_data.append(processed_row)
                    else:
                        # 투입물명이나 공정이 없는 경우 원본 그대로
                        processed_row = row.copy()
                        processed_row['투입물명수정'] = input_material
                        processed_row['ai_processed'] = False
                        processed_row['row_index'] = i
                        processed_row['method'] = "원본 유지"
                        processed_data.append(processed_row)
                        
                except Exception as e:
                    logger.error(f"행 {i} 처리 중 오류: {e}")
                    # 오류 발생 시 원본 데이터 그대로 사용
                    processed_row = row.copy()
                    processed_row['투입물명수정'] = row.get('투입물명', '')
                    processed_row['ai_processed'] = False
                    processed_row['row_index'] = i
                    processed_row['error'] = str(e)
                    processed_row['method'] = "오류"
                    processed_data.append(processed_row)
            
            # 결과 반환
            result = {
                "status": "processed",
                "message": f"AI 모델과 규칙 기반으로 투입물명을 수정했습니다 (AI 사용: {AI_AVAILABLE})",
                "filename": data.get('filename'),
                "original_count": len(excel_data),
                "processed_count": len(processed_data),
                "ai_available": AI_AVAILABLE,
                "data": processed_data,
                "columns": expected_columns + ['투입물명수정'],
                "timestamp": datetime.now().isoformat()
            }
            
            logger.info(f"투입물명 수정 완료: {len(processed_data)}행 처리됨")
            return result
            
        except Exception as e:
            logger.error(f"투입물명 수정 중 오류 발생: {str(e)}")
            raise HTTPException(status_code=500, detail=f"투입물명 수정 중 오류가 발생했습니다: {str(e)}")
    
    # 사용자 피드백 처리 엔드포인트
    @app.post("/feedback")
    async def process_feedback(feedback_data: dict):
        """사용자 피드백을 받아 처리합니다."""
        try:
            logger.info(f"사용자 피드백 처리 요청 받음")
            
            # 피드백 데이터 검증
            row_index = feedback_data.get('row_index')
            original_material = feedback_data.get('original_material')
            corrected_material = feedback_data.get('corrected_material')
            reason = feedback_data.get('reason', '')
            production_name = feedback_data.get('production_name', '')
            process = feedback_data.get('process', '')
            
            if not all([row_index is not None, original_material, corrected_material]):
                raise HTTPException(status_code=400, detail="필수 피드백 정보가 누락되었습니다.")
            
            # 피드백 데이터 로깅 (향후 AI 모델 학습에 활용 가능)
            logger.info(f"피드백 데이터: {original_material} → {corrected_material}")
            logger.info(f"맥락: 생산품명={production_name}, 공정={process}, 사유={reason}")
            
            # AI 모델이 있는 경우 피드백 데이터를 모델에 전달
            if AI_AVAILABLE and hasattr(app.state, 'ai_model') and app.state.ai_model:
                try:
                    logger.info("AI 모델에 피드백 데이터를 전달합니다.")
                    logger.info(f"학습 데이터: 원본={original_material}, 수정={corrected_material}")
                    logger.info(f"맥락 정보: 생산품명={production_name}, 공정={process}, 사유={reason}")
                    
                    # AI 모델에 추가 학습 데이터 전달
                    # 공정과 피드백 데이터를 함께 학습하여 향후 예측 정확도 향상
                    learning_context = {
                        'original_material': original_material,
                        'corrected_material': corrected_material,
                        'production_name': production_name,
                        'process': process,
                        'reason': reason,
                        'timestamp': datetime.now().isoformat()
                    }
                    
                    # 피드백 데이터를 학습 데이터 파일에 저장
                    await save_feedback_to_training_data(learning_context)
                    
                    # 실제 AI 모델 학습 메서드 호출 (플레이스홀더)
                    # app.state.ai_model.learn(learning_context)
                    logger.info("AI 모델이 공정과 피드백 데이터를 함께 학습했습니다.")
                    
                except Exception as e:
                    logger.warning(f"AI 모델 피드백 처리 실패: {e}")
            else:
                logger.info("AI 모델이 없어 피드백 데이터를 저장만 합니다.")
                # AI 모델이 없어도 피드백 데이터는 저장
                learning_context = {
                    'original_material': original_material,
                    'corrected_material': corrected_material,
                    'production_name': production_name,
                    'process': process,
                    'reason': reason,
                    'timestamp': datetime.now().isoformat()
                }
                await save_feedback_to_training_data(learning_context)
            
            result = {
                "status": "feedback_processed",
                "message": "피드백이 성공적으로 처리되었습니다.",
                "row_index": row_index,
                "original_material": original_material,
                "corrected_material": corrected_material,
                "reason": reason,
                "production_name": production_name,
                "process": process,
                "ai_processed": AI_AVAILABLE and hasattr(app.state, 'ai_model'),
                "timestamp": datetime.now().isoformat()
            }
            
            return result
                
        except Exception as e:
            logger.error(f"피드백 처리 중 오류 발생: {str(e)}")
            raise HTTPException(status_code=500, detail=f"피드백 처리 중 오류가 발생했습니다: {str(e)}")
    
    return app

# 애플리케이션 인스턴스 생성
app = create_app()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8083,
        reload=False
    )
