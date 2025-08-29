# ============================================================================
# 🧮 Calculation Entity - CBAM 계산 데이터 모델
# ============================================================================

from sqlalchemy import Column, Integer, String, Numeric, DateTime, Text, BigInteger, Date, ForeignKey, Enum as SQLEnum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
from typing import Dict, Any, List
from decimal import Decimal
import enum

Base = declarative_base()

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

class EdgeKindEnum(str, enum.Enum):
    CONSUME = "consume"
    PRODUCE = "produce"
    CONTINUE = "continue"

class FactorTypeEnum(str, enum.Enum):
    FUEL = "fuel"
    ELECTRICITY = "electricity"
    PROCESS = "process"
    PRECURSOR = "precursor"

class EmissionTypeEnum(str, enum.Enum):
    DIRECT = "direct"
    INDIRECT = "indirect"
    PRECURSOR = "precursor"

# ============================================================================
# 🏭 Install 엔티티 (사업장)
# ============================================================================

class Install(Base):
    """사업장 엔티티"""
    
    __tablename__ = "install"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(Text, nullable=False, index=True)  # 사업장명
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 관계 설정
    products = relationship("Product", back_populates="install")
    
    def to_dict(self) -> Dict[str, Any]:
        """엔티티를 딕셔너리로 변환"""
        return {
            "id": self.id,
            "name": self.name,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

# ============================================================================
# 📦 Product 엔티티 (제품)
# ============================================================================

class Product(Base):
    """제품 엔티티"""
    
    __tablename__ = "product"
    
    id = Column(Integer, primary_key=True, index=True)
    install_id = Column(Integer, ForeignKey("install.id"), nullable=False, index=True)  # 사업장 ID
    product_name = Column(Text, nullable=False, index=True)  # 제품명
    product_category = Column(Text, nullable=False)  # 제품 카테고리 (단순제품/복합제품)
    prostart_period = Column(Date, nullable=False)  # 기간 시작일
    proend_period = Column(Date, nullable=False)  # 기간 종료일
    product_amount = Column(Numeric(15, 6), nullable=False, default=0)  # 제품 수량
    product_cncode = Column(Text)  # 제품 CN 코드
    goods_name = Column(Text)  # 상품명
    aggrgoods_name = Column(Text)  # 집계 상품명
    product_sell = Column(Numeric(15, 6), default=0)  # 제품 판매량
    product_eusell = Column(Numeric(15, 6), default=0)  # 제품 EU 판매량
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 관계 설정
    install = relationship("Install", back_populates="products")
    processes = relationship("ProductProcess", back_populates="product")
    
    def to_dict(self) -> Dict[str, Any]:
        """엔티티를 딕셔너리로 변환"""
        return {
            "id": self.id,
            "install_id": self.install_id,
            "product_name": self.product_name,
            "product_category": self.product_category,
            "prostart_period": self.prostart_period.isoformat() if self.prostart_period else None,
            "proend_period": self.proend_period.isoformat() if self.proend_period else None,
            "product_amount": float(self.product_amount) if self.product_amount else 0.0,
            "product_cncode": self.product_cncode,
            "goods_name": self.goods_name,
            "aggrgoods_name": self.aggrgoods_name,
            "product_sell": float(self.product_sell) if self.product_sell else 0.0,
            "product_eusell": float(self.product_eusell) if self.product_eusell else 0.0,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Product":
        """딕셔너리에서 엔티티 생성"""
        from datetime import date
        
        return cls(
            install_id=data.get("install_id"),
            product_name=data.get("product_name"),
            product_category=data.get("product_category"),
            prostart_period=date.fromisoformat(data.get("prostart_period")) if data.get("prostart_period") else None,
            proend_period=date.fromisoformat(data.get("proend_period")) if data.get("proend_period") else None,
            product_amount=data.get("product_amount", 0.0),
            product_cncode=data.get("product_cncode"),
            goods_name=data.get("goods_name"),
            aggrgoods_name=data.get("aggrgoods_name"),
            product_sell=data.get("product_sell", 0.0),
            product_eusell=data.get("product_eusell", 0.0),
            created_at=datetime.utcnow()
        )

# ============================================================================
# 🔄 Process 엔티티 (공정)
# ============================================================================

class Process(Base):
    """프로세스 엔티티"""
    
    __tablename__ = "process"
    
    id = Column(Integer, primary_key=True, index=True)
    process_name = Column(Text, nullable=False, index=True)  # 프로세스명
    start_period = Column(Date, nullable=False)  # 시작일
    end_period = Column(Date, nullable=False)  # 종료일
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 관계 설정
    products = relationship("ProductProcess", back_populates="process")
    process_inputs = relationship("ProcessInput", back_populates="process")
    
    def to_dict(self) -> Dict[str, Any]:
        """엔티티를 딕셔너리로 변환"""
        return {
            "id": self.id,
            "process_name": self.process_name,
            "start_period": self.start_period.isoformat() if self.start_period else None,
            "end_period": self.end_period.isoformat() if self.end_period else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

# ============================================================================
# 🔗 ProductProcess 엔티티 (제품-공정 관계)
# ============================================================================

class ProductProcess(Base):
    """제품-공정 관계 엔티티"""
    
    __tablename__ = "product_process"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("product.id"), nullable=False, index=True)
    process_id = Column(Integer, ForeignKey("process.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 관계 설정
    product = relationship("Product", back_populates="processes")
    process = relationship("Process", back_populates="products")
    
    def to_dict(self) -> Dict[str, Any]:
        """엔티티를 딕셔너리로 변환"""
        return {
            "id": self.id,
            "product_id": self.product_id,
            "process_id": self.process_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

# ============================================================================
# 📥 ProcessInput 엔티티 (공정 투입물)
# ============================================================================

class ProcessInput(Base):
    """프로세스 입력 엔티티"""
    
    __tablename__ = "process_input"
    
    id = Column(Integer, primary_key=True, index=True)
    process_id = Column(Integer, ForeignKey("process.id"), nullable=False, index=True)  # 프로세스 ID
    input_type = Column(SQLEnum(InputTypeEnum), nullable=False)  # 입력 타입 (material, fuel, electricity)
    input_name = Column(Text, nullable=False)  # 입력명
    amount = Column(Numeric(15, 6), nullable=False, default=0)  # 수량
    factor = Column(Numeric(15, 6), default=1.0)  # 배출계수
    oxy_factor = Column(Numeric(15, 6), default=1.0)  # 산화계수
    direm_emission = Column(Numeric(15, 6))  # 직접배출량
    indirem_emission = Column(Numeric(15, 6))  # 간접배출량
    emission_factor_id = Column(Integer, ForeignKey("emission_factors.id"), nullable=True)  # 배출계수 ID
    allocation_method = Column(SQLEnum(AllocationMethodEnum), default=AllocationMethodEnum.DIRECT)  # 배분방법
    allocation_ratio = Column(Numeric(5, 4), default=1.0)  # 배분비율
    measurement_uncertainty = Column(Numeric(5, 4))  # 측정불확실성
    data_quality = Column(Text)  # 데이터품질
    verification_status = Column(Text, default="pending")  # 검증상태
    notes = Column(Text)  # 비고
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 관계 설정
    process = relationship("Process", back_populates="process_inputs")
    emission_factor = relationship("EmissionFactor", back_populates="process_inputs")
    
    def to_dict(self) -> Dict[str, Any]:
        """엔티티를 딕셔너리로 변환"""
        return {
            "id": self.id,
            "process_id": self.process_id,
            "input_type": self.input_type.value if self.input_type else None,
            "input_name": self.input_name,
            "amount": float(self.amount) if self.amount else 0.0,
            "factor": float(self.factor) if self.factor else None,
            "oxy_factor": float(self.oxy_factor) if self.oxy_factor else None,
            "direm_emission": float(self.direm_emission) if self.direm_emission else None,
            "indirem_emission": float(self.indirem_emission) if self.indirem_emission else None,
            "emission_factor_id": self.emission_factor_id,
            "allocation_method": self.allocation_method.value if self.allocation_method else None,
            "allocation_ratio": float(self.allocation_ratio) if self.allocation_ratio else None,
            "measurement_uncertainty": float(self.measurement_uncertainty) if self.measurement_uncertainty else None,
            "data_quality": self.data_quality,
            "verification_status": self.verification_status,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

# ============================================================================
# 📊 EmissionFactor 엔티티 (배출계수)
# ============================================================================

class EmissionFactor(Base):
    """배출계수 엔티티"""
    
    __tablename__ = "emission_factors"
    
    id = Column(Integer, primary_key=True, index=True)
    factor_type = Column(SQLEnum(FactorTypeEnum), nullable=False)  # 배출계수 타입
    material_name = Column(Text, nullable=False)  # 물질명
    emission_factor = Column(Numeric(10, 6), nullable=False)  # 배출계수
    unit = Column(Text, nullable=False)  # 단위
    source = Column(Text)  # 출처
    valid_from = Column(Date, default=datetime.now().date)  # 유효시작일
    valid_to = Column(Date)  # 유효종료일
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 관계 설정
    process_inputs = relationship("ProcessInput", back_populates="emission_factor")
    
    def to_dict(self) -> Dict[str, Any]:
        """엔티티를 딕셔너리로 변환"""
        return {
            "id": self.id,
            "factor_type": self.factor_type.value if self.factor_type else None,
            "material_name": self.material_name,
            "emission_factor": float(self.emission_factor) if self.emission_factor else 0.0,
            "unit": self.unit,
            "source": self.source,
            "valid_from": self.valid_from.isoformat() if self.valid_from else None,
            "valid_to": self.valid_to.isoformat() if self.valid_to else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

# ============================================================================
# 🔗 Edge 엔티티 (노드 간 연결)
# ============================================================================

class Edge(Base):
    """엣지 엔티티"""
    
    __tablename__ = "edge"
    
    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, nullable=False, index=True)  # 소스 노드 ID
    target_id = Column(Integer, nullable=False, index=True)  # 타겟 노드 ID
    edge_kind = Column(SQLEnum(EdgeKindEnum), nullable=False)  # 엣지 종류 (consume/produce/continue)
    qty = Column(Numeric(15, 6))  # 수량
    source_type = Column(Text, nullable=False)  # 소스 타입 (product/process)
    target_type = Column(Text, nullable=False)  # 타겟 타입 (product/process)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self) -> Dict[str, Any]:
        """엔티티를 딕셔너리로 변환"""
        return {
            "id": self.id,
            "source_id": self.source_id,
            "target_id": self.target_id,
            "edge_kind": self.edge_kind.value if self.edge_kind else None,
            "qty": float(self.qty) if self.qty else None,
            "source_type": self.source_type,
            "target_type": self.target_type,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

# ============================================================================
# 📊 EmissionAttribution 엔티티 (배출량 귀속)
# ============================================================================

class EmissionAttribution(Base):
    """배출량 귀속 엔티티"""
    
    __tablename__ = "emission_attribution"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("product.id"), nullable=True)  # 제품 ID
    process_id = Column(Integer, ForeignKey("process.id"), nullable=True)  # 프로세스 ID
    emission_type = Column(SQLEnum(EmissionTypeEnum), nullable=False)  # 배출 타입
    emission_amount = Column(Numeric(15, 6), nullable=False, default=0)  # 배출량
    attribution_method = Column(SQLEnum(AllocationMethodEnum), nullable=False)  # 귀속방법
    allocation_ratio = Column(Numeric(5, 4), default=1.0)  # 배분비율
    calculation_date = Column(DateTime, default=datetime.utcnow)  # 계산일
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 관계 설정
    product = relationship("Product")
    process = relationship("Process")
    
    def to_dict(self) -> Dict[str, Any]:
        """엔티티를 딕셔너리로 변환"""
        return {
            "id": self.id,
            "product_id": self.product_id,
            "process_id": self.process_id,
            "emission_type": self.emission_type.value if self.emission_type else None,
            "emission_amount": float(self.emission_amount) if self.emission_amount else 0.0,
            "attribution_method": self.attribution_method.value if self.attribution_method else None,
            "allocation_ratio": float(self.allocation_ratio) if self.allocation_ratio else None,
            "calculation_date": self.calculation_date.isoformat() if self.calculation_date else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

# ============================================================================
# 📈 ProductEmissions 엔티티 (제품별 총 배출량)
# ============================================================================

class ProductEmissions(Base):
    """제품별 총 배출량 엔티티"""
    
    __tablename__ = "product_emissions"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("product.id"), nullable=False, unique=True)  # 제품 ID (1:1 관계)
    direct_emission = Column(Numeric(15, 6), nullable=False, default=0)  # 직접배출량
    indirect_emission = Column(Numeric(15, 6), nullable=False, default=0)  # 간접배출량
    precursor_emission = Column(Numeric(15, 6), nullable=False, default=0)  # 전구체배출량
    total_emission = Column(Numeric(15, 6), nullable=False, default=0)  # 총배출량
    emission_intensity = Column(Numeric(15, 6))  # 배출강도 (tCO2/ton)
    calculation_date = Column(DateTime, default=datetime.utcnow)  # 계산일
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 관계 설정
    product = relationship("Product")
    
    def to_dict(self) -> Dict[str, Any]:
        """엔티티를 딕셔너리로 변환"""
        return {
            "id": self.id,
            "product_id": self.product_id,
            "direct_emission": float(self.direct_emission) if self.direct_emission else 0.0,
            "indirect_emission": float(self.indirect_emission) if self.indirect_emission else 0.0,
            "precursor_emission": float(self.precursor_emission) if self.precursor_emission else 0.0,
            "total_emission": float(self.total_emission) if self.total_emission else 0.0,
            "emission_intensity": float(self.emission_intensity) if self.emission_intensity else None,
            "calculation_date": self.calculation_date.isoformat() if self.calculation_date else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

# ============================================================================
# 📋 CBAMDeclaration 엔티티 (CBAM 신고)
# ============================================================================

class CBAMDeclaration(Base):
    """CBAM 신고 엔티티"""
    
    __tablename__ = "cbam_declaration"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("product.id"), nullable=False)  # 제품 ID
    declaration_period = Column(Text, nullable=False)  # 신고기간 (YYYY-MM)
    total_emission = Column(Numeric(15, 6), nullable=False, default=0)  # 총배출량
    embedded_emission = Column(Numeric(15, 6), nullable=False, default=0)  # 내재배출량
    carbon_price = Column(Numeric(10, 2))  # 탄소가격 (EUR/ton CO2)
    declaration_status = Column(Text, default="draft")  # 신고상태
    submitted_at = Column(DateTime)  # 제출일
    approved_at = Column(DateTime)  # 승인일
    notes = Column(Text)  # 비고
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 관계 설정
    product = relationship("Product")
    
    def to_dict(self) -> Dict[str, Any]:
        """엔티티를 딕셔너리로 변환"""
        return {
            "id": self.id,
            "product_id": self.product_id,
            "declaration_period": self.declaration_period,
            "total_emission": float(self.total_emission) if self.total_emission else 0.0,
            "embedded_emission": float(self.embedded_emission) if self.embedded_emission else 0.0,
            "carbon_price": float(self.carbon_price) if self.carbon_price else None,
            "declaration_status": self.declaration_status,
            "submitted_at": self.submitted_at.isoformat() if self.submitted_at else None,
            "approved_at": self.approved_at.isoformat() if self.approved_at else None,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }