from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Numeric, ForeignKey, Enum as SQLEnum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base
import enum

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

class ProcessInput(Base):
    """공정 투입물 모델"""
    __tablename__ = "process_input"
    
    id = Column(Integer, primary_key=True, index=True)
    process_id = Column(Integer, ForeignKey("process.id"), nullable=False, index=True)
    input_type = Column(SQLEnum(InputTypeEnum), nullable=False)
    input_name = Column(String(255), nullable=False, index=True)
    amount = Column(Float, nullable=False, default=0)
    factor = Column(Float, default=1.0)
    oxy_factor = Column(Float, default=1.0)
    direm_emission = Column(Float)
    indirem_emission = Column(Float)
    emission_factor_id = Column(Integer, ForeignKey("emission_factors.id"), nullable=True)
    allocation_method = Column(SQLEnum(AllocationMethodEnum), default=AllocationMethodEnum.DIRECT)
    allocation_ratio = Column(Numeric(5, 4), default=1.0)
    measurement_uncertainty = Column(Numeric(5, 4))
    data_quality = Column(Text)
    verification_status = Column(String(50), default="pending")
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

# ============================================================================
# 📊 Performance 모델 (성과 데이터)
# ============================================================================

class Performance(Base):
    """성과 데이터 모델"""
    __tablename__ = "performance"
    
    id = Column(Integer, primary_key=True, index=True)
    process_name = Column(String(255), nullable=False, index=True)
    production_amount = Column(Float, nullable=False)
    unit = Column(String(50), nullable=False)
    period_start = Column(DateTime)
    period_end = Column(DateTime)
    efficiency = Column(Float)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

# ============================================================================
# 🚚 Transport 모델 (운송 데이터)
# ============================================================================

class Transport(Base):
    """운송 데이터 모델"""
    __tablename__ = "transport"
    
    id = Column(Integer, primary_key=True, index=True)
    mode = Column(String(100), nullable=False)  # road, rail, sea, air
    distance_km = Column(Float)
    fuel_type = Column(String(100))
    fuel_consumption = Column(Float)
    fuel_unit = Column(String(50))
    emission_factor = Column(Float)
    total_emission = Column(Float)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

# ============================================================================
# 📋 BaseData 모델 (기본 데이터)
# ============================================================================

class BaseData(Base):
    """기본 데이터 모델"""
    __tablename__ = "base"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    type = Column(String(100))
    category = Column(String(100))
    unit = Column(String(50))
    quantity = Column(Float)
    source = Column(String(255))
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

# ============================================================================
# 📤 Output 모델 (실적정보(산출물))
# ============================================================================

class OutputData(Base):
    """실적정보(산출물) 모델"""
    __tablename__ = "output"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    type = Column(String(100))
    category = Column(String(100))
    unit = Column(String(50))
    quantity = Column(Float)
    destination = Column(String(255))
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
