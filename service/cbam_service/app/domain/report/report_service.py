# ============================================================================
# 📊 Report Service - 보고서 비즈니스 로직
# ============================================================================

import logging
from typing import List, Optional, Dict, Any
from datetime import datetime, date

from app.domain.report.report_repository import ReportRepository
from app.domain.report.report_schema import (
    GasEmissionReportRequest, GasEmissionReportResponse,
    InstallationInfo, ProductInfo, ProcessInfo, PrecursorInfo,
    EmissionFactorInfo, ContactInfo, ReportStatsResponse
)

logger = logging.getLogger(__name__)

class ReportService:
    """보고서 비즈니스 로직 클래스"""
    
    def __init__(self):
        self.report_repository = ReportRepository()
        logger.info("✅ Report 서비스 초기화 완료")
    
    async def initialize(self):
        """서비스 초기화"""
        try:
            logger.info("🔄 Report 서비스 초기화 시작")
            await self.report_repository.initialize()
            logger.info("✅ Report 서비스 데이터베이스 초기화 완료")
        except Exception as e:
            logger.error(f"❌ Report 서비스 초기화 실패: {str(e)}")
            raise

    # ============================================================================
    # 📊 Report 관련 메서드
    # ============================================================================

    async def generate_gas_emission_report(self, request: GasEmissionReportRequest) -> GasEmissionReportResponse:
        """가스 배출 보고서 생성"""
        try:
            logger.info(f"📊 가스 배출 보고서 생성 요청: 사업장 ID {request.install_id}, 기간 {request.start_date} ~ {request.end_date}")
            
            # 서비스 초기화 확인
            await self.initialize()
            
            # 1. 사업장 정보 조회
            installation_data = await self.report_repository.get_installation_info(request.install_id)
            if not installation_data:
                raise Exception(f"사업장 ID {request.install_id}를 찾을 수 없습니다.")
            
            installation = InstallationInfo(
                id=installation_data['id'],
                name=installation_data['name'],
                address=installation_data.get('address'),
                country=installation_data.get('country'),
                city=installation_data.get('city'),
                postal_code=installation_data.get('postal_code'),
                coordinates=installation_data.get('coordinates'),
                currency_code=installation_data.get('currency_code')
            )
            
            # 2. 제품 정보 조회
            products_data = await self.report_repository.get_products_by_install_and_period(
                request.install_id, request.start_date, request.end_date
            )
            
            products = []
            for product_data in products_data:
                # 제품별 공정 조회
                processes_data = await self.report_repository.get_processes_by_product(product_data['id'])
                
                processes = []
                for process_data in processes_data:
                    # 공정별 원료 조회
                    materials_data = await self.report_repository.get_materials_by_process(process_data['id'])
                    
                    # 공정별 연료 조회
                    fuels_data = await self.report_repository.get_fuels_by_process(process_data['id'])
                    
                    # 배출량 계산
                    emission_amount = sum(m.get('em_factor', 0) * m.get('quantity', 0) for m in materials_data)
                    emission_amount += sum(f.get('fuel_emfactor', 0) * f.get('quantity', 0) for f in fuels_data)
                    
                    process = ProcessInfo(
                        id=process_data['id'],
                        process_name=process_data['process_name'],
                        start_period=process_data.get('start_period'),
                        end_period=process_data.get('end_period'),
                        materials=materials_data,
                        fuels=fuels_data,
                        emission_amount=emission_amount,
                        aggregated_emission=emission_amount * product_data.get('product_amount', 0)
                    )
                    processes.append(process)
                
                product = ProductInfo(
                    id=product_data['id'],
                    product_name=product_data['product_name'],
                    product_category=product_data['product_category'],
                    cn_code=product_data.get('product_cncode'),
                    goods_name=product_data.get('goods_name'),
                    aggrgoods_name=product_data.get('aggrgoods_name'),
                    product_amount=product_data['product_amount'],
                    prostart_period=product_data['prostart_period'],
                    proend_period=product_data['proend_period'],
                    processes=processes
                )
                products.append(product)
            
            # 3. 전구체 정보 조회
            precursors_data = await self.report_repository.get_precursors_by_install(request.install_id)
            precursors = []
            for precursor_data in precursors_data:
                precursor = PrecursorInfo(
                    id=precursor_data['id'],
                    precursor_name=precursor_data.get('fuel_name') or precursor_data.get('item_name', 'Unknown'),
                    movement_route=f"Type: {precursor_data.get('calculation_type', 'Unknown')}",
                    consumption_processes=[precursor_data.get('calculation_type', 'Unknown')]
                )
                precursors.append(precursor)
            
            # 4. 배출계수 정보 (기본값 사용)
            emission_factor = EmissionFactorInfo(
                cbam_default_value=2.5  # 기본 CBAM 배출계수
            )
            
            # 5. 연락처 정보 조회
            contact_data = await self.report_repository.get_contact_info(request.install_id)
            contact = ContactInfo(
                email=contact_data.get('email') if contact_data else None,
                phone=contact_data.get('username') if contact_data else None
            )
            
            # 6. 회사 정보 조회
            company_data = await self.report_repository.get_company_info(request.install_id)
            company_name = company_data.get('company_name') if company_data else request.company_name or "Unknown Company"
            
            # 보고서 응답 생성
            report = GasEmissionReportResponse(
                company_name=company_name,
                issue_date=request.issue_date or date.today(),
                start_period=request.start_date,
                end_period=request.end_date,
                installation=installation,
                products=products,
                precursors=precursors,
                emission_factor=emission_factor,
                contact=contact
            )
            
            logger.info(f"✅ 가스 배출 보고서 생성 성공: 제품 {len(products)}개, 공정 {sum(len(p.processes) for p in products)}개")
            return report
            
        except Exception as e:
            logger.error(f"❌ 가스 배출 보고서 생성 실패: {str(e)}")
            raise

    async def get_report_stats(self, install_id: int, start_date: date, end_date: date) -> ReportStatsResponse:
        """보고서 통계 조회"""
        try:
            logger.info(f"📊 보고서 통계 조회 요청: 사업장 ID {install_id}")
            
            # 서비스 초기화 확인
            await self.initialize()
            
            # 제품 수 조회
            products_data = await self.report_repository.get_products_by_install_and_period(
                install_id, start_date, end_date
            )
            
            total_products = len(products_data)
            total_processes = 0
            total_emissions = 0.0
            
            for product_data in products_data:
                processes_data = await self.report_repository.get_processes_by_product(product_data['id'])
                total_processes += len(processes_data)
                
                for process_data in processes_data:
                    materials_data = await self.report_repository.get_materials_by_process(process_data['id'])
                    fuels_data = await self.report_repository.get_fuels_by_process(process_data['id'])
                    
                    emission_amount = sum(m.get('em_factor', 0) * m.get('quantity', 0) for m in materials_data)
                    emission_amount += sum(f.get('fuel_emfactor', 0) * f.get('quantity', 0) for f in fuels_data)
                    total_emissions += emission_amount * product_data.get('product_amount', 0)
            
            stats = ReportStatsResponse(
                total_installations=1,  # 현재 사업장 1개
                total_products=total_products,
                total_processes=total_processes,
                total_emissions=total_emissions,
                report_period=f"{start_date} ~ {end_date}"
            )
            
            logger.info(f"✅ 보고서 통계 조회 성공: 제품 {total_products}개, 공정 {total_processes}개, 총 배출량 {total_emissions:.2f}")
            return stats
            
        except Exception as e:
            logger.error(f"❌ 보고서 통계 조회 실패: {str(e)}")
            raise
