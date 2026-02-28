import { test, expect } from "@playwright/test";

test.describe("marketing pages", () => {
  test("landing page renders hero content", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByText("DunningDog")).toBeVisible();
  });

  test("pricing page shows plan cards", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByText("Starter")).toBeVisible();
    await expect(page.getByText("Pro")).toBeVisible();
    await expect(page.getByText("Growth")).toBeVisible();
  });

  test("docs page renders", async ({ page }) => {
    await page.goto("/docs");
    await expect(page.locator("main")).toBeVisible();
  });
});
