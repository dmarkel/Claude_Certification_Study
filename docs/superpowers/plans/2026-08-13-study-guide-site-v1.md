# Claude Certification Study Guide — Sub-Project 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static, no-build-step study companion site for the Claude Certified Architect – Foundations certification: a data-driven course map (1 fully built course + 6 placeholder stubs), a study-guide + knowledge-check flow, a scored practice-test engine with domain-breakdown diagnostics, localStorage progress tracking, and the Delegation-framework project plan page — matching `docs/superpowers/specs/2026-08-13-claude-cert-study-guide-design.md`.

**Architecture:** Plain HTML/CSS/JS, zero build tooling, deployed via GitHub Pages. Content lives in plain-object JS data files (`data/`); a shared render engine (`js/render.js`) reads that data and builds each page's DOM at load time from a `?course=`/`?module=` query string. Pure scoring/progress logic is isolated in `js/quiz-engine.js` and `js/progress.js` so it can run and be tested under Node, following the dual CommonJS/browser-global export pattern already used in the `cat-math-adventure` project.

**Tech Stack:** HTML5, vanilla CSS, vanilla JS (ES2017+, no framework, no bundler), Node.js (`node` only, no test runner dependency) for the quiz-engine unit tests, GitHub Pages for hosting.

**Note on nav scope:** The approved spec's §7 lists the persistent nav as "Home · Project Plan · Progress." Since the homepage (course map) already *is* the progress overview per §6 ("The homepage course map shows a progress bar per course"), this plan implements nav as **Home · Project Plan** — a separate "Progress" page would duplicate the homepage with no new content. Flagging this simplification here rather than silently deviating from the spec.

**Domain tags for Course 1:** the spec (§6) leaves the exact tag list open ("etc."). This plan uses six tags for Course 1 content: `delegation`, `description`, `discernment`, `diligence`, `genai-fundamentals` (the five named in the spec) plus `framework-overview` for big-picture/intro-conclusion questions that don't fit one specific D. The scored practice test only draws from the five spec-named tags, keeping its domain breakdown chart aligned exactly with the spec; `framework-overview` is used only in the ungraded per-module knowledge checks.

---

## File Structure

```
index.html                              → course map (landing page)
course.html                             → single course view (?course=<id>)
module.html                             → study guide + knowledge checks (?course=<id>&module=<id>)
practice-test.html                      → scored practice test (?course=<id>)
project-plan.html                       → Delegation-framework project plan (static content)
css/
  style.css                             → Bold & Editorial design system
js/
  quiz-engine.js                        → pure scoring/domain-breakdown logic (Node + browser)
  progress.js                           → localStorage progress helpers (Node-testable via storage injection, browser use)
  render.js                             → DOM rendering functions, browser-only
data/
  courses.js                            → all 7 course metadata entries
  modules/
    ai-fluency-foundations.js           → Course 1's 7 modules: study guide + knowledge checks
  questions/
    ai-fluency-foundations.js           → Course 1's 15-question scored practice-test bank
tests/
  quiz-engine.test.js                   → Node-run tests for scoring/domain-breakdown math
README.md                               → project overview, how to run/verify locally
```

---

### Task 1: Project scaffold and README

