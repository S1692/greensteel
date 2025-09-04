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
# RAG 시스템용 임포트
import faiss
import chromadb
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any

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

# RAG 시스템용 전역 변수
embedding_model = None
vector_db = None
chroma_client = None
knowledge_collection = None

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
    """모델과 관련 데이터를 로드하는 함수 - 볼륨 우선, 없으면 Hugging Face에서 다운로드"""
    global model, vectorizer, id2label, label2id
    
    try:
        # Railway 볼륨 경로와 로컬 경로 확인
        volume_paths = {
            'model': '/app/models/pytorch_model.bin',
            'vectorizer': '/app/models/vectorizer.pkl', 
            'config': '/app/models/config.json'
        }
        
        local_paths = {
            'model': 'pytorch_model.bin',
            'vectorizer': 'vectorizer.pkl',
            'config': 'config.json'
        }
        
        # 파일 경로 결정 (볼륨 우선, 없으면 로컬, 없으면 Hugging Face)
        file_paths = {}
        for key in ['model', 'vectorizer', 'config']:
            if os.path.exists(volume_paths[key]):
                file_paths[key] = volume_paths[key]
                logger.info(f"볼륨에서 {key} 파일 발견: {volume_paths[key]}")
            elif os.path.exists(local_paths[key]):
                file_paths[key] = local_paths[key]
                logger.info(f"로컬에서 {key} 파일 발견: {local_paths[key]}")
            else:
                # Hugging Face에서 다운로드
                logger.info(f"Hugging Face Hub에서 {key} 파일 다운로드 중...")
                if key == 'model':
                    file_paths[key] = hf_hub_download(repo_id="Halftotter/flud", filename="pytorch_model.bin")
                elif key == 'vectorizer':
                    file_paths[key] = hf_hub_download(repo_id="Halftotter/flud", filename="vectorizer.pkl")
                elif key == 'config':
                    file_paths[key] = hf_hub_download(repo_id="Halftotter/flud", filename="config.json")
                logger.info(f"{key} 파일 다운로드 완료: {file_paths[key]}")
        
        # Load configuration
        with open(file_paths['config'], 'r', encoding='utf-8') as f:
            config = json.load(f)
        
        id2label = config['id2label']
        label2id = config['label2id']
        num_labels = config['num_labels']
        hidden_size = config['hidden_size']
        intermediate_size = config['intermediate_size']
        
        # Load vectorizer
        vectorizer = joblib.load(file_paths['vectorizer'])
        
        # Load model
        model = SimpleClassifier(
            input_size=3000,  # 고정된 input_size 사용
            hidden_size=hidden_size,
            intermediate_size=intermediate_size,
            num_labels=num_labels
        )
        model.load_state_dict(torch.load(file_paths['model'], map_location='cpu'))
        model.eval()
        
        logger.info("모델 로드 완료")
        return True
        
    except Exception as e:
        logger.error(f"모델 로드 실패: {str(e)}")
        return False

def initialize_rag_system():
    """RAG 시스템 초기화"""
    global embedding_model, vector_db, chroma_client, knowledge_collection
    
    try:
        logger.info("RAG 시스템 초기화 중...")
        
        # 임베딩 모델 로드 (한국어 지원)
        embedding_model = SentenceTransformer('jhgan/ko-sroberta-multitask')
        logger.info("임베딩 모델 로드 완료")
        
        # ChromaDB 클라이언트 초기화
        chroma_client = chromadb.PersistentClient(path="/app/models/chroma_db")
        
        # 컬렉션 생성 또는 가져오기
        try:
            knowledge_collection = chroma_client.get_collection("steel_knowledge")
            logger.info("기존 지식 컬렉션 로드 완료")
        except:
            knowledge_collection = chroma_client.create_collection(
                name="steel_knowledge",
                metadata={"description": "강철 산업 재료 분류 지식베이스"}
            )
            logger.info("새 지식 컬렉션 생성 완료")
        
        # 기존 지식 데이터가 없으면 기본 데이터 추가
        if knowledge_collection.count() == 0:
            initialize_knowledge_base()
        
        logger.info("RAG 시스템 초기화 완료")
        return True
        
    except Exception as e:
        logger.error(f"RAG 시스템 초기화 실패: {str(e)}")
        return False

