Write-Host "Generating MyFlama AAB file for Google Play Store..." -ForegroundColor Green

Write-Host "Step 1: Removing console logs..." -ForegroundColor Yellow
node scripts/remove-console-logs.js

Write-Host "Step 2: Creating React Native bundle..." -ForegroundColor Yellow
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res

Write-Host "Step 3: Generating AAB file..." -ForegroundColor Yellow
Set-Location android
./gradlew bundleRelease

Write-Host "Step 4: AAB file generated successfully!" -ForegroundColor Green
Write-Host "Location: android/app/build/outputs/bundle/release/app-release.aab" -ForegroundColor Cyan

Set-Location ..
Write-Host "Build completed! Check the AAB file location above." -ForegroundColor Green
