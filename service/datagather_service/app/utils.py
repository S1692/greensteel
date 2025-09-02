#!/usr/bin/env python3
"""
유틸리티 함수들
"""

import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

def excel_date_to_postgres_date(excel_date):
    """Excel 날짜 숫자를 PostgreSQL date로 변환"""
    if excel_date is None or excel_date == '':
        return None
    
    try:
        # Excel 날짜는 1900년 1월 1일부터의 일수
        # 1900년 1월 1일을 기준으로 날짜 계산
        base_date = datetime(1900, 1, 1)
        if isinstance(excel_date, (int, float)):
            # Excel의 날짜 계산 (1900년 1월 1일 = 1)
            days = int(excel_date) - 1
            result_date = base_date + timedelta(days=days)
            return result_date.strftime('%Y-%m-%d')
        elif isinstance(excel_date, str):
            # 이미 문자열 형태의 날짜인 경우
            return excel_date
        else:
            return None
    except Exception as e:
        logger.warning(f"날짜 변환 실패: {excel_date}, 오류: {e}")
        return None
