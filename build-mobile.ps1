# ============================================================
#  ScreenCast — Mobile Build Script
#  Run this script after making any code changes.
#  Usage: .\build-mobile.ps1
# ============================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ScreenCast Mobile Build Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Build Web
Write-Host "[1/3] Building web project..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\web"
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "" 
    Write-Host "ERROR: Web build failed! Fix the errors above and try again." -ForegroundColor Red
    exit 1
}

Write-Host "  Web build successful!" -ForegroundColor Green

# Step 2: Copy dist to mobile
Write-Host ""
Write-Host "[2/3] Copying build files to mobile..." -ForegroundColor Yellow
$source = "$PSScriptRoot\web\dist"
$dest   = "$PSScriptRoot\mobile\dist"

if (!(Test-Path $dest)) {
    New-Item -ItemType Directory -Path $dest | Out-Null
}

Copy-Item -Path "$source\*" -Destination $dest -Recurse -Force
Write-Host "  Files copied successfully!" -ForegroundColor Green

# Step 3: Capacitor Sync
Write-Host ""
Write-Host "[3/3] Syncing with Android (Capacitor)..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\mobile"
npx cap sync

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: Capacitor sync failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Build & Sync Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps in Android Studio:" -ForegroundColor Cyan
Write-Host "  1. File -> Sync Project with Gradle Files" -ForegroundColor White
Write-Host "  2. Build -> Clean Project" -ForegroundColor White
Write-Host "  3. Build -> Generate Signed Bundle / APK" -ForegroundColor White
Write-Host ""
