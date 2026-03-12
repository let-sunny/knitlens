import { NextRequest, NextResponse } from "next/server";
import { getProjectById } from "@/lib/supabase/projects";
import {
  getProgressByProjectId,
  updateProgressStep,
  updateProgressPosition,
} from "@/lib/supabase/progress";

function validateBody(body: unknown): {
  stepId: string;
  completed: boolean;
  repeatCount: number | null;
} {
  if (!body || typeof body !== "object") {
    throw new Error("Request body must be a JSON object");
  }
  const o = body as Record<string, unknown>;
  if (typeof o.stepId !== "string" || !o.stepId.trim()) {
    throw new Error("stepId is required and must be a non-empty string");
  }
  if (typeof o.completed !== "boolean") {
    throw new Error("completed is required and must be a boolean");
  }
  const repeatCount = o.repeatCount;
  if (repeatCount !== null && typeof repeatCount !== "number") {
    throw new Error("repeatCount must be null or a number");
  }
  return {
    stepId: o.stepId.trim(),
    completed: o.completed,
    repeatCount: repeatCount === null ? null : Number(repeatCount),
  };
}

export async function POST(
  request: NextRequest,
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
        error: "progress_update_failed",
        message: "Project is not ready for tracking",
      },
      { status: 400 }
    );
  }

  let body: { stepId: string; completed: boolean; repeatCount: number | null };
  try {
    const raw = await request.json();
    body = validateBody(raw);
  } catch (err) {
    return NextResponse.json(
      {
        error: "progress_update_failed",
        message: err instanceof Error ? err.message : "Invalid request body",
      },
      { status: 400 }
    );
  }

  const progress = await getProgressByProjectId(projectId);
  if (!progress) {
    return NextResponse.json(
      {
        error: "progress_update_failed",
        message: "Progress not found",
      },
      { status: 404 }
    );
  }

  const hasStep = progress.steps.some(
    (s) => String(s.stepId) === String(body.stepId)
  );
  if (!hasStep) {
    return NextResponse.json(
      {
        error: "progress_update_failed",
        message: "Step not found in progress",
      },
      { status: 400 }
    );
  }

  try {
    const updated = await updateProgressStep(projectId, {
      stepId: body.stepId,
      completed: body.completed,
      repeatCount: body.repeatCount,
    });
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
        error: "progress_update_failed",
        message:
          err instanceof Error ? err.message : "Could not update project progress",
      },
      { status: 500 }
    );
  }
}

function validatePositionBody(body: unknown): {
  currentSectionId: string | null;
  currentRowId: string | null;
  currentStepId: string | null;
} {
  if (!body || typeof body !== "object") {
    throw new Error("Request body must be a JSON object");
  }
  const o = body as Record<string, unknown>;
  const str = (v: unknown) =>
    v == null ? null : typeof v === "string" ? v.trim() || null : null;
  return {
    currentSectionId: str(o.currentSectionId),
    currentRowId: str(o.currentRowId),
    currentStepId: str(o.currentStepId),
  };
}

export async function PATCH(
  request: NextRequest,
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
        error: "progress_update_failed",
        message: "Project is not ready for tracking",
      },
      { status: 400 }
    );
  }

  let body: {
    currentSectionId: string | null;
    currentRowId: string | null;
    currentStepId: string | null;
  };
  try {
    const raw = await request.json();
    body = validatePositionBody(raw);
  } catch (err) {
    return NextResponse.json(
      {
        error: "progress_update_failed",
        message: err instanceof Error ? err.message : "Invalid request body",
      },
      { status: 400 }
    );
  }

  const progress = await getProgressByProjectId(projectId);
  if (!progress) {
    return NextResponse.json(
      {
        error: "progress_update_failed",
        message: "Progress not found",
      },
      { status: 404 }
    );
  }

  try {
    const updated = await updateProgressPosition(projectId, body);
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
        error: "progress_update_failed",
        message:
          err instanceof Error ? err.message : "Could not update position",
      },
      { status: 500 }
    );
  }
}
