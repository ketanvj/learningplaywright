import { test, expect } from "@playwright/test";

async function login(page) {
  await page.goto("http://localhost:5173/login");
  await page.getByPlaceholder("you@example.com").fill("patient@healthhub.test");
  await page.getByPlaceholder("Enter your password").fill("Test123!");
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });
}

test("should match login page screenshot", async ({ page }) => {
  await page.goto("http://localhost:5173/login");

  // Wait for page to be fully loaded. Waits until there are no active network requests for at least 500 ms.
  await page.waitForLoadState("networkidle");

  // Take a full page screenshot and compare
  // First run creates the snapshot, subsequent runs compare
  await expect(page).toHaveScreenshot("login-page.png", {
    fullPage: true,
    // Allow small differences due to anti-aliasing
    maxDiffPixelRatio: 0.01,
  });
});

test("should match element screenshot with mask", async ({ page }) => {
  await login(page);
  await page.waitForLoadState("networkidle");

  // Mask dynamic content (like timestamps, user avatars)
  await expect(page).toHaveScreenshot("dashboard-masked.png", {
    mask: [
      page.locator("time"),
      page.locator('[data-testid*="date"]'),
      page.locator('[data-testid*="time"]'),
      // Mask user-specific content
      page.locator('[data-testid*="user-menu-trigger"]'),
    ],
    maxDiffPixelRatio: 0.02,
  });
});

test("should match login form screenshot", async ({ page }) => {
  await page.goto("http://localhost:5173/login");
  await page.waitForLoadState("networkidle");

  // Take screenshot of specific element
  const loginForm = page.getByTestId("login-form");
  await expect(loginForm).toHaveScreenshot("login-form.png");
});

test.only("should match screenshot at specific viewport", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.waitForTimeout(5000);
  await page.goto("http://localhost:5173/login");
  await page.waitForLoadState("networkidle");

  await expect(page).toHaveScreenshot("login-mobile.png", {
    fullPage: true,
  });
});
