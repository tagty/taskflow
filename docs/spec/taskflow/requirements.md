# taskflow 要件定義書（逆生成）

## 分析概要

**分析日時**: 2026-03-25（2026-03-13 版を更新）
**対象コードベース**: `src/`, `supabase/migrations/`
**抽出要件数**: 32個の機能要件、9個の非機能要件
**信頼度**: 90%（実装 + テストで裏付けられた要件が大半）

## システム概要

### 推定されたシステム目的
個人の開発・生活・学習を一元管理できるタスク管理アプリ。プロジェクト単位でタスクを管理し、今日やるタスクの把握・完了タスクの振り返りを支援する。

### 対象ユーザー
個人ユーザー（開発者・知識労働者）。マルチユーザー対応は未実装。

---

## 機能要件（EARS記法）

### プロジェクト管理

#### REQ-001: プロジェクト一覧表示
システムは登録済みの全プロジェクトを一覧表示しなければならない。

**実装根拠**: `listProjects()` / `src/app/projects/page.tsx`

#### REQ-002: プロジェクト作成
システムはname・description・colorを入力してプロジェクトを作成できなければならない。

**実装根拠**: `createProjectAction()` / `createProject()` / `projects/page.tsx` フォーム

#### REQ-003: カラー選択
プロジェクト作成時、システムは7色（red / orange / yellow / green / blue / purple / pink）からカラーを選択できなければならない。

**実装根拠**: `projects/page.tsx` のカラーパレット実装
**信頼度**: 強

#### REQ-004: プロジェクト詳細表示
システムは指定したプロジェクトのタスク一覧を表示しなければならない。

**実装根拠**: `getProject()` / `listTasksByProject()` / `src/app/projects/[id]/page.tsx`

---

### タスク管理

#### REQ-010: タスク作成
システムはプロジェクト内に title（必須）・description・due_date・priority（1-5）・estimate_minutes・tags を指定してタスクを作成できなければならない。

**実装根拠**: `createTaskAction()` / `createTask()` / `[id]/page.tsx` フォーム

#### REQ-011: タスク編集
システムはtitle・description・due_date・tags・priority・estimate_minutes をインラインで編集できなければならない。

**実装根拠**: `updateTaskAction()` / `updateTask()` / `TaskList.tsx` 編集フォーム

#### REQ-012: タスク削除
システムは確認ダイアログを経てタスクを削除できなければならない。

**実装根拠**: `deleteTaskAction()` / `deleteTask()` / `TaskList.tsx` 削除ボタン

#### REQ-013: タスクステータス遷移
システムはタスクのステータスをtodo → doing → done → todo の順に遷移させなければならない。

**実装根拠**: `changeTaskStatusAction()` / `updateTaskStatus()` / `TaskStatusButton.tsx`

#### REQ-014: 完了時刻の記録
タスクのステータスがdoneに変更された場合、システムはcompleted_atを記録しなければならない。

**実装根拠**: `updateTaskStatus()` — done時に `completed_at = now()` を設定

#### REQ-015: 完了解除時の記録クリア
タスクのステータスがdoneからtodoに戻された場合、システムはcompleted_atをnullにリセットしなければならない。

**実装根拠**: `updateTaskStatus()` — done以外に変更時に `completed_at = null`

#### REQ-015b: 優先度入力制約
優先度を入力する場合、システムは 1〜5 の範囲のみ受け付けなければならない。

**実装根拠**: `createTaskAction` の `priority >= 1 && priority <= 5` チェック
**信頼度**: 強

#### REQ-015c: 見積時間入力制約
見積時間を入力する場合、システムは 0 以上の値のみ受け付けなければならない。

**実装根拠**: `createTaskAction` の `estimate_minutes >= 0` チェック
**信頼度**: 強

#### REQ-015d: 優先度・見積時間の表示
システムはタスク一覧で優先度（P1〜P5）と見積時間（m/h形式）をバッジ表示しなければならない。

**実装根拠**: `TaskList.tsx` の優先度・見積時間バッジ表示、テストで検証済み
**信頼度**: 強

