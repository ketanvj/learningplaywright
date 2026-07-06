import { test, expect } from "@playwright/test";
import { LoginPage } from "./LoginPage.js";

test("Login using Page Object", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login("patient@healthhub.test ", "Test123!");
  await expect(page).toHaveURL(/dashboard/);
});

/**
 * 1. Refined Page Object class
 * 2. Folder structure from the perspective of framework but only in the context of Page objects
 * 3. Fixture
 * 4. Dividing a page further into components
 */
