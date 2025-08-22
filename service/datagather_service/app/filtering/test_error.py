import requests
import json

# 실제 Excel 파일과 동일한 테스트 데이터
test_data = {
    "filename": "테스트용 파일.xlsx",
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
            "지시번호": "3216286.955601405"
        },
        {
            "상태": "완료",
            "로트번호": "2",
            "생산품명": "소결광",
            "투입일": "45871",
            "종료일": "45872",
            "공정": "소결",
            "품번": "456",
            "투입물명": "광석",
            "수량": "200",
            "지시번호": "1944322.4300069606"
        }
    ],
    "rows_count": 2,
    "columns": ["상태", "로트번호", "생산품명", "투입일", "종료일", "공정", "품번", "투입물명", "수량", "지시번호"],
    "shape": [2, 10]
}

print("=== 500 에러 원인 찾기 테스트 ===")

print("\n1. DataGather Service 직접 테스트:")
try:
    response = requests.post(
        "http://localhost:8083/ai-process",
        json=test_data,
        timeout=30
    )
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        print("✅ DataGather Service 정상 작동")
    else:
        print(f"❌ DataGather Service 오류: {response.text}")
except Exception as e:
    print(f"❌ DataGather Service 연결 실패: {e}")

print("\n2. Gateway를 통한 테스트:")
try:
    response = requests.post(
        "http://localhost:8080/ai-process",
        json=test_data,
        timeout=30
    )
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        print("✅ Gateway 정상 작동")
    else:
        print(f"❌ Gateway 오류: {response.text}")
        print(f"오류 상세: {response.json() if response.text else '응답 없음'}")
except Exception as e:
    print(f"❌ Gateway 연결 실패: {e}")

print("\n3. 프론트엔드와 동일한 데이터 구조 테스트:")
try:
    # 프론트엔드에서 보내는 정확한 구조
    frontend_data = {
        "filename": "테스트용 파일.xlsx",
        "data": test_data["data"],
        "rows_count": test_data["rows_count"],
        "columns": test_data["columns"],
        "shape": test_data["shape"]
    }
    
    response = requests.post(
        "http://localhost:8080/ai-process",
        json=frontend_data,
        timeout=30
    )
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        print("✅ 프론트엔드 데이터 구조 정상")
    else:
        print(f"❌ 프론트엔드 데이터 구조 오류: {response.text}")
except Exception as e:
    print(f"❌ 프론트엔드 데이터 구조 테스트 실패: {e}")
