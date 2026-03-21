create table if not exists public.repositories (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  provider text not null default 'github',
  github_id bigint,
  name text not null,
  full_name text not null,
  description text,
  default_branch text,
  status text not null default 'active',
  is_connected boolean not null default true,
  analyze_branches text[] not null default '{}',
  analyze_paths text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.bug_reports (
  id uuid primary key default gen_random_uuid(),
  repository_id uuid references public.repositories (id) on delete cascade,
  title text not null,
  status text not null default 'queued',
  severity text,
  summary text,
  probable_cause text,
  repository_name text,
  affected_file text,
  affected_function text,
  suggested_fix text,
  confidence_score integer default 0,
  source_type text not null default 'log_upload',
  created_at timestamptz not null default now()
);

create table if not exists public.log_uploads (
  id uuid primary key default gen_random_uuid(),
  repository_id uuid references public.repositories (id) on delete set null,
  bug_report_id uuid references public.bug_reports (id) on delete set null,
  storage_path text not null,
  filename text not null,
  content_type text,
  created_at timestamptz not null default now()
);

create table if not exists public.patch_runs (
  id uuid primary key default gen_random_uuid(),
  bug_report_id uuid references public.bug_reports (id) on delete cascade,
  workflow_name text not null default 'bug-analysis',
  status text not null default 'pending',
  patch_summary text,
  diff_preview text,
  original_code text,
  original_file_path text,
  confidence_score integer default 0,
  pull_request_url text,
  validation_summary text,
  created_at timestamptz not null default now()
);
