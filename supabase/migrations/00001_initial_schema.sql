-- KnitLens initial schema (data-model aligned)
-- Run this in Supabase SQL Editor or via `supabase db push` if using Supabase CLI.

-- Project status enum
CREATE TYPE project_status AS ENUM (
  'draft',
  'analyzing',
  'clarification',
  'compiled'
);

-- projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  pattern_pdf_url TEXT,
  raw_pattern_text TEXT,
  status project_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- pattern_sources (uploaded PDF + extracted text)
CREATE TABLE pattern_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  file_type TEXT NOT NULL DEFAULT 'pdf',
  file_url TEXT NOT NULL,
  extracted_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pattern_sources_project_id ON pattern_sources(project_id);

-- patterns (AI-compiled pattern; sections stored as JSONB)
CREATE TABLE patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  notes TEXT,
  sections JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_patterns_project_id ON patterns(project_id);

-- clarification_questions (from pattern analyze)
CREATE TABLE clarification_questions (
  id TEXT NOT NULL,
  pattern_id UUID NOT NULL REFERENCES patterns(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('choice', 'number', 'text')),
  options JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id, pattern_id)
);

CREATE INDEX idx_clarification_questions_pattern_id ON clarification_questions(pattern_id);

-- updated_at trigger helper
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE TRIGGER patterns_updated_at
  BEFORE UPDATE ON patterns
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
