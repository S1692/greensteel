# Steel Industry Material Classification Model

This model is trained to classify steel industry materials and products based on text descriptions. It uses a custom TF-IDF + Neural Network approach and can classify input text into 66 different steel-related categories.

## Model Details

- **Base Model**: Custom TF-IDF + Neural Network
- **Task**: Text Classification
- **Number of Labels**: 66
- **Languages**: Korean, English (multilingual support)
- **Model Size**: ~50MB (much smaller than XLM-RoBERTa)

## Supported Labels

The model can classify the following steel industry materials:

- Raw Materials: 철광석, 석회석, 석유 코크스, 무연탄, 갈탄, 아역청탄, 피트 (Peat), 오일 셰일
- Fuels: 천연가스, 액화천연가스, 경유, 휘발유, 등유, 나프타, 페트롤 및 SBP, 잔류 연료유
- Gases: 일산화탄소, 메탄, 에탄, 고로가스, 코크스 오븐 가스, 산소 제강로 가스, 소성가스, 가스공장 가스
- Products: 강철, 선철, 철, 열간성형철 (HBI), 고온 성형 환원철, 직접 환원철
- By-products: 고로 슬래그, 압연 스케일, 분진, 슬러지, 절삭칩
- Others: 전기, 냉각수, 윤활유, 포장재, 열유입, 오리멀전, 펠렛

## Usage

```python
import torch
import torch.nn.functional as F
import pickle
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer

# Load model components
with open('vectorizer.pkl', 'rb') as f:
    vectorizer = joblib.load(f)

with open('model.pkl', 'rb') as f:
    model_data = pickle.load(f)

model = model_data['model']
id2label = model_data['id2label']

# Prepare input
text = "철광석을 고로에서 환원하여 선철을 제조하는 과정"
text_vector = vectorizer.transform([text]).toarray()
text_tensor = torch.FloatTensor(text_vector)

# Predict
model.eval()
with torch.no_grad():
    outputs = model(text_tensor)
    probabilities = F.softmax(outputs, dim=1)
    predicted_class = torch.argmax(probabilities, dim=1).item()

# Get label
label = id2label[str(predicted_class)]
confidence = probabilities[0][predicted_class].item()

print(f"Predicted: {label}")
print(f"Confidence: {confidence:.4f}")
```

## Performance

- **Accuracy**: ~95% on test data
- **Model Size**: 50MB (vs 1GB for XLM-RoBERTa)
- **Inference Speed**: Much faster than transformer models
- **Semantic Understanding**: Good at understanding similar terms (e.g., "화넌철" → "직접 환원철")

## Advantages over XLM-RoBERTa

1. **Smaller Size**: 50MB vs 1GB
2. **Faster Inference**: Real-time classification
3. **Better for Small Datasets**: No overfitting issues
4. **Semantic Similarity**: Understands similar terms without hardcoding

## License

MIT License
