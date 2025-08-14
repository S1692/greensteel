import os
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
import time

from .domain.proxy import ProxyController
from .common.utility.logger import gateway_logger

# 환경변수에서 설정 가져오기 (기본값 포함)
GATEWAY_NAME = os.getenv("GATEWAY_NAME", "gateway")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "https://greensteel.site,https://www.greensteel.site")
ALLOWED_ORIGIN_REGEX = os.getenv("ALLOWED_ORIGIN_REGEX", "^https://.*\\.vercel\\.app$|^https://.*\\.up\\.railway\\.app$")
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

# CORS 허용 오리진 파싱
allowed_origins = [origin.strip() for origin in ALLOWED_ORIGINS.split(",") if origin.strip()]

@asynccontextmanager
async def lifespan(app: FastAPI):
    """애플리케이션 생명주기 관리"""
    # 시작 시
    gateway_logger.log_info(f"Gateway {GATEWAY_NAME} starting up...")
    yield
    # 종료 시
    gateway_logger.log_info(f"Gateway {GATEWAY_NAME} shutting down...")

# FastAPI 애플리케이션 생성
app = FastAPI(
    title=f"{GATEWAY_NAME} API Gateway",
    description="Microservices API Gateway with proxy routing and CORS support",
    version="1.0.0",
    lifespan=lifespan
)

# CORS 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=ALLOWED_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600
)

# 신뢰할 수 있는 호스트 미들웨어 (보안 강화)
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"]  # 프로덕션에서는 특정 도메인만 허용하도록 설정
)

# 프록시 컨트롤러 인스턴스
proxy_controller = ProxyController()

# 요청 시간 측정 미들웨어
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

# 헬스체크 엔드포인트
@app.get("/health")
async def health_check():
    """게이트웨이 헬스체크"""
    return proxy_controller.health_check()

# 서비스 상태 확인 엔드포인트
@app.get("/status")
async def service_status():
    """서비스 상태 정보"""
    return await proxy_controller.get_service_status()

# 라우팅 정보 엔드포인트
@app.get("/routing")
async def routing_info():
    """라우팅 규칙 및 설정 정보"""
    return proxy_controller.get_routing_info()

# 모든 HTTP 메서드에 대한 프록시 라우팅
@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"])
async def proxy_route(request: Request, path: str):
    """모든 경로에 대한 프록시 라우팅"""
    # 루트 경로는 헬스체크로 리다이렉트
    if path == "" or path == "/":
        return {"message": "Gateway is running", "health_check": "/health"}
    
    # 프록시 요청 처리
    return await proxy_controller.proxy_request(request)

# 루트 경로
@app.get("/")
async def root():
    """루트 경로"""
    return {
        "message": f"{GATEWAY_NAME} API Gateway",
        "version": "1.0.0",
        "health_check": "/health",
        "status": "/status",
        "routing": "/routing",
        "documentation": "/docs"
    }

# 예외 처리
@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    """404 에러 처리"""
    gateway_logger.log_warning(f"404 Not Found: {request.url.path}")
    return {"error": "Not Found", "path": request.url.path}

@app.exception_handler(400)
async def bad_request_handler(request: Request, exc):
    """400 에러 처리"""
    gateway_logger.log_warning(f"400 Bad Request: {request.url.path}")
    return {"error": "Bad Request", "detail": str(exc.detail) if hasattr(exc, 'detail') else "Invalid request"}

@app.exception_handler(500)
async def internal_error_handler(request: Request, exc):
    """500 에러 처리"""
    gateway_logger.log_error(f"Internal Server Error: {request.url.path}")
    return {"error": "Internal Server Error"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8080,
        reload=False,
        proxy_headers=True
    )
