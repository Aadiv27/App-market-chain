import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDo9in_JIAZM8L9Jn0Z_fFQ8pZ7s9hIwZg",
  authDomain: "market-chain-5bd35.firebaseapp.com",
  databaseURL: "https://market-chain-5bd35-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "market-chain-5bd35",
  storageBucket: "market-chain-5bd35.firebasestorage.app",
  messagingSenderId: "843550623148",
  appId: "1:843550623148:web:31dc87eb003693961a2609",
  measurementId: "G-ZZWPYCVFKY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const realtimeDb = getDatabase(app);
const storage = getStorage(app);

export { auth, db, realtimeDb, storage, app };

