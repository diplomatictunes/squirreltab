# AGENTS.md

This repository is actively maintained and does not rely on external agent configuration
beyond what is documented here.

## Purpose of this file

This file exists to:

- Declare how automated coding agents (e.g. Codex) should operate in this repository
- Prevent agents from searching for missing or implied instructions
- Define scope, priorities, and constraints clearly

If you are an automated agent: **do not look for additional agent instructions elsewhere**.

---

## Project Overview

This is a browser extension / web app for stashing, organising, and restoring browser tabs.
It includes:
- A Svelte-based UI
- Centralised state management for lists, tags, pinning, restore semantics
- Optional remote sync and AI-assisted categorisation
- A Webpack-based build pipeline

The codebase builds successfully in its current state.

---

## Agent Operating Rules

When making changes, agents must follow these rules:

1. **Sequential work**
   - Work on one logical concern at a time.
   - Do not mix refactors, feature work, and cosmetic changes in the same step.

2. **No scope expansion**
   - Do not add new features beyond what is already implied by the UI or existing store logic.
   - Prefer fixing, completing, or removing over inventing.

3. **Truth over appearance**
   - Behavioural correctness and truthful state (especially sync state) take priority over UI polish.
   - The app must not claim actions succeeded when they did not.

4. **Remove dead ends**
   - No visible UI control should be inert.
   - If a control cannot be fully implemented, it should be removed or hidden.

5. **Respect existing architecture**
   - Business logic belongs in stores/services, not UI components.
   - UI components should remain thin and declarative.

---

## Sync-Specific Guidance

Sync is a sensitive area.

Agents must ensure:
- Failed syncs are surfaced honestly
- Local-only states are not reported as successful syncs
- Empty state changes can propagate correctly
- Remote state is not silently orphaned

Do not optimise sync logic at the expense of correctness.

---

## AI Features

AI-assisted categorisation is optional and secondary.

If touching AI-related code:
- Do not make it automatic or implicit
- Ensure users trigger it deliberately
- Clearly define whether AI output overwrites or merges with user data
- Handle loading and error states explicitly

---

## Build & Tooling

- The project builds successfully using the existing Webpack configuration.
- Do not introduce new build tools or migrate frameworks unless explicitly instructed.
- Historical or archival files (e.g. old build logs) should not be treated as current failures.

---

## Definition of Done (for any agent task)

A task is done only if:
- The app builds successfully
- The affected feature works end-to-end
- The UI does not imply unavailable functionality
- State transitions are truthful and predictable

---

## Final Note for Automated Agents

Do not infer missing requirements.
Do not search for undocumented agent prompts.
Do not assume this repository is incomplete because this file exists.

This file is the authoritative agent instruction.
