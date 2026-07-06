import { test, expect } from "@playwright/test";

test.skip("feature not implemented yet", async ({ page }) => {
  // Use when: Feature is planned but not built yet
  // The test serves as documentation of expected behavior
  await page.goto("/future-feature");
  await expect(page.getByText("Coming Soon")).toBeVisible();
});

test("skip on specific browser", async ({ page, browserName }) => {
  // Use when: Feature doesn't work on certain browsers
  // Example: WebRTC not supported in some browsers
  test.skip(
    browserName === "firefox",
    "WebGL feature not supported in Firefox",
  );

  await page.goto("/login");
  await expect(page).toHaveURL(/login/);
});

test.describe("test.fixme() - Known Issues", () => {
  // Unconditional fixme - documents a known problem
  test.fixme("broken due to bug JIRA-1234", async ({ page }) => {
    // Use when: There's a known bug that breaks this test
    // The test is skipped but flagged for fixing
    await page.goto("/broken-feature");
  });

  test("webkit rendering issue", async ({ page, browserName }) => {
    // Use when: Bug only affects certain browsers
    test.fixme(
      browserName === "webkit",
      "Safari renders incorrectly - issue #456",
    );

    await page.goto("http://localhost:5173/login");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});

test.describe("test.fail() - Expected Failures", () => {
  // Document a known bug - test passes when bug exists
  test("known bug - element has wrong text", async ({ page }) => {
    // Use when: You want CI to pass while bug exists
    // When the bug is fixed, this test will fail (alerting you)
    test.fail(true, "Bug #789: Button text is wrong");

    await page.goto("/login");

    // This assertion expects wrong text - will fail
    // test.fail() inverts result: failing assertion = passing test
    await expect(page.getByRole("button", { name: /sign in/i })).toHaveText(
      "Wrong Text",
    );
  });
  test("webkit-specific rendering bug", async ({ page, browserName }) => {
    // Use when: Bug only exists on certain platforms
    test.fail(browserName === "webkit", "WebKit renders button incorrectly");

    await page.goto("/login");
    // Test that would fail on webkit
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });
});

test.describe("test.slow() - Extended Timeout", () => {
  // Unconditional slow - complex workflow
  test("multi-step checkout flow", async ({ page }) => {
    // Use when: Test legitimately takes longer
    // Default 30s becomes 90s
    test.slow();

    await page.goto("http://localhost:5173/login");
    await page
      .getByPlaceholder("you@example.com")
      .fill("patient@healthhub.test");
    await page.getByPlaceholder("Enter your password").fill("Test123!");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });
    await page.waitForTimeout(40000);
  });

  test("animation-heavy page", async ({ page, browserName }) => {
    // Use when: Certain browsers are slower
    test.slow(browserName === "webkit", "WebKit renders animations slower");

    await page.goto("/login");
    await expect(page.getByTestId("login-form")).toBeVisible();
    await page.waitForTimeout(40000);
  });
});

test.describe("Custom Annotations", () => {
  test.only("link to issue tracker", async ({ page }) => {
    // Use when: Test is related to a specific ticket
    test.info().annotations.push({
      type: "issue",
      description: "https://github.com/org/repo/issues/123",
    });

    await page.goto("http://localhost:5173/login");
    await expect(page).toHaveURL(/login/);
  });
  test("ownership and priority metadata", async ({ page }) => {
    // Use when: Need to track test ownership and importance
    test
      .info()
      .annotations.push(
        { type: "owner", description: "team-authentication" },
        { type: "priority", description: "P0-critical" },
        { type: "feature", description: "user-login" },
      );

    await page.goto("http://localhost:5173/login");
    await expect(page.getByTestId("login-form")).toBeVisible();
  });
});
