param([int]$Port = 5173)

$ErrorActionPreference = 'Stop'
$taskRuntime = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies'
$taskNodeCommand = Get-Command node -ErrorAction SilentlyContinue
$taskNode = if ($taskNodeCommand) { $taskNodeCommand.Source } else { Join-Path $taskRuntime 'node\bin\node.exe' }

Push-Location (Join-Path $PSScriptRoot 'employment-frontend')
try {
    if (-not (Test-Path -LiteralPath 'node_modules\vite')) {
        $taskPnpm = Get-Command pnpm -ErrorAction SilentlyContinue
        $taskPnpmPath = if ($taskPnpm) { $taskPnpm.Source } else { Join-Path $taskRuntime 'bin\fallback\pnpm.cmd' }
        & $taskPnpmPath install --frozen-lockfile
        if ($LASTEXITCODE -ne 0) { throw '의존성 설치에 실패했습니다.' }
    }
    & $taskNode 'node_modules\vite\bin\vite.js' --host 127.0.0.1 --port $Port
} finally {
    Pop-Location
}
