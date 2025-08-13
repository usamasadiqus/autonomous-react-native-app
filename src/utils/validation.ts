export interface FormErrors {
  [key: string]: string;
}

class Validation {
  // Email validation
  validateEmail(email: string): string | null {
    if (!email) {return 'Email is required';}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {return 'Please enter a valid email';}
    return null;
  }

  // Password validation
  validatePassword(password: string): string | null {
    if (!password) {return 'Password is required';}
    if (password.length < 6) {return 'Password must be at least 6 characters';}
    return null;
  }

  // Name validation
  validateName(name: string): string | null {
    if (!name) {return 'Name is required';}
    if (name.length < 2) {return 'Name must be at least 2 characters';}
    return null;
  }

  // Confirm password validation
  validateConfirmPassword(
    password: string,
    confirmPassword: string,
  ): string | null {
    if (!confirmPassword) {return 'Please confirm your password';}
    if (password !== confirmPassword) {return 'Passwords do not match';}
    return null;
  }

  // Login form validation
  validateLoginForm(email: string, password: string): FormErrors {
    const errors: FormErrors = {};

    const emailError = this.validateEmail(email);
    if (emailError) {errors.email = emailError;}

    if (!password) {errors.password = 'Password is required';}

    return errors;
  }

  // Register form validation
  validateRegisterForm(
    name: string,
    email: string,
    password: string,
    confirmPassword: string,
  ): FormErrors {
    const errors: FormErrors = {};

    const nameError = this.validateName(name);
    if (nameError) {errors.name = nameError;}

    const emailError = this.validateEmail(email);
    if (emailError) {errors.email = emailError;}

    const passwordError = this.validatePassword(password);
    if (passwordError) {errors.password = passwordError;}

    const confirmPasswordError = this.validateConfirmPassword(
      password,
      confirmPassword,
    );
    if (confirmPasswordError) {errors.confirmPassword = confirmPasswordError;}

    return errors;
  }

  // Forgot password form validation
  validateForgotPasswordForm(email: string): FormErrors {
    const errors: FormErrors = {};

    const emailError = this.validateEmail(email);
    if (emailError) {errors.email = emailError;}

    return errors;
  }

  // Check if form has errors
  hasErrors(errors: FormErrors): boolean {
    return Object.keys(errors).length > 0;
  }
}

export const validation = new Validation();
