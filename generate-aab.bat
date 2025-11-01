@echo off
echo Generating MyFlama AAB file for Google Play Store...

echo Step 1: Removing console logs...
node scripts/remove-console-logs.js

echo Step 2: Creating React Native bundle...
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res

echo Step 3: Generating AAB file...
cd android
gradlew bundleRelease

echo Step 4: AAB file generated successfully!
echo Location: android/app/build/outputs/bundle/release/app-release.aab

pause
