import { test, expect } from "@playwright/test";

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const loginScenariosFromFile = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "test-data", "login-scenarios.json"),
    "utf-8",
  ),
);

// Data Driven Testing.
// Data is driving the test case execution.
// Login functionality, user, password, role, 60 possible combinations.
// I have to execute the login test case 60 times, but copy pasting different data
//Your data can be inside your spec file or your data can be outside
// in a CSV, JSON, XLS,
/**

 * Steps:
 * 1. Give location of data file to Javascript
 * 2. Read the file content into text
 * 3. Parse the content into Javascript object 
 * 5. Then you can loop through the test cases, and provide 
 *    different data in each iteration. 
 */

test.describe("Data from JSON file — Login Scenarios", () => {
  for (const scenario of loginScenariosFromFile) {
    test(`[JSON] login: ${scenario.name}`, async ({ page }) => {
      await page.goto("http://localhost:5173/login");
      await page.getByTestId("auth-email-input").fill(scenario.email);
      await page.waitForTimeout(4000);
      await page.getByTestId("auth-password-input").fill(scenario.password);
      console.log(scenario.email);
      await page.getByTestId("auth-submit-button").click();

      if (scenario.shouldSucceed) {
        await page.waitForURL(/dashboard/, { timeout: 10000 });
        await expect(page.getByTestId("dashboard-welcome")).toBeVisible();
      } else {
        await expect(page.getByTestId("auth-error-message")).toBeVisible({
          timeout: 5000,
        });
        await expect(page).toHaveURL(/login/);
      }
    });
  }
});

function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");

  const [headerLine, ...dataLines] = content.trim().split("\n");

  const headers = headerLine.split(",").map((h) => h.trim());

  return dataLines
    .filter((line) => line.trim())

    .map((line) => {
      const values = line.split(",").map((v) => v.trim());

      return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]));
    });
}
//{ title: 'CSV Checkup Alpha', type: 'general', date: '2028-03-01', ... }

const API_URL = "http://localhost:3001/api/v1";
const appointmentsFromCSV = parseCSV(
  path.join(__dirname, "test-data", "appointments.csv"),
);

test.describe("Data from CSV file — Appointment Creation", () => {
  let token;

  test.beforeAll(async ({ request }) => {
    const res = await request.post(`${API_URL}/auth/login`, {
      data: { email: "patient@healthhub.test", password: "Test123!" },
    });
    const body = await res.json();
    token = body.data.token;
  });

  for (const row of appointmentsFromCSV) {
    test(`[CSV] creates appointment: ${row.title}`, async ({ request }) => {
      // CREATE via API using row data from the CSV
      const createRes = await request.post(`${API_URL}/appointments`, {
        headers: { Authorization: `Bearer ${token}` },
        data: {
          title: row.title,
          type: row.type,
          appointment_date: row.date,
          appointment_time: row.time,
          duration_minutes: Number(row.duration),
          provider_name: row.provider,
          location: row.location,
        },
      });
      expect(createRes.status()).toBe(201);
      const created = (await createRes.json()).data;
      expect(created.title).toBe(row.title);

      // CLEANUP — delete so repeated runs stay clean
      await request.delete(`${API_URL}/appointments/${created.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    });
  }
});
