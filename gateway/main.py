import os
from fastapi import FastAPI, Request, Response, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
import time
import httpx

from app.domain.proxy import ProxyController
from app.common.utility.logger import gateway_logger

# 환경변수에서 설정 가져오기 (기본값 포함)
GATEWAY_NAME = os.getenv("GATEWAY_NAME", "greensteel-gateway")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "https://greensteel.site,https://www.greensteel.site,http://localhost:3000")
ALLOWED_ORIGIN_REGEX = os.getenv("ALLOWED_ORIGIN_REGEX", "^https://.*\\.vercel\\.app$|^https://.*\\.up\\.railway\\.app$")
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

# 서비스 URL 환경 변수
CHATBOT_SERVICE_URL = os.getenv("CHATBOT_SERVICE_URL", "").strip()

def _validate_upstream(name: str, url: str):
    if not url:
        raise RuntimeError(f"{name} is not set")
    # Railway 환경에서도 localhost URL 허용 (개발/테스트 목적)
    # if os.getenv("RAILWAY_ENVIRONMENT") and "localhost" in url:
    #     raise RuntimeError(f"{name} must be a public URL, not localhost: {url}")

# 챗봇 업스트림 경로 설정
CHATBOT_UPSTREAM_PATH = os.getenv("CHATBOT_UPSTREAM_PATH", "/api/v1/chatbot/chat")

# CBAM 서비스 URL 환경 변수
CBAM_SERVICE_URL = os.getenv("CBAM_SERVICE_URL", "").strip()

# CORS 허용 오리진 파싱
allowed_origins = [origin.strip() for origin in ALLOWED_ORIGINS.split(",") if origin.strip()]

async def _forward(target_service_url: str, target_path: str, request: Request) -> Response:
    """요청을 타겟 서비스로 전달하는 헬퍼 함수"""
    # 서비스 URL이 설정되어 있는지 확인
    if not target_service_url:
        raise HTTPException(status_code=503, detail="Target service not configured")
    
    try:
        # 타겟 URL 구성
        target_url = f"{target_service_url.rstrip('/')}/{target_path.lstrip('/')}"
        if request.url.query:
            target_url += f"?{request.url.query}"
        
        gateway_logger.log_info(f"Forwarding request: {request.method} {request.url.path} → {target_url}")
        
        # 요청 헤더 준비 (host 제거)
        headers = dict(request.headers)
        headers.pop("host", None)
        headers["X-Forwarded-By"] = GATEWAY_NAME
        
        # 요청 바디 읽기
        body = await request.body()
        
        # httpx로 프록시 요청 실행
        async with httpx.AsyncClient(timeout=30.0) as client:
            # DELETE 요청이 아닌 경우에만 content 전달
            request_kwargs = {
                "method": request.method,
                "url": target_url,
                "headers": headers,
                "follow_redirects": False
            }
            
            # DELETE 요청이 아닌 경우에만 body 전달
            if request.method != "DELETE" and body:
                request_kwargs["content"] = body
            
            response = await client.request(**request_kwargs)
            
            gateway_logger.log_info(f"Forward response: {response.status_code}")
            
            # hop-by-hop 헤더 제거
            for h in ["content-length", "transfer-encoding", "connection"]:
                try:
                    response.headers.pop(h, None)
                except Exception:
                    pass
            
            # 응답 반환
            return Response(
                content=response.content,
                status_code=response.status_code,
                headers=dict(response.headers),
                media_type=response.headers.get("content-type")
            )
            
    except httpx.TimeoutException:
        gateway_logger.log_error(f"Forward timeout: {target_url}")
        raise HTTPException(status_code=504, detail="Service timeout")
    except httpx.ConnectError:
        gateway_logger.log_error(f"Forward connection error: {target_url}")
        raise HTTPException(status_code=502, detail="Service connection failed")
    except Exception as e:
        gateway_logger.log_error(f"Forward error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal gateway error")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """애플리케이션 생명주기 관리 - DDD Architecture"""
    # 시작 시
    gateway_logger.log_info(f"Gateway {GATEWAY_NAME} starting up...")
    gateway_logger.log_info("Architecture: DDD (Domain-Driven Design)")
    gateway_logger.log_info("Domain Services: Identity-Access, Carbon-Border, Data-Collection, Lifecycle-Inventory, AI-Assistant")
    gateway_logger.log_info(f"Chatbot Service URL: {CHATBOT_SERVICE_URL}")
    
    # 프록시 컨트롤러 서비스 맵 로깅
    proxy_controller = ProxyController()
    gateway_logger.log_info(f"Proxy Controller Service Map: {proxy_controller.service_map}")
    
    yield
    # 종료 시
    gateway_logger.log_info(f"Gateway {GATEWAY_NAME} shutting down...")

