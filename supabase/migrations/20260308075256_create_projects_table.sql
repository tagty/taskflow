create table projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
