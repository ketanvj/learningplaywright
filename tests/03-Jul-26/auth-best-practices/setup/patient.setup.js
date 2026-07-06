import { test as setup, expect } from "@playwright/test";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ── Resolve paths ───────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PATIENT_STATE = path.join(__dirname, "..", ".auth", "patient.json");

setup("authenticate as patient", async ({ page }) => {
  // Ensure the .auth/ directory exists (first run won't have it)
  fs.mkdirSync(path.dirname(PATIENT_STATE), { recursive: true });

  // ── Step 1: Navigate to login page ──────────────────────────────────────
  await page.goto("/login");

  // ── Step 2: Fill credentials and submit ─────────────────────────────────
  // Using the actual HealthHub test IDs from the login form
  await page.getByTestId("auth-email-input").fill("patient@healthhub.test");
  await page.getByTestId("auth-password-input").fill("Test123!");
  await page.getByTestId("auth-submit-button").click();

  // ── Step 3: Wait for successful login ───────────────────────────────────
  // The app redirects to /dashboard after successful login.
  // We verify the dashboard welcome message is visible to confirm auth worked.
  await page.waitForURL(/dashboard/, { timeout: 10000 });
  await expect(page.getByTestId("dashboard-welcome")).toBeVisible();

  // Verify it's the patient user (John)
  await expect(page.getByTestId("dashboard-welcome")).toContainText("John");

  // ── Step 4: Save the authenticated state ────────────────────────────────
  //
  // This saves a JSON file containing:
  //   {
  //     "cookies": [...],
  //     "origins": [{
  //       "origin": "http://localhost:5173",
  //       "localStorage": [{
  //         "name": "healthhub_token",
  //         "value": "eyJhbG..."   <-- the JWT
  //       }]
  //     }]
  //   }
  //
  // When a test project has `storageState: '.auth/patient.json'`,
  // Playwright injects these cookies and localStorage entries into
  // every new browser context before the test runs.
  //
  await page.context().storageState({ path: PATIENT_STATE });
});
