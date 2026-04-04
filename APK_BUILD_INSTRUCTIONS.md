# Android APK Build Instructions

Your ContentStudio application has been successfully configured for Android APK generation using Capacitor.

## Prerequisites

Before building the APK, ensure you have the following installed:

1. **Android SDK** - Required for Android app compilation
   - Download Android Studio from https://developer.android.com/studio
   - During installation, ensure you install:
     - Android SDK API 34 (or latest)
     - Android Build Tools
     - Android Emulator (optional, for testing)

2. **Java Development Kit (JDK) 17+**
   - Download from https://www.oracle.com/java/technologies/downloads/
   - Or install via your package manager:
     - macOS: `brew install openjdk@17`
     - Ubuntu: `sudo apt-get install openjdk-17-jdk`

3. **Gradle** (Usually comes with Android Studio)

## Environment Setup

### For macOS/Linux:

```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

Add these to your `~/.zshrc` or `~/.bash_profile` for permanent configuration.

### For Windows:

Set environment variables in System Settings:
- `ANDROID_HOME` = `C:\Users\YourUsername\AppData\Local\Android\Sdk`
- Add `%ANDROID_HOME%\tools` and `%ANDROID_HOME%\platform-tools` to PATH

## Build the APK

### Step 1: Build Web Assets (Already Done)
```bash
npm run build
```
Web assets are already compiled in the `dist/` directory.

### Step 2: Sync to Android Project
```bash
npx cap sync
```
This copies web assets to the Android project.

### Step 3: Open Android Project

Option A: Using Android Studio (Recommended)
```bash
cd android
# Open in Android Studio
open -a "Android Studio" .
```

Then in Android Studio:
1. Click "Build" in the menu
2. Select "Generate Signed Bundle/APK"
3. Choose "APK"
4. Follow the wizard to create signing credentials
5. Select "release" build variant
6. Complete the build process

Option B: Using Gradle (Command Line)

For debug APK:
```bash
cd android
./gradlew assembleDebug
```
Output: `android/app/build/outputs/apk/debug/app-debug.apk`

For release APK (requires signing key):
```bash
cd android
./gradlew assembleRelease
```

### Step 4: Locate the APK

- **Debug APK**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Release APK**: `android/app/build/outputs/apk/release/app-release.apk`

## Testing the APK

### On Physical Device:
1. Enable USB Debugging on your Android device
2. Connect via USB
3. Run: `adb install path/to/app.apk`

### On Android Emulator:
1. Start an Android Virtual Device (AVD) from Android Studio
2. Run: `adb install path/to/app.apk`

## Publishing to Google Play Store

To publish your APK:

1. Create a Google Play Developer Account ($25 one-time fee)
2. Create a signing key (Google Play requires signing)
3. Generate a release APK
4. Create an app listing in Google Play Console
5. Upload the APK and fill in metadata
6. Submit for review

## Common Issues and Solutions

### Issue: ANDROID_HOME not found
**Solution**: Ensure ANDROID_HOME environment variable is set correctly:
```bash
echo $ANDROID_HOME
# Should show path like: /Users/username/Android/Sdk
```

### Issue: Gradle build fails
**Solution**: Clear Gradle cache and retry:
```bash
cd android
./gradlew clean build
```

### Issue: APK too large
**Solution**: Consider enabling code splitting. The current app size is approximately 900KB (Gzip compressed).

### Issue: App crashes on startup
**Solution**: Check logs with:
```bash
adb logcat | grep "ContentStudio"
```

## Configuration Files

Key configuration files for the Android build:

- `capacitor.config.ts` - Capacitor configuration (web directory, app ID, app name)
- `android/app/src/main/AndroidManifest.xml` - Android app permissions and configuration
- `android/build.gradle` - Gradle build configuration
- `android/app/build.gradle` - App-level Gradle configuration

## Next Steps

1. Install Android SDK and JDK if not already installed
2. Configure ANDROID_HOME environment variable
3. Follow Step 1-4 above to build your APK
4. Test on a device or emulator
5. Make app signing credentials secure before distributing

## Additional Resources

- Capacitor Documentation: https://capacitorjs.com/docs/android
- Android Developer Guide: https://developer.android.com/guide
- Google Play Store Publishing: https://play.google.com/console
