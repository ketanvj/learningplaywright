import { test, expect } from "../fixtures/page-fixtures.js";

// ---------------------------------------------------------------------------
// Test data — defined at the top for easy maintenance
// ---------------------------------------------------------------------------
const VALID_USER = {
  email: "patient@healthhub.test",
  password: "Test123!",
};

const INVALID_USER = {
  email: "wrong@email.com",
  password: "WrongPassword123",
};

test.describe("Login Page (POM)", () => {
  // -------------------------------------------------------------------------
  // Navigate to login page before each test
  // -------------------------------------------------------------------------
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test("should login successfully with valid credentials", async ({
    loginPage,
    page,
  }) => {
    // The login() method fills email, password, clicks submit,
    // and waits for /dashboard — all encapsulated.
    await loginPage.login(VALID_USER);

    // Assertion stays in the test — the page object doesn't assert!
    await expect(page).toHaveURL(/dashboard/);
  });

  // -------------------------------------------------------------------------
  // Sad path: invalid credentials show error
  // -------------------------------------------------------------------------
  test("should show error message for invalid credentials", async ({
    loginPage,
  }) => {
    // loginExpectingError() fills the form and clicks submit,
    // but does NOT wait for /dashboard (it would timeout).
    // Instead, it waits for the error message to appear.
    await loginPage.loginExpectingError(INVALID_USER);
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toHaveText(
      "Invalid email or password",
    );
  });

  test("should check the Remember Me checkbox", async ({ loginPage }) => {
    // Check the checkbox
    await loginPage.setRememberMe(true);

    await expect(loginPage.rememberMeCheckbox).toBeChecked();

    // Uncheck the checkbox
    await loginPage.setRememberMe(false);
    await expect(loginPage.rememberMeCheckbox).not.toBeChecked();
  });
});
