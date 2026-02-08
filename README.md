# AuthenticHadithApp

A React Native mobile application for accessing authentic Islamic hadiths, built with Expo and React Native.

## Project Structure

- `authentichadithapp/` - Main Expo React Native application
- `app/` - Application configuration and EAS build settings
- `.github/workflows/` - CI/CD workflows for automated iOS builds
- `scripts/` - Build and deployment utility scripts

## Features

- Cross-platform mobile app (iOS & Android)
- Built with Expo SDK 54
- File-based routing with Expo Router
- Dark mode support
- Haptic feedback
- Modern UI components with theming

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Expo CLI
- For iOS development: macOS with Xcode
- For Android development: Android Studio

## Getting Started

### Installation

1. Clone the repository:

```sh
git clone https://github.com/rsemeah/AuthenticHadithApp.git
cd AuthenticHadithApp
```

2. Install dependencies:

```sh
cd authentichadithapp
npm install
```

### Development

Start the development server:

```sh
npm start
```

Run on specific platforms:

```sh
npm run ios       # iOS simulator
npm run android   # Android emulator
npm run web       # Web browser
```

## Deployment

### iOS TestFlight

The project includes automated iOS builds via GitHub Actions:
- Pushes to `main` branch trigger EAS builds
- Builds are automatically submitted to TestFlight
- Configure secrets in GitHub repository settings:
  - `EXPO_TOKEN` - Expo access token
  - `ASC_KEY_ID` - App Store Connect API Key ID
  - `ASC_ISSUER_ID` - App Store Connect Issuer ID
  - `ASC_KEY` - App Store Connect API Key (base64 encoded)

### Manual Build

```sh
cd authentichadithapp
eas build --platform ios --profile production
```

## Tech Stack

- **Framework**: React Native 0.81.5
- **Platform**: Expo SDK 54
- **Language**: TypeScript 5.9
- **Navigation**: Expo Router 6.0
- **UI**: React Native Reanimated, Gesture Handler
- **Icons**: Expo Vector Icons

## Scripts

- `npm start` - Start development server
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator
- `npm run web` - Run in web browser
- `npm run lint` - Run ESLint

## License

Copyright © 2026 AuthenticHadithApp

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.