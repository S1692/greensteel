import requests
import json

# 테스트 데이터
test_data = {
    "filename": "test.xlsx",
    "data": [
        {
            "상태": "완료",
            "로트번호": "1",
            "생산품명": "코크스",
            "투입일": "45870",
            "종료일": "45873",
            "공정": "코크스 생산",
            "품번": "123",
            "투입물명": "점결탄",
            "수량": "100",
            "지시번호": "3216286"
        }
    ]
}

# DataGather Service 직접 테스트
print("=== DataGather Service 직접 테스트 ===")
try:
    response = requests.post(
        "http://localhost:8083/ai-process",
        json=test_data,
        timeout=30
    )
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
except Exception as e:
    print(f"Error: {e}")

print("\n=== Gateway를 통한 테스트 ===")
try:
    response = requests.post(
        "http://localhost:8080/ai-process",
        json=test_data,
        timeout=30
    )
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
except Exception as e:
    print(f"Error: {e}")
