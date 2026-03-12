import "server-only";
import { createServerSupabase } from "./server";
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
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function updateProject(
  id: string,
  updates: {
    patternPdfUrl?: string;
    rawPatternText?: string;
    status?: ProjectStatus;
  }
): Promise<Project> {
  const supabase = createServerSupabase();
  const row: Record<string, unknown> = {};
  if (updates.patternPdfUrl !== undefined)
    row.pattern_pdf_url = updates.patternPdfUrl;
  if (updates.rawPatternText !== undefined)
    row.raw_pattern_text = updates.rawPatternText;
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
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}
