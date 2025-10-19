# MarketChain - B2B Commerce Platform

A comprehensive B2B commerce platform designed for rural retailers in India, featuring AI-powered product search, voice assistance, and Firebase integration.

## 🚀 Features

- **AI-Powered Search**: Natural language understanding with regional language support
- **Voice Assistance**: Speech recognition and synthesis
- **Firebase Integration**: Authentication, Firestore, and Realtime Database
- **Role-Based Dashboards**: Retailer, Wholesaler, and Vehicle dashboards
- **KYC Verification**: Document upload and verification system
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Framer Motion
- **Backend**: Firebase (Auth, Firestore, Realtime Database, Storage)
- **AI**: Google Gemini API
- **Voice**: Web Speech API
- **Deployment**: Netlify

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/Aadiv27/market-chain.git
cd market-chain

# Install dependencies
npm install

# Create environment file
cp env.example .env.local
```

## ⚙️ Environment Variables

Create a `.env.local` file with the following variables:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.asia-southeast1.firebasedatabase.app
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Google AI Configuration
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# App Configuration
VITE_APP_NAME=MarketChain
VITE_APP_VERSION=1.0.0
```

## 🚀 Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌐 Netlify Deployment

### Automatic Deployment

1. **Connect to GitHub**:
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub account
   - Select the `market-chain` repository

2. **Configure Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18`

3. **Set Environment Variables**:
   - Go to Site settings > Environment variables
   - Add all variables from your `.env.local` file

4. **Deploy**:
   - Netlify will automatically deploy on every push to main branch

### Manual Deployment

```bash
# Build the project
npm run build

# Deploy to Netlify (if you have Netlify CLI)
netlify deploy --prod --dir=dist
```

## 🔧 Firebase Setup

1. **Create Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create a new project
   - Enable Authentication (Phone)
   - Enable Firestore Database
   - Enable Realtime Database
   - Enable Storage

2. **Configure Authentication**:
   - Go to Authentication > Sign-in method
   - Enable Phone authentication
   - Add your domain to authorized domains

3. **Configure Firestore Rules**:
```javascript
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
```

4. **Configure Storage Rules**:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /kyc/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🎯 AI Features

### Product Search
- Natural language queries in Hindi, Hinglish, and English
- Regional name mapping (chini → sugar, chawal → rice)
- Synonym expansion and spelling correction
- Intent detection (cheapest, best quality, fresh)

### Voice Assistance
- Speech-to-text for product searches
- Text-to-speech for responses
- Regional language support

## 📱 Usage

1. **Login**: Use phone number authentication
2. **Search**: Type or speak product queries
3. **Browse**: View products by category
4. **Dashboard**: Access role-specific features
5. **KYC**: Upload verification documents

## 🔒 Security

- Environment variables for sensitive data
- Firebase security rules
- HTTPS enforcement
- XSS protection headers
- Content Security Policy

## 📊 Performance

- Code splitting for better loading
- Optimized bundle size
- Caching strategies
- Lazy loading components

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@marketchain.com or create an issue on GitHub.

---

**MarketChain** - Empowering Rural Commerce with AI 🚀 