#!/usr/bin/env python3
"""
Auth Service 라우터 디버그 스크립트
실제로 등록된 모든 엔드포인트를 확인합니다.
"""

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.common.db import create_tables, test_database_connection
from app.common.logger import auth_logger
from app.router.auth import router as auth_router
from app.router.country import router as country_router

# FastAPI 앱 생성
app = FastAPI(
    title="Auth Service Debug",
    description="인증 서비스 디버그 모드",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(auth_router, prefix="/api/v1")
app.include_router(country_router, prefix="/api/v1/countries")

@app.get("/debug/routes")
async def debug_routes():
    """등록된 모든 라우터 정보를 반환합니다."""
    routes = []
    
    for route in app.routes:
        if hasattr(route, 'path'):
            route_info = {
                "path": route.path,
                "name": route.name,
                "methods": list(route.methods) if hasattr(route, 'methods') else [],
                "endpoint": str(route.endpoint) if hasattr(route, 'endpoint') else None
            }
            routes.append(route_info)
    
    return {
        "total_routes": len(routes),
        "routes": routes,
        "app_info": {
            "title": app.title,
            "version": app.version,
            "openapi_url": app.openapi_url
        }
    }

@app.get("/debug/countries")
async def debug_countries():
    """Countries 라우터 상태를 확인합니다."""
    try:
        # countries 라우터의 모든 엔드포인트 확인
        country_routes = []
        for route in country_router.routes:
            if hasattr(route, 'path'):
                route_info = {
                    "path": route.path,
                    "name": route.name,
                    "methods": list(route.methods) if hasattr(route, 'methods') else [],
                    "endpoint": str(route.endpoint) if hasattr(route, 'endpoint') else None
                }
                country_routes.append(route_info)
        
        return {
            "country_router_status": "loaded",
            "total_country_routes": len(country_routes),
            "country_routes": country_routes,
            "router_prefix": "/api/v1/countries",
            "full_paths": [f"/api/v1/countries{route['path']}" for route in country_routes]
        }
    except Exception as e:
        return {
            "error": str(e),
            "country_router_status": "error"
        }

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "Auth Service Debug Mode",
        "version": "1.0.0",
        "status": "running",
        "debug_endpoints": [
            "/debug/routes",
            "/debug/countries"
        ]
    }

if __name__ == "__main__":
    print("🔍 Auth Service 라우터 디버그 모드 시작...")
    print("📋 사용 가능한 디버그 엔드포인트:")
    print("   - /debug/routes: 모든 라우터 정보")
    print("   - /debug/countries: Countries 라우터 상태")
    print("   - /docs: Swagger UI")
    
    uvicorn.run(
        "debug_routes:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
