// Allure metadata enriches your test reports with information about:
//
//   - Severity:    How critical is this test? (blocker → trivial)
//   - Owner:       Who maintains this test?
//   - Tags:        Categorize tests (smoke, regression, etc.)
//   - Links:       Connect to issue trackers, TMS, documentation
//   - Description: Rich text explaining what the test does
//   - Display Name: Override the test name in the report
//
// All metadata appears in the Allure report's test detail panel.
// Tests that fail with "blocker" severity will stand out visually.
//
// GRACEFUL DEGRADATION:
//   All allure calls use optional chaining (allure?.) so tests pass
//   even without allure-js-commons installed. The metadata simply
//   won't appear in the report.
//
// WHAT'S NOT COVERED HERE:
//   - Playwright annotations (test.skip, test.fixme) → see 17-annotations.spec.js
//   - testInfo.attach() → see 18-testinfo.spec.js
//   - Playwright tags ({ tag: '@smoke' }) → see 20-tagging.spec.js
//
// ============================================================================

import { test, expect } from "./steps-fixtures.fixed.js";

let allure;
try {
  allure = await import("allure-js-commons");
} catch {
  allure = null;
}

// Helper to safely access Allure Severity enum
const Severity = allure?.Severity ?? {
  BLOCKER: "blocker",
  CRITICAL: "critical",
  NORMAL: "normal",
  MINOR: "minor",
  TRIVIAL: "trivial",
};

// ============================================================================
// Severity Levels
// ============================================================================
//
// Allure severity tells the team how important each test is:
//
// ┌────────────┬───────────────────────────────────────────────────────────┐
// │ SEVERITY   │ WHEN TO USE                                             │
// ├────────────┼───────────────────────────────────────────────────────────┤
// │ blocker    │ App unusable if broken (login, payment, data loss)       │
// │ critical   │ Major feature broken (can't create appointments)         │
// │ normal     │ Standard feature test (default severity)                 │
// │ minor      │ Cosmetic or UX issue (wrong icon, alignment)            │
// │ trivial    │ Nice-to-have (tooltip text, placeholder wording)        │
// └────────────┴───────────────────────────────────────────────────────────┘
//
// In the Allure report: the "Graphs" tab shows a pie chart of severities.
// Failed "blocker" tests trigger red alerts in dashboards.
// ============================================================================

test.describe("Severity Levels", () => {
  test("blocker — login must work", async ({ page }) => {
    allure?.severity(Severity.BLOCKER);
    allure?.epic("HealthHub Patient Portal");
    allure?.feature("Authentication");

    await test.step("Navigate to login", async () => {
      await page.goto("/login");
    });

    await test.step("Login with valid credentials", async () => {
      await page.getByTestId("auth-email-input").fill("patient@healthhub.test");
      await page.getByTestId("auth-password-input").fill("Test123!");
      await page.getByTestId("auth-submit-button").click();
      await page.waitForURL(/dashboard/, { timeout: 10000 });
    });

    await test.step("Verify dashboard loads", async () => {
      await expect(page.getByTestId("dashboard-welcome")).toBeVisible();
    });
  });

  test("critical — appointments page loads", async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    allure?.severity(Severity.CRITICAL);

    await test.step("Navigate to appointments", async () => {
      await page.getByTestId("nav-appointments").click();
      await page.waitForURL(/appointments/);
    });

    await test.step("Verify appointments page elements", async () => {
      await expect(page.getByTestId("appointments-new-btn")).toBeVisible();
    });
  });

  test("minor — dashboard displays health score", async ({
    authenticatedPage,
  }) => {
    const page = authenticatedPage;
    allure?.severity(Severity.MINOR);

    await test.step("Verify health score widget", async () => {
      await expect(page.getByTestId("dashboard-health-score")).toBeVisible();
    });
  });
});

// ============================================================================
// Owner & Tags
// ============================================================================
//
// allure.owner() — Who maintains this test? Appears in the test detail panel.
// allure.tag()   — Free-form tags for categorization.
//
// ALLURE TAGS vs PLAYWRIGHT TAGS:
//
// ┌──────────────────────┬────────────────────────┬────────────────────────┐
// │ ASPECT               │ Playwright { tag }     │ allure.tag()           │
// ├──────────────────────┼────────────────────────┼────────────────────────┤
// │ Where defined        │ Test declaration        │ Inside test body       │
// │ Filter tests (CLI)   │ Yes: --grep @smoke     │ No (reporting only)    │
// │ Appears in HTML      │ Yes                    │ No                     │
// │ Appears in Allure    │ Yes (mapped)           │ Yes (native tags)      │
// │ Use case             │ Run subsets of tests    │ Categorize in reports  │
// └──────────────────────┴────────────────────────┴────────────────────────┘
//
// RECOMMENDATION: Use Playwright tags for test selection (--grep @smoke).
// Use allure.tag() for additional report categorization.
// ============================================================================

test.describe("Owner and Tags", () => {
  test("assign owner and tags for report categorization", async ({
    authenticatedPage,
  }) => {
    const page = authenticatedPage;

    allure?.owner("team-frontend");
    allure?.tag("smoke");
    allure?.tag("authentication");
    allure?.severity(Severity.CRITICAL);

    await test.step("Verify dashboard is accessible", async () => {
      await expect(page.getByTestId("dashboard-welcome")).toBeVisible();
    });

    await test.step("Navigate to appointments", async () => {
      await page.getByTestId("nav-appointments").click();
      await page.waitForURL(/appointments/);
      await expect(page.getByTestId("appointments-new-btn")).toBeVisible();
    });
  });
});

