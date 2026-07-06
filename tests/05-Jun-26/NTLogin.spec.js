import { test, expect } from "@playwright/test";

test("Headings - basic getByRole functionality", async ({ page }) => {
  await page.goto("https://nichethyself.com/tourism/");
  await page.getByRole("textbox", { name: "Username" }).fill("stc123"); //Find the element
  await page.getByRole("textbox", { name: "Password" }).fill("12345"); //Find the element
  const form = page.locator("form[name='loginform']");
  await form.getByRole("button").click();
  await expect(page).toHaveTitle(/My account/);
  await page.waitForTimeout(5000);
  await page.screenshot({ path: "screenshots/myaccount.png" });

  //  await page.locator("form[name='loginform']").getByRole("button").click();

  // form = page.locator("form[name='loginform'] button");

  //page.getByRole("heading", ``);
});

//Given a choice, you should use only `getByRole` in playwright. Nothing else.
/*

- getByRole() - ARIA roles, implicit roles and explicit roles, 

*/
