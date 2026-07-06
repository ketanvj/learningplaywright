import { test, expect } from "@playwright/test";

test("double click exmaple", async ({ page }) => {
  await page.waitForTimeout(10000);
  await page.goto("https://qa-practice.netlify.app/double-click");
  await page.getByRole("button", { name: "Double click me" }).dblclick();
  await page.waitForTimeout(5000);
  await expect(page.locator("div#double-click-result")).toHaveText(
    "Congrats, you double clicked!",
  );
});