# FastAPI 애플리케이션 생성
app = FastAPI(
    title=f"{GATEWAY_NAME} - DDD API Gateway",
    description="도메인 주도 설계(DDD)를 적용한 마이크로서비스 API Gateway - 프록시 라우팅 및 CORS 지원",
    version="2.0.0",
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

# 라우트 매칭 로거 미들웨어
@app.middleware("http")
async def log_matched_route(request: Request, call_next):
    response = await call_next(request)
    try:
        route = request.scope.get("route")
        route_path = getattr(route, "path", "(no route)")
        route_methods = list(getattr(route, "methods", []))
        gateway_logger.log_info(f"ROUTE_MATCH method={request.method} path={request.url.path} -> {route_path} {route_methods} status={response.status_code}")
    except Exception:
        pass
    return response

# 헬스체크 엔드포인트
@app.get("/health")
async def health_check():
    """게이트웨이 헬스체크 - DDD 도메인 서비스 상태"""
    return proxy_controller.health_check()

# ============================================================================
# 🛣️ 라우팅 정보 엔드포인트
# ============================================================================

@app.get("/routing")
async def routing_info():
    """라우팅 규칙 및 설정 정보 - DDD 도메인 구조 기반"""
    return proxy_controller.get_routing_info()

@app.get("/status")
async def service_status():
    """서비스 상태 정보 - DDD 도메인별 상태"""
    return await proxy_controller.get_service_status()

@app.get("/architecture")
async def architecture_info():
    """DDD 아키텍처 정보"""
    return {
        "gateway": GATEWAY_NAME,
        "architecture": "DDD (Domain-Driven Design)",
        "version": "2.0.0",
        "description": "도메인 주도 설계를 적용한 마이크로서비스 API Gateway",
        "domains": {
            "identity-access": {
                "description": "사용자 인증, 권한 관리, 이벤트 스트림",
                "service": "Authentication Service",
                "port": "8081",
                "paths": ["/auth/*", "/stream/*", "/company/*", "/user/*"]
            },
            "carbon-border": {
                "description": "탄소국경조정메커니즘 관리",
                "service": "CBAM Service",
                "port": "8082",
                "paths": ["/cbam/*"]
            },
            "data-collection": {
                "description": "ESG 데이터 수집 및 관리",
                "service": "Data Gathering Service",
                "port": "8083",
                "paths": ["/datagather/*", "/ai-process", "/feedback", "/input-data", "/output-data"]
            },
            "lifecycle-inventory": {
                "description": "생명주기 평가 및 인벤토리",
                "service": "Life Cycle Inventory Service",
                "port": "8084",
                "paths": ["/lci/*"]
            },
            "ai-assistant": {
                "description": "AI 어시스턴트 서비스",
                "service": "AI Assistant Service",
                "port": "8084",
                "paths": ["/chatbot/*"]
            }
        },
        "features": {
            "domain_events": "스트림 기반 이벤트 소싱",
            "aggregate_roots": "Company, User, Stream, CBAM, LCI",
            "value_objects": "Address, BusinessNumber, ContactInfo",
            "domain_services": "Authentication, StreamProcessing, Validation, AIProcessing",
            "ai_integration": "AI 모델을 통한 데이터 자동 수정 및 피드백 학습"
        },
        "layers": {
            "gateway": "API Gateway (프록시, 라우팅, 검증, AI 처리)",
            "application": "Application Services (유스케이스, 워크플로우)",
            "domain": "Domain Services (비즈니스 로직, 규칙)",
            "infrastructure": "Infrastructure (데이터베이스, 외부 서비스, AI 모델)"
        }
    }

# ============================================================================
# 🔍 디버깅 엔드포인트 (catch-all 라우트보다 먼저 정의)
# ============================================================================

@app.get("/_debug/routes")
async def debug_routes():
    """등록된 라우트 정보 확인"""
    from fastapi.routing import APIRoute
    return {
        "routes": [
            {"path": r.path, "methods": list(getattr(r, "methods", []))}
            for r in app.router.routes if isinstance(r, APIRoute)
        ],
        "chatbot_service_url": CHATBOT_SERVICE_URL,
        "chatbot_upstream_path": CHATBOT_UPSTREAM_PATH,
        "cbam_service_url": CBAM_SERVICE_URL
    }

@app.get("/_debug/ping-chatbot")
async def ping_chatbot():
    """챗봇 서비스 연결 상태 확인"""
    if not CHATBOT_SERVICE_URL:
        return {"error": "CHATBOT_SERVICE_URL not configured"}
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(f"{CHATBOT_SERVICE_URL.rstrip('/')}/health")
        return {"status": resp.status_code, "body": resp.text[:300]}
    except Exception as e:
        return {"error": f"Failed to ping chatbot: {str(e)}"}

@app.get("/_debug/ping-cbam")
async def ping_cbam():
    """CBAM 서비스 연결 상태 확인"""
    if not CBAM_SERVICE_URL:
        return {"error": "CBAM_SERVICE_URL not configured"}
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(f"{CBAM_SERVICE_URL.rstrip('/')}/health")
        return {"status": resp.status_code, "body": resp.text[:300]}
    except Exception as e:
        return {"error": f"Failed to ping CBAM: {str(e)}"}

# ============================================================================
# 🏠 루트 경로
# ============================================================================

@app.get("/")
async def root():
    """루트 경로 - DDD 아키텍처 정보"""
    return {
        "message": f"{GATEWAY_NAME} - DDD API Gateway",
        "version": "2.0.0",
        "architecture": "DDD (Domain-Driven Design)",
        "endpoints": {
            "health_check": "/health",
            "status": "/status",
            "routing": "/routing",
            "architecture": "/architecture",
            "documentation": "/docs",
            "feedback": "/datagather/feedback",
            "data_upload": "/input-data, /output-data",
            "chatbot_chat": "/chatbot/chat",
            "chatbot_health": "/chatbot/health",
            "debug_routes": "/_debug/routes",
            "debug_ping_chatbot": "/_debug/ping-chatbot",
            "debug_ping_cbam": "/_debug/ping-cbam"
        },
        "domains": [
            "identity-access (포트 8081)",
            "carbon-border (포트 8082)",
            "data-collection (포트 8083) - AI 처리 포함",
            "lifecycle-inventory (포트 8084)",
            "ai-assistant (포트 8084)"
        ]
    }

# favicon.ico 핸들러 (404 방지)
@app.get("/favicon.ico")
async def favicon():
    """Favicon 요청 처리 - 404 방지"""
    gateway_logger.log_info("Favicon request handled")
    # 빈 favicon 응답 (204 No Content 대신 200 OK로 변경)
    return Response(
        status_code=200,
        content=b"",
        media_type="image/x-icon",
        headers={"Cache-Control": "public, max-age=86400"}
    )

# robots.txt 핸들러 (선택적)
@app.get("/robots.txt")
async def robots():
    """Robots.txt 요청 처리"""
    gateway_logger.log_info("Robots.txt request handled")
    return Response(
        content="User-agent: *\nDisallow: /api/\nDisallow: /auth/\nDisallow: /geo/", 
        media_type="text/plain"
    )

# 챗봇 프록시 라우트
@app.api_route("/chatbot/chat", methods=["POST","OPTIONS"])
async def proxy_chatbot_chat(request: Request):
    # use configurable upstream path
    return await _forward(CHATBOT_SERVICE_URL, CHATBOT_UPSTREAM_PATH, request)

# Helpful GET handler for human testing to avoid falling into catch-all
@app.get("/chatbot/chat")
async def chatbot_chat_get_info():
    return {"error":"Method Not Allowed","hint":"Use POST to /chatbot/chat","upstream": CHATBOT_SERVICE_URL, "path": CHATBOT_UPSTREAM_PATH}

@app.api_route("/chatbot/health", methods=["GET","OPTIONS"])
async def proxy_chatbot_health(request: Request):
    return await _forward(CHATBOT_SERVICE_URL, "/api/v1/chatbot/health", request)

@app.api_route("/chatbot/{path:path}", methods=["GET","POST","PUT","DELETE","PATCH","HEAD","OPTIONS"])
async def proxy_chatbot_general(request: Request, path: str):
    return await _forward(CHATBOT_SERVICE_URL, f"/api/v1/chatbot/{path}", request)

# ============================================================================
# 🏭 CBAM 서비스 프록시 라우트 (새로운 CBAM 서비스용)
# ============================================================================

@app.api_route("/api/v1/cbam/{path:path}", methods=["GET","POST","PUT","DELETE","PATCH","HEAD","OPTIONS"])
async def proxy_cbam_service(request: Request, path: str):
    """CBAM 서비스로 요청을 프록시 - 새로운 CBAM 서비스 구조"""
    if not CBAM_SERVICE_URL:
        raise HTTPException(status_code=503, detail="CBAM service not configured")
    
    # 새로운 CBAM 서비스의 실제 엔드포인트로 전달 (greensteel-new_cbam 구조 적용)
    # 프론트엔드: /api/v1/cbam/install → CBAM 서비스: /install/
    # 프론트엔드: /api/v1/cbam/product → CBAM 서비스: /product/
    # 프론트엔드: /api/v1/cbam/process → CBAM 서비스: /process/
    # 프론트엔드: /api/v1/cbam/mapping → CBAM 서비스: /mapping
    # 프론트엔드: /api/v1/cbam/calculation → CBAM 서비스: /calculation
    # 프론트엔드: /api/v1/cbam/matdir → CBAM 서비스: /matdir
    # 프론트엔드: /api/v1/cbam/fueldir → CBAM 서비스: /fueldir
    # 프론트엔드: /api/v1/cbam/edge → CBAM 서비스: /edge/
    # 프론트엔드: /api/v1/cbam/productprocess → CBAM 서비스: /productprocess
    
    # CBAM 서비스의 실제 라우터 구조에 맞게 경로 매핑
    # CBAM 서비스: /install/, /product/, /process/, /edge/, /mapping/, /calculation/, /matdir/, /fueldir/, /productprocess/
    
    # 기본 경로들 (슬래시 추가)
    if path in ["install", "product", "process", "edge", "mapping", "calculation", "matdir", "fueldir", "productprocess"]:
        target_path = f"/{path}/"
    # 하위 경로들 (동적 ID 포함)
    elif path.startswith(("install/", "product/", "process/", "edge/", "mapping/", "calculation/", "matdir/", "fueldir/", "productprocess/")):
        # 하위 경로는 그대로 전달 (예: /install/1, /product/names 등)
        target_path = f"/{path}"
    else:
        # 기타 경로는 그대로
        target_path = f"/{path}"
    
    gateway_logger.log_info(f"CBAM proxy: {request.method} /api/v1/cbam/{path} → {CBAM_SERVICE_URL}{target_path}")
    return await _forward(CBAM_SERVICE_URL, target_path, request)

@app.api_route("/cbam/{path:path}", methods=["GET","POST","PUT","DELETE","PATCH","HEAD","OPTIONS"])
async def proxy_cbam_service_legacy(request: Request, path: str):
    """CBAM 서비스로 요청을 프록시 (레거시 경로 지원)"""
    if not CBAM_SERVICE_URL:
        raise HTTPException(status_code=503, detail="CBAM service not configured")
    
    # CBAM 서비스의 실제 라우터 구조에 맞게 경로 매핑
    # CBAM 서비스: /install/, /product/, /process/, /edge/, /mapping/, /calculation/, /matdir/, /fueldir/, /productprocess/
    
    # 기본 경로들 (슬래시 추가)
    if path in ["install", "product", "process", "edge", "mapping", "calculation", "matdir", "fueldir", "productprocess"]:
        target_path = f"/{path}/"
    # 하위 경로들 (동적 ID 포함)
    elif path.startswith(("install/", "product/", "process/", "edge/", "mapping/", "calculation/", "matdir/", "fueldir/", "productprocess/")):
        # 하위 경로는 그대로 전달 (예: /install/1, /product/names 등)
        target_path = f"/{path}"
    else:
        # 기타 경로는 그대로
        target_path = f"/{path}"
    
    gateway_logger.log_info(f"CBAM legacy proxy: {request.method} /cbam/{path} → {CBAM_SERVICE_URL}{target_path}")
    return await _forward(CBAM_SERVICE_URL, target_path, request)

# ============================================================================
# 🔐 Auth 서비스 프록시 라우트
# ============================================================================

@app.api_route("/api/auth/{path:path}", methods=["GET","POST","PUT","DELETE","PATCH","HEAD","OPTIONS"])
async def proxy_auth_service(request: Request, path: str):
    """Auth 서비스로 요청을 프록시"""
    auth_service_url = os.getenv("AUTH_SERVICE_URL", "http://localhost:8081")
    
    # Auth 서비스의 실제 엔드포인트로 전달
    target_path = f"/api/auth/{path}"
    
    gateway_logger.log_info(f"Auth proxy: {request.method} /api/auth/{path} → {auth_service_url}{target_path}")
    return await _forward(auth_service_url, target_path, request)

@app.api_route("/auth/{path:path}", methods=["GET","POST","PUT","DELETE","PATCH","HEAD","OPTIONS"])
async def proxy_auth_service_legacy(request: Request, path: str):
    """Auth 서비스로 요청을 프록시 (레거시 경로 지원)"""
    auth_service_url = os.getenv("AUTH_SERVICE_URL", "http://localhost:8081")
    
    # Auth 서비스의 실제 엔드포인트로 전달
    target_path = f"/auth/{path}"
    
    gateway_logger.log_info(f"Auth legacy proxy: {request.method} /auth/{path} → {auth_service_url}{target_path}")
    return await _forward(auth_service_url, target_path, request)

# ============================================================================
# 🌱 LCA 서비스 프록시 라우트 (제거됨 - 더 이상 사용하지 않음)
# ============================================================================

# ============================================================================
# 📊 DataGather 서비스 프록시 라우트
# ============================================================================

@app.api_route("/api/datagather/{path:path}", methods=["GET","POST","PUT","DELETE","PATCH","HEAD","OPTIONS"])
async def proxy_datagather_service(request: Request, path: str):
    """DataGather 서비스로 요청을 프록시"""
    datagather_service_url = os.getenv("DATAGATHER_SERVICE_URL", "http://localhost:8083")
    
    # DataGather 서비스의 실제 엔드포인트로 전달
    target_path = f"/api/datagather/{path}"
    
    gateway_logger.log_info(f"DataGather proxy: {request.method} /api/datagather/{path} → {datagather_service_url}{target_path}")
    return await _forward(datagather_service_url, target_path, request)

@app.api_route("/datagather/{path:path}", methods=["GET","POST","PUT","DELETE","PATCH","HEAD","OPTIONS"])
async def proxy_datagather_service_legacy(request: Request, path: str):
    """DataGather 서비스로 요청을 프록시 (레거시 경로 지원)"""
    datagather_service_url = os.getenv("DATAGATHER_SERVICE_URL", "http://localhost:8083")
    
    # DataGather 서비스의 실제 엔드포인트로 전달
    target_path = f"/datagather/{path}"
    
    gateway_logger.log_info(f"DataGather legacy proxy: {request.method} /datagather/{path} → {datagather_service_url}{target_path}")
    return await _forward(datagather_service_url, target_path, request)

@app.get("/cbam/health")
async def cbam_health_check():
    """CBAM 서비스 헬스체크 - 새로운 CBAM 서비스 구조"""
    if not CBAM_SERVICE_URL:
        return {
            "status": "unhealthy",
            "service": "CBAM",
            "message": "CBAM_SERVICE_URL not configured",
            "timestamp": time.time()
        }
    
    try:
        # 새로운 CBAM 서비스 헬스체크 요청
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{CBAM_SERVICE_URL}/health")
            if response.status_code == 200:
                return {
                    "status": "healthy",
                    "service": "CBAM",
                    "upstream": CBAM_SERVICE_URL,
                    "architecture": "DDD (Domain-Driven Design)",
                    "domains": [
                        "install", "product", "process", "mapping", 
                        "calculation", "matdir", "fueldir", "edge", "productprocess"
                    ],
                    "timestamp": time.time()
                }
            else:
                return {
                    "status": "unhealthy",
                    "service": "CBAM",
                    "upstream": CBAM_SERVICE_URL,
                    "status_code": response.status_code,
                    "timestamp": time.time()
                }
    except Exception as e:
        return {
            "status": "unhealthy",
            "service": "CBAM",
            "upstream": CBAM_SERVICE_URL,
            "error": str(e),
            "timestamp": time.time()
        }

@app.get("/cbam/db/status")
async def cbam_database_status():
    """CBAM 서비스 데이터베이스 상태 확인"""
    if not CBAM_SERVICE_URL:
        return {
            "status": "unhealthy",
            "service": "CBAM",
            "message": "CBAM_SERVICE_URL not configured",
            "timestamp": time.time()
        }
    
    try:
        # CBAM 서비스 데이터베이스 상태 확인 요청
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(f"{CBAM_SERVICE_URL}/db/status")
            if response.status_code == 200:
                db_data = response.json()
                return {
                    "status": "success",
                    "service": "CBAM",
                    "upstream": CBAM_SERVICE_URL,
                    "database_status": db_data,
                    "timestamp": time.time()
                }
            else:
                return {
                    "status": "error",
                    "service": "CBAM",
                    "upstream": CBAM_SERVICE_URL,
                    "status_code": response.status_code,
                    "message": "Failed to get database status",
                    "timestamp": time.time()
                }
    except Exception as e:
        return {
            "status": "error",
            "service": "CBAM",
            "upstream": CBAM_SERVICE_URL,
            "error": str(e),
            "timestamp": time.time()
        }

# Chatbot 서비스는 프록시 컨트롤러를 통해 처리됩니다
# /chatbot/* 경로의 모든 요청은 프록시 컨트롤러로 전달됩니다

# JSON 데이터를 datagather_service로 전송하는 엔드포인트
@app.post("/process-data")
async def process_data_to_datagather(data: dict):
    """프론트엔드에서 받은 JSON 데이터를 datagather_service로 전달합니다."""
    try:
        gateway_logger.log_info(f"JSON 데이터 처리 요청 받음: {data.get('filename', 'unknown')}")
        
        # DataGather 서비스로 JSON 데이터 전송 (환경변수 사용)
        datagather_service_url = os.getenv("DATAGATHER_SERVICE_URL", "http://localhost:8083")
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{datagather_service_url.rstrip('/')}/process-data",
                json=data
            )
            
            if response.status_code == 200:
                response_data = response.json()
                gateway_logger.log_info(f"datagather_service로 데이터 전송 성공: {data.get('filename', 'unknown')}")
                
                return {
                    "message": "게이트웨이를 통해 datagather_service로 전송 성공",
                    "status": "success",
                    "data": response_data
                }
            else:
                gateway_logger.log_error(f"datagather_service 응답 오류: {response.status_code}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"datagather_service 오류: {response.text}"
                )
                
    except httpx.TimeoutException:
        gateway_logger.log_error("datagather_service 연결 시간 초과")
        raise HTTPException(status_code=504, detail="서비스 연결 시간 초과")
    except httpx.ConnectError:
        gateway_logger.log_error("datagather_service 연결 실패")
        raise HTTPException(status_code=503, detail="datagather_service에 연결할 수 없습니다")
    except Exception as e:
        gateway_logger.log_error(f"게이트웨이 처리 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail=f"게이트웨이 오류: {str(e)}")

# AI 모델을 활용한 데이터 처리 엔드포인트 (datagather 하위로 이동)
@app.post("/datagather/ai-process")
async def ai_process_data(data: dict):
    """AI 모델을 활용하여 투입물명을 자동으로 수정합니다."""
    try:
        gateway_logger.log_info(f"AI 모델 처리 요청 받음: {data.get('filename', 'unknown')}")
        
        # datagather_service로 AI 처리 요청 전송 (환경변수 사용)
        datagather_service_url = os.getenv("DATAGATHER_SERVICE_URL", "http://localhost:8083")
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{datagather_service_url.rstrip('/')}/ai-process",
                json=data
            )
            
            if response.status_code == 200:
                response_data = response.json()
                gateway_logger.log_info(f"AI 모델 처리 성공: {data.get('filename', 'unknown')}")
                
                return {
                    "message": "AI 모델을 통해 투입물명이 성공적으로 수정되었습니다",
                    "status": "ai_processed",
                    "filename": data.get('filename', 'unknown'),
                    "original_count": data.get('rows_count', 0),
                    "processed_count": len(response_data.get('data', [])),
                    "ai_available": True,
                    "data": response_data.get('data', []),
                    "columns": response_data.get('columns', []),
                    "timestamp": response_data.get('timestamp', time.time())
                }
            else:
                gateway_logger.log_error(f"AI 모델 처리 오류: {response.status_code}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"AI 모델 처리 오류: {response.text}"
                )
                
    except httpx.TimeoutException:
        gateway_logger.log_error("AI 모델 처리 시간 초과")
        raise HTTPException(status_code=504, detail="AI 모델 처리 시간 초과")
    except httpx.ConnectError:
        gateway_logger.log_error("datagather_service 연결 실패")
        raise HTTPException(status_code=503, detail="datagather_service에 연결할 수 없습니다")
    except Exception as e:
        gateway_logger.log_error(f"AI 모델 처리 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI 모델 처리 오류: {str(e)}")

