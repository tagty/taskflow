# taskflow 要件定義書（逆生成）

## 分析概要

**分析日時**: 2026-03-13
**対象コードベース**: `src/`, `supabase/migrations/`
**抽出要件数**: 22個の機能要件、8個の非機能要件
**信頼度**: 85%（実装 + 一部テストによる裏付け）

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

#### REQ-003: プロジェクト詳細表示
システムは指定したプロジェクトのタスク一覧を表示しなければならない。

**実装根拠**: `getProject()` / `listTasksByProject()` / `src/app/projects/[id]/page.tsx`

---

### タスク管理

#### REQ-010: タスク作成
システムはプロジェクト内にtitle・due_date・tagsを指定してタスクを作成できなければならない。

**実装根拠**: `createTaskAction()` / `createTask()` / `[id]/page.tsx` フォーム

#### REQ-011: タスク編集
システムはtitle・due_date・tagsをインラインで編集できなければならない。

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

#### REQ-016: タスクのタグ管理
システムはタスクに複数のタグを付与・編集できなければならない。

**実装根拠**: `tasks.tags (text[])` / `createTaskAction` / `updateTaskAction`

#### REQ-017: タグによるフィルタリング
システムはタグを選択してタスクをフィルタリングできなければならない。

**実装根拠**: `TaskList.tsx` タグフィルター（複数選択トグル式）

#### REQ-018: タスクのステータス別グループ表示
システムはタスクを進行中・未着手・完了の順にグループ化して表示しなければならない。

**実装根拠**: `TaskList.tsx` グループ分けロジック

---

### Today ビュー

#### REQ-020: 今日のタスク表示
システムはscheduled_forまたはdue_dateが今日の未完了タスクを一覧表示しなければならない。

**実装根拠**: `listTodayTasks()` / `src/app/today/page.tsx`

#### REQ-021: Today画面からのステータス変更
システムはToday画面からタスクのステータスを変更できなければならない。

**実装根拠**: `today/actions.ts` の `changeTaskStatusAction()`

#### REQ-022: 滞留タスクの警告表示
statusがdoingのままN日以上更新されていないタスクがある場合、システムは警告として一覧表示しなければならない。

**実装根拠**: `listStalledTasks(thresholdDays)` / `today/page.tsx` 滞留セクション

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

### 推奨追加テスト

- [ ] `createProjectAction` / `createTaskAction` の統合テスト
- [ ] `updateTaskStatus` の completed_at 設定・クリアのテスト
- [ ] `listStalledTasks` の閾値判定テスト
- [ ] `listTodayTasks` の scheduled_for / due_date 両方のフィルターテスト
- [ ] タグフィルター複数選択の挙動テスト

---

## 未実装・未確認の要件

以下は実装から推定が困難または未実装と思われる項目：

1. **認証・認可**: マルチユーザー対応（現在は単一ユーザー想定）
2. **通知機能**: due_date 超過・滞留タスクのプッシュ通知
3. **タスクのdescription編集UI**: DBカラムは存在するが編集UIが未確認
4. **estimate_minutes / priority の活用**: DBカラムは存在するが表示・編集UIが未確認
5. **task_notes の活用**: テーブルは存在するが表示・編集UIが未確認
