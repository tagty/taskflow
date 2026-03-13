const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const PR_NUMBER = process.argv[2] || "15";
const PROJECT_ID = process.argv[3];
const OUT_DIR = path.join("screenshots", `pr-${PR_NUMBER}`);

fs.mkdirSync(OUT_DIR, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: OUT_DIR, size: { width: 1440, height: 900 } },
  });
  const page = await context.newPage();

  const projectUrl = PROJECT_ID
    ? `http://localhost:3000/projects/${PROJECT_ID}`
    : "http://localhost:3000/projects";

  // プロジェクト詳細ページへ移動
  await page.goto(projectUrl);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1000);

  // タスク作成フォームに title・priority・estimate_minutes を入力
  const titleInput = page.locator("input[name='title']").first();
  await titleInput.fill("優先度と見積時間のテスト");
  await page.waitForTimeout(500);

  const priorityInput = page.locator("input[name='priority']").first();
  await priorityInput.fill("2");
  await page.waitForTimeout(300);

  const estimateInput = page.locator("input[name='estimate_minutes']").first();
  await estimateInput.fill("90");
  await page.waitForTimeout(500);

  // フォームを送信
  await page.locator("button[type='submit']").first().click();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1500);

  await context.close();
  await browser.close();

  const files = fs.readdirSync(OUT_DIR).filter((f) => f.endsWith(".webm"));
  if (files.length > 0) {
    console.log(path.join(OUT_DIR, files[files.length - 1]));
  }
})();
