import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ApiClient } from '../../services/api';
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  logOutFirebase,
} from '../../services/firebase';

const initialToken = typeof window !== 'undefined' ? localStorage.getItem('nomadly_token') : null;

export const loginWithGoogleThunk = createAsyncThunk(
  'auth/loginWithGoogle',
  async (_, { rejectWithValue }) => {
    try {
      const { user: fbUser, idToken } = await signInWithGoogle();
      localStorage.setItem('nomadly_token', idToken);
      const meRes = await ApiClient.getMe();
      const finalUser = meRes.success ? meRes.data : fbUser;
      return { user: finalUser, token: idToken };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const loginWithEmailThunk = createAsyncThunk(
  'auth/loginWithEmail',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { user: fbUser, idToken } = await signInWithEmail(email, password);
      localStorage.setItem('nomadly_token', idToken);
      const meRes = await ApiClient.getMe();
      const finalUser = meRes.success ? meRes.data : fbUser;
      return { user: finalUser, token: idToken };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const registerWithEmailThunk = createAsyncThunk(
  'auth/registerWithEmail',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { user: fbUser, idToken } = await signUpWithEmail(email, password);
      localStorage.setItem('nomadly_token', idToken);
      const meRes = await ApiClient.getMe();
      const finalUser = meRes.success ? meRes.data : fbUser;
      return { user: finalUser, token: idToken };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const demoSignInThunk = createAsyncThunk(
  'auth/demoSignIn',
  async (role = 'customer', { rejectWithValue }) => {
    try {
      const res = await ApiClient.demoLogin(role);
      if (res.success && res.data) {
        if (res.data.token) localStorage.setItem('nomadly_token', res.data.token);
        return { user: res.data.user, token: res.data.token };
      }
      return rejectWithValue('Demo login failed');
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  try {
    await logOutFirebase();
  } catch {
    // ignore
  }
  localStorage.removeItem('nomadly_token');
  return null;
});

export const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: initialToken,
    isLoading: false,
    isInitialized: false,
    currency: 'INR',
    currencyRate: 1,
    error: null,
  },
  reducers: {
    setAuth: (state, action) => {
      const { user, token } = action.payload || {};
      state.user = user || null;
      state.token = token || null;
      state.isInitialized = true;
      if (token) {
        localStorage.setItem('nomadly_token', token);
      } else {
        localStorage.removeItem('nomadly_token');
      }
    },
    setCurrency: (state, action) => {
      state.currency = action.payload;
    },
    setInitialized: (state, action) => {
      state.isInitialized = action.payload !== undefined ? action.payload : true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Google Login
      .addCase(loginWithGoogleThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithGoogleThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isInitialized = true;
      })
      .addCase(loginWithGoogleThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Email Login
      .addCase(loginWithEmailThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithEmailThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isInitialized = true;
      })
      .addCase(loginWithEmailThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Email Register
      .addCase(registerWithEmailThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerWithEmailThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isInitialized = true;
      })
      .addCase(registerWithEmailThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Demo Login
      .addCase(demoSignInThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(demoSignInThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isInitialized = true;
      })
      .addCase(demoSignInThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isLoading = false;
      });
  },
});

export const { setAuth, setCurrency, setInitialized } = authSlice.actions;

export const selectCurrentUser = (state) => state.auth.user;
export const selectAuthToken = (state) => state.auth.token;
export const selectIsAuthLoading = (state) => state.auth.isLoading;
export const selectCurrentCurrency = (state) => state.auth.currency;

export default authSlice.reducer;
