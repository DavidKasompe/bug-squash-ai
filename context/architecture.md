# Mirai Architecture Context

## Current Target Stack

- Next.js App Router for frontend and backend routes
- Tailwind CSS for styling
- Better Auth for sessions and account management
- Supabase for Postgres-backed data and object storage
- Mastra for analysis workflows

## Active Runtime Surfaces

- UI routes live under `app/`
- JSON/API handlers live under `app/api/`
- Auth server setup lives in `lib/auth.ts`
- Supabase admin and SSR clients live in `lib/supabase/`
- Mirai domain data access lives in `lib/mirai/`
- Mastra workflows live in `mastra/`

## Current Data Strategy

- When Supabase env is configured, Mirai reads repositories, bug reports, patch runs, and uploads from Supabase.
- When Supabase is not configured, Mirai falls back to local mock data in `lib/mirai/mock-data.ts`.
- Uploads are intended for Supabase Storage using the bucket named by `SUPABASE_STORAGE_BUCKET`.

## Current Auth Strategy

- Better Auth is enabled when both `DATABASE_URL` and `BETTER_AUTH_SECRET` are set.
- Protected routes redirect to `/signin` only when auth is configured.
- Sign-in and sign-up flows are now client-driven through Better Auth.
