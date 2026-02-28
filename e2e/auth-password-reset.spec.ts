import { test, expect } from "@playwright/test";

test.describe("password reset pages", () => {
  test("forgot password page renders form", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.getByRole("button", { name: /send reset link/i })).toBeVisible();
  });

  test("reset password page shows warning without token", async ({ page }) => {
    await page.goto("/reset-password");
    await expect(page.getByText(/No valid reset token found/)).toBeVisible();
    await expect(page.getByRole("button", { name: /update password/i })).toBeDisabled();
  });

  test("forgot password has link back to login", async ({ page }) => {
    await page.goto("/forgot-password");
    const signInLink = page.getByRole("link", { name: /sign in/i });
    await expect(signInLink).toBeVisible();
    await expect(signInLink).toHaveAttribute("href", "/login");
  });
});
