"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createProject, updateProject } from "@/lib/supabase/projects";
import { createPatternSource } from "@/lib/supabase/pattern-sources";
import {
  uploadPatternPdf,
  uploadExtractedText,
} from "@/lib/supabase/storage";
import { extractTextFromPdfBuffer } from "@/lib/pdf/extract-text";

export type AnalyzeResult =
  | { ok: true; projectId: string; needsClarification: boolean }
  | { ok: false; error: string };

export async function analyzePattern(
  formData: FormData
): Promise<AnalyzeResult> {
  const title = formData.get("title");
  const file = formData.get("pdf") as File | null;
  const _size = formData.get("size") as string | null;

  if (!title || typeof title !== "string" || !title.trim()) {
    return { ok: false, error: "프로젝트 제목을 입력해 주세요." };
  }
  if (!file || !(file instanceof File) || file.size === 0) {
    return { ok: false, error: "패턴 PDF를 선택해 주세요." };
  }
  if (file.type !== "application/pdf") {
    return { ok: false, error: "PDF 파일만 업로드할 수 있습니다." };
  }

  let projectId: string;
  try {
    const project = await createProject(title.trim());
    projectId = project.id;
  } catch {
    return {
      ok: false,
      error: "프로젝트를 생성할 수 없습니다. 다시 시도해 주세요.",
    };
  }

  let path: string;
  try {
    path = await uploadPatternPdf(projectId, file);
  } catch {
    return {
      ok: false,
      error: "PDF를 업로드할 수 없습니다. 다시 시도해 주세요.",
    };
  }

  let patternText: string;
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    patternText = await extractTextFromPdfBuffer(buffer);
  } catch {
    return {
      ok: false,
      error:
        "패턴 텍스트를 읽을 수 없습니다. PDF가 손상되었거나 텍스트가 없을 수 있습니다.",
    };
  }

  try {
    const extractedPath = await uploadExtractedText(projectId, patternText);
    await updateProject(projectId, {
      patternPdfUrl: path,
      extractedTextUrl: extractedPath,
    });
    await createPatternSource(projectId, { fileUrl: path });
  } catch (err) {
    const message =
      (err as { message?: string }).message ??
      (err instanceof Error ? err.message : String(err));
    console.error("[analyzePattern] save failed:", message, err);
    return {
      ok: false,
      error:
        process.env.NODE_ENV === "development"
          ? `저장 중 오류: ${message}`
          : "저장 중 오류가 발생했습니다. 다시 시도해 주세요.",
    };
  }

  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const proto = headersList.get("x-forwarded-proto") ?? "http";
  const base = `${proto}://${host}`;

  let res: Response;
  try {
    res = await fetch(`${base}/api/pattern/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId }),
    });
  } catch {
    return {
      ok: false,
      error: "패턴 분석 요청에 실패했습니다. 다시 시도해 주세요.",
    };
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg =
      (body as { message?: string }).message ?? "패턴 분석에 실패했습니다.";
    return { ok: false, error: msg };
  }

  const data = (await res.json()) as {
    patternId?: string;
    questions?: unknown[];
  };
  const questions = Array.isArray(data.questions) ? data.questions : [];
  const needsClarification = questions.length > 0;

  if (needsClarification) {
    redirect(`/projects/${projectId}/clarify`);
  }
  redirect(`/projects/${projectId}`);
}
