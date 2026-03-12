import "server-only";
import { createServerSupabase } from "./server";
import { getPatternSourceByProjectId } from "./pattern-sources";
import { downloadExtractedText } from "./storage";
import type { Project, ProjectStatus } from "@/lib/types/db";

export async function createProject(title: string): Promise<Project> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("projects")
    .insert({ title, status: "draft" })
    .select()
    .single();

  if (error) throw error;
  return {
    id: data.id,
    title: data.title,
    patternPdfUrl: data.pattern_pdf_url,
    rawPatternText: data.raw_pattern_text,
    extractedTextUrl: data.extracted_text_url ?? null,
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function getProjectById(id: string): Promise<Project | null> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("projects")
    .select()
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return {
    id: data.id,
    title: data.title,
    patternPdfUrl: data.pattern_pdf_url,
    rawPatternText: data.raw_pattern_text,
    extractedTextUrl: data.extracted_text_url ?? null,
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Returns the full pattern text for a project: from DB column, from Storage, or from pattern_sources.
 */
export async function getProjectFullPatternText(
  projectId: string
): Promise<string | null> {
  const project = await getProjectById(projectId);
  if (!project) return null;

  if (project.rawPatternText != null && project.rawPatternText.length > 0) {
    return project.rawPatternText;
  }
  if (project.extractedTextUrl) {
    try {
      return await downloadExtractedText(project.extractedTextUrl);
    } catch {
      return null;
    }
  }
  const source = await getPatternSourceByProjectId(projectId);
  return source?.extractedText ?? null;
}

export async function updateProject(
  id: string,
  updates: {
    patternPdfUrl?: string;
    rawPatternText?: string;
    extractedTextUrl?: string | null;
    status?: ProjectStatus;
  }
): Promise<Project> {
  const supabase = createServerSupabase();
  const row: Record<string, unknown> = {};
  if (updates.patternPdfUrl !== undefined)
    row.pattern_pdf_url = updates.patternPdfUrl;
  if (updates.rawPatternText !== undefined)
    row.raw_pattern_text = updates.rawPatternText;
  if (updates.extractedTextUrl !== undefined)
    row.extracted_text_url = updates.extractedTextUrl;
  if (updates.status !== undefined) row.status = updates.status;

  const { data, error } = await supabase
    .from("projects")
    .update(row)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return {
    id: data.id,
    title: data.title,
    patternPdfUrl: data.pattern_pdf_url,
    rawPatternText: data.raw_pattern_text,
    extractedTextUrl: data.extracted_text_url ?? null,
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}
