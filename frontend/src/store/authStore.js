import { create } from 'zustand';
import { ApiClient } from '../services/api';

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

  logout: () => {
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