# API 경로를 통한 AI 처리 엔드포인트
@app.post("/api/datagather/ai-process")
async def api_ai_process_data(data: dict):
    """API 경로를 통한 AI 모델 데이터 처리"""
    try:
        gateway_logger.log_info(f"API AI 모델 처리 요청 받음: {data.get('filename', 'unknown')}")
        
        # datagather_service로 AI 처리 요청 전송
        datagather_service_url = os.getenv("DATAGATHER_SERVICE_URL", "http://localhost:8083")
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{datagather_service_url.rstrip('/')}/ai-process",
                json=data
            )
            
            if response.status_code == 200:
                response_data = response.json()
                gateway_logger.log_info(f"API AI 모델 처리 성공: {data.get('filename', 'unknown')}")
                
                return {
                    "success": True,
                    "message": "AI 처리가 완료되었습니다",
                    "processed_data": response_data.get('data', []),
                    "columns": response_data.get('columns', []),
                    "total_rows": len(data.get('data', [])),
                    "processed_rows": len(response_data.get('data', []))
                }
            else:
                gateway_logger.log_error(f"API AI 모델 처리 오류: {response.status_code}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"AI 모델 처리 오류: {response.text}"
                )
                
    except httpx.TimeoutException:
        gateway_logger.log_error("API AI 모델 처리 시간 초과")
        raise HTTPException(status_code=504, detail="AI 모델 처리 시간 초과")
    except httpx.ConnectError:
        gateway_logger.log_error("datagather_service 연결 실패")
        raise HTTPException(status_code=503, detail="datagather_service에 연결할 수 없습니다")
    except Exception as e:
        gateway_logger.log_error(f"API AI 모델 처리 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI 모델 처리 오류: {str(e)}")

