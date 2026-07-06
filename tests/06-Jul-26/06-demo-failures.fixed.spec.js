// ============================================================================
// 06 - DEMO FAILURES  (FIXED — runtime wired up)
// ============================================================================
//
// NEW file, added purely for live-demo purposes. It contains a deliberately
// UNEVEN number of intentionally broken tests per root-cause bucket — real
// suites never fail evenly across categories, so the Categories widget looks
// far more convincing with 2 of one kind and 7 of another than with a neat
// 1-for-1 split. Every message shape below was empirically verified (not
// guessed) against the real error text Playwright/Allure produce — see
// tests/allure/categories.json for the matching regexes.
//
// Allure-playwright maps Playwright's outcome to an Allure status like this
// (node_modules/allure-playwright/dist/esm/utils.js):
//
//   Playwright status  →  Allure status
//   ------------------    --------------
//   "skipped"           →  skipped
//   "timedOut"          →  broken   (ONLY case that produces "broken" —
//                                    verified: per-action locator timeouts
//                                    do NOT produce "broken", they produce
//                                    "failed", same as assertion failures)
//   anything else       →  failed
//
// Five root-cause buckets, deliberately uneven counts:
//
//   1. UI Assertion Failures             (4 tests) — expect(...) mismatches
//   2. Element Not Found / Locator Tmt.  (7 tests) — raw action timeouts
//   3. Ignored Tests                     (5 tests) — test.skip()
//   4. Test / Suite Timeouts             (2 tests) — whole-test timeout
//   5. API / Network Failures            (2 tests) — unreachable backend
//
// Uses './steps-fixtures.fixed.js' so all the allure.* calls actually attach
// data (severity, owner, tags, description) — same as files 02-05.
// ============================================================================

import { test, expect } from './steps-fixtures.fixed.js';

let allure;
try {
  allure = await import('allure-js-commons');
} catch {
  allure = null;
}

const Severity = allure?.Severity ?? {
  CRITICAL: 'critical',
  NORMAL: 'normal',
  MINOR: 'minor',
};

const tagFailure = () => {
  allure?.tag('demo-failure');
};


// ============================================================================
// 1) UI ASSERTION FAILURES — 4 tests, different matchers, same shape
// ============================================================================
// Every one of these throws "Error: expect(locator).toXxx(...) failed" —
// verified for toHaveText, toBeVisible, toHaveCount and toContainText.
// Allure status: failed. Category: "UI Assertion Failures".
// ============================================================================

test.describe('Demo Failures — UI Assertion Failures', () => {

  test('toHaveText mismatch — dashboard welcome text is wrong', async ({ page }) => {
    allure?.epic('HealthHub Patient Portal');
    allure?.feature('Dashboard');
    allure?.severity(Severity.CRITICAL);
    allure?.owner('team-frontend');
    tagFailure();
    allure?.description('Intentional: asserts welcome text that will never appear → "expect(...).toHaveText() failed".');

    await page.goto('/login');
    await page.getByTestId('auth-email-input').fill('patient@healthhub.test');
    await page.getByTestId('auth-password-input').fill('Test123!');
    await page.getByTestId('auth-submit-button').click();
    await page.waitForURL(/dashboard/, { timeout: 10000 });

    await test.step('Assert welcome banner text (intentionally wrong)', async () => {
      await expect(page.getByTestId('dashboard-welcome')).toHaveText(
        'This text will never appear on the dashboard',
        { timeout: 3000 }
      );
    });
  });

  test('toBeVisible mismatch — nonexistent widget expected visible', async ({ page }) => {
    allure?.epic('HealthHub Patient Portal');
    allure?.feature('Dashboard');
    allure?.severity(Severity.NORMAL);
    allure?.owner('team-frontend');
    tagFailure();
    allure?.description('Intentional: asserts visibility of a widget that does not exist → "expect(...).toBeVisible() failed".');

    await page.goto('/login');
    await test.step('Assert a nonexistent widget is visible', async () => {
      await expect(page.getByTestId('nonexistent-widget-xyz')).toBeVisible({ timeout: 3000 });
    });
  });

  test('toHaveCount mismatch — wrong number of form elements', async ({ page }) => {
    allure?.epic('HealthHub Patient Portal');
    allure?.feature('Authentication');
    allure?.severity(Severity.MINOR);
    allure?.owner('team-frontend');
    tagFailure();
    allure?.description('Intentional: asserts an impossible element count → "expect(...).toHaveCount() failed".');

    await page.goto('/login');
    await test.step('Assert an impossible form count', async () => {
      await expect(page.locator('form')).toHaveCount(99, { timeout: 3000 });
    });
  });

  test('toContainText mismatch — page body missing expected text', async ({ page }) => {
    allure?.epic('HealthHub Patient Portal');
    allure?.feature('Authentication');
    allure?.severity(Severity.MINOR);
    allure?.owner('team-frontend');
    tagFailure();
    allure?.description('Intentional: asserts body text that will never exist → "expect(...).toContainText() failed".');

    await page.goto('/login');
    await test.step('Assert impossible body text', async () => {
      await expect(page.locator('body')).toContainText('some text that will never exist xyz123', { timeout: 3000 });
    });
  });
});


