import { chromium } from "@playwright/test";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { mkdirSync } from "node:fs";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const outDir = resolve(root, "stripe-app/public/listing");
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1680, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();

await page.goto(`file://${resolve(root, "stripe-app/feature-images.html").replace(/\\/g, "/")}`);
await page.waitForLoadState("networkidle");

for (const id of ["feature1", "feature2", "feature3"]) {
  const locator = page.locator(`#${id}`);
  const out = resolve(outDir, `${id}.png`);
  await locator.screenshot({ path: out, omitBackground: false });
  console.log(`wrote ${out}`);
}

// Square logo: render icon.png centered and clip to 1024x1024
const iconUrl = `file://${resolve(root, "stripe-app/public/icon.png").replace(/\\/g, "/")}`;
await page.setContent(`<!doctype html><html><head><style>
  html,body{margin:0;padding:0;background:#fff}
  .box{width:1024px;height:1024px;display:flex;align-items:center;justify-content:center;overflow:hidden}
  .box img{height:1024px;width:auto;object-fit:cover}
</style></head><body><div class="box"><img src="${iconUrl}"/></div></body></html>`);
await page.waitForLoadState("networkidle");
const logoOut = resolve(outDir, "logo-square.png");
await page.locator(".box").screenshot({ path: logoOut });
console.log(`wrote ${logoOut}`);

await browser.close();
