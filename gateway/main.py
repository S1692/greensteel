import os
from fastapi import FastAPI, Request, Response, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import time
import httpx
import logging

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 환경변수에서 설정 가져오기 (기본값 포함)
GATEWAY_NAME = os.getenv("GATEWAY_NAME", "greensteel-gateway")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "https://greensteel.site,https://www.greensteel.site,http://localhost:3000")
ALLOWED_ORIGIN_REGEX = os.getenv("ALLOWED_ORIGIN_REGEX", "^https://.*\\.vercel\\.app$|^https://.*\\.up\\.railway\\.app$")

# CORS 허용 오리진 파싱
allowed_origins = [origin.strip() for origin in ALLOWED_ORIGINS.split(",") if origin.strip()]

@asynccontextmanager
async def lifespan(app: FastAPI):
    """애플리케이션 생명주기 관리 - DDD Architecture"""
    # 시작 시
    logger.info(f"Gateway {GATEWAY_NAME} starting up...")
    logger.info("Architecture: DDD (Domain-Driven Design)")
    yield
    # 종료 시
    logger.info(f"Gateway {GATEWAY_NAME} shutting down...")

# FastAPI 애플리케이션 생성
app = FastAPI(
    title=f"{GATEWAY_NAME} - DDD API Gateway",
    description="도메인 주도 설계(DDD)를 적용한 마이크로서비스 API Gateway",
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
    return {
        "status": "healthy",
        "service": GATEWAY_NAME,
        "timestamp": time.time()
    }

# favicon.ico 핸들러 (404 방지)
@app.get("/favicon.ico")
async def favicon():
    """Favicon 요청 처리 - 404 방지"""
    logger.info("Favicon request handled")
    return Response(status_code=204)

# robots.txt 핸들러 (선택적)
@app.get("/robots.txt")
async def robots():
    """Robots.txt 요청 처리"""
    logger.info("Robots.txt request handled")
    return Response(
        content="User-agent: *\nDisallow: /api/\nDisallow: /auth/\nDisallow: /geo/", 
        media_type="text/plain"
    )

# JSON 데이터를 datagather_service로 전송하는 엔드포인트
@app.post("/process-data")
async def process_data_to_datagather(data: dict):
    """프론트엔드에서 받은 JSON 데이터를 datagather_service로 전달합니다."""
    try:
        logger.info(f"JSON 데이터 처리 요청 받음: {data.get('filename', 'unknown')}")
        
        # datagather_service로 JSON 데이터 전송 (포트 8083)
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "http://localhost:8083/process-data",
                json=data
            )
            
            if response.status_code == 200:
                response_data = response.json()
                logger.info(f"datagather_service로 데이터 전송 성공: {data.get('filename', 'unknown')}")
                
                return {
                    "message": "게이트웨이를 통해 datagather_service로 전송 성공",
                    "status": "success",
                    "data": response_data
                }
            else:
                logger.error(f"datagather_service 응답 오류: {response.status_code}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"datagather_service 오류: {response.text}"
                )
                
    except httpx.TimeoutException:
        logger.error("datagather_service 연결 시간 초과")
        raise HTTPException(status_code=504, detail="서비스 연결 시간 초과")
    except httpx.ConnectError:
        logger.error("datagather_service 연결 실패")
        raise HTTPException(status_code=503, detail="datagather_service에 연결할 수 없습니다")
    except Exception as e:
        logger.error(f"게이트웨이 처리 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail=f"게이트웨이 오류: {str(e)}")

# AI 모델을 활용한 데이터 처리 엔드포인트
@app.post("/ai-process")
async def ai_process_data(data: dict):
    """AI 모델을 활용하여 투입물명을 자동으로 수정합니다."""
    try:
        logger.info(f"AI 모델 처리 요청 받음: {data.get('filename', 'unknown')}")
        
        # datagather_service로 AI 처리 요청 전송 (포트 8083)
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                "http://localhost:8083/ai-process",
                json=data
            )
            
            if response.status_code == 200:
                response_data = response.json()
                logger.info(f"AI 모델 처리 성공: {data.get('filename', 'unknown')}")
                
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
                logger.error(f"AI 모델 처리 오류: {response.status_code}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"AI 모델 처리 오류: {response.text}"
                )
                
    except httpx.TimeoutException:
        logger.error("AI 모델 처리 시간 초과")
        raise HTTPException(status_code=504, detail="AI 모델 처리 시간 초과")
    except httpx.ConnectError:
        logger.error("datagather_service 연결 실패")
        raise HTTPException(status_code=503, detail="datagather_service에 연결할 수 없습니다")
    except Exception as e:
        logger.error(f"AI 모델 처리 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI 모델 처리 오류: {str(e)}")

