# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# React Native
-keep class com.facebook.react.** { *; }
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.yoga.** { *; }
-keep class com.facebook.flipper.** { *; }

# Keep native methods
-keepclassmembers class * {
    native <methods>;
}

# Keep React Native modules
-keep class * extends com.facebook.react.bridge.ReactContextBaseJavaModule { *; }
-keep class * extends com.facebook.react.bridge.BaseJavaModule { *; }

# Keep React Native views
-keep class * extends com.facebook.react.uimanager.ViewManager { *; }
-keep class * extends com.facebook.react.uimanager.SimpleViewManager { *; }

# Firebase
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }

# Google Play Services
-keep class com.google.android.gms.ads.** { *; }
-keep class com.google.android.gms.maps.** { *; }

# React Native Maps
-keep class com.airbnb.android.react.maps.** { *; }

# React Native Image Crop Picker
-keep class com.reactnative.** { *; }

# React Native Video
-keep class com.brentvatne.** { *; }

# React Native Gesture Handler
-keep class com.swmansion.** { *; }

# React Native Reanimated - Comprehensive rules
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.react.bridge.** { *; }

# Reanimated Worklets and Layout Animation
-keep class com.swmansion.reanimated.layoutReanimation.** { *; }
-keep class com.swmansion.reanimated.sensor.** { *; }
-keep class com.swmansion.reanimated.keyboardObserver.** { *; }
-keep class com.swmansion.reanimated.Scheduler.** { *; }

# Keep all native methods for Reanimated
-keepclassmembers class com.swmansion.reanimated.** {
    native <methods>;
}

# Prevent obfuscation of Reanimated classes
-keepnames class com.swmansion.reanimated.**
-keepclassmembernames class com.swmansion.reanimated.** { *; }

# Keep Hermes and JSC related classes
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jsc.** { *; }

# React Native SVG
-keep class com.horcrux.** { *; }

# React Native Fast Image
-keep class com.dylanvann.** { *; }

# React Native Linear Gradient
-keep class com.BV.** { *; }

# React Native Permissions
-keep class com.zoontek.** { *; }

# React Native Async Storage
-keep class com.reactnativecommunity.** { *; }

# Socket.io
-keep class io.socket.** { *; }

# Giphy SDK
-keep class com.giphy.sdk.** { *; }

# Notifee
-keep class app.notifee.** { *; }

# Keep serializable classes
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# Keep enum classes
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Keep Parcelable classes
-keep class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator *;
}

# Keep R class
-keep class **.R
-keep class **.R$* {
    <fields>;
}

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep custom exceptions
-keep public class * extends java.lang.Exception

# Remove logging in release builds
-assumenosideeffects class android.util.Log {
    public static boolean isLoggable(java.lang.String, int);
    public static int v(...);
    public static int i(...);
    public static int w(...);
    public static int d(...);
    public static int e(...);
}