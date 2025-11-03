@echo off
echo Building MyFlama Release APK...

echo Step 1: Cleaning project...
cd android
call gradlew clean
cd ..

echo Step 2: Creating bundle...
call npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res

echo Step 3: Building release APK...
cd android
call gradlew assembleRelease
cd ..

echo Step 4: Checking output...
if exist "android\app\build\outputs\apk\release\app-release.apk" (
    echo SUCCESS: APK created at android\app\build\outputs\apk\release\app-release.apk
) else (
    echo ERROR: APK not found
)

pause