#!/usr/bin/env python3
"""
데이터베이스 모델 정의
SQLAlchemy ORM을 사용하여 테이블 구조를 정의합니다.
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, Numeric, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from datetime import datetime

Base = declarative_base()

class InputData(Base):
    """투입물 데이터 테이블"""
    __tablename__ = "input_data"
    
    id = Column(Integer, primary_key=True, index=True)
    로트번호 = Column(String(255))
    생산품명 = Column(String(255))
    생산수량 = Column(Numeric(10, 3))
    투입일 = Column(String(255))
    종료일 = Column(String(255))
    공정 = Column(String(255))
    투입물명 = Column(String(255))
    수량 = Column(Numeric(10, 3))
    단위 = Column(String(50))
    ai추천답변 = Column(Text, nullable=True)
    source_file = Column(String(255))
    주문처명 = Column(String(255))
    오더번호 = Column(String(255))
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

class TransportData(Base):
    """운송 데이터 테이블"""
    __tablename__ = "transport_data"
    
    id = Column(Integer, primary_key=True, index=True)
    생산품명 = Column(String(255))
    로트번호 = Column(String(255))
    운송물질 = Column(String(255))
    운송수량 = Column(Numeric(10, 3))
    운송일자 = Column(String(255), nullable=True)
    도착공정 = Column(String(255))
    출발지 = Column(String(255))
    이동수단 = Column(String(255))
    주문처명 = Column(String(255))
    오더번호 = Column(String(255))
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

class ProcessData(Base):
    """공정 데이터 테이블"""
    __tablename__ = "process_data"
    
    id = Column(Integer, primary_key=True, index=True)
    공정명 = Column(String(255), nullable=False)
    생산제품 = Column(String(255), nullable=False)
    세부공정 = Column(String(255), nullable=False)
    공정설명 = Column(Text, nullable=True)  # 공정 설명 (띄어쓰기 반영)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

class OutputData(Base):
    """출력 데이터 테이블"""
    __tablename__ = "output_data"
    
    id = Column(Integer, primary_key=True, index=True)
    생산품명 = Column(String(255))
    로트번호 = Column(String(255))
    생산수량 = Column(Numeric(10, 3))
    생산일 = Column(String(255))
    공정 = Column(String(255))
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
