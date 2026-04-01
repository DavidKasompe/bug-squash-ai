-- Mirai: Commit analysis persistence
-- Run: paste directly in Supabase SQL editor and click Run

create table if not exists commit_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  session_id uuid references chat_sessions on delete cascade,
  installation_id text,
  repo text not null,
  branch text,
  commit_sha text not null,
  commit_message text,
  title text,
  summary text,
  context text,
  changed_files jsonb default '[]',
  confirmed_errors_count integer default 0,
  potential_errors_count integer default 0,
  confirmed_errors jsonb default '[]',
  potential_errors jsonb default '[]',
  confirmed_findings jsonb default '[]',
  potential_findings jsonb default '[]',
  recommended_checks jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists commit_analyses_session_id_idx
  on commit_analyses(session_id)
  where session_id is not null;

create index if not exists commit_analyses_user_id_idx on commit_analyses(user_id);
create index if not exists commit_analyses_repo_idx on commit_analyses(repo);
create index if not exists commit_analyses_commit_sha_idx on commit_analyses(commit_sha);