// ============================================================================
// 2) ELEMENT NOT FOUND / LOCATOR TIMEOUTS — 7 tests, different actions
// ============================================================================
// Every one of these throws "TimeoutError: locator.<action>: Timeout ...
// exceeded." (verified for click, fill, waitFor, check, selectOption, hover,
// dblclick). Allure status: failed (NOT broken — that surprised me too, see
// header note above). Category: "Element Not Found / Locator Timeouts".
// ============================================================================

test.describe('Demo Failures — Element Not Found / Locator Timeouts', () => {

  test('click on nonexistent element times out', async ({ page }) => {
    allure?.epic('HealthHub Patient Portal');
    allure?.feature('Appointments');
    allure?.severity(Severity.NORMAL);
    allure?.owner('team-appointments');
    tagFailure();
    allure?.description('Intentional: locator.click() on a selector that never appears → "TimeoutError: locator.click: ...".');

    await page.goto('/dashboard');
    await test.step('Click a button that does not exist', async () => {
      await page.getByTestId('this-button-does-not-exist-xyz').click({ timeout: 2500 });
    });
  });

  test('fill on nonexistent input times out', async ({ page }) => {
    allure?.epic('HealthHub Patient Portal');
    allure?.feature('Appointments');
    allure?.severity(Severity.NORMAL);
    allure?.owner('team-appointments');
    tagFailure();
    allure?.description('Intentional: locator.fill() on a selector that never appears → "TimeoutError: locator.fill: ...".');

    await page.goto('/dashboard');
    await test.step('Fill an input that does not exist', async () => {
      await page.getByTestId('this-input-does-not-exist-xyz').fill('x', { timeout: 2500 });
    });
  });

  test('waitFor on nonexistent element times out', async ({ page }) => {
    allure?.epic('HealthHub Patient Portal');
    allure?.feature('Dashboard');
    allure?.severity(Severity.MINOR);
    allure?.owner('team-frontend');
    tagFailure();
    allure?.description('Intentional: locator.waitFor() on a selector that never appears → "TimeoutError: locator.waitFor: ...".');

    await page.goto('/dashboard');
    await test.step('Wait for an element that does not exist', async () => {
      await page.getByTestId('this-widget-does-not-exist-xyz').waitFor({ state: 'visible', timeout: 2500 });
    });
  });

  test('check on nonexistent checkbox times out', async ({ page }) => {
    allure?.epic('HealthHub Patient Portal');
    allure?.feature('Settings');
    allure?.severity(Severity.MINOR);
    allure?.owner('team-frontend');
    tagFailure();
    allure?.description('Intentional: locator.check() on a selector that never appears → "TimeoutError: locator.check: ...".');

    await page.goto('/dashboard');
    await test.step('Check a checkbox that does not exist', async () => {
      await page.getByTestId('this-checkbox-does-not-exist-xyz').check({ timeout: 2500 });
    });
  });

  test('selectOption on nonexistent dropdown times out', async ({ page }) => {
    allure?.epic('HealthHub Patient Portal');
    allure?.feature('Appointments');
    allure?.severity(Severity.NORMAL);
    allure?.owner('team-appointments');
    tagFailure();
    allure?.description('Intentional: locator.selectOption() on a selector that never appears → "TimeoutError: locator.selectOption: ...".');

    await page.goto('/dashboard');
    await test.step('Select an option in a dropdown that does not exist', async () => {
      await page.getByTestId('this-dropdown-does-not-exist-xyz').selectOption('x', { timeout: 2500 });
    });
  });

  test('hover on nonexistent element times out', async ({ page }) => {
    allure?.epic('HealthHub Patient Portal');
    allure?.feature('Dashboard');
    allure?.severity(Severity.MINOR);
    allure?.owner('team-frontend');
    tagFailure();
    allure?.description('Intentional: locator.hover() on a selector that never appears → "TimeoutError: locator.hover: ...".');

    await page.goto('/dashboard');
    await test.step('Hover over an element that does not exist', async () => {
      await page.getByTestId('this-tooltip-target-does-not-exist-xyz').hover({ timeout: 2500 });
    });
  });

  test('dblclick on nonexistent element times out', async ({ page }) => {
    allure?.epic('HealthHub Patient Portal');
    allure?.feature('Dashboard');
    allure?.severity(Severity.MINOR);
    allure?.owner('team-frontend');
    tagFailure();
    allure?.description('Intentional: locator.dblclick() on a selector that never appears → "TimeoutError: locator.dblclick: ...".');

    await page.goto('/dashboard');
    await test.step('Double-click an element that does not exist', async () => {
      await page.getByTestId('this-item-does-not-exist-xyz').dblclick({ timeout: 2500 });
    });
  });
});


