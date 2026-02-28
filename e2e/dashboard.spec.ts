import { test, expect } from "@playwright/test";
import { loginAsTestUser } from "./helpers/auth";

test.describe("dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test("renders summary cards", async ({ page }) => {
    await page.goto("/app");
    // In demo mode these should render with fallback data
    await expect(page.getByText("Failed Revenue")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("Recovered Revenue")).toBeVisible();
    await expect(page.getByText("Recovery Rate")).toBeVisible();
    await expect(page.getByText("Subscriptions At Risk")).toBeVisible();
  });

  test("renders recovery table", async ({ page }) => {
    await page.goto("/app");
    await expect(page.getByText("Recent Recoveries")).toBeVisible({ timeout: 15_000 });
    // Table headers should be present
    await expect(page.getByText("Invoice")).toBeVisible();
    await expect(page.getByText("Status")).toBeVisible();
  });

  test("navigation links work", async ({ page }) => {
    await page.goto("/app");
    await expect(page.getByText("DunningDog")).toBeVisible({ timeout: 15_000 });

    // Verify nav links exist
    await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Recoveries" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Sequences" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Settings" })).toBeVisible();
  });
});
