// @ts-check
import { test, expect } from "@playwright/test";

test("Title Check", async ({ page }) => {
  await page.goto("https://nichethyself.com/tourism");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/STC Tourism/);
});

test("Login to Tourism", async ({ page }) => {
  await page.goto("https://nichethyself.com/tourism");

  await page.getByPlaceholder("Username").fill("stc123");

  await page.locator('input[name="password"]').fill("12345");

  await page.locator('form[name="loginform"] button').click();

  await expect(page).toHaveTitle(/My account/);

  await page.waitForTimeout(5000);

  await page.screenshot({ path: "screenshots/myaccount.png" });
});

test("Login to Tourism using getByRole", async ({ page }) => {
  await page.goto("https://nichethyself.com/tourism");

  await page.getByRole("textbox", { name: "Username" }).fill("stc123");

  await page.getByRole("textbox", { name: "Password" }).fill("12345");

  await page.locator('form[name="loginform"]').getByRole("button").click();

  await expect(page).toHaveTitle(/My account/);

  await page.waitForTimeout(5000);

  await page.screenshot({ path: "screenshots/myaccountgetByRole.png" });
});
