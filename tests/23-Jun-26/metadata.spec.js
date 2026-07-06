import { test, expect } from "@playwright/test";
test.describe("TestInfo - Reading Metadata", () => {
  test("access test metadata via testInfo parameter", async ({
    page,
  }, testInfo) => {
    // testInfo is the second parameter after fixtures
    console.log("Test title:", testInfo.title);
    console.log("Project:", testInfo.project.name);
    console.log("Retry attempt:", testInfo.retry);
    console.log("Timeout:", testInfo.timeout);
    console.log("Output dir:", testInfo.outputDir);
    console.log("Snapshot dir:", testInfo.snapshotDir);

    await page.goto("http://localhost:5173/login");
    await expect(page).toHaveURL(/login/);
  });

  test("access test metadata via test.info()", async ({ page }) => {
    // test.info() returns the same TestInfo object
    const info = test.info();
    console.log("Test title:", info.title);
    console.log("Project:", info.project.name);

    await page.goto("/login");
    await expect(page).toHaveURL(/login/);
  });
});

test.describe("TestInfo - Conditional Logic", () => {
  test.describe.configure({ retries: 2 });

  test("adjust behavior based on retry count", async ({ page }, testInfo) => {
    if (testInfo.retry > 0) {
      console.log(`Retry #${testInfo.retry} - adding extra wait`);
      await page.waitForTimeout(1000); //Hard wait
    }

    await page.goto("/login");
    await expect(page).toHaveURL(/logn/);
  });

  test("use retry count to adjust test behavior", async ({
    page,
  }, testInfo) => {
    // On retries, you might want different strategies
    if (testInfo.retry > 0) {
      console.log(`Retry #${testInfo.retry} - using longer timeouts`);
      // Give more time on retries for flaky scenarios
      await page.goto("/login", { timeout: 30000 });
    } else {
      await page.goto("/login");
    }

    await expect(page).toHaveURL(/login/);
  });

  test.only("take extra diagnostics on retry", async ({ page }, testInfo) => {
    await page.goto("http://localhost:5173/login");

    // On retry, capture extra info for debugging
    if (testInfo.retry > 0) {
      const screenshot = testInfo.outputPath(
        `retry-${testInfo.retry}-screenshot.png`,
      );
      await page.screenshot({ path: screenshot });
      await testInfo.attach(`retry-${testInfo.retry}-screenshot`, {
        path: screenshot,
        contentType: "image/png",
      });
    }

    await expect(page).toHaveURL(/login1/);
  });
});
