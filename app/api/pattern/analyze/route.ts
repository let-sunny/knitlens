import { NextRequest, NextResponse } from "next/server";
import { getProjectById, updateProject } from "@/lib/supabase/projects";
import {
  createPattern,
  insertClarificationQuestions,
  type SectionRecord,
  type ClarificationQuestionRecord,
} from "@/lib/supabase/patterns";
import { completeJson } from "@/lib/llm/client";
import {
  PATTERN_ANALYZE_SYSTEM,
  buildAnalyzeUserPrompt,
} from "@/lib/llm/prompt-analyze";
import { validateAnalyzeOutput } from "@/lib/llm/schemas";

function validateBody(body: unknown): {
  projectId: string;
  patternText: string;
} {
  if (!body || typeof body !== "object") {
    throw new Error("Request body must be a JSON object");
  }
  const o = body as Record<string, unknown>;
  if (typeof o.projectId !== "string" || !o.projectId.trim()) {
    throw new Error("projectId is required and must be a non-empty string");
  }
  if (typeof o.patternText !== "string" || !o.patternText.trim()) {
    throw new Error("patternText is required and must be a non-empty string");
  }
  return { projectId: o.projectId.trim(), patternText: o.patternText.trim() };
}

function humanizeLlmError(err: unknown): string {
  if (!(err instanceof Error)) {
    return "패턴을 분석하는 중 알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
  }
  const msg = err.message;

  if (msg.includes("OPENAI_API_KEY is not set")) {
    return "AI 설정이 완료되지 않았습니다. OPENAI_API_KEY 환경 변수를 확인한 뒤 다시 시도해 주세요.";
  }
  if (
    msg.includes("insufficient_quota") ||
    msg.includes("You exceeded your current quota")
  ) {
    return "AI 사용 한도를 초과했습니다. OpenAI Billing 설정을 확인한 뒤 다시 시도해 주세요.";
  }
  if (msg.includes("401") || msg.includes("invalid_api_key")) {
    return "AI 키가 올바르지 않습니다. OPENAI_API_KEY 값을 확인해 주세요.";
  }

  return "패턴을 분석하는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, patternText } = validateBody(body);

    const project = await getProjectById(projectId);
    if (!project) {
      return NextResponse.json(
        { error: "project_not_found", message: "Project not found" },
        { status: 404 }
      );
    }

    await updateProject(projectId, { status: "analyzing" });

    let rawJson: string;
    try {
      rawJson = await completeJson(
        PATTERN_ANALYZE_SYSTEM,
        buildAnalyzeUserPrompt(patternText)
      );
    } catch (err) {
      await updateProject(projectId, { status: "draft" });
      return NextResponse.json(
        {
          error: "analysis_failed",
          message: humanizeLlmError(err),
        },
        { status: 500 }
      );
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawJson);
    } catch {
      return NextResponse.json(
        {
          error: "analysis_failed",
          message: "AI response was not valid JSON",
        },
        { status: 500 }
      );
    }

    let validated: { sections: typeof parsed; questions: unknown[] };
    try {
      validated = validateAnalyzeOutput(parsed);
    } catch (err) {
      return NextResponse.json(
        {
          error: "analysis_failed",
          message:
            err instanceof Error
              ? err.message
              : "AI response failed schema validation",
        },
        { status: 500 }
      );
    }

    const pattern = await createPattern(projectId, {
      title: project.title,
      notes: "From pattern analysis",
      sections: validated.sections as SectionRecord[],
    });

    await insertClarificationQuestions(
      pattern.id,
      validated.questions as ClarificationQuestionRecord[]
    );

    const nextStatus =
      validated.questions.length > 0 ? "clarification" : "compiled";
    await updateProject(projectId, { status: nextStatus });

    return NextResponse.json({
      patternId: pattern.id,
      sections: validated.sections,
      questions: validated.questions,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: "analysis_failed",
        message: humanizeLlmError(err),
      },
      { status: 500 }
    );
  }
}
