import "server-only";
import { createServerSupabase } from "./server";
import type { PatternSource } from "@/lib/types/db";

export async function createPatternSource(
  projectId: string,
  params: { fileUrl: string; extractedText?: string }
): Promise<PatternSource> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("pattern_sources")
    .insert({
      project_id: projectId,
      file_type: "pdf",
      file_url: params.fileUrl,
      extracted_text: params.extractedText ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return {
    id: data.id,
    projectId: data.project_id,
    fileType: data.file_type,
    fileUrl: data.file_url,
    extractedText: data.extracted_text,
    createdAt: data.created_at,
  };
}

export async function getPatternSourceByProjectId(
  projectId: string
): Promise<PatternSource | null> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("pattern_sources")
    .select()
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return {
    id: data.id,
    projectId: data.project_id,
    fileType: data.file_type,
    fileUrl: data.file_url,
    extractedText: data.extracted_text,
    createdAt: data.created_at,
  };
}

export async function updatePatternSourceExtractedText(
  id: string,
  extractedText: string
): Promise<void> {
  const supabase = createServerSupabase();
  const { error } = await supabase
    .from("pattern_sources")
    .update({ extracted_text: extractedText })
    .eq("id", id);

  if (error) throw error;
}
