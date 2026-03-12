"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { analyzePattern, type AnalyzeResult } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <button
        type="submit"
        disabled={pending}
        className="btn"
        aria-busy={pending}
      >
        {pending ? "분석 중…" : "Analyze Pattern"}
      </button>
      {pending && (
        <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: 0 }}>
          긴 도안은 AI 분석에 1–2분 걸릴 수 있습니다.
        </p>
      )}
    </div>
  );
}

export function NewProjectForm() {
  const [state, formAction] = useActionState<AnalyzeResult | null, FormData>(
    async (_prev, formData) => analyzePattern(formData),
    null
  );

  return (
    <form
      action={formAction}
      className="window"
      style={{ maxWidth: "32rem", display: "flex", flexDirection: "column" }}
    >
      <div className="title-bar">
        <span className="title">새 프로젝트</span>
      </div>
      <div className="window-pane" style={{ padding: "1rem 1.5rem" }}>
        {state?.ok === false && (
          <p className="text-red-600 text-sm mb-4" role="alert">
            {state.error}
          </p>
        )}
        <div
          className="field-row"
          style={{
            flexDirection: "column",
            alignItems: "stretch",
            marginBottom: "0.75rem",
          }}
        >
          <label htmlFor="title" style={{ marginBottom: "4px" }}>
            프로젝트 제목
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            placeholder="예: 라글란 스웨터"
            style={{ width: "100%" }}
          />
        </div>
        <div
          className="field-row"
          style={{
            flexDirection: "column",
            alignItems: "stretch",
            marginBottom: "0.75rem",
          }}
        >
          <label htmlFor="pdf" style={{ marginBottom: "4px" }}>
            패턴 PDF
          </label>
          <input
            id="pdf"
            name="pdf"
            type="file"
            accept=".pdf,application/pdf"
            required
            style={{ width: "100%" }}
          />
        </div>
        <div
          className="field-row"
          style={{
            flexDirection: "column",
            alignItems: "stretch",
            marginBottom: "0.75rem",
          }}
        >
          <label htmlFor="size" style={{ marginBottom: "4px" }}>
            사이즈 (선택)
          </label>
          <input
            id="size"
            name="size"
            type="text"
            placeholder="예: M"
            style={{ width: "100%" }}
          />
        </div>
        <div style={{ marginTop: "1rem" }}>
          <SubmitButton />
        </div>
      </div>
    </form>
  );
}
