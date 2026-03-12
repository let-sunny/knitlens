/** Project status (data-model and state-machine). */
export type ProjectStatus =
  | "draft"
  | "analyzing"
  | "clarification"
  | "compiled";

/** Project row from DB (snake_case). */
export interface ProjectRow {
  id: string;
  title: string;
  pattern_pdf_url: string | null;
  raw_pattern_text: string | null;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

/** Project entity (camelCase) for app use. */
export interface Project {
  id: string;
  title: string;
  patternPdfUrl: string | null;
  rawPatternText: string | null;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

/** PatternSource row from DB. */
export interface PatternSourceRow {
  id: string;
  project_id: string;
  file_type: string;
  file_url: string;
  extracted_text: string | null;
  created_at: string;
}

/** PatternSource entity for app use. */
export interface PatternSource {
  id: string;
  projectId: string;
  fileType: string;
  fileUrl: string;
  extractedText: string | null;
  createdAt: string;
}

function projectRowToEntity(row: ProjectRow): Project {
  return {
    id: row.id,
    title: row.title,
    patternPdfUrl: row.pattern_pdf_url,
    rawPatternText: row.raw_pattern_text,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function patternSourceRowToEntity(row: PatternSourceRow): PatternSource {
  return {
    id: row.id,
    projectId: row.project_id,
    fileType: row.file_type,
    fileUrl: row.file_url,
    extractedText: row.extracted_text,
    createdAt: row.created_at,
  };
}

export const db = {
  projectRowToEntity,
  patternSourceRowToEntity,
};
