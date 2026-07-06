// =============================================================================
// LOGIN WITHOUT FIXTURE — Page Object Model, manual instantiation
// =============================================================================
//
// WHAT IS DIFFERENT HERE vs login.spec.js?
// -----------------------------------------
// login.spec.js imports `test` from the custom fixture file:
//
//   import { test, expect } from '../fixtures/page-fixtures.js';
//
// That fixture file does this work behind the scenes for every test:
//
//   loginPage: async ({ page }, use) => {
//     const loginPage = new LoginPage(page);   // ← created automatically
//     await use(loginPage);                     // ← injected into test args
//   }
//
// So the test just receives loginPage ready-made:
//
//   test('...', async ({ loginPage }) => { ... });
//
// HERE, we import `test` directly from '@playwright/test' (no fixture).
// We create the page objects MANUALLY inside each test:
//
//   test('...', async ({ page }) => {
//     const loginPage = new LoginPage(page);       // ← we do this ourselves
//     const dashboardPage = new DashboardPage(page);
//   });
//
// WHEN TO USE WHICH APPROACH
// ---------------------------
//  Fixtures       → multiple tests need the same page object; DRY, less boilerplate
//  Manual (this)  → one-off tests, learning, or when fixture overhead isn't worth it
//
// =============================================================================

import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { DashboardPage } from '../pages/Dashboard.js';

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------
const VALID_USER = {
  email: 'patient@healthhub.test',
  password: 'Test123!',
};

const INVALID_USER = {
  email: 'wrong@healthhub.test',
  password: 'BadPassword99',
};

// =============================================================================
// TESTS
// =============================================================================

test.describe('Login — manual POM instantiation (no fixture)', () => {

  // ---------------------------------------------------------------------------
  // Test 1: Successful login lands on dashboard
  // ---------------------------------------------------------------------------
  // HOW IT WORKS:
  //   1. We receive { page } from Playwright's built-in test args
  //   2. We wrap page in LoginPage ourselves — same object, just not injected
  //   3. We also create a DashboardPage with the same page instance
  //      (both objects share the same browser tab)
  // ---------------------------------------------------------------------------
  test('valid credentials → lands on dashboard and shows welcome heading', async ({ page }) => {
    // Step 1: Instantiate both page objects manually
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    // Step 2: Navigate to login and log in
    await loginPage.goto();
    await loginPage.login(VALID_USER);

    // Step 3: Assert using the DashboardPage locator — no raw getByTestId here
    await expect(dashboardPage.welcomeHeading).toBeVisible();
    await expect(page).toHaveURL(/dashboard/);
  });

  // ---------------------------------------------------------------------------
  // Test 2: Invalid credentials show error — page stays on /login
  // ---------------------------------------------------------------------------
  // loginExpectingError() fills the form and clicks submit, but waits for
  // the error message (not /dashboard). If we used login() here it would
  // timeout waiting for a URL that never comes.
  // ---------------------------------------------------------------------------
  test('invalid credentials → error message shown, stays on login page', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.loginExpectingError(INVALID_USER);

    // loginPage.errorMessage is a Locator property — pass it straight to expect()
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toHaveText("Invalid email or password");
    await expect(page).toHaveURL(/login/);
  });

  // ---------------------------------------------------------------------------
  // Test 3: After login, dashboard welcome text contains the user's name
  // ---------------------------------------------------------------------------
  // DashboardPage.getWelcomeText() returns the raw text so WE decide what to
  // assert — the page object never makes that call itself.
  // ---------------------------------------------------------------------------
  test('welcome heading contains a greeting after login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.goto();
    await loginPage.login(VALID_USER);

    const welcomeText = await dashboardPage.getWelcomeText();
    // The heading says something like "Good morning, John!" — just verify it's not empty
    expect(welcomeText).toBeTruthy();
  });

  // ---------------------------------------------------------------------------
  // Test 4: Sidebar navigation to Appointments works after login
  // ---------------------------------------------------------------------------
  // DashboardPage.navigateToAppointments() delegates to the Sidebar component
  // internally — the test doesn't need to know that detail.
  // ---------------------------------------------------------------------------
  test('can navigate to Appointments from the dashboard sidebar', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.goto();
    await loginPage.login(VALID_USER);

    await dashboardPage.navigateToAppointments();
    await expect(page).toHaveURL(/appointments/);
  });

});