# 사용자 피드백 처리 엔드포인트 (datagather 하위로 이동)
@app.post("/datagather/feedback")
async def process_feedback(feedback_data: dict):
    """사용자 피드백을 받아 AI 모델을 재학습시킵니다."""
    try:
        gateway_logger.log_info(f"사용자 피드백 처리 요청 받음")
        
        # 피드백 데이터 로깅
        gateway_logger.log_info(f"피드백 데이터: {feedback_data}")
        
        # DataGather 서비스로 피드백 전송 (환경변수 사용)
        datagather_service_url = os.getenv("DATAGATHER_SERVICE_URL", "http://localhost:8083")
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{datagather_service_url.rstrip('/')}/feedback",
                json=feedback_data
            )
            
            if response.status_code == 200:
                response_data = response.json()
                gateway_logger.log_info(f"피드백 처리 성공: {response_data}")
                
                return {
                    "message": "피드백이 성공적으로 처리되었습니다",
                    "status": "success",
                    "data": response_data
                }
            else:
                gateway_logger.log_error(f"피드백 처리 오류: {response.status_code}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"피드백 처리 오류: {response.text}"
                )
                
    except httpx.TimeoutException:
        gateway_logger.log_error("피드백 처리 시간 초과")
        raise HTTPException(status_code=504, detail="피드백 처리 시간 초과")
    except httpx.ConnectError:
        gateway_logger.log_error("datagather_service 연결 실패")
        raise HTTPException(status_code=503, detail="datagather_service에 연결할 수 없습니다")
    except Exception as e:
        gateway_logger.log_error(f"피드백 처리 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail=f"피드백 처리 오류: {str(e)}")

# 중복된 챗봇 라우트 제거됨 - 위의 챗봇 프록시 라우트 사용

# Input 데이터 업로드 엔드포인트
@app.post("/input-data")
async def upload_input_data(data: dict):
    """Input 데이터를 datagather_service로 업로드합니다."""
    try:
        gateway_logger.log_info(f"Input 데이터 업로드 요청 받음: {data.get('filename', 'unknown')}")
        
        # DataGather 서비스로 Input 데이터 전송 (환경변수 사용)
        datagather_service_url = os.getenv("DATAGATHER_SERVICE_URL", "http://localhost:8083")
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{datagather_service_url.rstrip('/')}/save-input-data",
                json=data
            )
            
            if response.status_code == 200:
                response_data = response.json()
                gateway_logger.log_info(f"Input 데이터 업로드 성공: {data.get('filename', 'unknown')}")
                
                return {
                    "message": "Input 데이터가 성공적으로 업로드되었습니다",
                    "status": "success",
                    "data": response_data
                }
            else:
                gateway_logger.log_error(f"Input 데이터 업로드 오류: {response.status_code}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Input 데이터 업로드 오류: {response.text}"
                )
                
    except httpx.TimeoutException:
        gateway_logger.log_error("Input 데이터 업로드 시간 초과")
        raise HTTPException(status_code=504, detail="Input 데이터 업로드 시간 초과")
    except httpx.ConnectError:
        gateway_logger.log_error("datagather_service 연결 실패")
        raise HTTPException(status_code=503, detail="datagather_service에 연결할 수 없습니다")
    except Exception as e:
        gateway_logger.log_error(f"Input 데이터 업로드 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Input 데이터 업로드 오류: {str(e)}")

