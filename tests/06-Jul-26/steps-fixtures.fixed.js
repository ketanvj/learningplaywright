// ============================================================================
//
//   steps-fixtures.fixed.js — Shared fixtures for the Allure demo spec files
//
// ============================================================================
//
// All four *.fixed.spec.js files in this folder import { test, expect } from
// here instead of directly from '@playwright/test'. That gives them two
// things the plain import doesn't:
//
//   1. A default baseURL of http://localhost:5173, so goto('/login') and
//      goto('/dashboard') resolve without every test spelling out the host.
//   2. An `authenticatedPage` fixture — a page that has already logged in
//      as patient@healthhub.test and landed on /dashboard, for tests that
//      don't care about exercising the login flow itself.
//
// ============================================================================

import { test as base, expect } from '@playwright/test';

export const test = base.extend({
  baseURL: async ({}, use) => {
    await use('http://localhost:5173');
  },

  authenticatedPage: async ({ page }, use) => {
    await page.goto('/login');
    await page.getByTestId('auth-email-input').fill('patient@healthhub.test');
    await page.getByTestId('auth-password-input').fill('Test123!');
    await page.getByTestId('auth-submit-button').click();
    await page.waitForURL(/dashboard/, { timeout: 10000 });

    await use(page);
  },
});

export { expect };
