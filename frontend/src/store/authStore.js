import { create } from 'zustand';
import { ApiClient } from '../services/api';
import { store } from './index.js';
import { setAuth as setReduxAuth, setCurrency as setReduxCurrency } from './slices/authSlice.js';
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  logOutFirebase,
  subscribeToAuthChanges,
  auth,
} from '../services/firebase';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('nomadly_token') || null,
  isLoading: false,
  isInitialized: false,
  currency: 'INR',
  currencyRate: 1, // 1 INR = 1 INR, could expand to USD/EUR

  setCurrency: (currency) => {
    store.dispatch(setReduxCurrency(currency));
    set({ currency });
  },

  setAuth: (user, token) => {
    if (token) {
      localStorage.setItem('nomadly_token', token);
    } else {
      localStorage.removeItem('nomadly_token');
    }
    store.dispatch(setReduxAuth({ user, token }));
    set({ user, token, isInitialized: true });
  },

  logout: async () => {
    try {
      await logOutFirebase();
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('nomadly_token');
    store.dispatch(setReduxAuth({ user: null, token: null }));
    set({ user: null, token: null });
  },

  initAuth: () => {
    // 1. Subscribe to Firebase auth changes (handles page reloads & background token refresh)
    subscribeToAuthChanges(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          localStorage.setItem('nomadly_token', idToken);
          set({ token: idToken });

          // Sync with MongoDB backend user record
          const meRes = await ApiClient.getMe();
          if (meRes.success && meRes.data) {
            set({ user: meRes.data, isInitialized: true });
            return;
          }
        } catch (err) {
          console.warn('[authStore] Error syncing Firebase user profile:', err.message);
        }
        // Fallback to basic Firebase user if backend sync is still pending
        set({
          user: {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            photoURL: firebaseUser.photoURL,
          },
          isInitialized: true,
        });
      } else {
        // If not a Firebase user, check if this is a demo user session
        const existingToken = localStorage.getItem('nomadly_token');
        if (existingToken) {
          get().checkSession();
        } else {
          set({ user: null, token: null, isInitialized: true });
        }
      }
    });
  },

  checkSession: async () => {
    const token = localStorage.getItem('nomadly_token');
    if (!token && !auth?.currentUser) {
      set({ isInitialized: true });
      return;
    }

    try {
      const res = await ApiClient.getMe();
      if (res.success && res.data) {
        set({ user: res.data, isInitialized: true });
      }
    } catch (err) {
      console.warn('Session check transient error:', err.message);
      // ONLY logout if explicitly unauthorized (401) AND not logged into Firebase
      const isAuthError = err.message?.includes('401') || err.message?.includes('Invalid or expired');
      if (isAuthError && !auth?.currentUser) {
        get().logout();
      }
      set({ isInitialized: true });
    }
  },

  loginWithGoogle: async () => {
    try {
      set({ isLoading: true });
      const { user: fbUser, idToken } = await signInWithGoogle();
      localStorage.setItem('nomadly_token', idToken);
      
      // Sync with backend MongoDB Atlas
      const meRes = await ApiClient.getMe();
      const finalUser = meRes.success ? meRes.data : fbUser;
      
      get().setAuth(finalUser, idToken);
      return finalUser;
    } catch (err) {
      console.error('Google login error:', err);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  loginWithEmail: async (email, password) => {
    try {
      set({ isLoading: true });
      const { user: fbUser, idToken } = await signInWithEmail(email, password);
      localStorage.setItem('nomadly_token', idToken);

      const meRes = await ApiClient.getMe();
      const finalUser = meRes.success ? meRes.data : fbUser;

      get().setAuth(finalUser, idToken);
      return finalUser;
    } catch (err) {
      console.error('Email login error:', err);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  registerWithEmail: async (email, password) => {
    try {
      set({ isLoading: true });
      const { user: fbUser, idToken } = await signUpWithEmail(email, password);
      localStorage.setItem('nomadly_token', idToken);

      const meRes = await ApiClient.getMe();
      const finalUser = meRes.success ? meRes.data : fbUser;

      get().setAuth(finalUser, idToken);
      return finalUser;
    } catch (err) {
      console.error('Email register error:', err);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  demoSignIn: async (role = 'customer') => {
    try {
      set({ isLoading: true });
      const res = await ApiClient.demoLogin(role);
      if (res.success && res.data) {
        get().setAuth(res.data.user, res.data.token);
        return res.data;
      }
    } catch (err) {
      console.error('Demo login error:', err);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },
}));
