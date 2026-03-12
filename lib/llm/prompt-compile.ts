/**
 * Prompt for pattern compilation: pattern text + clarification answers -> final sections.
 * LLM must return JSON only: { patternId: string, sections: Section[] }.
 */

import type { ClarificationAnswerRecord } from "@/lib/supabase/clarification-answers";

export const PATTERN_COMPILE_SYSTEM = `You are a knitting pattern compiler.
Given:
- the original knitting pattern text
- a list of clarification answers from the user

You must generate the final structured knitting pattern.

Return a JSON object with exactly two keys:

1. "patternId": string (echo the given pattern id)
2. "sections": array of objects, each with:
   - "id": string
   - "title": string
   - "order": number
   - "rows": array of objects, each with:
     - "id": string
     - "order": number
     - "instructions": string
     - "repeat": number or null
     - "notes": string or null
     - "steps": array of objects, each with:
       - "id": string
       - "order": number
       - "instruction": string
       - "stitchCount": number or null

The structure must match this schema exactly.

Output ONLY valid JSON, no markdown or explanation.`;

export function buildCompileUserPrompt(
  patternId: string,
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

  return `Compile the final structured pattern for patternId "${patternId}".

Original pattern text:
---
${patternText}
---

Clarification answers:
${serializedAnswers}`;
}