# Output 데이터 업로드 엔드포인트
@app.post("/output-data")
async def upload_output_data(data: dict):
    """Output 데이터를 datagather_service로 업로드합니다."""
    try:
        gateway_logger.log_info(f"Output 데이터 업로드 요청 받음: {data.get('filename', 'unknown')}")
        
        # DataGather 서비스로 Output 데이터 전송 (환경변수 사용)
        datagather_service_url = os.getenv("DATAGATHER_SERVICE_URL", "http://localhost:8083")
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{datagather_service_url.rstrip('/')}/save-output-data",
                json=data
            )
            
            if response.status_code == 200:
                response_data = response.json()
                gateway_logger.log_info(f"Output 데이터 업로드 성공: {data.get('filename', 'unknown')}")
                
                return {
                    "message": "Output 데이터가 성공적으로 업로드되었습니다",
                    "status": "success",
                    "data": response_data
                }
            else:
                gateway_logger.log_error(f"Output 데이터 업로드 오류: {response.status_code}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Output 데이터 업로드 오류: {response.text}"
                )
                
    except httpx.TimeoutException:
        gateway_logger.log_error("Output 데이터 업로드 시간 초과")
        raise HTTPException(status_code=504, detail="Output 데이터 업로드 시간 초과")
    except httpx.ConnectError:
        gateway_logger.log_error("datagather_service 연결 실패")
        raise HTTPException(status_code=503, detail="datagather_service에 연결할 수 없습니다")
    except Exception as e:
        gateway_logger.log_error(f"Output 데이터 업로드 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Output 데이터 업로드 오류: {str(e)}")