def initialize_knowledge_base():
    """기본 지식베이스 초기화"""
    global knowledge_collection, embedding_model
    
    try:
        # config.json에서 라벨 정보를 가져와서 지식베이스에 추가
        if id2label:
            documents = []
            metadatas = []
            ids = []
            
            for label_id, label_name in id2label.items():
                # 각 재료에 대한 설명 생성
                description = f"{label_name}은(는) 강철 제조 공정에서 사용되는 중요한 재료입니다."
                
                documents.append(description)
                metadatas.append({
                    "label_id": label_id,
                    "label_name": label_name,
                    "category": "steel_material"
                })
                ids.append(f"material_{label_id}")
            
            # 벡터화 및 저장
            embeddings = embedding_model.encode(documents)
            
            knowledge_collection.add(
                documents=documents,
                metadatas=metadatas,
                ids=ids,
                embeddings=embeddings.tolist()
            )
            
            logger.info(f"기본 지식베이스 초기화 완료: {len(documents)}개 항목 추가")
            
    except Exception as e:
        logger.error(f"지식베이스 초기화 실패: {str(e)}")

def rag_search(query: str, top_k: int = 5) -> List[Dict[str, Any]]:
    """RAG 검색 수행"""
    global knowledge_collection, embedding_model
    
    try:
        if not knowledge_collection or not embedding_model:
            logger.warning("RAG 시스템이 초기화되지 않음")
            return []
        
        # 쿼리 임베딩
        query_embedding = embedding_model.encode([query])
        
        # 유사도 검색
        results = knowledge_collection.query(
            query_embeddings=query_embedding.tolist(),
            n_results=top_k
        )
        
        # 결과 포맷팅
        formatted_results = []
        if results['documents'] and results['documents'][0]:
            for i, doc in enumerate(results['documents'][0]):
                formatted_results.append({
                    'document': doc,
                    'metadata': results['metadatas'][0][i] if results['metadatas'] else {},
                    'distance': results['distances'][0][i] if results['distances'] else 0
                })
        
        return formatted_results
        
    except Exception as e:
        logger.error(f"RAG 검색 실패: {str(e)}")
        return []

def predict_material(text):
    """텍스트를 입력받아 재료를 분류하는 함수 (RAG 결합)"""
    try:
        # 디버깅용 코드
        print(f"입력 테스트: {text}")
        
        # RAG 검색으로 관련 지식 검색
        rag_results = rag_search(text, top_k=3)
        print(f"RAG 검색 결과: {len(rag_results)}개")
        
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
            'top5_predictions': top5_results,
            'rag_context': rag_results  # RAG 검색 결과 추가
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

@app.route('/rag/search', methods=['POST'])
def rag_search_endpoint():
    """RAG 검색 전용 엔드포인트"""
    try:
        data = request.get_json()
        
        if not data or 'query' not in data:
            return jsonify({
                'error': '검색 쿼리가 필요합니다.'
            }), 400
        
        query = data['query'].strip()
        top_k = data.get('top_k', 5)
        
        if not query:
            return jsonify({
                'error': '빈 검색 쿼리는 처리할 수 없습니다.'
            }), 400
        
        # RAG 검색 수행
        results = rag_search(query, top_k=top_k)
        
        return jsonify({
            'query': query,
            'results': results,
            'total_results': len(results)
        })
        
    except Exception as e:
        logger.error(f"RAG 검색 API 오류: {str(e)}")
        return jsonify({
            'error': f'RAG 검색 중 오류가 발생했습니다: {str(e)}'
        }), 500

@app.route('/', methods=['GET'])
def home():
    """홈페이지"""
    return jsonify({
        'message': '강철 산업 재료 분류 API',
        'version': '1.0.0',
        'endpoints': {
            'POST /predict': '텍스트를 입력받아 재료를 분류합니다 (RAG 결합).',
            'POST /rag/search': 'RAG 검색을 수행합니다.',
            'POST /debug': '디버깅용 상세 정보를 반환합니다.',
            'GET /labels': '사용 가능한 라벨 목록을 반환합니다.',
            'GET /health': '서버 상태를 확인합니다.'
        }
    })

if __name__ == '__main__':
    # 모델 로드
    if load_model():
        # RAG 시스템 초기화
        if initialize_rag_system():
            logger.info("RAG 시스템 초기화 완료")
        else:
            logger.warning("RAG 시스템 초기화 실패 - 기본 모델만 사용")
        
        port = int(os.environ.get('PORT', 8000))
        app.run(host='0.0.0.0', port=port, debug=False)
    else:
        logger.error("모델 로드 실패로 인해 서버를 시작할 수 없습니다.")
        exit(1)
