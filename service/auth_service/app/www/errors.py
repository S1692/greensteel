from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from app.common.logger import auth_logger

async def validation_exception_handler(request: Request, exc: ValidationError):
    """Validation 에러 핸들러"""
    auth_logger.warning(f"Validation error: {exc}")
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "message": "Validation error",
            "data": {"detail": exc.errors()}
        }
    )

async def http_exception_handler(request: Request, exc: HTTPException):
    """HTTP 에러 핸들러"""
    auth_logger.warning(f"HTTP error: {exc.status_code} - {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": exc.detail,
            "data": {}
        }
    )

async def general_exception_handler(request: Request, exc: Exception):
    """일반 에러 핸들러"""
    auth_logger.error(f"Unexpected error: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "Internal server error",
            "data": {}
        }
    )
