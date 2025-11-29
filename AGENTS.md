# Repository Guidelines

## Project Structure & Module Organization
- Root contains the React/TypeScript UI in `main.tsx`, a minimal `README.md`, and `LICENSE`. No subfolders or build artifacts are checked in.
- All UI logic, color utilities, and layout live inside `main.tsx`. If you split files, group utilities (color math, palette generation) separately from components (controls, preview cards) to keep render code lean.
- Use `.gitignore` as the source of truth for generated outputs (`node_modules/`, caches, coverage).

## Build, Test, and Development Commands
- The repo is currently scaffold-free; drop `main.tsx` into your preferred React+TS toolchain (e.g., Vite). Quick start:
  ```
  npm create vite@latest terminal-color-architect -- --template react-ts
  cd terminal-color-architect
  cp ../main.tsx src/main.tsx
  npm install
  npm run dev
  ```
- If you add bundler configs, document the final commands in `README.md` and keep `npm run dev`, `npm run build`, and `npm test` wired to your chosen stack.

## Coding Style & Naming Conventions
- Use functional React components with hooks; keep state minimal and colocated.
- Prefer 2-space indentation, single quotes, trailing semicolons, and arrow functions for callbacks/utilities.
- Name color utilities verbosely (`oklchToHex`, `copyAllJSON`) and components with PascalCase.
- Keep derived values memoized (`useMemo`) and side effects contained (`useEffect`).

## Testing Guidelines
- No automated tests exist yet. Add unit tests around color conversions and palette strategies before refactoring those functions.
- Recommended stack: Vitest or Jest for utilities; Playwright/Cypress for UI regressions once routes/pages appear.
- Name tests after behavior (`colorMath.spec.ts`, `palette-copy.e2e.ts`) and ensure they run headlessly.

## Commit & Pull Request Guidelines
- Commit history favors concise summaries (imperative is preferred: “Add palette copy helpers”). Include brief context in the body if behavior changes.
- For PRs, include: purpose, key changes, screenshots/GIFs for UI, manual verification steps (`npm run dev`, interactions tested), and any known gaps.
- Link issues when applicable and call out breaking changes explicitly.

## Architecture & Performance Notes
- Palette generation is pure and should stay side-effect free; UI state should only orchestrate config and copying behavior.
- Guard browser-only APIs (clipboard, `document`) if you later add SSR or tests.
- Keep color math centralized to avoid drift across future components (e.g., export shared helpers instead of duplicating logic).
