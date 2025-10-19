import { auth, db } from '../components/lib/Firebase';

export const checkFirebaseConfig = () => {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check if Firebase is initialized
  if (!auth) {
    issues.push('Firebase Auth not initialized');
  }

  if (!db) {
    issues.push('Firestore not initialized');
  }

  // Check Firebase project configuration
  const projectId = auth?.app?.options?.projectId;
  if (projectId !== 'market-chain-5bd35') {
    issues.push(`Project ID mismatch. Expected: market-chain-5bd35, Got: ${projectId}`);
  }

  // Check if we're in development mode
  if (process.env.NODE_ENV === 'development') {
    recommendations.push('Enable Phone Authentication in Firebase Console');
    recommendations.push('Configure reCAPTCHA in Firebase Console');
    recommendations.push('Add your domain to authorized domains in Firebase Console');
  }

  return {
    isConfigured: issues.length === 0,
    issues,
    recommendations,
    projectId
  };
};

export const getFirebaseSetupInstructions = () => {
  return `
## Firebase Setup Instructions

### 1. Enable Phone Authentication
1. Go to Firebase Console: https://console.firebase.google.com/project/market-chain-5bd35
2. Navigate to Authentication > Sign-in method
3. Enable "Phone" as a sign-in provider
4. Add your test phone numbers (optional)

### 2. Configure reCAPTCHA
1. In Firebase Console, go to Authentication > Settings
2. Scroll to "reCAPTCHA Enterprise" section
3. Enable reCAPTCHA Enterprise
4. Add your domain to authorized domains

### 3. Firestore Rules
Make sure your Firestore rules allow read/write access:

\`\`\`
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /products/{productId} {
      allow read: if true;
    }
  }
}
\`\`\`

### 4. Storage Rules
Configure Firebase Storage rules:

\`\`\`
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /kyc/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
\`\`\`
  `;
}; 