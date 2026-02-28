import { test, expect } from "@playwright/test";
import { loginAsTestUser } from "./helpers/auth";

test.describe("settings page", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test("renders settings page with Stripe connect section", async ({ page }) => {
    await page.goto("/app/settings");
    await expect(page.getByText(/stripe/i).first()).toBeVisible({ timeout: 15_000 });
  });

  test("shows Connect Stripe button", async ({ page }) => {
    await page.goto("/app/settings");
    await expect(page.getByRole("button", { name: /connect stripe/i })).toBeVisible({
      timeout: 15_000,
    });
  });
});
