# 🚀 How to Run MyFlama App

## Prerequisites

Before running the app, ensure you have the following installed:

### Required Software
- ✅ **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- ✅ **npm** or **yarn** package manager
- ✅ **Android Studio** (for Android development)
- ✅ **Xcode** (for iOS development - Mac only)
- ✅ **JDK 17** (Java Development Kit)
- ✅ **React Native CLI** - Install globally: `npm install -g react-native-cli`

### Android Requirements
- Android SDK
- Android Emulator or Physical Device
- USB Debugging enabled (for physical device)

### iOS Requirements (Mac only)
- Xcode 14 or higher
- CocoaPods - Install: `sudo gem install cocoapods`
- iOS Simulator or Physical Device

---

## 📦 Step 1: Install Dependencies

First, install all the required npm packages:

```bash
npm install
```

Or if you prefer yarn:

```bash
yarn install
```

**Note:** This will install all dependencies including:
- React Native 0.78.0
- Redux Toolkit
- React Navigation
- Socket.io
- Firebase
- Google Sign-In
- And many more...

---

## 🔧 Step 2: Setup Configuration

### 2.1 Google Services Configuration

The project already has `google-services.json` configured. Verify it exists:
- **Android:** `android/app/google-services.json`

### 2.2 Environment Variables

Check if you need to configure any API endpoints in:
- `src/Service/config.ts`

---

## 📱 Step 3: Running on Android

### Option A: Using Metro Bundler (Recommended for Development)

**Terminal 1 - Start Metro Bundler:**
```bash
npm start
```
or
```bash
npx react-native start
```

**Terminal 2 - Run Android App:**
```bash
npm run android
```
or
```bash
npx react-native run-android
```

### Option B: Direct Run (Single Command)
```bash
npm run android
```

### Option C: Build Debug APK (Windows)
```bash
npm run debugbuildW
```

This will create a debug APK at:
`android/app/build/outputs/apk/debug/app-debug.apk`

### Option D: Build Release APK (Windows)
```bash
npm run releasebuildW
```

This will create a release APK at:
`android/app/build/outputs/apk/release/app-release.apk`

---

## 🍎 Step 4: Running on iOS (Mac Only)

### 4.1 Install iOS Dependencies
```bash
cd ios
pod install
cd ..
```

### 4.2 Run iOS App

**Terminal 1 - Start Metro Bundler:**
```bash
npm start
```

**Terminal 2 - Run iOS App:**
```bash
npm run ios
```

Or run on specific simulator:
```bash
npx react-native run-ios --simulator="iPhone 15 Pro"
```

---

## 🛠️ Troubleshooting

### Issue 1: Metro Bundler Port Already in Use
```bash
# Kill the process on port 8081
npx react-native start --reset-cache
```

### Issue 2: Android Build Fails
```bash
# Clean Android build
cd android
./gradlew clean
cd ..

# Or use the npm script
npm run gradleClean
```

### Issue 3: Dependencies Not Found
```bash
# Clear npm cache and reinstall
rm -rf node_modules
npm cache clean --force
npm install
```

### Issue 4: iOS Build Fails
```bash
# Clean iOS build
cd ios
rm -rf Pods
rm Podfile.lock
pod install
cd ..
```

### Issue 5: Google Sign-In Not Working
- Verify `google-services.json` is in `android/app/`
- Check SHA-1 certificate fingerprint is added to Firebase Console
- Ensure Google Sign-In is enabled in Firebase Console

### Issue 6: Socket Connection Issues
- Check `SOCKET_URL` in `src/Service/config.ts`
- Ensure backend server is running
- Check network connectivity

---

## 🔍 Development Commands

### Start Metro Bundler
```bash
npm start
```

### Run on Android
```bash
npm run android
```

### Run on iOS (Mac only)
```bash
npm run ios
```

### Run Linter
```bash
npm run lint
```

### Run Tests
```bash
npm test
```

### Clean Android Build
```bash
npm run gradleClean
```

### Build Production APK
```bash
npm run build:production
```

---

## 📱 Testing on Physical Device

### Android Physical Device

1. **Enable Developer Options:**
   - Go to Settings > About Phone
   - Tap "Build Number" 7 times

