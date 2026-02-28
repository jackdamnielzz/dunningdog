import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { loginAsTestUser } from "./helpers/auth";

test.describe("accessibility — public pages", () => {
  test("landing page has no critical a11y violations", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(results.violations.filter((v) => v.impact === "critical")).toEqual([]);
  });

  test("login page has no critical a11y violations", async ({ page }) => {
    await page.goto("/login");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(results.violations.filter((v) => v.impact === "critical")).toEqual([]);
  });

  test("register page has no critical a11y violations", async ({ page }) => {
    await page.goto("/register");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(results.violations.filter((v) => v.impact === "critical")).toEqual([]);
  });

  test("pricing page has no critical a11y violations", async ({ page }) => {
    await page.goto("/pricing");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(results.violations.filter((v) => v.impact === "critical")).toEqual([]);
  });
});

test.describe("accessibility — app pages", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test("dashboard has no critical a11y violations", async ({ page }) => {
    await page.goto("/app");
    await page.waitForSelector("main", { timeout: 15_000 });
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(results.violations.filter((v) => v.impact === "critical")).toEqual([]);
  });

  test("sequences page has no critical a11y violations", async ({ page }) => {
    await page.goto("/app/sequences");
    await page.waitForSelector("main", { timeout: 15_000 });
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(results.violations.filter((v) => v.impact === "critical")).toEqual([]);
  });

  test("settings page has no critical a11y violations", async ({ page }) => {
    await page.goto("/app/settings");
    await page.waitForSelector("main", { timeout: 15_000 });
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(results.violations.filter((v) => v.impact === "critical")).toEqual([]);
  });
});
