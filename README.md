# 잡브릿지 · 취업연계 플랫폼

`EmploymentProjectSummary.md`를 바탕으로 만든 한국어 학습·시연용 프로젝트입니다.
구직자의 공고 탐색·지원, 기업의 채용 관리, 관리자의 승인·심사 흐름을 제공합니다.

## 구성

```text
C:\JobBridge\
├── employment-frontend/       React · Vite · 한국어 반응형 화면
│   └── src/
│       ├── api/               axios · CSRF · refresh 재시도
│       ├── components/common/ 폼 · 상태 · 공고 카드 · 권한 Guard
│       ├── pages/             공개 · 구직자 · 기업 · 관리자 화면
│       ├── hooks/             API 조회
│       ├── stores/            인증 상태
│       └── assets/styles/     공통 스타일 · 반응형
├── employment-backend/        Spring Boot · Gradle Wrapper
│   └── src/
│       ├── main/java/com/employment/
│       │   ├── auth/          JWT · 로그인 · 회원가입
│       │   ├── job/           Controller · 업무 Service
│       │   ├── admin/         운영 API
│       │   └── global/        보안 · Repository · 입력 검증 · 오류
│       ├── main/resources/db/migration/
│       └── test/              격리된 H2 통합 테스트
├── docs/                      실행 · API · 결정 사항 · 검증 기록
├── start-backend.ps1
├── start-frontend.ps1
├── .editorconfig
└── .env.example
```

## 실행

JDK 17, Node.js 22.12 이상, npm 또는 pnpm이 필요합니다.
이 환경에서는 번들 Node.js와 pnpm을 자동으로 찾는 PowerShell 실행 파일을 제공합니다.

서로 다른 터미널에서 실행하세요.

```powershell
cd C:\JobBridge
.\start-backend.ps1
```

```powershell
cd C:\JobBridge
.\start-frontend.ps1
```

기본 접속 주소: <http://127.0.0.1:5173>.
5173을 사용 중이면 Vite가 출력하는 주소로 접속하세요.
현재 작업 중 열어 둔 미리보기는 <http://127.0.0.1:5174>입니다.

현재 `start-backend.ps1`의 기본 실행은 사용자가 설정한 `application.properties`의 MariaDB를 사용합니다.
VS Code에서는 **터미널 → 작업 실행 → JobBridge: Start All**로 서버와 화면을 함께 시작할 수 있습니다.
프로젝트 루트 `C:\JobBridge`를 폴더로 열어야 작업 목록이 표시됩니다.
IntelliJ에서 실행한 백엔드가 있다면 먼저 종료하세요.

H2를 사용하려면 `./start-backend.ps1 -Profile dev`로 명시합니다.
H2 개발 모드는 MySQL 설치 없이 H2 파일 DB를 사용합니다.
데이터는 `employment-backend/data/`에 남으며 재시작해도 유지됩니다.
첫 실행에서만 개발 샘플이 생성됩니다. 기존 데이터는 삭제하지 않습니다.

| 유형 | 이메일 | 개발용 비밀번호 |
|---|---|---|
| 구직자 | seeker@jobbridge.local | JobBridge123! |
| 기업 | company@jobbridge.local | JobBridge123! |
| 관리자 | admin@jobbridge.local | JobBridge123! |

샘플은 `dev` 프로필에서 `DEV_SEED_PASSWORD`를 설정하고 DB에 회원이 없을 때만 생성합니다.
실제 서비스에는 위 개발 계정을 사용하지 마세요.

## 구현 기능

- 구직자·기업 회원가입, JWT HttpOnly 쿠키, CSRF, refresh 회전, 로그아웃, 비밀번호 변경과 세션 취소.
- 공개 공고 검색·지역·고용형태·경력 필터·페이지 이동, 공개 기업·공지 조회.
- 본인 이력서 생성·수정·삭제, 기본 지정, 관심 공고, 제출 시점 이력서 스냅샷.
- 기간·소유권·기업 승인·중복 검증을 거치는 입사 지원, 진행 상태와 면접 조회, 지원 취소.
- 기업 프로필, 공고 초안·심사 요청·마감, 지원자 상세와 상태 처리, 면접 등록.
- 관리자 회원 정지·해제, 기업 승인·반려, 공고 심사, 연계 진행, 공지와 문의 답변.
- 취업연계 신청, 공개 안내와 내부 메모 분리, 본인 알림 읽음 처리.
- JSX·Java 코드 포맷과 들여쓰기, 모바일 레이아웃, 키보드 포커스, 오류·로딩·빈 상태.

지원 단계는 `APPLIED → UNDER_REVIEW → DOCUMENT_PASSED → INTERVIEW → FINAL_PASSED`입니다.
각 진행 단계에서 불합격 처리 또는 구직자 취소가 가능하며, 취소 후 재지원은 허용하지 않습니다.

## 검증

```powershell
cd C:\JobBridge\employment-backend
.\gradlew.bat test

cd C:\JobBridge\employment-frontend
pnpm run lint
pnpm run build
pnpm run format
```

검증 범위와 실제 결과는 [docs/verification.md](docs/verification.md)에 기록했습니다.

## 적용 기준과 남은 범위

원본 네 파일은 제공되지 않았으므로 첨부 개요서의 12개 테이블과 상태 정의를 사용했습니다.
실제 원본 DB와 비교·병합하기 전에는 기존 데이터베이스에 migration을 바로 적용하지 마세요.

현재 데이터 접근은 잠금과 SQL 제약을 직접 확인할 수 있는 Spring JDBC Repository입니다.
개요서의 JPA Entity/DTO 도메인 분할 제안과 다른 부분은 [docs/decisions.md](docs/decisions.md)에 기록했습니다.

SMTP 비밀번호 재설정 메일은 미설정 상태를 정확히 안내하며 503을 반환합니다.
면접 수정·완료·취소는 API가 있고, 기업 화면에서는 현재 등록·조회만 제공합니다.
기업·관리자 대량 목록의 서버 페이지 처리, 원본 SQL 대조, MySQL 실서버 검증,
운영 배포·HTTPS·개인정보 보관 정책은 추가 작업 범위입니다.

자세한 설정은 [docs/setup.md](docs/setup.md), API는 [docs/api.md](docs/api.md)를 참고하세요.
