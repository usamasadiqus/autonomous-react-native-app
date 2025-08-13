This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup) instructions till "Creating a new application" step, before proceeding.

## Scripts

The following npm scripts are available in this project:

| Script      | Description                                                      |
| ----------- | ---------------------------------------------------------------- |
| start       | Start the Metro JavaScript bundler.                              |
| android     | Build and launch the app on an Android device or emulator.       |
| ios         | Build and launch the app on an iOS simulator.                    |
| lint        | Run ESLint to check for code style and errors.                   |
| test        | Run Jest tests.                                                  |
| json-server | Start a mock REST API server using db.json on port 3001.         |
| clean       | Clean the Android build (runs './gradlew clean' in android/).    |
| ios-install | Install iOS CocoaPods dependencies (runs 'pod install' in ios/). |

You can run any script using:

```bash
npm run <script-name>
```

### Running Metro and JSON Server Together

To run the app with both the Metro bundler and the mock API server (json-server), open two separate terminal windows/tabs:

**Terminal 1: Start Metro Bundler**

```bash
npm run start
```

**Terminal 2: Start JSON Server**

```bash
npm run json-server
```

This will ensure your React Native app can access the mock API at `http://localhost:3001` while developing.

## Setting the API Base URL

To connect your app to the mock API server, you need to set the correct `baseUrl` in the `src/utils/constants.ts` file.

### If running on an **emulator or simulator** (Android Emulator or iOS Simulator):

Use:

```ts
export const baseUrl = 'http://localhost:3001';
```

This works for both Android emulator and iOS simulator in most setups.

### If running on a **real device** (connected to the same network as your computer):

1. Find your computer's local IP address (e.g., `192.168.1.100`).
2. Use:

```ts
export const baseUrl = 'http://<your-computer-ip>:3001';
```

Replace `<your-computer-ip>` with your actual IP address.

#### Example for real device:

```ts
export const baseUrl = 'http://192.168.1.100:3001';
```

Make sure your device and computer are on the same Wi-Fi network, and your firewall allows incoming connections to port 3001.

## Step 1: Start the Metro Server

First, you will need to start **Metro**, the JavaScript _bundler_ that ships _with_ React Native.

To start Metro, run the following command from the _root_ of your React Native project:

```bash
# using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Start your Application

Let Metro Bundler run in its _own_ terminal. Open a _new_ terminal from the _root_ of your React Native project. Run the following command to start your _Android_ or _iOS_ app:

### For Android

```bash
# using npm
npm run android

# OR using Yarn
yarn android
```

### For iOS

```bash
# using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up _correctly_, you should see your new app running in your _Android Emulator_ or _iOS Simulator_ shortly provided you have set up your emulator/simulator correctly.

This is one way to run your app — you can also run it directly from within Android Studio and Xcode respectively.

## Step 3: Modifying your App

Now that you have successfully run the app, let's modify it.

1. Open `App.tsx` in your text editor of choice and edit some lines.
2. For **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Developer Menu** (<kbd>Ctrl</kbd> + <kbd>M</kbd> (on Window and Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (on macOS)) to see your changes!

   For **iOS**: Hit <kbd>Cmd ⌘</kbd> + <kbd>R</kbd> in your iOS Simulator to reload the app and see your changes!

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [Introduction to React Native](https://reactnative.dev/docs/getting-started).

# Building for Production

This section covers how to build your React Native app for production deployment on both Android and iOS platforms.

## Android APK Build

### Prerequisites

- Android Studio installed and configured
- Android SDK configured
- Java Development Kit (JDK) 11 or higher
- Valid keystore for signing (for release builds)

### Debug APK Build

To build a debug APK for testing:

```bash
cd android
./gradlew clean
./gradlew assembleDebug
```

The debug APK will be generated at:
`android/app/build/outputs/apk/debug/app-debug.apk`

### Release APK Build

To build a release APK for production:

1. **Configure signing** in `android/app/build.gradle`:

```gradle
android {
    signingConfigs {
        release {
            storeFile file("your-release-key.keystore")
            storePassword "your-store-password"
            keyAlias "your-key-alias"
            keyPassword "your-key-password"
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

2. **Build release APK**:

```bash
cd android
./gradlew assembleRelease
```

The release APK will be generated at:
`android/app/build/outputs/apk/release/app-release.apk`

### Bundle Build (Recommended for Play Store)

For Google Play Store distribution, build an AAB bundle:

```bash
cd android
./gradlew bundleRelease
```

The bundle will be generated at:
`android/app/build/outputs/bundle/release/app-release.aab`

### Build Scripts

You can also use the npm scripts defined in package.json:

```bash
# Clean Android build
npm run clean

# Build Android (runs ./gradlew assembleDebug)
npm run android
```

## iOS Build

### Prerequisites

- macOS with Xcode installed
- Xcode Command Line Tools
- iOS Developer Account (for App Store distribution)
- CocoaPods installed

### Install Dependencies

First, install iOS dependencies:

```bash
cd ios
pod install
cd ..
```

Or use the npm script:

```bash
npm run ios-install
```

### Debug Build

To build and run on iOS Simulator:

```bash
npm run ios
```

### Release Build

To build for production:

1. **Open the project in Xcode**:

```bash
cd ios
open AutonomousMobile.xcworkspace
```

2. **Configure signing** in Xcode:

   - Select your project in the navigator
   - Select your target
   - Go to "Signing & Capabilities"
   - Select your team and provisioning profile

3. **Build for device**:

   - Select a real device as the build target
   - Product → Archive

4. **Archive and distribute**:
   - After archiving, the Organizer will open
   - Select your archive and click "Distribute App"
   - Choose distribution method (App Store, Ad Hoc, Enterprise)

### Build Scripts

Use the npm scripts for iOS development:

```bash
# Install iOS dependencies
npm run ios-install

# Run on iOS simulator
npm run ios
```

## Distribution

### Android Distribution

- **Google Play Store**: Upload the `.aab` bundle
- **Direct APK**: Share the `.apk` file directly
- **Internal Testing**: Use Google Play Console for internal testing

### iOS Distribution

- **App Store**: Use Xcode Organizer to upload
- **TestFlight**: Upload to App Store Connect for beta testing
- **Ad Hoc**: Distribute to specific devices for testing

## Troubleshooting Build Issues

### Common Android Build Issues

- **Gradle sync failed**: Check internet connection and Gradle version
- **SDK location not found**: Set ANDROID_HOME environment variable
- **Keystore issues**: Verify keystore path and passwords

### Common iOS Build Issues

- **Pod install failed**: Run `pod repo update` and try again
- **Signing issues**: Check provisioning profiles and certificates
- **Build errors**: Clean build folder and try again

### Build Commands for Troubleshooting

```bash
# Android
cd android
./gradlew clean
./gradlew assembleDebug --stacktrace

# iOS
cd ios
rm -rf build/
pod deintegrate
pod install
```

# Troubleshooting

If you can't get this to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
