# Pack a prebuilt Next.js frontend for cPanel upload (when server cannot npm run build).
# Usage (PowerShell, from gazatna-frontend):
#   $env:NEXT_PUBLIC_API_URL = "https://api.gzs.edu.ps/api"   # عدّل الرابط أولاً!
#   .\scripts\pack-cpanel-build.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

if (-not $env:NEXT_PUBLIC_API_URL) {
  Write-Host "ERROR: Set NEXT_PUBLIC_API_URL before packing." -ForegroundColor Red
  Write-Host 'Example: $env:NEXT_PUBLIC_API_URL = "https://api.gzs.edu.ps/api"'
  exit 1
}

Write-Host "API URL: $env:NEXT_PUBLIC_API_URL" -ForegroundColor Cyan
Write-Host "Building locally..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$outZip = Join-Path $root "cpanel-frontend-build-$stamp.zip"

if (Test-Path $outZip) { Remove-Item $outZip -Force }

Write-Host "Zipping production .next (excluding .next/dev cache) + public + package files..." -ForegroundColor Cyan
$stage = Join-Path $root ".cpanel-pack-stage"
if (Test-Path $stage) { Remove-Item $stage -Recurse -Force }
New-Item -ItemType Directory -Path $stage | Out-Null

# Copy .next without huge Turbopack/dev cache (~GBs)
$nextStage = Join-Path $stage ".next"
New-Item -ItemType Directory -Path $nextStage | Out-Null
Get-ChildItem (Join-Path $root ".next") -Force | Where-Object {
  $_.Name -notin @("dev", "cache", "diagnostics")
} | ForEach-Object {
  Copy-Item -Recurse $_.FullName (Join-Path $nextStage $_.Name)
}

Copy-Item -Recurse (Join-Path $root "public") (Join-Path $stage "public")
Copy-Item (Join-Path $root "package.json") $stage
Copy-Item (Join-Path $root "package-lock.json") $stage
Copy-Item (Join-Path $root "next.config.ts") $stage
if (Test-Path (Join-Path $root ".env.production")) {
  Copy-Item (Join-Path $root ".env.production") $stage
}

Compress-Archive -Path (Join-Path $stage "*") -DestinationPath $outZip -Force
Remove-Item $stage -Recurse -Force

$zipMb = [math]::Round((Get-Item $outZip).Length / 1MB, 1)
Write-Host ""
Write-Host "OK: $outZip ($zipMb MB)" -ForegroundColor Green
Write-Host "Upload this ZIP to gazatna-frontend on cPanel, extract over existing files,"
Write-Host "then on the server run: npm install --omit=dev   &&   npm run start"
Write-Host "(Restart from Setup Node.js App after that.)"
