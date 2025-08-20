# ============================================================================
# 🌊 Flow Schema - ReactFlow 플로우 스키마
# ============================================================================

from pydantic import BaseModel, Field, field_validator
from typing import Optional, Dict, Any, List
from datetime import datetime

# ============================================================================
# 📱 뷰포트 스키마 (Viewport 도메인으로 분리됨)
# ============================================================================

# ============================================================================
# 📝 요청 스키마
# ============================================================================

class FlowCreateRequest(BaseModel):
    """플로우 생성 요청"""
    id: Optional[str] = Field(default=None, description="플로우 ID (자동 생성 가능)")
    name: str = Field(..., min_length=1, max_length=100, description="플로우 이름")
    description: Optional[str] = Field(default=None, max_length=500, description="플로우 설명")
    # viewport: FlowViewport = Field(default_factory=FlowViewport, description="초기 뷰포트 상태")  # Viewport 도메인으로 분리됨
    settings: Optional[Dict[str, Any]] = Field(default_factory=dict, description="플로우 설정")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="플로우 메타데이터")

class FlowUpdateRequest(BaseModel):
    """플로우 수정 요청"""
    name: Optional[str] = Field(default=None, min_length=1, max_length=100, description="플로우 이름")
    description: Optional[str] = Field(default=None, max_length=500, description="플로우 설명")
    # viewport: Optional[FlowViewport] = Field(default=None, description="뷰포트 상태")  # Viewport 도메인으로 분리됨
    settings: Optional[Dict[str, Any]] = Field(default=None, description="플로우 설정")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="플로우 메타데이터")

# FlowViewportUpdateRequest 클래스 제거 (Viewport 도메인으로 분리됨)

# ============================================================================
# 📤 응답 스키마
# ============================================================================

class FlowResponse(BaseModel):
    """플로우 응답"""
    id: str = Field(..., description="플로우 ID")
    name: str = Field(..., description="플로우 이름")
    description: Optional[str] = Field(default=None, description="플로우 설명")
    # viewport: FlowViewport = Field(..., description="뷰포트 상태")  # Viewport 도메인으로 분리됨
    settings: Dict[str, Any] = Field(default_factory=dict, description="플로우 설정")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="플로우 메타데이터")
    created_at: str = Field(..., description="생성 시간")
    updated_at: str = Field(..., description="수정 시간")

class FlowListResponse(BaseModel):
    """플로우 목록 응답"""
    flows: List[FlowResponse] = Field(..., description="플로우 목록")
    total: int = Field(..., description="전체 플로우 수")

class ReactFlowStateResponse(BaseModel):
    """ReactFlow 전체 상태 응답"""
    flow: FlowResponse = Field(..., description="플로우 정보")
    nodes: List[Dict[str, Any]] = Field(default_factory=list, description="노드 목록")
    edges: List[Dict[str, Any]] = Field(default_factory=list, description="엣지 목록")
    
    class Config:
        json_schema_extra = {
            "example": {
                "flow": {
                    "id": "flow_123",
                    "name": "My Flow",
                    "description": "ReactFlow 예시",
                    # "viewport": {"x": 0, "y": 0, "zoom": 1.0},  # Viewport 도메인으로 분리됨
                    "settings": {},
                    "metadata": {}
                },
                "nodes": [
                    {
                        "id": "node_1",
                        "type": "input",
                        "position": {"x": 250, "y": 25},
                        "data": {"label": "Input Node"}
                    }
                ],
                "edges": [
                    {
                        "id": "edge_1",
                        "source": "node_1",
                        "target": "node_2"
                    }
                ]
            }
        }

# ============================================================================
# 🔍 검색 스키마
# ============================================================================

class FlowSearchRequest(BaseModel):
    """플로우 검색 요청"""
    name: Optional[str] = Field(default=None, description="플로우 이름 (부분 일치)")
    
# ============================================================================
# 📊 통계 스키마
# ============================================================================

class FlowStatsResponse(BaseModel):
    """플로우 통계 응답"""
    total_flows: int = Field(..., description="전체 플로우 수")
    total_nodes: int = Field(..., description="전체 노드 수")
    total_edges: int = Field(..., description="전체 엣지 수")
    average_nodes_per_flow: float = Field(..., description="플로우당 평균 노드 수")
    average_edges_per_flow: float = Field(..., description="플로우당 평균 엣지 수")
