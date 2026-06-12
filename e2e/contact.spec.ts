import { test, expect } from "@playwright/test";
import { runSteps } from "./helpers/run-steps";
import type { Page } from "@playwright/test";

const commands: Record<string, (page: Page) => Promise<void>> = {
  "visit contact page": async (page) => {
    await page.goto("/en/contact");
  },
  "click send": async (page) => {
    await page.getByRole("button", { name: "Send" }).click();
  },
  "fill valid name": async (page) => {
    await page.getByPlaceholder("John Smith").fill("Jane Doe");
  },
  "fill valid email": async (page) => {
    await page.getByPlaceholder("john@example.com").fill("jane@example.com");
  },
  "fill valid message": async (page) => {
    await page
      .getByPlaceholder("Write your message...")
      .fill("Hello, I would like to book a lesson with you.");
  },
  "fill short message": async (page) => {
    await page.getByPlaceholder("Write your message...").fill("Too short");
  },
  "fill name with numbers": async (page) => {
    await page.getByPlaceholder("John Smith").fill("J0hn Sm1th");
  },
  "fill single char name": async (page) => {
    await page.getByPlaceholder("John Smith").fill("J");
  },
  "expect form visible": async (page) => {
    await expect(page.getByPlaceholder("John Smith")).toBeVisible();
    await expect(page.getByPlaceholder("john@example.com")).toBeVisible();
    await expect(page.getByPlaceholder("Write your message...")).toBeVisible();
    await expect(page.getByRole("button", { name: "Send" })).toBeVisible();
  },
  "expect name min-length error": async (page) => {
    await expect(page.getByText("Name must be at least 2 characters")).toBeVisible();
  },
  "expect name format error": async (page) => {
    await expect(
      page.getByText("Name may only contain letters, spaces, hyphens, and apostrophes")
    ).toBeVisible();
  },
  "expect email error": async (page) => {
    await expect(page.getByText("Invalid email address")).toBeVisible();
  },
  "expect message error": async (page) => {
    await expect(page.getByText("Message must be at least 10 characters")).toBeVisible();
  },
};

test("contact form renders all fields", async ({ page }) => {
  await runSteps(page, commands, ["visit contact page", "expect form visible"]);
});

test("shows all validation errors when submitted empty", async ({ page }) => {
  await runSteps(page, commands, [
    "visit contact page",
    "click send",
    "expect name min-length error",
    "expect email error",
    "expect message error",
  ]);
});

test("shows message error when message is too short", async ({ page }) => {
  await runSteps(page, commands, [
    "visit contact page",
    "fill valid name",
    "fill valid email",
    "fill short message",
    "click send",
    "expect message error",
  ]);
});

test("shows name format error for non-letter characters", async ({ page }) => {
  await runSteps(page, commands, [
    "visit contact page",
    "fill name with numbers",
    "fill valid email",
    "fill valid message",
    "click send",
    "expect name format error",
  ]);
});

test("shows name length error for single character name", async ({ page }) => {
  await runSteps(page, commands, [
    "visit contact page",
    "fill single char name",
    "fill valid email",
    "fill valid message",
    "click send",
    "expect name min-length error",
  ]);
});