#### REQ-016: タスクのタグ管理
システムはタスクに複数のタグをカンマ区切りで付与・編集できなければならない。重複タグは自動排除しなければならない。

**実装根拠**: `tasks.tags (text[])` / `createTaskAction` の重複排除処理 / `updateTaskAction`

#### REQ-017: タグによるフィルタリング
システムはタグを選択してタスクをフィルタリングできなければならない。

**実装根拠**: `TaskList.tsx` タグフィルター（複数選択トグル式）

#### REQ-018: タスクのステータス別グループ表示
システムはタスクを進行中・未着手・完了の順にグループ化して表示しなければならない。

**実装根拠**: `TaskList.tsx` グループ分けロジック

#### REQ-018b: ホバー時の操作ボタン表示
タスク行にホバーした時のみ、システムは編集ボタンとメモボタンを表示しなければならない。

**実装根拠**: `TaskList.tsx` の `group-hover` クラス
**信頼度**: 強

#### REQ-018c: タスクメモ追加・表示
システムはタスクに複数のメモを追加できなければならない。各メモには作成日時が記録され、メモボタンクリックで展開表示されなければならない。

**実装根拠**: `task_notes` テーブル、`createTaskNoteAction`、`TaskList.tsx` の `showNotes` state
**信頼度**: 強

---

### Today ビュー

#### REQ-020: 今日のタスク表示
システムはscheduled_forまたはdue_dateが今日の未完了タスクを一覧表示しなければならない。

**実装根拠**: `listTodayTasks()` / `src/app/today/page.tsx`

#### REQ-021: Today画面からのステータス変更
システムはToday画面からタスクのステータスを変更できなければならない。

**実装根拠**: `today/actions.ts` の `changeTaskStatusAction()`

#### REQ-022: 滞留タスクの警告表示
statusがdoingのまま3日以上更新されていないタスクがある場合、システムは警告として滞留日数と所属プロジェクト名を含めて一覧表示しなければならない。

**実装根拠**: `listStalledTasks(thresholdDays = 3)` / `today/page.tsx` 滞留セクション（amber背景）

#### REQ-022b: 見積時間合計表示
システムは今日のタスクの見積時間の合計を `Xh Ym` 形式で表示しなければならない。

**実装根拠**: `today/page.tsx` の `formatEstimate()`、テストで検証済み
**信頼度**: 強

#### REQ-022c: 過負荷警告
今日の見積時間合計が 480分（8時間）を超える場合、システムは「過負荷」警告を表示しなければならない。

**実装根拠**: `today/page.tsx` の `> 480` チェック、テストで検証済み
**信頼度**: 強

#### REQ-023: scheduled_for の設定
システムはタスクに「今日やる日」（scheduled_for）を設定できなければならない。

**実装根拠**: `tasks.scheduled_for (date)` / `updateTask()` / `[id]/actions.ts`

---

### 完了履歴

#### REQ-030: 完了タスク履歴表示
システムは完了タスクをcompleted_at降順で最大30件表示しなければならない。

**実装根拠**: `listRecentCompleted(30)` / `src/app/history/page.tsx`

#### REQ-031: 日付別グループ表示
システムは完了タスク履歴をcompleted_atの日付でグループ化して表示しなければならない。

**実装根拠**: `history/page.tsx` グループ化ロジック

#### REQ-031b: 完了履歴のプロジェクト情報表示
完了履歴の各タスクには所属プロジェクトの名前とカラーを表示しなければならない。

**実装根拠**: `listRecentCompleted()` の `projects(name, color)` JOIN
**信頼度**: 強

---

### ナビゲーション

#### REQ-040: グローバルナビゲーション
システムはToday・Projects・Historyへの導線を常時表示しなければならない。

**実装根拠**: `GlobalNav.tsx` — 全ページに共通配置

#### REQ-041: トップページリダイレクト
システムはルートURLへのアクセスを/projectsにリダイレクトしなければならない。

**実装根拠**: `src/app/page.tsx` — redirect('/projects')

---

### データモデル

#### REQ-050: プロジェクト削除時のカスケード
プロジェクトが削除された場合、システムは配下の全タスクを連動して削除しなければならない。

