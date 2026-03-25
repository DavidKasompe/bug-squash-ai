-- Mirai: Core Integration Schema Migration
-- Run: paste directly in Supabase SQL editor and click Run
-- Note: Mirai uses Better Auth. user_id values are text ids from Better Auth,
-- not UUIDs from Supabase Auth's auth.users table.

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- GitHub Installations
create table if not exists installations (
  id                uuid primary key default gen_random_uuid(),
  user_id           text not null,
  installation_id   text not null,
  account_login     text,
  account_type      text default 'User',
  token             text,
  token_expires_at  timestamptz,
  repos             jsonb default '[]',
  created_at        timestamptz default now(),
  unique (user_id, installation_id)
);
alter table installations enable row level security;

-- Bugs
create table if not exists bugs (
  id                  uuid primary key default gen_random_uuid(),
  user_id             text not null,
  installation_id     text,
  repo                text not null,
  title               text,
  description         text,
  stack_trace         text,
  severity            text default 'Medium',
  status              text default 'Detected',
  affected_file       text,
  affected_function   text,
  confidence          integer,
  root_cause          text,
  ai_suggestion       text,
  fix_steps           jsonb default '[]',
  source              text default 'manual',
  created_at          timestamptz default now(),
  resolved_at         timestamptz
);
alter table bugs enable row level security;

create index if not exists bugs_user_id_idx on bugs(user_id);
create index if not exists bugs_status_idx on bugs(status);

-- Patches
create table if not exists patches (
  id                uuid primary key default gen_random_uuid(),
  bug_id            uuid references bugs on delete cascade,
  user_id           text not null,
  diff              text not null,
  pr_url            text,
  pr_number         integer,
  branch_name       text,
  status            text default 'pending',
  tests_generated   jsonb default '[]',
  created_at        timestamptz default now()
);
alter table patches enable row level security;

-- Chat Sessions
create table if not exists chat_sessions (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null,
  bug_id      uuid references bugs on delete set null,
  title       text,
  messages    jsonb default '[]',
  created_at  timestamptz default now()
);
alter table chat_sessions enable row level security;
