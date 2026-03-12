# KnitLens — Product One Pager

## Product Overview
KnitLens is an AI‑assisted knitting project tracker that converts narrative knitting patterns into structured step-by-step workflows.

Users upload a PDF knitting pattern. The system:
1. extracts narrative text from the PDF
2. analyzes the extracted pattern using an LLM
3. asks clarification questions when instructions are ambiguous
4. compiles the pattern into structured steps
5. allows the user to track progress while knitting

The goal is to make long narrative knitting patterns easier to follow and manage.

## Problem
Most knitting patterns are written as long narrative instructions.  
Typical issues:

- Hard to remember which row or section the user is currently on
- Repeated instructions are mentally difficult to track
- Conditional logic for sizes is confusing
- Users manually track progress using paper or markers

Example pattern instructions:
- "Repeat rows 3–6 five times."
- "For size M increase every 4 rows."
- "Continue until piece measures 20 cm."

These instructions are readable but not structured for step tracking.

## Solution
KnitLens converts narrative patterns into structured workflows.

Flow:

Pattern text  
→ AI interpretation  
→ clarification questions  
→ compiled structured steps  
→ interactive knitting tracker

## Target Users
Primary:
- Hobby knitters using written patterns
- Intermediate knitters working on garments

Secondary:
- Beginners learning to interpret patterns
- Knitters working with complex projects

## Core User Flow
1. Create Project
   - Upload PDF pattern file
   - Enter project title
   - Optional size selection

2. Pattern Text Extraction
   - Extract narrative instructions from the uploaded PDF

3. AI Pattern Analysis
   - From extracted text, identify sections, rows, repeats, conditions

4. Clarification
   - Resolve ambiguous instructions through questions

5. Pattern Compilation
   - Generate structured steps

6. Project Tracker
   - User marks steps as complete while knitting

## MVP Scope
Included:
- Pattern PDF upload
- Text extraction from PDF
- AI interpretation
- Clarification loop
- Step compilation
- Progress tracker

Excluded:
- Pattern image parsing
- Multi-user collaboration
- Advanced analytics

## Success Criteria
- Users can convert a narrative pattern into a structured tracker
- AI clarification reduces ambiguity
- Progress tracking works reliably