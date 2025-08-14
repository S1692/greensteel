# Vercel 배포 가이드

## 1. 사전 준비사항

### 1.1 Vercel 계정 및 프로젝트

- [Vercel](https://vercel.com)에 가입
- GitHub/GitLab/Bitbucket 계정 연결
- 새 프로젝트 생성

### 1.2 도메인 설정

- 가비아에서 `greensteel.site` 도메인 구매
- 도메인 DNS 설정 준비

## 2. Vercel 프로젝트 설정

### 2.1 프로젝트 생성

```bash
# 로컬에서 Vercel CLI 설치
npm i -g vercel

# 프로젝트 디렉토리에서
vercel login
vercel
```

### 2.2 빌드 설정

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

## 3. 환경 변수 설정

### 3.1 Vercel 대시보드에서 설정

Vercel 프로젝트 설정 → Environment Variables에서 다음 변수들을 추가:

```bash
# 필수 변수
NEXT_PUBLIC_GATEWAY_URL=https://api.greensteel.site

# 선택적 변수
NEXT_PUBLIC_ENV=production
NEXT_PUBLIC_APP_NAME=greensteel
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_ENABLE_LCA=true
NEXT_PUBLIC_ENABLE_CBAM=true
NEXT_PUBLIC_ENABLE_DATA_UPLOAD=true
```

### 3.2 환경별 설정

- **Production**: 모든 환경에서 사용
- **Preview**: `NEXT_PUBLIC_ENV=staging`으로 설정
- **Development**: `NEXT_PUBLIC_ENV=development`으로 설정

## 4. 도메인 연결

### 4.1 Vercel에서 도메인 추가

1. 프로젝트 설정 → Domains
2. `greensteel.site` 추가
3. DNS 설정 안내 확인

### 4.2 DNS 설정 (가비아)

가비아 DNS 관리에서 다음 레코드 추가:

```
Type: A
Name: @
Value: 76.76.19.76

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 4.3 SSL 인증서

- Vercel에서 자동으로 Let's Encrypt SSL 인증서 발급
- HTTPS 리다이렉트 자동 설정

## 5. 배포 확인

### 5.1 빌드 로그 확인

- Vercel 대시보드 → Deployments
- 빌드 과정에서 오류 확인
- 성공적으로 배포되었는지 확인

### 5.2 기능 테스트

배포 후 다음 기능들이 정상 작동하는지 확인:

- [ ] 랜딩 페이지 접속
- [ ] 회원가입/로그인
- [ ] 대시보드 로드
- [ ] LCA/CBAM 페이지
- [ ] 데이터 업로드
- [ ] Google Analytics 추적

## 6. 성능 최적화

### 6.1 Vercel Analytics

- 프로젝트 설정 → Analytics 활성화
- Core Web Vitals 모니터링

### 6.2 이미지 최적화

- Next.js Image 컴포넌트 사용
- WebP/AVIF 포맷 지원
- CDN을 통한 전역 배포

### 6.3 캐싱 전략

- 정적 자산 캐싱
- API 응답 캐싱
- ISR(Incremental Static Regeneration) 활용

## 7. 모니터링 및 유지보수

### 7.1 로그 모니터링

- Vercel Functions 로그
- 에러 추적 및 알림
- 성능 메트릭 수집

### 7.2 자동 배포

- Git 브랜치별 자동 배포
- Preview 배포로 테스트
- Production 배포 전 검증

## 8. 문제 해결

### 8.1 빌드 실패

```bash
# 로컬에서 빌드 테스트
npm run build

# 의존성 문제 확인
rm -rf node_modules package-lock.json
npm install
```

### 8.2 환경 변수 문제

- Vercel 대시보드에서 변수 확인
- 변수명 철자 확인
- NEXT*PUBLIC* 접두사 확인

### 8.3 도메인 연결 문제

- DNS 전파 대기 (최대 48시간)
- DNS 레코드 정확성 확인
- Vercel 도메인 설정 재확인

## 9. 보안 설정

### 9.1 CSP 헤더

- `next.config.js`에서 CSP 설정
- Google Analytics 도메인 허용
- XSS 방지 헤더 설정

### 9.2 환경 변수 보안

- 민감한 정보는 서버 사이드에서만 사용
- 클라이언트 사이드 변수는 NEXT*PUBLIC* 접두사 사용
- API 키는 Gateway를 통해서만 접근

## 10. 백업 및 복구

### 10.1 코드 백업

- Git 저장소 백업
- 정기적인 코드 스냅샷
- 배포 전 롤백 계획

### 10.2 데이터 백업

- 사용자 데이터 백업
- 설정 파일 백업
- 환경 변수 백업

---

## 배포 체크리스트

- [ ] Vercel 프로젝트 생성
- [ ] 환경 변수 설정
- [ ] 도메인 연결
- [ ] SSL 인증서 발급
- [ ] 빌드 성공 확인
- [ ] 기능 테스트 완료
- [ ] Google Analytics 연동 확인
- [ ] 성능 최적화 적용
- [ ] 모니터링 설정
- [ ] 백업 전략 수립

배포가 완료되면 `https://greensteel.site`에서 애플리케이션에 접속할 수 있습니다.
