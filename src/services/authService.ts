// services/authService.ts
import axios from 'axios';
import {User} from '../store/slices/authSlice';
import {APP_CONSTANTS} from '../utils/constants';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

class AuthService {
  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Get all users from db.json
      const response = await axios.get(`${APP_CONSTANTS.API_BASE_URL}/users`);
      const users = response.data;

      // Find user with matching email and password
      const user = users.find(
        (u: any) =>
          u.email === credentials.email && u.password === credentials.password,
      );

      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Generate JWT token (mock)
      const token = `jwt_token_${user.id}_${Date.now()}`;

      // Update user with new token
      await axios.patch(`${APP_CONSTANTS.API_BASE_URL}/users/${user.id}`, {
        token,
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
        message: 'Login successful',
      };
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error.message || 'Login failed',
      );
    }
  }

  // Register new user
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUsers = await axios.get(
        `${APP_CONSTANTS.API_BASE_URL}/users`,
      );
      const userExists = existingUsers.data.find(
        (u: any) => u.email === userData.email,
      );

      if (userExists) {
        throw new Error('User with this email already exists');
      }

      // Generate JWT token (mock)
      const token = `jwt_token_${Date.now()}`;

      // Create new user
      const newUser = {
        name: userData.name,
        email: userData.email,
        password: userData.password, // In real app, hash this
        token,
        createdAt: new Date().toISOString(),
      };

      const response = await axios.post(
        `${APP_CONSTANTS.API_BASE_URL}/users`,
        newUser,
      );

      return {
        user: {
          id: response.data.id,
          email: response.data.email,
          name: response.data.name,
        },
        token,
        message: 'Registration successful',
      };
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error.message || 'Registration failed',
      );
    }
  }

  // Forgot password
  async forgotPassword(email: string): Promise<void> {
    try {
      // Get all users
      const response = await axios.get(`${APP_CONSTANTS.API_BASE_URL}/users`);
      const user = response.data.find((u: any) => u.email === email);

      if (!user) {
        throw new Error('User with this email does not exist');
      }

      // In real app, send email here
      // For now, just simulate success
      console.log(`Password reset email sent to ${email}`);

      // Generate reset token and save it
      const resetToken = `reset_token_${Date.now()}`;
      await axios.patch(`${APP_CONSTANTS.API_BASE_URL}/users/${user.id}`, {
        resetToken,
        resetTokenExpires: Date.now() + 3600000, // 1 hour
      });
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to send reset email',
      );
    }
  }

  // Verify token (for auto-login)
  async verifyToken(token: string): Promise<User | null> {
    try {
      const response = await axios.get(`${APP_CONSTANTS.API_BASE_URL}/users`);
      const user = response.data.find((u: any) => u.token === token);

      if (!user) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
      };
    } catch (error) {
      return null;
    }
  }

  // Logout
  async logout(token: string): Promise<void> {
    try {
      const response = await axios.get(`${APP_CONSTANTS.API_BASE_URL}/users`);
      const user = response.data.find((u: any) => u.token === token);

      if (user) {
        await axios.patch(`${APP_CONSTANTS.API_BASE_URL}/users/${user.id}`, {
          token: null,
        });
      }
    } catch (error) {
      // Ignore logout errors
      console.log('Logout error:', error);
    }
  }
}

export const authService = new AuthService();
