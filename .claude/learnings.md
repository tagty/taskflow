# Claude Code 利用パターンの振り返り

## 2026-03-09（セットアップセッション）

### ✓ うまくいった
- `disable-model-invocation: true` のスキルはコンテキストを消費しない。大きなワークフローの定義に最適
- サブエージェントに調査を委譲すると、メインの会話がクリーンに保たれる
- `--allowedTools` でスコープを絞った `claude -p` は安全な自動化に使える
- インタビュー（`/interview`）→ 仕様書 → 新セッションで実装、の流れは要件のブレが少ない
- CLAUDE.md は短くするほど指示が通りやすい（自明なことは削除）

### ✗ うまくいかなかった
- PostToolUse フックで lint を毎回実行すると、スキルの Write で余分な出力が出る
- `tasks.md` をセッション間で管理するのはコンテキストを汚染しやすい

### → 次回の改善
- 新機能を始めるときは必ず `/interview` でインタビューしてから実装する
- 2回修正が必要になったら `/clear` して新しいプロンプトで再出発する
- 探索的なタスクは `db-explorer` や `サブエージェント` に先に任せる

## 2026-03-20

### ✓ うまくいった
- CIパイプラインを追加し、verify（build + test）を CI で自動化できた
- `force-dynamic` をビルド対象ページに追加してCIビルドエラーを解消できた
- その後 `force-dynamic` を削除しつつ `build` を `verify` から除外するリファクタリングで、無駄な静的ビルド検証をなくせた
- Zenn 記事（Anthropic 社員の Claude Code 活用術）を読んで Task Diary を即座に導入できた
- 既存の `/retrospect` + `learnings.md` を活かしつつ、`diary-on-stop.sh`（Stop Hook）と `/diary-sync` コマンドを追加するだけで Task Diary が完成した
- Stop Hook で `claude -p` を呼び出す自動記録パターンを習得した

### ✗ うまくいかなかった
- CI 導入初期に `force-dynamic` の追加が必要で、後で削除する2段階の修正が発生した（最初から静的エクスポート不要なページを正しく設定できていれば1コミットで済んだ）
- `diary-on-stop.sh` は git 変更ベースで推測するため、コードを書かない調査・設定系セッションの内容が薄くなりやすい

### → 次回の改善
- DBアクセスのある Next.js ページを新規作成する際は、初めから `force-dynamic` の要否を確認してから実装する（または `build` を CI の verify から除外したまま運用する）
- CI が通ることを確認してから PR をマージする習慣を維持する
- 週1で `/diary-sync` を実行して learnings.md のパターンを CLAUDE.md に統合する
