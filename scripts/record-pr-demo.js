const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const PR_NUMBER = process.argv[2] || "9";
const OUT_DIR = path.join("screenshots", `pr-${PR_NUMBER}`);

fs.mkdirSync(OUT_DIR, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: OUT_DIR, size: { width: 1440, height: 900 } },
  });
  const page = await context.newPage();

  // /today ページへ移動・滞留中セクションを表示
  await page.goto("http://localhost:3000/today");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000);

  // 滞留タスクのバッジにフォーカス
  const badge = page.locator("text=4日滞留").first();
  await badge.scrollIntoViewIfNeeded();
  await page.waitForTimeout(2000);

  await context.close();
  await browser.close();

  const files = fs.readdirSync(OUT_DIR).filter((f) => f.endsWith(".webm"));
  if (files.length > 0) {
    console.log(path.join(OUT_DIR, files[files.length - 1]));
  }
})();
