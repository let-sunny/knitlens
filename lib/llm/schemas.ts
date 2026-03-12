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
  steps: StepShape[];
}

export interface StepShape {
  id: string;
  order: number;
  instruction: string;
  stitchCount: number | null;
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

export interface ClarifyOutputShape {
  questions: QuestionShape[];
}

export interface CompileOutputShape {
  patternId: string;
  sections: SectionShape[];
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
    Array.isArray(o.steps) &&
    o.steps.every((s: unknown) => isStep(s))
  );
}

function isStep(x: unknown): x is StepShape {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.order === "number" &&
    typeof o.instruction === "string" &&
    (o.stitchCount === null || typeof o.stitchCount === "number")
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

export function validateClarifyOutput(raw: unknown): ClarifyOutputShape {
  if (!raw || typeof raw !== "object") {
    throw new Error("AI output is not an object");
  }
  const o = raw as Record<string, unknown>;
  if (!Array.isArray(o.questions)) {
    throw new Error("AI output missing or invalid questions");
  }
  const questions = o.questions as unknown[];
  for (const q of questions) {
    if (!isQuestion(q)) throw new Error("Invalid question shape");
  }
  return { questions: questions as QuestionShape[] };
}

export function validateCompileOutput(raw: unknown): CompileOutputShape {
  if (!raw || typeof raw !== "object") {
    throw new Error("AI output is not an object");
  }
  const o = raw as Record<string, unknown>;
  if (typeof o.patternId !== "string" || !o.patternId.trim()) {
    throw new Error("AI output missing or invalid patternId");
  }
  if (!Array.isArray(o.sections)) {
    throw new Error("AI output missing or invalid sections");
  }
  const sections = o.sections as unknown[];
  for (const s of sections) {
    if (!isSection(s)) throw new Error("Invalid section shape");
    for (const r of (s as SectionShape).rows) {
      if (!isRow(r)) throw new Error("Invalid row shape in section");
    }
  }
  return {
    patternId: o.patternId.trim(),
    sections: sections as SectionShape[],
  };
}
