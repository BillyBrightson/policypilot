import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// Firebase configuration from environment variables
// Make sure all these are set in your .env.local file

// Helper to validate environment variables
function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value && !defaultValue) {
    console.error(`❌ Missing required environment variable: ${key}`);
    throw new Error(`Missing required environment variable: ${key}. Please check your .env.local file.`);
  }
  return value || defaultValue || "";
}

const firebaseConfig = {
  apiKey: getEnvVar("NEXT_PUBLIC_FIREBASE_API_KEY", "AIzaSyDZQk-Z8vY4uOwjjzQawdYjlg0cKYLnmsg"),
  authDomain: getEnvVar("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", "policypilot33.firebaseapp.com"),
  projectId: getEnvVar("NEXT_PUBLIC_FIREBASE_PROJECT_ID", "policypilot33"),
  storageBucket: getEnvVar("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET", "policypilot33.firebasestorage.app"),
  messagingSenderId: getEnvVar("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID", "912979273474"),
  appId: getEnvVar("NEXT_PUBLIC_FIREBASE_APP_ID", "1:912979273474:web:8ff77f197d05f2300bc41b"),
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-P0T2B53XRY",
};

// Validate API key format (should not be empty or undefined)
if (!firebaseConfig.apiKey || firebaseConfig.apiKey.trim() === "") {
  console.error("❌ Firebase API key is empty or undefined!");
  console.error("Please check your .env.local file and ensure NEXT_PUBLIC_FIREBASE_API_KEY is set correctly.");
}

// Initialize Firebase (avoid re-initialization)
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (typeof window !== "undefined") {
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.error("❌ Firebase initialization error:", error);
    throw error;
  }
}

export { auth, db };
export default app;

