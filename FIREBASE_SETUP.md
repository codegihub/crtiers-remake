# Firebase Setup Instructions

To connect your CrTiers website to Firebase Firestore, follow these steps:

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Enter project name (e.g., "crtiers")
4. Follow the setup wizard

## 2. Enable Firestore

1. In your Firebase project, click "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" for now (you can set up security rules later)
4. Select your preferred region

## 3. Get Firebase Configuration

1. In your Firebase project, click the gear icon → "Project settings"
2. Scroll down to "Your apps" section
3. Click the web icon (`</>`) to add a web app
4. Register your app with a name
5. Copy the configuration object

## 4. Update Firebase Configuration

Replace the placeholder values in `/lib/firebase.ts` with your actual Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## 5. Firestore Database Structure

Your Firestore database should have a `players` collection with documents structured like this:

```
players/
  {playerId}/
    username: "PlayerName"
    region: "NA" | "EU" | "AS" | etc.
    gameModeStats: {
      overall: {
        rank: 1,
        tier: "S+",
        wins: 156,
        losses: 23,
        elo: 2845,
        winRate: 87.2
      },
      vanilla: { ... },
      uhc: { ... },
      // ... other game modes
    }
```

## 6. Security Rules (Optional)

For production, consider setting up Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to player data
    match /players/{document} {
      allow read: if true;
      allow write: if false; // Only allow writes from admin
    }
  }
}
```

## 7. Environment Variables (Recommended)

For better security, consider using environment variables:

Create a `.env.local` file:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
# ... etc
```

Then update `firebase.ts` to use these variables.