# Mirai Review Notes

## Highest-Risk Gaps Identified

1. Better Auth sessions and client-side Supabase RLS are not aligned.
2. The issue detail page is still hardcoded and does not reflect actual issue data.
3. PR creation assumes `main` as the base branch.
4. Some API routes use service-role reads without explicit per-user ownership filters.

## Files To Revisit First

- `lib/auth.ts`
- `app/(dashboard)/issues/page.tsx`
- `app/(dashboard)/connections/page.tsx`
- `app/(dashboard)/issues/[id]/page.tsx`
- `app/api/patches/[patchId]/create-pr/route.ts`
- `app/api/bugs/[bugId]/patch/route.ts`
- `lib/github.ts`
