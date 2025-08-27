#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys
sys.path.append('app')

from app.ananke.model import XMLRoBERTaClassifier

def test_model_load():
    print("=== AI 모델 로드 테스트 ===")
    
    # 모델 경로 설정
    current_dir = os.path.dirname(os.path.abspath(__file__))
    model_dir = os.path.join(current_dir, "app", "data", "studied", "model_v24", "model_v24")
    
    print(f"모델 디렉토리: {model_dir}")
    print(f"디렉토리 존재: {os.path.exists(model_dir)}")
    
    if os.path.exists(model_dir):
        model_files = os.listdir(model_dir)
        print(f"모델 파일들: {model_files}")
        
        try:
            print("\n🤖 AI 모델 로드 시작...")
            ai_model = XMLRoBERTaClassifier(model_dir=model_dir)
            print("✅ AI 모델 로드 성공!")
            
            # 분류기 확인
            if hasattr(ai_model, 'classifier') and ai_model.classifier is not None:
                print("✅ 분류기 로드 성공!")
            else:
                print("❌ 분류기 로드 실패!")
            
            # 레이블 임베딩 확인
            if hasattr(ai_model, 'label_embeddings') and ai_model.label_embeddings:
                print(f"✅ 레이블 임베딩 로드 성공: {len(ai_model.label_embeddings)}개")
                print(f"레이블들: {list(ai_model.label_embeddings.keys())}")
            else:
                print("❌ 레이블 임베딩 로드 실패!")
            
            # 예측 테스트
            print("\n🧪 예측 테스트...")
            test_input = "철"
            try:
                results = ai_model.predict(test_input)
                print(f"예측 결과: {results}")
                if results and len(results) > 0:
                    print(f"✅ 예측 성공: {test_input} → {results[0]['label']} (신뢰도: {results[0]['similarity']:.1f}%)")
                else:
                    print("❌ 예측 결과 없음")
            except Exception as pred_error:
                print(f"❌ 예측 실패: {pred_error}")
                import traceback
                traceback.print_exc()
                
        except Exception as e:
            print(f"❌ AI 모델 로드 실패: {e}")
            import traceback
            traceback.print_exc()
    else:
        print("❌ 모델 디렉토리가 존재하지 않습니다")

if __name__ == "__main__":
    test_model_load()



