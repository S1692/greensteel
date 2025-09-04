#!/bin/bash

# rail 서비스를 백그라운드에서 실행
cd /app/rail
python app.py &
RAIL_PID=$!

# 잠시 대기 (rail 서비스가 시작될 시간)
sleep 5

# datagather 서비스 실행
cd /app
python -m uvicorn app.main:app --host 0.0.0.0 --port 8085 --reload

# rail 서비스 종료
kill $RAIL_PID
