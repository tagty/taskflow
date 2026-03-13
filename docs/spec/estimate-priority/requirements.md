# タスクの見積時間・優先度UI 要件定義書（軽量版）

## 概要

`tasks.estimate_minutes` と `tasks.priority` は DB カラムとして存在するが UI が未実装。
タスク作成・編集フォームに入力欄を追加し、カード表示にも反映する。

## 関連文書

- **ヒアリング記録**: [💬 interview-record.md](interview-record.md)
- **コンテキストノート**: [📝 note.md](note.md)

## 主要機能要件

**【信頼性レベル凡例】**:
- 🔵 **青信号**: Issue・ユーザヒアリングを参考にした確実な要件
- 🟡 **黄信号**: 既存実装から妥当な推測による要件

### 必須機能（Must Have）

- REQ-001: タスク作成フォームに priority（1〜5の数値）入力欄を追加する 🔵 *Issue #12・ヒアリングより*
- REQ-002: タスク作成フォームに estimate_minutes（分単位の数値）入力欄を追加する 🔵 *Issue #12より*
- REQ-003: タスク編集フォームに priority・estimate_minutes の入力欄を追加する 🔵 *Issue #12より*
- REQ-004: タスクカードに priority を表示する（値がある場合のみ） 🔵 *Issue #12より*
- REQ-005: タスクカードに estimate_minutes を時間・分に変換して表示する（例: 1h30m）🔵 *ヒアリングより*
- REQ-006: `queries.ts` の `createTask` / `updateTask` に estimate_minutes・priority を追加する 🔵 *Issue #12より*

### 基本的な制約

- REQ-401: priority は 1〜5 の整数のみ受け付ける 🔵 *ヒアリングより*
- REQ-402: estimate_minutes は 0 以上の整数のみ受け付ける 🟡 *既存実装パターンから推測*
- REQ-403: priority・estimate_minutes は任意入力（null 許容） 🔵 *既存 DB スキーマより*

## 簡易ユーザーストーリー

### ストーリー1: タスク作成時に見積もりを記録する

**私は** 開発者 **として**
**タスク作成時に優先度と見積時間を入力したい**
**そうすることで** 作業の計画を立てられる

**関連要件**: REQ-001, REQ-002, REQ-006

### ストーリー2: タスクカードで優先度・見積時間を確認する

**私は** 開発者 **として**
**タスクカードで優先度と見積時間を確認したい**
**そうすることで** 何から着手すべきかを素早く判断できる

**関連要件**: REQ-004, REQ-005

## 基本的な受け入れ基準

### REQ-001〜006: 作成・編集・表示

**Given**: プロジェクト詳細ページを開いている
**When**: タスク作成フォームに priority=2、estimate_minutes=90 を入力して送信する
**Then**: タスクカードに priority と「1h30m」が表示される

**テストケース**:
- [ ] 正常系: priority=1〜5・estimate_minutes 任意で作成できる
- [ ] 正常系: 編集フォームで既存の値を変更できる
- [ ] 正常系: estimate_minutes=90 → 「1h30m」と表示される
- [ ] 正常系: estimate_minutes=30 → 「30m」と表示される
- [ ] 正常系: priority・estimate_minutes が null のタスクはカードに表示しない
- [ ] 異常系: priority に 1〜5 範囲外の値を入力すると min/max 制約で拒否される

## 最小限の非機能要件

- **パフォーマンス**: 既存と同様（Supabase への1クエリ追加のみ）
- **UI**: 既存の Tailwind CSS パターンに従い `dark:` クラスを必ず付ける
