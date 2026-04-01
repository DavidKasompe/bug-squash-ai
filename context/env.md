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

- `GROQ_API_KEY`
- `GROQ_BASE_URL`
- `GROQ_MODEL`

The current runtime analysis/chat code is using Groq through the OpenAI-compatible client layer.

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
- The app uses Better Auth session ids, so app-owned tables store `user_id` as text rather than `auth.users` UUIDs.
- For free public access during development, Mirai can be exposed with localtunnel via `npm run tunnel:lt`.
- When using localtunnel, `NEXT_PUBLIC_APP_URL`, `BETTER_AUTH_URL`, the GitHub App callback URL, and the GitHub webhook URL must all be updated to the active localtunnel host.
