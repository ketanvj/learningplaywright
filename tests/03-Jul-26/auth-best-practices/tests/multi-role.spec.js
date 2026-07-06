import { test, expect } from "../fixtures/auth-fixtures.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test("patient and admin logins", async ({ browser }) => {
  const patientContext = await browser.newContext({
    storageState: path.join(__dirname, "..", ".auth", "patient.json"),
  });
  const patientPage = await patientContext.newPage();

  const adminContext = await browser.newContext({
    storageState: path.join(__dirname, "..", ".auth", "admin.json"),
  });
  const adminPage = await adminContext.newPage();

  await patientPage.goto("/dashboard");
  await adminPage.goto("/dashboard");
  // Patient should see "John" in the greeting
  const patientWelcome = patientPage.getByTestId("dashboard-welcome");
  await expect(patientWelcome).toBeVisible();
  await expect(patientWelcome).toContainText("John");

  // Admin should see "Jane" in the greeting
  const adminWelcome = adminPage.getByTestId("dashboard-welcome");
  await expect(adminWelcome).toBeVisible();
  await expect(adminWelcome).toContainText("Jane");
  await patientPage.waitForTimeout(5000);
  // Clean up — always close contexts you create manually
  await patientContext.close();
  await adminContext.waitForTimeout(5000);
  await adminContext.close();
});

test('patient and admin see different views (fixture approach)', async ({ page, adminPage }) => {

    // Navigate both users to the dashboard
    await page.goto('/dashboard');
    await adminPage.goto('/dashboard');

    // Patient (default page) sees John's greeting
    await expect(page.getByTestId('dashboard-welcome')).toContainText('John');

    // Admin (fixture page) sees Jane's greeting
    await expect(adminPage.getByTestId('dashboard-welcome')).toContainText('Jane');
  });
