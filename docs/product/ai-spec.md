# AI Specification

## AI Responsibilities

The AI performs three main tasks.

1. Pattern Analysis
2. Clarification Question Generation
3. Pattern Compilation

All responses must follow JSON-only output.

## Pattern Analysis

Purpose

Convert raw pattern text into a structured representation.

Input

{
"patternText": string
}

Output (simplified)

{
"sections": [
{
"title": "Body",
"rows": [
{
"instructions": "K2, P2 across"
}
]
}
]
}

If the pattern contains ambiguity, the AI must generate clarification questions.

## Clarification Questions

Questions are generated when the pattern text is ambiguous.

Question schema

{
"id": string,
"text": string,
"type": "choice" | "number" | "text",
"options": string[] | null
}

Example

{
"id": "q_size",
"text": "Which size are you knitting?",
"type": "choice",
"options": ["S", "M", "L"]
}

## Clarification Answers

User responses follow this schema.

{
"questionId": string,
"value": string | number
}

Example

{
"questionId": "q_size",
"value": "M"
}

## Pattern Compilation

Purpose

Generate the final structured pattern using:

- original pattern text
- clarification answers

Input

{
"patternText": string,
"answers": [
{
"questionId": string,
"value": string | number
}
]
}

Output

{
"sections": [
{
"id": string,
"title": string,
"rows": [
{
"id": string,
"instructions": string,
"steps": [
{
"instruction": string,
"stitchCount": number | null
}
]
}
]
}
]
}

## AI Constraints

AI responses must follow these rules.

- JSON only
- schema must be valid
- no explanation text
- deterministic structure

## Validation

Server routes must validate AI output before accepting it.

Validation flow

LLM Response
↓
JSON parse
↓
Schema validation
↓
Accept or reject

Invalid responses must return structured errors.

Example

{
"error": "invalid_ai_output",
"message": "AI response failed schema validation"
}
