# Claude Certified Architect – Foundations Study Guide — Design Spec

**Date:** 2026-08-13
**Repo:** [dmarkel/Claude_Certification_Study](https://github.com/dmarkel/Claude_Certification_Study) (public, GitHub Pages)

## 1. Vision & Success Criteria

A public study companion for the **Claude Certified Architect – Foundations** certification path, built as a "learning in public" meta-project: it teaches the material while modeling the **4D Framework** (Delegation, Description, Discernment, Diligence) that the material itself teaches.

Success means:

- Passing the certification exam.
- Being able to explain the 4D Framework and generative-AI fundamentals from memory, without notes.
- Having a diagnostic practice-test system that identifies *which domain* to restudy, not just a pass/fail score.
- A project plan that gets reused — returned to at each stage of the course to deliberately practice Description, Delegation, Discernment, and Diligence — and that doubles as a public demonstration of the framework for anyone who visits the site.
- A site that's free to host, requires no build step, and grows cleanly as more of the 7 prep courses are completed, without needing a redesign each time.

## 2. Scope & Decomposition

The full certification path bundles 7 prep courses (per [the official prep-courses page](https://anthropic-partners.skilljar.com/page/claude-certified-architect-foundations-prep-courses)):

1. AI Fluency: Framework & Foundations
2. Building with the Claude API
3. Claude on Google Cloud
4. Claude Code in Action
5. Claude 101
6. Claude with Amazon Bedrock
7. Introduction to Model Context Protocol

This spec covers **Sub-project 1**: the reusable system (site architecture, delegation-framework project plan, content/quiz engine) fully built out for **Course 1 (AI Fluency: Framework & Foundations)**, since that's the course currently in progress. Courses 2–7 ship as visible placeholder stubs (title, description, official Skilljar link, "Not yet started") in the course map — the full path is real and visible, but no content is fabricated for courses not yet studied.

**Future sub-projects** (out of scope for this spec, handled as short follow-up passes): converting each placeholder into real content as that course is completed, and — once enough courses have real content — a cumulative full-length practice exam pulling from every course's question bank.

## 2.5 Official Exam Blueprint

Pulled directly from Anthropic's published **Claude Certified Architect – Foundations Exam Guide** (v1.0, effective July 2026, exam code CCAR-F):

- **60 items** (multiple-choice and multiple-response; each item states how many responses to select)
- **120-minute** time limit, proctored (online or test center via Pearson VUE)
- Built from **4 scenarios drawn from a bank of 6** realistic production contexts (e.g., customer support agent, multi-agent research pipeline, CI/CD code review, structured data extraction)
- **Passing score: 720 on a 100–1,000 scaled range**; result report includes **percent-correct per domain**
- $125 USD fee, 12-month credential validity, free on-time renewal assessment

**The exam blueprint (5 domains):**

| # | Domain | Weight |
|---|---|---|
| 1 | Agentic Architecture & Orchestration | 27% |
| 2 | Tool Design & MCP Integration | 18% |
| 3 | Claude Code Configuration & Workflows | 20% |
| 4 | Prompt Engineering & Structured Output | 20% |
| 5 | Context Management & Reliability | 15% |

**Important finding:** the exam blueprint does **not** test the 4D Framework (Delegation/Description/Discernment/Diligence) directly — that framework is Course 1's own subject matter, foundational to working effectively with AI but not itself an exam domain. The blueprint's 5 domains are drawn from the technical prep courses: Building with the Claude API, Claude Code in Action, and Introduction to MCP. This means:

- **Course 1's** knowledge checks and practice questions are tagged by the **4D Framework** (its own real content).
- **Blueprint-mapped courses** (Claude API, Claude Code in Action, MCP, and any other course whose content maps to the 5 domains) tag their questions by the **official domain names above**, so their practice tests and the eventual cumulative exam mirror the real score report format exactly.
- The Exam Guide's own detailed task statements per domain (e.g., "Design and implement agentic loops," "Configure CLAUDE.md files with appropriate hierarchy") are the authoritative topic list for writing practice questions once those courses are built out — each future course's question bank should trace back to specific task statements.

## 3. Site Architecture

Plain HTML/CSS/JS, **no build step**, deployed via GitHub Pages from `main`.

```
/index.html              → landing page: course map, overall progress, nav to Project Plan
/course.html              → renders any course from ?course=<id> (module list, status)
/module.html               → renders a module: study guide + knowledge checks
/practice-test.html         → renders a practice test for a course, scored by domain
/project-plan.html           → the Delegation-framework project plan (meta page)
/data/
  courses.js                 → course metadata: id, title, skilljar link, status (available|placeholder)
  modules/<course-id>.js     → per-course module content (study guide text, knowledge-check questions)
  questions/<course-id>.js   → per-course practice-test question bank, each item tagged with a domain
/js/
  render.js                  → shared rendering engine — reads data, builds pages
  quiz-engine.js              → scoring, immediate feedback, domain-breakdown calculation
  progress.js                  → tracks per-module/per-course completion in localStorage
/css/
  style.css                    → Bold & Editorial visual system
/tests/
  quiz-engine.test.js            → node-run tests for scoring/domain-breakdown math
/docs/superpowers/specs/          → design specs (this file)
```

Adding a future course's real content means writing `data/modules/<course-id>.js` and `data/questions/<course-id>.js` and flipping that course's `status` to `available` — no new page templates required.

## 4. Content Model

Each entry in `data/courses.js` has:

- `status`: `available` (fully built) or `placeholder` (stub — description + official link + "Not yet started", no fabricated content)
- `modules[]`: each with a study-guide page (original synthesis, written after actually completing that module — not copied from the course platform) and 3–5 knowledge-check questions (ungraded, immediate feedback, for reinforcement)
- A `practice-test`: 15–30 questions per course, **written in the real exam's style** — a short realistic scenario, 4 answer options, one best answer, and an explanation of why each option is right or wrong (mirroring the sample questions in the official Exam Guide) — each tagged with a domain, scored with immediate per-question feedback plus an end-of-test domain breakdown

**Course 1 (AI Fluency: Framework & Foundations)** ships fully built, following its real module structure: Intro to AI Fluency → What is Generative AI? → Delegation → Description → Discernment → Diligence → Conclusion & Certification. Its practice questions are tagged by the 4D Framework (see §2.5) since this course sits outside the official exam blueprint.

**Courses 2–7** ship as placeholder stubs at launch. When built out, courses that map to the exam blueprint (Claude API, Claude Code in Action, MCP) tag their questions by the 5 official domains from §2.5, sourced from that domain's published task statements.

## 5. The Delegation-Framework Project Plan (`project-plan.html`)

The core meta-deliverable: a breakdown of this project's own major tasks through the 4D lens, reachable from a persistent top-nav link on every page (not buried inside the course list).

| Task | Best driven by | Why |
|---|---|---|
| Research exam scope, syllabus, module structure | AI, human confirms | Web research + synthesis is fast for AI; human spot-checks against what's actually seen in Skilljar |
| Site engineering (render engine, quiz/scoring logic, progress tracking) | AI, human reviews | Deterministic, boilerplate-heavy code — a good delegation target; human verifies correct behavior |
| Writing the actual study-guide content per module | Human, AI assists structure | The crux: AI writing the notes from course material skips the retention benefit. Human processes/summarizes what they learned; AI organizes it into clean, consistent prose |
| Drafting practice questions | Collaborative | Human identifies what's genuinely worth testing; AI drafts question variants/distractors and tags them by domain; human verifies no invented facts |
| Visual/UX design direction | Human (taste), AI (implementation) | Human picks direction and constraints; AI builds it |
| Fact-checking AI-assisted content | Human | AI can confidently state incorrect specifics about Claude/Anthropic products — the highest-stakes Discernment checkpoint in the project |
| QA / testing the site (links, rendering, accessibility) | Collaborative | AI runs mechanical verification; human does a final pass |
| Deployment, ongoing maintenance | AI, human approves | Git/GitHub Pages ops are low-risk to delegate; publishing needs a human go-ahead each time |
| Repeating the pattern for each new course | Collaborative loop | Human brings raw understanding from the course; AI structures it fast; human verifies — this loop *is* the 4D framework in practice |

This table is expanded on the page itself with explicit framing against Description/Delegation/Discernment/Diligence, so it functions both as a working project plan to return to mid-course and as a public demonstration of the framework in use.

## 6. Assessment & Progress Engine

- **Knowledge checks** (per module, 3–5 Qs): lightweight, ungraded, immediate feedback with a short explanation. Purpose: reinforcement, not diagnosis.
- **Practice tests** (per course, 15–30 Qs): scenario-based, matching the real exam's format (situation → 4 options → one best answer → explanation). Course 1 tags questions with the 4D Framework (`delegation`, `description`, `discernment`, `diligence`, `genai-fundamentals`); blueprint-mapped courses tag with the 5 official exam domains (`agentic-architecture`, `tool-design-mcp`, `claude-code-config`, `prompt-engineering`, `context-management`). On submit: immediate right/wrong + explanation per question, then a domain-breakdown bar chart (e.g. "Context Management 40%, Tool Design & MCP 90%") identifying what to revisit.
- **Cumulative practice exam** (future sub-project, once enough blueprint-mapped courses are built): 60 scenario-based questions drawn from 4-of-6 rotating scenario contexts, scored on the same 100–1,000 scale with a 720 pass line and a per-domain breakdown — mirroring the real exam's structure and score report exactly.
- **Progress tracking**: `localStorage` only, no backend, no login — same pattern as the cat-math-adventure project. Tracks per-module "studied" status and per-course best practice-test score. The homepage course map shows a progress bar per course (e.g., "Course 1: 5/7 modules · Practice test: 78%").
- No data leaves the browser — no account system or backend needed.

## 7. Visual Design — Bold & Editorial

- **Type**: strong sans-serif headlines, comfortable body text, clear size contrast between headline and body
- **Color**: warm neutral background, one confident accent color (terracotta/amber-leaning — in the spirit of, but visually distinct from, Anthropic's own palette) for progress bars, links, and active states
- **Layout**: card-based (course cards on the homepage, module cards on course pages), generous whitespace, no clutter
- **Progress indicators**: clean horizontal bars for course completion and domain breakdowns — explicitly **no gamification** (no badges, streaks, XP, or "quests")
- **Nav**: persistent top bar on every page — Home · Project Plan · Progress

## 8. Testing / Verification

- `tests/quiz-engine.test.js` (run via `node`, same pattern as cat-math-adventure): verifies scoring math and domain-breakdown calculation are correct
- Manual browser verification before considering the build done: course map renders; a module renders; a practice test scores correctly with a domain breakdown; placeholder courses (2–7) are visually distinct from the built course (1); the Project Plan page is reachable from nav on every page

## 9. Content Sourcing Note

Course video content is publicly available on YouTube, so there's no paywall concern — but study-guide content is still written as original synthesis in the learner's own words after completing each module, not transcribed or copied from course material. This is both the safer approach and the one that actually builds retention, which is the point of the project.

Practice questions are modeled on the format demonstrated in Anthropic's official Exam Guide (scenario → options → explanation) and are written against that guide's **published domain weights and task statements** — which the guide itself states exam items are written against, and explicitly provides to help candidates prepare. Practice questions are **original**, not copies of the guide's own sample questions or scenarios, and never reproduce actual live exam content (which the exam's non-disclosure agreement protects separately and which this project never has access to).
