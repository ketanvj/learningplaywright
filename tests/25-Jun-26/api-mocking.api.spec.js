import { test, expect } from "@playwright/test";

/*
We set it such that we will intercept the request from the browser. 
We response locally as if server has responded. 
page.route()
*/
const API_URL = "http://localhost:3001/api/v1";
const APP_URL = "http://localhost:5173";
test("mocked data should appear on the appointments page UI", async ({
  page,
}) => {
  const mockAppointments = [
    {
      id: 999,
      title: "Mocked Cardiology Visit",
      appointment_date: "2026-07-01",
      appointment_time: "09:00",
      duration_minutes: 30,
      type: "general",
      status: "scheduled",
      provider_name: "Dr. Mock",
      location: "Mock Clinic",
    },
    {
      id: 998,
      title: "Mocked Dental Check",
      appointment_date: "2026-07-15",
      appointment_time: "14:00",
      duration_minutes: 45,
      type: "general",
      status: "completed",
      provider_name: "Dr. Mock Dentist",
      location: null,
    },
  ];

  await page.route(`${APP_URL}/api/v1/appointments*`, async (route) => {
    // Only intercept GET — let POST/PUT/DELETE reach the real server
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: mockAppointments,
          pagination: { page: 1, limit: 10, total: 2, total_pages: 1 },
        }),
      });
    } else {
      await route.continue();
    }
  });

  await page.goto(APP_URL);
  await page.getByTestId("auth-email-input").fill("patient@healthhub.test");
  await page.getByTestId("auth-password-input").fill("Test123!");
  await page.getByTestId("auth-submit-button").click();
  await page.waitForURL(`${APP_URL}/dashboard`);
  await page.getByTestId("nav-appointments").click();
  await page.waitForURL(`${APP_URL}/appointments`);
  await page.waitForTimeout(10000);

  await expect(page.getByTestId("appointments-table")).toBeVisible();
  await expect(page.getByText("Mocked Cardiology Visit")).toBeVisible();
  await expect(page.getByText("Mocked Dental Check")).toBeVisible();
});

async function browserFetch(page, url, options = {}) {
  return page.evaluate(
    async ([url, options]) => {
      let status = null;
      try {
        const response = await fetch(url, options);
        status = response.status; // capture before parsing so errors don't lose it
        let body = null;
        const ct = response.headers.get("content-type") || "";
        if (ct.includes("application/json")) body = await response.json();
        return { status, body, error: null };
      } catch (e) {
        return { status, body: null, error: e.message };
      }
    },
    [url, options],
  );
}

test.describe("1. Basic Mock with route.fulfill()", () => {
  test("should return mocked appointments list", async ({ page }) => {
    const mockAppointments = [
      {
        id: 999,
        title: "Mocked Cardiology Visit",
        appointment_date: "2026-07-01",
        status: "scheduled",
      },
      {
        id: 998,
        title: "Mocked Dental Check",
        appointment_date: "2026-07-15",
        status: "scheduled",
      },
    ];

    await page.route(`${API_URL}/appointments`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: mockAppointments }),
      });
    });
    await page.goto(APP_URL);
    const result = await browserFetch(page, `${API_URL}/appointments`);
    expect(result.status).toBe(200);
    expect(result.body.success).toBe(true);
    expect(result.body.data).toHaveLength(2);
  });
});
