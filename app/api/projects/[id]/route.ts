import { NextRequest, NextResponse } from "next/server";
import { getProjectById } from "@/lib/supabase/projects";
import { getLatestPatternByProjectId } from "@/lib/supabase/patterns";
import {
  getProgressByProjectId,
  createProgressForProject,
} from "@/lib/supabase/progress";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await context.params;

  const project = await getProjectById(projectId);
  if (!project) {
    return NextResponse.json(
      { error: "project_not_found", message: "Project not found" },
      { status: 404 }
    );
  }

  if (project.status !== "compiled") {
    return NextResponse.json(
      {
        error: "project_not_found",
        message: "Project is not ready for tracking yet",
      },
      { status: 404 }
    );
  }

  const pattern = await getLatestPatternByProjectId(projectId);
  if (!pattern) {
    return NextResponse.json(
      { error: "project_not_found", message: "Pattern not found" },
      { status: 404 }
    );
  }

  let progress = await getProgressByProjectId(projectId);
  if (!progress) {
    progress = await createProgressForProject(projectId, pattern);
  }

  return NextResponse.json({
    project: {
      id: project.id,
      title: project.title,
      patternPdfUrl: project.patternPdfUrl,
      rawPatternText: project.rawPatternText,
      status: project.status,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    },
    pattern: {
      id: pattern.id,
      projectId: pattern.project_id,
      title: pattern.title,
      notes: pattern.notes,
      sections: pattern.sections,
    },
    progress: {
      projectId: progress.project_id,
      currentSectionId: progress.current_section_id,
      currentRowId: progress.current_row_id,
      currentStepId: progress.current_step_id,
      steps: progress.steps,
    },
  });
}
