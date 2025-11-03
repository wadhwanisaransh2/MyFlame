@echo off
echo Enabling Windows Long Path Support...
echo This requires Administrator privileges

echo Step 1: Enable Long Path Support in Registry
reg add "HKLM\SYSTEM\CurrentControlSet\Control\FileSystem" /v LongPathsEnabled /t REG_DWORD /d 1 /f

echo Step 2: Enable Long Path Support in Git
git config --global core.longpaths true

echo Step 3: Set Environment Variables
setx CMAKE_OBJECT_PATH_MAX 500
setx GRADLE_OPTS "-Dorg.gradle.jvmargs=-Xmx4096m -Dfile.encoding=UTF-8"

echo Long path support enabled! Restart your terminal and try building again.
pause