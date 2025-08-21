import httpx
from typing import Dict, Any
from app.common.settings import settings
from app.common.logger import auth_logger

class AddressService:
    """주소 검색 도메인 서비스"""
    
    def __init__(self):
        self.kakao_api_key = settings.KAKAO_API_KEY
        self.kakao_url = "https://dapi.kakao.com/v2/local/search/address.json"
    
    async def search_address(self, query: str) -> Dict[str, Any]:
        """카카오 API를 통한 주소 검색"""
        if not self.kakao_api_key:
            auth_logger.error("Kakao API key not configured")
            return {
                "success": False,
                "message": "Kakao API key not configured",
                "data": {}
            }
        
        try:
            headers = {"Authorization": f"KakaoAK {self.kakao_api_key}"}
            params = {"query": query}
            
            async with httpx.AsyncClient() as client:
                response = await client.get(self.kakao_url, headers=headers, params=params)
                
            if response.status_code == 200:
                data = response.json()
                auth_logger.info(f"Address search successful for query: {query}")
                return {
                    "success": True,
                    "message": "Address search completed",
                    "data": data
                }
            else:
                auth_logger.error(f"Kakao API error: {response.status_code}")
                return {
                    "success": False,
                    "message": f"Kakao API error: {response.status_code}",
                    "data": {}
                }
                
        except Exception as e:
            auth_logger.error(f"Address search failed: {str(e)}")
            return {
                "success": False,
                "message": f"Address search failed: {str(e)}",
                "data": {}
            }
