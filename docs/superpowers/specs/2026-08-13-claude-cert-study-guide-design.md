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
- A `practice-test`: 15–30 questions per course, each tagged with a domain, scored with immediate per-question feedback plus an end-of-test domain breakdown

**Course 1 (AI Fluency: Framework & Foundations)** ships fully built, following its real module structure: Intro to AI Fluency → What is Generative AI? → Delegation → Description → Discernment → Diligence → Conclusion & Certification.

**Courses 2–7** ship as placeholder stubs at launch.

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
- **Practice tests** (per course, 15–30 Qs): each question tagged with a domain (`delegation`, `description`, `discernment`, `diligence`, `genai-fundamentals`, etc.). On submit: immediate right/wrong + explanation per question, then a domain-breakdown bar chart (e.g. "Diligence 40%, Delegation 90%") identifying what to revisit.
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
