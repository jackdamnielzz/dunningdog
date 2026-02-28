import { test, expect } from "@playwright/test";
import { loginAsTestUser } from "./helpers/auth";

test.describe("sequences page", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test("renders sequence editor form", async ({ page }) => {
    await page.goto("/app/sequences");
    await expect(page.getByText("Step 1")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("Step 2")).toBeVisible();
    await expect(page.getByText("Step 3")).toBeVisible();
  });

  test("has save button", async ({ page }) => {
    await page.goto("/app/sequences");
    await expect(page.getByRole("button", { name: /save sequence/i })).toBeVisible({
      timeout: 15_000,
    });
  });
});
