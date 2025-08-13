describe('Critical User Flows', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    // Wait for splash screen to disappear and login screen to appear
    await waitFor(element(by.id('login-title')))
      .toBeVisible()
      .withTimeout(10000);
  });

  describe('Authentication Flow', () => {
    it('should show login screen on app launch', async () => {
      await expect(element(by.id('login-title'))).toBeVisible();
      await expect(element(by.id('login-subtitle'))).toBeVisible();
      await expect(element(by.id('email-input'))).toBeVisible();
      await expect(element(by.id('password-input'))).toBeVisible();
    });

    it('should navigate to register screen', async () => {
      await element(by.id('create-account-button')).tap();
      await expect(element(by.id('register-title'))).toBeVisible();
      await expect(element(by.id('register-subtitle'))).toBeVisible();
    });

    it('should navigate to forgot password screen', async () => {
      await element(by.id('forgot-password-button')).tap();
      await expect(element(by.id('forgot-password-title'))).toBeVisible();
      await expect(element(by.id('forgot-password-subtitle'))).toBeVisible();
    });

    it('should show validation errors for empty login form', async () => {
      await element(by.id('sign-in-button')).tap();
      await expect(element(by.text('Email is required'))).toBeVisible();
      await expect(element(by.text('Password is required'))).toBeVisible();
    });
  });

  describe('Registration Flow', () => {
    beforeEach(async () => {
      await element(by.id('create-account-button')).tap();
    });

    it('should show registration form', async () => {
      await expect(element(by.id('register-title'))).toBeVisible();
      await expect(element(by.id('register-name-input'))).toBeVisible();
      await expect(element(by.id('register-email-input'))).toBeVisible();
      await expect(element(by.id('register-password-input'))).toBeVisible();
      await expect(element(by.id('register-confirm-password-input'))).toBeVisible();
    });

    it('should show validation errors for empty registration form', async () => {
      await element(by.id('create-account-button')).tap();
      await expect(element(by.text('Name is required'))).toBeVisible();
      await expect(element(by.text('Email is required'))).toBeVisible();
      await expect(element(by.text('Password is required'))).toBeVisible();
    });

    it('should show biometric option', async () => {
      await expect(element(by.id('biometric-toggle'))).toBeVisible();
      await expect(element(by.text('Enable Biometric Authentication?'))).toBeVisible();
    });
  });

  describe('Biometric Authentication', () => {
    it('should show biometric login button', async () => {
      await expect(element(by.id('biometric-login-button'))).toBeVisible();
    });

    it('should handle biometric not setup scenario', async () => {
      await element(by.id('biometric-login-button')).tap();
      // This will show a toast message about biometric not being setup
      // In a real scenario, you might want to check for the toast
    });
  });

  describe('Navigation Flow', () => {
    it('should navigate back from forgot password to login', async () => {
      await element(by.id('forgot-password-button')).tap();
      await element(by.id('back-button')).tap();
      await expect(element(by.id('login-title'))).toBeVisible();
    });
  });

  describe('Form Interaction', () => {
    it('should handle email input correctly', async () => {
      const emailInput = element(by.id('email-input'));
      await emailInput.typeText('test@example.com');
      await expect(emailInput).toHaveText('test@example.com');
    });

    it('should handle password input correctly', async () => {
      const passwordInput = element(by.id('password-input'));
      await passwordInput.typeText('password123');
      await expect(passwordInput).toHaveText('password123');
    });

    it('should clear validation errors when user starts typing', async () => {
      // Trigger validation error
      await element(by.id('sign-in-button')).tap();
      await expect(element(by.text('Email is required'))).toBeVisible();

      // Start typing to clear error
      await element(by.id('email-input')).typeText('test@example.com');
      await expect(element(by.text('Email is required'))).not.toBeVisible();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible labels for form inputs', async () => {
      await expect(element(by.label('Email Address'))).toBeVisible();
      await expect(element(by.label('Password'))).toBeVisible();
    });

    it('should have accessible buttons', async () => {
      await expect(element(by.id('sign-in-button'))).toBeVisible();
      await expect(element(by.id('create-account-button'))).toBeVisible();
      await expect(element(by.id('biometric-login-button'))).toBeVisible();
    });
  });

  describe('Login Flow', () => {
    it('should login successfully with correct credentials', async () => {
      await element(by.id('email-input')).typeText('usama@gmail.com');
      await element(by.id('password-input')).typeText('Test@123');
      await element(by.id('sign-in-button')).tap();

      // Wait for navigation to the main dashboard
      await waitFor(element(by.text('My Apps')))
        .toBeVisible()
        .withTimeout(10000);
      await expect(element(by.text('My Apps'))).toBeVisible();
    });
  })
});
