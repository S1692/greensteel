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
    """모델과 관련 데이터를 로드하는 함수 - 올바른 로드 방식"""
    global model, vectorizer, id2label, label2id
    
    try:
        logger.info("Hugging Face Hub에서 모델 파일들을 다운로드 중...")
        
        # Download model files
        model_path = hf_hub_download(repo_id="Halftotter/flud", filename="pytorch_model.bin")
        vectorizer_path = hf_hub_download(repo_id="Halftotter/flud", filename="vectorizer.pkl")
        config_path = hf_hub_download(repo_id="Halftotter/flud", filename="config.json")
        
        logger.info(f"모델 파일 다운로드 완료: {model_path}")
        logger.info(f"벡터라이저 파일 다운로드 완료: {vectorizer_path}")
        logger.info(f"설정 파일 다운로드 완료: {config_path}")
        
        # Load configuration
        with open(config_path, 'r', encoding='utf-8') as f:
            config = json.load(f)
        
        id2label = config['id2label']
        label2id = config['label2id']
        num_labels = config['num_labels']
        hidden_size = config['hidden_size']
        intermediate_size = config['intermediate_size']
        
        # Load vectorizer
        vectorizer = joblib.load(vectorizer_path)
        
        # Load model
        model = SimpleClassifier(
            input_size=3000,  # 고정된 input_size 사용
            hidden_size=hidden_size,
            intermediate_size=intermediate_size,
            num_labels=num_labels
        )
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
        # 디버깅용 코드
        print(f"입력 테스트: {text}")
        
        # 텍스트 벡터화
        text_vector = vectorizer.transform([text]).toarray()
        print(f"벡터화 후 형태: {text_vector.shape}")
        
        text_tensor = torch.FloatTensor(text_vector)
        print(f"텐서 형태: {text_tensor.shape}")
        
        # 예측
        with torch.no_grad():
            outputs = model(text_tensor)
            print(f"모델 출력 형태: {outputs.shape}")
            
            probabilities = F.softmax(outputs, dim=1)
            print(f"확률 분포: {probabilities}")
            
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

@app.route('/labels', methods=['GET'])
def get_labels():
    """사용 가능한 라벨 목록 반환"""
    return jsonify({
        'labels': list(label2id.keys()) if label2id else [],
        'total_count': len(label2id) if label2id else 0
    })

@app.route('/debug', methods=['POST'])
def debug_prediction():
    """디버깅용 예측 엔드포인트 - 상세한 디버깅 정보 반환"""
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
        
        # 디버깅 정보 수집
        debug_info = {
            'input_text': text,
            'vectorizer_vocab_size': len(vectorizer.vocabulary_) if hasattr(vectorizer, 'vocabulary_') else 'Unknown',
            'model_input_size': 3000,  # 고정된 input_size
            'model_num_classes': len(id2label) if id2label else 'Unknown'
        }
        
        # 텍스트 벡터화
        text_vector = vectorizer.transform([text]).toarray()
        debug_info['vector_shape'] = text_vector.shape.tolist()
        debug_info['vector_nonzero_count'] = int(np.count_nonzero(text_vector))
        
        # 텐서 변환
        text_tensor = torch.FloatTensor(text_vector)
        debug_info['tensor_shape'] = list(text_tensor.shape)
        
        # 예측
        with torch.no_grad():
            outputs = model(text_tensor)
            debug_info['model_output_shape'] = list(outputs.shape)
            
            probabilities = F.softmax(outputs, dim=1)
            predicted_class = torch.argmax(probabilities, dim=1).item()
            
            debug_info['predicted_class_id'] = int(predicted_class)
            debug_info['predicted_label'] = id2label[str(predicted_class)] if id2label else 'Unknown'
            debug_info['confidence'] = float(probabilities[0][predicted_class].item())
            debug_info['all_probabilities'] = probabilities[0].tolist()
        
        return jsonify(debug_info)
        
    except Exception as e:
        logger.error(f"디버깅 API 오류: {str(e)}")
        return jsonify({
            'error': f'디버깅 중 오류가 발생했습니다: {str(e)}'
        }), 500

@app.route('/', methods=['GET'])
def home():
    """홈페이지"""
    return jsonify({
        'message': '강철 산업 재료 분류 API',
        'version': '1.0.0',
        'endpoints': {
            'POST /predict': '텍스트를 입력받아 재료를 분류합니다.',
            'POST /debug': '디버깅용 상세 정보를 반환합니다.',
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