# DB 저장 엔드포인트 - DataGather 서비스로 프록시
@app.post("/save-processed-data")
async def save_processed_data_proxy(request: Request):
    """AI 처리된 데이터를 데이터베이스에 저장하는 엔드포인트 - DataGather 서비스로 프록시"""
    try:
        datagather_service_url = os.getenv("DATAGATHER_SERVICE_URL")
        if not datagather_service_url:
            raise HTTPException(status_code=503, detail="DATAGATHER_SERVICE_URL 환경변수가 설정되지 않았습니다")
        gateway_logger.log_info(f"DB 저장 요청을 DataGather 서비스로 프록시: {datagather_service_url}")
        target_url = f"{datagather_service_url.rstrip('/')}/save-processed-data"
        body = await request.body()
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                url=target_url,
                content=body,
                headers={
                    "Content-Type": request.headers.get("content-type", "application/json"),
                    "X-Forwarded-By": GATEWAY_NAME
                }
            )
            gateway_logger.log_info(f"DataGather 서비스 DB 저장 응답: {response.status_code}")
            return Response(
                content=response.content,
                status_code=response.status_code,
                headers=dict(response.headers),
                media_type=response.headers.get("content-type")
            )
    except httpx.TimeoutException:
        gateway_logger.log_error("DataGather 서비스 DB 저장 연결 시간 초과")
        raise HTTPException(status_code=504, detail="DataGather 서비스 DB 저장 연결 시간 초과")
    except httpx.ConnectError:
        gateway_logger.log_error("DataGather 서비스 DB 저장 연결 실패")
        raise HTTPException(status_code=503, detail="DataGather 서비스 DB 저장 연결 실패")
    except Exception as e:
        gateway_logger.log_error(f"DataGather 서비스 DB 저장 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail=f"DataGather 서비스 DB 저장 오류: {str(e)}")

# 데이터 분류 엔드포인트 - DataGather 서비스로 프록시
@app.post("/classify-data")
async def classify_data_proxy(request: Request):
    """데이터를 분류하여 저장하는 엔드포인트 - DataGather 서비스로 프록시"""
    try:
        datagather_service_url = os.getenv("DATAGATHER_SERVICE_URL")
        if not datagather_service_url:
            raise HTTPException(status_code=503, detail="DATAGATHER_SERVICE_URL 환경변수가 설정되지 않았습니다")
        
        gateway_logger.log_info(f"데이터 분류 요청을 DataGather 서비스로 프록시: {datagather_service_url}")
        target_url = f"{datagather_service_url.rstrip('/')}/classify-data"
        
        body = await request.body()
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                url=target_url,
                content=body,
                headers={
                    "Content-Type": request.headers.get("content-type", "application/json"),
                    "X-Forwarded-By": GATEWAY_NAME
                }
            )
            
            gateway_logger.log_info(f"DataGather 서비스 데이터 분류 응답: {response.status_code}")
            return Response(
                content=response.content,
                status_code=response.status_code,
                headers=dict(response.headers),
                media_type=response.headers.get("content-type")
            )
            
    except httpx.TimeoutException:
        gateway_logger.log_error("DataGather 서비스 데이터 분류 연결 시간 초과")
        raise HTTPException(status_code=504, detail="DataGather 서비스 데이터 분류 연결 시간 초과")
    except httpx.ConnectError:
        gateway_logger.log_error("DataGather 서비스 데이터 분류 연결 실패")
        raise HTTPException(status_code=503, detail="DataGather 서비스 데이터 분류 연결 실패")
    except Exception as e:
        gateway_logger.log_error(f"DataGather 서비스 데이터 분류 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail=f"DataGather 서비스 데이터 분류 오류: {str(e)}")

# 데이터 분류 삭제 엔드포인트 - DataGather 서비스로 프록시
@app.delete("/delete-classification")
async def delete_classification_proxy(request: Request):
    """데이터 분류를 삭제하는 엔드포인트 - DataGather 서비스로 프록시"""
    try:
        datagather_service_url = os.getenv("DATAGATHER_SERVICE_URL")
        if not datagather_service_url:
            raise HTTPException(status_code=503, detail="DATAGATHER_SERVICE_URL 환경변수가 설정되지 않았습니다")
        
        gateway_logger.log_info(f"데이터 분류 삭제 요청을 DataGather 서비스로 프록시: {datagather_service_url}")
        target_url = f"{datagather_service_url.rstrip('/')}/delete-classification"
        
        body = await request.body()
        async with httpx.AsyncClient(timeout=60.0) as client:
            # httpx의 delete 메서드는 본문을 지원하지 않으므로 request 메서드 사용
            request_kwargs = {
                "method": "DELETE",
                "url": target_url,
                "headers": {
                    "Content-Type": request.headers.get("content-type", "application/json"),
                    "X-Forwarded-By": GATEWAY_NAME
                }
            }
            
            # body가 있는 경우 content 파라미터로 전달
            if body:
                request_kwargs["content"] = body
            
            response = await client.request(**request_kwargs)
            
            gateway_logger.log_info(f"DataGather 서비스 데이터 분류 삭제 응답: {response.status_code}")
            return Response(
                content=response.content,
                status_code=response.status_code,
                headers=dict(response.headers),
                media_type=response.headers.get("content-type")
            )
            
    except httpx.TimeoutException:
        gateway_logger.log_error("DataGather 서비스 데이터 분류 삭제 연결 시간 초과")
        raise HTTPException(status_code=504, detail="DataGather 서비스 데이터 분류 삭제 연결 시간 초과")
    except httpx.ConnectError:
        gateway_logger.log_error("DataGather 서비스 데이터 분류 삭제 연결 실패")
        raise HTTPException(status_code=503, detail="DataGather 서비스 데이터 분류 삭제 연결 실패")
    except Exception as e:
        gateway_logger.log_error(f"DataGather 서비스 데이터 분류 삭제 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail=f"DataGather 서비스 데이터 분류 삭제 오류: {str(e)}")

@app.post("/save-transport-data")
async def save_transport_data_proxy(request: Request):
    """운송 데이터를 데이터베이스에 저장하는 엔드포인트 - DataGather 서비스로 프록시"""
    try:
        datagather_service_url = os.getenv("DATAGATHER_SERVICE_URL")
        if not datagather_service_url:
            raise HTTPException(status_code=503, detail="DATAGATHER_SERVICE_URL 환경변수가 설정되지 않았습니다")
        gateway_logger.log_info(f"운송 데이터 저장 요청을 DataGather 서비스로 프록시: {datagather_service_url}")
        target_url = f"{datagather_service_url.rstrip('/')}/save-transport-data"
        body = await request.body()
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                url=target_url,
                content=body,
                headers={
                    "Content-Type": request.headers.get("content-type", "application/json"),
                    "X-Forwarded-By": GATEWAY_NAME
                }
            )
            gateway_logger.log_info(f"DataGather 서비스 운송 데이터 저장 응답: {response.status_code}")
            return Response(
                content=response.content,
                status_code=response.status_code,
                headers=dict(response.headers),
                media_type=response.headers.get("content-type")
            )
    except httpx.TimeoutException:
        gateway_logger.log_error("DataGather 서비스 운송 데이터 저장 연결 시간 초과")
        raise HTTPException(status_code=504, detail="DataGather 서비스 운송 데이터 저장 연결 시간 초과")
    except httpx.ConnectError:
        gateway_logger.log_error("DataGather 서비스 운송 데이터 저장 연결 실패")
        raise HTTPException(status_code=503, detail="DataGather 서비스 운송 데이터 저장에 연결할 수 없습니다")

@app.post("/save-process-data")
async def save_process_data_proxy(request: Request):
    """공정 데이터를 데이터베이스에 저장하는 엔드포인트 - DataGather 서비스로 프록시"""
    try:
        datagather_service_url = os.getenv("DATAGATHER_SERVICE_URL")
        if not datagather_service_url:
            raise HTTPException(status_code=503, detail="DATAGATHER_SERVICE_URL 환경변수가 설정되지 않았습니다")
        gateway_logger.log_info(f"공정 데이터 저장 요청을 DataGather 서비스로 프록시: {datagather_service_url}")
        target_url = f"{datagather_service_url.rstrip('/')}/save-process-data"
        body = await request.body()
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                url=target_url,
                content=body,
                headers={
                    "Content-Type": request.headers.get("content-type", "application/json"),
                    "X-Forwarded-By": GATEWAY_NAME
                }
            )
            gateway_logger.log_info(f"DataGather 서비스 공정 데이터 저장 응답: {response.status_code}")
            return Response(
                content=response.content,
                status_code=response.status_code,
                headers=dict(response.headers),
                media_type=response.headers.get("content-type")
            )
    except httpx.TimeoutException:
        gateway_logger.log_error("DataGather 서비스 공정 데이터 저장 연결 시간 초과")
        raise HTTPException(status_code=504, detail="DataGather 서비스 공정 데이터 저장 연결 시간 초과")
    except httpx.ConnectError:
        gateway_logger.log_error("DataGather 서비스 공정 데이터 저장 연결 실패")
        raise HTTPException(status_code=503, detail="DataGather 서비스 공정 데이터 저장에 연결할 수 없습니다")

