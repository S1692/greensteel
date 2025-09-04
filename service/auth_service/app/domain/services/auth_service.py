from typing import Dict, Any
import uuid
import hashlib
from app.common.logger import auth_logger
from app.common.database import get_database_connection, close_database_connection
from app.domain.entities.user import User
from app.domain.entities.company import Company

class AuthService:
    """인증 도메인 서비스"""
    
    def _hash_password(self, password: str) -> str:
        """비밀번호를 SHA-256으로 해싱"""
        return hashlib.sha256(password.encode()).hexdigest()
    
    async def register_user(self, username: str, full_name: str, company_id: str, password: str, role: str = "승인 전") -> Dict[str, Any]:
        """사용자 등록 (실제 DB 연동)"""
        connection = None
        try:
            connection = await get_database_connection()
            
            # 기업 ID 존재 확인
            company_exists = await connection.fetchval(
                "SELECT 1 FROM companies WHERE company_id = $1",
                company_id
            )
            
            if not company_exists:
                return {
                    "success": False,
                    "message": "존재하지 않는 기업 ID입니다.",
                    "data": {}
                }
            
            # 사용자명 중복 확인 (users 테이블)
            username_exists = await connection.fetchval(
                "SELECT 1 FROM users WHERE username = $1",
                username
            )
            
            if username_exists:
                return {
                    "success": False,
                    "message": "이미 사용 중인 사용자명입니다.",
                    "data": {}
                }
            
            # 사용자명이 기업 ID로 사용되고 있는지 확인 (companies 테이블)
            company_id_exists = await connection.fetchval(
                "SELECT 1 FROM companies WHERE company_id = $1",
                username
            )
            
            if company_id_exists:
                return {
                    "success": False,
                    "message": "사용자명이 이미 기업 ID로 사용되고 있습니다. 다른 사용자명을 사용해주세요.",
                    "data": {}
                }
            
            # 비밀번호 해싱
            hashed_password = self._hash_password(password)
            
            # 사용자 등록
            user_id = await connection.fetchval("""
                INSERT INTO users (username, password, full_name, company_id, role)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id
            """, username, hashed_password, full_name, company_id, role)
            
            auth_logger.info(f"User registered successfully: {username} with role: {role}")
            return {
                "success": True,
                "message": "사용자 등록이 완료되었습니다.",
                "data": {
                    "userId": user_id,
                    "username": username,
                    "fullName": full_name,
                    "role": role
                }
            }
        except Exception as e:
            auth_logger.error(f"User registration failed: {str(e)}")
            return {
                "success": False,
                "message": f"사용자 등록에 실패했습니다: {str(e)}",
                "data": {}
            }
        finally:
            if connection:
                await close_database_connection(connection)
    
    async def register_company(self, company_id: str, password: str, Installation: str, Installation_en: str,
                             economic_activity: str, economic_activity_en: str, representative: str, representative_en: str,
                             email: str, telephone: str, street: str, street_en: str, number: str, number_en: str,
                             postcode: str, city: str, city_en: str, country: str, country_en: str, unlocode: str,
                             source_latitude: float = None, source_longitude: float = None) -> Dict[str, Any]:
        """회사 등록 (실제 DB 연동)"""
        connection = None
        try:
            connection = await get_database_connection()
            
            # 기업 ID 중복 확인 (companies 테이블)
            company_exists = await connection.fetchval(
                "SELECT 1 FROM companies WHERE company_id = $1",
                company_id
            )
            
            if company_exists:
                return {
                    "success": False,
                    "message": "이미 사용 중인 기업 ID입니다.",
                    "data": {}
                }
            
            # 기업 ID가 사용자명으로 사용되고 있는지 확인 (users 테이블)
            username_exists = await connection.fetchval(
                "SELECT 1 FROM users WHERE username = $1",
                company_id
            )
            
            if username_exists:
                return {
                    "success": False,
                    "message": "기업 ID가 이미 사용자명으로 사용되고 있습니다. 다른 기업 ID를 사용해주세요.",
                    "data": {}
                }
            
            # 비밀번호 해싱
            hashed_password = self._hash_password(password)
            
            # 기업 등록
            company_id_result = await connection.fetchval("""
                INSERT INTO companies (
                    company_id, password, Installation, Installation_en, economic_activity, economic_activity_en,
                    representative, representative_en, email, telephone, street, street_en, number, number_en,
                    postcode, city, city_en, country, country_en, unlocode, source_latitude, source_longitude
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
                RETURNING company_id
            """, company_id, hashed_password, Installation, Installation_en, economic_activity, economic_activity_en,
                 representative, representative_en, email, telephone, street, street_en, number, number_en,
                 postcode, city, city_en, country, country_en, unlocode, source_latitude, source_longitude)
            
            auth_logger.info(f"Company registered successfully: {Installation}")
            return {
                "success": True,
                "message": "기업 등록이 완료되었습니다.",
                "data": {
                    "companyId": company_id_result,
                    "companyName": Installation,
                    "businessNumber": company_id
                }
            }
        except Exception as e:
            auth_logger.error(f"Company registration failed: {str(e)}")
            return {
                "success": False,
                "message": f"기업 등록에 실패했습니다: {str(e)}",
                "data": {}
            }
        finally:
            if connection:
                await close_database_connection(connection)
    
    async def check_username(self, username: str) -> Dict[str, Any]:
        """사용자명 중복 확인 (실제 DB 연동)"""
        connection = None
        try:
            connection = await get_database_connection()
            
            # 사용자명 중복 확인 (users 테이블)
            username_exists = await connection.fetchval(
                "SELECT 1 FROM users WHERE username = $1",
                username
            )
            
            # 사용자명이 기업 ID로 사용되고 있는지 확인 (companies 테이블)
            company_id_exists = await connection.fetchval(
                "SELECT 1 FROM companies WHERE company_id = $1",
                username
            )
            
            # 사용자명이 사용 가능한지 확인 (둘 다 존재하지 않아야 함)
            available = not username_exists and not company_id_exists
            
            auth_logger.info(f"Username availability checked: {username} - Available: {available}")
            return {
                "success": True,
                "message": "사용자명 중복 확인 완료",
                "data": {
                    "available": available,
                    "username": username
                }
            }
        except Exception as e:
            auth_logger.error(f"Username check failed: {str(e)}")
            return {
                "success": False,
                "message": f"사용자명 중복 확인에 실패했습니다: {str(e)}",
                "data": {}
            }
        finally:
            if connection:
                await close_database_connection(connection)

    async def check_company_id(self, company_id: str) -> Dict[str, Any]:
        """기업 ID 존재 확인 (실제 DB 연동)"""
        connection = None
        try:
            connection = await get_database_connection()
            
            # 기업 ID 존재 확인
            company_exists = await connection.fetchval(
                "SELECT 1 FROM companies WHERE company_id = $1",
                company_id
            )
            
            exists = bool(company_exists)
            
            auth_logger.info(f"Company ID existence checked: {company_id} - Exists: {exists}")
            return {
                "success": True,
                "message": "기업 ID 존재 확인 완료",
                "data": {
                    "available": exists,
                    "company_id": company_id
                }
            }
        except Exception as e:
            auth_logger.error(f"Company ID check failed: {str(e)}")
            return {
                "success": False,
                "message": f"기업 ID 존재 확인에 실패했습니다: {str(e)}",
                "data": {},
            }
        finally:
            if connection:
                await close_database_connection(connection)

    async def check_company_id_availability(self, company_id: str) -> Dict[str, Any]:
        """기업 ID 중복 확인 (실제 DB 연동)"""
        connection = None
        try:
            connection = await get_database_connection()
            
            # 기업 ID 중복 확인 (companies 테이블)
            company_exists = await connection.fetchval(
                "SELECT 1 FROM companies WHERE company_id = $1",
                company_id
            )
            
            # 기업 ID가 사용자명으로 사용되고 있는지 확인 (users 테이블)
            username_exists = await connection.fetchval(
                "SELECT 1 FROM users WHERE username = $1",
                company_id
            )
            
            # 기업 ID가 사용 가능한지 확인 (둘 다 존재하지 않아야 함)
            available = not company_exists and not username_exists
            
            auth_logger.info(f"Company ID availability checked: {company_id} - Available: {available}")
            return {
                "success": True,
                "message": "기업 ID 중복 확인 완료",
                "data": {
                    "available": available,
                    "company_id": company_id
                }
            }
        except Exception as e:
            auth_logger.error(f"Company ID availability check failed: {str(e)}")
            return {
                "success": False,
                "message": f"기업 ID 중복 확인에 실패했습니다: {str(e)}",
                "data": {}
            }
        finally:
            if connection:
                await close_database_connection(connection)

    async def login(self, username: str, password: str) -> Dict[str, Any]:
        """로그인 (더미 구현)"""
        try:
            # 더미 토큰 생성
            token = f"dummy_token_{uuid.uuid4().hex[:16]}"
            
            auth_logger.info(f"Login successful for user: {username}")
            return {
                "success": True,
                "message": "Login successful (dummy response)",
                "data": {
                    "token": token,
                    "user": {
                        "id": f"user_{uuid.uuid4().hex[:8]}",
                        "username": username,
                        "role": "user"
                    }
                }
            }
        except Exception as e:
            auth_logger.error(f"Login failed: {str(e)}")
            return {
                "success": False,
                "message": f"Login failed: {str(e)}",
                "data": {}
            }
