# 設計原則チェックリスト

このプロジェクトで適用する設計原則。`/self-review` の Agent 3 が参照する。

## 単一責任（SRP）

- 1つの関数・コンポーネントは1つの責務を持つ
- `queries.ts` にクエリ以外のロジックが混入していないか
- コンポーネントがデータ取得とUI描画の両方を担っていないか（Server Component / Client Component の分離）

## DRY（Don't Repeat Yourself）

- 同じロジックが複数箇所に書かれていないか
- 共通化できる UI パターンは `src/components/` に切り出されているか
- ただし、2箇所程度の重複は許容（過度な抽象化を避ける）

## YAGNI（You Aren't Gonna Need It）

- 現在の要件に不要な汎用化・設定化をしていないか
- 「将来使うかも」で追加したコードがないか
- オプションパラメータや feature flag が不要に増えていないか

## 依存の方向

- コンポーネント → queries.ts → Supabase の方向を維持する
- UI コンポーネントが直接 Supabase クライアントを呼んでいないか
- Server Actions 経由でのみ DB write が行われているか（セキュリティと一致）