// ============================================================================
// 3) IGNORED TESTS — 5 tests, different skip reasons
// ============================================================================
// Playwright status: skipped → Allure status: skipped. Category: "Ignored
// Tests". Real teams accumulate skips for all sorts of reasons — the
// Categories widget groups them together regardless of *why*, but each
// description below records the actual reason for triage later.
// ============================================================================

test.describe('Demo Failures — Ignored Tests', () => {

  test('skipped — feature flag disabled in this environment', async ({ page }) => {
    allure?.epic('HealthHub Patient Portal');
    allure?.feature('Notifications');
    allure?.severity(Severity.MINOR);
    allure?.owner('team-notifications');
    tagFailure();
    allure?.description('Intentional skip: simulates a feature flag being disabled in this environment.');
    test.skip(true, 'Notifications feature flag is disabled in this demo environment');
    await page.goto('/dashboard');
  });

  test('skipped — flaky in CI, disabled pending investigation', async ({ page }) => {
    allure?.epic('HealthHub Patient Portal');
    allure?.feature('Appointments');
    allure?.severity(Severity.NORMAL);
    allure?.owner('team-appointments');
    tagFailure();
    allure?.description('Intentional skip: simulates a test quarantined for being flaky in CI, tracked in a ticket.');
    test.skip(true, 'Flaky in CI — quarantined pending fix, see JIRA HEALTH-482');
    await page.goto('/dashboard');
  });

  test('skipped — feature not yet implemented', async ({ page }) => {
    allure?.epic('HealthHub Patient Portal');
    allure?.feature('Billing');
    allure?.severity(Severity.MINOR);
    allure?.owner('team-billing');
    tagFailure();
    allure?.description('Intentional skip: simulates a test written ahead of the feature it covers.');
    test.skip(true, 'Billing module not yet implemented — test written ahead of feature');
    await page.goto('/dashboard');
  });

  test('skipped — requires production-only credentials', async ({ page }) => {
    allure?.epic('HealthHub Patient Portal');
    allure?.feature('Infrastructure');
    allure?.severity(Severity.MINOR);
    allure?.owner('team-backend');
    tagFailure();
    allure?.description('Intentional skip: simulates a test that only makes sense against prod-only secrets, skipped locally.');
    test.skip(true, 'Requires production-only API credentials — not available in this environment');
    await page.goto('/dashboard');
  });

  test('skipped — browser-specific test not applicable to this project', async ({ page }, testInfo) => {
    allure?.epic('HealthHub Patient Portal');
    allure?.feature('Dashboard');
    allure?.severity(Severity.MINOR);
    allure?.owner('team-frontend');
    tagFailure();
    allure?.description('Intentional skip: simulates a test that only applies to a specific browser engine.');
    test.skip(true, `Only applicable to WebKit, current project is "${testInfo.project.name}"`);
    await page.goto('/dashboard');
  });
});


