"use client";

import { useState, useCallback, useMemo } from "react";

export interface SectionShape {
  id: string;
  title: string;
  order: number;
  rows: RowShape[];
}

export interface RowShape {
  id: string;
  order: number;
  instructions: string;
  repeat: number | null;
  notes: string | null;
  steps: StepShape[];
}

export interface StepShape {
  id: string;
  order: number;
  instruction: string;
  stitchCount: number | null;
}

export interface StepProgressShape {
  stepId: string;
  completed: boolean;
  repeatCount: number | null;
}

interface Props {
  projectId: string;
  projectTitle: string;
  sections: SectionShape[];
  progress: {
    currentSectionId: string | null;
    currentRowId: string | null;
    currentStepId: string | null;
    steps: StepProgressShape[];
  };
}

function stepIdEq(a: string | number, b: string | number): boolean {
  return String(a) === String(b);
}

function getStepProgress(
  steps: StepProgressShape[],
  stepId: string
): StepProgressShape | undefined {
  return steps.find((s) => stepIdEq(s.stepId, stepId));
}

/** Ensure steps from server/API always have stepId, completed, repeatCount (handles snake_case). */
function normalizeSteps(steps: unknown): StepProgressShape[] {
  if (!Array.isArray(steps)) return [];
  return steps
    .map((s) => {
      if (!s || typeof s !== "object") return null;
      const o = s as Record<string, unknown>;
      const stepId =
        typeof o.stepId === "string"
          ? o.stepId
          : typeof (o as { step_id?: string }).step_id === "string"
            ? (o as { step_id: string }).step_id
            : null;
      if (!stepId) return null;
      const rawCompleted = o.completed ?? (o as { completed?: unknown }).completed;
      const completed =
        typeof rawCompleted === "boolean"
          ? rawCompleted
          : rawCompleted === 1 || rawCompleted === "true"
            ? true
            : rawCompleted === 0 || rawCompleted === "false"
              ? false
              : false;
      const rc = o.repeatCount ?? (o as { repeat_count?: number | null }).repeat_count;
      const repeatCount =
        rc !== undefined && rc !== null ? Number(rc) : null;
      return {
        stepId,
        completed,
        repeatCount:
          repeatCount !== null && !Number.isNaN(repeatCount)
            ? repeatCount
            : null,
      };
    })
    .filter((x): x is StepProgressShape => x !== null);
}

