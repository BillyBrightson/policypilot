# Firestore Security Rules Setup

The "Missing or insufficient permissions" error means you need to configure Firestore security rules in your Firebase Console.

## Quick Setup (Temporary - for Development)

For development, you can temporarily use these permissive rules:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **policypilot33**
3. Click on **Firestore Database** in the left sidebar
4. Click on the **Rules** tab
5. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Temporary development rules - allows all authenticated users
    // TODO: Replace with production rules before deploying
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

6. Click **Publish** to save the rules

⚠️ **Warning**: These rules allow any authenticated user to read/write all data. This is fine for development but **NOT for production**.

## Production Rules

For production, use the rules in `firestore.rules` file in this project, which provides proper multi-tenant security.

To deploy production rules using Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

Or manually copy the contents of `firestore.rules` to Firebase Console → Firestore → Rules.

## Alternative: Set Rules Directly in Firebase Console

1. Go to Firebase Console → Firestore Database → Rules
2. Copy and paste the contents of `firestore.rules` file
3. Click **Publish**





