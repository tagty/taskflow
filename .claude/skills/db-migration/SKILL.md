---
name: db-migration
description: Supabase DBマイグレーションの作成と適用手順
---

# DB マイグレーション手順

## 新しいマイグレーションを作成する

```bash
npx supabase migration new <migration_name>
# 例: npx supabase migration new add_tags_to_tasks
```

`supabase/migrations/` に新しいファイルが生成される。

## マイグレーションファイルを編集する

既存の `supabase/migrations/` ファイルを参照してパターンに従う：

```sql
-- テーブル作成例
CREATE TABLE table_name (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- カラム追加例
ALTER TABLE table_name ADD COLUMN column_name TEXT;

-- ENUM 追加例
CREATE TYPE enum_name AS ENUM ('value1', 'value2');
```

## マイグレーションを適用する

```bash
npx supabase db push
```

## 注意事項

- 既存データを破壊する変更（DROP, ALTER TYPE など）は慎重に
- `supabase/migrations/` のファイルは一度 push したら変更しない（新しいマイグレーションを追加する）
- `src/lib/supabase/queries.ts` の型定義も合わせて更新する
