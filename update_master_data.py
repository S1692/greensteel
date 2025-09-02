#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
마스터 데이터 업데이트 스크립트
엑셀 파일의 데이터를 DB에 반영합니다.
"""

import pandas as pd
import asyncio
import os
import sys
from pathlib import Path

# 프로젝트 루트 경로 추가
project_root = Path(__file__).parent
sys.path.append(str(project_root / "service" / "cbam_service" / "cbam-service"))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.domain.fueldir.fueldir_entity import FuelMaster
from app.domain.matdir.matdir_entity import MaterialMaster
from app.domain.mapping.mapping_entity import HSCNMapping

# 환경 변수 설정 (실제 환경에 맞게 수정 필요)
DB_URL = os.getenv("DATABASE_URL", "postgresql://username:password@localhost:5432/dbname")

def create_engine_and_session():
    """데이터베이스 엔진과 세션 생성"""
    try:
        engine = create_engine(DB_URL)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        return engine, SessionLocal
    except Exception as e:
        print(f"데이터베이스 연결 실패: {e}")
        return None, None

def clear_existing_data(session, table_name):
    """기존 데이터 삭제"""
    try:
        session.execute(text(f"DELETE FROM {table_name}"))
        session.commit()
        print(f"✅ {table_name} 테이블의 기존 데이터가 삭제되었습니다.")
    except Exception as e:
        session.rollback()
        print(f"❌ {table_name} 테이블 데이터 삭제 실패: {e}")

def clean_numeric_data(value):
    """숫자 데이터 정리"""
    if pd.isna(value) or value == "-" or value == "":
        return None
    try:
        return float(value)
    except (ValueError, TypeError):
        return None

def clean_text_data(text, max_length=255):
    """텍스트 데이터 정리 및 길이 제한"""
    if pd.isna(text):
        return None
    text_str = str(text).strip()
    if text_str == "" or text_str == "-":
        return None
    # 길이 제한
    if len(text_str) > max_length:
        text_str = text_str[:max_length]
    return text_str

def update_fuel_master(session, excel_path):
    """연료 마스터 데이터 업데이트"""
    try:
        # 엑셀 파일 읽기
        df = pd.read_excel(excel_path)
        print(f"📊 {excel_path}에서 {len(df)}개의 연료 데이터를 읽었습니다.")
        
        # 기존 데이터 삭제
        clear_existing_data(session, "fuel_master")
        
        # 새 데이터 삽입
        for _, row in df.iterrows():
            fuel_master = FuelMaster(
                fuel_name=clean_text_data(row['fuel_name']),
                fuel_engname=clean_text_data(row['fuel_engname']),
                fuel_factor=clean_numeric_data(row['fuel_factor']),
                net_calory=clean_numeric_data(row['net_calory'])
            )
            session.add(fuel_master)
        
        session.commit()
        print(f"✅ 연료 마스터 데이터 {len(df)}개가 성공적으로 업데이트되었습니다.")
        
    except Exception as e:
        session.rollback()
        print(f"❌ 연료 마스터 데이터 업데이트 실패: {e}")

def update_material_master(session, excel_path):
    """원재료 마스터 데이터 업데이트"""
    try:
        # 엑셀 파일 읽기
        df = pd.read_excel(excel_path)
        print(f"📊 {excel_path}에서 {len(df)}개의 원재료 데이터를 읽었습니다.")
        
        # 기존 데이터 삭제
        clear_existing_data(session, "material_master")
        
        # 새 데이터 삽입
        for _, row in df.iterrows():
            material_master = MaterialMaster(
                mat_name=clean_text_data(row['mat_name']),
                mat_engname=clean_text_data(row['mat_engname']),
                carbon_content=clean_numeric_data(row['carbon_content']),
                mat_factor=clean_numeric_data(row['mat_factor'])
            )
            session.add(material_master)
        
        session.commit()
        print(f"✅ 원재료 마스터 데이터 {len(df)}개가 성공적으로 업데이트되었습니다.")
        
    except Exception as e:
        session.rollback()
        print(f"❌ 원재료 마스터 데이터 업데이트 실패: {e}")

def update_hs_cn_mapping(session, excel_path):
    """HS-CN 매핑 데이터 업데이트"""
    try:
        # 엑셀 파일 읽기
        df = pd.read_excel(excel_path)
        print(f"📊 {excel_path}에서 {len(df)}개의 HS-CN 매핑 데이터를 읽었습니다.")
        
        # 기존 데이터 삭제
        clear_existing_data(session, "hs_cn_mapping")
        
        # 새 데이터 삽입
        for _, row in df.iterrows():
            hs_cn_mapping = HSCNMapping(
                hscode=clean_text_data(str(row['hscode']), 6),
                aggregoods_name=clean_text_data(row['aggregoods_name'], 500),
                aggregoods_engname=clean_text_data(row['aggregoods_engname'], 500),
                cncode_total=clean_text_data(str(row['cncode_total']), 8),
                goods_name=clean_text_data(row['goods_name'], 1000),
                goods_engname=clean_text_data(row['goods_engname'], 1000)
            )
            session.add(hs_cn_mapping)
        
        session.commit()
        print(f"✅ HS-CN 매핑 데이터 {len(df)}개가 성공적으로 업데이트되었습니다.")
        
    except Exception as e:
        session.rollback()
        print(f"❌ HS-CN 매핑 데이터 업데이트 실패: {e}")

def main():
    """메인 함수"""
    print("🚀 마스터 데이터 업데이트를 시작합니다...")
    
    # 데이터베이스 연결
    engine, SessionLocal = create_engine_and_session()
    if not engine:
        print("❌ 데이터베이스 연결에 실패했습니다.")
        return
    
    # 엑셀 파일 경로
    masterdb_path = project_root / "masterdb"
    fuel_excel = masterdb_path / "fuel_master.xlsx"
    material_excel = masterdb_path / "material_master.xlsx"
    hs_cn_excel = masterdb_path / "hs_cn_mapping.xlsx"
    
    # 파일 존재 확인
    if not fuel_excel.exists():
        print(f"❌ {fuel_excel} 파일을 찾을 수 없습니다.")
        return
    
    if not material_excel.exists():
        print(f"❌ {material_excel} 파일을 찾을 수 없습니다.")
        return
    
    if not hs_cn_excel.exists():
        print(f"❌ {hs_cn_excel} 파일을 찾을 수 없습니다.")
        return
    
    # 세션 생성
    session = SessionLocal()
    
    try:
        # 각 마스터 데이터 업데이트
        print("\n📋 연료 마스터 데이터 업데이트 중...")
        update_fuel_master(session, fuel_excel)
        
        print("\n📋 원재료 마스터 데이터 업데이트 중...")
        update_material_master(session, material_excel)
        
        print("\n📋 HS-CN 매핑 데이터 업데이트 중...")
        update_hs_cn_mapping(session, hs_cn_excel)
        
        print("\n🎉 모든 마스터 데이터 업데이트가 완료되었습니다!")
        
    except Exception as e:
        print(f"❌ 업데이트 중 오류 발생: {e}")
        session.rollback()
    
    finally:
        session.close()
        engine.dispose()

if __name__ == "__main__":
    main()
