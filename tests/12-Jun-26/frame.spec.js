import { test, expect } from "@playwright/test";

async function login(page) {
  await page.goto("http://localhost:5173/login");
  await page.getByPlaceholder("you@example.com").fill("patient@healthhub.test");
  await page.getByPlaceholder("Enter your password").fill("Test123!");
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });
}

test.describe("All the FrameTests", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto("http://localhost:5173/playground/frames");
  });

  test("iframe example1", async ({ page }) => {
    await page.waitForTimeout(10000);
    const myFirstFrame = page.frameLocator('[data-testid="simple-iframe"]');
    const h3Element = myFirstFrame.getByRole("heading", { level: 3 });
    //const h3Element = myFirstFrame.locator("h3");
    await expect(h3Element).toHaveText("Content Inside iFrame");
    await page.waitForTimeout(5000);
  });

  test("iframe example with a form inside iframe", async ({ page }) => {
    await page.waitForTimeout(10000);
    const formFrame = page.frameLocator('[data-testid="form-iframe"]');
    await formFrame
      .getByRole("textbox", { name: "Full Name" })
      .fill("John Doe");
    await page.waitForTimeout(5000);
  });
});
