# VS Code 실행

1. 파일 → 폴더 열기로 `C:\JobBridge` 전체 폴더를 엽니다.
2. IntelliJ에서 실행한 서버가 있으면 중지합니다. 두 서버가 동시에 8080을 사용할 수 없습니다.
3. 터미널 → 작업 실행을 누르고 `JobBridge: Start All`을 선택합니다.
4. Backend와 Frontend라는 두 터미널이 열립니다.
5. 백엔드의 `Started EmploymentApplication`과 프런트의 Vite Local 주소를 확인합니다.
6. 프런트가 출력한 주소를 브라우저에서 엽니다. 기본은 `http://127.0.0.1:5173`입니다.

터미널에서 직접 실행하는 경우에도 Java와 프런트를 각각 실행합니다.

```powershell
cd C:\JobBridge
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\start-backend.ps1
```

새 터미널:

```powershell
cd C:\JobBridge
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\start-frontend.ps1
```

기본 백엔드 실행은 application.properties의 실제 MariaDB 설정을 사용합니다.
JWT_SECRET 환경 변수가 없으면 `.tools/local-jwt-secret.txt`에 로컬 실행용 키를 생성해 재사용합니다.
해당 경로는 Git에서 제외됩니다. 키를 출력하거나 채팅에 공유할 필요가 없습니다.
`-ExecutionPolicy Bypass`는 이 명령으로 시작하는 프로세스에만 적용하며 시스템 정책을 변경하지 않습니다.

H2를 명시적으로 선택할 때만 `start-backend.ps1 -Profile dev`를 사용합니다.
`.jsx` 파일의 개별 실행 버튼으로 React 프로젝트를 실행할 수는 없습니다. Vite 개발 서버를 실행해야 합니다.
