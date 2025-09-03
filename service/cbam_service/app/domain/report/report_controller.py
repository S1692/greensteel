# ============================================================================
# 📊 Report Controller - 보고서 API 엔드포인트
# ============================================================================

import logging
from typing import List
from fastapi import APIRouter, HTTPException, Query, Depends
from fastapi.responses import JSONResponse
from datetime import date

from app.domain.report.report_service import ReportService
from app.domain.report.report_schema import (
    GasEmissionReportRequest, GasEmissionReportResponse,
    ReportStatsResponse
)

logger = logging.getLogger(__name__)

# Gateway를 통해 접근하므로 prefix 제거 (경로 중복 방지)
router = APIRouter(tags=["Report"])

# 서비스 인스턴스 생성
report_service = ReportService()

# ============================================================================
# 📊 Report 관련 엔드포인트
# ============================================================================

@router.get("/gas-emission/{install_id}", response_model=GasEmissionReportResponse)
async def get_gas_emission_report(
    install_id: int,
    start_date: date = Query(..., description="보고 시작일"),
    end_date: date = Query(..., description="보고 종료일"),
    company_name: str = Query(None, description="회사명")
):
    """가스 배출 보고서 조회"""
    try:
        logger.info(f"📊 가스 배출 보고서 조회 요청: 사업장 ID {install_id}, 기간 {start_date} ~ {end_date}")
        
        # 서비스 초기화 확인
        await report_service.initialize()
        
        request = GasEmissionReportRequest(
            install_id=install_id,
            start_date=start_date,
            end_date=end_date,
            company_name=company_name
        )
        
        result = await report_service.generate_gas_emission_report(request)
        logger.info(f"✅ 가스 배출 보고서 조회 성공: 사업장 ID {install_id}")
        return result
        
    except Exception as e:
        logger.error(f"❌ 가스 배출 보고서 조회 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"가스 배출 보고서 조회 중 오류가 발생했습니다: {str(e)}")

@router.get("/stats/{install_id}", response_model=ReportStatsResponse)
async def get_report_stats(
    install_id: int,
    start_date: date = Query(..., description="보고 시작일"),
    end_date: date = Query(..., description="보고 종료일")
):
    """보고서 통계 조회"""
    try:
        logger.info(f"📊 보고서 통계 조회 요청: 사업장 ID {install_id}, 기간 {start_date} ~ {end_date}")
        
        # 서비스 초기화 확인
        await report_service.initialize()
        
        result = await report_service.get_report_stats(install_id, start_date, end_date)
        logger.info(f"✅ 보고서 통계 조회 성공: 사업장 ID {install_id}")
        return result
        
    except Exception as e:
        logger.error(f"❌ 보고서 통계 조회 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"보고서 통계 조회 중 오류가 발생했습니다: {str(e)}")

@router.get("/installations", response_model=List[dict])
async def get_available_installations():
    """보고서 생성 가능한 사업장 목록 조회"""
    try:
        logger.info("📊 보고서 생성 가능한 사업장 목록 조회 요청")
        
        # 서비스 초기화 확인
        await report_service.initialize()
        
        # 간단한 사업장 목록 조회 (실제로는 별도 메서드 필요)
        result = await report_service.report_repository.get_available_installations()
        logger.info(f"✅ 사업장 목록 조회 성공: {len(result)}개")
        return result
        
    except Exception as e:
        logger.error(f"❌ 사업장 목록 조회 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"사업장 목록 조회 중 오류가 발생했습니다: {str(e)}")
