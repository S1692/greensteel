import psycopg2
from psycopg2.extras import RealDictCursor
import logging

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 데이터베이스 연결 정보
DB_URL = "postgresql://postgres:lUAkUKpUxubYDvmqzGKxJLKgZCWMjaQy@switchyard.proxy.rlwy.net:51947/railway"

def cleanup_backup_tables():
    """백업 테이블 정리"""
    try:
        conn = psycopg2.connect(DB_URL)
        cursor = conn.cursor()
        
        logger.info("=== 백업 테이블 정리 시작 ===")
        
        # 백업 테이블 목록 조회
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name LIKE '%_backup_%'
            ORDER BY table_name
        """)
        
        backup_tables = cursor.fetchall()
        
        if not backup_tables:
            logger.info("정리할 백업 테이블이 없습니다.")
            return
        
        logger.info(f"정리할 백업 테이블 수: {len(backup_tables)}")
        
        for table in backup_tables:
            table_name = table[0]
            try:
                cursor.execute(f"DROP TABLE IF EXISTS {table_name} CASCADE")
                logger.info(f"✅ {table_name} 테이블 삭제 완료")
            except Exception as e:
                logger.error(f"❌ {table_name} 테이블 삭제 실패: {e}")
        
        conn.commit()
        logger.info("=== 백업 테이블 정리 완료 ===")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        logger.error(f"백업 테이블 정리 중 오류: {e}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()

def update_sqlalchemy_models():
    """SQLAlchemy 모델을 실제 DB 스키마에 맞게 업데이트"""
    logger.info("=== SQLAlchemy 모델 업데이트 ===")
    
    # models.py 파일 경로
    models_file = "service/datagather_service/app/models.py"
    
    try:
        with open(models_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 새로운 모델 정의
        new_models = '''
# ============================================================================
# 📥 InputData 모델 (실제 DB 스키마 기반)
# ============================================================================

class InputData(Base):
    """투입물 데이터 모델 (실제 DB 스키마)"""
    __tablename__ = "input_data"
    
    id = Column(Integer, primary_key=True, index=True)
    로트번호 = Column(String(255), nullable=False, index=True)
    생산품명 = Column(String(255), nullable=False)
    생산수량 = Column(Numeric, nullable=False)
    투입일 = Column(Date, nullable=True)
    종료일 = Column(Date, nullable=True)
    공정 = Column(String(255), nullable=False)
    투입물명 = Column(String(255), nullable=False)
    수량 = Column(Numeric, nullable=False)
    단위 = Column(String(50), nullable=False, default='t')
    source_file = Column(String(255), nullable=True)
    AI추천답변 = Column(Text, nullable=True)
    주문처명 = Column(String(255), nullable=True)
    오더번호 = Column(String(255), nullable=True)
    created_at = Column(DateTime, nullable=True, server_default=func.now())
    updated_at = Column(DateTime, nullable=True, onupdate=func.now())

# ============================================================================
# 📤 OutputData 모델 (실제 DB 스키마 기반)
# ============================================================================

class OutputData(Base):
    """산출물 데이터 모델 (실제 DB 스키마)"""
    __tablename__ = "output_data"
    
    id = Column(Integer, primary_key=True, index=True)
    로트번호 = Column(String(255), nullable=False, index=True)
    생산품명 = Column(String(255), nullable=False)
    생산수량 = Column(Numeric, nullable=False)
    투입일 = Column(Date, nullable=True)
    종료일 = Column(Date, nullable=True)
    공정 = Column(String(255), nullable=False)
    산출물명 = Column(String(255), nullable=False)
    수량 = Column(Numeric, nullable=False)
    단위 = Column(String(50), nullable=False, default='t')
    주문처명 = Column(String(255), nullable=True)
    오더번호 = Column(String(255), nullable=True)
    created_at = Column(DateTime, nullable=True, server_default=func.now())
    updated_at = Column(DateTime, nullable=True, onupdate=func.now())

# ============================================================================
# 🚚 TransportData 모델 (실제 DB 스키마 기반)
# ============================================================================

class TransportData(Base):
    """운송 데이터 모델 (실제 DB 스키마)"""
    __tablename__ = "transport_data"
    
    id = Column(Integer, primary_key=True, index=True)
    생산품명 = Column(String(255), nullable=False)
    로트번호 = Column(String(255), nullable=False, index=True)
    운송물질 = Column(String(255), nullable=False)
    운송수량 = Column(Numeric, nullable=False)
    운송일자 = Column(Date, nullable=True)
    도착공정 = Column(String(255), nullable=False)
    출발지 = Column(String(255), nullable=False)
    이동수단 = Column(String(255), nullable=False)
    주문처명 = Column(String(255), nullable=True)
    오더번호 = Column(String(255), nullable=True)
    created_at = Column(DateTime, nullable=True, server_default=func.now())
    updated_at = Column(DateTime, nullable=True, onupdate=func.now())

# ============================================================================
# ⚙️ ProcessData 모델 (실제 DB 스키마 기반)
# ============================================================================

class ProcessData(Base):
    """공정 데이터 모델 (실제 DB 스키마)"""
    __tablename__ = "process_data"
    
    id = Column(Integer, primary_key=True, index=True)
    공정명 = Column(String(255), nullable=False)
    공정설명 = Column(Text, nullable=True)
    공정유형 = Column(String(255), nullable=False)
    공정단계 = Column(String(255), nullable=False)
    공정효율 = Column(Numeric, nullable=True)
    created_at = Column(DateTime, nullable=True, server_default=func.now())
    updated_at = Column(DateTime, nullable=True, onupdate=func.now())

# ============================================================================
# 🔥 FuelData 모델 (분류 데이터)
# ============================================================================

class FuelData(Base):
    """연료 데이터 모델"""
    __tablename__ = "fuel_data"
    
    id = Column(Integer, primary_key=True, index=True)
    로트번호 = Column(Integer, nullable=False)
    생산수량 = Column(Numeric, nullable=True)
    투입일 = Column(Date, nullable=True)
    종료일 = Column(Date, nullable=True)
    공정 = Column(String(255), nullable=True)
    투입물명 = Column(String(255), nullable=True)
    수량 = Column(Numeric, nullable=True)
    단위 = Column(String(50), nullable=True, default='t')
    분류 = Column(String(255), nullable=True, default='연료')
    source_table = Column(String(255), nullable=True)
    source_id = Column(Integer, nullable=True)
    주문처명 = Column(String(255), nullable=True)
    오더번호 = Column(String(255), nullable=True)
    created_at = Column(DateTime, nullable=True, server_default=func.now())
    updated_at = Column(DateTime, nullable=True, onupdate=func.now())

# ============================================================================
# ⚡ UtilityData 모델 (분류 데이터)
# ============================================================================

class UtilityData(Base):
    """유틸리티 데이터 모델"""
    __tablename__ = "utility_data"
    
    id = Column(Integer, primary_key=True, index=True)
    로트번호 = Column(Integer, nullable=False)
    생산수량 = Column(Numeric, nullable=True)
    투입일 = Column(Date, nullable=True)
    종료일 = Column(Date, nullable=True)
    공정 = Column(String(255), nullable=True)
    투입물명 = Column(String(255), nullable=True)
    수량 = Column(Numeric, nullable=True)
    단위 = Column(String(50), nullable=True, default='t')
    분류 = Column(String(255), nullable=True, default='유틸리티')
    source_table = Column(String(255), nullable=True)
    source_id = Column(Integer, nullable=True)
    주문처명 = Column(String(255), nullable=True)
    오더번호 = Column(String(255), nullable=True)
    created_at = Column(DateTime, nullable=True, server_default=func.now())
    updated_at = Column(DateTime, nullable=True, onupdate=func.now())

# ============================================================================
# 🗑️ WasteData 모델 (분류 데이터)
# ============================================================================

class WasteData(Base):
    """폐기물 데이터 모델"""
    __tablename__ = "waste_data"
    
    id = Column(Integer, primary_key=True, index=True)
    로트번호 = Column(Integer, nullable=False)
    생산수량 = Column(Numeric, nullable=True)
    투입일 = Column(Date, nullable=True)
    종료일 = Column(Date, nullable=True)
    공정 = Column(String(255), nullable=True)
    투입물명 = Column(String(255), nullable=True)
    수량 = Column(Numeric, nullable=True)
    단위 = Column(String(50), nullable=True, default='t')
    분류 = Column(String(255), nullable=True, default='폐기물')
    source_table = Column(String(255), nullable=True)
    source_id = Column(Integer, nullable=True)
    주문처명 = Column(String(255), nullable=True)
    오더번호 = Column(String(255), nullable=True)
    created_at = Column(DateTime, nullable=True, server_default=func.now())
    updated_at = Column(DateTime, nullable=True, onupdate=func.now())

# ============================================================================
# 🏭 ProcessProductData 모델 (분류 데이터)
# ============================================================================

class ProcessProductData(Base):
    """공정 생산품 데이터 모델"""
    __tablename__ = "process_product_data"
    
    id = Column(Integer, primary_key=True, index=True)
    로트번호 = Column(Integer, nullable=False)
    생산수량 = Column(Numeric, nullable=True)
    투입일 = Column(Date, nullable=True)
    종료일 = Column(Date, nullable=True)
    공정 = Column(String(255), nullable=True)
    투입물명 = Column(String(255), nullable=True)
    수량 = Column(Numeric, nullable=True)
    단위 = Column(String(50), nullable=True, default='t')
    분류 = Column(String(255), nullable=True, default='공정 생산품')
    source_table = Column(String(255), nullable=True)
    source_id = Column(Integer, nullable=True)
    주문처명 = Column(String(255), nullable=True)
    오더번호 = Column(String(255), nullable=True)
    created_at = Column(DateTime, nullable=True, server_default=func.now())
    updated_at = Column(DateTime, nullable=True, onupdate=func.now())
'''
        
        # 기존 모델 제거하고 새로운 모델로 교체
        # 기존 모델 정의 부분을 찾아서 교체
        old_models_start = content.find("class ProcessInput(Base):")
        if old_models_start != -1:
            # 기존 모델 제거
            old_models_end = content.find("if __name__ == '__main__':")
            if old_models_end == -1:
                old_models_end = len(content)
            
            new_content = content[:old_models_start] + new_models + content[old_models_end:]
            
            # 파일에 저장
            with open(models_file, 'w', encoding='utf-8') as f:
                f.write(new_content)
            
            logger.info("✅ SQLAlchemy 모델 업데이트 완료")
        else:
            logger.warning("기존 모델을 찾을 수 없습니다.")
            
    except Exception as e:
        logger.error(f"모델 업데이트 중 오류: {e}")

def verify_database_consistency():
    """데이터베이스 일관성 검증"""
    try:
        conn = psycopg2.connect(DB_URL)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        logger.info("=== 데이터베이스 일관성 검증 ===")
        
        # 주요 테이블들의 레코드 수 확인
        tables_to_check = [
            'input_data', 'output_data', 'transport_data', 'process_data',
            'fuel_data', 'utility_data', 'waste_data', 'process_product_data'
        ]
        
        for table_name in tables_to_check:
            try:
                cursor.execute(f"SELECT COUNT(*) as count FROM {table_name}")
                result = cursor.fetchone()
                count = result['count'] if result else 0
                logger.info(f"📊 {table_name}: {count} 레코드")
            except Exception as e:
                logger.error(f"❌ {table_name} 테이블 확인 실패: {e}")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        logger.error(f"데이터베이스 일관성 검증 중 오류: {e}")

def main():
    """메인 함수"""
    logger.info("🔧 GreenSteel 스키마 불일치 문제 해결 시작")
    logger.info("=" * 60)
    
    # 1. 백업 테이블 정리
    cleanup_backup_tables()
    
    # 2. SQLAlchemy 모델 업데이트
    update_sqlalchemy_models()
    
    # 3. 데이터베이스 일관성 검증
    verify_database_consistency()
    
    logger.info("=" * 60)
    logger.info("✅ 스키마 불일치 문제 해결 완료")

if __name__ == "__main__":
    main()
