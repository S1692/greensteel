import psycopg2
from psycopg2.extras import RealDictCursor
import re
import os

# 데이터베이스 연결 정보
DB_URL = "postgresql://postgres:lUAkUKpUxubYDvmqzGKxJLKgZCWMjaQy@switchyard.proxy.rlwy.net:railway"

def verify_database_schema():
    """데이터베이스 스키마 최종 검증"""
    print("=== 데이터베이스 스키마 최종 검증 ===")
    
    try:
        conn = psycopg2.connect(DB_URL)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # 주요 테이블들의 레코드 수 및 스키마 확인
        tables_to_check = [
            'input_data', 'output_data', 'transport_data', 'process_data',
            'fuel_data', 'utility_data', 'waste_data', 'process_product_data'
        ]
        
        for table_name in tables_to_check:
            try:
                # 레코드 수 확인
                cursor.execute(f"SELECT COUNT(*) as count FROM {table_name}")
                result = cursor.fetchone()
                count = result['count'] if result else 0
                
                # 스키마 확인
                cursor.execute(f"""
                    SELECT column_name, data_type, is_nullable
                    FROM information_schema.columns
                    WHERE table_name = '{table_name}'
                    ORDER BY ordinal_position
                """)
                
                columns = cursor.fetchall()
                
                print(f"\n📊 {table_name}: {count} 레코드")
                print(f"   컬럼 수: {len(columns)}")
                
                # 주요 컬럼 확인
                for col in columns:
                    if col['column_name'] in ['주문처명', '오더번호', 'AI추천답변', 'source_file']:
                        print(f"   - {col['column_name']}: {col['data_type']} (NULL 허용: {col['is_nullable']})")
                
            except Exception as e:
                print(f"❌ {table_name} 테이블 확인 실패: {e}")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ 데이터베이스 연결 오류: {e}")

def verify_api_endpoints():
    """API 엔드포인트 최종 검증"""
    print("\n=== API 엔드포인트 최종 검증 ===")
    
    # 게이트웨이 엔드포인트 확인
    gateway_file = "gateway/main.py"
    
    try:
        with open(gateway_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 구현된 엔드포인트 패턴 찾기
        implemented_endpoints = re.findall(r'@app\.(get|post|put|delete|api_route)\("([^"]+)"', content)
        
        print("게이트웨이에서 구현된 엔드포인트:")
        for method, path in implemented_endpoints:
            print(f"  - {method.upper()} {path}")
        
        # 중복 엔드포인트 확인
        paths = [path for _, path in implemented_endpoints]
        duplicates = [path for path in set(paths) if paths.count(path) > 1]
        
        if duplicates:
            print(f"\n⚠️ 중복된 엔드포인트 발견: {duplicates}")
        else:
            print("\n✅ 중복된 엔드포인트 없음")
        
        # 필수 엔드포인트 확인
        essential_endpoints = [
            '/ai-process-stream',
            '/save-processed-data',
            '/classify-data',
            '/delete-classification',
            '/api/datagather/input-data',
            '/api/datagather/output-data',
            '/api/datagather/transport-data',
            '/api/datagather/process-data'
        ]
        
        missing_endpoints = []
        for endpoint in essential_endpoints:
            if not any(path == endpoint for _, path in implemented_endpoints):
                missing_endpoints.append(endpoint)
        
        if missing_endpoints:
            print(f"\n❌ 누락된 필수 엔드포인트: {missing_endpoints}")
        else:
            print("\n✅ 모든 필수 엔드포인트 구현됨")
            
    except Exception as e:
        print(f"❌ API 엔드포인트 검증 실패: {e}")

def verify_sqlalchemy_models():
    """SQLAlchemy 모델 최종 검증"""
    print("\n=== SQLAlchemy 모델 최종 검증 ===")
    
    models_file = "service/datagather_service/app/models.py"
    
    try:
        with open(models_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 필요한 모델 클래스 확인
        required_models = [
            'InputData',
            'OutputData', 
            'TransportData',
            'ProcessData',
            'FuelData',
            'UtilityData',
            'WasteData',
            'ProcessProductData'
        ]
        
        missing_models = []
        for model in required_models:
            if f"class {model}(Base):" not in content:
                missing_models.append(model)
        
        if missing_models:
            print(f"❌ 누락된 모델: {missing_models}")
        else:
            print("✅ 모든 필수 모델 구현됨")
        
        # 테이블명 매핑 확인
        table_mappings = [
            ('InputData', 'input_data'),
            ('OutputData', 'output_data'),
            ('TransportData', 'transport_data'),
            ('ProcessData', 'process_data'),
            ('FuelData', 'fuel_data'),
            ('UtilityData', 'utility_data'),
            ('WasteData', 'waste_data'),
            ('ProcessProductData', 'process_product_data')
        ]
        
        for model, table in table_mappings:
            if f'__tablename__ = "{table}"' in content:
                print(f"✅ {model} → {table}")
            else:
                print(f"❌ {model} → {table} 매핑 누락")
                
    except Exception as e:
        print(f"❌ SQLAlchemy 모델 검증 실패: {e}")

def verify_environment_variables():
    """환경 변수 최종 검증"""
    print("\n=== 환경 변수 최종 검증 ===")
    
    # 게이트웨이 환경 변수 확인
    gateway_file = "gateway/main.py"
    
    try:
        with open(gateway_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 환경 변수 사용 패턴 찾기
        env_vars = re.findall(r'os\.getenv\("([^"]+)"', content)
        
        print("게이트웨이에서 사용하는 환경 변수:")
        for env_var in set(env_vars):
            print(f"  - {env_var}")
        
        # 필수 환경 변수 확인
        required_env_vars = [
            'CHATBOT_SERVICE_URL',
            'CBAM_SERVICE_URL',
            'DATAGATHER_SERVICE_URL'
        ]
        
        missing_env_vars = []
        for env_var in required_env_vars:
            if env_var not in env_vars:
                missing_env_vars.append(env_var)
        
        if missing_env_vars:
            print(f"\n⚠️ 누락된 환경 변수: {missing_env_vars}")
        else:
            print("\n✅ 모든 필수 환경 변수 설정됨")
            
    except Exception as e:
        print(f"❌ 환경 변수 검증 실패: {e}")

def main():
    """메인 함수"""
    print("🔍 GreenSteel 프로젝트 최종 검증")
    print("=" * 60)
    
    # 1. 데이터베이스 스키마 검증
    verify_database_schema()
    
    # 2. API 엔드포인트 검증
    verify_api_endpoints()
    
    # 3. SQLAlchemy 모델 검증
    verify_sqlalchemy_models()
    
    # 4. 환경 변수 검증
    verify_environment_variables()
    
    print("\n" + "=" * 60)
    print("✅ 최종 검증 완료")

if __name__ == "__main__":
    main()
