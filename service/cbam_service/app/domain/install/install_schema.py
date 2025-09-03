# ============================================================================
# 🏭 Install Schema - 사업장 API 스키마
# ============================================================================

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class InstallNameResponse(BaseModel):
    """사업장명 응답 (드롭다운용)"""
    id: int = Field(..., description="사업장 ID")
    name: str = Field(..., description="사업장명")

class InstallCreateRequest(BaseModel):
    """사업장 생성 요청"""
    name: str = Field(..., description="사업장명")


class InstallResponse(BaseModel):
    """사업장 응답"""
    id: int = Field(..., description="사업장 ID")
    name: str = Field(..., description="사업장명")

    created_at: Optional[datetime] = Field(None, description="생성일")
    updated_at: Optional[datetime] = Field(None, description="수정일")

class InstallUpdateRequest(BaseModel):
    """사업장 수정 요청"""
    name: Optional[str] = Field(None, description="사업장명")


    class Config:
        from_attributes = True
