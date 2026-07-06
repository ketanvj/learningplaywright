// ============================================================================
//
//   admin.setup.js — Save Admin Auth State via UI Login
//
// ============================================================================
//
// Same pattern as patient.setup.js, but for the admin user.
//
// HealthHub admin credentials: admin@healthhub.test / Admin123!
// Admin user: Jane Smith (role: admin)
//
// This setup file is targeted by the 'admin-setup' project in the config
// via `testMatch: /admin\.setup\.js/`.
//
// ============================================================================

import { test as setup, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ADMIN_STATE = path.join(__dirname, '..', '.auth', 'admin.json');

setup('authenticate as admin', async ({ page }) => {

  // Ensure the .auth/ directory exists
  fs.mkdirSync(path.dirname(ADMIN_STATE), { recursive: true });

  // Navigate to login
  await page.goto('/login');

  // Fill admin credentials and submit
  await page.getByTestId('auth-email-input').fill('admin@healthhub.test');
  await page.getByTestId('auth-password-input').fill('Admin123!');
  await page.getByTestId('auth-submit-button').click();

  // Wait for the dashboard
  await page.waitForURL(/dashboard/, { timeout: 10000 });
  await expect(page.getByTestId('dashboard-welcome')).toBeVisible();

  // Verify it's the admin user (Jane)
  await expect(page.getByTestId('dashboard-welcome')).toContainText('Jane');

  // Save admin auth state
  await page.context().storageState({ path: ADMIN_STATE });
});
