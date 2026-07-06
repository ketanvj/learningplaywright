// @ts-check
import { test, expect } from "@playwright/test";

test("Verify the page title of STC Tourism Website", async ({ page }) => {
  await page.goto("https://nichethyself.com/tourism/"); //page is a browser tab
  await expect(page).toHaveTitle(/Tourism/);
  await page.getByPlaceholder("Username").fill("stc123");
  await page.waitForTimeout(10000);
});

/*
┌─────────────────────────────────────┐
│         Browser                     │
│  ┌───────────────────────────────┐  │
│  │       Context (Session)       │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │    Page (Tab)           │  │  │
│  │  └─────────────────────────┘  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
*/

/*

test() method
Importing test and expect

name of the test as first para
test case as arrow async function.

page object which an object from class Page - tab in a browser

headless is default,

npx playwright test --headed

npx playwright test login

file name should be .spec.js

goto() method - Page class
*/
