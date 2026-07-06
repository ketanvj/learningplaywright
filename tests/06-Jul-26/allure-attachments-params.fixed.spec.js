// ============================================================================
// 04 - ALLURE ATTACHMENTS & PARAMETERS  (FIXED — runtime wired up)
// ============================================================================
//
// Allure enriches test reports with:
//
//   - Attachments: Screenshots, JSON data, text logs, HTML snippets
//   - Parameters:  Key-value pairs showing test inputs (with masking support)
//
// These appear in the test detail panel in the Allure report, making it
// easy to debug failures without re-running the test.
//
// ALLURE ATTACHMENTS vs PLAYWRIGHT testInfo.attach():
//
// ┌─────────────────────┬──────────────────────────┬──────────────────────────┐
// │ ASPECT              │ testInfo.attach()        │ allure.attachment()      │
// ├─────────────────────┼──────────────────────────┼──────────────────────────┤
// │ Package             │ Built-in @playwright/test│ allure-js-commons        │
// │ HTML report         │ Yes (Attachments tab)    │ No                       │
// │ Allure report       │ Yes (auto-mapped)        │ Yes (native)             │
// │ Step-level attach   │ No (test-level only)     │ Yes (inside allure.step) │
// │ Content types       │ Any                      │ Any                      │
// │ File path support   │ Yes ({ path: '...' })    │ No (buffer only)         │
// └─────────────────────┴──────────────────────────┴──────────────────────────┘
//
// RECOMMENDATION: Use testInfo.attach() for Playwright HTML reports (see
// 18-testinfo.spec.js). Use allure.attachment() when you need step-level
// attachments or are targeting Allure reports specifically.
//
// ============================================================================

import { test, expect } from "./steps-fixtures.fixed.js";

let allure;
try {
  allure = await import("allure-js-commons");
} catch {
  allure = null;
}

const Severity = allure?.Severity ?? { NORMAL: "normal", CRITICAL: "critical" };

// ============================================================================
// Screenshots at Key Test Points
// ============================================================================
//
// Take screenshots at important moments and attach them to the report.
// When a test fails, you'll see exactly what the page looked like at
// each checkpoint.
//
// PATTERN:
//   const screenshot = await page.screenshot();
//   allure.attachment('Screenshot name', screenshot, 'image/png');
//
// ============================================================================

test.describe("Attachments", () => {
  test("attach screenshots at key points", async ({ page }) => {
    allure?.severity(Severity.NORMAL);
    allure?.epic("HealthHub Patient Portal");
    allure?.feature("Authentication");

    await test.step("Capture login page state", async () => {
      await page.goto("/login");
      await expect(page.getByTestId("login-form")).toBeVisible();

      // Take a screenshot and attach it to the Allure report
      const loginScreenshot = await page.screenshot();
      allure?.attachment(
        "Login page - before filling",
        loginScreenshot,
        "image/png",
      );
    });

    await test.step("Fill credentials and capture state", async () => {
      await page.getByTestId("auth-email-input").fill("patient@healthhub.test");
      await page.getByTestId("auth-password-input").fill("Test123!");

      const filledScreenshot = await page.screenshot();
      allure?.attachment(
        "Login page - credentials filled",
        filledScreenshot,
        "image/png",
      );
    });

    await test.step("Submit and capture dashboard", async () => {
      await page.getByTestId("auth-submit-button").click();
      await page.waitForURL(/dashboard/, { timeout: 10000 });
      await expect(page.getByTestId("dashboard-welcome")).toBeVisible();

      const dashboardScreenshot = await page.screenshot();
      allure?.attachment(
        "Dashboard - after login",
        dashboardScreenshot,
        "image/png",
      );
    });
  });

  // ==========================================================================
  // JSON Data Attachments
  // ==========================================================================
  //
  // Attach API responses, configuration data, or any JSON to the report.
  // This is invaluable for debugging test failures that depend on API data.
  //
  // PATTERN:
  //   const data = await response.json();
  //   allure.attachment('API Response', JSON.stringify(data, null, 2), 'application/json');
  //
  // ==========================================================================

  test("attach JSON API response data", async ({ page }) => {
    allure?.severity(Severity.NORMAL);
    allure?.feature("API Integration");

    const apiData = await test.step("Fetch API health check", async () => {
      const response = await page.request.get(
        "http://localhost:3001/api/health",
      );
      const data = await response.json();

      // Attach the raw API response as JSON
      allure?.attachment(
        "Health Check Response",
        JSON.stringify(data, null, 2),
        "application/json",
      );

      return data;
    });

    await test.step("Fetch login endpoint response", async () => {
      const response = await page.request.post(
        "http://localhost:3001/api/v1/auth/login",
        {
          data: { email: "patient@healthhub.test", password: "Test123!" },
        },
      );
      const body = await response.json();

      // Attach the login response (token will be visible in report)
      allure?.attachment(
        "Login API Response",
        JSON.stringify(
          {
            success: body.success,
            hasToken: !!body.data?.token,
            tokenLength: body.data?.token?.length,
            // Don't attach the actual token in a real project!
          },
          null,
          2,
        ),
        "application/json",
      );

      expect(body.success).toBe(true);
    });

    await test.step("Verify health check data", async () => {
      expect(apiData).toHaveProperty("status");
    });
  });

  // ==========================================================================
  // Text and HTML Attachments
  // ==========================================================================

  test("attach text logs and HTML content", async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    allure?.severity(Severity.NORMAL);

    await test.step("Capture page info as text attachment", async () => {
      const url = page.url();
      const title = await page.title();

      const pageInfo = [
        `URL: ${url}`,
        `Title: ${title}`,
        `Timestamp: ${new Date().toISOString()}`,
      ].join("\n");

      allure?.attachment("Page Info", pageInfo, "text/plain");
    });

    await test.step("Capture HTML snippet", async () => {
      const welcomeHtml = await page
        .getByTestId("dashboard-welcome")
        .innerHTML();
      allure?.attachment("Welcome Section HTML", welcomeHtml, "text/html");
    });

    await test.step("Verify page loaded", async () => {
      await expect(page.getByTestId("dashboard-welcome")).toBeVisible();
    });
  });
});