**実装根拠**: `tasks.project_id ON DELETE CASCADE`

#### REQ-051: タスク削除時のカスケード
タスクが削除された場合、システムは紐づくtask_notesを連動して削除しなければならない。

**実装根拠**: `task_notes.task_id ON DELETE CASCADE`

---

## 非機能要件

### UI/UX

#### NFR-001: ダークモード対応
システムはダークモードに対応したUIを提供しなければならない。

**実装根拠**: 全コンポーネントに `dark:` Tailwind クラスが付与されている

#### NFR-002: レスポンシブデザイン
システムはモバイル・デスクトップ両方で利用可能でなければならない。

**実装根拠**: Tailwind CSS のレスポンシブクラスを使用

#### NFR-003: 楽観的UI（非ブロッキング操作）
システムはステータス変更時にユーザーの操作をブロックしてはならない。

**実装根拠**: `TaskStatusButton.tsx` — `useTransition` でペンディング状態を管理

### セキュリティ

#### NFR-010: サーバー側でのDB操作
システムはDBへのwrite操作をサーバー側（Server Actions）のみで実行しなければならない。

**実装根拠**: 全クエリが Server Actions 経由 / `supabaseAdmin` はサーバー側専用

#### NFR-011: service_roleキーの非公開
システムはSupabaseのsecret key（service_role）をクライアントサイドに露出させてはならない。

**実装根拠**: `admin.ts` はサーバー側専用 / `SUPABASE_SECRET_KEY` は非公開環境変数

### 運用

#### NFR-020: 型安全なDBアクセス
システムはDBアクセスを型安全に実装しなければならない。

**実装根拠**: Supabase 生成型 / TypeScript strict mode

#### NFR-021: キャッシュ無効化
システムはデータ変更後にNext.jsのキャッシュを無効化しなければならない。

**実装根拠**: 全Server Actionで `revalidatePath()` を実行

#### NFR-022: テスト可能な設計
システムはServer Actionsをモック可能な設計にしなければならない。

**実装根拠**: `TaskList.test.tsx` / `TaskStatusButton.test.tsx` — actions を props で受け取る設計

#### NFR-023: クエリの一元管理
全ての Supabase クエリは `src/lib/supabase/queries.ts` に集約しなければならない。UI コンポーネントから直接 Supabase クライアントを呼び出してはならない。

**実装根拠**: `queries.ts` への集約実装
**信頼度**: 強

---

## 受け入れ基準

### 実装済みテスト

- [x] TaskStatusButton
  - [x] todo / doing / done の表示文字列
  - [x] クリック時に action が呼ばれる
- [x] TaskList
  - [x] タスクタイトル・タグ・期日の表示
  - [x] タグフィルターによる絞り込み
  - [x] 編集フォームの開閉
  - [x] 削除ボタンの表示

### 実装済みテスト（追記）

- [x] Today ページ
  - [x] 見積時間合計の計算・表示（formatEstimate）
  - [x] 過負荷判定（480分閾値）
  - [x] 優先度・見積時間バッジ表示
  - [x] 滞留タスク表示

### 推奨追加テスト

- [ ] `createProjectAction` / `createTaskAction` の統合テスト
- [ ] `updateTaskStatus` の completed_at 設定・クリアのテスト
- [ ] `listStalledTasks` の閾値判定テスト
- [ ] `listTodayTasks` の scheduled_for / due_date 両方のフィルターテスト
- [ ] タスクメモの追加・表示テスト

---

## 未実装・未確認の要件

以下は実装から推定が困難または未実装と思われる項目：

1. **認証・認可**: マルチユーザー対応（現在は単一ユーザー想定）
2. **通知機能**: due_date 超過・滞留タスクのプッシュ通知
3. **プロジェクトの編集・削除**: 作成のみ実装済み。編集・削除 UI は未実装と推定
4. **タスクの手動並び替え**: `priority` カラムはあるが、ドラッグ&ドロップ等の手動ソートは未実装

> ※ `description`, `estimate_minutes`, `priority`, `task_notes` は前版（2026-03-13）で「未確認」としていたが、現時点では TaskList.tsx に実装済みであることを確認。
