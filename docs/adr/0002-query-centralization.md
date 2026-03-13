# ADR 0002: クエリを queries.ts に集約する

## ステータス
採用済み

## 背景
Next.js App Router では Server Actions・Page コンポーネント・API Routes など複数の場所から DB アクセスが発生しうる。
クエリが分散すると重複・不整合・テスト困難が生じる。

## 決定
全クエリ関数を `src/lib/supabase/queries.ts` に集約する。

## 理由
- 変更箇所を1ファイルに限定できる
- 型定義（`Project`, `Task`, `TaskWithProject`）をクエリと同じ場所に置くことで一貫性を保てる
- テスト対象が明確になる

## 影響
- Page コンポーネントや Server Actions はクエリを直接書かず `queries.ts` の関数を呼ぶ
- クエリ追加・変更は常に `queries.ts` を編集する
