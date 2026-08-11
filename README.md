# certimate-manager-frontend

Vite + React (JavaScript) 기반 프론트엔드입니다.

## 기술 스택
- React 19
- Vite
- react-router-dom (라우팅)
- axios (API 통신)

## 폴더 구조
```
src
 ├─ api/                 axios 인스턴스, 도메인별 API 함수 (client.js, exampleApi.js)
 ├─ components/common/    공통 컴포넌트 (Header 등)
 ├─ pages/                라우트 단위 페이지 컴포넌트
 ├─ routes/               라우터 설정 (AppRouter.jsx)
 ├─ hooks/                커스텀 훅
 ├─ store/                전역 상태 관리 (도입 시: zustand, redux 등)
 ├─ constants/            상수
 └─ styles/               공통 스타일
```
`exampleApi.js` / `pages/HomePage.jsx` / `routes/AppRouter.jsx` 는 백엔드 `ExampleController`와 짝을 이루는
API 연동 + 라우팅 패턴 예시입니다. 실제 화면 개발 시 이 패턴을 참고해 페이지/API를 추가해 주세요.

## 로컬 개발 환경 설정

### 1. 사전 요구사항
- Node.js 20+

### 2. 설치
```bash
npm install
```

### 3. 환경 변수
`.env.example`을 참고해 `.env`를 생성하세요 (이미 로컬 기본값으로 생성되어 있습니다).
```
VITE_API_BASE_URL=http://localhost:8080/api
```
백엔드(certimate-manager-backend)를 먼저 로컬에서 실행해두어야 API 연동이 정상 동작합니다.

### 4. 개발 서버 실행
```bash
npm run dev
```

### 5. 빌드 / 미리보기
```bash
npm run build
npm run preview
```

### 6. Lint
```bash
npm run lint
```

## 브랜치 전략 (제안)
- `main`: 배포 가능한 상태만 유지
- `develop`: 다음 릴리즈를 위한 통합 브랜치
- `feature/{이슈번호}-{설명}`: 기능 개발 브랜치, PR로 develop에 머지
