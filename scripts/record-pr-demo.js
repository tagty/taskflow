const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const PR_NUMBER = process.argv[2] || "5";
const PROJECT_ID = process.argv[3] || "0b5f4e26-ccfd-47c6-a934-27fc3e745031";
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

  // タスク作成フォームで予定日を設定
  await page.fill('input[name="title"]', "予定日設定のデモタスク");
  await page.waitForTimeout(300);
  await page.fill('input[name="scheduled_for"]', "2026-03-09");
  await page.waitForTimeout(300);
  await page.fill('input[name="tags"]', "demo");
  await page.waitForTimeout(300);
  await page.click('button[type="submit"]');
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(800);

  // 作成したタスクをホバーして編集ボタンを表示
  const newTask = page.locator("li").filter({ hasText: "予定日設定のデモタスク" }).first();
  await newTask.hover();
  await page.waitForTimeout(400);
  await newTask.getByRole("button", { name: "編集" }).click();
  await page.waitForTimeout(600);

  // 編集フォームで予定日を変更
  const scheduledInput = page.locator("li form input[name='scheduled_for']").first();
  await scheduledInput.waitFor();
  await scheduledInput.fill("2026-03-10");
  await page.waitForTimeout(400);
  await page.getByRole("button", { name: "保存" }).click();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(800);

  await context.close();
  await browser.close();

  const files = fs.readdirSync(OUT_DIR).filter((f) => f.endsWith(".webm"));
  if (files.length > 0) {
    console.log(path.join(OUT_DIR, files[files.length - 1]));
  }
})();
