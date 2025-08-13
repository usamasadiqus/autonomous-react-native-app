import {validation} from '../../src/utils/validation';

describe('Validation Utils', () => {
  describe('validateLoginForm', () => {
    it('should return no errors for valid login data', () => {
      const errors = validation.validateLoginForm(
        'test@example.com',
        'password123',
      );
      expect(validation.hasErrors(errors)).toBe(false);
    });

    it('should return error for empty email', () => {
      const errors = validation.validateLoginForm('', 'password123');
      expect(errors.email).toBe('Email is required');
    });

    it('should return error for invalid email format', () => {
      const errors = validation.validateLoginForm(
        'invalid-email',
        'password123',
      );
      expect(errors.email).toBe('Please enter a valid email');
    });

    it('should return error for empty password', () => {
      const errors = validation.validateLoginForm('test@example.com', '');
      expect(errors.password).toBe('Password is required');
    });

    it('should return error for short password', () => {
      const errors = validation.validateLoginForm('test@example.com', '123');
      expect(errors.password).toBe('Password must be at least 6 characters');
    });
  });

  describe('validateRegisterForm', () => {
    it('should return no errors for valid register data', () => {
      const errors = validation.validateRegisterForm(
        'John Doe',
        'test@example.com',
        'password123',
        'password123',
      );
      expect(validation.hasErrors(errors)).toBe(false);
    });

    it('should return error for empty name', () => {
      const errors = validation.validateRegisterForm(
        '',
        'test@example.com',
        'password123',
        'password123',
      );
      expect(errors.name).toBe('Name is required');
    });

    it('should return error for short name', () => {
      const errors = validation.validateRegisterForm(
        'Jo',
        'test@example.com',
        'password123',
        'password123',
      );
      expect(errors.name).toBe('Name must be at least 3 characters');
    });

    it('should return error for empty email', () => {
      const errors = validation.validateRegisterForm(
        'John Doe',
        '',
        'password123',
        'password123',
      );
      expect(errors.email).toBe('Email is required');
    });

    it('should return error for invalid email format', () => {
      const errors = validation.validateRegisterForm(
        'John Doe',
        'invalid-email',
        'password123',
        'password123',
      );
      expect(errors.email).toBe('Please enter a valid email');
    });

    it('should return error for empty password', () => {
      const errors = validation.validateRegisterForm(
        'John Doe',
        'test@example.com',
        '',
        'password123',
      );
      expect(errors.password).toBe('Password is required');
    });

    it('should return error for short password', () => {
      const errors = validation.validateRegisterForm(
        'John Doe',
        'test@example.com',
        '123',
        '123',
      );
      expect(errors.password).toBe('Password must be at least 6 characters');
    });

    it('should return error for password mismatch', () => {
      const errors = validation.validateRegisterForm(
        'John Doe',
        'test@example.com',
        'password123',
        'password456',
      );
      expect(errors.confirmPassword).toBe('Passwords do not match');
    });
  });

  describe('validateForgotPasswordForm', () => {
    it('should return no errors for valid email', () => {
      const errors = validation.validateForgotPasswordForm('test@example.com');
      expect(validation.hasErrors(errors)).toBe(false);
    });

    it('should return error for empty email', () => {
      const errors = validation.validateForgotPasswordForm('');
      expect(errors.email).toBe('Email is required');
    });

    it('should return error for invalid email format', () => {
      const errors = validation.validateForgotPasswordForm('invalid-email');
      expect(errors.email).toBe('Please enter a valid email');
    });
  });

  describe('hasErrors', () => {
    it('should return true when errors object has values', () => {
      const errors = {email: 'Email is required'};
      expect(validation.hasErrors(errors)).toBe(true);
    });

    it('should return false when errors object is empty', () => {
      const errors = {};
      expect(validation.hasErrors(errors)).toBe(false);
    });

    it('should return false when errors object has empty string values', () => {
      const errors = {email: '', password: ''};
      expect(validation.hasErrors(errors)).toBe(false);
    });
  });
});