export function TrackerView({
  projectId,
  projectTitle,
  sections,
  progress: initialProgress,
}: Props) {
  const [progress, setProgress] = useState(() => ({
    ...initialProgress,
    steps: normalizeSteps(initialProgress.steps),
  }));
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    () =>
      initialProgress.currentSectionId ??
      sections[0]?.id ??
      null
  );

  const updateStep = useCallback(
    async (
      stepId: string,
      updates: { completed?: boolean; repeatCount?: number | null }
    ) => {
      const stepIdStr = String(stepId);
      const current = getStepProgress(progress.steps, stepIdStr);
      if (!current) return;
      const completed =
        updates.completed ?? current.completed;
      const repeatCount =
        updates.repeatCount !== undefined
          ? updates.repeatCount
          : current.repeatCount;

      setProgress((prev) => ({
        ...prev,
        steps: prev.steps.map((s) =>
          stepIdEq(s.stepId, stepIdStr)
            ? { stepId: s.stepId, completed, repeatCount }
            : s
        ),
      }));
      setUpdating(stepId);
      setError(null);
      try {
        const res = await fetch(`/api/projects/${projectId}/progress`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stepId: stepIdStr, completed, repeatCount }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as {
            message?: string;
          };
          setError(data.message ?? "진행 상태 저장에 실패했습니다.");
          setProgress((prev) => ({
            ...prev,
            steps: prev.steps.map((s) =>
              stepIdEq(s.stepId, stepIdStr) ? { ...s, completed: current.completed, repeatCount: current.repeatCount } : s
            ),
          }));
          return;
        }
        const data = (await res.json()) as {
          currentSectionId: string | null;
          currentRowId: string | null;
          currentStepId: string | null;
          steps: StepProgressShape[];
        };
        const nextSteps = normalizeSteps(data.steps);
        if (nextSteps.length > 0) {
          setProgress((prev) => ({
            ...prev,
            currentSectionId: data.currentSectionId ?? prev.currentSectionId,
            currentRowId: data.currentRowId ?? prev.currentRowId,
            currentStepId: data.currentStepId ?? prev.currentStepId,
            steps: nextSteps,
          }));
        }
      } catch {
        setError("요청 중 오류가 발생했습니다.");
        setProgress((prev) => ({
          ...prev,
          steps: prev.steps.map((s) =>
            stepIdEq(s.stepId, stepIdStr) ? { ...s, completed: current.completed, repeatCount: current.repeatCount } : s
          ),
        }));
      } finally {
        setUpdating(null);
      }
    },
    [projectId, progress.steps]
  );

  /** Ordered list of all steps for "next step" navigation. */
  const orderedSteps = useMemo(() => {
    const list: { sectionId: string; rowId: string; stepId: string }[] = [];
    for (const sec of sections) {
      for (const row of sec.rows) {
        for (const step of row.steps) {
          list.push({ sectionId: sec.id, rowId: row.id, stepId: step.id });
        }
      }
    }
    return list;
  }, [sections]);

  const [movingStep, setMovingStep] = useState<"prev" | "next" | null>(null);

  const updatePosition = useCallback(
    async (target: { sectionId: string; rowId: string; stepId: string }) => {
      setError(null);
      try {
        const res = await fetch(`/api/projects/${projectId}/progress`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentSectionId: target.sectionId,
            currentRowId: target.rowId,
            currentStepId: target.stepId,
          }),
        });
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { message?: string };
          setError(body.message ?? "진행 위치를 업데이트하지 못했습니다.");
          return;
        }
        const data = (await res.json()) as {
          currentSectionId: string | null;
          currentRowId: string | null;
          currentStepId: string | null;
          steps: StepProgressShape[];
        };
        const nextSteps = normalizeSteps(data.steps);
        setProgress((prev) => ({
          ...prev,
          currentSectionId: data.currentSectionId ?? prev.currentSectionId,
          currentRowId: data.currentRowId ?? prev.currentRowId,
          currentStepId: data.currentStepId ?? prev.currentStepId,
          steps: nextSteps.length > 0 ? nextSteps : prev.steps,
        }));
        setSelectedSectionId(data.currentSectionId);
      } catch {
        setError("요청 중 오류가 발생했습니다.");
      } finally {
        setMovingStep(null);
      }
    },
    [projectId]
  );

  const goToPrevStep = useCallback(async () => {
    const currentIdx = orderedSteps.findIndex((s) =>
      stepIdEq(s.stepId, progress.currentStepId ?? "")
    );
    const prevIdx = currentIdx > 0 ? currentIdx - 1 : 0;
    const prev = orderedSteps[prevIdx];
    if (!prev) return;
    setMovingStep("prev");
    await updatePosition(prev);
    const prevProg = getStepProgress(progress.steps, prev.stepId);
    if (prevProg?.completed) {
      await updateStep(prev.stepId, { completed: false });
    }
  }, [orderedSteps, progress.currentStepId, progress.steps, updateStep, updatePosition]);

  const goToNextStep = useCallback(async () => {
    const currentIdx = orderedSteps.findIndex((s) =>
      stepIdEq(s.stepId, progress.currentStepId ?? "")
    );
    const nextIdx = currentIdx >= 0 ? currentIdx + 1 : 0;
    const next = orderedSteps[nextIdx];
    if (!next) return;
    setMovingStep("next");
    const currentStepId = progress.currentStepId;
    if (currentStepId) {
      const currentProg = getStepProgress(progress.steps, currentStepId);
      if (currentProg && !currentProg.completed) {
        await updateStep(currentStepId, { completed: true });
      }
    }
    await updatePosition(next);
  }, [orderedSteps, progress.currentStepId, progress.steps, updateStep, updatePosition]);

  const currentSection = sections.find((s) => s.id === selectedSectionId);
  const completedCount = progress.steps.filter((s) => s.completed).length;
  const totalSteps = progress.steps.length;
  const progressPercent =
    totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  const currentSectionStepIds = useMemo(
    () =>
      currentSection
        ? currentSection.rows.flatMap((r) => r.steps.map((s) => s.id))
        : [],
    [currentSection]
  );
  const currentSectionCompleted = currentSectionStepIds.filter((sid) =>
    progress.steps.some((s) => stepIdEq(s.stepId, sid) && s.completed)
  ).length;
  const currentSectionTotal = currentSectionStepIds.length;
  const currentStepIdx = orderedSteps.findIndex((s) =>
    stepIdEq(s.stepId, progress.currentStepId ?? "")
  );
  const hasPrevStep = currentStepIdx > 0;
  const hasNextStep = currentStepIdx >= 0 && currentStepIdx < orderedSteps.length - 1;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      {error && (
        <p
          style={{
            fontSize: "0.875rem",
            color: "#b91c1c",
            margin: "0 0 0.75rem 0",
          }}
          role="alert"
        >
          {error}
        </p>
      )}
      {/* Overall progress: fixed at top of window (no outer scroll) */}
      <div
        style={{
          flexShrink: 0,
          padding: "0.75rem 1rem",
          borderBottom: "1px solid #000",
          backgroundColor: "#e0e0e0",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.625rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.03em",
            marginBottom: "0.25rem",
          }}
        >
          <span>Overall Project Progress</span>
          <span>
            {completedCount}/{totalSteps} steps ({progressPercent}%)
          </span>
        </div>
        <div
          style={{
            height: "1rem",
            border: "1px solid #808080",
            background: "#fff",
            boxShadow: "inset 1px 1px 0 #000",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progressPercent}%`,
              maxWidth: "100%",
              background: "#135bec",
              transition: "width 0.2s ease",
            }}
          />
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flex: 1,
          minHeight: 0,
          border: "1px solid #000",
          backgroundColor: "#fff",
          overflow: "hidden",
        }}
      >
        {/* Sidebar: Project Sections — own scroll area */}
        <aside
          style={{
            width: "12rem",
            minWidth: "12rem",
            flexShrink: 0,
            minHeight: 0,
            borderRight: "1px solid #000",
            backgroundColor: "#f6f6f6",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "0.5rem 0.75rem",
              borderBottom: "1px solid #000",
              backgroundColor: "#e0e0e0",
              fontSize: "0.625rem",
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            Project Sections
          </div>
          <nav
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              padding: "0.25rem 0",
            }}
          >
            {sections.map((sec) => {
              const stepIds = sec.rows.flatMap((r) => r.steps.map((s) => s.id));
              const done = stepIds.filter((sid) =>
                progress.steps.some((s) => stepIdEq(s.stepId, sid) && s.completed)
              ).length;
              const total = stepIds.length;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setSelectedSectionId(sec.id)}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "0.5rem 0.75rem",
                    textAlign: "left",
                    fontSize: "0.75rem",
                    fontWeight: selectedSectionId === sec.id ? 700 : 400,
                    border: "none",
                    background:
                      selectedSectionId === sec.id ? "#135bec" : "transparent",
                    color: selectedSectionId === sec.id ? "#fff" : "#000",
                    cursor: "pointer",
                  }}
                >
                  {sec.title}
                  {total > 0 && (
                    <span
                      style={{
                        display: "block",
                        fontSize: "0.625rem",
                        opacity: selectedSectionId === sec.id ? 0.9 : 0.7,
                        marginTop: "0.125rem",
                      }}
                    >
                      {done}/{total} 완료
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main: one scroll area; section progress sticky at top of this scroll */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Section progress: sticky when scrolling steps */}
            <div
              style={{
                position: "sticky",
                top: 0,
                zIndex: 5,
                flexShrink: 0,
                padding: "0.5rem 1rem",
                borderBottom: "1px solid #000",
                backgroundColor: "#e0e0e0",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <span style={{ fontSize: "0.75rem", fontWeight: 700 }}>
                {currentSection
                  ? `Section: ${currentSection.title} (${currentSectionCompleted}/${currentSectionTotal} 완료)`
                  : "섹션을 선택하세요"}
              </span>
            </div>

            {/* Step list — scrolls; section progress sticks above */}
            <div
              style={{
                padding: "1rem 1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
            {!currentSection && (
              <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                왼쪽에서 섹션을 선택하세요.
              </p>
            )}
            {currentSection?.rows.map((row) =>
              row.steps.map((step) => {
                const stepProg = getStepProgress(progress.steps, String(step.id));
                const completed = stepProg?.completed ?? false;
                const repeatCount = stepProg?.repeatCount ?? null;
                const isUpdating = stepIdEq(updating ?? "", step.id);
                const isActive = stepIdEq(progress.currentStepId ?? "", step.id);

                const isFuture = !completed && !isActive;
                return (
                  <div
                    key={step.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "1rem",
                      padding: "0.75rem 1rem",
                      border: "1px solid #000",
                      backgroundColor: completed
                        ? "#f0f0f0"
                        : isActive
                          ? "#f0f4ff"
                          : "#fff",
                      boxShadow: isActive
                        ? "inset 1px 1px 0 #000, inset -1px -1px 0 #808080"
                        : "none",
                      opacity: isFuture ? 0.6 : 1,
                    }}
                  >
                    <div style={{ flexShrink: 0, marginTop: "2px" }}>
                      <input
                        type="checkbox"
                        checked={completed}
                        disabled={isUpdating}
                        onChange={(e) =>
                          updateStep(String(step.id), {
                            completed: e.target.checked,
                            repeatCount,
                          })
                        }
                        aria-label={`${step.instruction} 완료`}
                        style={{
                          width: "1.25rem",
                          height: "1.25rem",
                          border: "2px solid #000",
                          accentColor: "#135bec",
                        }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: 700,
                          margin: 0,
                          textDecoration: completed ? "line-through" : "none",
                          color: completed ? "#6b7280" : "#000",
                        }}
                      >
                        {step.instruction}
                      </h3>
                      {row.instructions && (
                        <p
                          style={{
                            fontSize: "0.75rem",
                            color: "#6b7280",
                            margin: "0.25rem 0 0 0",
                          }}
                        >
                          {row.instructions}
                          {row.repeat != null ? ` (×${row.repeat})` : ""}
                        </p>
                      )}
                      {step.stitchCount != null && (
                        <p
                          style={{
                            fontSize: "0.75rem",
                            color: "#6b7280",
                            margin: "0.125rem 0 0 0",
                          }}
                        >
                          {step.stitchCount} st
                        </p>
                      )}
                      {row.repeat != null && (
                        <div
                          style={{
                            marginTop: "0.5rem",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            padding: "0.375rem 0.5rem",
                            backgroundColor: "#e0e0e0",
                            border: "1px solid #000",
                            boxShadow: "1px 1px 0 #000",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "0.6875rem",
                              fontWeight: 700,
                              paddingRight: "0.25rem",
                            }}
                          >
                            Repeat Progress:
                          </span>
                          <button
                            type="button"
                            disabled={isUpdating || (repeatCount ?? 0) <= 0}
                            onClick={() =>
                              updateStep(String(step.id), {
                                completed,
                                repeatCount: Math.max(
                                  0,
                                  (repeatCount ?? 0) - 1
                                ),
                              })
                            }
                            className="btn"
                            style={{
                              width: "1.5rem",
                              height: "1.5rem",
                              padding: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.875rem",
                            }}
                            aria-label="한 번 줄이기"
                          >
                            −
                          </button>
                          <div
                            style={{
                              minWidth: "3rem",
                              padding: "0.25rem 0.5rem",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              textAlign: "center",
                              border: "1px solid #000",
                              background: "#fff",
                            }}
                          >
                            {repeatCount ?? 0} / {row.repeat}
                          </div>
                          <button
                            type="button"
                            disabled={
                              isUpdating ||
                              (repeatCount ?? 0) >= (row.repeat ?? 0)
                            }
                            onClick={() =>
                              updateStep(String(step.id), {
                                completed,
                                repeatCount: Math.min(
                                  row.repeat ?? 0,
                                  (repeatCount ?? 0) + 1
                                ),
                              })
                            }
                            className="btn"
                            style={{
                              width: "1.5rem",
                              height: "1.5rem",
                              padding: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.875rem",
                            }}
                            aria-label="한 번 늘리기"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: "0.5rem",
                        alignSelf: "center",
                      }}
                    >
                      {completed && (
                        <span
                          style={{
                            fontSize: "0.625rem",
                            fontWeight: 700,
                            color: "#166534",
                            textTransform: "uppercase",
                          }}
                        >
                          Completed
                        </span>
                      )}
                      {isActive && !completed && (
                        <>
                          <span
                            style={{
                              fontSize: "0.625rem",
                              fontWeight: 700,
                              color: "#135bec",
                              fontStyle: "italic",
                              textTransform: "uppercase",
                            }}
                          >
                            Active Step
                          </span>
                          <div
                            style={{
                              display: "flex",
                              gap: "0.5rem",
                              marginTop: "0.25rem",
                            }}
                          >
                            {hasPrevStep && (
                              <button
                                type="button"
                                onClick={goToPrevStep}
                                disabled={movingStep !== null}
                                className="btn"
                                style={{
                                  fontSize: "0.6875rem",
                                  padding: "0.25rem 0.5rem",
                                }}
                              >
                                {movingStep === "prev" ? "…" : "← 이전"}
                              </button>
                            )}
                            {hasNextStep && (
                              <button
                                type="button"
                                onClick={goToNextStep}
                                disabled={movingStep !== null}
                                className="btn"
                                style={{
                                  fontSize: "0.6875rem",
                                  padding: "0.25rem 0.5rem",
                                }}
                              >
                                {movingStep === "next"
                                  ? "…"
                                  : "다음으로 넘어가기 →"}
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