// ============================================================================
// Parameters
// ============================================================================
//
// Parameters record the inputs/configuration of a test run.
// They appear in a "Parameters" section in the Allure test detail.
//
// allure.parameter(name, value, options)
//
// Options:
//   mode: 'default'  — Value is visible in the report (default)
//   mode: 'masked'   — Value is replaced with "******" (for secrets)
//   mode: 'hidden'   — Parameter is not shown in the report at all
//   mode: 'excluded' — Parameter is excluded from test history ID calculation
//
// USE CASES:
//   - Show which credentials were used (masked for password)
//   - Show test configuration (browser, viewport)
//   - Record API endpoint URLs
//   - Track data-driven test inputs
//
// ============================================================================

test.describe("Parameters", () => {
  test("parameter modes — default, masked, hidden, excluded", async ({
    page,
  }, testInfo) => {
    allure?.severity(Severity.NORMAL);
    allure?.feature("Authentication");

    // Default mode — value visible in report
    allure?.parameter("email", "patient@healthhub.test");

    // Masked mode — value shown as ****** in report (for secrets)
    allure?.parameter("password", "Test123!", { mode: "masked" });

    // Hidden mode — parameter not shown at all (internal tracking)
    allure?.parameter("internalTestId", "TC-2024-0042", { mode: "hidden" });

    // Excluded mode — shown but excluded from history ID calculation
    // Useful for parameters that change between runs (like timestamps)
    allure?.parameter("runTimestamp", new Date().toISOString(), {
      excluded: true,
    });

    // Additional context parameters
    allure?.parameter("browser", testInfo.project.name);
    allure?.parameter("baseURL", "http://localhost:5173");

    await test.step("Login with parameterized credentials", async () => {
      await page.goto("/login");
      await page.getByTestId("auth-email-input").fill("patient@healthhub.test");
      await page.getByTestId("auth-password-input").fill("Test123!");
      await page.getByTestId("auth-submit-button").click();
      await page.waitForURL(/dashboard/, { timeout: 10000 });
      await expect(page.getByTestId("dashboard-welcome")).toBeVisible();
    });
  });
});

// ============================================================================
// ATTACHMENTS & PARAMETERS QUICK REFERENCE
// ============================================================================
//
// ATTACHMENTS:
//   allure.attachment(name, content, type)
//     name:    Display name in report
//     content: String or Buffer
//     type:    MIME type ('image/png', 'application/json', 'text/plain', etc.)
//
// PARAMETERS:
//   allure.parameter(name, value, options?)
//     options.mode:     'default' | 'masked' | 'hidden'
//     options.excluded: true — exclude from history ID
//
// COMMON MIME TYPES:
//   'image/png'         — Screenshots
//   'application/json'  — API responses, config data
//   'text/plain'        — Log output, text data
//   'text/html'         — HTML snippets
//   'text/csv'          — Tabular data
//   'video/webm'        — Video recordings
//
// ============================================================================
