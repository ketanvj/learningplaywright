import { test, expect } from "@playwright/test";

test("Hover Example", async ({ page }) => {
  await page.goto("https://the-internet.herokuapp.com/hovers");
  await page.waitForTimeout(10000);
  await page.getByAltText("User Avatar").nth(1).hover();
  await expect(page.getByText("name: user2")).toBeVisible();
  await page.waitForTimeout(5000);
});
