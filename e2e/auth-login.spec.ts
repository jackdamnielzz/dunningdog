import { test, expect } from "@playwright/test";

test.describe("login page", () => {
  test("renders login form with email and password fields", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("shows social auth buttons", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("Continue with Google")).toBeVisible();
    await expect(page.getByText("Continue with Microsoft")).toBeVisible();
  });

  test("has forgot password link", async ({ page }) => {
    await page.goto("/login");
    const link = page.getByRole("link", { name: /forgot password/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", "/forgot-password");
  });

  test("shows error on invalid credentials", async ({ page }) => {
    await page.goto("/login");

    await page.route("**/api/auth/login", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ code: "AUTH_UNAUTHORIZED", detail: "Invalid credentials" }),
      });
    });

    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "wrongpassword");
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page.getByText("Invalid credentials")).toBeVisible();
  });
});
