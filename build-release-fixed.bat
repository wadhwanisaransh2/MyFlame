@echo off
echo Building MyFlama Release APK with Path Fix...

echo Step 1: Setting shorter path environment
set GRADLE_USER_HOME=C:\gradle
set ANDROID_HOME=C:\Android\Sdk

echo Step 2: Cleaning project...
cd android
call gradlew clean
cd ..

echo Step 3: Creating bundle with shorter paths...
call npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res

echo Step 4: Building release APK with universal architecture...
cd android
call gradlew assembleRelease -Dorg.gradle.jvmargs="-Xmx4096m -XX:MaxMetaspaceSize=512m" --no-daemon
cd ..

echo Step 5: Checking output...
if exist "android\app\build\outputs\apk\release\app-release.apk" (
    echo SUCCESS: APK created at android\app\build\outputs\apk\release\app-release.apk
    echo File size:
    dir "android\app\build\outputs\apk\release\app-release.apk"
) else (
    echo ERROR: APK not found, trying universal APK...
    if exist "android\app\build\outputs\apk\release\app-universal-release.apk" (
        echo SUCCESS: Universal APK created at android\app\build\outputs\apk\release\app-universal-release.apk
        dir "android\app\build\outputs\apk\release\app-universal-release.apk"
    ) else (
        echo ERROR: No APK found
    )
)

pause