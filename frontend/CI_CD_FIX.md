# 🚨 CI/CD 문제 해결 가이드

## 문제 상황

- Vercel이 GitHub 커밋을 인식하지 못함
- 자동 배포가 작동하지 않음
- CI/CD 파이프라인 중단

## 🔍 문제 진단

### 1. GitHub 연결 상태 확인

- [ ] Vercel 대시보드에서 GitHub 연결 상태 확인
- [ ] GitHub App 권한 확인
- [ ] Repository 접근 권한 확인

### 2. 프로젝트 설정 확인

- [ ] vercel.json 설정 검증
- [ ] Build Command 확인 (`pnpm run build`)
- [ ] Output Directory 확인 (`.next`)
- [ ] Framework 설정 확인 (`nextjs`)

### 3. 환경 변수 확인

- [ ] Vercel 프로젝트 환경 변수 설정
- [ ] GitHub Secrets 설정
- [ ] DATABASE_URL 등 백엔드 연결 정보

## 🛠️ 해결 방법

### 방법 1: Vercel 프로젝트 재연결

1. **Vercel 대시보드 접속**
   - https://vercel.com/dashboard

2. **프로젝트 선택**
   - `greensteel-frontend` 프로젝트 클릭

3. **Settings → Git**
   - "Disconnect" 클릭하여 기존 연결 해제
   - "Connect Git Repository" 클릭
   - GitHub 계정 재연결
   - Repository 재선택

4. **프로젝트 재배포**
   - "Deploy" 버튼 클릭

### 방법 2: 수동 배포 트리거

1. **Vercel CLI 사용**

   ```bash
   npm i -g vercel
   vercel login
   vercel --prod
   ```

2. **GitHub Actions 사용**
   - `.github/workflows/deploy.yml` 생성
   - Vercel 배포 자동화

### 방법 3: 강제 트리거

1. **빈 커밋 생성**

   ```bash
   git commit --allow-empty -m "CI/CD 트리거"
   git push origin main
   ```

2. **파일 수정**
   - README.md 수정
   - 커밋 및 푸시

## 📋 확인 체크리스트

### Vercel 설정

- [ ] Framework: Next.js
- [ ] Build Command: `pnpm run build`
- [ ] Output Directory: `.next`
- [ ] Install Command: `pnpm install`
- [ ] Node.js Version: 18+

### GitHub 연결

- [ ] Repository 접근 권한
- [ ] GitHub App 설치 상태
- [ ] Webhook 설정
- [ ] Branch 설정 (main)

### 환경 변수

- [ ] NODE_ENV=production
- [ ] NEXT_PUBLIC_APP_NAME
- [ ] 기타 필요한 환경 변수

## 🚀 예방 조치

1. **정기적인 연결 상태 확인**
2. **GitHub App 권한 주기적 갱신**
3. **Vercel 프로젝트 설정 백업**
4. **모니터링 및 알림 설정**

## 📞 지원

문제가 지속되면:

1. Vercel Support 팀 문의
2. GitHub Support 팀 문의
3. 프로젝트 재생성 고려
4. 대안 배포 플랫폼 검토 (Netlify, Railway 등)

## 📝 로그 확인

### Vercel 배포 로그

- Build Logs 확인
- Function Logs 확인
- Error Logs 확인

### GitHub Actions 로그

- Workflow 실행 상태
- Step별 실행 결과
- Error 메시지 분석

---

**생성 시간**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**목적**: CI/CD 문제 해결 및 자동 배포 복구
