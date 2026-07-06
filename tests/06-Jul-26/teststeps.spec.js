test.describe("Allure Steps", () => {
  test("allure.step() with nested sub-steps", async ({ page }) => {
    // allure.step() works similarly to test.step() but is Allure-native.
    // The key advantage: it supports parameters and attachments at the step level.

    await test.step("Navigate to login page", async () => {
      await page.goto("/login");
      await expect(page.getByTestId("login-form")).toBeVisible();
    });

    // Use allure.step() for Allure-specific grouping with sub-steps
    if (allure) {
      await allure.step("Authenticate with credentials", async () => {
        await allure.step("Fill email field", async () => {
          await page
            .getByTestId("auth-email-input")
            .fill("patient@healthhub.test");
        });

        await allure.step("Fill password field", async () => {
          await page.getByTestId("auth-password-input").fill("Test123!");
        });

        await allure.step("Click submit button", async () => {
          await page.getByTestId("auth-submit-button").click();
        });
      });
    } else {
      // Fallback when allure is not installed
      await page.getByTestId("auth-email-input").fill("patient@healthhub.test");
      await page.getByTestId("auth-password-input").fill("Test123!");
      await page.getByTestId("auth-submit-button").click();
    }

    await test.step("Verify login succeeded", async () => {
      await page.waitForURL(/dashboard/, { timeout: 10000 });
      await expect(page.getByTestId("dashboard-welcome")).toBeVisible();
    });
  });
});
