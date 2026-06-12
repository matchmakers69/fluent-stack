import { test, expect } from "@playwright/test";

test("homepage loads without crash", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page).not.toHaveTitle(/error/i);
});
