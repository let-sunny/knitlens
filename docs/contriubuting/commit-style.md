# Commit Style Guide

This document defines the commit message format used in the KnitLens repository.

The goal is to keep commit history readable and consistent.

## Format

type(scope): summary

Examples

feat(project): add project creation screen
feat(ai): implement pattern analysis route
fix(tracker): correct step toggle logic
refactor(data): reorganize Supabase helpers
docs(architecture): update data model documentation
chore: update dependencies

## Allowed Types

feat  
A new feature.

fix  
A bug fix.

refactor  
Code changes that do not add features or fix bugs.

docs  
Documentation updates.

chore  
Maintenance work such as dependency updates.

test  
Tests or test configuration.

## Guidelines

Keep summaries short and descriptive.

Use present tense.

Good example:

feat(project): add PDF pattern upload

Bad example:

added project screen

## Scope Examples

project  
ai  
ui  
tracker  
data  
api  
docs
