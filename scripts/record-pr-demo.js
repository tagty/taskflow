const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const PR_NUMBER = process.argv[2] || "8";
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

  // 削除デモ用タスクを作成
  await page.fill('input[name="title"]', "削除デモタスク");
  await page.waitForTimeout(300);
  await page.click('button[type="submit"]');
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(800);

  // タスクをホバーして編集ボタンを表示・クリック
  const newTask = page.locator("li").filter({ hasText: "削除デモタスク" }).first();
  await newTask.hover();
  await page.waitForTimeout(400);
  await newTask.getByRole("button", { name: "編集" }).click();
  await page.waitForTimeout(600);

  // 削除ボタンをクリック（confirm ダイアログを自動承認）
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "削除" }).click();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1000);

  await context.close();
  await browser.close();

  const files = fs.readdirSync(OUT_DIR).filter((f) => f.endsWith(".webm"));
  if (files.length > 0) {
    console.log(path.join(OUT_DIR, files[files.length - 1]));
  }
})();
