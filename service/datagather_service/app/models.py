from sqlalchemy import Column, Integer, String, Float, DateTime, Date, Text, Numeric, ForeignKey, Enum as SQLEnum
from sqlalchemy.sql import func
import enum
from .database import Base

# ============================================================================
# 🔤 ENUM 타입 정의
# ============================================================================

class InputTypeEnum(str, enum.Enum):
    MATERIAL = "material"
    FUEL = "fuel"
    ELECTRICITY = "electricity"

class AllocationMethodEnum(str, enum.Enum):
    DIRECT = "direct"
    PROPORTIONAL = "proportional"
    TIME_BASED = "time_based"
    MASS_BASED = "mass_based"
    ENERGY_BASED = "energy_based"

# ============================================================================
# 📥 ProcessInput 모델 (공정 투입물)
# ============================================================================


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
