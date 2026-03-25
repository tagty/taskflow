# taskflow アーキテクチャ設計（逆生成）

**分析日時**: 2026-03-25
**対象コードベース**: `src/`, `supabase/`

---

## システム概要

### 実装されたアーキテクチャ

- **パターン**: Next.js App Router + Server Components + Server Actions
- **フレームワーク**: Next.js 16（App Router）
- **構成**: フルスタックモノリス（フロントエンド・バックエンド一体）

### 技術スタック

#### フロントエンド
- **フレームワーク**: Next.js 16 / React（App Router）
- **状態管理**: React `useState` / `useTransition`（ローカル状態のみ、グローバルストアなし）
- **スタイリング**: Tailwind CSS（ダークモード対応）
- **ルーティング**: Next.js App Router（ファイルベース）

#### バックエンド
- **実装方式**: Next.js Server Actions（`"use server"`）
- **認証方式**: なし（単一ユーザー前提）
- **データアクセス**: Supabase JS Client（`@supabase/supabase-js`）
- **キャッシュ無効化**: `revalidatePath()`（ISR）

#### データベース
- **DBMS**: PostgreSQL（Supabase マネージド）
- **接続**: Supabase JS Client（secret key = サーバー専用 / publishable key = クライアント用）
- **スキーマ管理**: Supabase CLI マイグレーション

#### テスト・ビルド
- **テストフレームワーク**: Vitest v4 + @testing-library/react
- **ビルドツール**: Vite v8（Vitest 用）/ Next.js（本番ビルド）
- **コード品質**: TypeScript strict mode

---

## レイヤー構成

```
src/
├── app/                        # プレゼンテーション層 + アプリケーション層
│   ├── layout.tsx              # ルートレイアウト
│   ├── page.tsx                # ルートリダイレクト
│   ├── projects/
│   │   ├── page.tsx            # Server Component（データ取得 + UI）
│   │   ├── actions.ts          # Server Actions（プロジェクト操作）
│   │   └── [id]/
│   │       ├── page.tsx        # Server Component（データ取得 + UI）
│   │       ├── TaskList.tsx    # Client Component（インタラクティブ UI）
│   │       └── actions.ts      # Server Actions（タスク操作）
│   ├── today/
│   │   ├── page.tsx            # Server Component
│   │   └── actions.ts          # Server Actions
│   └── history/
│       └── page.tsx            # Server Component
├── components/                 # 共有 UI コンポーネント
│   ├── GlobalNav.tsx           # Client Component（ナビゲーション）
│   └── TaskStatusButton.tsx    # Client Component（ステータスボタン）
└── lib/
    └── supabase/               # インフラストラクチャ層
        ├── queries.ts          # 全クエリ関数（DB アクセス集約）
        ├── admin.ts            # service_role クライアント（サーバー専用）
        └── client.ts           # publishable key クライアント（クライアント用）

supabase/
└── migrations/                 # DB マイグレーション履歴
```

### レイヤー責務

| レイヤー | ディレクトリ | 責務 |
|---|---|---|
| プレゼンテーション層 | `src/app/**/page.tsx`, `src/components/` | UI レンダリング、ユーザーインタラクション |
| アプリケーション層 | `src/app/**/actions.ts` | ユースケース実行、バリデーション、ISR 再生成 |
| インフラストラクチャ層 | `src/lib/supabase/` | DB アクセス、Supabase クライアント管理 |

---

## Server Component / Client Component 分離

### Server Component（データ取得・SSR）
- `app/projects/page.tsx`
- `app/projects/[id]/page.tsx`
- `app/today/page.tsx`
- `app/history/page.tsx`

### Client Component（インタラクティブ UI）
- `components/GlobalNav.tsx` — `usePathname()` によるアクティブ状態管理
- `components/TaskStatusButton.tsx` — `useTransition()` による非同期状態管理
- `app/projects/[id]/TaskList.tsx` — タグフィルター・編集モード・メモ表示の状態管理

---

## セキュリティ設計

| 項目 | 実装方式 |
|---|---|
| DB 書き込み | Server Actions 経由のみ（クライアントから直接書き込み不可） |
| Secret Key | サーバー側（`admin.ts`）のみ使用。`SUPABASE_SECRET_KEY` は非公開 |
| Publishable Key | クライアント側（`client.ts`）で使用。`NEXT_PUBLIC_` プレフィックス |
| 認証 | 未実装（単一ユーザー前提） |

---

## パフォーマンス設計

| 項目 | 実装方式 |
|---|---|
| キャッシュ | Next.js ISR — `revalidatePath()` でデータ変更後に即時無効化 |
| 非同期 UI | `useTransition()` で操作中のブロッキングを回避 |
| Server Components | データ取得をサーバー側で完結（クライアント JS バンドル削減） |