# 사용자 피드백 처리 엔드포인트
@app.post("/feedback")
async def process_feedback(feedback_data: dict):
    """사용자 피드백을 받아 AI 모델을 재학습시킵니다."""
    try:
        logger.info(f"사용자 피드백 처리 요청 받음")
        
        # 피드백 데이터 로깅
        logger.info(f"피드백 데이터: {feedback_data}")
        
        # datagather_service로 피드백 데이터 전송 (포트 8083)
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "http://localhost:8083/feedback",
                json=feedback_data
            )
            
            if response.status_code == 200:
                response_data = response.json()
                logger.info(f"피드백 처리 성공: {response_data}")
                
                return {
                    "message": "피드백이 성공적으로 처리되었습니다. AI 모델이 이 정보를 학습합니다.",
                    "status": "feedback_processed",
                    "data": response_data
                }
            else:
                logger.error(f"피드백 처리 오류: {response.status_code}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"피드백 처리 오류: {response.text}"
                )
                
    except httpx.TimeoutException:
        logger.error("피드백 처리 시간 초과")
        raise HTTPException(status_code=504, detail="피드백 처리 시간 초과")
    except httpx.ConnectError:
        logger.error("datagather_service 연결 실패")
        raise HTTPException(status_code=503, detail="datagather_service에 연결할 수 없습니다")
    except Exception as e:
        logger.error(f"피드백 처리 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail=f"피드백 처리 오류: {str(e)}")

# Input 데이터 업로드 엔드포인트
@app.post("/input-data")
async def upload_input_data(data: dict):
    """Input 데이터를 datagather_service로 업로드합니다."""
    try:
        logger.info(f"Input 데이터 업로드 요청 받음: {data.get('filename', 'unknown')}")
        
        # datagather_service로 Input 데이터 전송
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "http://localhost:8083/input-data",
                json=data
            )
            
            if response.status_code == 200:
                response_data = response.json()
                logger.info(f"Input 데이터 업로드 성공: {data.get('filename', 'unknown')}")
                
                return {
                    "message": "Input 데이터가 성공적으로 업로드되었습니다",
                    "status": "success",
                    "data": response_data
                }
            else:
                logger.error(f"Input 데이터 업로드 오류: {response.status_code}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Input 데이터 업로드 오류: {response.text}"
                )
                
    except httpx.TimeoutException:
        logger.error("Input 데이터 업로드 시간 초과")
        raise HTTPException(status_code=504, detail="Input 데이터 업로드 시간 초과")
    except httpx.ConnectError:
        logger.error("datagather_service 연결 실패")
        raise HTTPException(status_code=503, detail="datagather_service에 연결할 수 없습니다")
    except Exception as e:
        logger.error(f"Input 데이터 업로드 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Input 데이터 업로드 오류: {str(e)}")

