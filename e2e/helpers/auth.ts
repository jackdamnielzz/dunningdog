import { type Page } from "@playwright/test";

/**
 * Programmatically set a demo session cookie so protected-route tests
 * can skip the login UI.  Works with DEMO_MODE=true where auth is relaxed.
 */
export async function loginAsTestUser(page: Page) {
  const token = JSON.stringify({ access_token: "e2e_demo_token_placeholder" });
  const encoded = `base64-${Buffer.from(token).toString("base64")}`;

  await page.context().addCookies([
    {
      name: "sb-auth-token",
      value: encoded,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
}
