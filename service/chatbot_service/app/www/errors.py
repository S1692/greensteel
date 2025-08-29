from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError
from app.common.logger import chatbot_logger

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Pydantic 검증 오류 핸들러"""
    chatbot_logger.warning(f"Validation error: {exc.errors()}")
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "message": "실적정보(투입물) 검증에 실패했습니다.",
            "data": {
                "errors": exc.errors(),
                "request_path": request.url.path
            }
        }
    )

async def http_exception_handler(request: Request, exc: RequestValidationError):
    """HTTP 오류 핸들러"""
    chatbot_logger.warning(f"HTTP error {exc.status_code}: {exc.detail}")
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": exc.detail,
            "data": {
                "status_code": exc.status_code,
                "request_path": request.url.path
            }
        }
    )

async def general_exception_handler(request: Request, exc: Exception):
    """일반 예외 핸들러"""
    chatbot_logger.error(f"Unexpected error: {str(exc)}", exc_info=True)
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "서버 내부 오류가 발생했습니다.",
            "data": {
                "error_type": type(exc).__name__,
                "request_path": request.url.path
            }
        }
    )
