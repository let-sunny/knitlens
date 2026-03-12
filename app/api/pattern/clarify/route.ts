import { NextRequest, NextResponse } from "next/server";
import { getPatternById } from "@/lib/supabase/patterns";
import { getProjectById } from "@/lib/supabase/projects";
import { getPatternSourceByProjectId } from "@/lib/supabase/pattern-sources";
import {
  insertClarificationAnswers,
  type ClarificationAnswerRecord,
} from "@/lib/supabase/clarification-answers";
import { completeJson } from "@/lib/llm/client";
import {
  PATTERN_CLARIFY_SYSTEM,
  buildClarifyUserPrompt,
} from "@/lib/llm/prompt-clarify";
import { validateClarifyOutput } from "@/lib/llm/schemas";

interface RequestBody {
  patternId: string;
  answers: { questionId: string; value: string | number }[];
}

function validateBody(body: unknown): RequestBody {
  if (!body || typeof body !== "object") {
    throw new Error("Request body must be a JSON object");
  }
  const o = body as Record<string, unknown>;
  if (typeof o.patternId !== "string" || !o.patternId.trim()) {
    throw new Error("patternId is required and must be a non-empty string");
  }
  if (!Array.isArray(o.answers)) {
    throw new Error("answers must be an array");
  }
  const answers = o.answers.map((item) => {
    if (!item || typeof item !== "object") {
      throw new Error("answers must contain objects");
    }
    const a = item as Record<string, unknown>;
    if (typeof a.questionId !== "string" || !a.questionId.trim()) {
      throw new Error("answer.questionId must be a non-empty string");
    }
    const v = a.value;
    if (
      typeof v !== "string" &&
      typeof v !== "number"
    ) {
      throw new Error("answer.value must be a string or number");
    }
    return {
      questionId: a.questionId.trim(),
      value: v as string | number,
    };
  });

  return { patternId: o.patternId.trim(), answers };
}

function humanizeLlmError(err: unknown): string {
  if (!(err instanceof Error)) {
    return "명확화 질문을 처리하는 중 알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
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

  return "명확화 질문을 처리하는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json();
    let body: RequestBody;
    try {
      body = validateBody(rawBody);
    } catch (err) {
      return NextResponse.json(
        {
          error: "invalid_clarification_payload",
          message:
            err instanceof Error ? err.message : "Answer list is invalid",
        },
        { status: 400 }
      );
    }

    const pattern = await getPatternById(body.patternId);
    if (!pattern) {
      return NextResponse.json(
        { error: "pattern_not_found", message: "Pattern not found" },
        { status: 404 }
      );
    }

    const project = await getProjectById(pattern.project_id);
    if (!project) {
      return NextResponse.json(
        { error: "project_not_found", message: "Project not found" },
        { status: 404 }
      );
    }

    let patternText = project.rawPatternText;
    if (!patternText) {
      const source = await getPatternSourceByProjectId(project.id);
      patternText = source?.extractedText ?? null;
    }
    if (!patternText) {
      return NextResponse.json(
        {
          error: "clarification_failed",
          message: "Original pattern text is missing for this project",
        },
        { status: 500 }
      );
    }

    const llmAnswers: ClarificationAnswerRecord[] = body.answers;

    let rawJson: string;
    try {
      rawJson = await completeJson(
        PATTERN_CLARIFY_SYSTEM,
        buildClarifyUserPrompt(patternText, llmAnswers)
      );
    } catch (err) {
      return NextResponse.json(
        {
          error: "clarification_failed",
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
          error: "clarification_failed",
          message: "AI response was not valid JSON",
        },
        { status: 500 }
      );
    }

    let validated;
    try {
      validated = validateClarifyOutput(parsed);
    } catch (err) {
      return NextResponse.json(
        {
          error: "clarification_failed",
          message:
            err instanceof Error
              ? err.message
              : "AI response failed schema validation",
        },
        { status: 500 }
      );
    }

    try {
      await insertClarificationAnswers(project.id, pattern.id, body.answers);
    } catch (err) {
      return NextResponse.json(
        {
          error: "clarification_failed",
          message:
            err instanceof Error
              ? err.message
              : "Failed to save clarification answers",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      questions: validated.questions,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: "clarification_failed",
        message: humanizeLlmError(err),
      },
      { status: 500 }
    );
  }
}

