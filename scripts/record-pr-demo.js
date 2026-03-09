const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const PR_NUMBER = process.argv[2] || "2";
const PROJECT_ID = process.argv[3] || "aac7ed37-6884-4d13-9285-00d0e70d0546";
const OUT_DIR = path.join("screenshots", `pr-${PR_NUMBER}`);

fs.mkdirSync(OUT_DIR, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: OUT_DIR, size: { width: 1440, height: 900 } },
  });
  const page = await context.newPage();

  // プロジェクト詳細へ移動
  await page.goto(`http://localhost:3000/projects/${PROJECT_ID}`);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(800);

  // タグ付きタスクを作成
  await page.fill('input[name="title"]', "タグ機能のデモタスク");
  await page.waitForTimeout(400);
  await page.fill('input[name="tags"]', "demo, feature");
  await page.waitForTimeout(400);
  await page.click('button[type="submit"]');
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(800);

  // タグフィルターをクリック
  const demoTag = page.getByRole("button", { name: "demo" });
  if (await demoTag.isVisible()) {
    await demoTag.click();
    await page.waitForTimeout(800);
    // フィルター解除
    await page.getByRole("button", { name: "すべて" }).click();
    await page.waitForTimeout(600);
  }

  await context.close();
  await browser.close();

  // webm ファイルのパスを出力
  const files = fs.readdirSync(OUT_DIR).filter((f) => f.endsWith(".webm"));
  if (files.length > 0) {
    console.log(path.join(OUT_DIR, files[files.length - 1]));
  }
})();
