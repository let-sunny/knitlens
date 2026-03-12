# Project State Machine

## Project Lifecycle

Each knitting project moves through the following lifecycle.

draft
↓
analyzing
↓
clarification (optional)
↓
compiled

## State Definitions

draft  
The project has been created but no analysis has started.

Triggered by

User uploads pattern PDF

analyzing  
The system is extracting pattern structure from the uploaded text.

Triggered by

POST /api/pattern/analyze

clarification  
The AI requires answers to clarification questions.

Triggered when

Pattern analysis detects ambiguity.

compiled  
The final structured pattern has been generated.

Triggered by

POST /api/pattern/compile

At this stage the project tracker becomes available.

## Allowed Transitions

draft → analyzing

analyzing → clarification

analyzing → compiled

clarification → compiled

## Invalid Transitions

compiled → analyzing

This transition should be rejected by the API.

## Implementation Notes

When project status changes:

- update Project.status
- update Project.updatedAt

Optional status history

{
"status": "clarification",
"changedAt": "2026-03-12T12:30:00Z"
}
