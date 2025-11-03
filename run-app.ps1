# MyFlama App - Quick Start Script
# Run this script to start the app quickly

Write-Host "🚀 MyFlama App - Quick Start" -ForegroundColor Cyan
Write-Host ""

# Set environment variables
Write-Host "Setting environment variables..." -ForegroundColor Yellow
$env:ANDROID_HOME = "C:\Users\Saran\AppData\Local\Android\Sdk"
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot"
$env:PATH = "$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\tools;$env:JAVA_HOME\bin;$env:PATH"

Write-Host "✅ Environment variables set" -ForegroundColor Green
Write-Host ""

# Check if emulator is running
Write-Host "Checking for emulator..." -ForegroundColor Yellow
$adbPath = "$env:ANDROID_HOME\platform-tools\adb.exe"

if (Test-Path $adbPath) {
    $devices = & $adbPath devices
    if ($devices -match "emulator") {
        Write-Host "✅ Emulator is running" -ForegroundColor Green
    } else {
        Write-Host "⚠️  No emulator detected!" -ForegroundColor Red
        Write-Host "Please start the emulator from Android Studio" -ForegroundColor Yellow
        Write-Host "Press any key to continue once emulator is running..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    }
} else {
    Write-Host "⚠️  ADB not found. Continuing anyway..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Starting app..." -ForegroundColor Yellow
Write-Host ""

# Run the app
npm run android

Write-Host ""
Write-Host "✅ Done!" -ForegroundColor Green
