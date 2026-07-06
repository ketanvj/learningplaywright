/*
Revision
- locators
- role
- label
- placeholder
- text
- alttext
- title
- elments inside an element
- click
- fill
- goto()
- screenshot()
- expect methods
*/
/*
- How to clear a textbox
- How to handle checkbox and radio buttons
- How to handle dropdowns/combobox
- File Upload
- alerts
*/

import { test, expect } from "@playwright/test";
test("textbox clear method", async ({ page }) => {
  await page.goto("https://the-internet.herokuapp.com/login");
  await page.getByRole("textbox", { name: "Username" }).fill("admin");
  await page.waitForTimeout(5000);
  await page.getByRole("textbox", { name: "Username" }).clear();
  await page.waitForTimeout(5000);
});

test("Handling checkboxes", async ({ page }) => {
  await page.goto("https://the-internet.herokuapp.com");
  await page.getByRole("link", { name: "Checkboxes" }).click();
  await page.locator("form#checkboxes input:nth-child(1)").check();

  await page.waitForTimeout(3000);
  await expect(
    page.locator("form#checkboxes input:nth-of-type(2)"),
  ).not.toBeChecked();
  await page.locator("form#checkboxes input:nth-of-type(2)").check();
  await page.waitForTimeout(3000);

  await page.locator("form#checkboxes input:nth-of-type(2)").uncheck();

  //   await page.waitForTimeout(3000);
  //   await page.locator("form#checkboxes input:nth-of-type(2)").click();

  await page.waitForTimeout(3000);
});

test.only("Handling dropdowns", async ({ page }) => {
  await page.goto("https://the-internet.herokuapp.com");
  await page.getByRole("link", { name: "Dropdown" }).click();
  await page.waitForTimeout(10000);
  await page.getByRole("combobox").selectOption({ label: "Option 2" });
  await page.waitForTimeout(3000);
  await page.getByRole("combobox").selectOption({ value: "1" });
  await page.waitForTimeout(3000);
  await page.getByRole("combobox").selectOption({ index: 2 });
  await page.waitForTimeout(3000);
  const allOptions = await page.getByRole("combobox").allTextContents();
  console.log(allOptions);
  //Following code will work only with multiple select
  //   await page.getByRole("combobox").selectOption(["Option 1", "Option 2"]);
  //   await page
  //     .getByRole("combobox")
  //     .selectOption([{ label: "Option 1" }, { label: "Option 2" }]);
});
/*
Assignment:

1. Goto https://nichethyself.com/tourism/customised.html
2. Enter Fullname and enter email address
3. Flights with snacks provided - select No
4. Drop down select "Home Stay". 
5. Checkbox - select England
6. Verify that Switzerland checkbox is disabled.
7. Click on Submit button
*/
