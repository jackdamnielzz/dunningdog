import { test, expect } from "@playwright/test";

test.describe("auth guard", () => {
  test("redirects unauthenticated users from /app to /login", async ({ page }) => {
    await page.goto("/app");
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain("/login");
  });

  test("redirects from /app/sequences to /login", async ({ page }) => {
    await page.goto("/app/sequences");
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain("/login");
  });

  test("redirects from /app/settings to /login", async ({ page }) => {
    await page.goto("/app/settings");
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain("/login");
  });
});
