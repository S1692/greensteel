from sqlalchemy import Column, Integer, String, Text, DateTime, Float, JSON, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from datetime import datetime

Base = declarative_base()

class ProcessingResult(Base):
    """AI 처리 결과를 저장하는 테이블"""
    __tablename__ = "processing_results"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False, index=True)
    original_material = Column(Text, nullable=False)
    processed_material = Column(Text, nullable=False)
    process_name = Column(String(255), nullable=True)
    production_name = Column(String(255), nullable=True)
    confidence_score = Column(Float, nullable=True)
    ai_model_used = Column(String(100), nullable=True)
    processing_time = Column(Float, nullable=True)  # 초 단위
    status = Column(String(50), default="completed")  # completed, failed, pending
    error_message = Column(Text, nullable=True)
    metadata = Column(JSON, nullable=True)  # 추가 정보
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class UserFeedback(Base):
    """사용자 피드백을 저장하는 테이블"""
    __tablename__ = "user_feedback"
    
    id = Column(Integer, primary_key=True, index=True)
    processing_result_id = Column(Integer, nullable=False, index=True)
    original_material = Column(Text, nullable=False)
    corrected_material = Column(Text, nullable=False)
    feedback_type = Column(String(50), nullable=False)  # correction, approval, rejection
    user_comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ProcessingLog(Base):
    """처리 로그를 저장하는 테이블"""
    __tablename__ = "processing_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False, index=True)
    total_records = Column(Integer, default=0)
    processed_records = Column(Integer, default=0)
    failed_records = Column(Integer, default=0)
    processing_duration = Column(Float, nullable=True)  # 초 단위
    ai_model_version = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
