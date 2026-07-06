//
//
// This file introduces Allure-specific step and hierarchy features.
// While test.step() (file 01) is built into Playwright, Allure adds:
//
//   - allure.step()     — Allure's own step function (more metadata options)
//   - allure.epic()     — Top-level grouping (e.g., "Patient Portal")
//   - allure.feature()  — Feature grouping (e.g., "Authentication")
//   - allure.story()    — User story (e.g., "Patient Login")
//
// BDD HIERARCHY in Allure:
//
//   Epic: HealthHub Patient Portal
//   └── Feature: Authentication
//       ├── Story: Patient Login
//       │   ├── Test: successful login with valid credentials
//       │   └── Test: shows error with invalid password
//       └── Story: Session Management
//           └── Test: session persists across navigation
//
// This hierarchy creates a tree view in the Allure report, making it
// easy to navigate hundreds of tests by business domain.
//
// GRACEFUL DEGRADATION:
//   - Tests use optional chaining (allure?.) so they pass without allure
//   - test.step() always works (built-in)
//   - allure.step() adds extra Allure metadata when available
//
// INSTALL: npm install --save-dev allure-playwright allure-js-commons
// ============================================================================

import { test, expect } from "./steps-fixtures.fixed.js";

// ---------------------------------------------------------------------------
// Graceful import — tests work with OR without allure-js-commons installed
// ---------------------------------------------------------------------------
let allure;
try {
  allure = await import("allure-js-commons");
} catch {
  allure = null;
}

// ============================================================================
// allure.step() — Allure's Step Function
// ============================================================================
//
// test.step() vs allure.step():
//
// ┌─────────────────────┬───────────────────────────┬───────────────────────────┐
// │ ASPECT              │ test.step()               │ allure.step()             │
// ├─────────────────────┼───────────────────────────┼───────────────────────────┤
// │ Package             │ Built-in @playwright/test │ allure-js-commons         │
// │ Works without Allure│ Yes                       │ No (needs graceful import)│
// │ HTML report         │ Yes (collapsible)         │ Yes (via this fix — routed│
// │                     │                           │      through test.step()) │
// │ Trace viewer        │ Yes (timeline)            │ Yes (same reason)         │
// │ Allure report       │ Yes (mapped to steps)     │ Yes (native steps)        │
// │ Step parameters     │ No                        │ Yes                       │
// │ Step attachments    │ No                        │ Yes                       │
// │ Nested steps        │ Yes                       │ Yes                       │
// │ Return values       │ Yes                       │ Yes                       │
// └─────────────────────┴───────────────────────────┴───────────────────────────┘
//
// RECOMMENDATION: Use test.step() as your primary step mechanism (always works).
// Add allure.step() calls when you need Allure-specific features like
// step parameters or step-level attachments.
// ============================================================================

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

// ============================================================================
// BDD Hierarchy — Epic / Feature / Story
// ============================================================================
//
// Allure organizes tests into a BDD (Behavior-Driven Development) tree:
//
//   allure.epic('...')    → Highest level — a product area or module
//   allure.feature('...') → A capability within the epic
//   allure.story('...')   → A specific user story within the feature
//
// In the Allure report, navigate to the "Behaviors" tab to see this tree.
//
// HEALTHHUB EXAMPLE:
//
//   Epic: HealthHub Patient Portal
//   ├── Feature: Authentication
//   │   ├── Story: Patient Login
//   │   └── Story: Session Management
//   ├── Feature: Appointments
//   │   ├── Story: View Appointments
//   │   └── Story: Create Appointment
//   └── Feature: Dashboard
//       └── Story: Dashboard Overview
//
// ============================================================================

test.describe("BDD Hierarchy", () => {
  test("epic / feature / story organize tests in Allure", async ({
    authenticatedPage,
  }) => {
    const page = authenticatedPage;

    // Set BDD hierarchy labels — these appear in Allure's "Behaviors" tab
    allure?.epic("HealthHub Patient Portal");
    allure?.feature("Authentication");
    allure?.story("Patient Login");

    await test.step("Verify authenticated state", async () => {
      await expect(page.getByTestId("dashboard-welcome")).toBeVisible();
    });

    await test.step("Verify dashboard content is accessible", async () => {
      await expect(page.getByTestId("dashboard-health-score")).toBeVisible();
    });
  });

  test("appointments feature story", async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    allure?.epic("HealthHub Patient Portal");
    allure?.feature("Appointments");
    allure?.story("View Appointments");

    await test.step("Navigate to appointments", async () => {
      await page.getByTestId("nav-appointments").click();
      await page.waitForURL(/appointments/);
    });

    await test.step("Verify appointments page elements", async () => {
      await expect(page.getByTestId("appointments-new-btn")).toBeVisible();
    });
  });
});

// ============================================================================
// Suite Hierarchy — parentSuite / suite / subSuite
// ============================================================================
//
// Separate from BDD hierarchy, Allure also has a "Suites" tab that maps to:
//
//   allure.parentSuite('...')  → Top-level suite grouping
//   allure.suite('...')        → Mid-level suite
//   allure.subSuite('...')     → Detailed sub-suite
//
// By default, Playwright's test.describe() maps to the suite level.
// Use these when you need custom grouping beyond what describe provides.
//
// ============================================================================

test.describe("Suite Hierarchy", () => {
  test("custom suite hierarchy for Allure grouping", async ({
    authenticatedPage,
  }) => {
    const page = authenticatedPage;

    // Override the default suite hierarchy in Allure
    allure?.parentSuite("Reporting & Steps Module");
    allure?.suite("Step Demonstrations");
    allure?.subSuite("Hierarchy Examples");

    await test.step("Verify page is loaded", async () => {
      await expect(page.getByTestId("dashboard-welcome")).toBeVisible();
    });
  });
});

// ============================================================================
// Combining test.step() + allure.step() in the Same Test
// ============================================================================
//
// BEST PRACTICE: Use test.step() as the outer grouping (works everywhere)
// and allure.step() for fine-grained Allure-specific sub-steps when needed.
//
//   test.step('Login flow')              ← Appears in HTML report + Allure
//     allure.step('Fill email')          ← Only in Allure (with parameters)
//     allure.step('Fill password')       ← Only in Allure (with parameters)
//     allure.step('Submit')              ← Only in Allure
//
// ============================================================================

test.describe("Combining test.step() and allure.step()", () => {
  test("use both step types together", async ({ page }) => {
    allure?.epic("HealthHub Patient Portal");
    allure?.feature("Authentication");
    allure?.story("Combined Step Demonstration");

    await test.step("Navigate to login", async () => {
      await page.goto("/login");
      await expect(page.getByTestId("login-form")).toBeVisible();
    });

    // test.step() as outer group — visible in both HTML and Allure reports
    await test.step("Complete login form", async () => {
      // allure.step() as inner detail — visible only in Allure
      if (allure) {
        await allure.step("Enter email address", async () => {
          await page
            .getByTestId("auth-email-input")
            .fill("patient@healthhub.test");
        });
        await allure.step("Enter password", async () => {
          await page.getByTestId("auth-password-input").fill("Test123!");
        });
      } else {
        await page
          .getByTestId("auth-email-input")
          .fill("patient@healthhub.test");
        await page.getByTestId("auth-password-input").fill("Test123!");
      }
    });

    await test.step("Submit and verify", async () => {
      await page.getByTestId("auth-submit-button").click();
      await page.waitForURL(/dashboard/, { timeout: 10000 });
      await expect(page.getByTestId("dashboard-welcome")).toBeVisible();
    });
  });
});
