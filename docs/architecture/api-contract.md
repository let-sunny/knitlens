# API Contracts

This document defines JSON-only contracts for server routes.

All endpoints:

- accept and return JSON
- must not stream partial tokens to the client
- must validate input and output against schemas.

---

## Shared Schemas

These shapes are shared across multiple endpoints.

### Question

```json
{
  "id": "q_size",
  "text": "Which size are you knitting?",
  "type": "choice",
  "options": ["S", "M", "L"]
}
```

Question
- id: string
- text: string
- type: "choice" | "number" | "text"
- options: string[] | null

### Answer

```json
{
  "questionId": "q_size",
  "value": "M"
}
```

Answer
- questionId: string
- value: string | number

### Section / Row / Step

These shapes align with the `Pattern`, `Section`, `Row`, and `Step` types in the data model.

Section
- id: string
- title: string
- order: number
- rows: Row[]

Row
- id: string
- order: number
- instructions: string
- repeat: number | null
- notes: string | null
- steps: Step[]

Step
- id: string
- order: number
- instruction: string
- stitchCount: number | null

---

## POST /api/pattern/analyze

Purpose  
Analyze extracted knitting pattern text using the LLM and generate an initial structured representation.

Notes
- `patternText` is obtained by the server from the uploaded PDF (text extraction step), not typed by the user directly.
- This route may also return clarification questions if ambiguity is detected.

Request

```json
{
  "projectId": "project_1",
  "patternText": "raw extracted text"
}
```

Request fields
- projectId: string
- patternText: string

Response (success)

```json
{
  "patternId": "pattern_1",
  "sections": [
    {
      "id": "section_body",
      "title": "Body",
      "order": 1,
      "rows": []
    }
  ],
  "questions": [
    {
      "id": "q_size",
      "text": "Which size are you knitting?",
      "type": "choice",
      "options": ["S", "M", "L"]
    }
  ]
}
```

Response fields
- patternId: string
- sections: Section[]
- questions: Question[] (empty if no clarification needed)

Error response

```json
{
  "error": "analysis_failed",
  "message": "Pattern analysis failed"
}
```

---

## POST /api/pattern/clarify

Purpose  
Generate clarification questions or continue an existing clarification loop.

Typical flow
- Client sends current pattern id and any existing answers.
- Server calls the LLM to determine whether more clarification is needed.

Request

```json
{
  "patternId": "pattern_1",
  "answers": [
    {
      "questionId": "q_size",
      "value": "M"
    }
  ]
}
```

Request fields
- patternId: string
- answers: Answer[]

Response (more clarification needed)

```json
{
  "questions": [
    {
      "id": "q_length",
      "text": "Do you want the body longer than specified?",
      "type": "choice",
      "options": ["No", "+2cm", "+5cm"]
    }
  ]
}
```

Response (clarification complete)

```json
{
  "questions": []
}
```

Error response

```json
{
  "error": "invalid_clarification_payload",
  "message": "Answer list is invalid"
}
```

---

## POST /api/pattern/compile

Purpose  
Compile the final structured pattern using the original pattern text and all clarification answers.

Request

```json
{
  "patternId": "pattern_1",
  "answers": [
    {
      "questionId": "q_size",
      "value": "M"
    }
  ]
}
```

Request fields
- patternId: string
- answers: Answer[]

Response (success)

```json
{
  "patternId": "pattern_1",
  "sections": [
    {
      "id": "section_body",
      "title": "Body",
      "order": 1,
      "rows": [
        {
          "id": "row_1",
          "order": 1,
          "instructions": "K2, P2 across",
          "repeat": null,
          "notes": null,
          "steps": [
            {
              "id": "step_1",
              "order": 1,
              "instruction": "Knit 2 stitches",
              "stitchCount": 2
            }
          ]
        }
      ]
    }
  ]
}
```

Error response

```json
{
  "error": "pattern_compilation_failed",
  "message": "AI output failed validation"
}
```

---

## GET /api/projects/[id]

Purpose  
Return the full project state required for the `/projects/[id]` tracker screen.

Path params
- id: string (project id)

Response (success)

```json
{
  "project": {
    "id": "project_1",
    "title": "Raglan Sweater",
    "patternPdfUrl": "https://...",
    "rawPatternText": "original extracted text",
    "status": "compiled",
    "createdAt": "2026-03-12T10:00:00Z",
    "updatedAt": "2026-03-12T12:00:00Z"
  },
  "pattern": {
    "id": "pattern_1",
    "projectId": "project_1",
    "title": "Raglan Sweater",
    "notes": "Converted from PDF",
    "sections": []
  },
  "progress": {
    "projectId": "project_1",
    "currentSectionId": "section_body",
    "currentRowId": "row_1",
    "currentStepId": "step_1",
    "steps": [
      {
        "stepId": "step_1",
        "completed": false,
        "repeatCount": null
      }
    ]
  }
}
```

Error response

```json
{
  "error": "project_not_found",
  "message": "Project not found"
}
```

---

## POST /api/projects/[id]/progress

Purpose  
Update project progress for the tracker screen.

Path params
- id: string (project id)

Request (mark step complete or update repeat count)

```json
{
  "stepId": "step_1",
  "completed": true,
  "repeatCount": 3
}
```

Request fields
- stepId: string
- completed: boolean
- repeatCount: number | null

Response (success)

```json
{
  "projectId": "project_1",
  "currentSectionId": "section_body",
  "currentRowId": "row_1",
  "currentStepId": "step_2",
  "steps": [
    {
      "stepId": "step_1",
      "completed": true,
      "repeatCount": 3
    }
  ]
}
```

Error response

```json
{
  "error": "progress_update_failed",
  "message": "Could not update project progress"
}
```

---

## Error Response Shape

All error responses should follow this shape.

```json
{
  "error": "error_code",
  "message": "Human-readable description"
}
```