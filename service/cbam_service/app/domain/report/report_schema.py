# ============================================================================
# 📊 Report Schema - 보고서 관련 스키마
# ============================================================================

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, date

class InstallationInfo(BaseModel):
    """사업장 정보"""
    id: int
    name: str = Field(..., description="사업장명")
    address: Optional[str] = Field(None, description="주소")
    country: Optional[str] = Field(None, description="국가")
    city: Optional[str] = Field(None, description="도시")
    postal_code: Optional[str] = Field(None, description="우편번호")
    coordinates: Optional[str] = Field(None, description="좌표(위도, 경도)")
    currency_code: Optional[str] = Field(None, description="UN 통화 코드")

class ProcessInfo(BaseModel):
    """공정 정보"""
    id: int
    process_name: str = Field(..., description="공정명")
    start_period: Optional[date] = Field(None, description="시작 기간")
    end_period: Optional[date] = Field(None, description="종료 기간")
    materials: List[Dict[str, Any]] = Field(default_factory=list, description="원료 정보")
    fuels: List[Dict[str, Any]] = Field(default_factory=list, description="연료 정보")
    emission_amount: Optional[float] = Field(None, description="배출량")
    aggregated_emission: Optional[float] = Field(None, description="집계된 배출량")

class ProductInfo(BaseModel):
    """제품 정보"""
    id: int
    product_name: str = Field(..., description="제품명")
    product_category: str = Field(..., description="제품 카테고리")
    cn_code: Optional[str] = Field(None, description="CN 코드")
    goods_name: Optional[str] = Field(None, description="상품명")
    aggrgoods_name: Optional[str] = Field(None, description="집계 상품명")
    product_amount: float = Field(..., description="생산량")
    prostart_period: date = Field(..., description="생산 시작 기간")
    proend_period: date = Field(..., description="생산 종료 기간")
    processes: List[ProcessInfo] = Field(default_factory=list, description="관련 공정들")

class PrecursorInfo(BaseModel):
    """전구체 정보"""
    id: int
    precursor_name: str = Field(..., description="전구물질명")
    movement_route: Optional[str] = Field(None, description="이동 루트")
    consumption_processes: List[str] = Field(default_factory=list, description="소모 공정들")

class EmissionFactorInfo(BaseModel):
    """배출계수 정보"""
    cbam_default_value: Optional[float] = Field(None, description="CBAM 기본값")

class ContactInfo(BaseModel):
    """연락처 정보"""
    email: Optional[str] = Field(None, description="이메일")
    phone: Optional[str] = Field(None, description="대표 번호")

class GasEmissionReportRequest(BaseModel):
    """가스 배출 보고서 생성 요청"""
    install_id: int = Field(..., description="사업장 ID")
    start_date: date = Field(..., description="보고 시작일")
    end_date: date = Field(..., description="보고 종료일")
    company_name: Optional[str] = Field(None, description="회사명")
    issue_date: Optional[date] = Field(None, description="발행일자")

class GasEmissionReportResponse(BaseModel):
    """가스 배출 보고서 응답"""
    # 헤더 정보
    company_name: str = Field(..., description="회사명")
    issue_date: date = Field(..., description="발행일자")
    
    # 생산 기간
    start_period: date = Field(..., description="시작 기간")
    end_period: date = Field(..., description="종료 기간")
    
    # 사업장 정보
    installation: InstallationInfo = Field(..., description="사업장 정보")
    
    # 제품 정보
    products: List[ProductInfo] = Field(..., description="제품 목록")
    
    # 전구체 정보
    precursors: List[PrecursorInfo] = Field(default_factory=list, description="전구체 목록")
    
    # 배출계수 정보
    emission_factor: EmissionFactorInfo = Field(..., description="배출계수 정보")
    
    # 연락처 정보
    contact: ContactInfo = Field(..., description="연락처 정보")

class ReportStatsResponse(BaseModel):
    """보고서 통계 응답"""
    total_installations: int = Field(..., description="총 사업장 수")
    total_products: int = Field(..., description="총 제품 수")
    total_processes: int = Field(..., description="총 공정 수")
    total_emissions: float = Field(..., description="총 배출량")
    report_period: str = Field(..., description="보고 기간")
