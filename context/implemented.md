# Mirai Implementation Context

## Current Implementation State

The codebase is no longer just a migration scaffold. It now includes a product-facing dashboard and working integrations across chat, bug analysis, and GitHub App workflows.

## What Is Implemented

### Frontend

- Public marketing homepage with polished brand/UI treatment
- Dedicated login and signup pages
- Dashboard shell with sidebar navigation
- Overview page with AI chat UX
- Issues list page with live bug feed behavior
- Connections page for GitHub App installs and manual trace uploads
- Additional dashboard pages for workflows, usage, API keys, and settings

### Auth

- Better Auth server setup
- Better Auth client helpers
- Email/password login flow
- GitHub social sign-in trigger

### AI flows

- Structured bug analysis prompt and parser
- Chat-based AI debugging flow using Gemini streaming
- Internal async analysis endpoint for webhook-driven analysis
- AI output persisted back into bug and patch records

### GitHub flows

- GitHub App installation redirect
- GitHub installation callback handling
- Installation token caching in database
- Repo listing from installations
- File fetch from repository for context-aware debugging
- Patch commit, PR creation, and optional auto-merge
- Webhook ingestion for workflow failures and PR lifecycle updates

### Data model

- Supabase migration for:
  - installations
  - bugs
  - patches
  - chat_sessions

### Legacy code handling

- Old Vite/Django implementation is still present as reference
- Active Next.js runtime is the Mirai app
- Legacy `src/pages` have been isolated from the active build path

## What Is Still Incomplete Or Inconsistent

- `context/` docs had fallen behind the codebase before this update
- issue detail page is still static/demo content rather than data-backed
- client-side Supabase access and Better Auth session identity are not fully aligned
- some earlier scaffold pages/routes still coexist with newer product routes
- the current auth setup assumes configuration more aggressively than the older guarded implementation
- parts of the earlier `lib/mirai/*` mock-backed layer still exist beside the newer Supabase-first flow

## Current Source Of Truth

For the current runtime behavior, trust these first:

- `app/(dashboard)/*`
- `app/api/*`
- `lib/auth.ts`
- `lib/github.ts`
- `lib/prompts.ts`
- `supabase/migrations/20260320_mirai_core.sql`

Treat the older scaffold-oriented docs and mock-data layer as partial historical context, not the definitive architecture.
