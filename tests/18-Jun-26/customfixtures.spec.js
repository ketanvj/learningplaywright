/*

In built fixtures
- page
- browser
- context
- browserName
- request
*/

import { test as base, expect } from "@playwright/test";

const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    //Setup
    await page.goto("http://localhost:5173/login");
    await page
      .getByPlaceholder("you@example.com")
      .fill("patient@healthhub.test");
    await page.getByPlaceholder("Enter your password").fill("Test123!");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });

    //giving fixture to test and execute the test
    await use(page);
    //authenticatedPage = page;

    //tear dowm will be executed
    //Setup code, cleaning the connections, closing files, closing browser
  },
});

test("Test to see how to use the custom fixture", async ({
  authenticatedPage,
}) => {
  await expect(
    authenticatedPage.getByRole("heading", { level: 1 }),
  ).toBeVisible();
});
