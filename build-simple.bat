@echo off
echo Simple APK Build - Bypassing Reanimated Issues

echo Step 1: Clean
cd android
call gradlew clean
cd ..

echo Step 2: Bundle JS
call npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res

echo Step 3: Build APK without native dependencies
cd android
call gradlew :app:assembleRelease -x :react-native-reanimated:buildCMakeRelWithDebInfo
cd ..

echo Checking result...
if exist "android\app\build\outputs\apk\release\app-release.apk" (
    echo SUCCESS: APK created!
    dir "android\app\build\outputs\apk\release\app-release.apk"
) else (
    echo Building without all native modules...
    cd android
    call gradlew :app:assembleRelease --exclude-task buildCMakeRelWithDebInfo
    cd ..
)

pause