@app.post("/save-output-data")
async def save_output_data_proxy(request: Request):
    """산출물 데이터를 데이터베이스에 저장하는 엔드포인트 - DataGather 서비스로 프록시"""
    try:
        datagather_service_url = os.getenv("DATAGATHER_SERVICE_URL")
        if not datagather_service_url:
            raise HTTPException(status_code=503, detail="DATAGATHER_SERVICE_URL 환경변수가 설정되지 않았습니다")
        gateway_logger.log_info(f"산출물 데이터 저장 요청을 DataGather 서비스로 프록시: {datagather_service_url}")
        target_url = f"{datagather_service_url.rstrip('/')}/save-output-data"
        body = await request.body()
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                url=target_url,
                content=body,
                headers={
                    "Content-Type": request.headers.get("content-type", "application/json"),
                    "X-Forwarded-By": GATEWAY_NAME
                }
            )
            gateway_logger.log_info(f"DataGather 서비스 산출물 데이터 저장 응답: {response.status_code}")
            return Response(
                content=response.content,
                status_code=response.status_code,
                headers=dict(response.headers),
                media_type=response.headers.get("content-type")
            )
    except httpx.TimeoutException:
        gateway_logger.log_error("DataGather 서비스 산출물 데이터 저장 연결 시간 초과")
        raise HTTPException(status_code=504, detail="DataGather 서비스 산출물 데이터 저장 연결 시간 초과")
    except httpx.ConnectError:
        gateway_logger.log_error("DataGather 서비스 산출물 데이터 저장 연결 실패")
        raise HTTPException(status_code=503, detail="DataGather 서비스 산출물 데이터 저장에 연결할 수 없습니다")

# ============================================================================
# 🔄 DataGather 서비스 직접 프록시 엔드포인트 (catch-all 라우트보다 먼저 정의)
# ============================================================================

