import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client (service role).
 * Use only in server contexts: route handlers, server actions, Server Components.
 */
function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  return url;
}

function getSupabaseServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  return key;
}

export function createServerSupabase() {
  return createClient(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: { persistSession: false },
  });
}

/** Storage bucket name for pattern PDFs (create in Supabase Dashboard if missing). */
export const PATTERN_PDFS_BUCKET = "pattern-pdfs";

/** Storage bucket for extracted pattern text (separate from PDFs so MIME allowlist can include text/plain). */
export const EXTRACTED_TEXT_BUCKET = "pattern-extracted-text";
