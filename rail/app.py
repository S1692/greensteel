import os
import json
import torch
import torch.nn.functional as F
import pickle
import joblib
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from huggingface_hub import hf_hub_download

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# 전역 변수로 모델과 관련 데이터 저장
model = None
vectorizer = None
id2label = None
label2id = None

class SimpleClassifier(torch.nn.Module):
    """간단한 분류기 모델 클래스"""
    def __init__(self, input_size, hidden_size, intermediate_size, num_labels):
        super(SimpleClassifier, self).__init__()
        self.fc1 = torch.nn.Linear(input_size, hidden_size)
        self.fc2 = torch.nn.Linear(hidden_size, intermediate_size)
        self.fc3 = torch.nn.Linear(intermediate_size, num_labels)
        self.dropout = torch.nn.Dropout(0.1)
        
    def forward(self, x):
        x = F.relu(self.fc1(x))
        x = self.dropout(x)
        x = F.relu(self.fc2(x))
        x = self.dropout(x)
        x = self.fc3(x)
        return x

def load_model():
    """모델과 관련 데이터를 로드하는 함수 - Hugging Face Hub에서 다운로드"""
    global model, vectorizer, id2label, label2id
    
    try:
        logger.info("Hugging Face Hub에서 모델 파일들을 다운로드 중...")
        
        # Hugging Face Hub에서 모델 파일들 다운로드
        model_path = hf_hub_download(repo_id="Halftotter/flud", filename="pytorch_model.bin")
        vectorizer_path = hf_hub_download(repo_id="Halftotter/flud", filename="vectorizer.pkl")
        config_path = hf_hub_download(repo_id="Halftotter/flud", filename="config.json")
        
        logger.info(f"모델 파일 다운로드 완료: {model_path}")
        logger.info(f"벡터라이저 파일 다운로드 완료: {vectorizer_path}")
        logger.info(f"설정 파일 다운로드 완료: {config_path}")
        
        # 설정 파일 로드
        with open(config_path, 'r', encoding='utf-8') as f:
            config = json.load(f)
        
        id2label = config['id2label']
        label2id = config['label2id']
        num_labels = config['num_labels']
        hidden_size = config['hidden_size']
        intermediate_size = config['intermediate_size']
        
        # 벡터라이저 로드
        vectorizer = joblib.load(vectorizer_path)
        
        # 모델 로드 (고정된 input_size 사용)
        model = SimpleClassifier(
            input_size=3000,  # TF-IDF 벡터 크기 고정
            hidden_size=hidden_size,
            intermediate_size=intermediate_size,
            num_labels=num_labels
        )
        
        # 모델 가중치 로드
        model.load_state_dict(torch.load(model_path, map_location='cpu'))
        model.eval()
        
        logger.info("모델 로드 완료")
        return True
        
    except Exception as e:
        logger.error(f"모델 로드 실패: {str(e)}")
        return False

def predict_material(text):
    """텍스트를 입력받아 재료를 분류하는 함수"""
    try:
        # 텍스트 벡터화
        text_vector = vectorizer.transform([text]).toarray()
        text_tensor = torch.FloatTensor(text_vector)
        
        # 예측
        with torch.no_grad():
            outputs = model(text_tensor)
            probabilities = F.softmax(outputs, dim=1)
            predicted_class = torch.argmax(probabilities, dim=1).item()
        
        # 결과 반환
        label = id2label[str(predicted_class)]
        confidence = probabilities[0][predicted_class].item()
        
        # 상위 5개 예측 결과
        top5_indices = torch.topk(probabilities, 5).indices[0]
        top5_results = []
        for idx in top5_indices:
            top5_results.append({
                'label': id2label[str(idx.item())],
                'confidence': probabilities[0][idx].item()
            })
        
        return {
            'predicted_label': label,
            'confidence': confidence,
            'top5_predictions': top5_results
        }
        
    except Exception as e:
        logger.error(f"예측 실패: {str(e)}")
        return None

@app.route('/health', methods=['GET'])
def health_check():
    """헬스 체크 엔드포인트"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None
    })

@app.route('/predict', methods=['POST'])
def predict():
    """재료 분류 예측 엔드포인트"""
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                'error': '텍스트 입력이 필요합니다.'
            }), 400
        
        text = data['text'].strip()
        
        if not text:
            return jsonify({
                'error': '빈 텍스트는 처리할 수 없습니다.'
            }), 400
        
        # 예측 수행
        result = predict_material(text)
        
        if result is None:
            return jsonify({
                'error': '예측 중 오류가 발생했습니다.'
            }), 500
        
        return jsonify({
            'input_text': text,
            'prediction': result
        })
        
    except Exception as e:
        logger.error(f"API 오류: {str(e)}")
        return jsonify({
            'error': '서버 오류가 발생했습니다.'
        }), 500

@app.route('/data', methods=['POST'])
def data_endpoint():
    """Hugging Face API 호환 엔드포인트"""
    try:
        data = request.get_json()
        
        if not data or 'inputs' not in data:
            return jsonify({
                'error': '입력 데이터가 필요합니다.'
            }), 400
        
        inputs = data['inputs']
        
        if isinstance(inputs, str):
            # 단일 텍스트 입력
            text = inputs.strip()
            if not text:
                return jsonify({
                    'error': '빈 텍스트는 처리할 수 없습니다.'
                }), 400
            
            result = predict_material(text)
            if result is None:
                return jsonify({
                    'error': '예측 중 오류가 발생했습니다.'
                }), 500
            
            # Hugging Face API 형식으로 응답
            return jsonify([{
                'label': result['predicted_label'],
                'score': result['confidence']
            }])
            
        elif isinstance(inputs, list):
            # 배치 입력
            results = []
            for text in inputs:
                if isinstance(text, str) and text.strip():
                    result = predict_material(text.strip())
                    if result:
                        results.append({
                            'label': result['predicted_label'],
                            'score': result['confidence']
                        })
                    else:
                        results.append({
                            'label': 'unknown',
                            'score': 0.0
                        })
            
            return jsonify(results)
        
        else:
            return jsonify({
                'error': '잘못된 입력 형식입니다.'
            }), 400
        
    except Exception as e:
        logger.error(f"Data API 오류: {str(e)}")
        return jsonify({
            'error': f'데이터 처리 중 오류가 발생했습니다: {str(e)}'
        }), 500

@app.route('/labels', methods=['GET'])
def get_labels():
    """사용 가능한 라벨 목록 반환"""
    return jsonify({
        'labels': list(label2id.keys()) if label2id else [],
        'total_count': len(label2id) if label2id else 0
    })

@app.route('/', methods=['GET'])
def home():
    """홈페이지"""
    return jsonify({
        'message': '강철 산업 재료 분류 API',
        'version': '1.0.0',
        'endpoints': {
            'POST /predict': '텍스트를 입력받아 재료를 분류합니다.',
            'POST /data': 'Hugging Face API 호환 엔드포인트 (단일/배치 입력 지원).',
            'GET /labels': '사용 가능한 라벨 목록을 반환합니다.',
            'GET /health': '서버 상태를 확인합니다.'
        }
    })

if __name__ == '__main__':
    # 모델 로드
    if load_model():
        port = int(os.environ.get('PORT', 8000))
        app.run(host='0.0.0.0', port=port, debug=False)
    else:
        logger.error("모델 로드 실패로 인해 서버를 시작할 수 없습니다.")
        exit(1)
