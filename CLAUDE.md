# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal Dev OS — 個人向けタスク管理アプリ。プロジェクト・タスク・メモを一元管理する。

## Tech Stack (planned)

- **Frontend/Backend**: Next.js (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)

## Commands

After Next.js is initialized:

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run lint     # Run ESLint
```

## Architecture

### Directory Structure (planned)

```
src/
  app/                  # Next.js App Router pages
    projects/           # Project list & detail pages
    today/              # Today's tasks view
    history/            # Completed tasks history
  components/           # Shared UI components
  lib/
    supabase/           # Supabase client & queries
```

### Data Model

See `spec/db.md` for the full schema. Key tables:

- `projects` — プロジェクト（name, color, description）
- `tasks` — タスク（project_id, title, status, priority, due_date, scheduled_for, completed_at）
- `task_notes` — タスクに紐づくメモ（task_id, body）

Task `status` values: `todo` / `doing` / `done`

### API Actions

See `spec/api.md`. Key operations:

- Projects: create, list, update
- Tasks: create, list by project, update, change status, list today tasks, list recent completed
- Task Notes: create, list

## Development Policy

- 1タスクずつ進める（`tasks.md` で管理）
- UXポリシー: 最小入力・シンプルさを優先（`spec/product.md` 参照）
- 作業開始前に `tasks.md` の Doing を更新し、完了後に Done へ移動する
