import {configureStore} from '@reduxjs/toolkit';
import {act, fireEvent, render, waitFor} from '@testing-library/react-native';
import React from 'react';
import ReactNativeBiometrics from 'react-native-biometrics';
import Toast from 'react-native-toast-message';
import {Provider} from 'react-redux';
import {LoginScreen} from '../../src/screens/auth/LoginScreen';
import authReducer from '../../src/store/slices/authSlice';

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
};

// Create mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user: null,
        token: null,
        loading: false,
        error: null,
        ...initialState,
      },
    },
  });
};

describe('LoginScreen', () => {
  let store: any;

  beforeEach(() => {
    store = createMockStore();
    jest.clearAllMocks();
  });

  const renderLoginScreen = () => {
    return render(
      <Provider store={store}>
        <LoginScreen navigation={mockNavigation} />
      </Provider>,
    );
  };

  describe('Rendering', () => {
    it('should render login form correctly', () => {
      const {getByText, getByPlaceholderText} = renderLoginScreen();

      expect(getByText('Welcome Back!')).toBeTruthy();
      expect(getByText('Sign in to continue your journey')).toBeTruthy();
      expect(getByPlaceholderText('Enter your email')).toBeTruthy();
      expect(getByPlaceholderText('Enter your password')).toBeTruthy();
      expect(getByText('Sign In')).toBeTruthy();
      expect(getByText('Login with Biometrics')).toBeTruthy();
      expect(getByText('Create New Account')).toBeTruthy();
    });

    it('should show loading state when logging in', () => {
      store = createMockStore({loading: true});
      const {getByText} = renderLoginScreen();

      expect(getByText('Sign In')).toBeTruthy();
    });
  });

  describe('Form Validation', () => {
    it('should show error for empty email', async () => {
      const {getByText, getByPlaceholderText} = renderLoginScreen();

      const passwordInput = getByPlaceholderText('Enter your password');
      const loginButton = getByText('Sign In');

      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(getByText('Email is required')).toBeTruthy();
      });
    });

    it('should show error for invalid email format', async () => {
      const {getByText, getByPlaceholderText} = renderLoginScreen();

      const emailInput = getByPlaceholderText('Enter your email');
      const passwordInput = getByPlaceholderText('Enter your password');
      const loginButton = getByText('Sign In');

      fireEvent.changeText(emailInput, 'invalid-email');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(getByText('Please enter a valid email')).toBeTruthy();
      });
    });

    it('should show error for empty password', async () => {
      const {getByText, getByPlaceholderText} = renderLoginScreen();

      const emailInput = getByPlaceholderText('Enter your email');
      const loginButton = getByText('Sign In');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(getByText('Password is required')).toBeTruthy();
      });
    });

    it('should show error for short password', async () => {
      const {getByText, getByPlaceholderText} = renderLoginScreen();

      const emailInput = getByPlaceholderText('Enter your email');
      const passwordInput = getByPlaceholderText('Enter your password');
      const loginButton = getByText('Sign In');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, '123');
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(
          getByText('Password must be at least 6 characters'),
        ).toBeTruthy();
      });
    });

    it('should clear errors when user starts typing', async () => {
      const {getByText, getByPlaceholderText, queryByText} =
        renderLoginScreen();

      const emailInput = getByPlaceholderText('Enter your email');
      const loginButton = getByText('Sign In');

      // Trigger validation error
      fireEvent.press(loginButton);
      await waitFor(() => {
        expect(getByText('Email is required')).toBeTruthy();
      });

      // Start typing to clear error
      fireEvent.changeText(emailInput, 'test@example.com');
      await waitFor(() => {
        expect(queryByText('Email is required')).toBeNull();
      });
    });
  });

  describe('Login Functionality', () => {
    it('should call loginUser action with correct data', async () => {
      const {getByText, getByPlaceholderText} = renderLoginScreen();

      const emailInput = getByPlaceholderText('Enter your email');
      const passwordInput = getByPlaceholderText('Enter your password');
      const loginButton = getByText('Sign In');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(loginButton);

      await waitFor(() => {
        const state = store.getState();
        // Check if login action was dispatched
        expect(state.auth.loading).toBe(true);
      });
    });

    it('should show error toast when login fails', async () => {
      store = createMockStore({error: 'Invalid credentials'});
      renderLoginScreen();

      await waitFor(() => {
        expect(Toast.show).toHaveBeenCalledWith({
          type: 'error',
          text1: 'Login Failed',
          text2: 'Invalid credentials',
        });
      });
    });

    it('should navigate to forgot password screen', () => {
      const {getByText} = renderLoginScreen();

      const forgotPasswordLink = getByText('Forgot Password?');
      fireEvent.press(forgotPasswordLink);

      expect(mockNavigation.navigate).toHaveBeenCalledWith('ForgotPassword');
    });

    it('should navigate to register screen', () => {
      const {getByText} = renderLoginScreen();

      const createAccountButton = getByText('Create New Account');
      fireEvent.press(createAccountButton);

      expect(mockNavigation.navigate).toHaveBeenCalledWith('Register');
    });
  });

  describe('Biometric Login', () => {
    beforeEach(() => {
      // Mock biometric credentials
      store = createMockStore({
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          isBiometricEnabled: true,
        },
      });
    });

    it('should show biometric not setup message when no credentials', async () => {
      const {getByText} = renderLoginScreen();

      const biometricButton = getByText('Login with Biometrics');
      fireEvent.press(biometricButton);

      await waitFor(() => {
        expect(Toast.show).toHaveBeenCalledWith({
          type: 'info',
          text1: '🔐 Biometric Not Setup',
          text2:
            'Go to Profile tab after login to setup biometric authentication.',
        });
      });
    });

    it('should handle biometric authentication success', async () => {
      // Mock successful biometric authentication
      const mockBiometrics = new ReactNativeBiometrics();
      mockBiometrics.simplePrompt = jest.fn().mockResolvedValue({
        success: true,
      });

      const {getByText} = renderLoginScreen();

      const biometricButton = getByText('Login with Biometrics');

      await act(async () => {
        fireEvent.press(biometricButton);
      });

      await waitFor(() => {
        expect(mockBiometrics.simplePrompt).toHaveBeenCalled();
      });
    });

    it('should handle biometric authentication failure', async () => {
      // Mock failed biometric authentication
      const mockBiometrics = new ReactNativeBiometrics();
      mockBiometrics.simplePrompt = jest.fn().mockResolvedValue({
        success: false,
      });

      const {getByText} = renderLoginScreen();

      const biometricButton = getByText('Login with Biometrics');

      await act(async () => {
        fireEvent.press(biometricButton);
      });

      await waitFor(() => {
        expect(Toast.show).toHaveBeenCalledWith({
          type: 'error',
          text1: 'Biometric Authentication',
          text2: 'Authentication cancelled.',
        });
      });
    });

    it('should handle biometric not available', async () => {
      // Mock biometric not available
      const mockBiometrics = new ReactNativeBiometrics();
      mockBiometrics.isSensorAvailable = jest.fn().mockResolvedValue({
        available: false,
      });

      const {getByText} = renderLoginScreen();

      const biometricButton = getByText('Login with Biometrics');

      await act(async () => {
        fireEvent.press(biometricButton);
      });

      await waitFor(() => {
        expect(Toast.show).toHaveBeenCalledWith({
          type: 'error',
          text1: 'Biometric Authentication',
          text2: 'Biometric authentication is not available on this device.',
        });
      });
    });
  });

  describe('Input Handling', () => {
    it('should update email input value', () => {
      const {getByPlaceholderText} = renderLoginScreen();

      const emailInput = getByPlaceholderText('Enter your email');
      fireEvent.changeText(emailInput, 'test@example.com');

      expect(emailInput.props.value).toBe('test@example.com');
    });

    it('should update password input value', () => {
      const {getByPlaceholderText} = renderLoginScreen();

      const passwordInput = getByPlaceholderText('Enter your password');
      fireEvent.changeText(passwordInput, 'password123');

      expect(passwordInput.props.value).toBe('password123');
    });

    it('should handle email input with autoCapitalize none', () => {
      const {getByPlaceholderText} = renderLoginScreen();

      const emailInput = getByPlaceholderText('Enter your email');
      expect(emailInput.props.autoCapitalize).toBe('none');
    });

    it('should handle password input with secureTextEntry', () => {
      const {getByPlaceholderText} = renderLoginScreen();

      const passwordInput = getByPlaceholderText('Enter your password');
      expect(passwordInput.props.secureTextEntry).toBe(true);
    });
  });
});
