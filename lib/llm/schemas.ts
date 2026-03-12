/**
 * Runtime validation for pattern analyze LLM output.
 */

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
  steps: unknown[];
}

export interface QuestionShape {
  id: string;
  text: string;
  type: "choice" | "number" | "text";
  options: string[] | null;
}

export interface AnalyzeOutputShape {
  sections: SectionShape[];
  questions: QuestionShape[];
}

function isSection(x: unknown): x is SectionShape {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.title === "string" &&
    typeof o.order === "number" &&
    Array.isArray(o.rows)
  );
}

function isRow(x: unknown): x is RowShape {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.order === "number" &&
    typeof o.instructions === "string" &&
    (o.repeat === null || typeof o.repeat === "number") &&
    (o.notes === null || typeof o.notes === "string") &&
    Array.isArray(o.steps)
  );
}

function isQuestion(x: unknown): x is QuestionShape {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  const type = o.type;
  if (type !== "choice" && type !== "number" && type !== "text") return false;
  return (
    typeof o.id === "string" &&
    typeof o.text === "string" &&
    (o.options === null ||
      (Array.isArray(o.options) &&
        o.options.every((v) => typeof v === "string")))
  );
}

export function validateAnalyzeOutput(raw: unknown): AnalyzeOutputShape {
  if (!raw || typeof raw !== "object") {
    throw new Error("AI output is not an object");
  }
  const o = raw as Record<string, unknown>;
  if (!Array.isArray(o.sections))
    throw new Error("AI output missing or invalid sections");
  if (!Array.isArray(o.questions))
    throw new Error("AI output missing or invalid questions");

  const sections = o.sections as unknown[];
  const questions = o.questions as unknown[];

  for (const s of sections) {
    if (!isSection(s)) throw new Error("Invalid section shape");
    for (const r of s.rows) {
      if (!isRow(r)) throw new Error("Invalid row shape in section");
    }
  }
  for (const q of questions) {
    if (!isQuestion(q)) throw new Error("Invalid question shape");
  }

  return {
    sections: sections as SectionShape[],
    questions: questions as QuestionShape[],
  };
}
