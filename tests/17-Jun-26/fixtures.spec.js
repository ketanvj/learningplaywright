import { test, expect } from "@playwright/test";

test.describe("Built-in Fixtures", () => {
  test("page fixture provides isolated page", async ({ page }) => {
    // The 'page' fixture is the most commonly used
    // Each test gets a fresh, isolated page
    await page.goto("http://localhost:5173/login");
    await expect(page).toHaveTitle(/HealthHub/);
    await page.waitForTimeout(5000);
  });

  test("context fixture provides browser context", async ({
    context,
    page,
    browser,
    browserName,
  }) => {
    // The 'context' fixture gives access to the browser context
    // Useful for managing cookies, permissions, etc.
    if (browserName === "webkit") {
      test.skip();
      return;
    }
    expect(["chromium", "firefox"]).toContain(browserName);

    // Get all cookies
    const cookies = await context.cookies();
    expect(Array.isArray(cookies)).toBe(true);

    // Add a cookie
    await context.addCookies([
      {
        name: "test-cookie",
        value: "test-value",
        domain: "localhost",
        path: "/",
      },
    ]);

    // Verify cookie was added
    const updatedCookies = await context.cookies();
    const testCookie = updatedCookies.find((c) => c.name === "test-cookie");
    expect(testCookie?.value).toBe("test-value");
    //page.goto();
    const newContext = await browser.newContext();
    const newPage = await newContext.newPage();
    await newPage.goto("http://www.google.com");
    await newPage.waitForTimeout(5000);
  });

  test("request fixture provides API context", async ({ request }) => {
    // The 'request' fixture is for API testing
    // It shares cookies with the browser context
    const response = await request.get("/api/health");
    console.log(response);
    expect(response.ok()).toBe(true);

    const data = await response.json();
    expect(data.status).toBe("ok");
  });
});
