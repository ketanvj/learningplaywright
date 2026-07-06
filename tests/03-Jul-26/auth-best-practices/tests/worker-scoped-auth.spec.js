// ============================================================================
//
//   worker-scoped-auth.spec.js — One Account Per Worker Pattern
//
// ============================================================================
//
// PATTERN: Worker-scoped fixtures for parallel auth
//
// PROBLEM:
//   When tests run in parallel across multiple workers, they might all
//   use the same account. This can cause conflicts if the app doesn't
//   support concurrent sessions, or if tests modify user-specific data.
//
// SOLUTION:
//   Assign a different user account to each worker using `{ scope: 'worker' }`.
//   Each worker authenticates ONCE, then all tests in that worker reuse
//   the same auth state.
//
// HOW IT WORKS:
//   1. workerAuth fixture (scope: 'worker') runs ONCE per worker
//   2. It picks a user based on workerInfo.parallelIndex
//   3. Authenticates via API and stores the result
//   4. authenticatedPage fixture (scope: 'test') creates a fresh context
//      per test using the worker's auth state
//
// HealthHub test accounts:
//   Index 0 → patient@healthhub.test (John Doe)
//   Index 1 → sarah@healthhub.test   (Sarah Johnson)
//   Index 2+ → wraps around (index % accounts.length)
//
// ============================================================================

import { test as base, expect } from '@playwright/test';

// ── Test accounts (one per worker) ──────────────────────────────────────────
const TEST_ACCOUNTS = [
  { email: 'patient@healthhub.test', password: 'Test123!', firstName: 'John' },
  { email: 'sarah@healthhub.test', password: 'Test123!', firstName: 'Sarah' },
];

const API_BASE = 'http://localhost:3001/api/v1';
const APP_ORIGIN = 'http://localhost:5173';


// ── Extend test with worker-scoped auth fixtures ────────────────────────────
const test = base.extend({

  // -------------------------------------------------------------------------
  // workerAuth — Authenticates ONCE per worker, shared across all tests
  // -------------------------------------------------------------------------
  //
  // { scope: 'worker' } means this fixture runs once when the worker starts
  // and is reused for every test in that worker. This is much faster than
  // authenticating per-test.
  //
  // Note: Worker-scoped fixtures can only depend on other worker-scoped
  // fixtures or built-in worker fixtures (like workerInfo).
  //
  workerAuth: [async ({ }, use, workerInfo) => {
    // Pick an account based on the worker's parallel index
    const accountIndex = workerInfo.parallelIndex % TEST_ACCOUNTS.length;
    const account = TEST_ACCOUNTS[accountIndex];

    // Authenticate via API (fast, no browser needed)
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: account.email,
        password: account.password,
      }),
    });

    const body = await response.json();

    if (!body.success) {
      throw new Error(`Worker auth failed for ${account.email}: ${JSON.stringify(body.error)}`);
    }

    // Build storageState object (same format Playwright uses)
    const storageState = {
      cookies: [],
      origins: [
        {
          origin: APP_ORIGIN,
          localStorage: [
            { name: 'healthhub_token', value: body.data.token },
          ],
        },
      ],
    };

    // Provide the auth info to tests
    await use({
      user: account,
      storageState,
      token: body.data.token,
    });
  }, { scope: 'worker' }],

  // -------------------------------------------------------------------------
  // authenticatedPage — Fresh page per test, using worker's auth
  // -------------------------------------------------------------------------
  //
  // { scope: 'test' } (the default) means a new page for every test.
  // This gives test isolation while reusing the worker's auth state.
  //
  authenticatedPage: async ({ browser, workerAuth }, use) => {
    // Create a new context with the worker's saved auth state
    const context = await browser.newContext({
      storageState: workerAuth.storageState,
    });
    const page = await context.newPage();

    await use(page);

    // Cleanup: close the context after each test
    await context.close();
  },
});


test.describe('Worker-Scoped Auth', () => {

  // ── Test 1: Verify worker has a unique user ─────────────────────────────
  test('should be authenticated as the worker-assigned user', async ({ authenticatedPage, workerAuth }) => {

    await authenticatedPage.goto('/dashboard');

    // The welcome message should contain the user's first name
    const welcome = authenticatedPage.getByTestId('dashboard-welcome');
    await expect(welcome).toBeVisible();
    await expect(welcome).toContainText(workerAuth.user.firstName);
  });


  // ── Test 2: Token matches the worker-assigned user ──────────────────────
  test('should have the correct token in localStorage', async ({ authenticatedPage, workerAuth }) => {

    await authenticatedPage.goto('/dashboard');

    const token = await authenticatedPage.evaluate(() =>
      localStorage.getItem('healthhub_token')
    );

    // The token in the page should match what the worker obtained
    expect(token).toBe(workerAuth.token);
  });
});

// ============================================================================
// HOW TO VERIFY WORKER ASSIGNMENT
// ============================================================================
//
// Run with multiple workers and verbose output:
//
//   npx playwright test worker-scoped-auth \
//     --config=specs/auth-best-practices/playwright.config.auth-bp.js \
//     --workers=2
//
// You should see:
//   - Worker 0: tests as "John" (patient@healthhub.test)
//   - Worker 1: tests as "Sarah" (sarah@healthhub.test)
//
// ============================================================================