// ============================================================================
// 4) TEST / SUITE TIMEOUTS — 2 tests, different ways to hang
// ============================================================================
// Playwright status: timedOut → Allure status: broken. The ONLY way to get
// "broken" in this ecosystem — verified via allure-playwright's own status
// mapping. Category: "Test / Suite Timeouts".
// ============================================================================

test.describe('Demo Failures — Test / Suite Timeouts', () => {

  test('overall test timeout — stuck waiting on a click', async ({ page }) => {
    test.setTimeout(6000); // short overall timeout so the demo doesn't wait 30s+

    allure?.epic('HealthHub Patient Portal');
    allure?.feature('Appointments');
    allure?.severity(Severity.NORMAL);
    allure?.owner('team-appointments');
    tagFailure();
    allure?.description('Intentional: the whole test exceeds test.setTimeout() while waiting on an action → Playwright "timedOut" → Allure "broken".');

    await page.goto('/dashboard');
    await test.step('Click a button that will never appear (no explicit action timeout)', async () => {
      await page.getByTestId('this-button-does-not-exist-xyz').click();
    });
  });

  test('overall test timeout — stuck waiting on a promise that never resolves', async ({ page }) => {
    test.setTimeout(6000);

    allure?.epic('HealthHub Patient Portal');
    allure?.feature('Notifications');
    allure?.severity(Severity.CRITICAL);
    allure?.owner('team-notifications');
    tagFailure();
    allure?.description('Intentional: simulates waiting on a websocket/event that never fires → Playwright "timedOut" → Allure "broken".');

    await page.goto('/dashboard');
    await test.step('Wait for an event that never fires', async () => {
      await new Promise(() => {}); // never resolves
    });
  });
});


// ============================================================================
// 5) API / NETWORK FAILURES — 2 tests, different network failure modes
// ============================================================================
// Both throw before any assertion runs, so Playwright status is "failed"
// (not "broken") — same as the locator-timeout category, just a different
// error shape. Category: "API / Network Failures".
// ============================================================================

test.describe('Demo Failures — API / Network Failures', () => {

  test('backend unreachable — connection refused', async ({ page }) => {
    allure?.epic('HealthHub Patient Portal');
    allure?.feature('Infrastructure');
    allure?.severity(Severity.CRITICAL);
    allure?.owner('team-backend');
    tagFailure();
    allure?.description('Intentional: hits a port nothing is listening on → "connect ECONNREFUSED".');

    await test.step('Call an unreachable backend port', async () => {
      await page.request.get('http://localhost:1/api/health');
    });
  });

  test('backend unreachable — DNS resolution failure', async ({ page }) => {
    allure?.epic('HealthHub Patient Portal');
    allure?.feature('Infrastructure');
    allure?.severity(Severity.CRITICAL);
    allure?.owner('team-backend');
    tagFailure();
    allure?.description('Intentional: hits a hostname that does not resolve → "getaddrinfo ENOTFOUND".');

    await test.step('Call a nonexistent hostname', async () => {
      await page.request.get('http://this-host-does-not-exist.invalid/api/health');
    });
  });
});
