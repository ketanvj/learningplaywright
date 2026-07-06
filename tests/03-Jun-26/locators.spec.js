import { test, expect } from "@playwright/test";

test("Headings - basic getByRole functionality", async ({ page }) => {
  // Test main heading
  //  await page.goto("https://healthybites.nichethyself.com/");
  // await expect(
  //   page.getByRole("heading", { name: /🥗 HealthyBites/ }).first(),
  // ).toBeVisible();
  await page.getByRole("textbox", { name: "Username" }).fill("abc"); //Find the element
  //page.getByRole("heading", ``);
});

//Given a choice, you should use only `getByRole` in playwright. Nothing else.
/*
Playwright?
- Installation
- importing test and expect
- page methods, goto()
- browser context, 
- test() method structure - name of the test and test case itself
- expect for verification - title, text, attribute, 
- await-async
- playwright configuration
- command to run test from command line
- running in headed mode, 
- running only on specific browser
- package.json - information about your project.  the libraries on which our project has dependency
- Browsers - chromium, firefox, and webkit
- how Playwright knows which element to act upon, 
*/
