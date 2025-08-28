from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from sqlalchemy.sql import func
from .database import Base

class InputData(Base):
    """입력 데이터 모델"""
    __tablename__ = "input"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    type = Column(String(100))
    category = Column(String(100))
    unit = Column(String(50))
    quantity = Column(Float)
    source = Column(String(255))
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class OutputData(Base):
    """출력 데이터 모델"""
    __tablename__ = "output"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    type = Column(String(100))
    category = Column(String(100))
    unit = Column(String(50))
    quantity = Column(Float)
    destination = Column(String(255))
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ProcessData(Base):
    """공정 데이터 모델"""
    __tablename__ = "process"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    type = Column(String(100))
    energy_consumption = Column(Float)
    energy_unit = Column(String(50))
    duration_hours = Column(Float)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class TransportData(Base):
    """운송 데이터 모델"""
    __tablename__ = "transport"
    
    id = Column(Integer, primary_key=True, index=True)
    mode = Column(String(100), nullable=False)  # road, rail, sea, air
    distance_km = Column(Float)
    fuel_type = Column(String(100))
    fuel_consumption = Column(Float)
    fuel_unit = Column(String(50))
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
