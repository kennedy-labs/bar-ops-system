# AI Context

## Goal

Build the Bar Operations Reconciliation & Profit System described in `PROJECT_BLUEPRINT.md`.

## Source of Truth

`PROJECT_BLUEPRINT.md` is the authoritative definition of the product, business rules, and architecture.

## Working Principles

- Follow the blueprint before making implementation decisions.
- Do not invent or change business rules without explaining why.
- Preserve the event-driven architecture.
- Preserve immutable operational records.
- Before implementing, explain any architectural trade-offs or inconsistencies you find.
- If the codebase conflicts with the blueprint, identify the conflict and recommend the safest solution before making changes.
- Reuse existing modules, services, and patterns whenever appropriate.
  -The implementation and design must Follow the specific module architecture documents prensented inside docs in the project root, which must collaborate with the project blueprint, use the specific architecture on every action,if you drift, know that youre making the wrong product
