import { test, expect } from "@playwright/test";
const BASE_URL = "https://the-internet.herokuapp.com";
test("1a - Test Timeout: default 30s (login page load + assertion)", async ({
  page,
}) => {
  await page.waitForTimeout(10000);
  await page.goto(`${BASE_URL}/upload`);
  await page
    .getByRole("button", { name: "Choose File" })
    .setInputFiles(
      "/Users/ketan/Library/CloudStorage/OneDrive-ParatusSystemsPvt.Ltd/Selenium recordings/Playwright/Playwright-DEC25/playwright recordings/30-Jan-26/Actions.spec.js",
    );
  await page.getByRole("button", { name: "Upload" }).click();
  await expect(page.locator("#uploaded-files")).toContainText(
    "Actions.spec.js",
  );
  await page.waitForTimeout(5000);
});
