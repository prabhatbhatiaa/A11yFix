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
     - `demo-site/`: Static test website with deliberate a11y bugs for live demo & before/after rescan testing.
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

- [ ] **Phase 1: Backend Foundation & axe-core Scanner**
  - [ ] Set up `backend/` (`package.json`, Express, cors, dotenv).
  - [ ] Configure local Playwright Chromium installation.
  - [ ] Implement URL safety/SSRF validation (`src/utils/security.js`).
  - [ ] Implement browser automation and axe-core runner (`src/services/scanner.js`).
  - [ ] Implement violation grouping, sorting, and scoring algorithm (`src/services/analyzer.js`).
  - [ ] Expose `POST /api/audit` endpoint.
- [ ] **Phase 2: Gemini AI Remediation Engine**
  - [ ] Integrate Gemini SDK with structured prompting.
  - [ ] Expose `POST /api/fix` for generating explanations and corrected HTML snippets.
- [ ] **Phase 3: Frontend Developer Dashboard**
  - [ ] Initialize Next.js project with Tailwind CSS.
  - [ ] Build URL input, audit progress/loading state.
  - [ ] Build issue explorer (grouped, ranked, severity badges, WCAG tags).
  - [ ] Build remediation panel (side-by-side diff, copy button, Gemini fix trigger).
  - [ ] Build rescan comparison mechanism.
- [ ] **Phase 4: Demo Site & Validation**
  - [ ] Create `demo-site/index.html` with target accessibility violations (contrast, alt, label, lang).
  - [ ] Test end-to-end workflow: Scan → View AI Fix → Patch → Rescan → Score Improvement.

---

## 4. Change & Decision Log

| Date (ISO) | Category | Description | Rationale |
|---|---|---|---|
| 2026-10-30 | Planning | Selected Google Gemini as the LLM provider | User choice; strong code comprehension & fast latency. |
| 2026-10-30 | Architecture | Separate `backend/` and `frontend/` folders | Clean separation of concerns between heavy headless browser backend and React UI. |
| 2026-10-30 | Environment | Keep all dependencies strictly in project folder | Zero impact on host OS / global system environment. |
| 2026-10-30 | Documentation | Created `CONTEXT.md` as project brain | Persistent log of all decisions, edits, and state transitions for easy handoff. |

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
