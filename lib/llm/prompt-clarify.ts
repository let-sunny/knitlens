/**
 * Prompt for pattern clarification: pattern text + answers -> follow-up questions.
 * LLM must return JSON only: { questions: Question[] }
 */

import type { ClarificationAnswerRecord } from "@/lib/supabase/clarification-answers";

export const PATTERN_CLARIFY_SYSTEM = `You are a knitting pattern assistant.
Given:
- the original knitting pattern text
- a list of clarification answers from the user

You must decide whether more clarification is needed.

Return a JSON object with exactly one key:

1. "questions": array of clarification questions if more clarification is needed.
   Each question has:
   - "id": string (e.g. "q_size")
   - "text": string
   - "type": "choice" | "number" | "text"
   - "options": array of strings or null (required for "choice", null for "number"/"text")

If the pattern is now fully specified, return "questions": [].

Output ONLY valid JSON, no markdown or explanation.`;

export function buildClarifyUserPrompt(
  patternText: string,
  answers: ClarificationAnswerRecord[]
): string {
  const serializedAnswers = JSON.stringify(
    answers.map((a) => ({
      questionId: a.questionId,
      value: a.value,
    })),
    null,
    2
  );

  return `The following is the original knitting pattern text, followed by the user's clarification answers.
Decide if you need to ask any more clarification questions.

Pattern text:
---
${patternText}
---

Clarification answers:
${serializedAnswers}`;
}

