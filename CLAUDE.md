# Plinko — project guide

## What this is
- A browser Plinko game built with TypeScript + PixiJS v8, as a portfolio project.
- Outcome is decided first (seeded RNG → ball path → multiplier), animation only plays it back.
- Spec lives in SPEC.md, task list in TASKS.md. Work only on the task I name.

## Stack
- Vite, TypeScript (strict), PixiJS v8, Vitest, ESLint + Prettier.
- No other runtime dependencies without asking me first.

## Commands
- Install: `npm install`
- Dev server: `npm run dev`
- Tests: `npm test`
- Lint: `npm run lint`
- Typecheck: `npm run typecheck`

## Structure
- `src/core/` — pure game logic (RNG, path, payouts). No PixiJS imports here. Fully unit-tested.
- `src/view/` — PixiJS rendering and animation. Reads state, never decides outcomes.
- `src/ui/` — controls, balance, bet panel.
- `src/main.ts` — wiring only.

## How to work with me
- Small steps. One task = a few files at most. If a task is bigger, propose a split first.
- Before writing code for anything non-trivial, show a short plan and wait for my OK.
- For logic in `src/core/`: write the tests first, show them to me, then implement.
- After each change: run typecheck, lint and tests, and tell me the results honestly. Never say "done" if something fails.
- Do not commit. I review the diff and commit myself.
- Explain non-obvious decisions in 1–2 sentences. I am learning, so name the PixiJS v8 API you use when it differs from v7.

## Code style
- Named exports, no default exports.
- No `any`. Prefer small pure functions in core.
- Magic numbers go into `src/config.ts`.
- Comments only where the "why" isn't obvious.
