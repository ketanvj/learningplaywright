/*
Test Timeout           : 30 sec
Expect Timeout         : 5 sec
Action Timeout         : Unlimited (0)
Navigation Timeout     : Unlimited (0)
Global Timeout         : Not set
*/

import { test, expect } from "@playwright/test";

// =============================================================================
// 1. TEST TIMEOUT (Default: 30,000 ms)
//    - Limits the entire test execution from start to finish
//    - Override per test with test.setTimeout()
// =============================================================================

const BASE_URL = "https://the-internet.herokuapp.com";
//const BASE_URL = "http://www.flipkart.com";

// test.beforeAll(async () => {
//   // Set timeout for this hook.
//   test.setTimeout(60000);
// });
//beforeAll(30),
// BeforeEach,Fixtures,testcase - 30sec,
// AfterEach and fixture teardown - 30,
// afterAll - 30 sec

// test.beforeEach(async ({}, testInfo) => {
//   // Extend timeout for all tests running this hook by 30 seconds
//   testInfo.setTimeout(testInfo.timeout + 30_000);
// });
//30 sections - BeforeEach + Ficxture + test case = 30000ms

test("1a - Test Timeout: default 30s (login page load + assertion)", async ({
  page,
}) => {
  // The entire test must finish within 30 seconds (Playwright default)
  await page.goto(`${BASE_URL}/login`);
  await expect(page.locator("h2")).toHaveText("Login Page");
  //await page.waitForTimeout(35000);
});

test("1a - Test Timeout: default 30s (login page load + assertion)-custom timeout", async ({
  page,
}) => {
  // The entire test must finish within 30 seconds (Playwright default)
  test.setTimeout(50000);
  await page.goto(`${BASE_URL}/login`);
  await expect(page.locator("h2")).toHaveText("Login Page");
  await page.waitForTimeout(3500);
});

// =============================================================================
// 2. ACTION TIMEOUT (Default: unlimited / 0 ms)
//    - Applies to: click(), fill(), check(), uncheck(), selectOption(),
//                  hover(), dragTo(), type(), press(), etc.
//    - Set per-action via { timeout: ms } option
//    - Set globally via page.setDefaultTimeout() or use.actionTimeout in config
// =============================================================================

test("2a - Action Timeout: per-action timeout on click()", async ({ page }) => {
  // Sets a 10s default for ALL actions and waitFor calls on this page instance
  // Note: this overrides the global config for this page object only
  page.setDefaultTimeout(10000); //For any action in this test, wait for 10 secs for action to happen,
  //otherwise gice timeout error.
  page.waitForTimeout(5000); //Hardn wait never to be used in your test.
  //I as a trainer, using it so that you can observe what things are happeing on the screen.
  await page.goto(`${BASE_URL}/login`);

  // Per-action timeout: if the button is not clickable within 5s, it fails
  await page.locator("#username").fill("tomsmith"); //uses 10 seconds timeout
  await page
    .locator("#password")
    .fill("SuperSecretPassword!", { timeout: 5000 }); //for this wait only for 5 sec
  await page.locator('[type="submit"]').click({ timeout: 5000 });

  await expect(page.locator(".flash.success")).toBeVisible();
});

// =============================================================================
// 3. NAVIGATION TIMEOUT (Default: unlimited / 0 ms)
//    - Applies to: page.goto(), page.reload(), page.goBack(), page.goForward()
//    - Set per-navigation via { timeout: ms } option
//    - Set globally via page.setDefaultNavigationTimeout() or
//      use.navigationTimeout in config
// =============================================================================

test.only("3a - Navigation Timeout: per-navigation timeout on goto()", async ({
  page,
}) => {
  await page.waitForTimeout(10000);
  // If the page does not finish loading within 15s, this navigation throws
  await page.goto(`${BASE_URL}`, { timeout: 500 });
  await expect(page.locator("h2")).toHaveText("Login Page");
});

test("3b - Navigation Timeout: setDefaultNavigationTimeout() for all navigations", async ({
  page,
}) => {
  // All navigations on this page instance will use 15s instead of unlimited
  page.setDefaultNavigationTimeout(15000);

  await page.goto(`${BASE_URL}/login`);
  await page.locator("#username").fill("tomsmith");
  await page.locator("#password").fill("SuperSecretPassword!");
  await page.locator('[type="submit"]').click();

  // goBack() is also a navigation — uses the 15s timeout set above
  await page.goBack();
  await page.goForward();
  await page.reload({ timeout: 10000 });
  await expect(page).toHaveURL(`${BASE_URL}/login`);
});

// =============================================================================
// 4. EXPECT TIMEOUT (Default: 5,000 ms)
//    - Applies ONLY to assertion methods: toBeVisible(), toHaveText(),
//      toBeChecked(), toHaveURL(), toContainText(), etc.
//    - Playwright polls the assertion until it passes or the timeout expires
//    - Override per-assertion via { timeout: ms } option
//    - Override globally via expect.timeout in playwright.config.js
// =============================================================================

test("4a - Expect Timeout: default 5s for toBeVisible()", async ({ page }) => {
  await page.goto(`${BASE_URL}/login`);
  await page.locator("#username").fill("tomsmith");
  await page.locator("#password").fill("SuperSecretPassword!");
  await page.locator('[type="submit"]').click();

  // Playwright polls until the flash message appears — gives it 5s by default
  await expect(page.locator(".flash.success")).toBeVisible();
  //change it to 10seconds
  await expect(page.locator(".flash.success")).toHaveText(
    "You logged into a secure area!",
    { timeout: 10000 },
  );
});

// =============================================================================
// 6. waitFor TIMEOUT
//    - Applies to: locator.waitFor(), page.waitForSelector(),
//                  page.waitForURL(),
//                  page.waitForTimeout() (hard wait — avoid in real tests)
//    - Uses the page's default timeout if no { timeout } option is given
// =============================================================================

test("6a - waitFor Timeout: locator.waitFor() with custom timeout", async ({
  page,
}) => {
  await page.goto(`${BASE_URL}/dynamic_loading/2`);
  await page.locator('[href="#"] >> text=Start').click();

  // waitFor polls until the element appears in DOM — timeout after 8s
  const finishText = page.locator("#finish h4");
  await finishText.waitFor({ state: "visible", timeout: 8000 });
  await page.waitForURL(`${BASE_URL}/dynamic_loading/2`, { timeout: 10000 });

  await expect(finishText).toHaveText("Hello World!");
});
