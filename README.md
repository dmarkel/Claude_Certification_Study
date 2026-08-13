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

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Tests

```bash
node tests/quiz-engine.test.js
```
