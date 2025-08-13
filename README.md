# Autonomous React Native Mobile App

Auth Flow Automation: https://asset.cloudinary.com/dtfz3rnjx/0229b5c8992f98374223991498ad7ff0
Dashboard Flow Automation: https://asset.cloudinary.com/dtfz3rnjx/5157f33ff53a945db21103e4c04afcb3

A React Native mobile application for autonomous app management with authentication, dashboard, and subscription features.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start with Docker](#quick-start-with-docker)
- [Manual Setup](#manual-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Building for Production](#building-for-production)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before setting up this project, ensure you have the following installed:

### For All Platforms

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**

### For Android Development

- **Android Studio** (latest version)
- **Android SDK** (API level 33 or higher)
- **Java Development Kit (JDK)** 11 or higher
- **Android Emulator** or physical device

### For iOS Development (macOS only)

- **Xcode** (latest version)
- **Xcode Command Line Tools**
- **iOS Simulator** or physical device
- **CocoaPods**

### For Docker (Optional)

- **Docker Desktop** (latest version)
- **Docker Compose**

## Quick Start with Docker

The easiest way to get started is using Docker, which handles all dependencies automatically.

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd autonomous-react-native-mobile-app
```

### 2. Start with Docker Compose

```bash
# Start all services (Metro bundler and JSON server)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 3. Run on Device/Emulator

```bash
# For Android
npm run android

# For iOS
npm run ios
```

## Manual Setup

If you prefer to set up the project manually or Docker is not available:

### 1. Clone and Install Dependencies

```bash
git clone <your-repository-url>
cd autonomous-react-native-mobile-app

# Install Node.js dependencies
npm install

# Install iOS dependencies (macOS only)
cd ios && pod install && cd ..
```

### 2. Configure API Settings

Update the `baseUrl` in `src/utils/constants.ts`:

```ts
// For emulator/simulator (default)
export const baseUrl = 'http://localhost:3001';

// For real device (replace with your computer's IP)
// export const baseUrl = 'http://192.168.1.100:3001';
```

### 3. Start Development Services

Open multiple terminal windows/tabs:

**Terminal 1: Start Metro Bundler**

```bash
npm start
```

**Terminal 2: Start JSON Server (Mock API)**

```bash
npm run json-server
```

**Terminal 3: Run on Device/Emulator**

```bash
# For Android
npm run android

# For iOS
npm run ios
```

### 4. Verify Setup

Test if your services are running correctly:

```bash
# Check Metro bundler
curl http://localhost:8081/status

# Check JSON server
curl http://localhost:3001/apps
```

**Expected Results:**

- Metro bundler should show React Native status
- JSON server should return JSON data from db.json
- Both ports should be active and listening

## Project Structure

```
autonomous-react-native-mobile-app/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── app-management/  # App management components
│   │   ├── common/          # Common UI elements
│   │   ├── dashboard/       # Dashboard components
│   │   └── subscription/    # Subscription components
│   ├── screens/            # App screens
│   │   ├── auth/           # Authentication screens
│   │   ├── dashboard/      # Main dashboard
│   │   ├── app-management/ # App creation/editing
│   │   └── subscription/   # Subscription management
│   ├── navigation/         # Navigation configuration
│   ├── store/              # Redux store and slices
│   ├── services/           # API services
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   └── config/             # App configuration
├── android/                # Android-specific files
├── ios/                    # iOS-specific files
├── __tests__/              # Test files
├── e2e/                    # End-to-end tests
├── assets/                 # Images, fonts, etc.
├── db.json                 # Mock API data
└── package.json            # Dependencies and scripts
```

**Key Files:**

- `src/utils/constants.ts` - API configuration and app constants
- `db.json` - Mock data for development
- `package.json` - Project dependencies and scripts

## Development Workflow

### Available Scripts

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

### Development Process

1. **Start Environment**: Use Docker (`docker-compose up -d`) or manual setup
2. **Make Changes**: Edit files in the `src/` directory
3. **Testing**: Run `npm test` and `npm run lint`
4. **Building**: See [Building for Production](#building-for-production) section

### Firebase Functionality Note

**Important**: Firebase functionality has been commented out due to Detox testing compatibility. If you want to test Firebase features:

1. Open `src/navigation/MainNavigator.tsx`
2. Find the line: `// initializeFirebaseMessaging();`
3. Uncomment it by removing the `//` at the beginning
4. Restart your app to enable Firebase messaging

**Note**: Firebase features may interfere with Detox E2E testing, so keep this commented out when running Detox tests.

## Building for Production

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

## Troubleshooting

### Common Setup Problems

**Metro Bundler Issues:**

```bash
# Clear Metro cache
npx react-native start --reset-cache

# Clear npm cache
npm cache clean --force
```

**Android Build Issues:**

```bash
# Clean Android build
cd android && ./gradlew clean && cd ..

# Check Android SDK location
echo $ANDROID_HOME
```

**iOS Build Issues:**

```bash
# Reinstall pods
cd ios && pod deintegrate && pod install && cd ..

# Clear Xcode build folder
rm -rf ios/build/
```

**Docker Issues:**

```bash
# Rebuild Docker containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Common Build Issues

**Android Build Issues:**

- **Gradle sync failed**: Check internet connection and Gradle version
- **SDK location not found**: Set ANDROID_HOME environment variable
- **Keystore issues**: Verify keystore path and passwords

**iOS Build Issues:**

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

### Getting Help

- Check the [React Native Troubleshooting Guide](https://reactnative.dev/docs/troubleshooting)
- Review the project's issue tracker
- Ensure all prerequisites are properly installed
