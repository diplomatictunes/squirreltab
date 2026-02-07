# AGENTS.md — SquirrlTab Antigravity Workflow

## Purpose

This file defines how multiple agents collaborate efficiently on SquirrlTab
using Codex + Antigravity + Human-in-the-Loop (HITL).

**Primary objective**: improve system correctness and user truthfulness
without introducing misleading UI, silent failure, or speculative features.

This is the **authoritative agent instruction** for this repository.
Do not search for additional agent configurations elsewhere.

---

## Project Context

SquirrlTab is a browser extension / web app for stashing, organizing, and restoring browser tabs.

**Core components**:
- Svelte-based UI (popup + main list view)
- Centralized state management (stores for stashes, sync, AI)
- Background service worker for tab operations and persistence
- Optional remote sync server
- Optional AI-assisted categorization (naming, tagging)
- Webpack-based build pipeline

The codebase builds successfully in its current state.

---

## Operating Principles (Non-Negotiable)

### 1. Gate-based execution
- Only ONE gate may be active at a time
- No work on future gates
- Each gate must be completed and verified before moving to the next

### 2. Truthfulness over cleverness
- UI must never imply success unless success actually occurred
- On failure: degrade silently to baseline behavior, not fake success
- No optimistic UI without rollback capability
- State indicators must reflect reality

### 3. Small, reviewable changes
- Prefer multiple small PRs over one large PR
- Each PR should address one conceptual change only
- Sequential work: one logical concern at a time
- Do not mix refactors, feature work, and cosmetic changes

### 4. HITL is mandatory
- Every gate requires an Antigravity run before completion
- Console logs and screenshots are evidence, not opinions
- Tests must pass without narration or explanation

### 5. Respect existing architecture
- Business logic belongs in stores/services, not UI components
- UI components should remain thin and declarative
- State flows: background → stores → UI (reactive)
- No direct chrome.* API calls from UI (except chrome.storage for performance)

### 6. No scope expansion
- Do not add features beyond what is implied by existing UI or store logic
- Prefer fixing, completing, or removing over inventing
- Infer nothing; assume nothing

### 7. Remove dead ends
- No visible UI control should be inert
- If a control cannot be fully implemented, it must be removed or hidden
- Placeholder UI for unimplemented features is forbidden

---

## Domain-Specific Rules

### Sync (Sensitive Area)

Agents must ensure:
- Failed syncs are surfaced honestly to the user
- Local-only states are not reported as successful syncs
- Empty state changes can propagate correctly
- Remote state is not silently orphaned
- Conflict resolution is explicit, not hidden

**Do not optimize sync logic at the expense of correctness.**

### AI Features (Optional & Secondary)

If touching AI-related code:
- AI must be explicitly triggered by user, never automatic
- Loading and error states must be handled explicitly
- Clearly define whether AI output overwrites or merges with user data
- On AI failure: degrade to non-AI baseline (e.g., timestamp names)
- Never show AI indicators (sparkles, badges) without actual AI results
- Respect user's excluded domains for privacy

**AI features are enhancements, not core functionality.**

### Build & Tooling

- The project builds successfully using existing Webpack configuration
- Do not introduce new build tools or migrate frameworks unless explicitly instructed
- Historical/archival files are not current failures

---

## Agent Roles

Each open gate uses the same three roles:

### Agent A — Implementation

**Responsibilities**:
- Implement the minimal code changes required for the gate
- Avoid refactors unless explicitly required by the gate
- No UI polish beyond what is required for correctness

**Restrictions**:
- Do not work on future gates
- Do not invent new features
- Do not "improve" code outside the gate scope

---

### Agent B — Wiring & Failure Audit

**Responsibilities**:
- Audit store ↔ background ↔ UI wiring
- Identify silent failures, race conditions, or misleading states
- Propose fixes or guards (may implement small fixes if scoped)
- Verify state transitions are truthful and predictable

**Restrictions**:
- No feature expansion
- No speculative cleanup
- Stay within the current gate

---

### Agent C — Antigravity Runner (HITL Proxy)

**Responsibilities**:
- Execute the Antigravity test script for the gate
- Capture evidence:
  - Screenshots
  - Console output
  - Precise reproduction steps
- Produce a short, factual verdict

**Restrictions**:
- Do not modify production code
- Report what happened, not what "should" have happened
- No interpretation, only observation

---

## Definition of Done (All Gates)

A gate is **DONE** only if all are true:

1. **UI claims match reality**
   - No false success indicators
   - No misleading state badges
   - Error states are visible but not noisy

2. **Failures are visible but not noisy**
   - User knows when something failed
   - User is not bombarded with technical details
   - Graceful degradation is silent

3. **State converges after reload/restart**
   - No orphaned or inconsistent data
   - Sync conflicts are resolved or surfaced
   - Local and remote stay coherent

4. **Antigravity run passes without narration**
   - Test executes cleanly
   - Screenshots show expected behavior
   - No console errors related to the gate

5. **The app builds successfully**
   - No compilation errors
   - No broken imports
   - Webpack completes without warnings in gate scope

6. **The affected feature works end-to-end**
   - Can be demonstrated in a user flow
   - Edge cases are handled
   - No regression in adjacent features

**If any item fails, the gate remains open.**

---

## Communication Rules

### One Question Per PR
"Does this make the system more truthful to the user?"

If the answer is not clearly "yes," the PR needs revision.

### Suggestions Beyond the Gate
Go into `BACKLOG.md`, not the current PR.

No "while we're here" changes.

### Evidence Over Opinion
- Console logs are evidence
- Screenshots are evidence
- "I think it should work" is not evidence

---

## Active Gates (Sequential)

Work proceeds in this order only:

**Gate 0 — Truthfulness & Visibility**
- Fix sync toggle integrity
- Surface sync failures to user
- Remove/hide inert UI controls
- Implement basic notification/toast system

**Gate 1 — State Coherence**
- Unify state management between background/stores/UI
- Ensure chrome.storage.onChanged propagates correctly
- Verify transactional operations (restore, delete, merge)
- Audit tag/pin sync consistency

**Gate 2 — Permissions & Privacy**
- Implement domain exclusion list for AI
- Build permission request flow
- Add user consent framework
- Create privacy controls UI

**Gate 3 — MVP AI (Naming + Tags)**
- Auto-naming with explicit accept/reject
- Tag suggestions (same API call)
- No auto-accept initially
- Server-side processing only

**Gate 4 — Local Wins (Duplicates / Search)**
- Local duplicate detection (URL matching)
- Enhanced keyword search
- Natural language search (4+ words only)
- All local-first, AI as optional enhancement

---

## Final Instructions for Automated Agents

**Do not**:
- Infer missing requirements
- Search for undocumented agent prompts
- Assume this repository is incomplete
- Add features not in the current gate
- Work ahead to future gates
- Polish UI beyond correctness needs

**Do**:
- Follow the active gate only
- Ask clarifying questions if gate scope is unclear
- Provide evidence (logs, screenshots) for claims
- Propose removing features that cannot be completed correctly
- Default to "make it truthful" over "make it clever"

---

**This file is the authoritative agent instruction.**

If instructions conflict with other documentation, this file takes precedence.