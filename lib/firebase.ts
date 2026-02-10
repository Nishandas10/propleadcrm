// Firebase Client Configuration

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator, Auth } from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
  Firestore,
} from "firebase/firestore";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "demo-project.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "demo-project.appspot.com",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abc123",
};

// Check if Firebase is configured
export const isFirebaseConfigured = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

// Initialize Firebase only if we have valid config or for demo purposes
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

// Lazy initialization to avoid SSR issues
const getFirebaseApp = () => {
  if (!app) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  }
  return app;
};

export const getAuthInstance = () => {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
};

export const getDbInstance = () => {
  if (!db) {
    db = getFirestore(getFirebaseApp());
  }
  return db;
};

// FCM for push notifications (browser only)
export const getMessagingInstance = async () => {
  if (typeof window !== "undefined" && (await isSupported())) {
    return getMessaging(getFirebaseApp());
  }
  return null;
};

// Connect to emulators in development (called manually when needed)
export const connectEmulators = () => {
  if (
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_USE_EMULATORS === "true"
  ) {
    const authInstance = getAuthInstance();
    const dbInstance = getDbInstance();
    connectAuthEmulator(authInstance, "http://localhost:9099");
    connectFirestoreEmulator(dbInstance, "localhost", 8080);
  }
};

export default getFirebaseApp;
