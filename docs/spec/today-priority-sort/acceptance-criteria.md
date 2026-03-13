# 今日ビューの判断支援強化 受け入れ基準

## REQ-001/002: priority ソート

**Given**: priority=2 のタスクAと priority=1 のタスクB と priority=null のタスクCが今日のタスクにある
**When**: `/today` を開く
**Then**: B（priority=1）→ A（priority=2）→ C（null）の順で表示される

- [ ] priority=1 のタスクが最上位
- [ ] priority が同じ場合は元の順序（created_at 順）を維持
- [ ] priority=null のタスクは末尾

## REQ-003/101/102: 見積時間合計表示

**Given**: estimate_minutes=90 と estimate_minutes=60 のタスクがある
**When**: `/today` を開く
**Then**: 「合計 2h30m」のように表示される

- [ ] 正常系: 合計 90+60=150分 → 「合計 2h30m」
- [ ] 正常系: 合計 60分 → 「合計 1h」
- [ ] 正常系: すべて null → 合計非表示
- [ ] 正常系: タスクが0件 → 合計非表示

## REQ-004: 過負荷警告

**Given**: 合計 estimate_minutes が 481分
**When**: `/today` を開く
**Then**: 過負荷警告が表示される

- [ ] 合計 480分以下 → 警告なし
- [ ] 合計 481分以上 → 警告表示（amber 系）
- [ ] 警告は滞留タスク警告と視覚的に区別できる
