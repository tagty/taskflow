---
name: code-patterns
description: このプロジェクトのコードパターン参照先。新機能実装前に確認する
---

# コードパターン参照先

新しい機能を実装するときは、必ず既存コードを先に読んで同じパターンに従う。

| やること | 参照先 |
|---|---|
| 新しいDBクエリ | `src/lib/supabase/queries.ts` の既存関数 |
| 新しいページ | `src/app/today/page.tsx`（シンプルな例） |
| Server Action | `src/app/projects/[id]/actions.ts` |
| クライアントコンポーネント | `src/components/TaskStatusButton.tsx` |
| DBマイグレーション | `supabase/migrations/` の既存ファイル |

## DBクエリのパターン

```ts
// supabaseAdmin を使う（サーバー側のみ）
export async function listXxx(): Promise<Xxx[]> {
  const { data, error } = await supabaseAdmin
    .from("table_name")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
```

## Server Action のパターン

```ts
"use server";
import { revalidatePath } from "next/cache";

export async function createXxxAction(formData: FormData) {
  const value = formData.get("field") as string;
  await createXxx({ value });
  revalidatePath("/path");
}
```

## ページのパターン

```tsx
// Server Component（async）
export default async function XxxPage() {
  const data = await listXxx();
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 dark:text-gray-100">
      {/* dark: プレフィックスを必ず付ける */}
    </div>
  );
}
```

## 指示の書き方（良い例）

❌ 「タスクにメモ機能を追加して」

✅ 「`/projects/[id]` ページに task_notes の追加フォームを追加して。
- `src/app/projects/[id]/actions.ts` のパターンで Server Action を作成
- `src/lib/supabase/queries.ts` に `createTaskNote` と `listTaskNotes` を追加
- 完了後 `npm run verify` を実行」
