// ============================================================================
//
//   PLAYWRIGHT CONFIG — Authentication Best Practices
//
//   This is a DEDICATED config for the auth-best-practices training material.
//   It uses Playwright's project dependencies to run auth setup before tests.
//
//   HOW IT WORKS:
//     1. "setup" projects run FIRST — they log in and save browser state to JSON
//     2. "test" projects depend on setup — they load the saved state
//     3. Every test starts already logged in, no login form needed
//
//   This is the official Playwright pattern:
//     https://playwright.dev/docs/auth
//
//   USAGE:
//     cd healthhub-app/tests
//     npx playwright test --config=specs/auth-best-practices/playwright.config.auth-bp.js
//
// ============================================================================

import { defineConfig, devices } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

// ── Resolve __dirname for ESM ───────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Storage State File Paths ────────────────────────────────────────────────
// These JSON files store cookies + localStorage after login.
// Created by setup projects, consumed by test projects.
// The .auth/ directory is created at runtime — add it to .gitignore.
const PATIENT_STATE = path.join(__dirname, ".auth", "patient.json");
const ADMIN_STATE = path.join(__dirname, ".auth", "admin.json");

export default defineConfig({
  // ── Test Directory ──────────────────────────────────────────────────────
  // All test and setup files live under this directory.
  testDir: ".",

  // ── General Settings ────────────────────────────────────────────────────
  timeout: 30_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: "html",

  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  // ── Projects ────────────────────────────────────────────────────────────
  //
  // PROJECT DEPENDENCIES are the key concept here.
  //
  // Setup projects:
  //   - Run first (no dependencies)
  //   - Perform login and save storageState to a JSON file
  //   - Use `testMatch` to target only their specific setup file
  //
  // Test projects:
  //   - Declare `dependencies: ['setup-project-name']`
  //   - Playwright waits for setup to finish before running these
  //   - Load storageState from the JSON file — every test starts logged in
  //
  projects: [
    // ────────────────────────────────────────────────────────────────────
    // SETUP PROJECTS — Run first, before any tests
    // ────────────────────────────────────────────────────────────────────

    {
      name: "patient-setup",
      testMatch: /patient\.setup\.js/,
      // No storageState — starts unauthenticated, performs the login
    },

    {
      name: "admin-setup",
      testMatch: /admin\.setup\.js/,
      // No storageState — starts unauthenticated, performs the login
    },

    // ────────────────────────────────────────────────────────────────────
    // TEST PROJECTS — Run after their setup dependency completes
    // ────────────────────────────────────────────────────────────────────

    {
      name: "patient-tests",
      testDir: "./tests",
      testMatch:
        /authenticated\.spec\.js|session-management\.spec\.js|worker-scoped-auth\.spec\.js/,
      use: {
        ...devices["Desktop Chrome"],
        // Every test in this project starts with the patient's auth state
        storageState: PATIENT_STATE,
      },
      dependencies: ["patient-setup"],
    },

    {
      name: "admin-tests",
      testDir: "./tests",
      testMatch: /multi-role\.spec\.js/,
      use: {
        ...devices["Desktop Chrome"],
        // Multi-role tests start as patient, then create admin contexts as needed
        storageState: ADMIN_STATE,
      },
      dependencies: ["patient-setup", "admin-setup"],
    },

    {
      name: "logged-out-tests",
      testDir: "./tests",
      testMatch: /unauthenticated\.spec\.js/,
      use: {
        ...devices["Desktop Chrome"],
        // Explicitly empty storageState — no cookies, no localStorage
        // This is different from omitting storageState (which might inherit defaults)
        storageState: { cookies: [], origins: [] },
      },
      // No dependencies — these tests don't need any setup project
    },
  ],

  // ── Web Servers ───────────────────────────────────────────────────────
  // Start the HealthHub backend and frontend before running tests.
  // reuseExistingServer: true means "if servers are already running, use them."
  webServer: [
    {
      command: "cd ../../../backend && npm run dev",
      url: "http://localhost:3001/api/health",
      reuseExistingServer: !process.env.CI,
      timeout: 30000,
    },
    {
      command: "cd ../../../frontend && npm run dev",
      url: "http://localhost:5173",
      reuseExistingServer: !process.env.CI,
      timeout: 30000,
    },
  ],
});
