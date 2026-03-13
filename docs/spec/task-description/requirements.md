# タスク詳細説明（description）編集UI 要件定義書（軽量版）

**作成日**: 2026-03-13
**関連Issue**: #11

## 関連文書

- **ヒアリング記録**: [💬 interview-record.md](interview-record.md)
- **コンテキストノート**: 既存コードベース分析による

## 概要

`tasks.description` カラムは DB に存在するが UI が未実装。タスク作成・編集フォームに description 入力欄を追加し、タスクカードに description を表示する。

**【信頼性レベル凡例】**:
- 🔵 **青信号**: 既存実装・DBスキーマ・Issue から確実な要件
- 🟡 **黄信号**: 既存実装から妥当な推測による要件
- 🔴 **赤信号**: 推測による要件

## 主要機能要件

### 必須機能（Must Have）

- REQ-001: タスク作成フォームに description 入力欄（任意）を追加しなければならない 🔵 *Issue #11・DBスキーマより*
- REQ-002: TaskList の編集フォームに description 入力欄を追加しなければならない 🔵 *Issue #11・既存編集フォームより*
- REQ-003: `queries.ts` の `createTask` / `updateTask` に description を追加しなければならない 🔵 *既存クエリ実装より*
- REQ-004: description が入力されているタスクカードに description を表示しなければならない 🔵 *Issue #11より*
- REQ-005: description が空・null の場合は表示エリアを非表示にしなければならない 🟡 *既存タグ・期日の表示パターンから推測*

### 基本的な制約

- REQ-401: description 入力は任意とし、未入力でもタスクを作成・更新できなければならない 🔵 *DBスキーマ（nullable）より*
- REQ-402: 入力欄は `textarea` を使用し、複数行の入力を可能にしなければならない 🟡 *description の性質から妥当な推測*
- REQ-403: `dark:` Tailwind クラスを必ず付けなければならない 🔵 *CLAUDE.md開発ルールより*

## 簡易ユーザーストーリー

### ストーリー1: タスクへの詳細説明追加

**私は** 個人ユーザーとして
**タスクに詳細な説明・背景・手順を記録したい**
**そうすることで** タスクの内容を後から確認・思い出せる

**関連要件**: REQ-001, REQ-002, REQ-003, REQ-004

### ストーリー2: 説明のないタスクの見やすさ維持

**私は** 個人ユーザーとして
**description を書いていないタスクをシンプルに表示させたい**
**そうすることで** 不要な空欄で画面が煩雑にならない

**関連要件**: REQ-005

## 基本的な受け入れ基準

### REQ-001〜003: 作成・編集・クエリ

**Given**: プロジェクト詳細ページを開いている
**When**: タスク作成フォームに title と description を入力して追加する
**Then**: description が DB に保存される

**テストケース**:
- [ ] description を入力してタスク作成 → DB に保存される
- [ ] description を空のままタスク作成 → null で保存される（エラーなし）
- [ ] 編集フォームで description を変更して保存 → 更新される
- [ ] 既存タスクの description を削除して保存 → null になる

### REQ-004〜005: 表示

**Given**: description が設定されたタスクがある
**When**: タスクカードを表示する
**Then**: description テキストが表示される

**テストケース**:
- [ ] description ありのタスク → 本文が表示される
- [ ] description なし（null）のタスク → 表示エリアが非表示

## 影響範囲

| ファイル | 変更内容 |
|---|---|
| `src/lib/supabase/queries.ts` | `createTask` / `updateTask` に `description` を追加 |
| `src/app/projects/[id]/actions.ts` | `createTaskAction` / `updateTaskAction` に `description` を追加 |
| `src/app/projects/[id]/TaskList.tsx` | 編集フォームに textarea、カードに description 表示を追加 |
| `src/app/projects/[id]/page.tsx` | 作成フォームに textarea を追加 |
| `src/app/projects/[id]/TaskList.test.tsx` | description 関連テストを追加 |
