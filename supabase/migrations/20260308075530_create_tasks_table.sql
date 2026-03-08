create type task_status as enum ('todo', 'doing', 'done');

create table tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  description text,
  status task_status not null default 'todo',
  priority int,
  due_date date,
  estimate_minutes int,
  scheduled_for date,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
