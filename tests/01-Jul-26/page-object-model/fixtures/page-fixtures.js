import { test as base, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage.js";
import { DashboardPage } from "../pages/Dashboard.js";
import { AppointmentsPage } from "../pages/AppointmentsPage.js";

// ---------------------------------------------------------------------------
// Extend the base test with page object fixtures
// ---------------------------------------------------------------------------
//
// Each fixture:
//   1. Destructures { page } from the base fixtures
//   2. Creates a page object instance
//   3. Passes it to `use()` — this is where the test body runs
//
// The type annotation in the generic helps with IDE autocomplete.
// In JavaScript we use JSDoc; in TypeScript you'd use the generic directly.
// ---------------------------------------------------------------------------

export const test = base.extend(
  /** @type {import('@playwright/test').Fixtures<{
   *   loginPage: import('../pages/LoginPage.js').LoginPage,
   *   dashboardPage: import('../pages/Dashboard.js').DashboardPage,
   *   appointmentsPage: import('../pages/AppointmentsPage.js').AppointmentsPage,
   * }>} */
  ({
    // -----------------------------------------------------------------------
    // loginPage fixture
    // -----------------------------------------------------------------------
    // Creates a LoginPage instance for each test.
    // The fixture is "lazy" — it only runs if the test actually uses it.
    // -----------------------------------------------------------------------
    loginPage: async ({ page }, use) => {
      const loginPage = new LoginPage(page);
      await use(loginPage);
      console.log("This is tear down");
    },

    // -----------------------------------------------------------------------
    // dashboardPage fixture
    // -----------------------------------------------------------------------
    // Creates a DashboardPage (which includes Header + Sidebar components).
    // Note: This doesn't navigate to the dashboard — tests do that explicitly.
    // -----------------------------------------------------------------------
    dashboardPage: async ({ page }, use) => {
      await use(new DashboardPage(page));
    },

    // -----------------------------------------------------------------------
    // appointmentsPage fixture
    // -----------------------------------------------------------------------
    appointmentsPage: async ({ page }, use) => {
      await use(new AppointmentsPage(page));
    },

    // -----------------------------------------------------------------------
    // OPTIONAL: authenticatedPage fixture (commented out)
    // -----------------------------------------------------------------------
    // If most of your tests require login, you could create a fixture that
    // logs in automatically. Uncomment if needed:
    //
    // authenticatedPage: async ({ page }, use) => {
    //   const loginPage = new LoginPage(page);
    //   await loginPage.goto();
    //   await loginPage.login('patient@healthhub.test', 'Test123!');
    //   await use(page);
    // },
    //
    // This is a DESIGN CHOICE. Some teams prefer explicit login in tests
    // (more visible), others prefer auto-login fixtures (less boilerplate).
    // -----------------------------------------------------------------------
  }),
);

// ---------------------------------------------------------------------------
// Re-export expect so tests can import everything from one place:
//
//   import { test, expect } from '../fixtures/pom-fixtures.js';
//
// Instead of mixing imports:
//   import { test } from '../fixtures/pom-fixtures.js';    // custom
//   import { expect } from '@playwright/test';              // base
// ---------------------------------------------------------------------------

export { expect };
