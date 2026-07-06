import { test, expect } from "@playwright/test";

test("JS Alert", async ({ page }) => {
  await page.goto("https://the-internet.herokuapp.com/drag_and_drop");
  await page.waitForTimeout(10000);

  const source = page.locator("#column-a");
  const target = page.locator("#column-b");
  await source.dragTo(target);
  await page.waitForTimeout(5000);
  await expect(target).toHaveText("A");
  await expect(source).toHaveText("B");
});

/*
Assignment
- Goto https://www.globalsqa.com/demo-site/draganddrop/
- drag High Tatras 2 into trash 
- verify that it indeep was dropped inside trash. 
*/
