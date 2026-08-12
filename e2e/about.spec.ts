import { test, expect } from "@playwright/test";
import { runSteps } from "./helpers/run-steps";
import type { Page } from "@playwright/test";

const commands: Record<string, (page: Page) => Promise<void>> = {
  "visit about page": async (page) => {
    await page.goto("/en/about-me");
  },
  "expect hero visible": async (page) => {
    const hero = page.locator("#about-page");
    await expect(hero.getByRole("heading", { level: 1, name: "About me" })).toBeVisible();
    await expect(
      hero.getByText(
        "I'm an online English teacher. I help Matura students, developers, and learners focused on Business English or Cambridge exam prep."
      )
    ).toBeVisible();
    await expect(hero.getByRole("link", { name: "Book a consultation" })).toBeVisible();
  },
  "click book consultation": async (page) => {
    await page.locator("#about-page").getByRole("link", { name: "Book a consultation" }).click();
  },
  "expect booking page": async (page) => {
    await expect(page).toHaveURL(/\/en\/book-a-consultation\/?$/);
  },
};

test("about hero shows title, intro, and CTA", async ({ page }) => {
  await runSteps(page, commands, ["visit about page", "expect hero visible"]);
});

test("about CTA navigates to booking", async ({ page }) => {
  await runSteps(page, commands, [
    "visit about page",
    "click book consultation",
    "expect booking page",
  ]);
});
