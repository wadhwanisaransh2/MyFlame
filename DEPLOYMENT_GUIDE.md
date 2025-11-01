# MyFlama App - Production Deployment Guide

## Prerequisites

1. **Node.js**: Version 18 or higher
2. **React Native CLI**: Latest version
3. **Android Studio**: Latest version with SDK 35
4. **Java Development Kit**: JDK 17 or higher
5. **Xcode**: Latest version (for iOS builds)

## Security Configuration

### 1. Google Maps API Key
- Replace `your_google_maps_api_key_here` in `android/gradle.properties` with your actual Google Maps API key
- Ensure the API key has proper restrictions for Android apps

### 2. Release Keystore Setup
1. Generate a new keystore for release builds:
```bash
keytool -genkey -v -keystore myflama-release-key.keystore -alias myflama-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

2. Update `android/gradle.properties` with your keystore details:
```
MYAPP_UPLOAD_STORE_FILE=myflama-release-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=myflama-key-alias
MYAPP_UPLOAD_STORE_PASSWORD=your_actual_password
MYAPP_UPLOAD_KEY_PASSWORD=your_actual_password
```

3. Place the keystore file in `android/app/` directory

## Build Process

### Development Build
```bash
npm run android
```

### Production Build (Android)
```bash
npm run build:production
```

### Production Build (iOS)
```bash
npm run build:ios
```

## Performance Optimizations Applied

1. **Hermes Engine**: Enabled for better performance
2. **ProGuard**: Enabled for code obfuscation and size reduction
3. **Console Log Removal**: Automatic removal of console logs in production builds
4. **Bundle Optimization**: Optimized bundle generation

## Play Store Deployment Checklist

### Before Uploading to Play Store:

1. **Test the Release Build**
   - Install the release APK on a physical device
   - Test all major features
   - Verify performance is acceptable

2. **Security Verification**
   - Ensure no sensitive data in logs
   - Verify API keys are properly configured
   - Check that ProGuard is working correctly

3. **App Bundle Generation**
   ```bash
   cd android && ./gradlew bundleRelease
   ```
   - The AAB file will be generated in `android/app/build/outputs/bundle/release/`

4. **Version Management**
   - Update `versionCode` and `versionName` in `android/app/build.gradle`
   - Current version: 1.0.2 (versionCode: 3)

### Play Store Console Setup:

1. **App Information**
   - App name: MyFlama
   - Package name: com.myflamaapp

2. **Required Permissions** (already configured):
   - Internet
   - Camera
   - Location (Fine & Coarse)
   - Storage (Read/Write)
   - Microphone
   - Notifications

3. **Content Rating**: Configure based on your app content

4. **Privacy Policy**: Required for apps with user data collection

## Troubleshooting

### Common Issues:

1. **Build Failures**
   - Clean project: `npm run gradleClean`
   - Clear Metro cache: `npx react-native start --reset-cache`

2. **Keystore Issues**
   - Ensure keystore file exists in correct location
   - Verify passwords are correct
   - Check keystore alias matches configuration

3. **API Key Issues**
   - Verify Google Maps API key is valid
   - Check API key restrictions in Google Cloud Console

### Performance Issues:

1. **Large Bundle Size**
   - ProGuard is enabled to reduce size
   - Hermes engine improves performance
   - Consider removing unused dependencies

2. **Memory Issues**
   - Monitor memory usage in production
   - Consider implementing lazy loading for heavy components

## Monitoring and Analytics

- Firebase Analytics is configured
- AdMob is integrated for monetization
- Consider adding crash reporting (Firebase Crashlytics)

## Security Best Practices

1. **Never commit sensitive data** (API keys, passwords) to version control
2. **Use environment variables** for configuration
3. **Regular security audits** of dependencies
4. **Keep dependencies updated** to latest stable versions

## Support

For technical support or deployment issues, refer to:
- React Native documentation
- Android developer documentation
- Play Store developer documentation
