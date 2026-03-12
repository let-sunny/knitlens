-- Store path to extracted text in Storage when too long for DB (avoids PGRST102 / body size limits)
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS extracted_text_url TEXT;
