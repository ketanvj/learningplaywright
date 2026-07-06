/**
 * Frames, hover
 */
import { test, expect } from "@playwright/test";

test("Customized tour-new tab", async ({ page, context }) => {
  await page.goto("https://nichethyself.com/tourism/");
  await page.waitForTimeout(8000);
  const customizedTourPrommise = context.waitForEvent("page");
  await page.getByRole("link", { name: "Customized tours" }).click();
  const customTourTab = await customizedTourPrommise;
  const international = customTourTab.locator('form[name = "internationalf"]');
  international.getByPlaceholder("Full name").fill("John Doe");
  await page.waitForTimeout(5000);
  //'form[name = "internationalf"] input[placaeholder="Full name"]'
});
