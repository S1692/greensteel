# ============================================================================
# 📊 Report Repository - 보고서 데이터 접근
# ============================================================================

import logging
import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime, date
import asyncpg
import os

logger = logging.getLogger(__name__)

class ReportRepository:
    """보고서 데이터 접근 클래스"""
    
    def __init__(self):
        self.database_url = os.getenv('DATABASE_URL')
        self.pool = None
        self._initialization_attempted = False
        
        if not self.database_url:
            logger.warning("DATABASE_URL 환경변수가 설정되지 않았습니다. 데이터베이스 기능이 제한됩니다.")
            return
    
    async def initialize(self):
        """데이터베이스 연결 풀 초기화"""
        if self._initialization_attempted:
            logger.info("🔄 Report Repository 이미 초기화 시도됨, 건너뜀")
            return
            
        if not self.database_url:
            logger.warning("⚠️ DATABASE_URL이 없어 데이터베이스 초기화를 건너뜁니다.")
            self._initialization_attempted = True
            return
        
        self._initialization_attempted = True
        logger.info(f"🔄 Report Repository 초기화 시작 - DATABASE_URL: {self.database_url[:20]}...")
        
        try:
            # asyncpg 연결 풀 생성
            self.pool = await asyncpg.create_pool(
                self.database_url,
                min_size=1,
                max_size=10,
                command_timeout=30,
                server_settings={
                    'application_name': 'cbam-service'
                }
            )
            
            logger.info("✅ Report 데이터베이스 연결 풀 생성 성공")
            
        except Exception as e:
            logger.error(f"❌ 데이터베이스 연결 실패: {str(e)}")
            logger.warning("데이터베이스 연결 실패로 인해 일부 기능이 제한됩니다.")
            self.pool = None
    
    async def _ensure_pool_initialized(self):
        """연결 풀이 초기화되었는지 확인하고, 필요시 초기화"""
        if not self.pool and not self._initialization_attempted:
            await self.initialize()
        
        if not self.pool:
            logger.error("❌ 데이터베이스 연결 풀이 초기화되지 않았습니다.")
            raise Exception("데이터베이스 연결 풀이 초기화되지 않았습니다.")

    # ============================================================================
    # 📊 Report 관련 Repository 메서드
    # ============================================================================

    async def get_installation_info(self, install_id: int) -> Optional[Dict[str, Any]]:
        """사업장 정보 조회"""
        await self._ensure_pool_initialized()
        
        try:
            async with self.pool.acquire() as conn:
                result = await conn.fetchrow("""
                    SELECT 
                        i.id,
                        i.name,
                        i.address,
                        i.country,
                        i.city,
                        i.postal_code,
                        i.coordinates,
                        i.currency_code,
                        c.company_name,
                        c.business_number,
                        c.source_latitude,
                        c.source_longitude
                    FROM install i
                    LEFT JOIN companies c ON i.company_id = c.id
                    WHERE i.id = $1
                """, install_id)
                
                if result:
                    return dict(result)
                return None
                
        except Exception as e:
            logger.error(f"❌ 사업장 정보 조회 실패: {str(e)}")
            raise

    async def get_products_by_install_and_period(self, install_id: int, start_date: date, end_date: date) -> List[Dict[str, Any]]:
        """기간별 사업장 제품 조회"""
        await self._ensure_pool_initialized()
        
        try:
            async with self.pool.acquire() as conn:
                results = await conn.fetch("""
                    SELECT 
                        p.id,
                        p.product_name,
                        p.product_category,
                        p.product_cncode,
                        p.goods_name,
                        p.aggrgoods_name,
                        p.product_amount,
                        p.prostart_period,
                        p.proend_period,
                        p.product_sell,
                        p.product_eusell
                    FROM product p
                    WHERE p.install_id = $1
                    AND p.prostart_period <= $3
                    AND p.proend_period >= $2
                    ORDER BY p.product_name
                """, install_id, start_date, end_date)
                
                return [dict(result) for result in results]
                
        except Exception as e:
            logger.error(f"❌ 기간별 제품 조회 실패: {str(e)}")
            raise

    async def get_processes_by_product(self, product_id: int) -> List[Dict[str, Any]]:
        """제품별 공정 조회"""
        await self._ensure_pool_initialized()
        
        try:
            async with self.pool.acquire() as conn:
                results = await conn.fetch("""
                    SELECT 
                        pr.id,
                        pr.process_name,
                        pr.start_period,
                        pr.end_period,
                        pp.consumption_amount
                    FROM product_process pp
                    JOIN process pr ON pp.process_id = pr.id
                    WHERE pp.product_id = $1
                    ORDER BY pr.process_name
                """, product_id)
                
                return [dict(result) for result in results]
                
        except Exception as e:
            logger.error(f"❌ 제품별 공정 조회 실패: {str(e)}")
            raise

    async def get_materials_by_process(self, process_id: int) -> List[Dict[str, Any]]:
        """공정별 원료 조회"""
        await self._ensure_pool_initialized()
        
        try:
            async with self.pool.acquire() as conn:
                results = await conn.fetch("""
                    SELECT 
                        m.id,
                        m.item_name,
                        m.item_eng,
                        m.carbon_factor,
                        m.em_factor,
                        m.cn_code,
                        pi.quantity,
                        pi.input_type
                    FROM process_input pi
                    JOIN materials m ON pi.material_id = m.id
                    WHERE pi.process_id = $1 AND pi.input_type = 'material'
                    ORDER BY m.item_name
                """, process_id)
                
                return [dict(result) for result in results]
                
        except Exception as e:
            logger.error(f"❌ 공정별 원료 조회 실패: {str(e)}")
            raise

    async def get_fuels_by_process(self, process_id: int) -> List[Dict[str, Any]]:
        """공정별 연료 조회"""
        await self._ensure_pool_initialized()
        
        try:
            async with self.pool.acquire() as conn:
                results = await conn.fetch("""
                    SELECT 
                        f.id,
                        f.fuel_name,
                        f.fuel_eng,
                        f.fuel_emfactor,
                        f.net_calory,
                        pi.quantity,
                        pi.input_type
                    FROM process_input pi
                    JOIN fuels f ON pi.fuel_id = f.id
                    WHERE pi.process_id = $1 AND pi.input_type = 'fuel'
                    ORDER BY f.fuel_name
                """, process_id)
                
                return [dict(result) for result in results]
                
        except Exception as e:
            logger.error(f"❌ 공정별 연료 조회 실패: {str(e)}")
            raise

    async def get_precursors_by_install(self, install_id: int) -> List[Dict[str, Any]]:
        """사업장별 전구체 조회"""
        await self._ensure_pool_initialized()
        
        try:
            async with self.pool.acquire() as conn:
                results = await conn.fetch("""
                    SELECT 
                        p.id,
                        p.user_id,
                        p.calculation_type,
                        p.quantity,
                        f.fuel_name,
                        m.item_name,
                        p.created_at
                    FROM precursors p
                    LEFT JOIN fuels f ON p.fuel_id = f.id
                    LEFT JOIN materials m ON p.material_id = m.id
                    WHERE p.user_id IN (
                        SELECT u.id::text FROM users u 
                        JOIN companies c ON u.company_id = c.id
                        JOIN install i ON c.id = i.company_id
                        WHERE i.id = $1
                    )
                    ORDER BY p.created_at DESC
                """, install_id)
                
                return [dict(result) for result in results]
                
        except Exception as e:
            logger.error(f"❌ 사업장별 전구체 조회 실패: {str(e)}")
            raise

    async def get_emission_calculations(self, install_id: int, start_date: date, end_date: date) -> List[Dict[str, Any]]:
        """배출량 계산 결과 조회"""
        await self._ensure_pool_initialized()
        
        try:
            async with self.pool.acquire() as conn:
                results = await conn.fetch("""
                    SELECT 
                        cr.id,
                        cr.calculation_type,
                        cr.total_emission,
                        cr.embedded_emission,
                        cr.carbon_price,
                        cr.calculation_date,
                        p.product_name,
                        pr.process_name
                    FROM calculation_results cr
                    JOIN product p ON cr.product_id = p.id
                    LEFT JOIN process pr ON cr.process_id = pr.id
                    WHERE p.install_id = $1
                    AND cr.calculation_date BETWEEN $2 AND $3
                    ORDER BY cr.calculation_date DESC
                """, install_id, start_date, end_date)
                
                return [dict(result) for result in results]
                
        except Exception as e:
            logger.error(f"❌ 배출량 계산 결과 조회 실패: {str(e)}")
            raise

    async def get_company_info(self, install_id: int) -> Optional[Dict[str, Any]]:
        """회사 정보 조회"""
        await self._ensure_pool_initialized()
        
        try:
            async with self.pool.acquire() as conn:
                result = await conn.fetchrow("""
                    SELECT 
                        c.id,
                        c.company_name,
                        c.business_number,
                        c.address,
                        c.installation,
                        c.source_latitude,
                        c.source_longitude
                    FROM companies c
                    JOIN install i ON c.id = i.company_id
                    WHERE i.id = $1
                """, install_id)
                
                if result:
                    return dict(result)
                return None
                
        except Exception as e:
            logger.error(f"❌ 회사 정보 조회 실패: {str(e)}")
            raise

    async def get_contact_info(self, install_id: int) -> Optional[Dict[str, Any]]:
        """연락처 정보 조회"""
        await self._ensure_pool_initialized()
        
        try:
            async with self.pool.acquire() as conn:
                result = await conn.fetchrow("""
                    SELECT 
                        u.email,
                        u.username,
                        c.company_name
                    FROM users u
                    JOIN companies c ON u.company_id = c.id
                    JOIN install i ON c.id = i.company_id
                    WHERE i.id = $1
                    LIMIT 1
                """, install_id)
                
                if result:
                    return dict(result)
                return None
                
        except Exception as e:
            logger.error(f"❌ 연락처 정보 조회 실패: {str(e)}")
            raise

    async def get_available_installations(self) -> List[Dict[str, Any]]:
        """보고서 생성 가능한 사업장 목록 조회"""
        await self._ensure_pool_initialized()
        
        try:
            async with self.pool.acquire() as conn:
                results = await conn.fetch("""
                    SELECT 
                        i.id,
                        i.name,
                        i.address,
                        i.country,
                        i.city,
                        c.company_name,
                        COUNT(p.id) as product_count
                    FROM install i
                    LEFT JOIN companies c ON i.company_id = c.id
                    LEFT JOIN product p ON i.id = p.install_id
                    GROUP BY i.id, i.name, i.address, i.country, i.city, c.company_name
                    ORDER BY i.name
                """)
                
                return [dict(result) for result in results]
                
        except Exception as e:
            logger.error(f"❌ 사업장 목록 조회 실패: {str(e)}")
            raise
