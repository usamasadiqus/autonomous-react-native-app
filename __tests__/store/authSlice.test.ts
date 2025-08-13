import authReducer, {
  loginUser,
  registerUser,
  logoutUser,
  clearError,
  updateUserBiometric,
  getBiometricCredentials,
} from '../../src/store/slices/authSlice';

describe('Auth Slice', () => {
  const initialState = {
    user: null,
    token: null,
    loading: false,
    error: null,
    isAuthenticated: false,
  };

  describe('Initial State', () => {
    it('should return initial state', () => {
      const state = authReducer(undefined, {type: 'unknown'});
      expect(state).toEqual(initialState);
    });
  });

  describe('Login User', () => {
    it('should handle pending state', () => {
      const action = {type: loginUser.pending.type};
      const state = authReducer(initialState, action);
      expect(state.loading).toBe(true);
      expect(state.error).toBe(null);
    });

    it('should handle fulfilled state', () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        isBiometricEnabled: false,
      };
      const mockToken = 'mock-token';
      const action = {
        type: loginUser.fulfilled.type,
        payload: {user: mockUser, token: mockToken},
      };
      const state = authReducer(initialState, action);
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe(mockToken);
      expect(state.loading).toBe(false);
      expect(state.isAuthenticated).toBe(true);
      expect(state.error).toBe(null);
    });

    it('should handle rejected state', () => {
      const errorMessage = 'Invalid credentials';
      const action = {
        type: loginUser.rejected.type,
        error: {message: errorMessage},
      };
      const state = authReducer(initialState, action);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('Register User', () => {
    it('should handle pending state', () => {
      const action = {type: registerUser.pending.type};
      const state = authReducer(initialState, action);
      expect(state.loading).toBe(true);
      expect(state.error).toBe(null);
    });

    it('should handle fulfilled state', () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        isBiometricEnabled: false,
      };
      const mockToken = 'mock-token';
      const action = {
        type: registerUser.fulfilled.type,
        payload: {user: mockUser, token: mockToken},
      };
      const state = authReducer(initialState, action);
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe(mockToken);
      expect(state.loading).toBe(false);
      expect(state.isAuthenticated).toBe(true);
      expect(state.error).toBe(null);
    });

    it('should handle rejected state', () => {
      const errorMessage = 'Email already exists';
      const action = {
        type: registerUser.rejected.type,
        error: {message: errorMessage},
      };
      const state = authReducer(initialState, action);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('Logout User', () => {
    it('should reset state to initial values', () => {
      const stateWithUser = {
        ...initialState,
        user: {id: '1', name: 'Test'},
        token: 'mock-token',
        isAuthenticated: true,
      };
      const action = {type: logoutUser.type};
      const state = authReducer(stateWithUser, action);
      expect(state).toEqual(initialState);
    });
  });

  describe('Clear Error', () => {
    it('should clear error state', () => {
      const stateWithError = {
        ...initialState,
        error: 'Some error',
      };
      const action = {type: clearError.type};
      const state = authReducer(stateWithError, action);
      expect(state.error).toBe(null);
    });
  });

  describe('Update User Biometric', () => {
    it('should handle pending state', () => {
      const action = {type: updateUserBiometric.pending.type};
      const state = authReducer(initialState, action);
      expect(state.loading).toBe(true);
    });

    it('should handle fulfilled state with biometric enabled', () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        isBiometricEnabled: false,
      };
      const stateWithUser = {
        ...initialState,
        user: mockUser,
        isAuthenticated: true,
      };
      const action = {
        type: updateUserBiometric.fulfilled.type,
        payload: {isBiometricEnabled: true},
      };
      const state = authReducer(stateWithUser, action);
      expect(state.user?.isBiometricEnabled).toBe(true);
      expect(state.loading).toBe(false);
    });

    it('should handle fulfilled state with biometric disabled', () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        isBiometricEnabled: true,
      };
      const stateWithUser = {
        ...initialState,
        user: mockUser,
        isAuthenticated: true,
      };
      const action = {
        type: updateUserBiometric.fulfilled.type,
        payload: {isBiometricEnabled: false},
      };
      const state = authReducer(stateWithUser, action);
      expect(state.user?.isBiometricEnabled).toBe(false);
      expect(state.loading).toBe(false);
    });

    it('should handle rejected state', () => {
      const errorMessage = 'Failed to update biometric';
      const action = {
        type: updateUserBiometric.rejected.type,
        error: {message: errorMessage},
      };
      const state = authReducer(initialState, action);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('Get Biometric Credentials', () => {
    it('should handle pending state', () => {
      const action = {type: getBiometricCredentials.pending.type};
      const state = authReducer(initialState, action);
      expect(state.loading).toBe(true);
    });

    it('should handle fulfilled state', () => {
      const mockCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };
      const action = {
        type: getBiometricCredentials.fulfilled.type,
        payload: mockCredentials,
      };
      const state = authReducer(initialState, action);
      expect(state.loading).toBe(false);
    });

    it('should handle rejected state', () => {
      const errorMessage = 'No biometric credentials found';
      const action = {
        type: getBiometricCredentials.rejected.type,
        error: {message: errorMessage},
      };
      const state = authReducer(initialState, action);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });
});
