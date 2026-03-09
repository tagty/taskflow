const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const PR_NUMBER = process.argv[2] || "3";
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

  // 最初のタスクの編集ボタンをホバーで表示させてクリック
  const firstTask = page.locator("li").filter({ hasText: "タスク編集機能" }).first();
  await firstTask.hover();
  await page.waitForTimeout(400);
  const editBtn = firstTask.getByRole("button", { name: "編集" });
  await editBtn.click();
  await page.waitForTimeout(600);

  // 編集フォームが表示されるまで待機して入力
  const titleInput = page.locator("li form input[name='title']").first();
  await titleInput.waitFor();
  await titleInput.fill("タスク編集機能を実装する（編集済み）");
  await page.waitForTimeout(400);

  const tagsInput = page.locator("li form input[name='tags']").first();
  await tagsInput.fill("feature, ui, done");
  await page.waitForTimeout(400);

  // 保存
  await page.getByRole("button", { name: "保存" }).click();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(800);

  await context.close();
  await browser.close();

  // webm ファイルのパスを出力
  const files = fs.readdirSync(OUT_DIR).filter((f) => f.endsWith(".webm"));
  if (files.length > 0) {
    console.log(path.join(OUT_DIR, files[files.length - 1]));
  }
})();
