import { test, expect } from "@playwright/test";

test.describe("Login Tests", () => {
  test("successful login", async ({ page }) => {
    // Test code
  });

  test("failed login", async ({ page }) => {
    // Test code
  });
});

test.describe("Logout Tests", () => {
  test("successful logout", async ({ page }) => {
    // Test code
  });
});

test.describe("User Authentication", () => {
  test.describe("Login", () => {
    test("with valid credentials", async ({ page }) => {
      // Test code
    });

    test("with invalid credentials", async ({ page }) => {
      // Test code
    });
  });

  test.describe("Logout", () => {
    test("from dashboard", async ({ page }) => {
      // Test code
    });
  });
});

/*
In Selenium, you have to write code to synchronize with the browser. 
In Playwright, Playwright takes care of it. 

Whenever you try to take action on an element, playwright checks the following: 
1. First, it checks whether the element is there or not in the DOM.
2. Second, it checks if it is visible. If it is not visible, then it will wait for it to become visible.
3. Then it will check if the element is stable, i.e., it is not animating, it is not moving around.
4. Right, so that it will check, and then it will check if the element is enabled. If it is the case, then do the click.
*/
