import "server-only";
import { createServerSupabase } from "./server";

export interface ClarificationAnswerRecord {
  questionId: string;
  value: string | number;
}

export interface ClarificationAnswerRow {
  id: string;
  project_id: string;
  pattern_id: string;
  question_id: string;
  value: string;
  created_at: string;
}

export async function insertClarificationAnswers(
  projectId: string,
  patternId: string,
  answers: ClarificationAnswerRecord[]
): Promise<void> {
  if (answers.length === 0) return;
  const supabase = createServerSupabase();
  const rows = answers.map((a) => ({
    project_id: projectId,
    pattern_id: patternId,
    question_id: a.questionId,
    value: String(a.value),
  }));

  const { error } = await supabase
    .from("clarification_answers")
    .insert(rows as Partial<ClarificationAnswerRow>[]);

  if (error) {
    throw error;
  }
}

