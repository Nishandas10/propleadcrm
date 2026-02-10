'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
} from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { getAuthInstance, getDbInstance, isFirebaseConfigured } from '@/lib/firebase';
import { User } from '@/lib/types';
import { addDays } from 'date-fns';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  loading: boolean;
  isGuest: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, phone?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signInWithPhone: (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) => Promise<ConfirmationResult>;
  enterGuestMode: () => void;
  exitGuestMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Guest user data
const createGuestUser = (): User => ({
  uid: 'guest-user',
  name: 'Guest User',
  email: 'guest@proplead.com',
  phone: '+919876543210',
  role: 'owner',
  created_at: Timestamp.now(),
  subscription: {
    plan: 'trial',
    status: 'active',
    expires_at: Timestamp.fromDate(addDays(new Date(), 7)),
  },
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  // Check for persisted guest mode on mount
  useEffect(() => {
    const persistedGuestMode = localStorage.getItem('proplead_guest_mode');
    if (persistedGuestMode === 'true') {
      setIsGuest(true);
      setUser(createGuestUser());
      setLoading(false);
    }
  }, []);

  // Listen to auth state changes
  useEffect(() => {
    // If Firebase is not configured, auto-enter guest mode
    if (!isFirebaseConfigured) {
      setIsGuest(true);
      setUser(createGuestUser());
      setLoading(false);
      return;
    }

    const auth = getAuthInstance();
    const db = getDbInstance();
    
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      
      if (fbUser) {
        // Fetch user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data() as User);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
        setIsGuest(false);
      } else if (!isGuest) {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isGuest]);

  const signIn = async (email: string, password: string) => {
    if (!isFirebaseConfigured) {
      enterGuestMode();
      return;
    }
    
    setLoading(true);
    try {
      const auth = getAuthInstance();
      const db = getDbInstance();
      const result = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (userDoc.exists()) {
        setUser(userDoc.data() as User);
      }
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string, phone?: string) => {
    if (!isFirebaseConfigured) {
      enterGuestMode();
      return;
    }
    
    setLoading(true);
    try {
      const auth = getAuthInstance();
      const db = getDbInstance();
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document with 7-day trial
      const trialEnd = addDays(new Date(), 7);
      const userData: User = {
        uid: result.user.uid,
        name,
        email,
        phone,
        role: 'owner',
        created_at: Timestamp.now(),
        subscription: {
          plan: 'trial',
          status: 'active',
          expires_at: Timestamp.fromDate(trialEnd),
        },
      };

      await setDoc(doc(db, 'users', result.user.uid), userData);
      setUser(userData);
    } finally {
      setLoading(false);
    }
  };

  const signOutUser = async () => {
    setLoading(true);
    try {
      if (isFirebaseConfigured && !isGuest) {
        const auth = getAuthInstance();
        await firebaseSignOut(auth);
      }
      setUser(null);
      setIsGuest(false);
      localStorage.removeItem('proplead_guest_mode');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    if (!isFirebaseConfigured) {
      throw new Error('Firebase not configured');
    }
    const auth = getAuthInstance();
    await sendPasswordResetEmail(auth, email);
  };

  const signInWithPhoneHandler = async (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) => {
    if (!isFirebaseConfigured) {
      throw new Error('Firebase not configured');
    }
    const auth = getAuthInstance();
    return signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
  };

  const enterGuestMode = () => {
    setIsGuest(true);
    setUser(createGuestUser());
    setLoading(false);
    localStorage.setItem('proplead_guest_mode', 'true');
  };

  const exitGuestMode = () => {
    setIsGuest(false);
    setUser(null);
    localStorage.removeItem('proplead_guest_mode');
  };

  const value = useMemo(() => ({
    firebaseUser,
    user,
    loading,
    isGuest,
    signIn,
    signUp,
    signOut: signOutUser,
    resetPassword,
    signInWithPhone: signInWithPhoneHandler,
    enterGuestMode,
    exitGuestMode,
  }), [firebaseUser, user, loading, isGuest]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