# Output 데이터 업로드 엔드포인트
@app.post("/output-data")
async def upload_output_data(data: dict):
    """Output 데이터를 datagather_service로 업로드합니다."""
    try:
        logger.info(f"Output 데이터 업로드 요청 받음: {data.get('filename', 'unknown')}")
        
        # datagather_service로 Output 데이터 전송
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "http://localhost:8083/output-data",
                json=data
            )
            
            if response.status_code == 200:
                response_data = response.json()
                logger.info(f"Output 데이터 업로드 성공: {data.get('filename', 'unknown')}")
                
                return {
                    "message": "Output 데이터가 성공적으로 업로드되었습니다",
                    "status": "success",
                    "data": response_data
                }
            else:
                logger.error(f"Output 데이터 업로드 오류: {response.status_code}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Output 데이터 업로드 오류: {response.text}"
                )
                
    except httpx.TimeoutException:
        logger.error("Output 데이터 업로드 시간 초과")
        raise HTTPException(status_code=504, detail="Output 데이터 업로드 시간 초과")
    except httpx.ConnectError:
        logger.error("datagather_service 연결 실패")
        raise HTTPException(status_code=503, detail="datagather_service에 연결할 수 없습니다")
    except Exception as e:
        logger.error(f"Output 데이터 업로드 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Output 데이터 업로드 오류: {str(e)}")

