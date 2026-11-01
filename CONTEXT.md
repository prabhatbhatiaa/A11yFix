# A11yFix — Project Brain & Context Log

> **Purpose:** This document serves as the single source of truth for all architectural decisions, design plans, implemented features, environment configurations, and ongoing project status. Anyone picking up this repository should be able to read this document and fully understand the project context, state, and next steps.

---

## 1. Project Overview & Objective

- **Project Name:** A11yFix
- **Hackathon Track:** Hacktoberfest 2026 Hack Day, Gurugram (PS-04: Open Source + AI)
- **Core Mission:** Build an AI-powered accessibility auditing platform that scans websites, detects WCAG violations via real browser testing (`axe-core` + `Playwright`), prioritizes them by impact, and uses Gemini AI to generate plain-English explanations and drop-in code fixes.
- **Workflow:** `Enter URL` → `Scan Website` → `Detect Violations` → `Prioritize Issues` → `Generate Gemini AI Fixes` → `Apply Fixes` → `Rescan & Compare`.

---

## 2. Key Architecture & Constraints Decided

1. **Self-Contained Local Environment:**
   - **Zero global system installations.** Everything resides strictly inside `A11yFix/`.
   - Node packages installed strictly into local `backend/node_modules/` and `frontend/node_modules/`.
   - Playwright browser binaries stored locally (e.g. `PLAYWRIGHT_BROWSERS_PATH=./.cache/ms-playwright` or local `node_modules`).
2. **Directory Structure:**
   - Sibling folders:
     - `backend/`: Node.js + Express API server.
     - `frontend/`: Next.js (App Router, Tailwind CSS, Lucide Icons).
     - `hack/`: Original problem statement & reference materials.
     - `CONTEXT.md`: This living document.
3. **AI Integration:**
   - Engine: **Google Gemini API** (`@google/genai` or `@google/generative-ai`).
   - Strategy: On-demand remediation per issue to optimize token usage and avoid latency/rate limits during initial scan.
4. **Scoring & Engine Separation:**
   - Detection is 100% deterministic using `axe-core` in headless Chromium.
   - AI is strictly used for plain-English explanations, impact notes, and corrected HTML snippets (never for hallucinating violation detection).

---

## 3. Roadmap & Progress Tracker

- [x] **Phase 1: Backend Foundation & axe-core Scanner**
  - [x] Set up `backend/` (`package.json`, Express, cors, dotenv, helmet, zod).
  - [x] Configure local Playwright Chromium installation (strictly isolated in `backend/.cache/ms-playwright`).
  - [x] Implement URL safety/SSRF validation (`src/utils/security.js`) preventing internal/cloud metadata leaks.
  - [x] Implement browser automation and axe-core runner (`src/services/scanner.js`).
  - [x] Implement violation grouping, sorting, and scoring algorithm (`src/services/analyzer.js`).
  - [x] Expose `POST /api/audit` and `POST /api/fix` endpoints (`src/routes/audit.js`).
  - [x] Integrate Gemini AI remediation with deterministic fallbacks (`src/services/ai.js`).
  - [x] Verified end-to-end scanner pipeline on `demo-site/index.html` (verified 56/100 score, 3 real violations detected and fixed).
- [ ] **Phase 2: Gemini AI Remediation Enhancements & Rate Limiting**
  - [x] Structured output prompt with JSON schema.
  - [x] Deterministic fallback for network/quota resiliency.
- [x] **Phase 3: Frontend Developer Dashboard (Premium 60 FPS Mobile-Optimized UI)**
  - [x] Initialized Next.js 16 (App Router) + Tailwind CSS + TypeScript.
  - [x] Installed `framer-motion`, `lucide-react`, `canvas-confetti`.
  - [x] Built `ScoreGauge.tsx` with animated SVG circular arc, dynamic color grading, and rescan delta comparison.
  - [x] Built `SeverityBadge.tsx` with impact styling (`critical`, `serious`, `moderate`, `minor`).
  - [x] Built `IssueCard.tsx` with collapsible accordion, target selectors, offending HTML, and WCAG tags.
  - [x] Built `RemediationDrawer.tsx` sliding drawer with on-demand Gemini AI fix trigger, copy-to-clipboard, impact breakdown, and confetti celebrations.
  - [x] Built `page.tsx` home screen with glassmorphic cards, live status feedback, severity filters, and rescan comparison.
  - [x] Verified full production Next.js build (`npm run build`) passed with zero errors.
- [ ] **Phase 4: Live Verification & Testing**
  - [x] Verified scanner & AI fix pipeline end-to-end.
  - [ ] Live visual comparison of before vs. after.

---

## 4. Change & Decision Log

| Date (ISO) | Category | Description | Rationale |
|---|---|---|---|
| 2026-10-30 | Planning | Selected Google Gemini as the LLM provider | User choice; strong code comprehension & fast latency. |
| 2026-10-30 | Architecture | Separate `backend/` and `frontend/` folders | Clean separation of concerns between heavy headless browser backend and React UI. |
| 2026-10-30 | Environment | Keep all dependencies strictly in project folder | Zero impact on host OS / global system environment. |
| 2026-10-30 | Documentation | Created `CONTEXT.md` as project brain | Persistent log of all decisions, edits, and state transitions for easy handoff. |
| 2026-11-01 | Backend | Implemented SSRF and DNS rebinding guard in `security.js` | Prohibits access to internal RFC1918 IPs, 169.254.x.x, loopbacks while permitting safe local dev mode. |
| 2026-11-01 | Playwright | Configured local Chromium binaries in `.cache/ms-playwright` | Zero global OS footprint; completely self-contained. |
| 2026-11-01 | Core Engine | Built `scanner.js` + `analyzer.js` + `ai.js` | Full real-browser axe-core execution with impact weighting scoring formula and Gemini fixes. |
| 2026-11-01 | UI / UX | Overhauled UI to Instrument / Linear Aesthetic | Removed generic purple glow; rebuilt with precision mechanical/terminal design: sub-pixel grid lines, segmented diagnostic bars, cyan telemetry badges, raw monospace code viewports, and clean drawer transitions. |
| 2026-11-01 | 3D & Theming | Integrated Three.js 3D Mesh + Full Light Mode System | Added interactive WebGL 3D DOM topology mesh (cursor reactive, 60 FPS), perspective 3D card tilt physics, complete light/dark CSS variable system (adaptive high-contrast slate surfaces, inputs, score bars, and drawer), and filled layout with subsystem diagnostics. |
| 2026-11-01 | DX / Scripts | Added root monorepo `npm run dev` | Configured `concurrently` in root `package.json` to launch backend and frontend simultaneously with colored logs. |
| 2026-11-01 | Verification | Ran `test-scanner.js` on `demo-site/index.html` | Successfully scored page at 56/100, caught critical `image-alt`, `button-name`, `label` violations and generated drop-in fixes. |

---

## 5. Environment Variables & Secrets Reference

*(Never commit actual keys to git; use `.env.example` in respective directories)*

- `backend/.env`:
  - `PORT=5000`
  - `GEMINI_API_KEY=`
  - `PLAYWRIGHT_BROWSERS_PATH=./.cache/ms-playwright`
  - `ALLOW_LOCALHOST_SCAN=true` (for local demo-site testing)
- `frontend/.env.local`:
  - `NEXT_PUBLIC_API_URL=http://localhost:5000`
