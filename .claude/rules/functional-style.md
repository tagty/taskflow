# 関数型スタイルガイド

レイヤーごとの適用範囲を明確にする。Next.js + Supabase の構成に合わせた現実的な方針。

## 必須（queries.ts・utils・ビジネスロジック層）

- **純粋関数を優先**: 同じ入力には同じ出力を返す
- **イミュータブル操作**: 配列・オブジェクトを直接変更しない（`push` より `[...arr, item]`、`Object.assign` より `{ ...obj, key: value }`）
- **`map / filter / reduce`** でデータ変換する（`for` ループより宣言的に）
- **副作用の局所化**: DB アクセス・外部 API 呼び出しは関数の境界で明示する

## 推奨（Server Actions・API Routes）

- 入力 → 変換 → 出力の単方向フローを保つ
- 早期リターンで条件分岐をフラットに保つ
- `class` は使わない

## React コンポーネント層（慣習に従う）

- `useState` / `useEffect` は副作用ありで OK（React の設計に従う）
- ただしカスタム hooks でロジックを切り出し、コンポーネントを薄く保つ
- `class` コンポーネントは使わない

## NG パターン

```ts
// NG: 直接変更
const items = [];
items.push(newItem);

// OK: イミュータブル
const items = [...existingItems, newItem];

// NG: 手続き的ループ + 副作用混在
for (const task of tasks) {
  task.status = 'done';  // 直接変更
}

// OK: 変換して新しい配列を返す
const doneTasks = tasks.map(task => ({ ...task, status: 'done' }));
```
