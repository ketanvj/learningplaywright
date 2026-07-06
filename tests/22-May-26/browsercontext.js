import { chromium } from "playwright";
async function openBrowserTabs() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext(); //
  const page = await context.newPage();
  const page1 = await context.newPage();
  await page.goto("https://nichethyself.com/tourism/");

  await page.waitForTimeout(10000);
  await browser.close();
}

openBrowserTabs();
