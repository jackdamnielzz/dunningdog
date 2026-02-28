import { test, expect } from "@playwright/test";

test.describe("register page", () => {
  test("renders registration form", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
    await expect(page.getByRole("button", { name: /create account/i })).toBeVisible();
  });

  test("shows social auth buttons", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByText("Continue with Google")).toBeVisible();
    await expect(page.getByText("Continue with Microsoft")).toBeVisible();
  });

  test("shows password mismatch error", async ({ page }) => {
    await page.goto("/register");

    await page.fill('input[type="email"]', "test@example.com");
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill("password123");
    await passwordInputs.nth(1).fill("different123");
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page.getByText("Passwords do not match")).toBeVisible();
  });
});