**Files:**
- Create: `README.md`
- Create: `js/.gitkeep` (placeholder so empty dirs aren't needed — actually skip; directories are created implicitly when files are added in later tasks)

- [ ] **Step 1: Write the README**

Create `README.md`:

```markdown
# Claude Certified Architect – Foundations: Study Guide

A study companion for the [Claude Certified Architect – Foundations](https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification)
certification path — built as a "learning in public" meta-project that also demonstrates
the AI Fluency 4D Framework (Delegation, Description, Discernment, Diligence) in how the
project itself was planned and built. See [`project-plan.html`](project-plan.html) once
deployed, or [`docs/superpowers/specs/`](docs/superpowers/specs/) for the full design spec.

**Live site:** https://dmarkel.github.io/Claude_Certification_Study/

## What's here

- A course map covering all 7 prep courses in the certification path. Course 1
  (AI Fluency: Framework & Foundations) is fully built out; the rest are placeholder
  stubs, filled in as each course is actually completed.
- Per-module study guides and ungraded knowledge checks.
- A scored practice test per course with immediate per-question feedback and an
  end-of-test domain breakdown, modeled on the real exam's format and score report.
- Progress tracking via `localStorage` — nothing leaves your browser, no backend, no login.

## Tech

Plain HTML/CSS/JS, no build step, no framework. Content lives in `data/` as plain JS
objects; `js/render.js` renders pages from that data at load time.

## Running locally

No build step — just serve the directory and open it:

\`\`\`bash
python3 -m http.server 8000
# then open http://localhost:8000
\`\`\`

## Tests

\`\`\`bash
node tests/quiz-engine.test.js
\`\`\`
```

- [ ] **Step 2: Commit**

```bash
cd "Claude Foundations Study Guide Site"
git add README.md
git commit -m "Add project README"
```

---

### Task 2: Quiz-engine scoring logic (TDD)

**Files:**
- Create: `js/quiz-engine.js`
- Test: `tests/quiz-engine.test.js`

- [ ] **Step 1: Write the failing tests**

Create `tests/quiz-engine.test.js`:

```js
/* Sanity tests for the practice-test scoring engine. Run: node tests/quiz-engine.test.js */

const QuizEngine = require('../js/quiz-engine.js');

let failures = 0;
function check(name, cond) {
  if (cond) console.log(`  ok - ${name}`);
  else { failures++; console.error(`  FAIL - ${name}`); }
}

const questions = [
  { id: 'q1', domain: 'delegation', correctOptionId: 'a' },
  { id: 'q2', domain: 'delegation', correctOptionId: 'b' },
  { id: 'q3', domain: 'description', correctOptionId: 'c' },
];

// all correct
{
  const answers = { q1: 'a', q2: 'b', q3: 'c' };
  const result = QuizEngine.scoreTest(questions, answers);
  check('all-correct: overall percent is 100', result.percent === 100);
  check('all-correct: correct count matches total', result.correct === 3 && result.total === 3);
}

// all wrong
{
  const answers = { q1: 'x', q2: 'x', q3: 'x' };
  const result = QuizEngine.scoreTest(questions, answers);
  check('all-wrong: overall percent is 0', result.percent === 0);
}

// partial, with domain breakdown
{
  const answers = { q1: 'a', q2: 'x', q3: 'c' }; // 2/3 correct, delegation 1/2, description 1/1
  const result = QuizEngine.scoreTest(questions, answers);
  check('partial: overall percent rounds to 67', result.percent === 67);
  const delegation = result.domainBreakdown.find(d => d.domain === 'delegation');
  const description = result.domainBreakdown.find(d => d.domain === 'description');
  check('partial: delegation domain is 1/2 (50%)', delegation.correct === 1 && delegation.total === 2 && delegation.percent === 50);
  check('partial: description domain is 1/1 (100%)', description.correct === 1 && description.total === 1 && description.percent === 100);
}

// missing answers count as wrong, not a crash
{
  const answers = { q1: 'a' }; // q2, q3 unanswered
  const result = QuizEngine.scoreTest(questions, answers);
  check('unanswered questions count as incorrect, no crash', result.correct === 1 && result.total === 3);
}

// empty question set doesn't divide by zero
{
  const result = QuizEngine.scoreTest([], {});
  check('empty question set: percent is 0, not NaN', result.percent === 0);
  check('empty question set: no domain breakdown entries', result.domainBreakdown.length === 0);
}

// isCorrect helper
{
  const q = { id: 'q1', domain: 'delegation', correctOptionId: 'a' };
  check('isCorrect true for matching option', QuizEngine.isCorrect(q, 'a') === true);
  check('isCorrect false for non-matching option', QuizEngine.isCorrect(q, 'b') === false);
  check('isCorrect false for undefined answer', QuizEngine.isCorrect(q, undefined) === false);
}

if (failures > 0) {
  console.error(`\n${failures} test(s) failed.`);
  process.exit(1);
} else {
  console.log('\nAll quiz-engine tests passed.');
}
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node tests/quiz-engine.test.js`
Expected: `Error: Cannot find module '../js/quiz-engine.js'`

- [ ] **Step 3: Write the implementation**

Create `js/quiz-engine.js`:

```js
/* Pure scoring logic for practice tests. No DOM access — also runs under Node for tests. */

const QuizEngine = (() => {
  function isCorrect(question, selectedOptionId) {
    return selectedOptionId !== undefined && selectedOptionId === question.correctOptionId;
  }

  function scoreTest(questions, answers) {
    const byDomain = {};
    let correctCount = 0;

    questions.forEach((q) => {
      if (!byDomain[q.domain]) byDomain[q.domain] = { correct: 0, total: 0 };
      byDomain[q.domain].total += 1;
      if (isCorrect(q, answers[q.id])) {
        byDomain[q.domain].correct += 1;
        correctCount += 1;
      }
    });

    const domainBreakdown = Object.keys(byDomain).map((domain) => {
      const { correct, total } = byDomain[domain];
      return { domain, correct, total, percent: Math.round((correct / total) * 100) };
    });

    const total = questions.length;
    return {
      correct: correctCount,
      total,
      percent: total === 0 ? 0 : Math.round((correctCount / total) * 100),
      domainBreakdown,
    };
  }

  return { scoreTest, isCorrect };
})();

if (typeof module !== 'undefined') module.exports = QuizEngine;
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node tests/quiz-engine.test.js`
Expected: `All quiz-engine tests passed.` with no `FAIL` lines and exit code 0.

- [ ] **Step 5: Commit**

```bash
git add js/quiz-engine.js tests/quiz-engine.test.js
git commit -m "Add quiz-engine scoring logic with domain breakdown (TDD)"
```

---

### Task 3: Progress tracking (localStorage helpers)

**Files:**
- Create: `js/progress.js`

- [ ] **Step 1: Write the implementation**

Create `js/progress.js`:

```js
/* localStorage-backed progress tracking. Storage is injected as a parameter so this
   can run under Node (with a mock) as well as in the browser — no DOM access here. */

const Progress = (() => {
  const KEY = 'claudeCertStudy.v1';

  function freshState() {
    return {
      modulesStudied: {},   // "<courseId>:<moduleId>" -> true
      practiceScores: {},   // "<courseId>" -> best percent (0-100)
    };
  }

  function load(storage) {
    try {
      const raw = storage.getItem(KEY);
      if (!raw) return freshState();
      const parsed = JSON.parse(raw);
      return { ...freshState(), ...parsed };
    } catch {
      return freshState();
    }
  }

  function save(state, storage) {
    try {
      storage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage full or blocked — progress just won't persist this session */
    }
  }

  function markModuleStudied(state, courseId, moduleId) {
    state.modulesStudied[`${courseId}:${moduleId}`] = true;
    return state;
  }

  function isModuleStudied(state, courseId, moduleId) {
    return !!state.modulesStudied[`${courseId}:${moduleId}`];
  }

  function courseModuleProgress(state, courseId, moduleIds) {
    const studied = moduleIds.filter((id) => isModuleStudied(state, courseId, id)).length;
    return { studied, total: moduleIds.length };
  }

  function recordPracticeScore(state, courseId, percent) {
    const prev = state.practiceScores[courseId] || 0;
    state.practiceScores[courseId] = Math.max(prev, percent);
    return state;
  }

  function bestPracticeScore(state, courseId) {
    return Object.prototype.hasOwnProperty.call(state.practiceScores, courseId)
      ? state.practiceScores[courseId]
      : null;
  }

  return {
    freshState, load, save, markModuleStudied, isModuleStudied,
    courseModuleProgress, recordPracticeScore, bestPracticeScore,
  };
})();

if (typeof module !== 'undefined') module.exports = Progress;
```

- [ ] **Step 2: Verify with a quick Node sanity check**

Run:

```bash
node -e "
const Progress = require('./js/progress.js');
const mockStorage = (() => { let s = {}; return { getItem: k => s[k] || null, setItem: (k,v) => { s[k]=v; } }; })();
let state = Progress.load(mockStorage);
Progress.markModuleStudied(state, 'ai-fluency-foundations', 'intro');
Progress.recordPracticeScore(state, 'ai-fluency-foundations', 80);
Progress.save(state, mockStorage);
state = Progress.load(mockStorage);
console.log(Progress.isModuleStudied(state, 'ai-fluency-foundations', 'intro'));
console.log(Progress.bestPracticeScore(state, 'ai-fluency-foundations'));
console.log(Progress.courseModuleProgress(state, 'ai-fluency-foundations', ['intro','genai-deep-dive']));
"
```

Expected output:
```
true
80
{ studied: 1, total: 2 }
```

- [ ] **Step 3: Commit**

```bash
git add js/progress.js
git commit -m "Add localStorage-backed progress tracking"
```

---

### Task 4: Course metadata

**Files:**
- Create: `data/courses.js`

- [ ] **Step 1: Write the implementation**

Create `data/courses.js`:

```js
/* Metadata for all 7 prep courses in the Claude Certified Architect – Foundations path.
   moduleIds is empty for placeholder courses (no module data exists yet). */

const COURSES = [
  {
    id: 'ai-fluency-foundations',
    title: 'AI Fluency: Framework & Foundations',
    description: 'The 4D Framework (Delegation, Description, Discernment, Diligence) for working effectively, efficiently, ethically, and safely with AI — plus generative AI fundamentals.',
    skilljarUrl: 'https://anthropic-partners.skilljar.com/ai-fluency-framework-foundations',
    status: 'available',
    examDomain: null,
    moduleIds: ['intro', 'genai-deep-dive', 'delegation', 'description', 'discernment', 'diligence', 'conclusion'],
  },
  {
    id: 'claude-api',
    title: 'Building with the Claude API',
    description: 'The full spectrum of working with Anthropic models via the Claude API — from basic requests to agentic architectures, tool use, and structured output.',
    skilljarUrl: 'https://anthropic-partners.skilljar.com/claude-with-the-anthropic-api',
    status: 'placeholder',
    examDomain: 'Maps to Agentic Architecture & Orchestration, Tool Design & MCP Integration, Prompt Engineering & Structured Output',
    moduleIds: [],
  },
  {
    id: 'claude-google-cloud',
    title: 'Claude on Google Cloud',
    description: 'Working with Anthropic models via Google Cloud Vertex AI.',
    skilljarUrl: 'https://anthropic-partners.skilljar.com/claude-with-google-vertex',
    status: 'placeholder',
    examDomain: null,
    moduleIds: [],
  },
  {
    id: 'claude-code-in-action',
    title: 'Claude Code in Action',
    description: 'Running long, hands-off Claude Code sessions you can trust: steer, configure, automate, and verify.',
    skilljarUrl: 'https://anthropic-partners.skilljar.com/claude-code-in-action',
    status: 'placeholder',
    examDomain: 'Maps to Claude Code Configuration & Workflows',
    moduleIds: [],
  },
  {
    id: 'claude-101',
    title: 'Claude 101',
    description: 'Using Claude for everyday work tasks, core features, and resources for going deeper.',
    skilljarUrl: 'https://anthropic-partners.skilljar.com/claude-101',
    status: 'placeholder',
    examDomain: null,
    moduleIds: [],
  },
  {
    id: 'claude-amazon-bedrock',
    title: 'Claude with Amazon Bedrock',
    description: 'Working with Anthropic models via Amazon Bedrock.',
    skilljarUrl: 'https://anthropic-partners.skilljar.com/claude-in-amazon-bedrock',
    status: 'placeholder',
    examDomain: null,
    moduleIds: [],
  },
  {
    id: 'intro-to-mcp',
    title: 'Introduction to Model Context Protocol',
    description: 'Building Model Context Protocol servers and clients from scratch using Python.',
    skilljarUrl: 'https://anthropic-partners.skilljar.com/introduction-to-model-context-protocol',
    status: 'placeholder',
    examDomain: 'Maps to Tool Design & MCP Integration',
    moduleIds: [],
  },
];

if (typeof module !== 'undefined') module.exports = COURSES;
```

- [ ] **Step 2: Verify with a Node sanity check**

Run: `node -e "console.log(require('./data/courses.js').length)"`
Expected: `7`

- [ ] **Step 3: Commit**

```bash
git add data/courses.js
git commit -m "Add course metadata for all 7 prep courses"
```

---

### Task 5: Visual design system

**Files:**
- Create: `css/style.css`

- [ ] **Step 1: Write the stylesheet**

Create `css/style.css`:

```css
/* Bold & Editorial design system. Warm neutral background, one confident accent
   color, card-based layout, no gamification (no badges/streaks/XP). */

:root {
  --color-bg: #faf7f2;
  --color-surface: #ffffff;
  --color-text: #1c1a17;
  --color-text-muted: #6b6459;
  --color-border: #e8e0d2;
  --color-accent: #c1592b;
  --color-accent-soft: #f5e3d8;
  --color-success: #2f7d4f;
  --color-success-soft: #e3f1e7;
  --color-error: #b3392c;
  --color-error-soft: #fbe6e2;
  --font-headline: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
  --font-body: Georgia, 'Times New Roman', serif;
  --radius: 10px;
  --shadow: 0 1px 3px rgba(28, 26, 23, 0.08);
}

* { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-body);
  line-height: 1.6;
}

h1, h2, h3, .topnav-brand, .button {
  font-family: var(--font-headline);
  font-weight: 700;
  letter-spacing: -0.01em;
}

h1 { font-size: 2.1rem; margin: 0 0 0.5rem; }
h2 { font-size: 1.4rem; margin: 2rem 0 1rem; }
h3 { font-size: 1.1rem; margin: 0 0 0.5rem; }

.subtitle { color: var(--color-text-muted); font-size: 1.05rem; max-width: 640px; }

main { max-width: 860px; margin: 0 auto; padding: 2rem 1.5rem 4rem; }

.topnav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);
}
.topnav-brand { color: var(--color-text); text-decoration: none; font-size: 1rem; }
.topnav-links { display: flex; gap: 1.25rem; }
.nav-link { color: var(--color-text-muted); text-decoration: none; font-family: var(--font-headline); font-weight: 600; font-size: 0.9rem; }
.nav-link--active, .nav-link:hover { color: var(--color-accent); }

.page-header { margin-bottom: 1.5rem; }

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
}

.card {
  display: block;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 1.25rem;
  text-decoration: none;
  color: inherit;
  box-shadow: var(--shadow);
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}
.card:hover { transform: translateY(-2px); box-shadow: 0 4px 10px rgba(28, 26, 23, 0.10); }

.course-card p { color: var(--color-text-muted); font-size: 0.95rem; }
.course-card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; font-family: var(--font-headline); font-size: 0.8rem; }

.status-badge { padding: 0.2rem 0.6rem; border-radius: 999px; font-weight: 700; }
.status-badge--available { background: var(--color-success-soft); color: var(--color-success); }
.status-badge--placeholder { background: var(--color-border); color: var(--color-text-muted); }

.progress-label { color: var(--color-text-muted); }

.section { margin-bottom: 2rem; }

.module-list { display: flex; flex-direction: column; gap: 0.5rem; }
.module-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  text-decoration: none;
  color: var(--color-text);
}
.module-row:hover { border-color: var(--color-accent); }
.module-row-status { font-family: var(--font-headline); color: var(--color-accent); width: 1.25rem; }

.button {
  display: inline-block;
  background: var(--color-accent);
  color: #fff;
  padding: 0.7rem 1.4rem;
  border-radius: var(--radius);
  text-decoration: none;
  font-size: 0.95rem;
  border: none;
  cursor: pointer;
}
.button:hover { opacity: 0.92; }
.button--secondary { background: transparent; color: var(--color-accent); border: 1px solid var(--color-accent); }

.external-link { display: inline-block; margin-top: 0.5rem; font-family: var(--font-headline); font-size: 0.85rem; color: var(--color-accent); }

.key-concepts { background: var(--color-accent-soft); border-radius: var(--radius); padding: 1rem 1.25rem; margin: 1rem 0; }
.key-concepts ul { margin: 0.4rem 0 0; padding-left: 1.2rem; }

.question-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 1.25rem;
  margin-bottom: 1rem;
}
.question-prompt { font-family: var(--font-headline); font-weight: 700; margin-bottom: 0.75rem; }
.option-list { display: flex; flex-direction: column; gap: 0.5rem; }
.option-button {
  text-align: left;
  padding: 0.6rem 0.9rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 0.95rem;
}
.option-button:hover { border-color: var(--color-accent); }
.option-button--correct { background: var(--color-success-soft); border-color: var(--color-success); }
.option-button--incorrect { background: var(--color-error-soft); border-color: var(--color-error); }
.option-button:disabled { cursor: default; }

.explanation { margin-top: 0.75rem; padding: 0.75rem 1rem; background: var(--color-accent-soft); border-radius: 8px; font-size: 0.9rem; }

.domain-breakdown { display: flex; flex-direction: column; gap: 0.6rem; margin: 1rem 0; }
.domain-bar-row { display: grid; grid-template-columns: 200px 1fr 3rem; align-items: center; gap: 0.75rem; font-family: var(--font-headline); font-size: 0.85rem; }
.domain-bar-track { background: var(--color-border); border-radius: 999px; height: 10px; overflow: hidden; }
.domain-bar-fill { background: var(--color-accent); height: 100%; }

.score-summary { text-align: center; padding: 1.5rem; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius); margin-bottom: 1.5rem; }
.score-summary .score-number { font-family: var(--font-headline); font-size: 2.5rem; font-weight: 700; color: var(--color-accent); }

.plan-table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
.plan-table th, .plan-table td { text-align: left; padding: 0.65rem 0.75rem; border-bottom: 1px solid var(--color-border); vertical-align: top; font-size: 0.9rem; }
.plan-table th { font-family: var(--font-headline); }
```

- [ ] **Step 2: Commit**

```bash
git add css/style.css
git commit -m "Add Bold & Editorial visual design system"
```

---

### Task 6: Render engine — nav and course map

**Files:**
- Create: `js/render.js`

- [ ] **Step 1: Write the implementation**

Create `js/render.js`:

```js
/* Browser-only DOM rendering. Reads from data/ and js/progress.js, writes into containers. */

const Render = (() => {
  function getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function renderNav(activePage) {
    const items = [
      { id: 'home', label: 'Home', href: 'index.html' },
      { id: 'plan', label: 'Project Plan', href: 'project-plan.html' },
    ];
    const links = items.map((i) =>
      `<a href="${i.href}" class="nav-link${i.id === activePage ? ' nav-link--active' : ''}">${i.label}</a>`
    ).join('');
    return `
      <nav class="topnav">
        <a href="index.html" class="topnav-brand">Claude Certified Architect — Study Guide</a>
        <div class="topnav-links">${links}</div>
      </nav>`;
  }

  function courseProgressLabel(course, progressState) {
    if (course.status === 'placeholder') return 'Not yet started';
    const { studied, total } = Progress.courseModuleProgress(progressState, course.id, course.moduleIds);
    const best = Progress.bestPracticeScore(progressState, course.id);
    const scoreLabel = best === null ? 'no attempts yet' : `${best}%`;
    return `${studied}/${total} modules · Practice test: ${scoreLabel}`;
  }

  function renderCourseMap(courses, progressState, container) {
    container.innerHTML = `
      <header class="page-header">
        <h1>Claude Certified Architect – Foundations</h1>
        <p class="subtitle">A study companion built while learning the certification path — and demonstrating the AI Fluency 4D Framework (Delegation, Description, Discernment, Diligence) along the way.</p>
      </header>
      <div class="card-grid">
        ${courses.map((c) => `
          <a class="card course-card course-card--${c.status}" href="course.html?course=${c.id}">
            <h3>${c.title}</h3>
            <p>${c.description}</p>
            <div class="course-card-footer">
              <span class="status-badge status-badge--${c.status}">${c.status === 'available' ? 'Available' : 'Coming Soon'}</span>
              <span class="progress-label">${courseProgressLabel(c, progressState)}</span>
            </div>
          </a>
        `).join('')}
      </div>
    `;
  }

  return { getParam, renderNav, renderCourseMap, courseProgressLabel };
})();
```

- [ ] **Step 2: Commit**

```bash
git add js/render.js
git commit -m "Add render engine: nav and course map"
```

---

### Task 7: Homepage

**Files:**
- Create: `index.html`

- [ ] **Step 1: Write the page**

Create `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Claude Certified Architect – Foundations: Study Guide</title>
  <meta name="description" content="A study companion for the Claude Certified Architect – Foundations certification path.">
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div id="nav"></div>
  <main id="app"></main>
  <script src="js/quiz-engine.js"></script>
  <script src="js/progress.js"></script>
  <script src="data/courses.js"></script>
  <script src="js/render.js"></script>
  <script>
    document.getElementById('nav').innerHTML = Render.renderNav('home');
    const progressState = Progress.load(window.localStorage);
    Render.renderCourseMap(COURSES, progressState, document.getElementById('app'));
  </script>
</body>
</html>
```

- [ ] **Step 2: Verify in the browser**

Open `index.html` via a local server (`python3 -m http.server 8000`, then visit `http://localhost:8000`). Confirm:
- Nav shows "Claude Certified Architect — Study Guide" and a "Home"/"Project Plan" link (Project Plan will 404 until Task 15 — expected for now).
- 7 course cards render, one "Available" (AI Fluency), six "Coming Soon".
- The AI Fluency card shows "0/7 modules · Practice test: no attempts yet".

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "Add homepage course map"
```

---

### Task 8: Course 1 module content

**Files:**
- Create: `data/modules/ai-fluency-foundations.js`

- [ ] **Step 1: Write the implementation**

Create `data/modules/ai-fluency-foundations.js`:

```js
/* Study-guide content and knowledge checks for Course 1: AI Fluency: Framework & Foundations.
   Grounded in the publicly published AI Fluency Framework (Feller & Dakan, developed in
   partnership with Anthropic) and the course's own published module list. Written as
   original synthesis — meant to be refined further as each module is actually completed. */

const MODULES_AI_FLUENCY_FOUNDATIONS = [
  {
    id: 'intro',
    title: 'Introduction to AI Fluency',
    summary: 'Why AI Fluency is a learnable skill set, and a first look at the 4D Framework that structures the rest of the course.',
    keyConcepts: [
      'AI Fluency = working effectively, efficiently, ethically, and safely with AI systems.',
      'The 4D Framework: Delegation, Description, Discernment, Diligence.',
      'The four competencies interact as a loop, not a one-time checklist.',
    ],
    body: [
      "AI systems are now embedded in everyday work, but using them well isn't automatic — it's a learnable skill set, distinct from both blind trust and blanket avoidance. The AI Fluency Framework names this skill set and breaks it into four competencies.",
      '<strong>Delegation</strong> is deciding what to hand off to AI, what to keep for yourself, and choosing the right AI tool or technique for the goal. <strong>Description</strong> is communicating your intent clearly enough that the AI can produce something useful. <strong>Discernment</strong> is critically evaluating what comes back — is it accurate, appropriate, actually useful. <strong>Diligence</strong> is using AI responsibly: transparency, accountability, and thoughtful judgment about when and how to use it.',
      "These four aren't a strict linear sequence. In practice they loop — most visibly between Description and Discernment, where evaluating an output often reveals the original request was ambiguous, prompting another round of description.",
    ],
    knowledgeChecks: [
      {
        id: 'intro-kc1', domain: 'delegation',
        prompt: "Which best describes the 'Delegation' competency in the 4D Framework?",
        options: [
          { id: 'a', text: 'Deciding what to hand off to AI and choosing the right tool for the goal' },
          { id: 'b', text: 'Writing the most detailed possible prompt' },
          { id: 'c', text: 'Checking AI output for factual accuracy' },
          { id: 'd', text: 'Disclosing when AI was used in a work product' },
        ],
        correctOptionId: 'a',
        explanation: "Delegation is about the decision of what to hand off and to which tool — b describes Description, c describes Discernment, d describes Diligence.",
      },
      {
        id: 'intro-kc2', domain: 'framework-overview',
        prompt: 'What is the primary relationship between Description and Discernment in the 4D Framework?',
        options: [
          { id: 'a', text: 'They run once each, in strict sequence' },
          { id: 'b', text: "They form a loop — evaluating output often leads back to refining the description" },
          { id: 'c', text: 'They are unrelated competencies' },
          { id: 'd', text: 'Diligence replaces the need for both' },
        ],
        correctOptionId: 'b',
        explanation: 'The course explicitly names this the "Description–Discernment loop" — evaluating an output is often what reveals a description needs refining.',
      },
      {
        id: 'intro-kc3', domain: 'framework-overview',
        prompt: 'Which of the following is NOT one of the four competencies in the AI Fluency Framework?',
        options: [
          { id: 'a', text: 'Delegation' },
          { id: 'b', text: 'Documentation' },
          { id: 'c', text: 'Discernment' },
          { id: 'd', text: 'Diligence' },
        ],
        correctOptionId: 'b',
        explanation: 'The four are Delegation, Description, Discernment, and Diligence — "Documentation" is not one of them.',
      },
    ],
  },
  {
    id: 'genai-deep-dive',
    title: 'Deep Dive: What is Generative AI?',
    summary: 'Generative AI fundamentals, and the capabilities and limitations that make Discernment necessary.',
    keyConcepts: [
      'Generative AI produces new content by learning patterns from data, unlike discriminative AI which classifies from fixed categories.',
      'Large language models predict likely next tokens based on learned patterns, not by looking up stored facts.',
      "A model's 'knowledge cutoff' bounds what it knows without additional context.",
      'Fluent output is not the same as accurate output — this is the root cause of hallucination.',
    ],
    body: [
      'Generative AI refers to models trained to produce new content — text, images, code — by learning patterns from large datasets. This is different from earlier "discriminative" AI, which classifies or predicts from a fixed set of categories rather than generating something new.',
      "Large language models like Claude generate text by predicting likely continuations, token by token, based on patterns learned during training and conditioned on the current input. They're capable of fluent language generation, synthesizing across large amounts of information, and adapting tone or format on request.",
      "Their limitations follow directly from how they work: no persistent memory beyond what's in the current context (unless given tools for it), a training-data knowledge cutoff, and the ability to produce plausible-sounding but incorrect output — commonly called hallucination — because fluent generation doesn't guarantee factual accuracy. This is exactly why the Discernment competency, covered later in this course, matters.",
    ],
    knowledgeChecks: [
      {
        id: 'genai-kc1', domain: 'genai-fundamentals',
        prompt: "What does it mean that a large language model is fundamentally a 'pattern-completion' system?",
        options: [
          { id: 'a', text: 'It generates output by predicting likely continuations from learned patterns, not by looking up stored facts' },
          { id: 'b', text: 'It can only repeat text it has seen verbatim' },
          { id: 'c', text: 'It queries a live, verified database for every answer' },
          { id: 'd', text: 'It has no limitations on accuracy' },
        ],
        correctOptionId: 'a',
        explanation: 'This is the core mechanism behind both its fluency and its capacity for hallucination.',
      },
      {
        id: 'genai-kc2', domain: 'genai-fundamentals',
        prompt: 'Which of the following is a genuine limitation of current generative AI systems?',
        options: [
          { id: 'a', text: 'Hallucination — producing plausible but incorrect output with apparent confidence' },
          { id: 'b', text: 'Inability to process more than one sentence of input' },
          { id: 'c', text: 'Inability to adapt tone or format' },
          { id: 'd', text: 'Complete inability to summarize text' },
        ],
        correctOptionId: 'a',
        explanation: 'Hallucination is a real, well-documented limitation; the other options describe capabilities the models actually have.',
      },
      {
        id: 'genai-kc3', domain: 'genai-fundamentals',
        prompt: 'Generative AI differs from earlier discriminative AI systems mainly because it...',
        options: [
          { id: 'a', text: 'Produces new content rather than only classifying or predicting from fixed categories' },
          { id: 'b', text: 'Only works with numeric data' },
          { id: 'c', text: 'Cannot be used for text tasks' },
          { id: 'd', text: 'Requires no training data at all' },
        ],
        correctOptionId: 'a',
        explanation: 'This generation-vs-classification distinction is the defining difference between the two approaches.',
      },
    ],
  },
  {
    id: 'delegation',
    title: 'Delegation',
    summary: 'A closer look at deciding what to hand to AI, and applying Delegation to project planning.',
    keyConcepts: [
      'Two failure modes: over-delegation (handing off work needing human judgment/accountability) and under-delegation (doing tedious, AI-suited work by hand).',
      'Good delegation starts from a clear picture of the desired outcome before choosing a tool.',
      'Project planning through a Delegation lens means assigning each task within a project to its best-suited driver, not making one decision for the whole project.',
    ],
    body: [
      'Delegation is the competency of deciding what work to hand to AI, what to keep for yourself, and choosing the right AI tool or technique for a given goal. It has two failure modes: over-delegation — handing off work that actually needs human judgment, creativity, or accountability — and under-delegation — doing tedious, well-suited-for-AI work by hand instead.',
      "Good delegation starts with a clear picture of the desired outcome — the creative vision — before choosing a tool. The tool choice follows from the goal, not the other way around.",
      "Applied to project planning, Delegation means breaking a larger goal into discrete tasks and assigning each one to its best-suited driver — human, AI, or a collaborative loop between the two — rather than making one delegation decision for an entire project.",
    ],
    knowledgeChecks: [
      {
        id: 'delegation-kc1', domain: 'delegation',
        prompt: 'A team hands an AI system a high-stakes decision requiring accountability and nuanced judgment, without human review. This is an example of...',
        options: [
          { id: 'a', text: 'Over-delegation' },
          { id: 'b', text: 'Under-delegation' },
          { id: 'c', text: 'Good Diligence practice' },
          { id: 'd', text: 'Effective Description' },
        ],
        correctOptionId: 'a',
        explanation: 'Handing off work that genuinely requires human judgment and accountability, without review, is the over-delegation failure mode.',
      },
      {
        id: 'delegation-kc2', domain: 'delegation',
        prompt: 'Which should come first when practicing good Delegation?',
        options: [
          { id: 'a', text: 'Getting clear on the outcome you actually want' },
          { id: 'b', text: 'Picking the most advanced AI tool available' },
          { id: 'c', text: 'Writing the most detailed prompt possible' },
          { id: 'd', text: 'Asking the AI which tool to use' },
        ],
        correctOptionId: 'a',
        explanation: 'Delegation starts from the desired outcome; tool choice follows the goal, not the reverse.',
      },
      {
        id: 'delegation-kc3', domain: 'delegation',
        prompt: 'In project planning through a Delegation lens, why break a project into individual tasks before deciding who does what?',
        options: [
          { id: 'a', text: 'Different tasks within the same project may be best suited to different drivers' },
          { id: 'b', text: 'Every task in a project must always be delegated to AI' },
          { id: 'c', text: 'It removes the need for a project plan altogether' },
          { id: 'd', text: 'It guarantees the project needs no human involvement' },
        ],
        correctOptionId: 'a',
        explanation: 'A single project can contain tasks best suited to a human, to AI, or to a collaborative loop — task-level delegation is more precise than an all-or-nothing decision.',
      },
    ],
  },
  {
    id: 'description',
    title: 'Description',
    summary: 'A closer look at describing tasks effectively, plus a deep dive on prompting techniques.',
    keyConcepts: [
      'Effective description includes context, constraints, and criteria for what "good" looks like.',
      'Examples of the desired output and explicit statements of what to avoid reduce back-and-forth.',
      "Description is iterative — a perfect result on the first try isn't the norm.",
    ],
    body: [
      "Description is the competency of communicating a task or vision to an AI system clearly enough that it can produce something useful. Vague descriptions produce vague or misdirected output; effective description includes context (why/what this is for), constraints (format, length, tone), and criteria for what 'good' looks like.",
      'The Deep Dive on effective prompting techniques adds specifics: stating the desired output format, providing an example of the kind of result you want, and stating what to avoid all reduce back-and-forth with the AI.',
      "Description is iterative. An initial description rarely gets a perfect result on the first try — refining based on what the output reveals is normal practice, not a sign of doing it wrong.",
    ],
    knowledgeChecks: [
      {
        id: 'description-kc1', domain: 'description',
        prompt: "Which addition makes an AI description more effective?",
        options: [
          { id: 'a', text: 'Including context, constraints, and criteria for what "good" looks like' },
          { id: 'b', text: 'Keeping the request as vague as possible' },
          { id: 'c', text: 'Never providing examples' },
          { id: 'd', text: 'Avoiding any mention of format or tone' },
        ],
        correctOptionId: 'a',
        explanation: 'Context, constraints, and success criteria are exactly what turns a vague request into a well-described one.',
      },
      {
        id: 'description-kc2', domain: 'description',
        prompt: "Why is it normal to not get a perfect result from your first description of a task?",
        options: [
          { id: 'a', text: 'Description is inherently iterative, and refining based on output is part of the process' },
          { id: 'b', text: 'AI systems are incapable of following any instructions' },
          { id: 'c', text: "It means you should stop using AI for that task" },
          { id: 'd', text: 'It only happens with unusually complex tasks' },
        ],
        correctOptionId: 'a',
        explanation: 'The course frames Description as iterative by nature — refinement is expected, not a failure signal.',
      },
      {
        id: 'description-kc3', domain: 'description',
        prompt: 'According to the Deep Dive on effective prompting, which technique reduces back-and-forth with an AI system?',
        options: [
          { id: 'a', text: 'Providing an example of the kind of result you want' },
          { id: 'b', text: 'Omitting any context about the goal' },
          { id: 'c', text: 'Repeating the same request word-for-word if it fails' },
          { id: 'd', text: 'Never specifying a format' },
        ],
        correctOptionId: 'a',
        explanation: 'Concrete examples of the desired output are called out as one of the most effective ways to reduce iteration.',
      },
    ],
  },
  {
    id: 'discernment',
    title: 'Discernment',
    summary: 'A closer look at critically evaluating AI output, and the Description–Discernment loop.',
    keyConcepts: [
      'Discernment means evaluating AI output for accuracy, quality, and appropriateness.',
      'Subject-matter expertise improves Discernment by helping you catch subtle, confidently-stated errors.',
      'The Description–Discernment loop: evaluating output often reveals the original description was incomplete.',
    ],
    body: [
      'Discernment is the competency of thoughtfully and critically evaluating AI outputs, processes, and behavior — is this accurate, appropriate, and actually useful for the goal at hand.',
      "Discernment requires domain knowledge: the more you know about a subject, the better positioned you are to catch subtle errors an AI might present with total confidence.",
      "The Description–Discernment loop describes how these two competencies reinforce each other: evaluating an output (Discernment) often reveals that the original description was ambiguous or incomplete, which leads to refining the description and trying again. Fluency isn't getting a perfect prompt on the first attempt — it's running this evaluate-and-refine loop efficiently.",
    ],
    knowledgeChecks: [
      {
        id: 'discernment-kc1', domain: 'discernment',
        prompt: 'Why does subject-matter expertise improve Discernment?',
        options: [
          { id: 'a', text: 'It helps someone recognize subtle errors that a confident-sounding but incorrect output might otherwise hide' },
          { id: 'b', text: 'Experts never need to review AI output' },
          { id: 'c', text: 'It has no real effect on Discernment' },
          { id: 'd', text: 'Experts are less likely to use AI at all' },
        ],
        correctOptionId: 'a',
        explanation: 'Deeper subject knowledge makes it easier to catch errors that look plausible on the surface.',
      },
      {
        id: 'discernment-kc2', domain: 'discernment',
        prompt: 'What typically triggers a pass through the Description–Discernment loop?',
        options: [
          { id: 'a', text: 'Discovering, through evaluation, that the description was ambiguous or incomplete' },
          { id: 'b', text: 'A fixed schedule requiring prompt revisions on a timer' },
          { id: 'c', text: 'Random chance' },
          { id: 'd', text: 'The AI asking unprompted clarifying questions' },
        ],
        correctOptionId: 'a',
        explanation: 'Evaluating an output is what reveals gaps in the original description, prompting refinement.',
      },
      {
        id: 'discernment-kc3', domain: 'discernment',
        prompt: 'Discernment primarily involves evaluating AI output for...',
        options: [
          { id: 'a', text: 'Accuracy, quality, and appropriateness for the intended purpose' },
          { id: 'b', text: 'How quickly it was generated' },
          { id: 'c', text: 'Whether it uses AI-sounding vocabulary' },
          { id: 'd', text: 'How long the output is' },
        ],
        correctOptionId: 'a',
        explanation: 'These are the specific criteria named for evaluating AI output under Discernment.',
      },
    ],
  },
  {
    id: 'diligence',
    title: 'Diligence',
    summary: 'A closer look at using AI responsibly, ethically, and with accountability.',
    keyConcepts: [
      'Diligence is transparency about AI use plus accountability for AI-assisted work.',
      'It includes ethical considerations like respecting intellectual property and downstream impact.',
      'Diligence is what makes the other three competencies trustworthy.',
    ],
    body: [
      "Diligence is the competency of using AI responsibly: being transparent about when and how AI was used, remaining accountable for AI-assisted work as if you'd done it yourself, and making thoughtful choices about appropriate use cases.",
      'It includes ethical considerations — respecting intellectual property, avoiding uses that could mislead others about what is human- versus AI-generated when that distinction matters, and considering the downstream impact of AI-assisted work. It also covers practical responsibility: verifying AI-assisted work before relying on it, which connects directly back to Discernment.',
      "Diligence is what makes the other three competencies trustworthy. Delegation, Description, and Discernment done skillfully but applied irresponsibly still isn't AI fluency.",
    ],
    knowledgeChecks: [
      {
        id: 'diligence-kc1', domain: 'diligence',
        prompt: 'Which best reflects the Diligence competency?',
        options: [
          { id: 'a', text: 'Remaining accountable for AI-assisted work as if you had done it yourself, and being transparent about AI\'s role' },
          { id: 'b', text: 'Using AI for every task regardless of appropriateness' },
          { id: 'c', text: 'Avoiding AI entirely to eliminate all risk' },
          { id: 'd', text: 'Delegating accountability to the AI vendor if something goes wrong' },
        ],
        correctOptionId: 'a',
        explanation: 'Diligence centers on transparency and accountability, not blanket avoidance or overuse, and accountability can\'t be outsourced.',
      },
      {
        id: 'diligence-kc2', domain: 'diligence',
        prompt: 'A student submits an AI-written essay without disclosure when disclosure was required, and without checking it for accuracy. Which competency did they most clearly fail to apply?',
        options: [
          { id: 'a', text: 'Diligence' },
          { id: 'b', text: 'Delegation' },
          { id: 'c', text: 'Description' },
          { id: 'd', text: 'None — this is acceptable practice' },
        ],
        correctOptionId: 'a',
        explanation: 'Missing disclosure and unverified accuracy are both squarely Diligence failures.',
      },
      {
        id: 'diligence-kc3', domain: 'diligence',
        prompt: 'Why is Diligence often described as what makes the other three competencies trustworthy?',
        options: [
          { id: 'a', text: 'It governs how responsibly and ethically Delegation, Description, and Discernment are carried out throughout the work' },
          { id: 'b', text: 'It is applied only once, at the very end of a project' },
          { id: 'c', text: 'It replaces the need for Discernment entirely' },
          { id: 'd', text: 'It only applies to AI companies, not individual users' },
        ],
        correctOptionId: 'a',
        explanation: "Diligence is an ongoing responsibility that shapes how the other three competencies are applied, not a final checkbox.",
      },
    ],
  },
  {
    id: 'conclusion',
    title: 'Conclusion & Certification',
    summary: 'Recap of the 4D Framework as a loop, and how this course relates to the CCAR-F exam blueprint.',
    keyConcepts: [
      'The 4D Framework is a loop applied throughout a task, not a one-time checklist.',
      "This course's content is foundational — the CCAR-F exam blueprint is scored on separate technical domains (see the Project Plan page).",
    ],
    body: [
      'The four competencies connect as a loop, not a checklist: delegate thoughtfully, describe clearly, discern critically, and act with diligence throughout — not once each in sequence.',
      "This course's own assessment tests whether the framework can be applied to a project context, not just recited from memory.",
      "Worth noting for certification planning: the Claude Certified Architect – Foundations exam blueprint is scored on five separate technical domains (Agentic Architecture & Orchestration, Tool Design & MCP Integration, Claude Code Configuration & Workflows, Prompt Engineering & Structured Output, and Context Management & Reliability) built on the later prep courses — not on the 4D Framework directly. This course is genuinely foundational to working well with AI, but it sits outside the exam's own scored blueprint.",
    ],
    knowledgeChecks: [
      {
        id: 'conclusion-kc1', domain: 'framework-overview',
        prompt: 'The four competencies of the AI Fluency Framework are best understood as...',
        options: [
          { id: 'a', text: 'An interacting loop applied throughout a task, not a one-time checklist' },
          { id: 'b', text: 'Four unrelated, independent skills' },
          { id: 'c', text: 'A strict sequence performed once, in order, per project' },
          { id: 'd', text: 'A ranking of which AI tools are best' },
        ],
        correctOptionId: 'a',
        explanation: 'The course frames the 4D Framework as an interacting loop, most visibly between Description and Discernment.',
      },
      {
        id: 'conclusion-kc2', domain: 'framework-overview',
        prompt: 'True or false: the Claude Certified Architect – Foundations exam blueprint tests the 4D Framework directly as one of its scored domains.',
        options: [
          { id: 'a', text: 'False — the 4D Framework is foundational but not one of the exam\'s 5 scored domains' },
          { id: 'b', text: 'True — it is Domain 1 on the exam' },
          { id: 'c', text: 'True — it is the only thing tested' },
          { id: 'd', text: 'False — the exam has no defined domains at all' },
        ],
        correctOptionId: 'a',
        explanation: "The exam's 5 domains are technical (Agentic Architecture, Tool Design & MCP, Claude Code Config, Prompt Engineering, Context Management), built on the other prep courses.",
      },
      {
        id: 'conclusion-kc3', domain: 'diligence',
        prompt: 'Which competency is most directly responsible for making the other three trustworthy?',
        options: [
          { id: 'a', text: 'Diligence' },
          { id: 'b', text: 'Delegation' },
          { id: 'c', text: 'Description' },
          { id: 'd', text: 'Discernment' },
        ],
        correctOptionId: 'a',
        explanation: 'Diligence — transparency, accountability, and ethical judgment — is what makes skillful Delegation, Description, and Discernment trustworthy.',
      },
    ],
  },
];

if (typeof module !== 'undefined') module.exports = MODULES_AI_FLUENCY_FOUNDATIONS;
```

- [ ] **Step 2: Verify with a Node sanity check**

Run: `node -e "console.log(require('./data/modules/ai-fluency-foundations.js').length)"`
Expected: `7`

- [ ] **Step 3: Commit**

```bash
git add data/modules/ai-fluency-foundations.js
git commit -m "Add Course 1 module content: study guides and knowledge checks"
```

---

### Task 9: Render engine — course page, and course.html

**Files:**
- Modify: `js/render.js`
- Create: `course.html`

- [ ] **Step 1: Extend render.js with renderCoursePage**

Add to `js/render.js`, just before the final `return { ... }` line:

```js
  function renderCoursePage(course, modules, progressState, container) {
    if (course.status === 'placeholder') {
      container.innerHTML = `
        <header class="page-header">
          <h1>${course.title}</h1>
          <p class="subtitle">${course.description}</p>
          <a class="external-link" href="${course.skilljarUrl}" target="_blank" rel="noopener">Open official course on Skilljar ↗</a>
        </header>
        <section class="section">
          <span class="status-badge status-badge--placeholder">Coming Soon</span>
          <p class="subtitle" style="margin-top:0.75rem;">Not yet started. This course's study guide and practice test will be built out once it's actually completed.</p>
        </section>
      `;
      return;
    }

    const moduleRows = modules.map((m) => {
      const studied = Progress.isModuleStudied(progressState, course.id, m.id);
      return `
        <a class="module-row" href="module.html?course=${course.id}&module=${m.id}">
          <span class="module-row-status">${studied ? '✓' : '○'}</span>
          <span class="module-row-title">${m.title}</span>
        </a>`;
    }).join('');

    const best = Progress.bestPracticeScore(progressState, course.id);

    container.innerHTML = `
      <header class="page-header">
        <h1>${course.title}</h1>
        <p class="subtitle">${course.description}</p>
        <a class="external-link" href="${course.skilljarUrl}" target="_blank" rel="noopener">Open official course on Skilljar ↗</a>
      </header>
      <section class="section">
        <h2>Modules</h2>
        <div class="module-list">${moduleRows}</div>
      </section>
      <section class="section">
        <h2>Practice Test</h2>
        <p class="subtitle">${best === null ? "You haven't attempted this course's practice test yet." : `Best score: ${best}%`}</p>
        <a class="button" href="practice-test.html?course=${course.id}">Take Practice Test</a>
      </section>
    `;
  }
```

Update the file's final `return { ... };` line to include the new function:

```js
  return { getParam, renderNav, renderCourseMap, courseProgressLabel, renderCoursePage };
```

- [ ] **Step 2: Write course.html**

Create `course.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Course – Claude Certified Architect Study Guide</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div id="nav"></div>
  <main id="app"></main>
  <script src="js/quiz-engine.js"></script>
  <script src="js/progress.js"></script>
  <script src="data/courses.js"></script>
  <script src="data/modules/ai-fluency-foundations.js"></script>
  <script src="js/render.js"></script>
  <script>
    document.getElementById('nav').innerHTML = Render.renderNav('home');
    const courseId = Render.getParam('course');
    const course = COURSES.find((c) => c.id === courseId);
    const app = document.getElementById('app');
    if (!course) {
      app.innerHTML = '<p>Course not found. <a href="index.html">Back to course map</a>.</p>';
    } else {
      const modules = course.id === 'ai-fluency-foundations' ? MODULES_AI_FLUENCY_FOUNDATIONS : [];
      const progressState = Progress.load(window.localStorage);
      Render.renderCoursePage(course, modules, progressState, app);
    }
  </script>
</body>
</html>
```

- [ ] **Step 3: Verify in the browser**

Visit `course.html?course=ai-fluency-foundations`. Confirm 7 modules listed with "○" status, "Take Practice Test" button present (link will 404 until Task 13 — expected). Visit `course.html?course=claude-101` and confirm it shows the placeholder "Coming Soon" state instead.

- [ ] **Step 4: Commit**

```bash
git add js/render.js course.html
git commit -m "Add course page: module list and placeholder state"
```

---

### Task 10: Render engine — module page (study guide + knowledge checks), and module.html

**Files:**
- Modify: `js/render.js`
- Create: `module.html`

- [ ] **Step 1: Extend render.js with renderModulePage**

Add to `js/render.js`, before the final `return`:

```js
  function renderKnowledgeCheck(question) {
    const optionsHtml = question.options.map((opt) =>
      `<button class="option-button" data-option-id="${opt.id}">${opt.text}</button>`
    ).join('');
    return `
      <div class="question-card" data-question-id="${question.id}">
        <p class="question-prompt">${question.prompt}</p>
        <div class="option-list">${optionsHtml}</div>
        <div class="explanation" style="display:none;"></div>
      </div>
    `;
  }

  function wireKnowledgeChecks(container, questions) {
    questions.forEach((q) => {
      const card = container.querySelector(`[data-question-id="${q.id}"]`);
      const explanationEl = card.querySelector('.explanation');
      card.querySelectorAll('.option-button').forEach((btn) => {
        btn.addEventListener('click', () => {
          const selectedId = btn.getAttribute('data-option-id');
          card.querySelectorAll('.option-button').forEach((b) => {
            b.disabled = true;
            const optId = b.getAttribute('data-option-id');
            if (optId === q.correctOptionId) b.classList.add('option-button--correct');
            else if (optId === selectedId) b.classList.add('option-button--incorrect');
          });
          explanationEl.textContent = q.explanation;
          explanationEl.style.display = 'block';
        });
      });
    });
  }

  function renderModulePage(course, module, progressState, container) {
    const alreadyStudied = Progress.isModuleStudied(progressState, course.id, module.id);
    container.innerHTML = `
      <header class="page-header">
        <p class="subtitle" style="margin-bottom:0.25rem;"><a href="course.html?course=${course.id}">← ${course.title}</a></p>
        <h1>${module.title}</h1>
        <p class="subtitle">${module.summary}</p>
      </header>
      <div class="key-concepts">
        <strong>Key concepts</strong>
        <ul>${module.keyConcepts.map((k) => `<li>${k}</li>`).join('')}</ul>
      </div>
      <section class="section">${module.body.map((p) => `<p>${p}</p>`).join('')}</section>
      <section class="section">
        <h2>Knowledge Check</h2>
        ${module.knowledgeChecks.map(renderKnowledgeCheck).join('')}
      </section>
      <button id="mark-studied-btn" class="button" ${alreadyStudied ? 'disabled' : ''}>
        ${alreadyStudied ? '✓ Marked as studied' : 'Mark as studied'}
      </button>
    `;

    wireKnowledgeChecks(container, module.knowledgeChecks);

    container.querySelector('#mark-studied-btn').addEventListener('click', (e) => {
      Progress.markModuleStudied(progressState, course.id, module.id);
      Progress.save(progressState, window.localStorage);
      e.target.disabled = true;
      e.target.textContent = '✓ Marked as studied';
    });
  }
```

Update the final `return { ... };` line:

```js
  return { getParam, renderNav, renderCourseMap, courseProgressLabel, renderCoursePage, renderModulePage };
```

- [ ] **Step 2: Write module.html**

Create `module.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Module – Claude Certified Architect Study Guide</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div id="nav"></div>
  <main id="app"></main>
  <script src="js/quiz-engine.js"></script>
  <script src="js/progress.js"></script>
  <script src="data/courses.js"></script>
  <script src="data/modules/ai-fluency-foundations.js"></script>
  <script src="js/render.js"></script>
  <script>
    document.getElementById('nav').innerHTML = Render.renderNav('home');
    const courseId = Render.getParam('course');
    const moduleId = Render.getParam('module');
    const course = COURSES.find((c) => c.id === courseId);
    const app = document.getElementById('app');
    const allModules = courseId === 'ai-fluency-foundations' ? MODULES_AI_FLUENCY_FOUNDATIONS : [];
    const module = allModules.find((m) => m.id === moduleId);
    if (!course || !module) {
      app.innerHTML = '<p>Module not found. <a href="index.html">Back to course map</a>.</p>';
    } else {
      const progressState = Progress.load(window.localStorage);
      Render.renderModulePage(course, module, progressState, app);
    }
  </script>
</body>
</html>
```

- [ ] **Step 3: Verify in the browser**

Visit `module.html?course=ai-fluency-foundations&module=intro`. Confirm: study guide text and key concepts render; clicking a knowledge-check option disables all options in that card, highlights correct in green / your wrong pick in red, and shows the explanation; clicking "Mark as studied" disables the button and shows "✓ Marked as studied". Reload the page — the button should still show "✓ Marked as studied" (persisted via localStorage). Go back to `course.html?course=ai-fluency-foundations` and confirm the "intro" row now shows "✓".

- [ ] **Step 4: Commit**

```bash
git add js/render.js module.html
git commit -m "Add module page: study guide, knowledge checks, mark-as-studied"
```

---

### Task 11: Course 1 practice-test question bank

**Files:**
- Create: `data/questions/ai-fluency-foundations.js`

- [ ] **Step 1: Write the implementation**

Create `data/questions/ai-fluency-foundations.js`:

```js
/* Scored practice-test question bank for Course 1. Scenario-based, in the style
   demonstrated by Anthropic's own CCAR-F Exam Guide sample questions (situation,
   4 options, one best answer, explanation) — written originally against this
   course's own published content, not copied from any exam guide or course platform.
   Only the 5 domains named in the design spec are used here (framework-overview is
   reserved for the ungraded per-module knowledge checks). */

const QUESTIONS_AI_FLUENCY_FOUNDATIONS = [
  {
    id: 'pt-1', domain: 'delegation',
    prompt: "You need to write a short internal announcement about a schedule change. It's low-stakes, has a clear standard format, and needs to go out in the next ten minutes. Applying good Delegation, what should you do?",
    options: [
      { id: 'a', text: 'Delegate the full draft to an AI assistant and send it after a quick read-through' },
      { id: 'b', text: 'Write it entirely by hand to be safe' },
      { id: 'c', text: 'Spend 20 minutes designing a custom prompt template before drafting' },
      { id: 'd', text: 'Ask a colleague to write it instead of using AI at all' },
    ],
    correctOptionId: 'a',
    explanation: 'Low-stakes, well-defined, time-boxed tasks are exactly what\'s well-suited for AI delegation with a light human check. B wastes time on a task AI handles well; C over-invests process for a low-stakes task; D avoids delegation without a good reason.',
  },
  {
    id: 'pt-2', domain: 'delegation',
    prompt: "A manager is deciding whether to delegate final hiring decisions to an AI screening tool. This decision significantly affects people's careers and requires nuanced judgment. What does good Delegation suggest?",
    options: [
      { id: 'a', text: 'Delegate the decision fully to the AI tool to reduce bias' },
      { id: 'b', text: 'Use AI to help organize and summarize candidate information, but keep the final judgment with a human' },
      { id: 'c', text: 'Avoid using AI anywhere in the hiring process' },
      { id: 'd', text: 'Let the AI decide, then have a human rubber-stamp the outcome without review' },
    ],
    correctOptionId: 'b',
    explanation: 'High-stakes decisions requiring nuanced judgment and accountability are the clearest case for keeping a human in the loop. A over-delegates; C under-delegates when AI could still help with lower-stakes parts; D isn\'t genuine human judgment.',
  },
  {
    id: 'pt-3', domain: 'delegation',
    prompt: 'Before choosing which AI tool or technique to use for a new project, what should come first according to the Delegation competency?',
    options: [
      { id: 'a', text: 'Researching every available AI tool on the market' },
      { id: 'b', text: 'Getting a clear picture of the outcome you\'re trying to achieve' },
      { id: 'c', text: 'Writing the most detailed prompt you can' },
      { id: 'd', text: 'Asking the AI itself what tool it recommends' },
    ],
    correctOptionId: 'b',
    explanation: 'Delegation starts from the desired outcome; tool choice follows from that goal. The other options put a tactic before the goal is even clear.',
  },
  {
    id: 'pt-4', domain: 'description',
    prompt: "You ask an AI to 'make this report better' with no other context, and get back generic edits that don't address what you actually needed. What's the most likely cause?",
    options: [
      { id: 'a', text: 'The AI model isn\'t capable enough for this task' },
      { id: 'b', text: 'The description lacked context, constraints, and criteria for what "better" means' },
      { id: 'c', text: 'You should have used a completely different AI tool' },
      { id: 'd', text: 'This is an unavoidable limitation of all generative AI' },
    ],
    correctOptionId: 'b',
    explanation: 'Vague descriptions produce vague results. Providing what "better" means — audience, goal, tone, what to fix — is a Description skill, not a tool or model limitation.',
  },
  {
    id: 'pt-5', domain: 'description',
    prompt: 'Which addition would most improve a description asking an AI to draft a customer email?',
    options: [
      { id: 'a', text: 'Repeating the request in different words for emphasis' },
      { id: 'b', text: 'Providing an example of the tone and format you want, and what to avoid' },
      { id: 'c', text: 'Making the request as short as possible' },
      { id: 'd', text: 'Leaving the format completely open' },
    ],
    correctOptionId: 'b',
    explanation: 'Concrete examples and explicit boundaries reduce back-and-forth. Repeating the request adds no new information, and removing constraints (c, d) makes the description less useful, not more.',
  },
  {
    id: 'pt-6', domain: 'description',
    prompt: 'After receiving a first draft from an AI, you realize your original request was ambiguous about the target audience. What\'s the appropriate next step in the Description competency?',
    options: [
      { id: 'a', text: 'Discard AI assistance for this task entirely' },
      { id: 'b', text: 'Refine your description with the missing context and try again' },
      { id: 'c', text: 'Accept the draft as-is since asking again would be inefficient' },
      { id: 'd', text: 'Assume the AI should have inferred the audience correctly' },
    ],
    correctOptionId: 'b',
    explanation: 'Description is iterative; refining based on what the output reveals is expected practice, not a failure.',
  },
  {
    id: 'pt-7', domain: 'discernment',
    prompt: 'An AI-generated summary of a legal document states a confident but false claim about a filing deadline, and it reaches a decision-maker unchecked. What competency failure allowed this?',
    options: [
      { id: 'a', text: 'Delegation — the wrong task was delegated to AI' },
      { id: 'b', text: 'Discernment — the output wasn\'t critically evaluated before being relied on' },
      { id: 'c', text: 'Description — the request was too detailed' },
      { id: 'd', text: 'This is unavoidable and not a competency failure' },
    ],
    correctOptionId: 'b',
    explanation: 'Evaluating AI output for accuracy before relying on it is exactly what Discernment covers — the failure here is trusting output without verification.',
  },
  {
    id: 'pt-8', domain: 'discernment',
    prompt: 'Why does subject-matter expertise improve a person\'s Discernment when reviewing AI output?',
    options: [
      { id: 'a', text: 'Experts are less likely to use AI at all' },
      { id: 'b', text: 'Expertise helps someone recognize subtle errors that a confident-sounding but incorrect output might otherwise hide' },
      { id: 'c', text: 'Experts don\'t need to review AI output' },
      { id: 'd', text: 'Expertise has no real effect on Discernment' },
    ],
    correctOptionId: 'b',
    explanation: 'The more you know about a subject, the better positioned you are to catch errors that look plausible on the surface.',
  },
  {
    id: 'pt-9', domain: 'discernment',
    prompt: 'What typically causes someone to revisit and refine their original prompt after evaluating an AI\'s output?',
    options: [
      { id: 'a', text: 'Random chance' },
      { id: 'b', text: 'Discovering, through evaluation, that the description was ambiguous or incomplete' },
      { id: 'c', text: 'The AI directly asking for clarification' },
      { id: 'd', text: 'A fixed schedule requiring revisions every few minutes' },
    ],
    correctOptionId: 'b',
    explanation: 'This is the Description–Discernment loop in action: evaluating output reveals gaps in the original description, prompting refinement.',
  },
  {
    id: 'pt-10', domain: 'diligence',
    prompt: 'A student uses AI to help draft an assignment, submits it without required disclosure, and doesn\'t check it for accuracy. Which competency was most clearly not applied?',
    options: [
      { id: 'a', text: 'Delegation' },
      { id: 'b', text: 'Description' },
      { id: 'c', text: 'Diligence' },
      { id: 'd', text: 'Discernment only, not Diligence' },
    ],
    correctOptionId: 'c',
    explanation: 'Transparency about AI use and accountability for the final work are core to Diligence — the missing disclosure and unchecked accuracy both point there.',
  },
  {
    id: 'pt-11', domain: 'diligence',
    prompt: 'Which best reflects the Diligence competency in a workplace setting?',
    options: [
      { id: 'a', text: 'Using AI for every task regardless of appropriateness' },
      { id: 'b', text: 'Being transparent about AI\'s role in a work product and remaining accountable for its accuracy' },
      { id: 'c', text: 'Avoiding AI entirely to eliminate risk' },
      { id: 'd', text: 'Delegating accountability to the AI vendor if something goes wrong' },
    ],
    correctOptionId: 'b',
    explanation: 'Diligence is about responsible, transparent, accountable use — not blanket avoidance (c) or overuse (a), and accountability can\'t be outsourced (d).',
  },
  {
    id: 'pt-12', domain: 'diligence',
    prompt: 'Why is Diligence often described as what makes the other three competencies trustworthy?',
    options: [
      { id: 'a', text: 'It is applied only at the very end of a project, after the other three' },
      { id: 'b', text: 'It governs how responsibly and ethically Delegation, Description, and Discernment are carried out throughout the work' },
      { id: 'c', text: 'It replaces the need for Discernment' },
      { id: 'd', text: 'It only applies to AI companies, not individual users' },
    ],
    correctOptionId: 'b',
    explanation: 'Diligence isn\'t a final step but an ongoing responsibility shaping how the other competencies are applied — it doesn\'t replace Discernment, it depends on it.',
  },
  {
    id: 'pt-13', domain: 'genai-fundamentals',
    prompt: 'Why can a large language model state an incorrect fact with high apparent confidence?',
    options: [
      { id: 'a', text: 'It is deliberately trying to deceive the user' },
      { id: 'b', text: 'It generates text by predicting likely continuations from learned patterns, which can produce fluent but inaccurate output ("hallucination")' },
      { id: 'c', text: 'It always retrieves facts from a verified live database' },
      { id: 'd', text: 'It only makes errors when explicitly asked to' },
    ],
    correctOptionId: 'b',
    explanation: 'This is the core mechanism behind hallucination: fluency in generation doesn\'t guarantee factual accuracy.',
  },
  {
    id: 'pt-14', domain: 'genai-fundamentals',
    prompt: 'What most clearly distinguishes generative AI from earlier discriminative AI systems?',
    options: [
      { id: 'a', text: 'Generative AI only works with images, not text' },
      { id: 'b', text: 'Generative AI produces new content, while discriminative AI classifies or predicts from fixed categories' },
      { id: 'c', text: 'Generative AI cannot process any user input' },
      { id: 'd', text: 'There is no meaningful difference between the two' },
    ],
    correctOptionId: 'b',
    explanation: 'This generation-vs-classification distinction is the defining difference covered in the course\'s Generative AI deep dive.',
  },
  {
    id: 'pt-15', domain: 'genai-fundamentals',
    prompt: 'A model\'s "knowledge cutoff" most directly limits which of the following?',
    options: [
      { id: 'a', text: 'Its ability to follow formatting instructions' },
      { id: 'b', text: 'Its awareness of events or information after its training data was collected, unless supplied in context' },
      { id: 'c', text: 'Its ability to generate any text at all' },
      { id: 'd', text: 'Its ability to run at all without an internet connection' },
    ],
    correctOptionId: 'b',
    explanation: 'Knowledge cutoff specifically bounds what the model "knows" from training versus what must be supplied via context or tools.',
  },
];

if (typeof module !== 'undefined') module.exports = QUESTIONS_AI_FLUENCY_FOUNDATIONS;
```

- [ ] **Step 2: Verify with a Node sanity check**

Run: `node -e "const q = require('./data/questions/ai-fluency-foundations.js'); console.log(q.length, new Set(q.map(x=>x.domain)).size)"`
Expected: `15 5` (15 questions across 5 domains)

- [ ] **Step 3: Commit**

```bash
git add data/questions/ai-fluency-foundations.js
git commit -m "Add Course 1 scored practice-test question bank"
```

---

### Task 12: Render engine — practice test, and practice-test.html

**Files:**
- Modify: `js/render.js`
- Create: `practice-test.html`

- [ ] **Step 1: Extend render.js with renderPracticeTest**

Add to `js/render.js`, before the final `return`. Note the option buttons below are marked `type="button"` — without it, a plain `<button>` inside a `<form>` defaults to `type="submit"`, so clicking any single option would immediately submit the whole test (this was caught live in a browser during Sub-project 1's implementation and fixed; kept explicit here so the same bug isn't reintroduced when this pattern is reused for a future course's practice test):

```js
  const DOMAIN_LABELS = {
    delegation: 'Delegation',
    description: 'Description',
    discernment: 'Discernment',
    diligence: 'Diligence',
    'genai-fundamentals': 'Generative AI Fundamentals',
  };

  function renderPracticeTest(course, questions, progressState, container) {
    const questionsHtml = questions.map((q, i) => `
      <div class="question-card" data-question-id="${q.id}">
        <p class="question-prompt">${i + 1}. ${q.prompt}</p>
        <div class="option-list">
          ${q.options.map((opt) => `<button type="button" class="option-button" data-option-id="${opt.id}">${opt.text}</button>`).join('')}
        </div>
        <div class="explanation" style="display:none;"></div>
      </div>
    `).join('');

    container.innerHTML = `
      <header class="page-header">
        <p class="subtitle" style="margin-bottom:0.25rem;"><a href="course.html?course=${course.id}">← ${course.title}</a></p>
        <h1>Practice Test</h1>
        <p class="subtitle">Answer every question, then submit for your score and a domain breakdown.</p>
      </header>
      <div id="results"></div>
      <form id="practice-test-form">
        ${questionsHtml}
        <button type="submit" class="button">Submit Test</button>
      </form>
    `;

    const answers = {};
    const form = container.querySelector('#practice-test-form');

    questions.forEach((q) => {
      const card = form.querySelector(`[data-question-id="${q.id}"]`);
      card.querySelectorAll('.option-button').forEach((btn) => {
        btn.addEventListener('click', () => {
          answers[q.id] = btn.getAttribute('data-option-id');
          card.querySelectorAll('.option-button').forEach((b) => b.classList.remove('option-button--selected'));
          btn.classList.add('option-button--selected');
        });
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const result = QuizEngine.scoreTest(questions, answers);

      // Reveal correct/incorrect per question with explanations.
      questions.forEach((q) => {
        const card = form.querySelector(`[data-question-id="${q.id}"]`);
        const explanationEl = card.querySelector('.explanation');
        card.querySelectorAll('.option-button').forEach((btn) => {
          const optId = btn.getAttribute('data-option-id');
          btn.disabled = true;
          if (optId === q.correctOptionId) btn.classList.add('option-button--correct');
          else if (optId === answers[q.id]) btn.classList.add('option-button--incorrect');
        });
        explanationEl.textContent = q.explanation;
        explanationEl.style.display = 'block';
      });

      Progress.recordPracticeScore(progressState, course.id, result.percent);
      Progress.save(progressState, window.localStorage);

      const domainRows = result.domainBreakdown.map((d) => `
        <div class="domain-bar-row">
          <span>${DOMAIN_LABELS[d.domain] || d.domain}</span>
          <span class="domain-bar-track"><span class="domain-bar-fill" style="width:${d.percent}%"></span></span>
          <span>${d.percent}%</span>
        </div>
      `).join('');

      container.querySelector('#results').innerHTML = `
        <div class="score-summary">
          <div class="score-number">${result.percent}%</div>
          <p class="subtitle">${result.correct} of ${result.total} correct</p>
          <div class="domain-breakdown">${domainRows}</div>
        </div>
      `;
      container.querySelector('#results').scrollIntoView({ behavior: 'smooth' });
    });
  }
```

Update the final `return { ... };` line to its complete form:

```js
  return {
    getParam, renderNav, renderCourseMap, courseProgressLabel,
    renderCoursePage, renderModulePage, renderPracticeTest,
  };
```

- [ ] **Step 2: Write practice-test.html**

Create `practice-test.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Practice Test – Claude Certified Architect Study Guide</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div id="nav"></div>
  <main id="app"></main>
  <script src="js/quiz-engine.js"></script>
  <script src="js/progress.js"></script>
  <script src="data/courses.js"></script>
  <script src="data/questions/ai-fluency-foundations.js"></script>
  <script src="js/render.js"></script>
  <script>
    document.getElementById('nav').innerHTML = Render.renderNav('home');
    const courseId = Render.getParam('course');
    const course = COURSES.find((c) => c.id === courseId);
    const app = document.getElementById('app');
    const questions = courseId === 'ai-fluency-foundations' ? QUESTIONS_AI_FLUENCY_FOUNDATIONS : [];
    if (!course || questions.length === 0) {
      app.innerHTML = '<p>No practice test available yet for this course. <a href="index.html">Back to course map</a>.</p>';
    } else {
      const progressState = Progress.load(window.localStorage);
      Render.renderPracticeTest(course, questions, progressState, app);
    }
  </script>
</body>
</html>
```

- [ ] **Step 3: Add the `.option-button--selected` style**

The `--selected` state (chosen-but-not-yet-submitted) needs a style distinct from `--correct`/`--incorrect`. Add to `css/style.css`, right after the `.option-button--incorrect` rule:

```css
.option-button--selected { border-color: var(--color-accent); background: var(--color-accent-soft); }
```

- [ ] **Step 4: Verify in the browser**

Visit `practice-test.html?course=ai-fluency-foundations`. Confirm: 15 questions render; clicking an option highlights it as selected; submitting without answering some questions still scores (missing = incorrect, no crash — this matches the quiz-engine test from Task 2); after submit, every question shows correct/incorrect coloring and its explanation, and a score summary with a 5-row domain breakdown appears at the top. Go back to `course.html?course=ai-fluency-foundations` and confirm "Best score: NN%" now shows.

- [ ] **Step 5: Commit**

```bash
git add js/render.js css/style.css practice-test.html
git commit -m "Add scored practice test with domain-breakdown diagnostics"
```

---

### Task 13: Progress reflected on the homepage

**Files:**
- None to create — this task is a verification-only checkpoint since Task 6/7 already read live progress state on every page load.

- [ ] **Step 1: Verify end-to-end progress flow in the browser**

Starting from a fresh browser profile or after clearing `localStorage` (`window.localStorage.clear()` in the console):

1. Visit `index.html` — AI Fluency card shows "0/7 modules · Practice test: no attempts yet".
2. Visit `module.html?course=ai-fluency-foundations&module=intro`, click "Mark as studied".
3. Return to `index.html` — card now shows "1/7 modules · Practice test: no attempts yet".
4. Take the practice test at `practice-test.html?course=ai-fluency-foundations` and submit.
5. Return to `index.html` — card now shows "1/7 modules · Practice test: NN%".

No code changes are needed if this already works — it confirms Tasks 6–12 integrate correctly. If any step doesn't reflect correctly, note which task's code needs a fix before proceeding.

- [ ] **Step 2: Commit (only if a fix was needed)**

```bash
git add -A
git commit -m "Fix progress reflection on homepage" # only if changes were made
```

---

### Task 14: Project plan page

**Files:**
- Create: `project-plan.html`

- [ ] **Step 1: Write the page**

Create `project-plan.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Project Plan – Claude Certified Architect Study Guide</title>
  <meta name="description" content="This site's own project, broken down through the AI Fluency 4D Framework.">
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div id="nav"></div>
  <main>
    <header class="page-header">
      <h1>The Project Plan, Through the 4D Framework</h1>
      <p class="subtitle">This site is a "learning in public" meta-project: it teaches the certification material while modeling the AI Fluency Framework (Delegation, Description, Discernment, Diligence) that Course 1 itself teaches. Below is how this project's own major tasks were divided between human and AI — and why.</p>
    </header>

    <section class="section">
      <h2>Vision &amp; Success Criteria</h2>
      <ul>
        <li>Pass the Claude Certified Architect – Foundations exam.</li>
        <li>Be able to explain the 4D Framework and generative-AI fundamentals from memory, without notes.</li>
        <li>Have a diagnostic practice-test system that shows which domain to restudy, not just a pass/fail score.</li>
        <li>Return to this plan at each stage of the course to deliberately practice Description, Delegation, Discernment, and Diligence — not run them on autopilot.</li>
      </ul>
    </section>

    <section class="section">
      <h2>Task Breakdown by Driver</h2>
      <div style="overflow-x:auto;">
        <table class="plan-table">
          <thead>
            <tr><th>Task</th><th>Best driven by</th><th>Why</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>Research exam scope, syllabus, module structure</td>
              <td>AI, human confirms</td>
              <td>Web research and synthesis is fast for AI; the human spot-checks accuracy against what's actually seen in Skilljar.</td>
            </tr>
            <tr>
              <td>Site engineering (render engine, quiz/scoring logic, progress tracking)</td>
              <td>AI, human reviews</td>
              <td>Deterministic, boilerplate-heavy code is a good delegation target; the human verifies correct behavior in the browser.</td>
            </tr>
            <tr>
              <td>Writing the actual study-guide content per module</td>
              <td>Human, AI assists structure</td>
              <td>The crux of this whole project: if AI writes the notes from course material, the retention benefit disappears. The human processes and summarizes what they actually learned; AI organizes it into clean, consistent prose.</td>
            </tr>
            <tr>
              <td>Drafting practice questions</td>
              <td>Collaborative</td>
              <td>The human identifies what's genuinely worth testing; AI drafts question variants and distractors and tags them by domain; the human verifies no invented facts slipped in.</td>
            </tr>
            <tr>
              <td>Visual/UX design direction</td>
              <td>Human (taste), AI (implementation)</td>
              <td>The human picks the direction and constraints (Bold &amp; Editorial, no gamification); AI builds it.</td>
            </tr>
            <tr>
              <td>Fact-checking AI-assisted content</td>
              <td>Human</td>
              <td>AI can confidently state incorrect specifics about Claude/Anthropic products — this is the highest-stakes Discernment checkpoint in the whole project.</td>
            </tr>
            <tr>
              <td>QA / testing the site (links, rendering, scoring)</td>
              <td>Collaborative</td>
              <td>AI runs mechanical verification (unit tests, browser checks); the human does a final pass.</td>
            </tr>
            <tr>
              <td>Deployment, ongoing maintenance</td>
              <td>AI, human approves</td>
              <td>Git/GitHub Pages operations are low-risk to delegate; publishing still needs a human go-ahead each time.</td>
            </tr>
            <tr>
              <td>Repeating the pattern for each new course</td>
              <td>Collaborative loop</td>
              <td>The human brings raw understanding from the course just completed; AI structures it fast; the human verifies. This loop <em>is</em> the 4D Framework in practice.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="section">
      <h2>Scope &amp; Roadmap</h2>
      <p>The full certification path bundles 7 prep courses. This first build covers the reusable system — site architecture, this project plan, and the study/practice-test engine — fully populated for Course 1 (AI Fluency: Framework &amp; Foundations), the course in progress when this site was built. The other 6 courses ship as visible placeholder stubs on the <a href="index.html">course map</a>: the full path is real and visible, but no content is fabricated for courses not yet studied. Each placeholder gets converted into real content — study guide, knowledge checks, and a domain-tagged practice test — using this same collaborative loop as each course is actually completed.</p>
      <p>Courses that map to the official <strong>Claude Certified Architect – Foundations (CCAR-F)</strong> exam blueprint — Building with the Claude API, Claude Code in Action, and Introduction to MCP — will tag their practice questions with the 5 official exam domains (Agentic Architecture &amp; Orchestration, Tool Design &amp; MCP Integration, Claude Code Configuration &amp; Workflows, Prompt Engineering &amp; Structured Output, Context Management &amp; Reliability) rather than the 4D Framework, so their diagnostics mirror the real exam's own score report. Once enough of those courses are built out, a cumulative 60-question practice exam will pull from all of them, matching the real exam's 4-of-6-scenario, 120-minute, 720/1000-passing-score structure.</p>
    </section>
  </main>
  <script src="js/render.js"></script>
  <script>document.getElementById('nav').innerHTML = Render.renderNav('plan');</script>
</body>
</html>
```

- [ ] **Step 2: Verify in the browser**

Visit `project-plan.html`. Confirm the nav's "Project Plan" link is highlighted as active, the table renders all 9 rows with readable text, and the page is reachable by clicking "Project Plan" in the nav from any other page (Task 7's `index.html` link now resolves instead of 404ing).

- [ ] **Step 3: Commit**

```bash
git add project-plan.html
git commit -m "Add project plan page: 4D-framework task breakdown"
```

---

### Task 15: Final verification pass

**Files:**
- None to create — full manual QA per spec §8.

- [ ] **Step 1: Run the automated test suite**

Run: `node tests/quiz-engine.test.js`
Expected: `All quiz-engine tests passed.`, exit code 0.

- [ ] **Step 2: Full browser walkthrough**

Using a local server (`python3 -m http.server 8000`), and starting from a cleared `localStorage`:

1. `index.html` — 7 course cards, 1 "Available" + 6 "Coming Soon", visually distinct via the status badge.
2. Click into the AI Fluency course card → `course.html?course=ai-fluency-foundations` — 7 modules listed, "Take Practice Test" button visible.
3. Click a placeholder course card (e.g. Claude 101) → shows the "Coming Soon" stub, no module list, no broken links.
4. Open a module, answer all its knowledge checks, click "Mark as studied" — button disables and label updates.
5. Return to the course page — that module's row shows "✓".
6. Take the practice test, submit — every question shows correct/incorrect + explanation, and a 5-row domain breakdown with a percent-correct bar appears.
7. Return to `index.html` — the course card reflects both updated module count and best practice score.
8. Click "Project Plan" in the nav from any page — loads correctly, nav shows it as the active link.
9. Resize the browser to a narrow (mobile) width — confirm the card grid reflows to a single column and the domain-breakdown bars don't overflow horizontally.

- [ ] **Step 3: Check console for errors**

Open the browser console on each of the 5 pages (`index.html`, `course.html`, `module.html`, `practice-test.html`, `project-plan.html`) and confirm no JavaScript errors are logged.

- [ ] **Step 4: Commit any fixes found during verification**

```bash
git add -A
git commit -m "Fix issues found during final verification pass" # only if changes were made
```

- [ ] **Step 5: Push and enable GitHub Pages (ask the user first)**

This step publishes the site publicly — confirm with the user before running:

```bash
git push -u origin main
```

Then enable GitHub Pages for the repo (Settings → Pages → Source: `main` branch, `/` root) via the GitHub web UI or:

```bash
gh api repos/dmarkel/Claude_Certification_Study/pages -X POST -f "source[branch]=main" -f "source[path]=/"
```

The live site will be at `https://dmarkel.github.io/Claude_Certification_Study/`.

---

## Plan Self-Review

**Spec coverage:**
- §1 Vision/Success criteria → Task 14 (project-plan.html) states them explicitly; the diagnostic domain breakdown is Task 12.
- §2/§2.5 Scope, decomposition, official exam blueprint → Task 4 (`examDomain` field on blueprint-mapped courses), Task 14 (roadmap section).
- §3 Site architecture → Tasks 1, 6–14 (exact file structure matches).
- §4 Content model → Tasks 4, 8, 11 (status field, moduleIds, domain-tagged questions).
- §5 Delegation-framework project plan → Task 14.
- §6 Assessment & progress engine → Tasks 2, 3, 10, 12, 13.
- §7 Visual design (Bold & Editorial, no gamification, progress indicators, nav) → Tasks 5, 6.
- §8 Testing/verification → Tasks 2 (automated), 15 (manual QA checklist matches spec's list item-for-item).
- §9 Content sourcing → Task 8 comment header, Task 11 comment header, both explicit about original synthesis and no verbatim exam-guide content.

**Placeholder scan:** No TBD/TODO markers; every step contains complete, runnable code or a fully specified verification procedure.

**Type consistency:** `course.moduleIds` (Task 4) matches usage in `courseProgressLabel` (Task 6). `Progress.courseModuleProgress`/`isModuleStudied`/`markModuleStudied`/`recordPracticeScore`/`bestPracticeScore` (Task 3) are used with consistent signatures across Tasks 6, 9, 10, 12. `QuizEngine.scoreTest`/`isCorrect` (Task 2) match their usage in Task 12. Question/module object shapes (`id`, `domain`, `prompt`/`title`, `options`, `correctOptionId`, `explanation`) are identical between Task 8's knowledge checks and Task 11's practice questions, and match what `renderKnowledgeCheck`/`renderPracticeTest` (Tasks 10, 12) expect.
