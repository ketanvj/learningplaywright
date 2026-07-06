export class LoginPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    // -----------------------------------------------------------------------
    // LOCATORS — defined once in the constructor, reused everywhere
    // -----------------------------------------------------------------------
    //
    // Tip: Define locators as properties (not methods) so you can chain
    // Playwright's built-in assertions directly:
    //   await expect(loginPage.errorMessage).toBeVisible();
    //
    // -----------------------------------------------------------------------

    /** @readonly */ this.emailInput = page.getByTestId("auth-email-input");
    /** @readonly */ this.passwordInput = page.getByTestId(
      "auth-password-input",
    );
    /** @readonly */ this.submitButton = page.getByTestId("auth-submit-button");
    /** @readonly */ this.rememberMeCheckbox = page.getByTestId(
      "auth-remember-checkbox",
    );
    /** @readonly */ this.forgotPasswordLink =
      page.getByTestId("auth-forgot-link");
    /** @readonly */ this.errorMessage = page.getByTestId("auth-error-message");
    /** @readonly */ this.loginForm = page.getByTestId("login-form");
  }

  // =========================================================================
  // NAVIGATION
  // =========================================================================

  /**
   * Navigate to the login page.
   *
   * WHY a separate goto()?
   * - Not every test starts from the login page
   * - Some tests might already be on the page (e.g., after logout)
   * - Keeping navigation explicit makes tests easier to understand
   */
  async goto() {
    await this.page.goto("/login");
  }

  /**
   * Fills credentials and clicks submit.
   * Handled as a base private/helper method to keep code DRY.
   * @private
   */
  async _fillCredentialsAndSubmit(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  // =========================================================================
  // BUSINESS-LEVEL METHODS
  // =========================================================================
  //
  // These read like user stories:
  //   "Login with email and password"
  // NOT:
  //   "Click email field, type email, click password field, type password..."
  //
  // Each method does ONE logical thing. Tests compose them as needed.
  // =========================================================================

  /**
   * Log in with the given credentials.
   * Waits for navigation to /dashboard after submitting.
   *
   * WHY an object parameter instead of (email, password)?
   * - Test data is already an object: const VALID_USER = { email, password }
   * - Caller can pass it directly:    loginPage.login(VALID_USER)
   * - Adding a new field later (e.g. rememberMe) won't break existing callers
   *
   * @param {{ email: string, password: string }} credentials
   */
  async login({ email, password }) {
    await this._fillCredentialsAndSubmit(email, password);
    // Wait for successful navigation — this is synchronization, not assertion
    await this.page.waitForURL(/dashboard/, { timeout: 10000 });
  }

  /**
   * Attempt to log in with credentials that we expect to fail.
   *
   * WHY a separate method?
   * - login() waits for /dashboard, which would timeout on failure
   * - This method clicks submit but does NOT wait for navigation
   * - The test can then assert on the error message
   *
   * @param {{ email: string, password: string }} credentials
   */
  async loginExpectingError({ email, password }) {
    await this._fillCredentialsAndSubmit(email, password);
    // Wait for the error to appear (synchronization, not assertion)
    await this.errorMessage.waitFor({ state: "visible", timeout: 5000 });
  }

  /**
   * Toggle the "Remember me" checkbox.
   */
  async setRememberMe(enabled = true) {
    if (enabled) {
      await this.rememberMeCheckbox.check();
    } else {
      await this.rememberMeCheckbox.uncheck();
    }
  }
  /**
   * Click the "Forgot password?" link.
   */
  async clickForgotPassword() {
    await this.forgotPasswordLink.click();
  }
}
