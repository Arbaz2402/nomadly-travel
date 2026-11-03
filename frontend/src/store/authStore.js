import { create } from 'zustand';
import { ApiClient } from '../services/api';
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  logOutFirebase,
} from '../services/firebase';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('nomadly_token') || null,
  isLoading: false,
  currency: 'INR',
  currencyRate: 1, // 1 INR = 1 INR, could expand to USD/EUR

  setCurrency: (currency) => set({ currency }),

  setAuth: (user, token) => {
    if (token) {
      localStorage.setItem('nomadly_token', token);
    } else {
      localStorage.removeItem('nomadly_token');
    }
    set({ user, token });
  },

  logout: async () => {
    try {
      await logOutFirebase();
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('nomadly_token');
    set({ user: null, token: null });
  },

  checkSession: async () => {
    const token = localStorage.getItem('nomadly_token');
    if (!token) return;

    try {
      set({ isLoading: true });
      const res = await ApiClient.getMe();
      if (res.success && res.data) {
        set({ user: res.data });
      } else {
        get().logout();
      }
    } catch (err) {
      console.warn('Session check failed:', err.message);
      get().logout();
    } finally {
      set({ isLoading: false });
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
