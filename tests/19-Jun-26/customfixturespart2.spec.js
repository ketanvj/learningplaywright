//Fixture options
import { test as base, expect } from "@playwright/test";

const testWithUser = base.extend({
  // Define a fixture option
  userEmail: ["patient@healthhub.test", { option: true }],
  userPassword: ["Test123!", { option: true }],

  // Fixture that uses the options
  loggedInPage: async ({ page, userEmail, userPassword }, use) => {
    await page.goto("http://localhost:5173/login");
    await page.getByPlaceholder("you@example.com").fill(userEmail);
    await page.getByPlaceholder("Enter your password").fill(userPassword);
    await page.evaluate(() => {
      document.body.style.zoom = "1.25";
    });
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });

    await use(page);
  },
});

testWithUser("Example with default values", async ({ loggedInPage }) => {
  await expect(loggedInPage.getByTestId("dashboard-welcome")).toBeVisible();
  await loggedInPage.waitForTimeout(5000);
});

testWithUser.describe("with different user", () => {
  // Use sarah user which exists in the seed data (uses same password as patient)
  testWithUser.use({
    userEmail: "sarah@healthhub.test",
    userPassword: "Test123!",
  });

  testWithUser("uses sarah credentials", async ({ loggedInPage }) => {
    // This test uses sarah@healthhub.test
    await expect(loggedInPage.getByTestId("dashboard-welcome")).toBeVisible();
    await loggedInPage.waitForTimeout(5000);
  });
});

const testWithLogging = base.extend({
  // Automatic fixture - runs for every test
  autoLog: [
    async ({}, use, testInfo) => {
      console.log(`[START] ${testInfo.title}`);
      const startTime = Date.now();

      await use(undefined);

      const duration = Date.now() - startTime;
      console.log(`[END] ${testInfo.title} (${duration}ms)`);
    },
    { auto: true },
  ], // <-- auto: true makes it automatic
});

testWithLogging.describe("Automatic Fixtures", () => {
  testWithLogging("first test with auto logging", async ({ page }) => {
    // The autoLog fixture runs automatically
    await page.goto("http://localhost:5173/login");
    await expect(page).toHaveURL(/login/);
  });
});

const workerScopedFixture = base.extend({
  sharedResource: [
    async ({}, use) => {
      // Expensive setup - only done once per worker
      const resource = {
        id: Math.random().toString(36).substring(7),
        createdAt: new Date().toISOString(),
      };
      console.log(`Created shared resource: ${resource.id}`);

      await use(resource);

      // Teardown once when worker is done
      console.log(`Cleaning up resource: ${resource.id}`);
    },
    { scope: "worker" },
  ], // <-- scope: 'worker'
});

workerScopedFixture.describe("Worker-Scoped Fixtures", () => {
  // Serial mode keeps both tests in the same worker so scope:'worker' is shared
  workerScopedFixture.describe.configure({ mode: "serial" });

  workerScopedFixture(
    "first test - uses shared resource",
    async ({ sharedResource }) => {
      console.log(`Test 1 using resource: ${sharedResource.id}`);
      expect(sharedResource.id).toBeTruthy();
    },
  );

  workerScopedFixture(
    "second test - uses same shared resource",
    async ({ sharedResource }) => {
      console.log(`Test 2 using resource: ${sharedResource.id}`);
      expect(sharedResource.id).toBeTruthy();
      // Same resource.id as first test (in same worker)
    },
  );
});

const composedFixtures = base.extend({
  // Base fixture: Database connection (simulated)
  database: async ({}, use) => {
    const db = {
      users: [
        { id: 1, email: "patient@healthhub.test", name: "John Doe" },
        { id: 2, email: "sarah@healthhub.test", name: "Sarah Johnson" },
      ],
      findUser(email) {
        return this.users.find((u) => u.email === email);
      },
    };
    console.log("Database connection opened");
    await use(db);
    console.log("Database connection closed");
  },

  // Composed fixture: Uses database
  currentUser: async ({ database }, use) => {
    const user = database.findUser("patient@healthhub.test");
    console.log("current user fixture Setup");
    await use(user);
    console.log("current user fixture teardown");
  },

  // Another composed fixture: Uses currentUser
  userGreeting: async ({ currentUser }, use) => {
    const greeting = `Hello, ${currentUser.name}!`;
    console.log("user greeting fixture Setup");
    await use(greeting);
    console.log("user greeting fixture tear down");
  },
});

composedFixtures.describe("Composed Fixtures", () => {
  composedFixtures("can use database directly", async ({ database }) => {
    const user = database.findUser("sarah@healthhub.test");
    expect(user.name).toBe("Sarah Johnson");
  });

  composedFixtures(
    "can use currentUser (depends on database)",
    async ({ currentUser }) => {
      expect(currentUser.email).toBe("patient@healthhub.test");
      expect(currentUser.name).toBe("John Doe");
    },
  );

  composedFixtures.only(
    "can use userGreeting (depends on currentUser)",
    async ({ userGreeting }) => {
      expect(userGreeting).toBe("Hello, John Doe!");
    },
  );
});