# save-input-data 엔드포인트 - DataGather 서비스로 프록시
@app.post("/save-input-data")
async def save_input_data_proxy(request: Request):
    """Input 데이터를 DataGather 서비스로 프록시"""
    try:
        datagather_service_url = os.getenv("DATAGATHER_SERVICE_URL")
        if not datagather_service_url:
            raise HTTPException(status_code=503, detail="DATAGATHER_SERVICE_URL 환경변수가 설정되지 않았습니다")
        
        gateway_logger.log_info(f"save-input-data 요청을 DataGather 서비스로 프록시: {datagather_service_url}")
        target_url = f"{datagather_service_url.rstrip('/')}/save-input-data"
        
        body = await request.body()
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                url=target_url,
                content=body,
                headers={
                    "Content-Type": request.headers.get("content-type", "application/json"),
                    "X-Forwarded-By": GATEWAY_NAME
                }
            )
            
            gateway_logger.log_info(f"DataGather 서비스 save-input-data 응답: {response.status_code}")
            return Response(
                content=response.content,
                status_code=response.status_code,
                headers=dict(response.headers),
                media_type=response.headers.get("content-type")
            )
            
    except httpx.TimeoutException:
        gateway_logger.log_error("DataGather 서비스 save-input-data 연결 시간 초과")
        raise HTTPException(status_code=504, detail="DataGather 서비스 save-input-data 연결 시간 초과")
    except httpx.ConnectError:
        gateway_logger.log_error("DataGather 서비스 save-input-data 연결 실패")
        raise HTTPException(status_code=503, detail="DataGather 서비스 save-input-data에 연결할 수 없습니다")
    except Exception as e:
        gateway_logger.log_error(f"DataGather 서비스 save-input-data 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail=f"DataGather 서비스 save-input-data 오류: {str(e)}")

# 중복된 delete-classification 엔드포인트 제거됨 - 위쪽에 재정의됨

# ============================================================================
# 🔄 모든 HTTP 메서드에 대한 프록시 라우팅 (catch-all 라우트는 마지막에 배치)
# ============================================================================
@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"])
async def proxy_route(request: Request, path: str):
    """모든 경로에 대한 프록시 라우팅 - DDD 도메인 서비스 라우팅"""
    # 루트 경로는 헬스체크로 리다이렉트
    if path == "" or path == "/":
        return {"message": "Gateway is running", "health_check": "/health"}
    
    # 프록시 요청 처리
    try:
        return await proxy_controller.proxy_request(request)
    except Exception as e:
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=404,
            content={
                "message": "Proxy route not found",
                "path": path,
                "supported_methods": ["GET","POST","PUT","DELETE","PATCH","HEAD","OPTIONS"]
            }
        )

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

# 데이터 조회 엔드포인트들
@app.get("/api/datagather/input-data")
async def get_input_data_proxy():
    """투입물 데이터 조회 - DataGather 서비스로 프록시"""
    try:
        datagather_service_url = os.getenv("DATAGATHER_SERVICE_URL")
        if not datagather_service_url:
            raise HTTPException(status_code=503, detail="DATAGATHER_SERVICE_URL 환경변수가 설정되지 않았습니다")
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{datagather_service_url.rstrip('/')}/api/datagather/input-data"
            )
            
            if response.status_code == 200:
                return Response(
                    content=response.content,
                    status_code=response.status_code,
                    headers=dict(response.headers),
                    media_type=response.headers.get("content-type")
                )
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"투입물 데이터 조회 오류: {response.text}"
                )
                
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="DataGather 서비스 연결 시간 초과")
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail="DataGather 서비스에 연결할 수 없습니다")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"투입물 데이터 조회 오류: {str(e)}")

@app.get("/api/datagather/output-data")
async def get_output_data_proxy():
    """산출물 데이터 조회 - DataGather 서비스로 프록시"""
    try:
        datagather_service_url = os.getenv("DATAGATHER_SERVICE_URL")
        if not datagather_service_url:
            raise HTTPException(status_code=503, detail="DATAGATHER_SERVICE_URL 환경변수가 설정되지 않았습니다")
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{datagather_service_url.rstrip('/')}/api/datagather/output-data"
            )
            
            if response.status_code == 200:
                return Response(
                    content=response.content,
                    status_code=response.status_code,
                    headers=dict(response.headers),
                    media_type=response.headers.get("content-type")
                )
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"산출물 데이터 조회 오류: {response.text}"
                )
                
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="DataGather 서비스 연결 시간 초과")
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail="DataGather 서비스에 연결할 수 없습니다")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"산출물 데이터 조회 오류: {str(e)}")

@app.get("/api/datagather/transport-data")
async def get_transport_data_proxy():
    """운송 데이터 조회 - DataGather 서비스로 프록시"""
    try:
        datagather_service_url = os.getenv("DATAGATHER_SERVICE_URL")
        if not datagather_service_url:
            raise HTTPException(status_code=503, detail="DATAGATHER_SERVICE_URL 환경변수가 설정되지 않았습니다")
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{datagather_service_url.rstrip('/')}/api/datagather/transport-data"
            )
            
            if response.status_code == 200:
                return Response(
                    content=response.content,
                    status_code=response.status_code,
                    headers=dict(response.headers),
                    media_type=response.headers.get("content-type")
                )
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"운송 데이터 조회 오류: {response.text}"
                )
                
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="DataGather 서비스 연결 시간 초과")
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail="DataGather 서비스에 연결할 수 없습니다")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"운송 데이터 조회 오류: {str(e)}")

@app.get("/api/datagather/process-data")
async def get_process_data_proxy():
    """공정 데이터 조회 - DataGather 서비스로 프록시"""
    try:
        datagather_service_url = os.getenv("DATAGATHER_SERVICE_URL")
        if not datagather_service_url:
            raise HTTPException(status_code=503, detail="DATAGATHER_SERVICE_URL 환경변수가 설정되지 않았습니다")
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{datagather_service_url.rstrip('/')}/api/datagather/process-data"
            )
            
            if response.status_code == 200:
                return Response(
                    content=response.content,
                    status_code=response.status_code,
                    headers=dict(response.headers),
                    media_type=response.headers.get("content-type")
                )
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"공정 데이터 조회 오류: {response.text}"
                )
                
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="DataGather 서비스 연결 시간 초과")
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail="DataGather 서비스에 연결할 수 없습니다")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"공정 데이터 조회 오류: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8080,
        reload=False,
        proxy_headers=True
    )

# Verification steps:
# curl -sS https://<gateway>/_debug/routes | jq
# curl -sS https://<gateway>/_debug/ping-chatbot | jq
# curl -sS -H 'Content-Type: application/json' -d '{"message":"ping","context":"dashboard","session_id":"s1","user_id":"u1"}' https://<gateway>/chatbot/chat | jq
