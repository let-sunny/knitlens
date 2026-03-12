import "server-only";
import { createServerSupabase } from "./server";
import type { PatternRow, SectionRecord } from "./patterns";

export interface StepProgressRecord {
  stepId: string;
  completed: boolean;
  repeatCount: number | null;
}

export interface ProgressRecord {
  id: string;
  project_id: string;
  current_section_id: string | null;
  current_row_id: string | null;
  current_step_id: string | null;
  steps: StepProgressRecord[];
  created_at: string;
  updated_at: string;
}

/** Flatten all step ids from pattern.sections (section.rows[].steps[]) in order. */
function stepIdsFromSections(sections: SectionRecord[]): string[] {
  const ids: string[] = [];
  for (const section of sections) {
    const rows = section.rows as { id: string; steps: { id: string }[] }[];
    for (const row of rows ?? []) {
      const steps = row.steps ?? [];
      for (const step of steps) {
        if (step?.id != null) ids.push(String(step.id));
      }
    }
  }
  return ids;
}

/** First section/row/step ids from pattern.sections. */
function firstPositionFromSections(sections: SectionRecord[]): {
  sectionId: string | null;
  rowId: string | null;
  stepId: string | null;
} {
  const section = sections[0];
  if (!section) return { sectionId: null, rowId: null, stepId: null };
  const rows = section.rows as { id: string; steps: { id: string }[] }[];
  const row = rows?.[0];
  if (!row) return { sectionId: section.id, rowId: null, stepId: null };
  const steps = row.steps ?? [];
  const step = steps[0];
  return {
    sectionId: section.id,
    rowId: row.id,
    stepId: step?.id != null ? String(step.id) : null,
  };
}

export async function getProgressByProjectId(
  projectId: string
): Promise<ProgressRecord | null> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("project_progress")
    .select()
    .eq("project_id", projectId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return {
    id: data.id,
    project_id: data.project_id,
    current_section_id: data.current_section_id,
    current_row_id: data.current_row_id,
    current_step_id: data.current_step_id,
    steps: (data.steps ?? []) as StepProgressRecord[],
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

/**
 * Create initial progress for a compiled project from its pattern.
 * Call when progress is missing and project is compiled.
 * If another request already created progress (race), returns the existing row.
 */
export async function createProgressForProject(
  projectId: string,
  pattern: PatternRow
): Promise<ProgressRecord> {
  const stepIds = stepIdsFromSections(pattern.sections);
  const steps: StepProgressRecord[] = stepIds.map((stepId) => ({
    stepId,
    completed: false,
    repeatCount: null,
  }));
  const pos = firstPositionFromSections(pattern.sections);

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("project_progress")
    .insert({
      project_id: projectId,
      current_section_id: pos.sectionId,
      current_row_id: pos.rowId,
      current_step_id: pos.stepId,
      steps,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      const existing = await getProgressByProjectId(projectId);
      if (existing) return existing;
    }
    throw error;
  }
  return {
    id: data.id,
    project_id: data.project_id,
    current_section_id: data.current_section_id,
    current_row_id: data.current_row_id,
    current_step_id: data.current_step_id,
    steps: (data.steps ?? []) as StepProgressRecord[],
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

/**
 * Reset progress for a project: all steps completed=false, repeatCount=null, position=first.
 * Requires existing progress row. Uses pattern to get step order and first position.
 */
export async function resetProgressForProject(
  projectId: string,
  pattern: PatternRow
): Promise<ProgressRecord> {
  const existing = await getProgressByProjectId(projectId);
  if (!existing) throw new Error("Progress not found");

  const stepIds = stepIdsFromSections(pattern.sections);
  const steps: StepProgressRecord[] = stepIds.map((stepId) => ({
    stepId,
    completed: false,
    repeatCount: null,
  }));
  const pos = firstPositionFromSections(pattern.sections);

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("project_progress")
    .update({
      current_section_id: pos.sectionId,
      current_row_id: pos.rowId,
      current_step_id: pos.stepId,
      steps,
      updated_at: new Date().toISOString(),
    })
    .eq("project_id", projectId)
    .select()
    .single();

  if (error) throw error;
  return {
    id: data.id,
    project_id: data.project_id,
    current_section_id: data.current_section_id,
    current_row_id: data.current_row_id,
    current_step_id: data.current_step_id,
    steps: (data.steps ?? []) as StepProgressRecord[],
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

/**
 * Update one step's completed/repeatCount and optionally current position.
 * Returns updated progress.
 */
export async function updateProgressStep(
  projectId: string,
  payload: { stepId: string; completed?: boolean; repeatCount?: number | null }
): Promise<ProgressRecord> {
  const progress = await getProgressByProjectId(projectId);
  if (!progress) throw new Error("Progress not found");

  const steps = progress.steps.map((s) => {
    if (String(s.stepId) !== String(payload.stepId)) return s;
    return {
      stepId: s.stepId,
      completed: payload.completed ?? s.completed,
      repeatCount: payload.repeatCount !== undefined ? payload.repeatCount : s.repeatCount,
    };
  });

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("project_progress")
    .update({ steps, updated_at: new Date().toISOString() })
    .eq("project_id", projectId)
    .select()
    .single();

  if (error) throw error;
  return {
    id: data.id,
    project_id: data.project_id,
    current_section_id: data.current_section_id,
    current_row_id: data.current_row_id,
    current_step_id: data.current_step_id,
    steps: (data.steps ?? []) as StepProgressRecord[],
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

/**
 * Update only current position (section/row/step). Does not change steps completion.
 */
export async function updateProgressPosition(
  projectId: string,
  payload: {
    currentSectionId?: string | null;
    currentRowId?: string | null;
    currentStepId?: string | null;
  }
): Promise<ProgressRecord> {
  const progress = await getProgressByProjectId(projectId);
  if (!progress) throw new Error("Progress not found");

  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (payload.currentSectionId !== undefined)
    row.current_section_id = payload.currentSectionId;
  if (payload.currentRowId !== undefined)
    row.current_row_id = payload.currentRowId;
  if (payload.currentStepId !== undefined)
    row.current_step_id = payload.currentStepId;

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("project_progress")
    .update(row)
    .eq("project_id", projectId)
    .select()
    .single();

  if (error) throw error;
  return {
    id: data.id,
    project_id: data.project_id,
    current_section_id: data.current_section_id,
    current_row_id: data.current_row_id,
    current_step_id: data.current_step_id,
    steps: (data.steps ?? []) as StepProgressRecord[],
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}
