# Mirai Environment Context

## Core App

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_APP_NAME`

## Supabase

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`
- `DATABASE_URL`

## Better Auth

- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`

## AI

- `OPENAI_API_KEY`
- `GOOGLE_GENERATIVE_AI_API_KEY`

The current runtime analysis/chat code is using Gemini through `@ai-sdk/google`, so Google AI credentials are now part of the active environment story.

## GitHub App

- `GITHUB_APP_ID`
- `GITHUB_APP_PRIVATE_KEY`
- `GITHUB_APP_SLUG`
- `GITHUB_WEBHOOK_SECRET`

## Internal API Security

- `INTERNAL_API_KEY`

This is currently used to protect the internal `/api/analyze` endpoint from arbitrary public invocation.

## Notes

- `DATABASE_URL` is expected to point at the Postgres database used by Better Auth and the app data model.
- The app currently uses Supabase both as a direct database client target and as the source of RLS policies.
- Because Better Auth is not the same thing as Supabase Auth, env correctness alone does not solve the current identity/RLS mismatch; code changes are still needed there.
