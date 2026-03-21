# Mirai Environment Context

## Required Variables

- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`
- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `OPENAI_API_KEY`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`

## Notes

- `DATABASE_URL` should point at the Supabase Postgres instance if Better Auth is meant to store users there.
- `SUPABASE_SERVICE_ROLE_KEY` is required for server-side upload registration and direct data access.
- `OPENAI_API_KEY` enables the live Mastra analysis path.
- Without the env above, Mirai falls back to partial or mock behavior rather than crashing outright.