2. **Enable USB Debugging:**
   - Go to Settings > Developer Options
   - Enable "USB Debugging"

3. **Connect Device:**
   - Connect via USB cable
   - Accept USB debugging prompt on device

4. **Verify Device:**
   ```bash
   adb devices
   ```

5. **Run App:**
   ```bash
   npm run android
   ```

### iOS Physical Device (Mac only)

1. **Connect Device via USB**

2. **Open Xcode:**
   ```bash
   open ios/MyFlamaApp.xcworkspace
   ```

3. **Select Your Device** in Xcode

4. **Configure Signing:**
   - Select your development team
   - Ensure provisioning profile is set

5. **Run from Xcode** or:
   ```bash
   npx react-native run-ios --device
   ```

---

## 🎯 Quick Start Guide

### For First Time Setup:

```bash
# 1. Install dependencies
npm install

# 2. Start Metro Bundler (Terminal 1)
npm start

# 3. Run on Android (Terminal 2)
npm run android
```

### For Daily Development:

```bash
# Terminal 1 - Keep Metro running
npm start

# Terminal 2 - Run app when needed
npm run android
```

---

## 🔥 Features to Test After Running

1. **Authentication**
   - ✅ Regular Login (username/password)
   - ✅ Google Sign-In
   - ✅ Sign Up
   - ✅ Forgot Password

2. **Main Features**
   - ✅ Home Feed
   - ✅ Reels/Shorts
   - ✅ Map (Nearby Users)
   - ✅ Events/Leaderboard
   - ✅ Profile

3. **Social Features**
   - ✅ Posts (Create, Like, Comment)
   - ✅ Friends (Add, Remove, Block)
   - ✅ Chat (Real-time messaging)
   - ✅ Notifications

4. **Coins System**
   - ✅ View Coins Balance
   - ✅ Send Coins
   - ✅ Watch Ads for Coins
   - ✅ Referral System

---

## 📊 Build Variants

### Debug Build (Development)
- Includes debugging tools
- Connects to Metro bundler
- Hot reload enabled
```bash
npm run android
```

### Release Build (Production)
- Optimized for performance
- No debugging tools
- Standalone APK
```bash
npm run releasebuildW
```

---

## 🌐 Backend Configuration

Ensure your backend server is running and accessible. Check these files:

1. **API Base URL:** `src/Service/config.ts`
   ```typescript
   export const BASE_URL = 'YOUR_API_URL';
   export const SOCKET_URL = 'YOUR_SOCKET_URL';
   ```

2. **Endpoints:** `src/Constants/endpoints.ts`

---

## 📝 Important Notes

1. **First Run:** The first build may take 10-15 minutes as it downloads dependencies
2. **Metro Bundler:** Keep it running in a separate terminal during development
3. **Hot Reload:** Press `R` twice in the app to reload, or shake device for dev menu
4. **Logs:** Use `npx react-native log-android` or `npx react-native log-ios` to view logs
5. **Google Login:** Only works on Android (as per current configuration)

---

## 🆘 Getting Help

If you encounter issues:

1. Check the error message in Metro bundler terminal
2. Check Android Logcat: `adb logcat`
3. Clear cache: `npm start -- --reset-cache`
4. Rebuild: `npm run gradleClean && npm run android`
5. Check `BUG_FIXES_SUMMARY.md` for known issues

---

## ✅ Verification Checklist

Before running, ensure:
- [ ] Node.js is installed
- [ ] Android Studio is installed (for Android)
- [ ] Android SDK is configured
- [ ] USB Debugging is enabled (for physical device)
- [ ] `npm install` completed successfully
- [ ] `google-services.json` exists in `android/app/`
- [ ] Backend server is running (if applicable)

---

## 🎉 Success!

If everything is set up correctly, you should see:
1. Metro bundler running in Terminal 1
2. App building in Terminal 2
3. App launching on your device/emulator
4. Splash screen → Login screen

**Enjoy developing with MyFlama App! 🔥**

---

**Last Updated:** November 1, 2025
**React Native Version:** 0.78.0
**Platform:** Android (Primary), iOS (Secondary)
