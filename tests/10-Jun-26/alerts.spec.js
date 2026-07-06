/*
- Revision of timeouts
- Managing alerts
- double click
- drag and drop
- file download
- iframe
*/
/*
Objective of timeouts
End state 
- We can release application with good quality
- on every commits, for every PR, daily, daily twice, once week
- faster they execute develers get faster feedback.
- One test, 
- timeouts
- global -enture suite should get over within global timeout you set. 
- test 
- action
- navigation
- expect

*/
/*
We are just using the methods and configuration items provided by Playwright. 
*/
import { test, expect } from "@playwright/test";

test("JS Alert", async ({ page }) => {
  await page.waitForTimeout(10000);
  await page.goto("https://healthybites.nichethyself.com/");
  await page.getByRole("checkbox", { name: "Select Mark Thompson" }).check();
  page.on("dialog", async (dialog) => {
    expect(dialog.message()).toBe("Delete 1 selected nutritionist(s)?");

    expect(dialog.type()).toBe("confirm");

    //3 types of alert
    /*
    1. With only one button, OK - alert
    Second, with two buttons: cancel and ok. - confirm 
    And 3rd with two buttons, cancel and OK, one text box - prompt
   */
    await page.waitForTimeout(5000);
    const defaultValue = dialog.defaultValue();
    await dialog.accept();
    //await dialog.dismiss();
  });
  await page.getByRole("button", { name: "Delete Selected" }).click();
  await page.waitForTimeout(5000);
});
//Listeners - listen to the events that are happening.
//dialog
//if alert comes playwright dismisses

/*
Assignment:
1. Visit https://the-internet.herokuapp.com/javascript_alerts
2. handle all 3 alerts
3, For each alert verify the message. 
4, For each alert after clicking Ok or cancel, verify the message displayed on the page. 
*/
