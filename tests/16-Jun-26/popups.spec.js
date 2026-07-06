/**
 * Frames, hover
 */
import { test, expect } from "@playwright/test";

test("Contact Us-new window with popup", async ({ page }) => {
  await page.goto("https://nichethyself.com/tourism/");
  await page.waitForTimeout(8000);
  const contactUs = page.waitForEvent("popup");
  await page.getByRole("button", { name: "Contact us!" }).click();
  const contactUsWin = await contactUs;
  await expect(contactUsWin).toHaveTitle("Contact us");
  await page.waitForTimeout(5000);
});

test.only("Contact Us-new window-with page", async ({ page, context }) => {
  await page.goto("https://nichethyself.com/tourism/");
  await page.waitForTimeout(8000);
  const contactUs = context.waitForEvent("page");
  await page.getByRole("button", { name: "Contact us!" }).click();
  const contactUsWin = await contactUs;
  await expect(contactUsWin).toHaveTitle("Contact us");
  await page.waitForTimeout(5000);
  contactUsWin.close();
  await page.waitForTimeout(5000);
});
/*
Widely used:
Events Most Frequently Asked in Interviews
page
popup
dialog
download
load
request
response
requestfailed
requestfinished
filechooser
*/
