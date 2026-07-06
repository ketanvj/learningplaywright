import { test, expect } from "@playwright/test";

test("Verify the page title of STC Tourism Website", async ({ page }) => {
  await page.goto("https://nichethyself.com/tourism/"); //page is a browser tab
});

/*
test(para1, para2)

para1 - test case name
para2 - your test steps, in an aync arrow function 

It gives you your browser ready made,

let page = new Page("Firefox");//goto()
 page.goto();

 test("Login", async ({page}) => {

    
    })
*/
