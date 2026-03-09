# PR スクリーンショット・GIF ワークフロー

UI変更を含む PR では必ずビジュアルを生成して PR 本文に追加する。

## スクリーンショット

```bash
npm run dev &
npx playwright screenshot --browser chromium --viewport-size "1440,900" --full-page \
  http://localhost:3000/<path> screenshots/pr-{PR_NUMBER}/<name>.png
```

## デモ GIF

```bash
npm run dev &
node scripts/record-pr-demo.js {PR_NUMBER} {PROJECT_ID}
# → screenshots/pr-{PR_NUMBER}/demo.gif が生成される
```

## gh-pages へデプロイ

```bash
git stash
git checkout gh-pages
cp screenshots/pr-{PR_NUMBER}/* pr-{PR_NUMBER}/
git add pr-{PR_NUMBER}/
git commit -m "PR #{PR_NUMBER} ビジュアルを追加"
git push origin gh-pages
git checkout -
git stash pop
```

## URL パターン

```
https://tagty.github.io/taskflow/pr-{PR_NUMBER}/demo.gif
https://tagty.github.io/taskflow/pr-{PR_NUMBER}/project-detail.png
```

## ルール
- フルページ・画面幅 1440px 固定
- GIF は ffmpeg で webm → gif 変換（fps=10、パレット最適化）
