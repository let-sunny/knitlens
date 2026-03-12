import "server-only";
import { createServerSupabase } from "./server";

/** Section shape from API (sections stored as JSONB). */
export interface SectionRecord {
  id: string;
  title: string;
  order: number;
  rows: unknown[];
}

export interface PatternRow {
  id: string;
  project_id: string;
  title: string;
  notes: string | null;
  sections: SectionRecord[];
  created_at: string;
  updated_at: string;
}

export async function createPattern(
  projectId: string,
  params: { title: string; notes?: string | null; sections: SectionRecord[] }
): Promise<PatternRow> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("patterns")
    .insert({
      project_id: projectId,
      title: params.title,
      notes: params.notes ?? null,
      sections: params.sections,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export interface ClarificationQuestionRecord {
  id: string;
  text: string;
  type: "choice" | "number" | "text";
  options: string[] | null;
}

export async function insertClarificationQuestions(
  patternId: string,
  questions: ClarificationQuestionRecord[]
): Promise<void> {
  if (questions.length === 0) return;
  const supabase = createServerSupabase();
  const rows = questions.map((q) => ({
    id: q.id,
    pattern_id: patternId,
    text: q.text,
    type: q.type,
    options: q.options,
  }));
  const { error } = await supabase.from("clarification_questions").insert(rows);
  if (error) throw error;
}
