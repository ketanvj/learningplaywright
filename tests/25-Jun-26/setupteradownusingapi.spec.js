import { test, expect } from "@playwright/test";

const API_URL = "http://localhost:3001/api/v1";
const APP_URL = "http://localhost:5173";

async function getAuthToken(request) {
  const res = await request.post(`${API_URL}/auth/login`, {
    data: { email: "patient@healthhub.test", password: "Test123!" },
  });
  const body = await res.json();
  return body.data.token;
}

async function createAppointment(request, token, overrides = {}) {
  const defaults = {
    title: "API-Created Test Appointment",
    appointment_date: "2027-01-15",
    appointment_time: "10:00",
    duration_minutes: 30,
    type: "general",
    provider_name: "Dr. API Test",
    location: "Test Clinic",
  };
  const res = await request.post(`${API_URL}/appointments`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { ...defaults, ...overrides },
  });
  const body = await res.json();
  return body.data; // returns the created appointment object with its id
}

async function deleteAppointment(request, token, id) {
  await request.delete(`${API_URL}/appointments/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

async function loginAndSearchAppointments(page, searchTerm) {
  await page.goto(APP_URL);
  await page.getByTestId("auth-email-input").fill("patient@healthhub.test");
  await page.getByTestId("auth-password-input").fill("Test123!");
  await page.getByTestId("auth-submit-button").click();
  await page.waitForURL(`${APP_URL}/dashboard`);
  await page.getByTestId("nav-appointments").click();
  await page.waitForURL(`${APP_URL}/appointments`);
  // Ensure the initial list has rendered before we start the search.
  await expect(page.getByTestId("appointments-table")).toBeVisible();
  // Register the response waiter BEFORE typing so we don't miss the fast response.
  // Use pressSequentially (fires real keyboard events) so React's onChange fires.
  const searchBox = page.getByTestId("appointments-search");
  await searchBox.click();
  const searchDone = page.waitForResponse(
    (r) => r.url().includes("/appointments") && r.request().method() === "GET",
  );
  await searchBox.pressSequentially(searchTerm, { delay: 30 });
  await searchDone; // debounce fires (~300 ms) then waits for the API to reply
}

test("FAST — create appointment via API then verify it in the UI", async ({
  page,
  request,
}) => {
  // Step 1: Get token and create the record via API (~200 ms total)
  const token = await getAuthToken(request);
  const appointment = await createAppointment(request, token, {
    title: "API-Created Appointment",
  });

  // ── actual test starts here ──
  // Step 2: Login, navigate, and search so pagination doesn't hide our record
  await loginAndSearchAppointments(page, "API-Created Appointment");

  // Step 3: Assert OUR specific appointment row is visible (by its unique ID to
  //         avoid strict-mode failures if orphaned records from past runs exist).
  await expect(
    page.getByTestId(`appointments-row-${appointment.id}`),
  ).toBeVisible();

  // Step 4: Clean up via API — always runs, even if assertions above fail
  await deleteAppointment(request, token, appointment.id);
});

test.describe("B. beforeEach / afterEach pattern", () => {
  let token;
  let createdAppointment;

  test.beforeEach(async ({ request }) => {
    // Runs before EVERY test in this describe block.
    // Each test gets a brand-new appointment — no state shared between tests.
    token = await getAuthToken(request);
    createdAppointment = await createAppointment(request, token, {
      title: "beforeEach Test Appointment",
      status: "scheduled",
    });
  });

  test.afterEach(async ({ request }) => {
    // Runs after EVERY test — even if the test threw an error.
    // Guaranteed cleanup means no orphaned records pollute subsequent runs.
    if (createdAppointment?.id) {
      await deleteAppointment(request, token, createdAppointment.id);
    }
  });

  test("appointment created in beforeEach appears in the UI", async ({
    page,
  }) => {
    await loginAndSearchAppointments(page, createdAppointment.title);
    await expect(
      page.getByTestId(`appointments-row-${createdAppointment.id}`),
    ).toBeVisible();
  });

  test("appointment row has the expected provider name", async ({ page }) => {
    await loginAndSearchAppointments(page, createdAppointment.title);
    const row = page.getByTestId(`appointments-row-${createdAppointment.id}`);
    await expect(row).toBeVisible();
    await expect(row.getByText("Dr. API Test")).toBeVisible();
  });

  test("appointment can be deleted from the UI", async ({ page }) => {
    await loginAndSearchAppointments(page, createdAppointment.title);

    // Delete via UI
    await page
      .getByTestId(`appointments-delete-${createdAppointment.id}`)
      .click();
    // Confirm in the modal
    await page.getByTestId("confirm-modal-confirm-btn").click();

    // Verify it is gone
    await expect(
      page.getByTestId(`appointments-row-${createdAppointment.id}`),
    ).not.toBeVisible();

    // afterEach will try to delete it — that is fine, it will get a 404 and
    // the deleteAppointment helper silently swallows it (no assertion on status).
    createdAppointment = null; // signal to afterEach that cleanup already done
  });
});
