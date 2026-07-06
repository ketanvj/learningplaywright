import { test, expect } from "@playwright/test";

test("JS Alert", async ({ page }) => {
  await page.goto("https://the-internet.herokuapp.com/download");
  await page.waitForTimeout(10000);
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("link", { name: "Demo.txt" }).click();
  await page.waitForTimeout(5000);

  const downloadInfo = await downloadPromise;
  expect(downloadInfo.suggestedFilename()).toBe("Demo.txt");
  await downloadInfo.saveAs(`./downloads/abc.txt`);
});
