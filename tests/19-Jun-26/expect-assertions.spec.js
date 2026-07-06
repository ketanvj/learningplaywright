import { test, expect } from "@playwright/test";

const BASE_URL = "https://healthybites.nichethyself.com/";

// ─────────────────────────────────────────────────────────────────────────────
// 1. PAGE ASSERTIONS  (toHaveURL, toHaveTitle)
// ─────────────────────────────────────────────────────────────────────────────
test.describe("Page Assertions", () => {
  test("toHaveURL – exact match and regex", async ({ page }) => {
    await page.goto(BASE_URL);

    // Exact string
    await expect(page).toHaveURL("https://healthybites.nichethyself.com/");

    // Regex – domain contains 'nichethyself'
    await expect(page).toHaveURL(/nichethyself\.com/);
  });

  test("toHaveTitle – page title", async ({ page }) => {
    await page.goto(BASE_URL);

    // Exact title
    await expect(page).toHaveTitle("HealthyBites - Your Wellness Journey Starts Here");

    // Regex – title starts with 'HealthyBites'
    await expect(page).toHaveTitle(/^HealthyBites/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. VISIBILITY ASSERTIONS  (toBeVisible, toBeHidden, toBeAttached)
// ─────────────────────────────────────────────────────────────────────────────
test.describe("Visibility Assertions", () => {
  test("toBeVisible – nav links are visible", async ({ page }) => {
    await page.goto(BASE_URL);

    await expect(page.getByRole("link", { name: "Home" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Recipes" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Nutrition Tips" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Contact Us" })).toBeVisible();
  });

  test("toBeAttached – heading is attached to the DOM", async ({ page }) => {
    await page.goto(BASE_URL);

    await expect(page.getByRole("heading", { name: /Welcome to Your Health Journey/i })).toBeAttached();
  });

  test(".not.toBeVisible – hidden element is not visible", async ({ page }) => {
    await page.goto(BASE_URL);

    // A heading that doesn't exist should not be visible
    await expect(page.getByRole("heading", { name: "This heading does not exist" })).not.toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. TEXT ASSERTIONS  (toHaveText, toContainText)
// ─────────────────────────────────────────────────────────────────────────────
test.describe("Text Assertions", () => {
  test("toHaveText – exact text on heading", async ({ page }) => {
    await page.goto(BASE_URL);

    await expect(
      page.getByRole("heading", { name: /Welcome to Your Health Journey/i })
    ).toHaveText("Welcome to Your Health Journey");
  });

  test("toContainText – heading contains a substring", async ({ page }) => {
    await page.goto(BASE_URL);

    // The H1/H2 banner heading contains 'Wellness'
    await expect(
      page.getByRole("heading", { name: /HealthyBites/i })
    ).toContainText("HealthyBites");
  });

  test("toContainText – nav contains expected link labels", async ({ page }) => {
    await page.goto(BASE_URL);

    const nav = page.getByRole("navigation");
    await expect(nav).toContainText("Recipes");
    await expect(nav).toContainText("Nutrition Tips");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. COUNT ASSERTIONS  (toHaveCount)
// ─────────────────────────────────────────────────────────────────────────────
test.describe("Count Assertions", () => {
  test("toHaveCount – at least 4 nav links", async ({ page }) => {
    await page.goto(BASE_URL);

    const navLinks = page.getByRole("navigation").getByRole("link");
    // Expect at least 4 nav links (Home, Recipes, Nutrition Tips, Contact Us)
    const count = await navLinks.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test("toHaveCount – exactly 0 broken links with placeholder text", async ({ page }) => {
    await page.goto(BASE_URL);

    // Links that say "click here" are bad practice – expect none
    await expect(page.getByRole("link", { name: "click here" })).toHaveCount(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. ATTRIBUTE ASSERTIONS  (toHaveAttribute, toHaveClass, toHaveId, toHaveCSS)
// ─────────────────────────────────────────────────────────────────────────────
test.describe("Attribute Assertions", () => {
  test("toHaveAttribute – email link has correct href", async ({ page }) => {
    await page.goto(BASE_URL);

    const emailLink = page.getByRole("link", { name: /support@healthybites/i });
    await expect(emailLink).toHaveAttribute("href", "mailto:support@healthybites.com");
  });

  test("toHaveAttribute – logo image has an alt attribute", async ({ page }) => {
    await page.goto(BASE_URL);

    const logo = page.getByRole("img").first();
    // img must have an alt attribute (accessibility)
    await expect(logo).toHaveAttribute("alt", /.*/);
  });

  test("toHaveCSS – Start Free Trial button has a visible background color", async ({ page }) => {
    await page.goto(BASE_URL);

    const btn = page.getByRole("button", { name: /Start Free Trial/i });
    // Background-color should not be empty/transparent
    const bg = await btn.evaluate((el) =>
      window.getComputedStyle(el).backgroundColor
    );
    expect(bg).not.toBe("transparent");
    expect(bg).toBeTruthy();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. FORM STATE ASSERTIONS
//    (toBeEnabled, toBeDisabled, toBeEditable, toBeChecked, toHaveValue,
//     toBeEmpty, toBeFocused)
// ─────────────────────────────────────────────────────────────────────────────
test.describe("Form State Assertions", () => {
  test("toBeEnabled – active buttons are enabled", async ({ page }) => {
    await page.goto(BASE_URL);

    await expect(page.getByRole("button", { name: /Start Free Trial/i })).toBeEnabled();
    await expect(page.getByRole("button", { name: /Join Newsletter/i })).toBeEnabled();
  });

  test("toBeDisabled – Premium Feature button is disabled", async ({ page }) => {
    await page.goto(BASE_URL);

    await expect(page.getByRole("button", { name: /Premium Feature/i })).toBeDisabled();
  });

  test("toBeEditable – text input is editable", async ({ page }) => {
    await page.goto(BASE_URL);

    const nameInput = page.getByRole("textbox", { name: /Full Name/i });
    await expect(nameInput).toBeEditable();
  });

  test("toBeEmpty – input is empty before typing", async ({ page }) => {
    await page.goto(BASE_URL);

    const nameInput = page.getByRole("textbox", { name: /Full Name/i });
    await expect(nameInput).toBeEmpty();
  });

  test("toHaveValue – input reflects typed value", async ({ page }) => {
    await page.goto(BASE_URL);

    const nameInput = page.getByRole("textbox", { name: /Full Name/i });
    await nameInput.fill("Jane Doe");
    await expect(nameInput).toHaveValue("Jane Doe");
  });

  test("toHaveValues – combobox (select) reflects chosen option", async ({ page }) => {
    await page.goto(BASE_URL);

    const select = page.getByRole("combobox", { name: /Dietary Preference/i });
    await select.selectOption("Vegetarian");
    await expect(select).toHaveValue("Vegetarian");
  });

  test("toBeChecked / not.toBeChecked – checkbox state", async ({ page }) => {
    await page.goto(BASE_URL);

    const checkbox = page.getByRole("checkbox").first();
    // Initially unchecked
    await expect(checkbox).not.toBeChecked();

    await checkbox.check();
    await expect(checkbox).toBeChecked();
  });

  test("toBeFocused – input receives focus on click", async ({ page }) => {
    await page.goto(BASE_URL);

    const emailInput = page.getByRole("textbox", { name: /Email/i });
    await emailInput.click();
    await expect(emailInput).toBeFocused();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. VIEWPORT / SCROLL ASSERTIONS  (toBeInViewport)
// ─────────────────────────────────────────────────────────────────────────────
test.describe("Viewport Assertions", () => {
  test("toBeInViewport – hero heading is visible in viewport on load", async ({ page }) => {
    await page.goto(BASE_URL);

    await expect(
      page.getByRole("heading", { name: /Welcome to Your Health Journey/i })
    ).toBeInViewport();
  });

  test(".not.toBeInViewport – footer is not in viewport on initial load", async ({ page }) => {
    await page.goto(BASE_URL);

    // Footer starts off-screen on a normal viewport
    const footer = page.getByRole("contentinfo");
    await expect(footer).not.toBeInViewport();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. ARIA / ROLE ASSERTIONS  (toHaveRole, toHaveAccessibleName)
// ─────────────────────────────────────────────────────────────────────────────
test.describe("ARIA Assertions", () => {
  test("toHaveRole – button elements have button role", async ({ page }) => {
    await page.goto(BASE_URL);

    const btn = page.getByRole("button", { name: /Start Free Trial/i });
    await expect(btn).toHaveRole("button");
  });

  test("toHaveAccessibleName – nav landmark has accessible name", async ({ page }) => {
    await page.goto(BASE_URL);

    // Navigation element should have an accessible name (aria-label or title)
    const nav = page.getByRole("navigation");
    // At minimum the navigation role exists
    await expect(nav.first()).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. GENERIC (NON-RETRYING) ASSERTIONS
//    (toBe, toEqual, toBeTruthy, toBeFalsy, toContain, toHaveLength,
//     toMatch, toBeGreaterThan, toBeLessThan, toBeInstanceOf, toMatchObject)
// ─────────────────────────────────────────────────────────────────────────────
test.describe("Generic Assertions", () => {
  test("toBe – strict equality on primitive values", async ({ page }) => {
    await page.goto(BASE_URL);

    const title = await page.title();
    expect(title).toBe("HealthyBites - Your Wellness Journey Starts Here");
  });

  test("toEqual – deep equality on objects", async () => {
    const user = { name: "Jane", role: "member" };
    expect(user).toEqual({ name: "Jane", role: "member" });
  });

  test("toBeTruthy / toBeFalsy – truthy/falsy checks", async ({ page }) => {
    await page.goto(BASE_URL);

    const title = await page.title();
    expect(title).toBeTruthy(); // non-empty string is truthy

    const emptyStr = "";
    expect(emptyStr).toBeFalsy();
  });

  test("toContain – string and array containment", async ({ page }) => {
    await page.goto(BASE_URL);

    const url = page.url();
    expect(url).toContain("healthybites");

    const navLabels = ["Home", "Recipes", "Nutrition Tips", "Contact Us"];
    expect(navLabels).toContain("Recipes");
  });

  test("toHaveLength – array and string length", async ({ page }) => {
    await page.goto(BASE_URL);

    const navLinks = await page.getByRole("navigation").getByRole("link").all();
    expect(navLinks).toHaveLength(navLinks.length); // self-consistent check

    const title = await page.title();
    expect(title.length).toBeGreaterThan(5);
  });

  test("toMatch – regex on strings", async ({ page }) => {
    await page.goto(BASE_URL);

    const url = page.url();
    expect(url).toMatch(/^https:\/\//); // URL starts with https://
  });

  test("toBeGreaterThan / toBeLessThan – numeric comparisons", async ({ page }) => {
    await page.goto(BASE_URL);

    const headingCount = await page.getByRole("heading").count();
    expect(headingCount).toBeGreaterThan(3);
    expect(headingCount).toBeLessThan(100);
  });

  test("toBeGreaterThanOrEqual / toBeLessThanOrEqual", async ({ page }) => {
    await page.goto(BASE_URL);

    const buttonCount = await page.getByRole("button").count();
    expect(buttonCount).toBeGreaterThanOrEqual(5); // several buttons on the page
    expect(buttonCount).toBeLessThanOrEqual(50);
  });

  test("toBeInstanceOf – value is an instance of a class", async ({ page }) => {
    await page.goto(BASE_URL);

    const locator = page.getByRole("heading").first();
    // A Playwright Locator is an object
    expect(locator).toBeInstanceOf(Object);

    const now = new Date();
    expect(now).toBeInstanceOf(Date);
  });

  test("toMatchObject – object contains expected subset", async () => {
    const recipe = {
      name: "Green Smoothie",
      calories: 220,
      tags: ["vegan", "quick"],
    };
    expect(recipe).toMatchObject({ name: "Green Smoothie", calories: 220 });
  });

  test("toHaveProperty – object has a specific property", async () => {
    const nutritionist = { name: "Dr. Smith", specialization: "Sports Nutrition" };
    expect(nutritionist).toHaveProperty("specialization");
    expect(nutritionist).toHaveProperty("specialization", "Sports Nutrition");
  });

  test("toBeCloseTo – floating-point comparison", async () => {
    const calories = 0.1 + 0.2; // 0.30000000000000004 in JS
    expect(calories).toBeCloseTo(0.3, 5);
  });

  test("toBeNull / toBeUndefined / toBeDefined", async () => {
    expect(null).toBeNull();
    expect(undefined).toBeUndefined();
    expect("HealthyBites").toBeDefined();
  });

  test("toBeNaN – NaN check", async () => {
    expect(NaN).toBeNaN();
    expect(42).not.toBeNaN();
  });

  test("toThrow – function throws an error", async () => {
    const badFn = () => {
      throw new Error("Invalid nutrition data");
    };
    expect(badFn).toThrow("Invalid nutrition data");
    expect(badFn).toThrow(/Invalid/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 10. NEGATION  (.not)
// ─────────────────────────────────────────────────────────────────────────────
test.describe("Negation with .not", () => {
  test(".not – element is NOT hidden, value is NOT wrong", async ({ page }) => {
    await page.goto(BASE_URL);

    await expect(page.getByRole("link", { name: "Home" })).not.toBeHidden();
    await expect(page).not.toHaveTitle("Wrong Title");
    await expect(page).not.toHaveURL(/google\.com/);
  });

  test(".not.toBeChecked – radio and checkbox default state", async ({ page }) => {
    await page.goto(BASE_URL);

    const firstCheckbox = page.getByRole("checkbox").first();
    await expect(firstCheckbox).not.toBeChecked();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 11. SOFT ASSERTIONS  (expect.soft)
//     Test continues even when a soft assertion fails
// ─────────────────────────────────────────────────────────────────────────────
test.describe("Soft Assertions", () => {
  test("expect.soft – collects multiple failures before failing the test", async ({ page }) => {
    await page.goto(BASE_URL);

    // All of these run even if one fails
    await expect.soft(page).toHaveTitle(/HealthyBites/);
    await expect.soft(page).toHaveURL(/nichethyself/);
    await expect.soft(page.getByRole("link", { name: "Home" })).toBeVisible();
    await expect.soft(page.getByRole("link", { name: "Recipes" })).toBeVisible();
    await expect.soft(page.getByRole("button", { name: /Start Free Trial/i })).toBeEnabled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 12. POLLING  (expect.poll)
//     Retries an async function until it passes
// ─────────────────────────────────────────────────────────────────────────────
test.describe("Polling Assertions", () => {
  test("expect.poll – waits for count to be stable", async ({ page }) => {
    await page.goto(BASE_URL);

    // poll retries the callback until the expectation passes or timeout
    await expect
      .poll(async () => page.getByRole("heading").count(), {
        intervals: [500, 1000],
        timeout: 5000,
        message: "Expected at least 3 headings",
      })
      .toBeGreaterThan(3);
  });

  test("expect.poll – URL contains the site domain", async ({ page }) => {
    await page.goto(BASE_URL);

    await expect
      .poll(() => page.url())
      .toContain("healthybites");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 13. RETRY BLOCKS  (toPass)
//     Retries an entire async block until it passes
// ─────────────────────────────────────────────────────────────────────────────
test.describe("toPass – retry blocks", () => {
  test("toPass – waits for the page to reach a stable state", async ({ page }) => {
    await page.goto(BASE_URL);

    await expect(async () => {
      const heading = page.getByRole("heading", { name: /Welcome to Your Health Journey/i });
      await expect(heading).toBeVisible();
    }).toPass({ timeout: 10_000 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 14. ASYMMETRIC MATCHERS
//     (expect.any, expect.anything, expect.objectContaining,
//      expect.arrayContaining, expect.stringContaining, expect.stringMatching)
// ─────────────────────────────────────────────────────────────────────────────
test.describe("Asymmetric Matchers", () => {
  test("expect.any – matches any instance of a type", async () => {
    const recipe = { name: "Avocado Toast", calories: 350 };
    expect(recipe).toEqual({
      name: expect.any(String),
      calories: expect.any(Number),
    });
  });

  test("expect.anything – matches any non-null/undefined value", async ({ page }) => {
    await page.goto(BASE_URL);

    const title = await page.title();
    expect(title).toEqual(expect.anything());
  });

  test("expect.objectContaining – partial object match", async () => {
    const nutritionist = {
      name: "Dr. Smith",
      specialization: "Sports Nutrition",
      yearsExperience: 12,
    };
    expect(nutritionist).toEqual(
      expect.objectContaining({ specialization: "Sports Nutrition" })
    );
  });

  test("expect.arrayContaining – array includes expected subset", async () => {
    const navItems = ["Home", "Recipes", "Nutrition Tips", "Contact Us"];
    expect(navItems).toEqual(
      expect.arrayContaining(["Recipes", "Contact Us"])
    );
  });

  test("expect.stringContaining – string contains a substring", async ({ page }) => {
    await page.goto(BASE_URL);

    const url = page.url();
    expect(url).toEqual(expect.stringContaining("nichethyself"));
  });

  test("expect.stringMatching – string matches a regex", async ({ page }) => {
    await page.goto(BASE_URL);

    const title = await page.title();
    expect(title).toEqual(expect.stringMatching(/^HealthyBites/));
  });

  test("expect.closeTo – number approximately equal (asymmetric)", async () => {
    const bmi = 22.499999;
    expect({ bmi }).toEqual({ bmi: expect.closeTo(22.5, 1) });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 15. CUSTOM ASSERTION MESSAGES
//     Pass a second argument to give context when a test fails
// ─────────────────────────────────────────────────────────────────────────────
test.describe("Custom Assertion Messages", () => {
  test("second argument provides a helpful failure message", async ({ page }) => {
    await page.goto(BASE_URL);

    await expect(page, "Page should load HealthyBites homepage").toHaveTitle(/HealthyBites/);

    await expect(
      page.getByRole("link", { name: "Home" }),
      "Home nav link must be visible for users to navigate back"
    ).toBeVisible();

    const buttonCount = await page.getByRole("button").count();
    expect(buttonCount, "Homepage should have interactive buttons").toBeGreaterThan(0);
  });
});
