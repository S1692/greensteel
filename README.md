# GreenSteel LCA Frontend

Life Cycle Assessment for Steel Industry - Frontend Application

## 🚀 시작하기

이 프로젝트는 **pnpm**을 패키지 매니저로 사용합니다.

### 필수 요구사항

- Node.js 18+
- pnpm 8+

### 설치

```bash
# 의존성 설치
pnpm install
```

### 개발 서버 실행

```bash
# 개발 모드로 실행
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 빌드

```bash
# 프로덕션 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start
```

### 린팅

```bash
# 코드 린팅
pnpm lint
```

## 🏗️ Atomic Design 아키텍처

이 프로젝트는 **Atomic Design** 패턴을 따릅니다:

### 📁 컴포넌트 구조

```text
frontend/
├── app/                    # Next.js App Router
├── components/             # React 컴포넌트
│   ├── ui/                # 🎨 UI 컴포넌트 (shadcn/ui 기반)
│   │   ├── button.tsx     # 기본 버튼 (variant, size 등)
│   │   ├── card.tsx       # 기본 카드 (header, content, footer)
│   │   ├── input.tsx      # 기본 입력 필드
│   │   └── ...
│   ├── atoms/             # ⚛️ Atoms (비즈니스 로직 포함)
│   │   ├── Button.tsx     # 로딩, 아이콘, 에러 처리 등
│   │   ├── Card.tsx       # 클릭 가능, 호버 효과 등
│   │   ├── Input.tsx      # 라벨, 에러, 헬퍼 텍스트 등
│   │   └── ...
│   ├── molecules/         # 🧬 Molecules (Atoms 조합)
│   │   ├── FieldRow.tsx   # 라벨 + 입력 필드
│   │   ├── KeyValueRow.tsx # 키-값 쌍 표시
│   │   └── ...
│   ├── organisms/         # 🦠 Organisms (페이지 섹션)
│   │   ├── ProjectList.tsx # 프로젝트 목록
│   │   ├── ProductInfoForm.tsx # 제품 정보 폼
│   │   └── ...
│   ├── templates/         # 📄 Templates (페이지 레이아웃)
│   │   ├── StepTemplate.tsx # 단계별 페이지 템플릿
│   │   └── ReportTemplate.tsx # 보고서 템플릿
│   └── layout/            # 🏠 레이아웃 컴포넌트
│       ├── Navbar.tsx     # 네비게이션 바
│       ├── Sidebar.tsx    # 사이드바
│       └── ...
├── lib/                   # 유틸리티 및 타입
├── hooks/                 # 커스텀 훅
└── public/               # 정적 파일
```

### 🔄 컴포넌트 계층 구조

```text
UI Components (shadcn/ui)
    ↓ (기반)
Atoms (비즈니스 로직)
    ↓ (조합)
Molecules (복합 컴포넌트)
    ↓ (조합)
Organisms (페이지 섹션)
    ↓ (조합)
Templates (페이지 레이아웃)
    ↓ (조합)
Pages (실제 페이지)
```

### 📦 컴포넌트 사용법

```typescript
// UI 컴포넌트 (기본)
import { Button } from "@/components/ui/button"

// Atoms (비즈니스 로직 포함)
import { Button } from "@/components/atoms/Button"

// Molecules (복합)
import { FieldRow } from "@/components/molecules/FieldRow"

// Organisms (섹션)
import { ProjectList } from "@/components/organisms/ProjectList"
```

## 🛠 기술 스택

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Package Manager**: pnpm
- **Animation**: Framer Motion
- **Form**: React Hook Form + Zod
- **Architecture**: Atomic Design

## 📦 패키지 관리

### 새 패키지 설치

```bash
# 의존성 추가
pnpm add <package-name>

# 개발 의존성 추가
pnpm add -D <package-name>
```

### 패키지 제거

```bash
pnpm remove <package-name>
```

### 패키지 업데이트

```bash
# 모든 패키지 업데이트
pnpm update

# 특정 패키지 업데이트
pnpm update <package-name>
```

## 🔧 개발 팁

1. **Atomic Design 원칙**: UI → Atoms → Molecules → Organisms → Templates 순서로 개발
2. **UI 컴포넌트**: shadcn/ui 기반의 순수한 스타일링 컴포넌트
3. **Atoms**: 비즈니스 로직이 포함된 기본 컴포넌트
4. **TypeScript**: 모든 컴포넌트는 TypeScript로 작성
5. **스타일링**: Tailwind CSS 클래스 우선 사용

## 🐛 문제 해결

### pnpm 관련 문제

```bash
# 캐시 정리
pnpm store prune

# node_modules 재설치
rm -rf node_modules
pnpm install
```

### 빌드 오류

```bash
# Next.js 캐시 정리
rm -rf .next
pnpm build
```

### 컴포넌트 충돌

```bash
# 중복 컴포넌트 확인
grep -r "import.*from.*components" src/

# 불필요한 의존성 제거
pnpm remove <unused-package>
```