// ============================================================================
// External Links — Issue Tracker, TMS, Custom URLs
// ============================================================================
//
// allure.link(url, name, type) — Generic link to any URL
// allure.issue(name, url)      — Link to issue tracker (Jira, GitHub Issues)
// allure.tms(name, url)        — Link to test management system (TestRail, etc.)
//
// With LINK TEMPLATES (set in playwright config), you can use short IDs:
//
//   // In config: links: [{ type: 'issue', urlTemplate: 'https://jira.example.com/browse/%s' }]
//   allure.issue('HEALTH-123');  // → https://jira.example.com/browse/HEALTH-123
//
// See example-configs/playwright.config.allure.js for link template setup.
// ============================================================================

test.describe("External Links", () => {
  test("link tests to issue tracker and TMS", async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    allure?.severity(Severity.NORMAL);
    allure?.link(
      "https://github.com/healthhub/app/wiki/Auth",
      "Auth Wiki",
      "documentation",
    );
    allure?.issue("HEALTH-101", "https://github.com/healthhub/app/issues/101");
    allure?.tms("TC-AUTH-001", "https://testrail.example.com/cases/view/1001");

    await test.step("Verify dashboard loaded", async () => {
      await expect(page.getByTestId("dashboard-welcome")).toBeVisible();
    });
  });
});

// ============================================================================
// Rich Descriptions & Display Names
// ============================================================================
//
// allure.description() — Adds a rich-text description in the test detail panel.
//                        Supports Markdown formatting.
//
// allure.displayName() — Overrides how the test name appears in Allure.
//                        Useful when test function names are abbreviated.
//
// ============================================================================

test.describe("Descriptions and Display Names", () => {
  test("rich description with markdown", async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    allure?.displayName("Dashboard Loads After Authentication");
    allure?.description(`
## What this test verifies

1. User can authenticate via API
2. Dashboard page loads successfully
3. Key dashboard widgets are visible

### Preconditions
- Test user: patient@healthhub.test
- Backend running at localhost:3001

### Related
- Epic: Patient Portal
- Feature: Dashboard
    `);
    allure?.severity(Severity.NORMAL);
    allure?.epic("HealthHub Patient Portal");
    allure?.feature("Dashboard");
    allure?.story("Dashboard Overview");

    await test.step("Verify dashboard widgets", async () => {
      await expect(page.getByTestId("dashboard-welcome")).toBeVisible();
      await expect(page.getByTestId("dashboard-health-score")).toBeVisible();
    });
  });
});

// ============================================================================
// Metadata via Test Name — @allure.id and @allure.label
// ============================================================================
//
// Allure can extract metadata from the test name itself using special syntax:
//
//   test('@allure.id:AUTH-001 login works', ...)
//     → Sets the Allure ID to "AUTH-001"
//
//   test('@allure.label.severity:critical login works', ...)
//     → Sets severity to "critical"
//
// This is an ALTERNATIVE to calling allure.severity() / allure.id() in the
// test body. It's useful when you want metadata visible at the declaration
// level (like Playwright's { tag } syntax).
//
// NOTE: unlike every other allure.*() call in this file, this mechanism is
// parsed directly from the test title by the reporter — it never depended
// on the runtime fix, and worked correctly even in the original,
// non-fixed spec file.
//
// SUPPORTED LABEL NAMES:
//   @allure.id:VALUE
//   @allure.label.severity:VALUE
//   @allure.label.owner:VALUE
//   @allure.label.epic:VALUE
//   @allure.label.feature:VALUE
//   @allure.label.story:VALUE
//   @allure.label.layer:VALUE
//
// ============================================================================

test.describe("Metadata via Test Name", () => {
  test("@allure.id:AUTH-001 @allure.label.severity:critical login flow", async ({
    page,
  }) => {
    // The @allure.id and @allure.label prefixes are parsed by allure-playwright
    // and automatically set in the Allure report — no API calls needed.

    await test.step("Navigate and login", async () => {
      await page.goto("/login");
      await page.getByTestId("auth-email-input").fill("patient@healthhub.test");
      await page.getByTestId("auth-password-input").fill("Test123!");
      await page.getByTestId("auth-submit-button").click();
      await page.waitForURL(/dashboard/, { timeout: 10000 });
    });

    await test.step("Verify success", async () => {
      await expect(page.getByTestId("dashboard-welcome")).toBeVisible();
    });
  });

  test("@allure.id:DASH-001 @allure.label.owner:team-frontend dashboard widgets", async ({
    authenticatedPage,
  }) => {
    const page = authenticatedPage;

    await test.step("Check dashboard widgets are visible", async () => {
      await expect(page.getByTestId("dashboard-welcome")).toBeVisible();
      await expect(page.getByTestId("dashboard-health-score")).toBeVisible();
    });
  });
});

// ============================================================================
// METADATA QUICK REFERENCE
// ============================================================================
//
// ┌──────────────────────┬──────────────────────────────────────────────────┐
// │ API CALL             │ PURPOSE                                          │
// ├──────────────────────┼──────────────────────────────────────────────────┤
// │ allure.severity()    │ Set test importance (blocker → trivial)          │
// │ allure.owner()       │ Assign responsible team/person                   │
// │ allure.tag()         │ Add report-only tags                             │
// │ allure.link()        │ Generic external link                            │
// │ allure.issue()       │ Link to issue tracker                            │
// │ allure.tms()         │ Link to test management system                   │
// │ allure.description() │ Rich markdown description                        │
// │ allure.displayName() │ Override test name in report                     │
// │ allure.epic()        │ BDD hierarchy — top level                        │
// │ allure.feature()     │ BDD hierarchy — mid level                        │
// │ allure.story()       │ BDD hierarchy — bottom level                     │
// │ allure.id()          │ Unique test case ID for history tracking         │
// └──────────────────────┴──────────────────────────────────────────────────┘
//
// ============================================================================
