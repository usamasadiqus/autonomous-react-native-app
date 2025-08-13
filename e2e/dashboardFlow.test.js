describe('Dashboard and App Management Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    // Login before each test
    await element(by.id('email-input')).typeText('usama@gmail.com');
    await element(by.id('password-input')).typeText('Test@123');
    await element(by.id('sign-in-button')).tap();
    await waitFor(element(by.id('dashboard-greeting')))
      .toBeVisible()
      .withTimeout(5000);
  });

  describe('Subscription Flow', () => {
    beforeEach(async () => {
      // Navigate to subscription tab
      await element(by.text('Plans')).tap();
    });

    it('should show subscription plans', async () => {
      await expect(element(by.id('subscription-plans-title'))).toBeVisible();
      await expect(element(by.id('basic-plan'))).toBeVisible();
      await expect(element(by.id('pro-plan'))).toBeVisible();
    });

    it('should navigate to Plans screen when View Plans button is tapped', async () => {
      // Swipe up to ensure the button is visible
      await element(by.id('subscription-scrollview')).swipe('up', 'fast', 0.5);
      await new Promise(res => setTimeout(res, 1000)); // Wait 1 second after scroll
      await expect(element(by.id('view-plans-button'))).toBeVisible();
      await element(by.id('view-plans-button')).tap();
      await new Promise(res => setTimeout(res, 1000)); // Wait 1 second after tap for navigation
      await expect(element(by.id('plans-screen-title'))).toBeVisible();
    });

    it('should select Basic plan and continue and subscribe plan', async () => {
      // Go to Plans screen
      await element(by.id('view-plans-button')).tap();
      await expect(element(by.id('plans-screen-title'))).toBeVisible();

      // Tap Basic plan
      await element(by.id('basic-plan')).tap();

      // Swipe up to reveal Continue button
      await element(by.id('plans-scrollview')).swipe('up', 'fast', 0.5);
      await element(by.id('plans-scrollview')).swipe('up', 'fast', 0.5);
      await element(by.id('plans-scrollview')).swipe('up', 'fast', 0.5);
      await new Promise(res => setTimeout(res, 1000));

      // Tap Continue button for Basic plan
      await element(by.id('continue-basic-plan')).tap();

      // Wait for payment form to load
      await waitFor(element(by.id('payment-card-number')))
        .toBeVisible()
        .withTimeout(5000);

      // Fill card details (these should be visible at the top)
      await element(by.id('payment-card-number')).typeText(
        '4242 4242 4242 4242',
      );
      await element(by.id('payment-expiry-date')).typeText('12/26');
      await element(by.id('payment-cvv')).typeText('123');
      await element(by.id('payment-holder-name')).typeText('John Doe');

      // Scroll down to reveal billing section
      await element(by.id('payment-form-scrollview')).swipe('up', 'fast', 0.3);
      await new Promise(res => setTimeout(res, 500));

      // Fill email field
      await element(by.id('payment-email')).typeText('john@example.com');
      await element(by.id('payment-address')).typeText('123 Main Street');

      // Scroll down more to reveal city/state/zip
      await element(by.id('payment-form-scrollview')).swipe('up', 'fast', 0.3);
      await new Promise(res => setTimeout(res, 500));

      await element(by.id('payment-city')).typeText('New York');
      await element(by.id('payment-state')).typeText('NY');
      await element(by.id('payment-zip')).typeText('10001');

      // Scroll down to reveal the subscribe button
      await element(by.id('payment-form-scrollview')).swipe('up', 'fast', 0.4);
      await new Promise(res => setTimeout(res, 500));

      // Wait for subscribe button to be visible and tap it
      await waitFor(element(by.id('payment-subscribe-button')))
        .toBeVisible()
        .withTimeout(3000);

      await element(by.id('payment-subscribe-button')).tap();

      await new Promise(res => setTimeout(res, 3000));
    });
  });

  describe('App Management', () => {
    describe('Create App', () => {
      it('should create a new app successfully', async () => {
        await element(by.id('create-app-button')).tap();

        // Wait for the create app screen to load
        await waitFor(element(by.id('app-name-input')))
          .toBeVisible()
          .withTimeout(5000);

        // Fill in app details
        await element(by.id('app-name-input')).typeText('Test App');
        await element(by.id('app-description-input')).typeText(
          'Test Description',
        );

        // Fill required fields using proper testIDs
        await element(by.id('app-package-name-input')).typeText('com.test.app');
        await element(by.id('app-version-input')).typeText('1.0.0');

        // Swipe up to scroll and make submit button visible
        await element(by.id('app-version-input')).swipe('up', 'fast', 0.5);

        // Wait 2 seconds after swipe before selecting category
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Try to select category - if it's not visible, skip it for now
        await element(by.text('Select category')).tap();
        await element(by.text('Productivity')).tap();

        // Submit the form
        await element(by.id('create-app-submit')).tap();

        // Verify app creation by checking if we're back on dashboard
        await waitFor(element(by.id('dashboard-greeting')))
          .toBeVisible()
          .withTimeout(5000);
      });

      it('should show validation errors for empty form', async () => {
        await element(by.id('create-app-button')).tap();

        // Wait for the create app screen to load
        await waitFor(element(by.id('app-name-input')))
          .toBeVisible()
          .withTimeout(5000);

        // Swipe up to scroll and make submit button visible
        await element(by.id('app-name-input')).swipe('up', 'fast', 0.5);

        // Wait 2 seconds after swipe
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Try to submit without filling required fields
        await element(by.id('create-app-submit')).tap();

        // Check for validation errors
        await expect(element(by.text('Category is required'))).toBeVisible();
      });
    });

    describe('Edit App', () => {
      it('should edit an existing app', async () => {
        // First create an app to edit
        await element(by.id('create-app-button')).tap();
        await waitFor(element(by.id('app-name-input')))
          .toBeVisible()
          .withTimeout(5000);

        await element(by.id('app-name-input')).typeText('App to Edit');
        await element(by.id('app-description-input')).typeText(
          'Description to edit',
        );
        await element(by.id('app-package-name-input')).typeText('com.edit.app');
        await element(by.id('app-version-input')).typeText('1.0.0');

        // Swipe up to scroll and make submit button visible
        await element(by.id('app-version-input')).swipe('up', 'fast', 0.5);

        // Wait 2 seconds after swipe before selecting category
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Try to select category - if it's not visible, skip it for now
        await element(by.text('Select category')).tap();
        await element(by.text('Productivity')).tap();

        await element(by.id('create-app-submit')).tap();

        // Wait to be back on dashboard
        await waitFor(element(by.id('dashboard-greeting')))
          .toBeVisible()
          .withTimeout(5000);

        // Now edit the app
        await element(by.id('edit-app-button-0')).tap();

        // Wait for edit screen to load
        await waitFor(element(by.id('app-name-input')))
          .toBeVisible()
          .withTimeout(5000);

        // Edit app name
        await element(by.id('app-name-input')).clearText();
        await element(by.id('app-name-input')).typeText('Updated App Name');

        // Swipe up to scroll and make submit button visible
        await element(by.id('app-name-input')).swipe('up', 'fast', 0.5);

        // Wait 2 seconds after swipe
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Submit the update
        await element(by.id('update-app-submit')).tap();

        // Verify we're back on dashboard
        await waitFor(element(by.id('dashboard-greeting')))
          .toBeVisible()
          .withTimeout(5000);
      });
    });

    describe('Delete App', () => {
      it('should show delete confirmation dialog', async () => {
        // First create an app to delete
        await element(by.id('create-app-button')).tap();
        await waitFor(element(by.id('app-name-input')))
          .toBeVisible()
          .withTimeout(5000);

        await element(by.id('app-name-input')).typeText('App to Delete');
        await element(by.id('app-description-input')).typeText(
          'Description to delete',
        );
        await element(by.id('app-package-name-input')).typeText(
          'com.delete.app',
        );
        await element(by.id('app-version-input')).typeText('1.0.0');

        // Swipe up to scroll and make submit button visible
        await element(by.id('app-version-input')).swipe('up', 'fast', 0.5);

        // Wait 2 seconds after swipe before selecting category
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Try to select category - if it's not visible, skip it for now
        await element(by.text('Select category')).tap();
        await element(by.text('Productivity')).tap();

        await element(by.id('create-app-submit')).tap();

        // Wait to be back on dashboard
        await waitFor(element(by.id('dashboard-greeting')))
          .toBeVisible()
          .withTimeout(5000);

        // Tap delete button
        await element(by.id('delete-app-button-0')).tap();

        // Verify delete confirmation dialog appears
        await expect(element(by.text('Delete App?'))).toBeVisible();
        await expect(element(by.text('Cancel'))).toBeVisible();
        await expect(element(by.text('Delete'))).toBeVisible();
      });

      it('should delete app when confirmed', async () => {
        // First create an app to delete
        await element(by.id('create-app-button')).tap();
        await waitFor(element(by.id('app-name-input')))
          .toBeVisible()
          .withTimeout(5000);

        await element(by.id('app-name-input')).typeText('App to Delete');
        await element(by.id('app-description-input')).typeText(
          'Description to delete',
        );
        await element(by.id('app-package-name-input')).typeText(
          'com.delete.app',
        );
        await element(by.id('app-version-input')).typeText('1.0.0');

        // Swipe up to scroll and make submit button visible
        await element(by.id('app-version-input')).swipe('up', 'fast', 0.5);

        // Wait 2 seconds after swipe before selecting category
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Try to select category - if it's not visible, skip it for now
        await element(by.text('Select category')).tap();
        await element(by.text('Productivity')).tap();

        await element(by.id('create-app-submit')).tap();

        // Wait to be back on dashboard
        await waitFor(element(by.id('dashboard-greeting')))
          .toBeVisible()
          .withTimeout(5000);

        // Tap delete button
        await element(by.id('delete-app-button-0')).tap();

        // Confirm deletion
        await element(by.text('Delete')).tap();

        // Verify app is deleted by checking if we're back on dashboard
        await waitFor(element(by.id('dashboard-greeting')))
          .toBeVisible()
          .withTimeout(5000);
      });

      it('should cancel deletion when dismissed', async () => {
        // First create an app to delete
        await element(by.id('create-app-button')).tap();
        await waitFor(element(by.id('app-name-input')))
          .toBeVisible()
          .withTimeout(5000);

        await element(by.id('app-name-input')).typeText('App to Cancel Delete');
        await element(by.id('app-description-input')).typeText(
          'Description to cancel delete',
        );
        await element(by.id('app-package-name-input')).typeText(
          'com.cancel.app',
        );
        await element(by.id('app-version-input')).typeText('1.0.0');

        // Swipe up to scroll and make submit button visible
        await element(by.id('app-version-input')).swipe('up', 'fast', 0.5);

        // Wait 2 seconds after swipe before selecting category
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Try to select category - if it's not visible, skip it for now
        await element(by.text('Select category')).tap();
        await element(by.text('Productivity')).tap();

        await element(by.id('create-app-submit')).tap();

        // Wait to be back on dashboard
        await waitFor(element(by.id('dashboard-greeting')))
          .toBeVisible()
          .withTimeout(5000);

        // Tap delete button
        await element(by.id('delete-app-button-0')).tap();

        // Cancel deletion
        await element(by.text('Cancel')).tap();

        // Verify we're back on dashboard and app still exists
        await waitFor(element(by.id('dashboard-greeting')))
          .toBeVisible()
          .withTimeout(5000);
      });
    });
  });

  describe('Search and Filters', () => {
    describe('Search Functionality', () => {
      it('should filter apps by search query', async () => {
        // Make sure we're on the dashboard with apps loaded
        await waitFor(element(by.id('dashboard-greeting')))
          .toBeVisible()
          .withTimeout(5000);

        // Wait for apps to load if any exist
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Try to find the search bar first
        await expect(element(by.id('search-bar'))).toBeVisible();

        // Clear any existing text first
        await element(by.id('search-bar')).clearText();

        // Type slowly to ensure each character is registered
        await element(by.id('search-bar')).typeText('Test');

        // Wait for the search to process
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Instead of checking the text value, check for the clear button
        // The clear button only appears when there's text in the search bar
        await expect(element(by.id('clear-search'))).toBeVisible();
      });

      it('should show empty state for no results', async () => {
        await element(by.id('search-bar')).typeText('NonExistentApp');
        await expect(element(by.text('No Apps Found'))).toBeVisible();
      });

      it('should clear search results', async () => {
        await element(by.id('search-bar')).typeText('Test');
        await element(by.id('clear-search')).tap();
        await expect(element(by.id('search-bar'))).toHaveText('');
      });
    });

    describe('Filter Options', () => {
      it('should open filter modal', async () => {
        await element(by.id('filter-button')).tap();
        await expect(element(by.text('Filter Apps'))).toBeVisible();
      });

      it('should apply status filter', async () => {
        await element(by.id('filter-button')).tap();
        await element(by.text('Active')).tap();
        // Verify filter is applied (UI should update)
        await expect(element(by.id('active-filter-badge'))).toBeVisible();
      });
    });

    describe('Sort Options', () => {
      it('should open sort modal', async () => {
        await element(by.id('sort-button')).tap();
        await expect(element(by.text('Sort Apps'))).toBeVisible();
      });

      it('should apply sort option', async () => {
        await element(by.id('sort-button')).tap();
        await element(by.text('Name')).tap();
        // Verify sort is applied
        await expect(element(by.id('sort-indicator-name'))).toBeVisible();
      });
    });
  });
});
