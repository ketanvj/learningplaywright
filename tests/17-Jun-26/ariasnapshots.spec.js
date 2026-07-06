//aria - snapshot
//snapshot of the accessibility tree

import { test, expect } from "@playwright/test";
async function login(page) {
  await page.goto("http://localhost:5173/login");
  await page.getByPlaceholder("you@example.com").fill("patient@healthhub.test");
  await page.getByPlaceholder("Enter your password").fill("Test123!");
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });
}

test("should match login page heading structure", async ({ page }) => {
  await page.goto("http://localhost:5173/login");

  // Match the heading in the login page
  //   await expect(page.getByRole("heading", { level: 1 })).toMatchAriaSnapshot(`
  //         - heading "Welcome back" [level=2]
  //       `);

  await expect(page.getByRole("heading", { level: 1 })).toMatchAriaSnapshot(
    `  - heading "Welcome back" [level=1]`,
  );
  await page.goto("http://localhost:5173/login");
  await expect(page.getByTestId("login-form")).toMatchAriaSnapshot(`
    - text: Password*
    - textbox "Password*":
      - /placeholder: Enter your password
    - button "Show password":
      - img
    - text: Email address*
    - textbox "Email address*":
      - /placeholder: you@example.com
    - checkbox "Remember me"
    - text: Remember me
    - link "Forgot password?":
      - /url: /forgot-password
    - button "Sign in"
    - paragraph:
      - text: "Test credentials:"
      - code: patient@healthhub.test / Test123!
    `);

  /*
await page.goto('http://localhost:5173/login');
await page.getByTestId('auth-email-input').click();
  await expect(page.getByTestId("login-form")).toMatchAriaSnapshot(`
        - text: Password*
        - textbox "Password*":
          - /placeholder: Enter your password
        - button "Show password":
          - img
        - text: Email address*
        - textbox "Email address*":
          - /placeholder: you@example.com
        - checkbox "Remember me"
        - text: Remember me
        - link "Forgot password?":
          - /url: /forgot-password
        - button "Sign in"
        - paragraph:
          - text: "Test credentials:"
          - code: patient@healthhub.test / Test123!
        `);
        */
});

test("should match login form structure", async ({ page }) => {
  await page.goto("/login");

  // Match form elements structure - use partial matching for flexibility
  // Labels include * for required fields
  await expect(page.getByTestId("login-form")).toMatchAriaSnapshot(`
        - /children: contain
        - textbox /Email/
        - textbox /Password/
        - checkbox /Remember/
        - link /Forgot/
        - button /Sign in/
      `);
});

test("should match checkbox states", async ({ page }) => {
  await page.goto("/login");

  const checkbox = page.getByRole("checkbox", { name: /remember me/i });

  // Unchecked state - no [checked] attribute
  await expect(checkbox).toMatchAriaSnapshot(`
        - checkbox "Remember me"
      `);

  // Check the checkbox
  await checkbox.check();

  // Checked state - includes [checked] attribute
  await expect(checkbox).toMatchAriaSnapshot(`
        - checkbox "Remember me" [checked]
      `);

  await expect(nav).toMatchAriaSnapshot(`
        - navigation:
          - link
      `);
});

test("should generate aria snapshot for debugging", async ({ page }) => {
  await page.goto("/login");

  // Use ariaSnapshot() to get the YAML representation
  const snapshot = await page.getByTestId("login-form").ariaSnapshot();

  // Log for debugging - useful when creating new tests
  console.log("Login form ARIA snapshot:");
  console.log(snapshot);

  // Verify it's a valid snapshot string (no 'form' role, elements directly)
  expect(snapshot).toContain("textbox");
  expect(snapshot).toContain("button");
  expect(snapshot).toContain("checkbox");
});
