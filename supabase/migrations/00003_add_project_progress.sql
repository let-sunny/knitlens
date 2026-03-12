-- Project progress for tracker screen (data-model: ProjectProgress, StepProgress)

CREATE TABLE project_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE UNIQUE,
  current_section_id TEXT,
  current_row_id TEXT,
  current_step_id TEXT,
  steps JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_project_progress_project_id ON project_progress(project_id);

CREATE TRIGGER project_progress_updated_at
  BEFORE UPDATE ON project_progress
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
