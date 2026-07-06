import { test, expect } from "@playwright/test";

test.describe("Tagged Tests @smoke", { tag: ["@dashboard", "@win32ß"] }, () => {
  // Single tag
  test(
    "login form visible",
    {
      tag: "@smoke",
    },
    async ({ page }) => {
      await page.goto("/login");
      await expect(page.getByTestId("login-form")).toBeVisible();
    },
  );
  /*
500 
- smoke
- regression
- API
- negative
- slow
- screenshot
*/

  test(
    "successful login",
    {
      tag: ["@smoke", "@auth", "@critical", "@P1"],
    },
    async ({ page }) => {
      await page.goto("/login");
      await page
        .getByPlaceholder("you@example.com")
        .fill("patient@healthhub.test");
      await page.getByPlaceholder("Enter your password").fill("Test123!");
      await page.getByRole("button", { name: /sign in/i }).click();
      await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });
    },
  );
});

/*
npx playwright test tagging --grep @smoke

npx playwright test tagging --grep "@nav|@auth" 

npx playwright test tagging --grep-invert @smoke

npx playwright test tagging--grep "@fast|@slow"

npx playwright test tagging --grep "(?=.*@auth)(?=.*@smoke)"


*/
