# Ceylon Tea Mobile App

A React Native mobile application for inventory and sales management of Ceylon Tea Corner, a local Sri Lankan tea shop.

## Project Structure

```
src/
├── components/          # Reusable UI components
├── screens/            # Screen components
├── services/           # API services and business logic
├── context/            # React Context providers
├── utils/              # Utility functions and constants
└── types/              # Type definitions
```

## Tech Stack

- **React Native** with Expo
- **React Navigation** for navigation
- **Axios** for HTTP requests
- **AsyncStorage** for local data persistence
- **Expo Vector Icons** for icons

## Installation

1. Make sure you have Node.js and npm installed
2. Install Expo CLI globally: `npm install -g @expo/cli`
3. Install dependencies: `npm install`
4. Start the development server: `npm start`

## Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run web` - Run in web browser

## API Configuration

Update the `API_BASE_URL` in `src/utils/constants.js` to point to your Django backend:

```javascript
export const API_BASE_URL = 'http://your-backend-url:8000/api';
```

## Features

The app includes the following main features:

1. **Authentication**: User login with JWT token management
2. **Tea Inventory**: Browse and filter tea products by category
3. **Sales Recording**: Record new sales with quantity and tea selection
4. **Reports**: View sales reports and analytics
5. **Profile**: User profile and logout functionality

## Development

- The app uses React Context for state management
- All API calls are centralized in service classes
- Authentication state is managed globally via AuthContext
- Screens are organized by feature
- Common utilities and helpers are shared across the app

## Notes

- Make sure your Django backend is running before testing the mobile app
- Update the API base URL in constants.js to match your backend configuration
- The app is designed to work with the Django REST API endpoints specified in the exam requirements 