# ADR 0001: Supabase クライアントをサーバー/クライアントで分離する

## ステータス
採用済み

## 背景
Supabase には2種類のキーがある。
- `publishable key`（旧 `anon key`）: クライアントに公開可能
- `secret key`（旧 `service_role key`）: RLS をバイパスするため外部に漏らしてはならない

## 決定
- `src/lib/supabase/client.ts` — `publishable key` を使うクライアント側クライアント
- `src/lib/supabase/admin.ts` — `secret key` を使うサーバー側専用クライアント（`supabaseAdmin`）

Server Actions・API Routes など Next.js のサーバー側コードのみ `supabaseAdmin` を使う。

## 理由
`secret key` が漏洩すると RLS を完全にバイパスされ、全データへの読み書きが可能になるため。

## 影響
- クライアントコンポーネントや `use client` なファイルでは `supabaseAdmin` をインポートしない
- クエリ関数（`queries.ts`）はサーバー側から呼ばれることを前提に `supabaseAdmin` を使用
