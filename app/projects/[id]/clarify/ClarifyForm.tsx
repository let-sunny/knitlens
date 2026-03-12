"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface ClarificationQuestion {
  id: string;
  text: string;
  type: "choice" | "number" | "text";
  options: string[] | null;
}

interface Props {
  projectId: string;
  patternId: string;
  initialQuestions: ClarificationQuestion[];
}

interface Answer {
  questionId: string;
  value: string | number;
}

export function ClarifyForm({
  projectId,
  patternId,
  initialQuestions,
}: Props) {
  const router = useRouter();
  const [questions, setQuestions] =
    useState<ClarificationQuestion[]>(initialQuestions);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [allAnswers, setAllAnswers] = useState<Answer[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(id: string, value: string) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const newAnswers: Answer[] = [];
    for (const q of questions) {
      const raw = answers[q.id]?.trim();
      if (!raw) {
        setError("모든 질문에 답해 주세요.");
        return;
      }
      if (q.type === "number") {
        const num = Number(raw);
        if (Number.isNaN(num)) {
          setError("숫자 답변이 올바르지 않습니다.");
          return;
        }
        newAnswers.push({ questionId: q.id, value: num });
      } else {
        newAnswers.push({ questionId: q.id, value: raw });
      }
    }

    const mergedAnswers: Answer[] = [
      ...allAnswers.filter(
        (a) => !newAnswers.some((n) => n.questionId === a.questionId)
      ),
      ...newAnswers,
    ];

    setSubmitting(true);
    try {
      const clarifyRes = await fetch("/api/pattern/clarify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patternId,
          answers: mergedAnswers,
        }),
      });

      if (!clarifyRes.ok) {
        const body = (await clarifyRes
          .json()
          .catch(() => ({}))) as { message?: string };
        setError(body.message ?? "명확화 요청에 실패했습니다.");
        setSubmitting(false);
        return;
      }

      const clarifyData = (await clarifyRes.json()) as {
        questions: ClarificationQuestion[];
      };

      setAllAnswers(mergedAnswers);

      if (Array.isArray(clarifyData.questions) && clarifyData.questions.length) {
        setQuestions(clarifyData.questions);
        setAnswers({});
        setSubmitting(false);
        return;
      }

      const compileRes = await fetch("/api/pattern/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patternId,
          answers: mergedAnswers,
        }),
        signal: AbortSignal.timeout(5 * 60 * 1000),
      });

      if (!compileRes.ok) {
        const body = (await compileRes
          .json()
          .catch(() => ({}))) as { message?: string };
        setError(body.message ?? "패턴 컴파일에 실패했습니다.");
        setSubmitting(false);
        return;
      }

      router.push(`/projects/${projectId}`);
    } catch {
      setError("요청 중 오류가 발생했습니다. 다시 시도해 주세요.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: "1rem" }}>
        <p style={{ fontSize: "0.875rem" }}>
          패턴을 계속 진행하기 전에 아래 질문에 답해 주세요.
        </p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {questions.map((q) => (
          <fieldset
            key={q.id}
            style={{
              border: "1px solid #000",
              padding: "1rem",
              margin: 0,
              minWidth: 0,
            }}
          >
            <legend style={{ fontWeight: 600, fontSize: "0.875rem", padding: "0 0.25rem" }}>
              {q.text}
            </legend>
            {q.type === "choice" && Array.isArray(q.options) && q.options.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.75rem",
                  marginTop: "0.5rem",
                }}
              >
                {q.options.map((opt) => (
                  <label
                    key={opt}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontSize: "0.875rem",
                      cursor: "pointer",
                      border: "1px solid #000",
                      padding: "0.5rem 0.75rem",
                      background: answers[q.id] === opt ? "#000" : "transparent",
                      color: answers[q.id] === opt ? "#fff" : "inherit",
                    }}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      value={opt}
                      checked={answers[q.id] === opt}
                      onChange={(e) => handleChange(q.id, e.target.value)}
                      style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
                      aria-label={opt}
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div style={{ marginTop: "0.5rem" }}>
                <input
                  style={{
                    width: "100%",
                    border: "1px solid #000",
                    padding: "0.5rem",
                    fontSize: "0.875rem",
                  }}
                  type={q.type === "number" ? "number" : "text"}
                  value={answers[q.id] ?? ""}
                  aria-label={q.text}
                  onChange={(e) => handleChange(q.id, e.target.value)}
                />
              </div>
            )}
          </fieldset>
        ))}
      </div>
      {error && (
        <p style={{ marginTop: "1rem", fontSize: "0.875rem", color: "#b91c1c" }} role="alert">
          {error}
        </p>
      )}
      <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
        <button
          type="submit"
          className="btn"
          disabled={submitting}
        >
          {submitting ? "처리 중..." : "Submit"}
        </button>
        {submitting && (
          <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: 0 }}>
            AI가 답변을 반영해 처리·컴파일하는 중입니다. 1–3분 걸릴 수 있습니다.
          </p>
        )}
      </div>
    </form>
  );
}

