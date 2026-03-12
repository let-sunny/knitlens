import { NextResponse } from "next/server";
import { getProjectById } from "@/lib/supabase/projects";
import { getLatestPatternByProjectId } from "@/lib/supabase/patterns";
import {
  getProgressByProjectId,
  resetProgressForProject,
} from "@/lib/supabase/progress";

export async function POST(
  _request: Request,
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
        error: "progress_reset_failed",
        message: "Project is not ready for tracking",
      },
      { status: 400 }
    );
  }

  const progress = await getProgressByProjectId(projectId);
  if (!progress) {
    return NextResponse.json(
      {
        error: "progress_reset_failed",
        message: "Progress not found",
      },
      { status: 404 }
    );
  }

  const pattern = await getLatestPatternByProjectId(projectId);
  if (!pattern) {
    return NextResponse.json(
      {
        error: "progress_reset_failed",
        message: "Pattern not found",
      },
      { status: 404 }
    );
  }

  try {
    const updated = await resetProgressForProject(projectId, pattern);
    return NextResponse.json({
      projectId: updated.project_id,
      currentSectionId: updated.current_section_id,
      currentRowId: updated.current_row_id,
      currentStepId: updated.current_step_id,
      steps: updated.steps,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: "progress_reset_failed",
        message:
          err instanceof Error ? err.message : "Could not reset project progress",
      },
      { status: 500 }
    );
  }
}
