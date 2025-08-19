#!/usr/bin/env python3
"""
Railway PostgreSQL 'db_type' 파라미터 오류 즉시 해결 스크립트
이 스크립트는 Railway에서 발생하는 데이터베이스 연결 문제를 해결합니다.
"""

import os
import re
import subprocess
import sys
import time
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse

def run_command(command, capture_output=True):
    """명령어 실행"""
    try:
        result = subprocess.run(command, shell=True, capture_output=capture_output, text=True)
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)

def check_railway_cli():
    """Railway CLI 설치 확인"""
    print("🔍 Railway CLI 설치 상태 확인 중...")
    success, stdout, stderr = run_command("railway --version")
    
    if not success:
        print("❌ Railway CLI가 설치되지 않았습니다.")
        print("📦 설치 중...")
        install_success, _, _ = run_command("npm install -g @railway/cli")
        
        if install_success:
            print("✅ Railway CLI 설치 완료")
            return True
        else:
            print("❌ Railway CLI 설치 실패")
            return False
    
    print(f"✅ Railway CLI 설치됨: {stdout.strip()}")
    return True

def railway_login():
    """Railway 로그인"""
    print("🔐 Railway 로그인 중...")
    success, _, _ = run_command("railway login", capture_output=False)
    
    if success:
        print("✅ Railway 로그인 완료")
        return True
    else:
        print("❌ Railway 로그인 실패")
        return False

def get_current_project():
    """현재 연결된 프로젝트 확인"""
    print("🔗 현재 프로젝트 확인 중...")
    success, stdout, stderr = run_command("railway status")
    
    if success:
        print(f"✅ 현재 프로젝트: {stdout.strip()}")
        return True
    else:
        print("❌ 프로젝트 연결 실패")
        print("프로젝트를 연결하려면: railway link")
        return False

def list_environment_variables():
    """환경 변수 목록 확인"""
    print("📋 환경 변수 목록 확인 중...")
    success, stdout, stderr = run_command("railway variables list")
    
    if success:
        print("✅ 환경 변수 목록:")
        print(stdout)
        return stdout
    else:
        print("❌ 환경 변수 목록 조회 실패")
        return None

def fix_database_url(url):
    """데이터베이스 URL에서 문제 파라미터 제거"""
    if not url:
        return url
    
    print(f"🔧 원본 DATABASE_URL: {url}")
    
    try:
        # URL 파싱
        parsed = urlparse(url)
        
        # 쿼리 파라미터 파싱
        query_params = parse_qs(parsed.query)
        
        # 문제가 되는 파라미터들 제거
        problematic_params = [
            'db_type', 'db_type=postgresql', 'db_type=postgres',
            'db_type=mysql', 'db_type=sqlite', 'db_type=mongodb'
        ]
        
        # 쿼리 파라미터에서 문제 파라미터 제거
        cleaned_params = {}
        for key, values in query_params.items():
            if key not in problematic_params:
                cleaned_params[key] = values
        
        # 새로운 쿼리 문자열 생성
        new_query = urlencode(cleaned_params, doseq=True)
        
        # URL 재구성
        fixed_url = urlunparse((
            parsed.scheme,
            parsed.netloc,
            parsed.path,
            parsed.params,
            new_query,
            parsed.fragment
        ))
        
        # 추가 정리 작업
        # 연속된 & 제거
        fixed_url = re.sub(r'&&+', '&', fixed_url)
        fixed_url = re.sub(r'&+$', '', fixed_url)
        
        # URL 시작이 ?로 시작하면 &로 변경
        if '?' in fixed_url and fixed_url.split('?')[1].startswith('&'):
            fixed_url = fixed_url.replace('?&', '?')
        
        # 끝에 &가 있으면 제거
        if fixed_url.endswith('&'):
            fixed_url = fixed_url[:-1]
        
        print(f"✅ 정리된 DATABASE_URL: {fixed_url}")
        
        return fixed_url
        
    except Exception as e:
        print(f"❌ URL 정리 중 오류 발생: {str(e)}")
        return url

