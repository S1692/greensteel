# 🚨 **즉시 문제 해결 가이드**

## 📋 **현재 발생 중인 문제들**

### **1. Manifest 401 오류**

```
Failed to load resource: the server responded with a status of 401 ()
Manifest fetch failed, code 401
```

### **2. 카카오 지도 API 스크립트 로드 실패**

```
카카오 지도 API 스크립트 로드 실패
```

## 🔧 **즉시 해결 방법**

### **1단계: Vercel 환경 변수 확인**

#### **1.1 Vercel 대시보드 접속**

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. **GreenSteel 프로젝트** 선택
3. **Settings** 탭 클릭

#### **1.2 환경 변수 확인**

1. **Environment Variables** 섹션 클릭
2. 다음 변수가 있는지 확인:
   - `NEXT_PUBLIC_KAKAO_MAP_API_KEY`
   - 값이 `your_key_here` 또는 `undefined`가 아닌지 확인

#### **1.3 환경 변수 수정 (필요한 경우)**

1. **Edit** 버튼 클릭
2. **Value** 필드에 실제 카카오 JavaScript 키 입력
3. **Environment** 모든 체크박스 선택 (Production, Preview, Development)
4. **Save** 클릭

### **2단계: Vercel 재배포**

#### **2.1 Redeploy 실행**

1. **Deployments** 탭 클릭
2. **Redeploy** 버튼 클릭
3. 배포 완료까지 대기 (보통 2-3분)

#### **2.2 배포 확인**

1. **Visit** 버튼으로 새로 배포된 사이트 접속
2. URL이 새로운 해시로 변경되었는지 확인

### **3단계: 브라우저 캐시 삭제**

#### **3.1 하드 리프레시**

- **Windows**: `Ctrl + F5` 또는 `Ctrl + Shift + R`
- **Mac**: `Cmd + Shift + R`

#### **3.2 개발자 도구에서 캐시 삭제**

1. **F12** 키로 개발자 도구 열기
2. **Network** 탭 클릭
3. **Disable cache** 체크박스 선택
4. 페이지 새로고침

### **4단계: 디버깅 페이지 확인**

#### **4.1 디버깅 페이지 접속**

```
https://your-vercel-domain.vercel.app/debug
```

#### **4.2 상태 확인**

- ✅ **환경 변수 상태**: 모든 변수가 올바르게 설정되었는지 확인
- ✅ **카카오 API 상태**: API가 정상적으로 로드되었는지 확인
- ✅ **문제 해결 가이드**: 구체적인 해결 방법 확인

## 🗺️ **카카오 API 키 설정**

### **1. 카카오 개발자 계정 생성**

1. [Kakao Developers](https://developers.kakao.com/) 접속
2. 카카오 계정으로 로그인
3. **내 애플리케이션** → **애플리케이션 추가하기**

### **2. 애플리케이션 설정**

1. **앱 이름**: `GreenSteel`
2. **회사명**: 회사명 입력
3. **생성** 버튼 클릭

### **3. 플랫폼 설정**

1. **플랫폼** → **Web** → **사이트 도메인** 추가
2. **도메인 등록**:
   - `localhost:3000` (개발용)
   - `https://your-vercel-domain.vercel.app` (프로덕션용)

### **4. JavaScript 키 복사**

1. **앱 키** → **JavaScript 키** 복사
2. 32자리 문자열인지 확인

## ❌ **일반적인 실수들**

### **1. 환경 변수 이름 오타**

```bash
# ❌ 잘못된 이름들
KAKAO_MAP_API_KEY
NEXT_PUBLIC_KAKAO_API_KEY
KAKAO_API_KEY

# ✅ 올바른 이름
NEXT_PUBLIC_KAKAO_MAP_API_KEY
```

### **2. 환경 변수 값 문제**

```bash
# ❌ 잘못된 값들
your_key_here
undefined
(빈 값)
YOUR_KAKAO_MAP_API_KEY

# ✅ 올바른 값
1234567890abcdef1234567890abcdef
```

### **3. 재배포 누락**

- 환경 변수를 수정한 후 **반드시 Redeploy** 필요
- 변경사항이 즉시 반영되지 않음

### **4. 도메인 설정 누락**

- 카카오 개발자 콘솔에서 Vercel 도메인 등록 필요
- `localhost:3000`만 등록하면 프로덕션에서 작동하지 않음

## 🔍 **문제 진단 방법**

### **1. 브라우저 콘솔 확인**

```javascript
// 브라우저 개발자 도구 → Console 탭에서 실행
console.log('카카오 API 키:', process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY);
console.log('API 키 길이:', process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY?.length);
```

### **2. 네트워크 탭 확인**

1. **F12** → **Network** 탭
2. 페이지 새로고침
3. `dapi.kakao.com` 요청 상태 확인
4. 401, 403, 404 오류 확인

### **3. 디버깅 페이지 활용**

- `/debug` 페이지에서 모든 상태 한눈에 확인
- 환경 변수, API 상태, 문제 해결 가이드 제공

## ✅ **성공 확인 방법**

### **1. Manifest 401 오류 해결**

- 브라우저 콘솔에서 401 오류 메시지 사라짐
- PWA 기능 정상 작동

### **2. 카카오 지도 API 정상 작동**

- 주소 검색 버튼 클릭 시 지도 모달 정상 열림
- 지도 위에서 클릭 시 주소 정보 정상 표시
- 주소 선택 시 폼 필드 자동 입력

### **3. 콘솔 오류 제거**

- 모든 JavaScript 오류 메시지 사라짐
- 정상적인 로그 메시지만 표시

## 🆘 **여전히 문제가 발생하는 경우**

### **1. Vercel 지원팀 문의**

- [Vercel Support](https://vercel.com/support) 접속
- 프로젝트 ID와 함께 문제 상세 설명

### **2. 카카오 개발자 지원**

- [Kakao Developers Support](https://developers.kakao.com/support) 접속
- API 키 및 도메인 설정 문제 문의

### **3. GitHub Issues**

- 프로젝트 저장소에 이슈 등록
- 상세한 오류 로그와 함께 문제 설명

---

## 📞 **즉시 도움이 필요한 경우**

**디버깅 페이지**: `/debug` 접속하여 상태 확인
**문서**: `KAKAO_API_SETUP.md` 참조
**가이드**: 이 문서의 단계별 해결 방법 따라하기

**모든 단계를 완료하면 문제가 해결될 것입니다!** 🎉
