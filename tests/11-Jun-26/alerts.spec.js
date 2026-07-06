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

test("Javascript Alert example", async ({ page, context }) => {
  await page.goto("https://the-internet.herokuapp.com/javascript_alerts");
  page.on("dialog", async (dialog) => {
    expect(dialog.message()).toBe("I am a JS Alert"); //fails
    expect(dialog.type()).toBe("alert");
    await dialog.accept();
  });
  await page.getByRole("button", { name: "Click for JS Alert" }).click();

  expect(page.locator('p[id="result"]')).toHaveText(
    "You successfully clicked an alert",
  );
});

test("Javascript Prompt example - click OK", async ({ page, context }) => {
  await page.goto("https://the-internet.herokuapp.com/javascript_alerts");
  page.on("dialog", async (dialog) => {
    expect(dialog.message()).toBe("I am a JS prompt");
    expect(dialog.type()).toBe("prompt");
    await dialog.accept("Hello");
  });
  await page.getByRole("button", { name: "Click for JS Prompt" }).click();
  await page.waitForTimeout(5000);

  expect(page.locator('p[id="result"]')).toHaveText("You entered: Hello");
});
