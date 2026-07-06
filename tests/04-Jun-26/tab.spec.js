import { test, expect } from "@playwright/test";

test("getByRole option: selected", async ({ page }) => {
  await page.goto("https://healthybites.nichethyself.com/");
  // selected: true — tab that has aria-selected="true"
  const selectedTab = page.getByRole("tab", {
    name: "📊 Progress (role: tab)",
    selected: true,
  });

  // selected: false — the two unselected tabs
  const unselectedTabs = page.getByRole("tab", { selected: false });
  await page
    .getByRole("tab", {
      name: "🍽️ Meal Plans (role: tab)",
      exact: true,
      pressed: true,
      disabled: true,
    })
    .click();

  page.getByRole("textbox", { name: "Username", description: "ABC" });
  page.getByLabel("Username");
  page.getByAltText("Before transformation - Maria lost 30 pounds");
  page.getByTitle("Sponsered Ad");
  page.getByTestId("directions");
});
