import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyC5IvxalUDe6QzoHOeciYysmGVRPk7j_oI',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'nomadly-app-fe5b9.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'nomadly-app-fe5b9',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'nomadly-app-fe5b9.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '958283972796',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:958283972796:web:02a1b2b4d90b2aa36d10b9',
};

// Initialize Firebase App singleton
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

/**
 * Sign in with Google Popup
 * Returns { user, idToken }
 */
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();
    return {
      user: {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
      },
      idToken,
    };
  } catch (error) {
    console.error('Firebase Google Sign-In Error:', error);
    throw error;
  }
};

/**
 * Sign in with Email and Password
 */
export const signInWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await result.user.getIdToken();
    return {
      user: {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName || email.split('@')[0],
      },
      idToken,
    };
  } catch (error) {
    console.error('Firebase Email Sign-In Error:', error);
    throw error;
  }
};

/**
 * Sign up with Email and Password
 */
export const signUpWithEmail = async (email, password) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const idToken = await result.user.getIdToken();
    return {
      user: {
        uid: result.user.uid,
        email: result.user.email,
        displayName: email.split('@')[0],
      },
      idToken,
    };
  } catch (error) {
    console.error('Firebase Email Sign-Up Error:', error);
    throw error;
  }
};

/**
 * Sign out of Firebase
 */
export const logOutFirebase = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.warn('Firebase Sign-Out Warning:', error);
  }
};