# CBAM 제품 생성 엔드포인트
@app.post("/cbam/product")
async def create_cbam_product(product_data: dict):
    """CBAM 제품을 생성합니다."""
    try:
        logger.info(f"CBAM 제품 생성 요청 받음: {product_data.get('name', 'unknown')}")
        
        # cbam_service로 제품 데이터 전송 (포트 8082)
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "http://localhost:8082/api/product",
                json=product_data
            )
            
            if response.status_code == 200:
                response_data = response.json()
                logger.info(f"CBAM 제품 생성 성공: {product_data.get('name', 'unknown')}")
                
                return {
                    "message": "CBAM 제품이 성공적으로 생성되었습니다",
                    "status": "success",
                    "data": response_data
                }
            else:
                logger.error(f"CBAM 제품 생성 오류: {response.status_code}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"CBAM 제품 생성 오류: {response.text}"
                )
                
    except httpx.TimeoutException:
        logger.error("CBAM 서비스 연결 시간 초과")
        raise HTTPException(status_code=504, detail="CBAM 서비스 연결 시간 초과")
    except httpx.ConnectError:
        logger.error("CBAM 서비스 연결 실패")
        raise HTTPException(status_code=503, detail="CBAM 서비스에 연결할 수 없습니다")
    except Exception as e:
        logger.error(f"CBAM 제품 생성 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail=f"CBAM 제품 생성 오류: {str(e)}")

# CBAM 제품 목록 조회 엔드포인트
@app.get("/cbam/products")
async def get_cbam_products():
    """CBAM 제품 목록을 조회합니다."""
    try:
        logger.info("CBAM 제품 목록 조회 요청 받음")
        
        # cbam_service로 제품 목록 조회 요청 (포트 8082)
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                "http://localhost:8082/api/products"
            )
            
            if response.status_code == 200:
                products = response.json()
                logger.info(f"CBAM 제품 목록 조회 성공: {len(products)}개")
                
                return {
                    "message": "CBAM 제품 목록 조회 성공",
                    "status": "success",
                    "data": products,
                    "count": len(products)
                }
            else:
                logger.error(f"CBAM 제품 목록 조회 오류: {response.status_code}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"CBAM 제품 목록 조회 오류: {response.text}"
                )
                
    except httpx.TimeoutException:
        logger.error("CBAM 서비스 연결 시간 초과")
        raise HTTPException(status_code=504, detail="CBAM 서비스 연결 시간 초과")
    except httpx.ConnectError:
        logger.error("CBAM 서비스 연결 실패")
        raise HTTPException(status_code=503, detail="CBAM 서비스에 연결할 수 없습니다")
    except Exception as e:
        logger.error(f"CBAM 제품 목록 조회 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail="CBAM 제품 목록 조회 오류: {str(e)}")

# DataGather AI 처리 엔드포인트
@app.post("/ai-process")
async def ai_process_data(data: dict):
    """DataGather 서비스로 AI 처리 요청을 전달합니다."""
    try:
        logger.info(f"AI 처리 요청 받음: {data.get('filename', 'unknown')}")
        
        # datagather_service로 AI 처리 요청 전송 (포트 8083)
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "http://localhost:8083/filtering/ai-process",
                json=data
            )
            
            if response.status_code == 200:
                result = response.json()
                logger.info("AI 처리 성공")
                
                return {
                    "message": "AI 처리가 완료되었습니다",
                    "status": "success",
                    "data": result
                }
            else:
                logger.error(f"AI 처리 오류: {response.status_code}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"AI 처리 오류: {response.text}"
                )
                
    except httpx.TimeoutException:
        logger.error("DataGather 서비스 연결 시간 초과")
        raise HTTPException(status_code=504, detail="DataGather 서비스 연결 시간 초과")
    except httpx.ConnectError:
        logger.error("DataGather 서비스 연결 실패")
        raise HTTPException(status_code=503, detail="DataGather 서비스에 연결할 수 없습니다")
    except Exception as e:
        logger.error(f"AI 처리 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail="AI 처리 오류: {str(e)}")

# DataGather 피드백 엔드포인트
@app.post("/feedback")
async def submit_feedback(feedback_data: dict):
    """DataGather 서비스로 피드백을 전달합니다."""
    try:
        logger.info("피드백 제출 요청 받음")
        
        # datagather_service로 피드백 전송 (포트 8083)
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "http://localhost:8083/filtering/feedback",
                json=feedback_data
            )
            
            if response.status_code == 200:
                result = response.json()
                logger.info("피드백 제출 성공")
                
                return {
                    "message": "피드백이 성공적으로 제출되었습니다",
                    "status": "success",
                    "data": result
                }
            else:
                logger.error(f"피드백 제출 오류: {response.status_code}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"피드백 제출 오류: {response.text}"
                )
                
    except httpx.TimeoutException:
        logger.error("DataGather 서비스 연결 시간 초과")
        raise HTTPException(status_code=504, detail="DataGather 서비스 연결 시간 초과")
    except httpx.ConnectError:
        logger.error("DataGather 서비스 연결 실패")
        raise HTTPException(status_code=503, detail="DataGather 서비스에 연결할 수 없습니다")
    except Exception as e:
        logger.error(f"피드백 제출 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail="피드백 제출 오류: {str(e)}")

# 서비스 상태 확인 엔드포인트
@app.get("/status")
async def service_status():
    """서비스 상태 정보 - DDD 도메인별 상태"""
    return {
        "status": "healthy",
        "service": GATEWAY_NAME,
        "timestamp": time.time()
    }

# 라우팅 정보 엔드포인트
@app.get("/routing")
async def routing_info():
    """라우팅 규칙 및 설정 정보 - DDD 도메인 구조 기반"""
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

# 모든 HTTP 메서드에 대한 프록시 라우팅
@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"])
async def proxy_route(request: Request, path: str):
    """모든 경로에 대한 프록시 라우팅 - DDD 도메인 서비스 라우팅"""
    # 루트 경로는 헬스체크로 리다이렉트
    if path == "" or path == "/":
        return {"message": "Gateway is running", "health_check": "/health"}
    
    # 프록시 요청 처리
    return {
        "message": "Proxy route not found",
        "path": path,
        "supported_methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"]
    }

# 루트 경로
@app.get("/")
async def root():
    """루트 경로"""
    return {
        "message": f"{GATEWAY_NAME} - DDD API Gateway",
        "version": "2.0.0",
        "status": "running"
    }

# 예외 처리
@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    """404 에러 처리"""
    logger.warning(f"404 Not Found: {request.url.path}")
    return {"error": "Not Found", "path": request.url.path}

@app.exception_handler(400)
async def bad_request_handler(request: Request, exc):
    """400 에러 처리"""
    logger.warning(f"400 Bad Request: {request.url.path}")
    return {"error": "Bad Request", "detail": str(exc.detail) if hasattr(exc, 'detail') else "Invalid request"}

@app.exception_handler(500)
async def internal_error_handler(request: Request, exc):
    """500 에러 처리"""
    logger.error(f"Internal Server Error: {request.url.path}")
    return {"error": "Internal Server Error"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8080,
        reload=False,
        proxy_headers=True
    )