def update_database_url(new_url):
    """DATABASE_URL 환경 변수 업데이트"""
    print("🔄 DATABASE_URL 업데이트 중...")
    success, stdout, stderr = run_command(f'railway variables set DATABASE_URL="{new_url}"')
    
    if success:
        print("✅ DATABASE_URL 업데이트 완료")
        return True
    else:
        print(f"❌ DATABASE_URL 업데이트 실패: {stderr}")
        return False

def redeploy_service():
    """서비스 재배포"""
    print("🚀 서비스 재배포 중...")
    success, stdout, stderr = run_command("railway up")
    
    if success:
        print("✅ 서비스 재배포 완료")
        return True
    else:
        print(f"❌ 서비스 재배포 실패: {stderr}")
        return False

def check_logs():
    """로그 확인"""
    print("📊 로그 확인 중...")
    print("최근 로그를 확인하려면: railway logs --follow")
    
    # 최근 로그 몇 줄 확인
    success, stdout, stderr = run_command("railway logs --limit 10")
    
    if success:
        print("📋 최근 로그:")
        print(stdout)
    else:
        print("❌ 로그 조회 실패")

def main():
    """메인 함수"""
    print("🚨 Railway PostgreSQL 'db_type' 파라미터 오류 해결 스크립트")
    print("=" * 60)
    
    # 1단계: Railway CLI 확인 및 설치
    if not check_railway_cli():
        print("❌ Railway CLI 설정 실패. 수동으로 설치해주세요.")
        return False
    
    # 2단계: Railway 로그인
    if not railway_login():
        print("❌ Railway 로그인 실패. 수동으로 로그인해주세요.")
        return False
    
    # 3단계: 프로젝트 연결 확인
    if not get_current_project():
        print("❌ 프로젝트 연결 실패. railway link 명령어로 연결해주세요.")
        return False
    
    # 4단계: 환경 변수 확인
    env_vars = list_environment_variables()
    if not env_vars:
        print("❌ 환경 변수 조회 실패.")
        return False
    
    # 5단계: DATABASE_URL 찾기 및 수정
    if "DATABASE_URL" in env_vars:
        print("🔍 DATABASE_URL 발견")
        
        # 현재 DATABASE_URL 값 가져오기
        success, stdout, stderr = run_command("railway variables get DATABASE_URL")
        
        if success:
            current_url = stdout.strip()
            print(f"현재 DATABASE_URL: {current_url}")
            
            # URL 정리
            fixed_url = fix_database_url(current_url)
            
            if fixed_url != current_url:
                print("🔄 DATABASE_URL 수정이 필요합니다.")
                
                # 사용자 확인
                response = input("DATABASE_URL을 수정하시겠습니까? (y/N): ")
                
                if response.lower() in ['y', 'yes']:
                    # 환경 변수 업데이트
                    if update_database_url(fixed_url):
                        # 서비스 재배포
                        if redeploy_service():
                            print("✅ 모든 작업이 완료되었습니다!")
                            
                            # 잠시 대기 후 로그 확인
                            print("⏳ 10초 후 로그를 확인합니다...")
                            time.sleep(10)
                            check_logs()
                            
                            return True
                        else:
                            print("❌ 서비스 재배포 실패")
                            return False
                    else:
                        print("❌ 환경 변수 업데이트 실패")
                        return False
                else:
                    print("⏭️ DATABASE_URL 수정을 건너뜁니다.")
            else:
                print("✅ DATABASE_URL에 문제가 없습니다.")
        else:
            print("❌ DATABASE_URL 값 조회 실패")
            return False
    else:
        print("⚠️ DATABASE_URL 환경 변수를 찾을 수 없습니다.")
        print("수동으로 확인해주세요.")
    
    return True

if __name__ == "__main__":
    try:
        success = main()
        if success:
            print("\n🎉 스크립트 실행이 완료되었습니다!")
        else:
            print("\n❌ 스크립트 실행 중 오류가 발생했습니다.")
            sys.exit(1)
    except KeyboardInterrupt:
        print("\n⏹️ 사용자에 의해 중단되었습니다.")
        sys.exit(0)
    except Exception as e:
        print(f"\n💥 예상치 못한 오류가 발생했습니다: {str(e)}")
        sys.exit(1)
