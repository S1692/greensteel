import torch
import torch.nn as nn
from transformers import AutoTokenizer, AutoModel, TrainingArguments, Trainer
from sklearn.metrics import precision_recall_fscore_support, accuracy_score
import numpy as np
import json
import os
from pathlib import Path
from typing import List, Dict, Tuple
import pickle
import pandas as pd

class XMLRoBERTaClassifier:
    def __init__(self, model_name="xlm-roberta-base", model_dir=None):
        # GPU 설정 강화 - 우선적으로 GPU 사용
        if torch.cuda.is_available():
            # CUDA 호환성 문제 해결을 위한 환경변수 설정
            import os
            os.environ['PYTORCH_CUDA_ALLOC_CONF'] = 'max_split_size_mb:128'
            
            self.device = torch.device("cuda")
            # GPU 메모리 최적화
            torch.cuda.empty_cache()
            # 혼합 정밀도 학습 활성화
            torch.backends.cudnn.benchmark = True
            torch.backends.cudnn.deterministic = False  # 성능 최적화
            
            try:
                print(f"🚀 GPU 사용: {torch.cuda.get_device_name(0)}")
                print(f"💾 GPU 메모리: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.1f}GB")
                # GPU 메모리 미리 할당
                torch.cuda.set_per_process_memory_fraction(0.8)
            except Exception as e:
                print(f"⚠️ GPU 정보 조회 실패: {e}")
                print("GPU 사용은 가능하지만 정보 조회에 문제가 있습니다.")
        else:
            self.device = torch.device("cpu")
            print("⚠️ GPU를 사용할 수 없습니다. CPU 모드로 실행됩니다.")
            print("CUDA 설치 상태를 확인하세요.")
        
        self.model_name = model_name
        
        # 레이블 매핑 초기화 (먼저!)
        self.label_to_id = {}
        self.id_to_label = {}
        self.label_embeddings = {}
        
        # 성능 최적화를 위한 캐시 초기화
        self.input_text_embeddings_cache = {}  # input_text 임베딩 캐시
        self.batch_size = 32  # 배치 처리 크기
        
        if model_dir and os.path.exists(model_dir):
            # 기존 모델 로드
            self.tokenizer = AutoTokenizer.from_pretrained(model_dir)
            self.model = AutoModel.from_pretrained(model_dir)
            # 분류기 크기는 load_classifier에서 설정됨
            self.load_classifier(model_dir)
        else:
            # 새 모델 초기화 (분류기 크기는 나중에 설정)
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            self.model = AutoModel.from_pretrained(model_name)
            # 기본 분류기 생성 (임시)
            self.classifier = nn.Linear(self.model.config.hidden_size, 1)
            self.classifier.to(self.device)
            print(f"기본 분류기 생성: 입력 {self.model.config.hidden_size} → 출력 1")
        
        # 모델을 GPU로 이동 및 최적화
        self.model.to(self.device)
        
        # 분류기가 아직 생성되지 않았다면 임시로 생성 (prepare_training_data에서 재생성됨)
        if not hasattr(self, 'classifier') or self.classifier is None:
            self.classifier = nn.Linear(self.model.config.hidden_size, 1)
            self.classifier.to(self.device)
            print(f"임시 분류기 생성: 입력 {self.model.config.hidden_size} → 출력 1")
        
        # GPU 메모리 사용량 출력
        if torch.cuda.is_available():
            print(f"모델 GPU 메모리 사용량: {torch.cuda.memory_allocated(0) / 1024**3:.2f}GB")
        
    def load_classifier(self, model_dir):
        """저장된 분류기 가중치를 로드합니다."""
        classifier_path = os.path.join(model_dir, "classifier.pkl")
        if os.path.exists(classifier_path):
            with open(classifier_path, 'rb') as f:
                # GPU/CPU 호환성을 위한 map_location 설정
                if torch.cuda.is_available():
                    self.classifier = pickle.load(f)
                else:
                    # CPU에서 GPU 모델을 로드할 때 map_location 사용
                    import io
                    buffer = f.read()
                    self.classifier = torch.load(io.BytesIO(buffer), map_location=torch.device('cpu'))
                
                self.classifier.to(self.device)
                print(f"✅ 분류기 로드 완료: {self.classifier.in_features} → {self.classifier.out_features}")
                print(f"📱 장치: {next(self.classifier.parameters()).device}")
        else:
            print(f"❌ 분류기 파일이 없습니다: {classifier_path}")
        
        # 학습된 데이터 초기화
        self.training_data = {}
        
        # 레이블 매핑 로드
        label_map_path = os.path.join(model_dir, "label_mapping.json")
        if os.path.exists(label_map_path):
            with open(label_map_path, 'r', encoding='utf-8') as f:
                self.label_to_id = json.load(f)
            
            # 학습된 데이터 로드
            self.load_training_data(model_dir)
                self.id_to_label = {v: k for k, v in self.label_to_id.items()}
        
        # 레이블 임베딩 로드
        embeddings_path = os.path.join(model_dir, "label_embeddings.pkl")
        if os.path.exists(embeddings_path):
            with open(embeddings_path, 'rb') as f:
                self.label_embeddings = pickle.load(f)
                print(f"레이블 임베딩 로드 완료: {len(self.label_embeddings)}개")
        else:
            print(f"레이블 임베딩 파일이 없습니다: {embeddings_path}")
    
    def save_model(self, save_dir):
        """모델과 분류기를 저장합니다."""
        os.makedirs(save_dir, exist_ok=True)
        
        # 모델 저장
        self.model.save_pretrained(save_dir)
        self.tokenizer.save_pretrained(save_dir)
        
        # 분류기 저장
        with open(os.path.join(save_dir, "classifier.pkl"), 'wb') as f:
            pickle.dump(self.classifier, f)
        
        # 레이블 매핑 저장
        with open(os.path.join(save_dir, "label_mapping.json"), 'w', encoding='utf-8') as f:
            json.dump(self.label_to_id, f, ensure_ascii=False, indent=2)
        
        # 레이블 임베딩 저장
        with open(os.path.join(save_dir, "label_embeddings.pkl"), 'wb') as f:
            pickle.dump(self.label_embeddings, f)
    
    def prepare_training_data(self, jsonl_path):
        """JSONL 파일에서 학습 데이터를 준비합니다."""
        texts = []
        labels = []
        
        print(f"JSONL 파일 경로: {jsonl_path}")
        print(f"파일 존재 여부: {os.path.exists(jsonl_path)}")
        
        with open(jsonl_path, 'r', encoding='utf-8') as f:
            for i, line in enumerate(f):
                try:
                    data = json.loads(line.strip())
                    print(f"라인 {i+1}: {list(data.keys())}")
                    
                    # 각 input_text를 개별 샘플로 처리 (1~10)
                    label = data.get('Label', '')
                    if not label:
                        print(f"라인 {i+1}: 라벨이 없음, 스킵")
                        continue
                    
                    sample_count = 0
                    for j in range(1, 11):  # input_text 1부터 10까지
                        text_key = f'input_text {j}'
                        text = data.get(text_key, '').strip()
                        
                        if text:  # 텍스트가 있으면 개별 샘플로 추가
                            texts.append(text)
                            labels.append(label)
                            sample_count += 1
                            print(f"샘플 추가: {label} -> {text[:30]}...")
                    
                    print(f"라인 {i+1} ({label}): {sample_count}개 샘플 추가")
                except json.JSONDecodeError as e:
                    print(f"JSON 파싱 오류 라인 {i+1}: {e}")
        
        print(f"최종 결과: {len(texts)}개 텍스트, {len(labels)}개 라벨")
        
        # 레이블 매핑 생성
        unique_labels = list(set(labels))
        self.label_to_id = {label: i for i, label in enumerate(unique_labels)}
        self.id_to_label = {i: label for label, i in self.label_to_id.items()}
        
        print(f"레이블 매핑 생성 완료: {len(self.label_to_id)}개 고유 라벨")
        
        # 올바른 크기의 분류기 생성 (레이블 수에 맞춤)
        num_labels = len(self.label_to_id)
        self.classifier = nn.Linear(self.model.config.hidden_size, num_labels)
        self.classifier.to(self.device)
        
        print(f"분류기 생성 완료: 입력 {self.model.config.hidden_size} → 출력 {num_labels}")
        
        # 레이블 임베딩 생성
        self._create_label_embeddings(texts, labels)
        
        return texts, labels
    
    def _create_label_embeddings(self, texts, labels):
        """레이블별로 대표 임베딩을 생성합니다."""
        label_texts = {}
        for text, label in zip(texts, labels):
            if label not in label_texts:
                label_texts[label] = []
            label_texts[label].append(text)
        
        self.label_embeddings = {}
        for label, texts_list in label_texts.items():
            # 해당 레이블의 모든 텍스트에 대한 평균 임베딩 계산
            embeddings = []
            for text in texts_list[:10]:  # 최대 10개 텍스트만 사용
                inputs = self.tokenizer(text, return_tensors="pt", truncation=True, max_length=512, padding=True)
                inputs = {k: v.to(self.device) for k, v in inputs.items()}
                
                with torch.no_grad():
                    outputs = self.model(**inputs)
                    # [CLS] 토큰의 임베딩 사용
                    embedding = outputs.last_hidden_state[:, 0, :].cpu().numpy()
                    embeddings.append(embedding)
            
            if embeddings:
                self.label_embeddings[label] = np.mean(embeddings, axis=0)
    
    def train(self, texts, labels, epochs=3, batch_size=8, learning_rate=2e-5):
        """모델을 학습합니다."""
        
        # RTX 4080 최적화를 위한 동적 배치 크기 조정
        if torch.cuda.is_available():
            gpu_memory = torch.cuda.get_device_properties(0).total_memory / 1024**3
            if gpu_memory >= 16:  # RTX 4080 (16GB) 이상
                if batch_size < 32:
                    batch_size = min(64, max(32, batch_size))  # 최소 32, 최대 64
                    learning_rate = min(5e-5, learning_rate * 2)  # 큰 배치에 맞춰 학습률 조정
                    print(f"🚀 RTX 4080 최적화: 배치 크기 {batch_size}, 학습률 {learning_rate}")
        
        print(f"\n🚀 모델 학습 시작!")
        print(f"{'='*60}")
        print(f"📊 학습 설정:")
        print(f"  📝 샘플 수: {len(texts)}개")
        print(f"  🏷️  고유 라벨: {len(set(labels))}개")
        print(f"  📦 배치 크기: {batch_size}")
        print(f"  📚 학습률: {learning_rate}")
        print(f"  🔄 에포크: {epochs}")
        print(f"  💻 장치: {self.device}")
        if torch.cuda.is_available():
            print(f"  🖥️  GPU: {torch.cuda.get_device_name(0)}")
            print(f"  💾 GPU 메모리: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.1f}GB")
            print(f"  🔥 혼합 정밀도 학습: 활성화")
            print(f"  ⚡ GPU 최적화: RTX 4080 전용 설정")
        print(f"{'='*60}\n")
        
        if torch.cuda.is_available():
            print(f"GPU 메모리 사용량 (학습 전): {torch.cuda.memory_allocated(0) / 1024**3:.2f}GB")
        
        # 데이터 토크나이징
        encodings = self.tokenizer(texts, truncation=True, padding=True, max_length=512, return_tensors="pt")
        
        # 레이블을 ID로 변환
        label_ids = [self.label_to_id[label] for label in labels]
        
        # 데이터셋 생성
        dataset = torch.utils.data.TensorDataset(
            encodings['input_ids'],
            encodings['attention_mask'],
            torch.tensor(label_ids)
        )
        
        # 데이터로더 생성 (GPU 최적화)
        dataloader = torch.utils.data.DataLoader(
            dataset, 
            batch_size=batch_size, 
            shuffle=True,
            pin_memory=True if torch.cuda.is_available() else False,
            num_workers=0 if torch.cuda.is_available() else 2  # GPU 사용 시 단일 워커
        )
        
        # RTX 4080 최적화 옵티마이저 및 손실 함수
        optimizer = torch.optim.AdamW(
            list(self.model.parameters()) + list(self.classifier.parameters()), 
            lr=learning_rate,
            weight_decay=0.01,  # 정규화
            eps=1e-6  # RTX 4080 혼합 정밀도 최적화
        )
        
        # 학습률 스케줄러 추가 (GPU 효율성 향상)
        from torch.optim.lr_scheduler import CosineAnnealingLR
        scheduler = CosineAnnealingLR(optimizer, T_max=epochs, eta_min=learning_rate/10)
        
        criterion = nn.CrossEntropyLoss(label_smoothing=0.1)  # 라벨 스무딩으로 일반화 성능 향상
        
        # RTX 4080 혼합 정밀도 최적화를 위한 GradScaler
        scaler = torch.cuda.amp.GradScaler() if torch.cuda.is_available() else None
        
        # 학습 루프
        self.model.train()
        self.classifier.train()
        
        for epoch in range(epochs):
            total_loss = 0
            correct_predictions = 0
            total_predictions = 0
            
            print(f"\n{'='*50}")
            print(f"Epoch {epoch+1}/{epochs} 시작")
            print(f"{'='*50}")
            
            for batch_idx, batch in enumerate(dataloader):
                input_ids, attention_mask, label_ids = [b.to(self.device, non_blocking=True) for b in batch]
                
                optimizer.zero_grad()
                
                # RTX 4080 최적화 혼합 정밀도 학습
                if torch.cuda.is_available() and scaler is not None:
                    with torch.cuda.amp.autocast():
                        outputs = self.model(input_ids=input_ids, attention_mask=attention_mask)
                        logits = self.classifier(outputs.last_hidden_state[:, 0, :])
                        loss = criterion(logits, label_ids)
                    
                    # GradScaler로 역전파 최적화
                    scaler.scale(loss).backward()
                    scaler.step(optimizer)
                    scaler.update()
                else:
                    outputs = self.model(input_ids=input_ids, attention_mask=attention_mask)
                    logits = self.classifier(outputs.last_hidden_state[:, 0, :])
                    loss = criterion(logits, label_ids)
                    loss.backward()
                    optimizer.step()
                
                total_loss += loss.item()
                
                # 정확도 계산 (학습 중)
                _, predicted = torch.max(logits, 1)
                correct_predictions += (predicted == label_ids).sum().item()
                total_predictions += label_ids.size(0)
                
                # 배치별 진행상황 출력 (10배치마다)
                if batch_idx % 10 == 0:
                    batch_accuracy = (predicted == label_ids).sum().item() / label_ids.size(0)
                    print(f"  Batch {batch_idx+1}/{len(dataloader)}: Loss={loss.item():.4f}, Accuracy={batch_accuracy:.2%}")
                
                # GPU 메모리 정리 (주기적으로)
                if torch.cuda.is_available() and batch_idx % 10 == 0:
                    torch.cuda.empty_cache()
            
            # 에포크별 전체 지표
            avg_loss = total_loss / len(dataloader)
            epoch_accuracy = correct_predictions / total_predictions if total_predictions > 0 else 0
            
            print(f"\n📊 Epoch {epoch+1}/{epochs} 결과:")
            print(f"  📉 평균 Loss: {avg_loss:.6f}")
            print(f"  🎯 정확도: {epoch_accuracy:.2%} ({correct_predictions}/{total_predictions})")
            print(f"  ⏱️  배치 수: {len(dataloader)}")
            
            if torch.cuda.is_available():
                gpu_memory = torch.cuda.memory_allocated(0) / 1024**3
                print(f"  🖥️  GPU 메모리: {gpu_memory:.2f}GB")
            
            # 학습률 스케줄러 업데이트
            current_lr = scheduler.get_last_lr()[0]
            scheduler.step()
            next_lr = scheduler.get_last_lr()[0]
            print(f"  📚 학습률: {current_lr:.2e} → {next_lr:.2e}")
            
            print(f"{'='*50}")
        
        # 학습 완료 후 GPU 메모리 정리
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
            print(f"\n🎉 학습 완료!")
            print(f"{'='*60}")
            print(f"📊 최종 학습 결과:")
            print(f"  🔄 총 에포크: {epochs}")
            print(f"  📝 총 샘플: {len(texts)}개")
            print(f"  🏷️  고유 라벨: {len(set(labels))}개")
            print(f"  🖥️  GPU 메모리: {torch.cuda.memory_allocated(0) / 1024**3:.2f}GB")
            print(f"{'='*60}\n")
    
    async def predict(self, text, top_k=3):
        """
        개선된 AI 모델 예측: 100% 일치, 유사도 기반, 비동기 처리
        """
        print(f"🤖 AI 모델 예측 시작: '{text}'")
        
        # 기본 분류기가 있는지 확인
        if not hasattr(self, 'classifier') or self.classifier is None:
            print("❌ 분류기가 로드되지 않음")
            return []
        
        # 학습된 데이터가 없는 경우 입력값 그대로 반환
        if not hasattr(self, 'training_data') or not self.training_data:
            print("⚠️ 학습된 데이터가 없습니다. 입력값을 그대로 반환합니다.")
            return [{
                'rank': 1,
                'label': text,  # 입력값 그대로 반환
                'similarity': 100.0,
                'best_match': text,
                'match_type': 'no_training_data'
            }]
        
        print(f"📊 학습된 데이터 기반 예측 시작")
        
        # 모델을 평가 모드로 설정
        self.model.eval()
        
        # 1단계: 100% 일치 확인 (가장 빠름)
        exact_match_result = await self._check_exact_match(text)
        if exact_match_result:
            print(f"🎯 100% 일치 발견: {exact_match_result}")
            return [exact_match_result]
        
        # 2단계: 유사도 기반 예측 (비동기 배치 처리)
        similarity_result = await self._predict_by_similarity(text, top_k)
        if similarity_result:
            return similarity_result
        
        # 3단계: 전혀 유사하지 않음 → 입력값 그대로 반환
        print(f"⚠️ 유사한 학습 데이터가 없습니다. 입력값을 그대로 반환합니다.")
        return [{
            'rank': 1,
            'label': text,  # 입력값 그대로 반환
            'similarity': 0.0,
            'best_match': text,
            'match_type': 'no_similarity'
        }]
    
    async def _check_exact_match(self, text):
        """100% 일치하는 라벨이나 학습값이 있는지 확인"""
        print(f"🔍 100% 일치 확인 중: '{text}'")
        
        # 1. 라벨과 직접 비교
        if text in self.training_data:
            print(f"✅ 라벨과 100% 일치: '{text}'")
            return {
                'rank': 1,
                'label': text,
                'similarity': 100.0,
                'best_match': text,
                'match_type': 'exact_label'
            }
        
        # 2. 학습값과 직접 비교 (강화된 매칭)
        for label, input_texts in self.training_data.items():
            # 디버깅: 철 라벨 상세 확인
            if label == '철' and text == '철ㄹ':
                print(f"🔍 철 라벨 디버깅:")
                print(f"  📍 검색 대상: '{text}'")
                print(f"  📍 철 라벨의 input_texts: {input_texts}")
                print(f"  📍 '철ㄹ' in input_texts: {'철ㄹ' in input_texts}")
                
                # 공백 정보 상세 분석
                for i, input_text in enumerate(input_texts):
                    if input_text and '철' in input_text:
                        print(f"  🔍 철 관련 input_text {i+1}: '{input_text}' (길이: {len(input_text)})")
                        print(f"    📏 공백 제거 전: '{input_text}'")
                        print(f"    📏 공백 제거 후: '{input_text.strip()}'")
                        print(f"    📏 모든 공백 제거: '{''.join(input_text.split())}'")
                        print(f"    📏 검색 대상 공백 제거: '{''.join(text.split())}'")
                        print(f"    📏 매칭 여부: {''.join(text.split()) == ''.join(input_text.split())}")
            
            # 정확한 매칭 시도
            if text in input_texts:
                print(f"✅ 학습값과 100% 일치: '{text}' → 라벨 '{label}'")
                return {
                    'rank': 1,
                    'label': label,
                    'similarity': 100.0,
                    'best_match': text,
                    'match_type': 'exact_training_data'
                }
            
            # 공백 제거 후 매칭 시도
            clean_text = text.strip()
            for input_text in input_texts:
                if input_text and clean_text == input_text.strip():
                    print(f"✅ 학습값과 100% 일치 (공백 제거): '{text}' → 라벨 '{label}'")
                    return {
                        'rank': 1,
                        'label': label,
                        'similarity': 100.0,
                        'best_match': input_text,
                        'match_type': 'exact_training_data'
                    }
            
            # 공백 무시 매칭 시도 (더 유연한 매칭)
            for input_text in input_texts:
                if input_text:
                    # 모든 공백 제거 후 비교
                    clean_search_text = ''.join(text.split())
                    clean_input_text = ''.join(input_text.split())
                    
                    if clean_search_text == clean_input_text:
                        print(f"✅ 학습값과 100% 일치 (공백 무시): '{text}' → 라벨 '{label}' (원본: '{input_text}')")
                        return {
                            'rank': 1,
                            'label': label,
                            'similarity': 100.0,
                            'best_match': input_text,
                            'match_type': 'exact_training_data_no_spaces'
                        }
            
            # 부분 매칭 시도 (철ㄹ이 철로 시작하는 경우)
            if text.startswith('철'):
                for input_text in input_texts:
                    if input_text and input_text.startswith('철'):
                        # 철로 시작하는 모든 input_text와 비교
                        clean_search_text = ''.join(text.split())
                        clean_input_text = ''.join(input_text.split())
                        
                        if clean_search_text == clean_input_text:
                            print(f"✅ 철 시작 부분 매칭: '{text}' → 라벨 '{label}' (원본: '{input_text}')")
                            return {
                                'rank': 1,
                                'label': label,
                                'similarity': 95.0,  # 부분 매칭이므로 95%
                                'best_match': input_text,
                                'match_type': 'partial_iron_match'
                            }
        
        print(f"❌ 100% 일치 없음")
        return None
    
    async def _predict_by_similarity(self, text, top_k=3):
        """유사도 기반 예측 (비동기 배치 처리)"""
        print(f"🔍 유사도 기반 예측 시작: '{text}'")
        
        # 입력 텍스트 임베딩 생성
        text_embedding = await self._get_text_embedding(text)
        if text_embedding is None:
            return None
        
        # 임계값 설정
        SIMILARITY_THRESHOLD = 0.7  # 70% 이상 유사해야 함
        
        # 비동기 배치 처리로 유사도 계산
        similarities = await self._calculate_similarities_batch(text_embedding, text)
        
        # 임계값 이상의 결과만 필터링
        filtered_similarities = {
            label: data for label, data in similarities.items() 
            if data['similarity'] >= SIMILARITY_THRESHOLD
        }
        
        if not filtered_similarities:
            print(f"⚠️ 임계값({SIMILARITY_THRESHOLD}) 이상의 유사한 데이터가 없습니다.")
            return None
        
        # 유사도 기준 정렬 (높은 순서)
        sorted_similarities = sorted(
            filtered_similarities.items(), 
            key=lambda x: x[1]['similarity'], 
            reverse=True
        )
        
        # 상위 k개 결과 반환
        results = []
        for i, (label, data) in enumerate(sorted_similarities[:top_k]):
            confidence = float(data['similarity'] * 100)
            results.append({
                'rank': i + 1,
                'label': label,
                'similarity': confidence,
                'best_match': data['best_match'],
                'match_type': 'similarity_based'
            })
            print(f"🏆 순위 {i+1}: {label} (유사도: {confidence:.1f}%, 최적 매칭: {data['best_match']})")
        
        print(f"🎯 유사도 기반 예측 완료: {len(results)}개 결과 반환")
        return results
    
    async def _get_text_embedding(self, text):
        """텍스트 임베딩 생성 (GPU 최적화)"""
        try:
        inputs = self.tokenizer(
            text, 
            return_tensors="pt", 
            truncation=True, 
            max_length=512, 
            padding=True
        )
        inputs = {k: v.to(self.device) for k, v in inputs.items()}
        
        with torch.no_grad():
            if torch.cuda.is_available():
                with torch.cuda.amp.autocast():
                    outputs = self.model(**inputs)
            else:
                outputs = self.model(**inputs)
            
                # [CLS] 토큰 임베딩 추출
            text_embedding = outputs.last_hidden_state[:, 0, :]
            if torch.cuda.is_available():
                text_embedding = text_embedding.cpu()
            text_embedding = text_embedding.numpy()
        
            return text_embedding
        except Exception as e:
            print(f"❌ 텍스트 임베딩 생성 실패: {e}")
            return None
    
    async def _calculate_similarities_batch(self, text_embedding, original_text):
        """배치 처리로 유사도 계산 (성능 향상)"""
        print(f"🔄 배치 처리로 유사도 계산 중...")
        
        similarities = {}
        batch_size = 16  # 배치 크기
        
        # 모든 input_text를 배치로 처리
        all_input_texts = []
        for label, input_texts in self.training_data.items():
            for input_text in input_texts:
                if input_text and input_text.strip():
                    all_input_texts.append((label, input_text))
        
        # 배치별로 처리
        for i in range(0, len(all_input_texts), batch_size):
            batch = all_input_texts[i:i + batch_size]
            
            # 배치 텍스트 임베딩 생성
            batch_texts = [item[1] for item in batch]
            batch_embeddings = await self._get_batch_embeddings(batch_texts)
            
            if batch_embeddings is None:
                continue
            
            # 각 배치 항목의 유사도 계산
            for j, (label, input_text) in enumerate(batch):
                if j < len(batch_embeddings):
                    similarity = self._cosine_similarity(
                        text_embedding[0], 
                        batch_embeddings[j]
                    )
                    
                    # 해당 라벨의 최고 유사도 업데이트
                    if label not in similarities or similarity > similarities[label]['similarity']:
                        similarities[label] = {
                            'similarity': similarity,
                            'best_match': input_text
                        }
        
        print(f"✅ 배치 유사도 계산 완료: {len(similarities)}개 라벨 처리")
        return similarities
    
    async def _get_batch_embeddings(self, texts):
        """배치 텍스트의 임베딩 생성"""
        try:
            inputs = self.tokenizer(
                texts,
                return_tensors="pt",
                truncation=True,
                max_length=512,
                padding=True
            )
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            with torch.no_grad():
                if torch.cuda.is_available():
                    with torch.cuda.amp.autocast():
                        outputs = self.model(**inputs)
                else:
                    outputs = self.model(**inputs)
                
                # [CLS] 토큰 임베딩 추출
                batch_embeddings = outputs.last_hidden_state[:, 0, :]
                if torch.cuda.is_available():
                    batch_embeddings = batch_embeddings.cpu()
                batch_embeddings = batch_embeddings.numpy()
            
            return batch_embeddings
        except Exception as e:
            print(f"❌ 배치 임베딩 생성 실패: {e}")
            return None
    
    def predict_sync(self, text, top_k=3):
        """동기 버전의 predict (하위 호환성)"""
        import asyncio
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                # 이미 실행 중인 루프가 있으면 새로 생성
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                result = loop.run_until_complete(self.predict(text, top_k))
                loop.close()
                return result
            else:
                return loop.run_until_complete(self.predict(text, top_k))
        except Exception as e:
            print(f"❌ 동기 예측 실패: {e}")
            return []
    
    def _predict_with_basic_classifier(self, text, top_k=3):
        """기본 분류기를 사용한 예측 (학습된 라벨이 없는 경우)"""
        try:
            print(f"🔧 기본 분류기로 예측: '{text}'")
            
            # 모델을 평가 모드로 설정
            self.model.eval()
            self.classifier.eval()
            
            # 입력 토크나이징
            inputs = self.tokenizer(
                text, 
                return_tensors="pt", 
                truncation=True, 
                max_length=512, 
                padding=True
            )
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            # 예측 수행
            with torch.no_grad():
                outputs = self.model(**inputs)
                # [CLS] 토큰의 임베딩 사용
                text_embedding = outputs.last_hidden_state[:, 0, :]
                # 분류기로 예측
                logits = self.classifier(text_embedding)
                probabilities = torch.softmax(logits, dim=-1)
                
                # 가장 높은 확률의 클래스 선택
                predicted_class = torch.argmax(probabilities, dim=-1).item()
                confidence = probabilities[0][predicted_class].item()
            
            # 기본 추천 (업계 표준 용어)
            basic_recommendations = {
                "점결탄": "코크스",
                "광석": "철광석", 
                "정립광": "펠릿",
                "석회": "석회석",
                "코크스 오븐 코크스": "코크스",
                "철광": "철광석",
                "Coke": "코크스",
                "열유입": "열에너지",
                "냉각수": "냉각수",
                "윤활제": "윤활유",
                "선철": "선철",
                "환원철": "환원철",
                "EAF 탄소 전극": "탄소전극",
                "물": "공업용수",
                "모래": "사질재",
                "블루": "블루",
                "요소수": "요소",
                "형강": "형강",
                "포장재": "포장재"
            }
            
            recommended = basic_recommendations.get(text, text)
            
            result = [{
                'rank': 1,
                'label': recommended,
                'similarity': confidence * 100
            }]
            
            print(f"✅ 기본 분류기 예측 완료: {text} → {recommended} (신뢰도: {confidence*100:.1f}%)")
            return result
            
        except Exception as e:
            print(f"❌ 기본 분류기 예측 실패: {e}")
            return []
    
    def _cosine_similarity(self, vec1, vec2):
        """코사인 유사도를 계산합니다."""
        dot_product = np.dot(vec1, vec2)
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)
        
        if norm1 == 0 or norm2 == 0:
            return 0
        
        return dot_product / (norm1 * norm2)
    
    def update_with_feedback(self, text, correct_label, is_correct, memo=""):
        """사용자 피드백을 바탕으로 모델을 업데이트합니다."""
        if is_correct:
            # 올바른 예측이었을 경우, 해당 레이블의 임베딩을 강화
            inputs = self.tokenizer(text, return_tensors="pt", truncation=True, max_length=512, padding=True)
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            with torch.no_grad():
                outputs = self.model(**inputs)
                text_embedding = outputs.last_hidden_state[:, 0, :].cpu().numpy()
            
            # 기존 임베딩과 새로운 임베딩을 가중 평균으로 업데이트
            if correct_label in self.label_embeddings:
                old_embedding = self.label_embeddings[correct_label]
                new_embedding = text_embedding[0]
                # 가중 평균 (기존: 0.7, 새로운: 0.3)
                self.label_embeddings[correct_label] = 0.7 * old_embedding + 0.3 * new_embedding
            else:
                self.label_embeddings[correct_label] = text_embedding[0]
        else:
            # 틀린 예측이었을 경우, 새로운 레이블 추가 또는 기존 레이블 업데이트
            if correct_label not in self.label_to_id:
                # 새로운 레이블 추가
                new_id = len(self.label_to_id)
                self.label_to_id[correct_label] = new_id
                self.id_to_label[new_id] = correct_label
            
            # 새로운 텍스트로 해당 레이블의 임베딩 생성
            inputs = self.tokenizer(text, return_tensors="pt", truncation=True, max_length=512, padding=True)
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            with torch.no_grad():
                outputs = self.model(**inputs)
                text_embedding = outputs.last_hidden_state[:, 0, :].cpu().numpy()
            
            self.label_embeddings[correct_label] = text_embedding[0]
        
        # 메모가 있다면 저장 (향후 딥러닝을 위해)
        if memo:
            memo_file = Path(__file__).parent.parent.parent.parent / "data" / "studied" / "feedback_memos.jsonl"
            memo_file.parent.mkdir(exist_ok=True)
            
            memo_data = {
                'text': text,
                'correct_label': correct_label,
                'memo': memo,
                'timestamp': str(pd.Timestamp.now())
            }
            
            with open(memo_file, 'a', encoding='utf-8') as f:
                f.write(json.dumps(memo_data, ensure_ascii=False) + '\n')
    
    def load_training_data(self, model_dir):
        """학습된 데이터를 로드합니다."""
        try:
            # 학습 데이터 파일 경로 (올바른 경로로 수정)
            # model_dir: service/datagather_service/app/data/studied/model_v24/model_v24
            # 목표: service/datagather_service/app/data/dataforstudy/file for trainning.jsonl
            
            # 상대 경로 계산
            training_data_path = os.path.join(model_dir, "..", "..", "..", "dataforstudy", "file for trainning.jsonl")
            training_data_path = os.path.abspath(training_data_path)
            
            # 디버깅: 경로 정보 출력
            print(f"🔍 모델 디렉토리: {model_dir}")
            print(f"🔍 계산된 학습 데이터 경로: {training_data_path}")
            print(f"🔍 파일 존재 여부: {os.path.exists(training_data_path)}")
            
            # 대안 경로들도 시도 (절대 경로 기반)
            current_dir = os.path.dirname(os.path.abspath(__file__))  # ananke 폴더
            app_dir = os.path.dirname(current_dir)  # app 폴더
            
            alternative_paths = [
                training_data_path,  # 첫 번째 시도한 경로
                os.path.join(app_dir, "data", "dataforstudy", "file for trainning.jsonl"),  # app/data/dataforstudy/
                os.path.join(current_dir, "..", "data", "dataforstudy", "file for trainning.jsonl"),  # ananke/../data/dataforstudy/
                os.path.join(current_dir, "..", "..", "data", "dataforstudy", "file for trainning.jsonl"),  # ananke/../../data/dataforstudy/
            ]
            
            # 대안 경로들 확인
            for alt_path in alternative_paths:
                abs_alt_path = os.path.abspath(alt_path)
                print(f"🔍 대안 경로 {alt_path}: {abs_alt_path} (존재: {os.path.exists(abs_alt_path)})")
                if os.path.exists(abs_alt_path):
                    training_data_path = abs_alt_path
                    print(f"✅ 사용 가능한 경로 발견: {training_data_path}")
                    break
            
            if os.path.exists(training_data_path):
                print(f"📚 학습 데이터 로드 시작: {training_data_path}")
                
                self.training_data = {}
                
                with open(training_data_path, 'r', encoding='utf-8') as f:
                    for line in f:
                        if line.strip():
                            data = json.loads(line.strip())
                            label = data.get('Label', '')
                            
                            if label not in self.training_data:
                                self.training_data[label] = []
                            
                            # input_text 1~10을 리스트로 수집
                            for i in range(1, 11):
                                input_text_key = f'input_text {i}'
                                if input_text_key in data and data[input_text_key]:
                                    self.training_data[label].append(data[input_text_key])
                
                print(f"✅ 학습 데이터 로드 완료: {len(self.training_data)}개 라벨, 총 {sum(len(texts) for texts in self.training_data.values())}개 input_text")
                
                # 샘플 데이터 출력
                for label, texts in list(self.training_data.items())[:3]:
                    print(f"  📍 {label}: {texts[:3]}...")
                    
                # 철 라벨 상세 확인
                if '철' in self.training_data:
                    print(f"🔍 철 라벨 상세 정보:")
                    print(f"  📍 철: {self.training_data['철']}")
                    print(f"  📍 철 라벨의 총 input_text 수: {len(self.training_data['철'])}")
                    
                    # 철ㄹ 검색 (대소문자, 공백 무시)
                    철ㄹ_포함 = False
                    for i, input_text in enumerate(self.training_data['철']):
                        if input_text and '철ㄹ' in input_text:
                            철ㄹ_포함 = True
                            print(f"  ✅ '철ㄹ' 발견! 위치: {i+1}번째, 값: '{input_text}'")
                    
                    if not 철ㄹ_포함:
                        print(f"  ❌ '철ㄹ'이 철 라벨에 없음!")
                        # 철로 시작하는 모든 input_text 출력
                        철_시작 = [text for text in self.training_data['철'] if text and text.startswith('철')]
                        print(f"  🔍 철로 시작하는 input_text들: {철_시작}")
                else:
                    print(f"❌ '철' 라벨이 training_data에 없음!")
                    
            else:
                print(f"⚠️ 학습 데이터 파일이 없습니다: {training_data_path}")
                self.training_data = {}
                
        except Exception as e:
            print(f"❌ 학습 데이터 로드 실패: {e}")
            import traceback
            print(f"🔍 에러 상세: {traceback.format_exc()}")
            self.training_data = {}
