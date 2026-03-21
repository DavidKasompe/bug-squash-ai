# Mirai Implementation Context

## What Has Been Implemented

### Platform

- Replaced the repo's active app target from Vite to Next.js.
- Added Next.js App Router pages for:
  - landing
  - sign in
  - sign up
  - dashboard
  - upload
  - GitHub connect
  - validation
  - code patch preview

### Auth

- Added Better Auth server configuration and Next.js route handler.
- Added Better Auth client usage for sign-in, sign-up, and sign-out.
- Added route protection for authenticated Mirai pages.

### Data and Storage

- Added Supabase admin client support.
- Added Supabase-backed server reads with mock fallback.
- Added upload API route to store files in Supabase Storage and register upload metadata.
- Expanded `supabase/schema.sql` to match Mirai entities.

### AI Workflow

- Added a Mastra-backed bug analysis workflow.
- Wired `/api/analysis` to the workflow.
- Kept a safe fallback response when `OPENAI_API_KEY` is missing.

### Repo Documentation

- Updated package/runtime config for Next.js.
- Added `.env.example`.
- Added this `context/` folder so future work can read migration state quickly.

## Important Current Limitations

- Better Auth database tables still need to be created/migrated in the target Postgres database.
- Supabase table and bucket creation still need to be applied in the real environment.
- Validation and patch data are still mock-backed unless corresponding Supabase records exist.
- GitHub integration UI is ported, but the real OAuth and repository sync flow is not fully wired yet.
