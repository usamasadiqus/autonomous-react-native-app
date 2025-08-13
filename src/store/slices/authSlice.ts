// store/authSlice.ts
import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {APP_CONSTANTS} from '../../utils/constants';
import {RootState} from '../index';
import Toast from 'react-native-toast-message';

// Types
export interface User {
  id: number;
  name: string;
  email: string;
  isBiometricEnabled?: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Async Thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: {email: string; password: string}, {rejectWithValue}) => {
    try {
      const response = await fetch(`${APP_CONSTANTS.API_BASE_URL}/users`);
      const users = await response.json();

      const user = users.find(
        (u: any) =>
          u.email === credentials.email && u.password === credentials.password,
      );

      if (!user) {
        throw new Error('Invalid email or password');
      }

      const token = `jwt_token_${user.id}_${Date.now()}`;

      // Update user with token
      await fetch(`${APP_CONSTANTS.API_BASE_URL}/users/${user.id}`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({token}),
      });

      // Store in AsyncStorage
      await AsyncStorage.setItem('auth_token', token);
      await AsyncStorage.setItem(
        'user_data',
        JSON.stringify({
          id: user.id,
          name: user.name,
          email: user.email,
        }),
      );

      // Store credentials for biometric login if user has biometric enabled
      if (user.isBiometricEnabled) {
        await AsyncStorage.setItem(
          'biometric_credentials',
          JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        );
      }

      return {
        user: {id: user.id, name: user.name, email: user.email},
        token,
      };
    } catch (error: any) {
      console.log('error: ', error);
      return rejectWithValue(error.message);
    }
  },
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (
    userData: {
      name: string;
      email: string;
      password: string;
      isBiometricEnabled?: boolean;
    },
    {rejectWithValue},
  ) => {
    try {
      // Check if user exists
      const response = await fetch(`${APP_CONSTANTS.API_BASE_URL}/users`);
      const users = await response.json();

      if (users.find((u: any) => u.email === userData.email)) {
        throw new Error('User with this email already exists');
      }

      const token = `jwt_token_${Date.now()}`;

      // Create new user
      const newUserResponse = await fetch(
        `${APP_CONSTANTS.API_BASE_URL}/users`,
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            name: userData.name,
            email: userData.email,
            password: userData.password,
            token,
            createdAt: new Date().toISOString(),
            isBiometricEnabled: userData.isBiometricEnabled || false,
          }),
        },
      );

      const newUser = await newUserResponse.json();

      // Store in AsyncStorage
      await AsyncStorage.setItem('auth_token', token);
      await AsyncStorage.setItem(
        'user_data',
        JSON.stringify({
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          isBiometricEnabled: newUser.isBiometricEnabled || false,
        }),
      );

      // Store credentials for biometric login if user enabled biometric
      if (userData.isBiometricEnabled) {
        await AsyncStorage.setItem(
          'biometric_credentials',
          JSON.stringify({
            email: userData.email,
            password: userData.password,
          }),
        );
      }

      return {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          isBiometricEnabled: newUser.isBiometricEnabled || false,
        },
        token,
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

// Forgot Password
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email: string, {rejectWithValue}) => {
    try {
      const response = await fetch(`${APP_CONSTANTS.API_BASE_URL}/users`);
      const users = await response.json();

      const user = users.find((u: any) => u.email === email);
      if (!user) {
        throw new Error('User with this email does not exist');
      }

      // Generate reset token
      const resetToken = `reset_token_${Date.now()}`;

      // Update user with reset token
      await fetch(`${APP_CONSTANTS.API_BASE_URL}/users/${user.id}`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          resetToken,
          resetTokenExpires: Date.now() + 3600000, // 1 hour
        }),
      });

      // In real app, send email here
      console.log(`Password reset email sent to ${email}`);
      return {message: 'Password reset email sent successfully'};
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const loadStoredAuth = createAsyncThunk(
  'auth/loadStored',
  async (_, {rejectWithValue}) => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const userData = await AsyncStorage.getItem('user_data');

      if (token && userData) {
        return {
          token,
          user: JSON.parse(userData),
        };
      }
      return null;
    } catch (error) {
      return rejectWithValue('Failed to load stored auth');
    }
  },
);

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await AsyncStorage.clear();
});

// Get stored credentials for biometric login
export const getBiometricCredentials = createAsyncThunk(
  'auth/getBiometricCredentials',
  async (_, {rejectWithValue}) => {
    try {
      const credentials = await AsyncStorage.getItem('biometric_credentials');
      if (credentials) {
        return JSON.parse(credentials);
      }
      return null;
    } catch (error) {
      return rejectWithValue('Failed to get biometric credentials');
    }
  },
);

// Update user biometric status
export const updateUserBiometric = createAsyncThunk(
  'auth/updateBiometric',
  async (isEnabled: boolean, {getState, rejectWithValue}) => {
    try {
      const state = getState() as RootState;
      const user = state.auth.user;

      if (!user) {
        throw new Error('User not found');
      }

      // Update user in database
      await fetch(`${APP_CONSTANTS.API_BASE_URL}/users/${user.id}`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({isBiometricEnabled: isEnabled}),
      });

      // Update local storage
      const updatedUser = {...user, isBiometricEnabled: isEnabled};
      await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));

      // If disabling biometric, remove stored credentials
      if (!isEnabled) {
        await AsyncStorage.removeItem('biometric_credentials');
      }

      return {user: updatedUser};
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

// Initial State
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Auth Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
  extraReducers: builder => {
    // Login
    builder.addCase(loginUser.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Register
    builder.addCase(registerUser.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Forgot Password
    builder.addCase(forgotPassword.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(forgotPassword.fulfilled, state => {
      state.loading = false;
      state.error = null;
    });
    builder.addCase(forgotPassword.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update Biometric
    builder.addCase(updateUserBiometric.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateUserBiometric.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
    });
    builder.addCase(updateUserBiometric.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Load Stored Auth
    builder.addCase(loadStoredAuth.fulfilled, (state, action) => {
      if (action.payload) {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      }
    });

    // Logout
    builder.addCase(logoutUser.fulfilled, state => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    });
  },
});

export const {clearError, setLoading} = authSlice.actions;
export default authSlice.reducer;
