import { test, expect } from "@playwright/test";
test.describe("Pre-Authenticated Tests (storageState)", () => {
  // ── Test 1: Navigate to dashboard without logging in ────────────────────
  test("should access dashboard directly without login", async ({ page }) => {
    // Simply navigate to the dashboard — no login step!
    // The storageState has already injected the JWT into localStorage.
    await page.goto("/dashboard");

    // The app reads the JWT from localStorage, calls GET /auth/me,
    // and renders the authenticated dashboard.
    await expect(page.getByTestId("dashboard-welcome")).toBeVisible();
    await expect(page.getByTestId("dashboard-welcome")).toContainText("John");
  });

  test("should make authenticated API call using stored token", async ({
    page,
  }) => {
    // Navigate to load localStorage
    await page.goto("/dashboard");

    // Extract the token from localStorage
    const token = await page.evaluate(() =>
      localStorage.getItem("healthhub_token"),
    );

    // Call the /auth/me endpoint with the Bearer token
    const response = await page.request.get(
      "http://localhost:3001/api/v1/auth/me",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const body = await response.json();

    // Verify the API recognizes us as the patient user
    expect(body.success).toBe(true);
    expect(body.data.email).toBe("patient@healthhub.test");
    expect(body.data.first_name).toBe("John");
    expect(body.data.role).toBe("patient");
  });
});
