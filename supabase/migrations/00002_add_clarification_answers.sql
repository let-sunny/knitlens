-- Clarification answers table for KnitLens
-- Stores user answers to clarification questions per project/pattern.

CREATE TABLE clarification_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  pattern_id UUID NOT NULL REFERENCES patterns(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_clarification_answers_pattern_id
  ON clarification_answers(pattern_id);

CREATE INDEX idx_clarification_answers_project_id
  ON clarification_answers(project_id);

