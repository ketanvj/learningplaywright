//Page level assertions
await expect(page).toHaveURL("https://healthybites.nichethyself.com/");
await expect(page).toHaveURL(/nichethyself\.com/);
await expect(page).toHaveTitle(
  "HealthyBites - Your Wellness Journey Starts Here",
);
await expect(page).toHaveTitle(/^HealthyBites/);

//visibility
//auto retry
await expect(page.getByRole("link", { name: "Home" })).not.toBeVisible();
await expect(
  page.getByRole("heading", { name: /Welcome to Your Health Journey/i }),
).toBeAttached();

await expect(
  page.getByRole("heading", { name: /Welcome to Your Health Journey/i }),
).toHaveText("Welcome to Your Health Journey");

await expect(
  page.getByRole("heading", { name: /HealthyBites/i }),
).toContainText("HealthyBites");

const allLinks = page.getByRole("link");
expect(await allLinks.count()).toBe(3);

//Attriute related
await expect(emailLink).toHaveAttribute(
  "href",
  "mailto:support@healthybites.com",
);
await expect(logo).toHaveAttribute("alt", /.*/);

//Element state 
await expect(page.getByRole("button", { name: /Start Free Trial/i })).toBeEnabled();
 await expect(page.getByRole("button", { name: /Premium Feature/i })).toBeDisabled();    
  await expect(nameInput).toBeEditable();
      await expect(nameInput).toHaveValue("abc@xyz.com");


      expect(page.getByRole()).

       await expect(checkbox).not.toBeChecked();
    await expect(btn).toHaveRole("button");
    title = page.getByRole().getAttribute("title")
    expect(title).toBe("HealthyBites - Your Wellness Journey Starts Here");

     await expect.soft(page).toHaveTitle(/HealthyBites/);
    await expect.soft(page).toHaveURL(/nichethyself/);
    await expect.soft(page.getByRole("link", { name: "Home" })).toBeVisible();
    await expect.soft(page.getByRole("link", { name: "Recipes" })).toBeVisible();

