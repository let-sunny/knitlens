# Supabase setup for KnitLens

## 1. Apply database schema

Run the migration in the Supabase SQL Editor:

- Open your project at [app.supabase.com](https://app.supabase.com) → SQL Editor.
- Paste and run the contents of `supabase/migrations/00001_initial_schema.sql`.

Or, if using the Supabase CLI: `supabase db push`.

## 2. Create Storage bucket for PDFs

1. In the Supabase Dashboard go to **Storage**.
2. Click **New bucket**.
3. Name: `pattern-pdfs`.
4. Set **Public bucket** to **Off** (private; access via signed URLs or service role).
5. (Optional) Configure policies so only the app (service role) can upload/read.

The app expects the bucket name `pattern-pdfs` (see `lib/supabase/server.ts`).

## 3. Environment variables

Copy `.env.local.example` to `.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL` – Project URL (Settings → API).
- `SUPABASE_SERVICE_ROLE_KEY` – Service role key (Settings → API). Keep this secret; server-only.
