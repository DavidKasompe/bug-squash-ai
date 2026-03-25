# Mirai Architecture Context

## Current Product Shape

Mirai is now a multi-surface Next.js application with:

- a public marketing/landing experience at `/`
- an authenticated product shell under the `(dashboard)` route group
- server-side API handlers under `app/api`
- Supabase as the main persistence layer
- Better Auth for application auth
- Gemini-based AI analysis and chat flows
- GitHub App integration for installations, repo access, PR creation, and webhook ingestion

## Main Route Areas

### Public routes

- `/`
- `/login`
- `/signin`
- `/signup`

### Product routes

- `/overview`
- `/issues`
- `/issues/[id]`
- `/connections`
- `/workflows`
- `/usage`
- `/api-keys`
- `/settings`

These routes are composed by `app/(dashboard)/layout.tsx`, which provides the product shell and right-side contextual panels.

## API Surfaces

### Core AI + bug workflow

- `app/api/chat/route.ts`
  - authenticated streaming AI chat
  - creates chat sessions
  - can create bug records from raw messages
  - stores parsed AI output and patch records

- `app/api/analyze/route.ts`
  - internal async bug analysis endpoint
  - updates bug records and inserts patch rows

- `app/api/bugs/[bugId]/patch/route.ts`
  - fetches latest patch metadata for a bug

- `app/api/patches/[patchId]/create-pr/route.ts`
  - applies diff to GitHub repo
  - creates branch, commit, and PR
  - optionally auto-merges for critical bugs if workflow rules allow

### GitHub integration

- `app/api/github/install/route.ts`
  - redirects to GitHub App installation flow

- `app/api/github/callback/route.ts`
  - exchanges installation context
  - fetches accessible repos
  - stores installation and cached token in Supabase

- `app/api/webhooks/github/route.ts`
  - ingests workflow-run failures
  - creates bug records
  - kicks off internal analysis
  - tracks merged/closed PR outcomes

## Core Libraries

### Auth

- `lib/auth.ts`
  - Better Auth server configuration
  - session retrieval via `auth.api.getSession`

- `lib/auth-client.ts`
  - Better Auth client helpers
  - exports `signIn`, `signUp`, `signOut`, `useSession`

### Supabase

- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- `lib/supabase/admin.ts`

### GitHub

- `lib/github.ts`
  - GitHub App auth token management
  - installation repo listing
  - file fetch
  - branch creation
  - commit and PR operations
  - workflow log retrieval

### AI

- `lib/prompts.ts`
  - structured bug-analysis prompt
  - parser for AI JSON output
  - PR body generator
  - bug-message detection heuristic

- `mastra/workflows/bug-analysis.ts`
  - earlier workflow surface still exists
  - current primary runtime analysis path is the Gemini-based API layer

## Current Persistence Model

The active schema direction is represented by `supabase/migrations/20260320_mirai_core.sql`.

Primary tables:

- `installations`
- `bugs`
- `patches`
- `chat_sessions`

These tables are intended to connect:

- Better Auth user identity
- GitHub App installations and repo metadata
- bug ingestion from chat or GitHub Actions
- patch generation and PR lifecycle
- stored chat history per issue/session

## Important Architectural Tension

The current codebase mixes:

- Better Auth for application sessions
- Supabase RLS policies written against `auth.uid()`
- browser-side Supabase anon client reads in some dashboard pages

That means auth/session ownership and data-access enforcement are not yet fully aligned. This is the main architectural risk in the current implementation.
