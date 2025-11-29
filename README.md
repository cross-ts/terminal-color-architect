# Terminal Color Architect

React + TypeScript + Tailwind UI for generating OKLCH-based terminal palettes. Everything lives in `src/main.tsx`.

## Prerequisites
- Node.js 18+ recommended
- pnpm `>=10` (project uses pnpm lockfile)

## Getting started
```bash
pnpm install
pnpm dev
```
The dev server runs on http://localhost:5173 by default.

## Scripts
- `pnpm dev` – start Vite dev server
- `pnpm build` – type-check and build for production
- `pnpm preview` – preview the production build
- `pnpm test` – currently runs `pnpm lint` (no automated tests yet)

## Notes
- Styling is powered by Tailwind (`src/index.css`, `tailwind.config.ts`).
- All UI logic, color math, and layout are contained in `src/main.tsx`.
