// ============================================================================
//
//   auth-fixtures.js — Custom Fixtures for Multi-Role Testing
//
// ============================================================================
//
// WHAT THIS FILE DOES:
//   Extends Playwright's `test` with fixtures that make it easy to work with
//   multiple authenticated users in the same test.
//
// KEY FIXTURES:
//
//   patientStoragePath  — File path to the patient's saved auth state
//   adminStoragePath    — File path to the admin's saved auth state
//   adminContext        — A new BrowserContext pre-loaded with admin auth
//   adminPage           — A Page from adminContext (auto-closed after test)
//
// USAGE:
//
//   import { test, expect } from '../fixtures/auth-fixtures.js';
//
//   test('admin and patient see different views', async ({ page, adminPage }) => {
//     // `page` is the default — authenticated as patient (from project config)
//     // `adminPage` is a separate browser context — authenticated as admin
//     await page.goto('/dashboard');
//     await adminPage.goto('/dashboard');
//     // ... compare what each user sees
//   });
//
// WHY NOT USE page FOR BOTH?
//   Each `page` belongs to one BrowserContext, and a context can only have
//   one storageState. To simulate two users simultaneously, you need
//   two separate contexts.
//
// ============================================================================

import { test as base, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const test = base.extend({

  // -------------------------------------------------------------------------
  // patientStoragePath — Constant fixture (path to patient auth state)
  // -------------------------------------------------------------------------
  // This is a simple fixture that provides a file path.
  // It's useful when you need to create new contexts with specific auth.
  //
  // eslint-disable-next-line no-empty-pattern
  patientStoragePath: async ({}, use) => {
    await use(path.join(__dirname, '..', '.auth', 'patient.json'));
  },

  // -------------------------------------------------------------------------
  // adminStoragePath — Constant fixture (path to admin auth state)
  // -------------------------------------------------------------------------
  // eslint-disable-next-line no-empty-pattern
  adminStoragePath: async ({}, use) => {
    await use(path.join(__dirname, '..', '.auth', 'admin.json'));
  },

  // -------------------------------------------------------------------------
  // adminContext — BrowserContext pre-loaded with admin auth state
  // -------------------------------------------------------------------------
  //
  // HOW IT WORKS:
  //   1. Creates a new BrowserContext with the admin's storageState
  //   2. Yields it to the test via `use()`
  //   3. After the test finishes, closes the context (cleanup)
  //
  // This is the pattern Playwright recommends for multi-role tests:
  //   https://playwright.dev/docs/auth#testing-multiple-roles-together
  //
  adminContext: async ({ browser, adminStoragePath }, use) => {
    const context = await browser.newContext({
      storageState: adminStoragePath,
    });
    await use(context);
    await context.close();
  },

  // -------------------------------------------------------------------------
  // adminPage — Page from adminContext (convenience fixture)
  // -------------------------------------------------------------------------
  //
  // Instead of:
  //   const adminContext = await browser.newContext({ storageState: ... });
  //   const adminPage = await adminContext.newPage();
  //   // ... use adminPage ...
  //   await adminContext.close();
  //
  // You can just:
  //   test('example', async ({ adminPage }) => { ... });
  //
  // The fixture handles context creation and cleanup automatically.
  //
  adminPage: async ({ adminContext }, use) => {
    const page = await adminContext.newPage();
    await use(page);
    // No need to close — closing adminContext (above) closes all its pages
  },
});

export { expect };
