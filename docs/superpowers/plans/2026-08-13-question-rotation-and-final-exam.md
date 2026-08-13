# Question Rotation & Course 1 Final Exam — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Course 1's knowledge checks and practice test draw a random subset from a larger question pool each time (so retakes surface different questions), and add a comprehensive "Final Exam" for Course 1 that simulates the real exam's feel — scenario-style, one sitting, full domain breakdown — while staying honest that it's scoped to Course 1's own material, not the real CCAR-F blueprint.

**Architecture:** A new pure, unit-tested `js/sampling.js` module provides two sampling primitives (`sampleN` for simple random draws, `sampleByDomain` for stratified-by-domain draws). Existing pages call it at load time before rendering. `renderPracticeTest` in `js/render.js` is generalized into `renderScoredTest`, taking a `kind` ('practice' | 'final') that controls heading text and which `Progress` score it records — both the existing Practice Test and the new Final Exam page reuse it. Question and knowledge-check pools are expanded with new original content, grounded the same way as the existing content (published 4D Framework + GenAI fundamentals), never copied from any real exam.

**Tech Stack:** Same as the existing site — plain HTML/CSS/JS, no build step, Node for tests.

---

## File Structure Changes

```
js/
  sampling.js                    → NEW: sampleN, sampleByDomain (pure, dual-exported)
  quiz-engine.js                 → unchanged
  progress.js                    → MODIFY: add finalExamScores tracking
  render.js                      → MODIFY: renderModulePage samples KCs; renderPracticeTest
                                    generalized to renderScoredTest(..., kind); renderCoursePage
                                    gets a Final Exam section
data/
  questions/ai-fluency-foundations.js       → MODIFY: 15 → 45 questions (9/domain)
  modules/ai-fluency-foundations.js         → MODIFY: 3 → 6 knowledge checks per module (42 total)
tests/
  sampling.test.js                → NEW: unit tests for sampling.js
practice-test.html                → MODIFY: sample 3/domain (15) before rendering, kind='practice'
final-exam.html                   → NEW: sample 6/domain (30) before rendering, kind='final'
```

---

### Task 1: Sampling module (TDD)

**Files:**
- Create: `js/sampling.js`
- Test: `tests/sampling.test.js`

- [ ] **Step 1: Write the failing tests**

Create `tests/sampling.test.js`:

```js
/* Sanity tests for the sampling module. Run: node tests/sampling.test.js */

const Sampling = require('../js/sampling.js');

let failures = 0;
function check(name, cond) {
  if (cond) console.log(`  ok - ${name}`);
  else { failures++; console.error(`  FAIL - ${name}`); }
}

// --- sampleN ---

{
  const items = [1, 2, 3, 4, 5, 6, 7, 8];
  const result = Sampling.sampleN(items, 3);
  check('sampleN: returns requested count when enough items exist', result.length === 3);
  check('sampleN: no duplicates', new Set(result).size === result.length);
  check('sampleN: every item came from the source array', result.every((x) => items.includes(x)));
}

{
  const items = [1, 2, 3];
  const result = Sampling.sampleN(items, 10);
  check('sampleN: requesting more than available returns all items, no crash', result.length === 3);
  check('sampleN: over-request has no duplicates', new Set(result).size === 3);
}

{
  // Fixed rng (always 0) makes the Fisher-Yates shuffle fully deterministic —
  // same input + same rng must produce the same output every time.
  const items = ['a', 'b', 'c', 'd', 'e'];
  const rng = () => 0;
  const first = Sampling.sampleN(items, 5, rng);
  const second = Sampling.sampleN(items, 5, rng);
  check('sampleN: deterministic with a fixed rng', JSON.stringify(first) === JSON.stringify(second));
}

{
  // With real randomness and a decent pool, repeated calls should vary.
  const items = Array.from({ length: 9 }, (_, i) => i);
  const firstItems = new Set();
  for (let i = 0; i < 20; i++) {
    firstItems.add(Sampling.sampleN(items, 3)[0]);
  }
  check('sampleN: varies across repeated calls with real randomness', firstItems.size > 1);
}

// --- sampleByDomain ---

const fixtureQuestions = [
  ...Array.from({ length: 5 }, (_, i) => ({ id: `a${i}`, domain: 'domainA' })),
  ...Array.from({ length: 2 }, (_, i) => ({ id: `b${i}`, domain: 'domainB' })),
  ...Array.from({ length: 4 }, (_, i) => ({ id: `c${i}`, domain: 'domainC' })),
];

{
  const result = Sampling.sampleByDomain(fixtureQuestions, 2);
  check('sampleByDomain: returns 2 per domain when enough exist (6 total across 3 domains)', result.length === 6);
  const byDomain = { domainA: 0, domainB: 0, domainC: 0 };
  result.forEach((q) => { byDomain[q.domain]++; });
  check('sampleByDomain: domainA got exactly 2', byDomain.domainA === 2);
  check('sampleByDomain: domainB (only 2 available) got exactly 2', byDomain.domainB === 2);
  check('sampleByDomain: domainC got exactly 2', byDomain.domainC === 2);
}

{
  const result = Sampling.sampleByDomain(fixtureQuestions, 3);
  const byDomain = { domainA: 0, domainB: 0, domainC: 0 };
  result.forEach((q) => { byDomain[q.domain]++; });
  check('sampleByDomain: domainB with only 2 items returns all 2 (not a crash) when 3 requested', byDomain.domainB === 2);
  check('sampleByDomain: domainA got exactly 3', byDomain.domainA === 3);
  check('sampleByDomain: domainC got exactly 3', byDomain.domainC === 3);
}

{
  const result = Sampling.sampleByDomain(fixtureQuestions, 2);
  check('sampleByDomain: no duplicate ids', new Set(result.map((q) => q.id)).size === result.length);
}

{
  const firstItems = new Set();
  for (let i = 0; i < 20; i++) {
    firstItems.add(Sampling.sampleByDomain(fixtureQuestions, 2)[0].id);
  }
  check('sampleByDomain: varies across repeated calls with real randomness', firstItems.size > 1);
}

if (failures > 0) {
  console.error(`\n${failures} test(s) failed.`);
  process.exit(1);
} else {
  console.log('\nAll sampling tests passed.');
}
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node tests/sampling.test.js`
Expected: `Error: Cannot find module '../js/sampling.js'`

- [ ] **Step 3: Write the implementation**

Create `js/sampling.js`:

```js
/* Pure random-sampling helpers for question rotation. No DOM access — also runs under
   Node for tests. rng is an injectable () => [0,1) random source (defaults to Math.random)
   so behavior is testable and reproducible. */

const Sampling = (() => {
  function shuffle(items, rng = Math.random) {
    const arr = items.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  function sampleN(items, n, rng = Math.random) {
    return shuffle(items, rng).slice(0, Math.min(n, items.length));
  }

  function sampleByDomain(questions, perDomain, rng = Math.random) {
    const byDomain = {};
    questions.forEach((q) => {
      if (!byDomain[q.domain]) byDomain[q.domain] = [];
      byDomain[q.domain].push(q);
    });
    let result = [];
    Object.keys(byDomain).forEach((domain) => {
      result = result.concat(sampleN(byDomain[domain], perDomain, rng));
    });
    return shuffle(result, rng);
  }

  return { shuffle, sampleN, sampleByDomain };
})();

if (typeof module !== 'undefined') module.exports = Sampling;
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node tests/sampling.test.js`
Expected: `All sampling tests passed.` with no `FAIL` lines and exit code 0.

- [ ] **Step 5: Commit**

```bash
git add js/sampling.js tests/sampling.test.js
git commit -m "Add sampling module for question rotation (TDD)"
```

---

### Task 2: Expand the practice-question bank (15 → 45)

**Files:**
- Modify: `data/questions/ai-fluency-foundations.js`

- [ ] **Step 1: Add 30 new questions**

The file currently ends with:

```js
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

Replace the closing `];` and everything after it with 30 new question objects (`pt-16` through `pt-45`, 6 more per domain) followed by the closing `];` and export line. Insert this block immediately after the `pt-15` object (before the closing `];`):

```js
  {
    id: 'pt-16', domain: 'delegation',
    prompt: "Your team publishes a weekly newsletter with a consistent format. After the first few AI-assisted drafts go out with only a quick skim, a reader flags a factual error that slipped through. What does this suggest about how the task was delegated?",
    options: [
      { id: 'a', text: 'The task should never have involved AI at all' },
      { id: 'b', text: "A recurring task still needs a review level calibrated to its actual stakes, not just its first success" },
      { id: 'c', text: 'The AI tool was defective and should be replaced' },
      { id: 'd', text: 'Weekly newsletters are too complex for AI to ever help with' },
    ],
    correctOptionId: 'b',
    explanation: "Delegation isn't a one-time decision — a recurring task needs a review level matched to its real stakes, not whatever felt sufficient early on. A and D overcorrect into avoidance; C misdiagnoses a process gap as a tool failure.",
  },
  {
    id: 'pt-17', domain: 'delegation',
    prompt: "A solo founder uses AI to research competitors, summarize market trends, and draft comparison tables — but personally makes every decision about how to position their own product. Which best describes this?",
    options: [
      { id: 'a', text: 'Under-delegation, since more of the work could be handed to AI' },
      { id: 'b', text: "A reasonable delegation split: AI handles synthesis and legwork, the founder keeps the judgment call that defines their strategy" },
      { id: 'c', text: 'Over-delegation, since AI should not be trusted with market research' },
      { id: 'd', text: 'Irrelevant to Delegation, since only one person is involved' },
    ],
    correctOptionId: 'b',
    explanation: "This splits the work the way Delegation recommends: outsource labor-intensive synthesis to AI, keep the outcome-defining judgment call with the human.",
  },
  {
    id: 'pt-18', domain: 'delegation',
    prompt: "You need to build a small internal tool. One option is a general-purpose AI chat assistant; another is a coding-focused AI agent that can write and test code directly. According to the Delegation competency, how should you choose between them?",
    options: [
      { id: 'a', text: 'Whichever is more famous' },
      { id: 'b', text: 'Based on which better fits the actual task and desired outcome, not novelty' },
      { id: 'c', text: 'Always the general-purpose one, since it can do anything' },
      { id: 'd', text: 'Always the more specialized one, regardless of the task' },
    ],
    correctOptionId: 'b',
    explanation: "Choosing the right AI tool or technique for the goal is itself part of Delegation — fit-to-task should drive the choice, not popularity or a blanket preference.",
  },
  {
    id: 'pt-19', domain: 'delegation',
    prompt: "A team lead has AI draft final wording for a legal contract clause and sends it to a client without any legal review, because 'it read professionally.' What Delegation failure does this represent?",
    options: [
      { id: 'a', text: 'Under-delegation' },
      { id: 'b', text: 'Over-delegation — a high-stakes, expertise-requiring task was handed off with no human check' },
      { id: 'c', text: 'This is actually a Diligence issue only, not Delegation' },
      { id: 'd', text: 'No failure occurred, since the output sounded correct' },
    ],
    correctOptionId: 'b',
    explanation: "Sounding professional isn't the same as being legally sound. Handing a high-stakes, expertise-requiring task fully to AI with no review is a textbook over-delegation failure.",
  },
  {
    id: 'pt-20', domain: 'delegation',
    prompt: "Within a single content project, a writer delegates first-draft generation to AI but keeps final edits, fact-checking, and voice consistency for themselves. What does this illustrate about Delegation?",
    options: [
      { id: 'a', text: 'That delegation must be all-or-nothing for a given project' },
      { id: 'b', text: 'That delegation can — and often should — happen at the level of individual tasks within a project' },
      { id: 'c', text: 'That AI should never be used for creative writing' },
      { id: 'd', text: "That keeping any task for yourself means you're not really delegating" },
    ],
    correctOptionId: 'b',
    explanation: "Good delegation is granular: different tasks within the same project can go to different drivers based on what each one actually needs.",
  },
  {
    id: 'pt-21', domain: 'delegation',
    prompt: "After noticing that AI-drafted customer replies for a specific complaint type keep needing heavy rewrites, a support lead stops auto-sending them and starts using AI only to draft a starting point for that complaint type. What does this represent?",
    options: [
      { id: 'a', text: 'Giving up on AI delegation entirely' },
      { id: 'b', text: "Recalibrating delegation for a specific task after noticing it wasn't working well as originally delegated" },
      { id: 'c', text: 'A sign the support lead should have never tried delegating in the first place' },
      { id: 'd', text: 'An unnecessary overreaction to a rare error' },
    ],
    correctOptionId: 'b',
    explanation: "Delegation isn't a one-time decision — noticing a poor fit and adjusting how (not whether) a task is delegated is exactly the ongoing judgment Delegation calls for.",
  },
  {
    id: 'pt-22', domain: 'description',
    prompt: "A brand asks an AI to 'write some social media posts' with no further detail, and gets back generic, off-brand copy. A second attempt specifies the brand's voice, target audience, platform, and three example posts to match. What does the improvement illustrate?",
    options: [
      { id: 'a', text: 'The AI model itself improved between attempts' },
      { id: 'b', text: 'Providing context, audience, and concrete examples is what turns a vague description into an effective one' },
      { id: 'c', text: 'Social media copy is inherently unpredictable regardless of the prompt' },
      { id: 'd', text: 'The second attempt succeeded only by chance' },
    ],
    correctOptionId: 'b',
    explanation: "This is Description in action: context, audience, and examples are exactly the ingredients that make a description effective, not luck or a model change.",
  },
  {
    id: 'pt-23', domain: 'description',
    prompt: "You're asking an AI to explain a technical concept to a general audience. Which addition to your description would most help?",
    options: [
      { id: 'a', text: 'Specifying the target reading level and a maximum length' },
      { id: 'b', text: 'Asking for the most technically precise explanation possible' },
      { id: 'c', text: 'Leaving the audience unspecified so the AI can decide' },
      { id: 'd', text: 'Requesting the longest possible explanation for thoroughness' },
    ],
    correctOptionId: 'a',
    explanation: "Constraints like reading level and length shape output toward what's actually needed — maximizing precision or leaving the audience open both work against a general-audience goal.",
  },
  {
    id: 'pt-24', domain: 'description',
    prompt: "Over a multi-turn conversation, you ask an AI to revise a draft based on specific feedback each time, building on the prior version rather than starting over. What does this reflect about effective Description?",
    options: [
      { id: 'a', text: 'That Description only matters for the very first message in a conversation' },
      { id: 'b', text: "That Description continues across a conversation — each turn's feedback is itself a description guiding the next revision" },
      { id: 'c', text: "That this approach wastes the AI's ability to generate fresh ideas" },
      { id: 'd', text: 'That providing feedback mid-conversation confuses the AI and should be avoided' },
    ],
    correctOptionId: 'b',
    explanation: "Description isn't limited to the opening prompt — each round of feedback is a fresh description that steers the next output.",
  },
  {
    id: 'pt-25', domain: 'description',
    prompt: "Which of these is most effective for avoiding a specific footgun — for example, keeping jargon out of a beginner-facing guide?",
    options: [
      { id: 'a', text: "Explicitly stating what to avoid ('no jargon, no acronyms') alongside what you want" },
      { id: 'b', text: 'Assuming the AI will infer what to avoid from context alone' },
      { id: 'c', text: 'Only specifying the topic and nothing else' },
      { id: 'd', text: 'Requesting the most comprehensive possible answer' },
    ],
    correctOptionId: 'a',
    explanation: "Explicit negative constraints (what to avoid) are as much a part of good Description as positive ones — assuming inference is exactly the kind of vague description that produces mismatched results.",
  },
  {
    id: 'pt-26', domain: 'description',
    prompt: "A manager asks an AI to 'help me think through this decision' without saying why the decision matters or what's at stake. The response ends up generic and unhelpful. Which piece of Description was missing?",
    options: [
      { id: 'a', text: "The purpose or 'why' behind the request, not just the literal task" },
      { id: 'b', text: 'The exact word count desired' },
      { id: 'c', text: 'The name of the AI model being used' },
      { id: 'd', text: 'A list of every possible AI tool that could have been used instead' },
    ],
    correctOptionId: 'a',
    explanation: "Explaining the purpose behind a task — not just the literal ask — is part of effective Description; without it, the AI has no way to calibrate what actually matters to the outcome.",
  },
  {
    id: 'pt-27', domain: 'description',
    prompt: "You ask an AI to 'list the pros and cons' but never specify a format, and get back a long paragraph instead of the bulleted comparison you wanted. What does this illustrate?",
    options: [
      { id: 'a', text: 'That the AI is incapable of producing bulleted lists' },
      { id: 'b', text: 'That omitting a desired output format is a common and avoidable Description gap' },
      { id: 'c', text: 'That pros/cons questions can never be answered well by AI' },
      { id: 'd', text: 'That this is a Discernment failure, not a Description one' },
    ],
    correctOptionId: 'b',
    explanation: "Format is a concrete, easy-to-specify constraint — leaving it out is an avoidable Description gap, not a capability limitation or a Discernment issue.",
  },
  {
    id: 'pt-28', domain: 'discernment',
    prompt: "Before publishing a report, a researcher checks every AI-generated statistic against the original source. What competency does this represent?",
    options: [
      { id: 'a', text: 'Delegation' },
      { id: 'b', text: 'Description' },
      { id: 'c', text: 'Discernment — verifying accuracy before relying on the output' },
      { id: 'd', text: 'Diligence only, unrelated to Discernment' },
    ],
    correctOptionId: 'c',
    explanation: "Actively verifying AI output against source material before relying on it is a direct application of Discernment.",
  },
  {
    id: 'pt-29', domain: 'discernment',
    prompt: "An AI confidently describes a process a certain way, but it contradicts what the reader has directly experienced firsthand. What's the appropriate Discernment response?",
    options: [
      { id: 'a', text: "Assume the AI is correct since it sounds confident" },
      { id: 'b', text: "Treat the AI's confidence as separate from its accuracy, and investigate the discrepancy before trusting either source blindly" },
      { id: 'c', text: 'Ignore the AI output entirely from now on' },
      { id: 'd', text: 'Assume personal experience is always wrong when it conflicts with AI output' },
    ],
    correctOptionId: 'b',
    explanation: "Confidence in tone is not evidence of accuracy. Discernment means investigating a discrepancy rather than automatically deferring to either source.",
  },
  {
    id: 'pt-30', domain: 'discernment',
    prompt: "A developer reviews AI-suggested code before merging it and catches a subtle SQL injection vulnerability the AI didn't flag. What does this illustrate about Discernment?",
    options: [
      { id: 'a', text: 'That AI-generated code should never be used' },
      { id: 'b', text: 'That critically reviewing AI output — even code that looks correct — is necessary before relying on it, especially for security' },
      { id: 'c', text: 'That the AI intentionally introduced the vulnerability' },
      { id: 'd', text: 'That code review is unrelated to the Discernment competency' },
    ],
    correctOptionId: 'b',
    explanation: "This is exactly what Discernment looks like applied to code: catching a real, subtle problem that fluent-looking output didn't surface on its own.",
  },
  {
    id: 'pt-31', domain: 'discernment',
    prompt: "While reading an AI-generated financial summary, someone notices the individual line items don't actually add up to the stated total. What should this internal inconsistency prompt?",
    options: [
      { id: 'a', text: 'Ignoring it, since the overall summary reads clearly' },
      { id: 'b', text: 'Treating it as a red flag worth investigating before relying on any of the figures' },
      { id: 'c', text: "Assuming it's a rare, harmless rounding issue not worth checking" },
      { id: 'd', text: 'Concluding that all AI-generated numbers are always wrong' },
    ],
    correctOptionId: 'b',
    explanation: "An internal inconsistency like numbers not summing correctly is exactly the kind of signal Discernment should catch.",
  },
  {
    id: 'pt-32', domain: 'discernment',
    prompt: "When an AI makes a claim, asking it to explain its reasoning or cite a source is a useful Discernment technique. What's an important limitation to keep in mind when doing this?",
    options: [
      { id: 'a', text: 'The AI can also generate plausible-sounding but fabricated reasoning or citations, so the request for support still needs independent verification' },
      { id: 'b', text: 'Asking for reasoning always guarantees a correct answer' },
      { id: 'c', text: 'AI models are incapable of ever citing anything' },
      { id: 'd', text: 'This technique eliminates the need for any further verification' },
    ],
    correctOptionId: 'a',
    explanation: "Fluency extends to explanations and citations too — a fabricated-but-confident source doesn't stop being fabricated just because it was asked for.",
  },
  {
    id: 'pt-33', domain: 'discernment',
    prompt: "A person with deep expertise in a topic and a person unfamiliar with it both review the same AI-generated explanation. The expert catches a subtle but important error the novice misses. What does this demonstrate?",
    options: [
      { id: 'a', text: 'That novices should never review AI output' },
      { id: 'b', text: "That subject-matter expertise directly strengthens a person's ability to exercise Discernment" },
      { id: 'c', text: 'That the AI performs worse for expert readers' },
      { id: 'd', text: 'That this has nothing to do with the Discernment competency' },
    ],
    correctOptionId: 'b',
    explanation: "This is precisely why the course ties Discernment to domain knowledge: expertise makes it easier to catch subtle, plausible-sounding errors.",
  },
  {
    id: 'pt-34', domain: 'diligence',
    prompt: "A university requires students to disclose any AI assistance used on assignments. A student uses AI to help outline an essay and includes the required disclosure. What does this represent?",
    options: [
      { id: 'a', text: 'Unnecessary extra work' },
      { id: 'b', text: "Diligence — being transparent about AI's role as required" },
      { id: 'c', text: "Poor Delegation, since disclosure wasn't needed" },
      { id: 'd', text: 'A Discernment issue, unrelated to transparency' },
    ],
    correctOptionId: 'b',
    explanation: "Following a disclosure requirement about AI use is a direct example of the transparency component of Diligence.",
  },
  {
    id: 'pt-35', domain: 'diligence',
    prompt: "Someone publishes AI-assisted content that touches on medical topics, without any professional review or disclaimer, because it 'sounded accurate.' What Diligence concern does this raise?",
    options: [
      { id: 'a', text: 'None, since accuracy was already checked by Discernment' },
      { id: 'b', text: "The downstream impact of unreviewed, AI-assisted content in a sensitive domain wasn't adequately considered" },
      { id: 'c', text: 'This is purely a Delegation issue' },
      { id: 'd', text: 'Diligence only applies to code, not written content' },
    ],
    correctOptionId: 'b',
    explanation: "Diligence includes thinking through the downstream impact of AI-assisted work, especially in sensitive domains.",
  },
  {
    id: 'pt-36', domain: 'diligence',
    prompt: "In a commercial project, someone asks an AI to 'write like [a specific living author]' and presents the output as their own original work. What Diligence concern does this raise?",
    options: [
      { id: 'a', text: 'None, since the output was technically AI-generated' },
      { id: 'b', text: 'Respecting intellectual property and being honest about originality, both part of using AI responsibly' },
      { id: 'c', text: 'This is a Description issue only' },
      { id: 'd', text: 'This only matters if the author finds out' },
    ],
    correctOptionId: 'b',
    explanation: "Respecting intellectual property and being honest about originality are both part of the responsible-use core of Diligence, regardless of whether anyone notices.",
  },
  {
    id: 'pt-37', domain: 'diligence',
    prompt: "After an AI-assisted report turns out to contain a significant error, the person who published it says 'the AI got it wrong' and takes no further action. What does this response fail to reflect?",
    options: [
      { id: 'a', text: 'Nothing — the AI is responsible for its own output' },
      { id: 'b', text: "Diligence's requirement of accountability: the person who relied on and published the work owns the outcome, not just the tool" },
      { id: 'c', text: 'This is a Delegation issue only' },
      { id: 'd', text: "Accountability doesn't apply to AI-assisted work" },
    ],
    correctOptionId: 'b',
    explanation: "Diligence means remaining accountable for AI-assisted work as if you had done it yourself — deflecting blame to the tool is exactly the failure mode Diligence is meant to prevent.",
  },
  {
    id: 'pt-38', domain: 'diligence',
    prompt: "A manager is asked to deliver a sensitive, individualized piece of HR feedback. They decide to write it entirely themselves rather than draft it with AI. What does this decision reflect?",
    options: [
      { id: 'a', text: 'A failure to use available tools efficiently' },
      { id: 'b', text: 'A reasonable Diligence judgment that some tasks call for fully human handling given their sensitivity' },
      { id: 'c', text: 'Poor Delegation, since AI should always be used when available' },
      { id: 'd', text: 'An overreaction with no real justification' },
    ],
    correctOptionId: 'b',
    explanation: "Diligence includes making thoughtful choices about when AI use is appropriate at all — for some sensitive situations, the responsible choice is not to delegate the task.",
  },
  {
    id: 'pt-39', domain: 'diligence',
    prompt: "A team keeps a brief record of significant AI-assisted decisions — what was asked, what was produced, and who reviewed it — for projects with real consequences. What does this practice support?",
    options: [
      { id: 'a', text: 'Nothing useful; it is unnecessary overhead' },
      { id: 'b', text: 'Accountability and transparency, making it possible to explain and stand behind AI-assisted decisions later' },
      { id: 'c', text: 'This is a Description practice, not a Diligence one' },
      { id: 'd', text: 'This is only relevant for legal teams' },
    ],
    correctOptionId: 'b',
    explanation: "Keeping a record supports exactly the accountability and transparency at the heart of Diligence.",
  },
  {
    id: 'pt-40', domain: 'genai-fundamentals',
    prompt: "Asking an AI the exact same question twice can sometimes produce two different, both-plausible answers. What best explains this?",
    options: [
      { id: 'a', text: 'Generation involves an element of randomness in selecting among likely next words, so outputs can vary between runs' },
      { id: 'b', text: 'This means the AI is malfunctioning' },
      { id: 'c', text: 'The AI secretly remembers unrelated previous conversations' },
      { id: 'd', text: 'Identical questions always produce identical output' },
    ],
    correctOptionId: 'a',
    explanation: "Because generation involves sampling among likely continuations rather than looking up one fixed answer, some run-to-run variation is expected, not a malfunction.",
  },
  {
    id: 'pt-41', domain: 'genai-fundamentals',
    prompt: "In a very long conversation, an AI seems to 'forget' something mentioned near the very beginning. What does this most directly relate to?",
    options: [
      { id: 'a', text: "The model's context window — the amount of the conversation it can actually take into account at once" },
      { id: 'b', text: 'The model refusing to answer on purpose' },
      { id: 'c', text: 'A permanent memory failure requiring a full model reset' },
      { id: 'd', text: 'The model secretly deleting old messages to save space' },
    ],
    correctOptionId: 'a',
    explanation: "This is a context-window limitation: there's a bound on how much of the conversation the model can take into account for a given response.",
  },
  {
    id: 'pt-42', domain: 'genai-fundamentals',
    prompt: "Providing relevant background information directly in your prompt, rather than assuming the model already 'knows' it, tends to produce more accurate results. Why?",
    options: [
      { id: 'a', text: 'Grounding a response in context you provide is generally more reliable than relying solely on what the model happened to learn during training' },
      { id: 'b', text: 'It has no actual effect on accuracy' },
      { id: 'c', text: 'It only helps with very short prompts' },
      { id: 'd', text: 'It guarantees the model can no longer make any errors' },
    ],
    correctOptionId: 'a',
    explanation: "Supplying relevant context grounds the response in information you know to be current and correct, rather than relying entirely on training-derived knowledge.",
  },
  {
    id: 'pt-43', domain: 'genai-fundamentals',
    prompt: "A model can write a fluent, step-by-step explanation of how it 'reasoned' through a math problem, even when its final answer is wrong. What does this illustrate?",
    options: [
      { id: 'a', text: "Fluent-sounding reasoning doesn't guarantee that the underlying steps — or the final answer — are actually correct" },
      { id: 'b', text: 'A model that explains its reasoning is always correct' },
      { id: 'c', text: 'This never actually happens with generative AI' },
      { id: 'd', text: 'Math problems are the only place this issue arises' },
    ],
    correctOptionId: 'a',
    explanation: "Just as fluency doesn't guarantee factual accuracy, a fluent explanation of reasoning doesn't guarantee the process or conclusion is actually correct.",
  },
  {
    id: 'pt-44', domain: 'genai-fundamentals',
    prompt: "A model states a specific-sounding citation for a claim, but the citation turns out not to exist. What does this most directly demonstrate?",
    options: [
      { id: 'a', text: 'That fabrication (hallucination) can extend to specific details like citations, not just general claims' },
      { id: 'b', text: 'That the model deliberately lied' },
      { id: 'c', text: 'That all AI-generated citations are automatically verified before being shown' },
      { id: 'd', text: 'That this is impossible for a well-trained model' },
    ],
    correctOptionId: 'a',
    explanation: "Hallucination isn't limited to vague claims — it can produce specific, plausible-looking details like citations that simply don't exist.",
  },
  {
    id: 'pt-45', domain: 'genai-fundamentals',
    prompt: "A model gives a plausible-sounding explanation for why it produced a particular answer. What's an important caveat about that explanation?",
    options: [
      { id: 'a', text: "The stated explanation isn't guaranteed to accurately reflect the actual internal process that produced the answer" },
      { id: 'b', text: "The explanation is always a perfectly accurate description of the model's internal process" },
      { id: 'c', text: 'Models are incapable of producing any explanation for their answers' },
      { id: 'd', text: 'This caveat only applies to very old AI models' },
    ],
    correctOptionId: 'a',
    explanation: "A model's stated explanation is itself generated text — fluent and plausible, but not guaranteed to be a faithful account of what actually happened internally.",
  },
];

if (typeof module !== 'undefined') module.exports = QUESTIONS_AI_FLUENCY_FOUNDATIONS;
```

- [ ] **Step 2: Verify with a Node sanity check**

```bash
node -e "
const q = require('./data/questions/ai-fluency-foundations.js');
console.log('total:', q.length);
const domains = ['delegation','description','discernment','diligence','genai-fundamentals'];
console.log('9 per domain:', domains.every(d => q.filter(x=>x.domain===d).length === 9));
console.log('all valid correctOptionId:', q.every(x => x.options.some(o => o.id === x.correctOptionId)));
console.log('all unique ids:', new Set(q.map(x=>x.id)).size === q.length);
"
```

Expected output:
```
total: 45
9 per domain: true
all valid correctOptionId: true
all unique ids: true
```

- [ ] **Step 3: Commit**

```bash
git add data/questions/ai-fluency-foundations.js
git commit -m "Expand Course 1 practice-question bank from 15 to 45 (9 per domain)"
```

---

### Task 3: Expand knowledge-check pools (3 → 6 per module)

**Files:**
- Modify: `data/modules/ai-fluency-foundations.js`

- [ ] **Step 1: Add 3 new knowledge checks to each of the 7 modules**

For each module, append 3 new objects to that module's `knowledgeChecks` array (after its existing 3rd item, before the closing `],`). Use these exact objects, grouped by module:

**`intro` module** — add after `intro-kc3`:

```js
      {
        id: 'intro-kc4', domain: 'description',
        prompt: "Which best describes the 'Description' competency?",
        options: [
          { id: 'a', text: 'Communicating a task or vision clearly enough for AI to produce something useful' },
          { id: 'b', text: 'Evaluating AI output for accuracy' },
          { id: 'c', text: 'Using AI responsibly and transparently' },
          { id: 'd', text: 'Deciding what to hand off to AI' },
        ],
        correctOptionId: 'a',
        explanation: 'Description is about communicating intent clearly — b is Discernment, c is Diligence, d is Delegation.',
      },
      {
        id: 'intro-kc5', domain: 'discernment',
        prompt: "Which best describes 'Discernment'?",
        options: [
          { id: 'a', text: 'Critically evaluating AI output for accuracy, quality, and appropriateness' },
          { id: 'b', text: 'Writing an effective prompt' },
          { id: 'c', text: 'Choosing the right AI tool' },
          { id: 'd', text: 'Disclosing AI use' },
        ],
        correctOptionId: 'a',
        explanation: 'Discernment is about evaluating output — b is Description, c is Delegation, d is Diligence.',
      },
      {
        id: 'intro-kc6', domain: 'diligence',
        prompt: "Which best describes 'Diligence'?",
        options: [
          { id: 'a', text: 'Using AI responsibly, with transparency and accountability' },
          { id: 'b', text: 'Checking output for factual accuracy' },
          { id: 'c', text: 'Picking the right AI technique for a task' },
          { id: 'd', text: 'Providing clear context in a prompt' },
        ],
        correctOptionId: 'a',
        explanation: 'Diligence is about responsible, accountable use — b is Discernment, c is Delegation, d is Description.',
      },
```

**`genai-deep-dive` module** — add after `genai-kc3`:

```js
      {
        id: 'genai-kc4', domain: 'genai-fundamentals',
        prompt: 'Why might the exact same prompt produce two different answers on two different runs?',
        options: [
          { id: 'a', text: 'Generation involves some randomness in selecting among likely next words' },
          { id: 'b', text: 'The model remembers unrelated past sessions' },
          { id: 'c', text: 'This should never happen' },
          { id: 'd', text: 'The model is broken' },
        ],
        correctOptionId: 'a',
        explanation: 'Sampling among likely continuations means some run-to-run variation is expected, not a malfunction.',
      },
      {
        id: 'genai-kc5', domain: 'genai-fundamentals',
        prompt: "What does a model's 'context window' refer to?",
        options: [
          { id: 'a', text: 'The amount of the conversation and input it can actually take into account for a response' },
          { id: 'b', text: 'How many users it serves at once' },
          { id: 'c', text: 'The size of its training dataset' },
          { id: 'd', text: 'The visual size of a chat window' },
        ],
        correctOptionId: 'a',
        explanation: "This bounds how much of a conversation the model can actually take into account when generating a response.",
      },
      {
        id: 'genai-kc6', domain: 'genai-fundamentals',
        prompt: 'Why does providing relevant context directly in a prompt often improve accuracy?',
        options: [
          { id: 'a', text: 'Grounding the response in provided information tends to be more reliable than relying solely on training-derived knowledge' },
          { id: 'b', text: 'It makes responses shorter' },
          { id: 'c', text: 'It guarantees no errors' },
          { id: 'd', text: "It's required for the model to generate text at all" },
        ],
        correctOptionId: 'a',
        explanation: 'Provided context grounds the response rather than relying entirely on what the model happened to learn during training.',
      },
```

**`delegation` module** — add after `delegation-kc3`:

```js
      {
        id: 'delegation-kc4', domain: 'delegation',
        prompt: "A recurring task keeps producing errors after being lightly reviewed since its first success. What does good Delegation call for?",
        options: [
          { id: 'a', text: "Recalibrating the level of review to match the task's actual stakes, not just its first outcome" },
          { id: 'b', text: 'Stopping AI use for that task permanently' },
          { id: 'c', text: 'Ignoring the errors since the task was already delegated' },
          { id: 'd', text: 'Delegating an even less appropriate task instead' },
        ],
        correctOptionId: 'a',
        explanation: "Delegation isn't a one-time decision — the review level should match a task's real stakes, revisited as needed.",
      },
      {
        id: 'delegation-kc5', domain: 'delegation',
        prompt: 'Choosing between two AI tools for a task — one general-purpose, one specialized — should be driven mainly by...',
        options: [
          { id: 'a', text: 'Which one actually fits the task and desired outcome' },
          { id: 'b', text: 'Which is more popular' },
          { id: 'c', text: 'Always picking the specialized one regardless of fit' },
          { id: 'd', text: 'Always picking the general one regardless of fit' },
        ],
        correctOptionId: 'a',
        explanation: 'Fit-to-task should drive tool choice, not popularity or a blanket preference for either option.',
      },
      {
        id: 'delegation-kc6', domain: 'delegation',
        prompt: "After noticing a task isn't going well under its current delegation setup, what does good Delegation suggest?",
        options: [
          { id: 'a', text: "Adjusting how the task is delegated based on what's been observed" },
          { id: 'b', text: 'Never revisiting a delegation decision once made' },
          { id: 'c', text: 'Delegating more of the surrounding project to compensate' },
          { id: 'd', text: 'Assuming nothing can be done' },
        ],
        correctOptionId: 'a',
        explanation: 'Noticing a poor fit and adjusting how a task is delegated is exactly the ongoing judgment Delegation calls for.',
      },
```

**`description` module** — add after `description-kc3`:

```js
      {
        id: 'description-kc4', domain: 'description',
        prompt: 'Which combination most reliably improves an AI description?',
        options: [
          { id: 'a', text: 'Context, constraints, and an example of the desired output' },
          { id: 'b', text: 'Length alone' },
          { id: 'c', text: 'Vagueness, to leave room for creativity' },
          { id: 'd', text: 'Repetition of the same request' },
        ],
        correctOptionId: 'a',
        explanation: 'Context, constraints, and examples are the concrete ingredients of an effective description.',
      },
      {
        id: 'description-kc5', domain: 'description',
        prompt: 'Why might explicitly stating what to avoid (not just what you want) improve a description?',
        options: [
          { id: 'a', text: 'Negative constraints are as useful as positive ones for shaping output' },
          { id: 'b', text: 'AI cannot understand any negative instructions' },
          { id: 'c', text: 'It has no effect on output' },
          { id: 'd', text: 'It only matters for creative writing' },
        ],
        correctOptionId: 'a',
        explanation: 'Stating what to avoid is as much a part of good Description as stating what you want.',
      },
      {
        id: 'description-kc6', domain: 'description',
        prompt: "Providing feedback mid-conversation to refine an AI's output is best understood as...",
        options: [
          { id: 'a', text: 'Part of the ongoing Description process, not separate from it' },
          { id: 'b', text: 'Unrelated to Description' },
          { id: 'c', text: 'A sign the first description failed completely' },
          { id: 'd', text: 'Unnecessary once an initial prompt is sent' },
        ],
        correctOptionId: 'a',
        explanation: 'Each round of feedback is itself a description that steers the next revision.',
      },
```

**`discernment` module** — add after `discernment-kc3`:

```js
      {
        id: 'discernment-kc4', domain: 'discernment',
        prompt: "Noticing that individual numbers in an AI-generated summary don't add up to its stated total should prompt...",
        options: [
          { id: 'a', text: 'Treating it as a red flag worth investigating before trusting the output' },
          { id: 'b', text: 'Ignoring it since the summary reads clearly' },
          { id: 'c', text: "Assuming it's always a harmless rounding error" },
          { id: 'd', text: 'Concluding all AI output is unreliable' },
        ],
        correctOptionId: 'a',
        explanation: 'An internal inconsistency is exactly the kind of signal Discernment should catch.',
      },
      {
        id: 'discernment-kc5', domain: 'discernment',
        prompt: 'Asking an AI to cite its sources for a claim is a useful Discernment technique, but...',
        options: [
          { id: 'a', text: 'The citation itself could also be fabricated and still needs verification' },
          { id: 'b', text: 'It guarantees the claim is true' },
          { id: 'c', text: 'AI cannot produce citations at all' },
          { id: 'd', text: 'It removes the need for any further evaluation' },
        ],
        correctOptionId: 'a',
        explanation: 'Fabrication can extend to citations too, so the request for support still needs independent verification.',
      },
      {
        id: 'discernment-kc6', domain: 'discernment',
        prompt: "A code reviewer catches a security issue in AI-suggested code that the AI itself didn't flag. This illustrates...",
        options: [
          { id: 'a', text: 'The value of critically reviewing AI output even when it looks correct' },
          { id: 'b', text: 'That AI should never be used for code' },
          { id: 'c', text: 'That this was a Delegation failure, not Discernment' },
          { id: 'd', text: 'That this cannot happen in practice' },
        ],
        correctOptionId: 'a',
        explanation: 'Catching a subtle problem that fluent-looking output hid is exactly what Discernment looks like applied to code.',
      },
```

**`diligence` module** — add after `diligence-kc3`:

```js
      {
        id: 'diligence-kc4', domain: 'diligence',
        prompt: 'A required disclosure about AI assistance is included in a submitted assignment. This reflects...',
        options: [
          { id: 'a', text: 'The transparency component of Diligence' },
          { id: 'b', text: 'Unnecessary extra effort' },
          { id: 'c', text: 'A Delegation decision' },
          { id: 'd', text: 'A Discernment check' },
        ],
        correctOptionId: 'a',
        explanation: 'Following a disclosure requirement is a direct example of the transparency component of Diligence.',
      },
      {
        id: 'diligence-kc5', domain: 'diligence',
        prompt: "Publishing AI-assisted content in a sensitive domain without professional review, because it 'sounded right,' overlooks...",
        options: [
          { id: 'a', text: 'The downstream impact of unreviewed AI-assisted work, a Diligence concern' },
          { id: 'b', text: 'Nothing, since Discernment already covers accuracy' },
          { id: 'c', text: 'A pure Delegation issue' },
          { id: 'd', text: 'A pure Description issue' },
        ],
        correctOptionId: 'a',
        explanation: 'Diligence includes thinking through downstream impact, especially in sensitive domains.',
      },
      {
        id: 'diligence-kc6', domain: 'diligence',
        prompt: "Blaming an error entirely on 'the AI' after publishing AI-assisted work fails to reflect...",
        options: [
          { id: 'a', text: 'The accountability that Diligence calls for from the person who relied on and published the work' },
          { id: 'b', text: 'Anything meaningful' },
          { id: 'c', text: 'A Delegation principle only' },
          { id: 'd', text: 'A Description principle only' },
        ],
        correctOptionId: 'a',
        explanation: 'Deflecting blame to the tool is exactly the failure mode Diligence is meant to prevent.',
      },
```

**`conclusion` module** — add after `conclusion-kc3`:

```js
      {
        id: 'conclusion-kc4', domain: 'framework-overview',
        prompt: 'Which best summarizes how the four competencies relate to a single task?',
        options: [
          { id: 'a', text: 'They interact throughout the task, not as four separate one-time steps' },
          { id: 'b', text: 'They must happen once each, strictly in order' },
          { id: 'c', text: 'Only one applies to any given task' },
          { id: 'd', text: 'They are entirely independent skills with no relationship' },
        ],
        correctOptionId: 'a',
        explanation: 'The 4D Framework is a loop applied throughout a task, not a one-time checklist.',
      },
      {
        id: 'conclusion-kc5', domain: 'framework-overview',
        prompt: 'Which of the following is a technical exam domain from the actual CCAR-F blueprint, as opposed to a 4D Framework competency?',
        options: [
          { id: 'a', text: 'Context Management & Reliability' },
          { id: 'b', text: 'Delegation' },
          { id: 'c', text: 'Description' },
          { id: 'd', text: 'Diligence' },
        ],
        correctOptionId: 'a',
        explanation: "Context Management & Reliability is one of the exam's 5 technical domains — the other three options are 4D Framework competencies, not exam domains.",
      },
      {
        id: 'conclusion-kc6', domain: 'diligence',
        prompt: 'Which competency most directly underpins trust in AI-assisted work, regardless of how well the other three were applied?',
        options: [
          { id: 'a', text: 'Diligence' },
          { id: 'b', text: 'Delegation' },
          { id: 'c', text: 'Description' },
          { id: 'd', text: 'Discernment' },
        ],
        correctOptionId: 'a',
        explanation: 'Diligence is what makes skillful Delegation, Description, and Discernment trustworthy.',
      },
```

- [ ] **Step 2: Verify with a Node sanity check**

```bash
node -e "
const m = require('./data/modules/ai-fluency-foundations.js');
console.log('all have 6 knowledge checks:', m.every(mod => mod.knowledgeChecks.length === 6));
console.log('total KCs:', m.reduce((n,x)=>n+x.knowledgeChecks.length,0));
console.log('all valid correctOptionId:', m.every(mod => mod.knowledgeChecks.every(kc => kc.options.some(o => o.id === kc.correctOptionId))));
const allIds = m.flatMap(mod => mod.knowledgeChecks.map(kc => kc.id));
console.log('all unique ids:', new Set(allIds).size === allIds.length);
"
```

Expected output:
```
all have 6 knowledge checks: true
total KCs: 42
all valid correctOptionId: true
all unique ids: true
```

- [ ] **Step 3: Commit**

```bash
git add data/modules/ai-fluency-foundations.js
git commit -m "Expand Course 1 knowledge-check pools from 3 to 6 per module"
```

---

### Task 4: Progress tracking for the Final Exam

**Files:**
- Modify: `js/progress.js`

- [ ] **Step 1: Add finalExamScores to freshState and load's shape validation**

In `js/progress.js`, find `freshState`:

```js
  function freshState() {
    return {
      modulesStudied: {},   // "<courseId>:<moduleId>" -> true
      practiceScores: {},   // "<courseId>" -> best percent (0-100)
    };
  }
```

Replace with:

```js
  function freshState() {
    return {
      modulesStudied: {},   // "<courseId>:<moduleId>" -> true
      practiceScores: {},   // "<courseId>" -> best percent (0-100)
      finalExamScores: {},  // "<courseId>" -> best percent (0-100)
    };
  }
```

Find `load`:

```js
  function load(storage) {
    try {
      const raw = storage.getItem(KEY);
      if (!raw) return freshState();
      const parsed = JSON.parse(raw);
      const fresh = freshState();
      return {
        modulesStudied: (parsed.modulesStudied && typeof parsed.modulesStudied === 'object') ? parsed.modulesStudied : fresh.modulesStudied,
        practiceScores: (parsed.practiceScores && typeof parsed.practiceScores === 'object') ? parsed.practiceScores : fresh.practiceScores,
      };
    } catch {
      return freshState();
    }
  }
```

Replace with (adding the same shape-validation treatment to `finalExamScores` that `practiceScores` already gets — this is the same defensive pattern fixed earlier for exactly this reason):

```js
  function load(storage) {
    try {
      const raw = storage.getItem(KEY);
      if (!raw) return freshState();
      const parsed = JSON.parse(raw);
      const fresh = freshState();
      return {
        modulesStudied: (parsed.modulesStudied && typeof parsed.modulesStudied === 'object') ? parsed.modulesStudied : fresh.modulesStudied,
        practiceScores: (parsed.practiceScores && typeof parsed.practiceScores === 'object') ? parsed.practiceScores : fresh.practiceScores,
        finalExamScores: (parsed.finalExamScores && typeof parsed.finalExamScores === 'object') ? parsed.finalExamScores : fresh.finalExamScores,
      };
    } catch {
      return freshState();
    }
  }
```

- [ ] **Step 2: Add recordFinalExamScore and bestFinalExamScore**

Find `recordPracticeScore`/`bestPracticeScore`:

```js
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
```

Add immediately after (mirroring the same pattern exactly):

```js

  function recordFinalExamScore(state, courseId, percent) {
    const prev = state.finalExamScores[courseId] || 0;
    state.finalExamScores[courseId] = Math.max(prev, percent);
    return state;
  }

  function bestFinalExamScore(state, courseId) {
    return Object.prototype.hasOwnProperty.call(state.finalExamScores, courseId)
      ? state.finalExamScores[courseId]
      : null;
  }
```

- [ ] **Step 3: Update the exported object**

Find:

```js
  return {
    freshState, load, save, markModuleStudied, isModuleStudied,
    courseModuleProgress, recordPracticeScore, bestPracticeScore,
  };
```

Replace with:

```js
  return {
    freshState, load, save, markModuleStudied, isModuleStudied,
    courseModuleProgress, recordPracticeScore, bestPracticeScore,
    recordFinalExamScore, bestFinalExamScore,
  };
```

- [ ] **Step 4: Verify with a Node sanity check**

```bash
node -e "
const Progress = require('./js/progress.js');
const mockStorage = (() => { let s = {}; return { getItem: k => s[k] || null, setItem: (k,v) => { s[k]=v; } }; })();
let state = Progress.load(mockStorage);
console.log('bestFinalExamScore on fresh state:', Progress.bestFinalExamScore(state, 'ai-fluency-foundations'));
Progress.recordFinalExamScore(state, 'ai-fluency-foundations', 73);
Progress.save(state, mockStorage);
state = Progress.load(mockStorage);
console.log('bestFinalExamScore after recording 73:', Progress.bestFinalExamScore(state, 'ai-fluency-foundations'));
Progress.recordFinalExamScore(state, 'ai-fluency-foundations', 60);
console.log('bestFinalExamScore after a lower 60 (should stay 73):', Progress.bestFinalExamScore(state, 'ai-fluency-foundations'));
console.log('practiceScores untouched:', Progress.bestPracticeScore(state, 'ai-fluency-foundations'));
"
```

Expected output:
```
bestFinalExamScore on fresh state: null
bestFinalExamScore after recording 73: 73
bestFinalExamScore after a lower 60 (should stay 73): 73
practiceScores untouched: null
```

- [ ] **Step 5: Commit**

```bash
git add js/progress.js
git commit -m "Add final-exam score tracking to progress.js"
```

---

### Task 5: Wire rotation into knowledge checks

**Files:**
- Modify: `js/render.js`
- Modify: `module.html`

- [ ] **Step 1: Sample knowledge checks in renderModulePage**

In `js/render.js`, find:

```js
      <section class="section">
        <h2>Knowledge Check</h2>
        ${module.knowledgeChecks.map(renderKnowledgeCheck).join('')}
      </section>
```

Replace with:

```js
      <section class="section">
        <h2>Knowledge Check</h2>
        ${Sampling.sampleN(module.knowledgeChecks, 3).map(renderKnowledgeCheck).join('')}
      </section>
```

Also find the line just below it that wires the click handlers:

```js
    wireKnowledgeChecks(container, module.knowledgeChecks);
```

This must wire only the questions actually rendered, not the full pool — replace it by capturing the sampled set once and reusing it for both rendering and wiring. Find the whole `renderModulePage` function body from its opening line to this point:

```js
  function renderModulePage(course, module, progressState, container) {
    document.title = `${module.title} – Claude Certified Architect Study Guide`;
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
        ${Sampling.sampleN(module.knowledgeChecks, 3).map(renderKnowledgeCheck).join('')}
      </section>
      <button id="mark-studied-btn" class="button" ${alreadyStudied ? 'disabled' : ''}>
        ${alreadyStudied ? '✓ Marked as studied' : 'Mark as studied'}
      </button>
    `;

    wireKnowledgeChecks(container, module.knowledgeChecks);
```

Replace this whole block with (introducing a `sampledChecks` variable used consistently in both places):

```js
  function renderModulePage(course, module, progressState, container) {
    document.title = `${module.title} – Claude Certified Architect Study Guide`;
    const alreadyStudied = Progress.isModuleStudied(progressState, course.id, module.id);
    const sampledChecks = Sampling.sampleN(module.knowledgeChecks, 3);
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
        ${sampledChecks.map(renderKnowledgeCheck).join('')}
      </section>
      <button id="mark-studied-btn" class="button" ${alreadyStudied ? 'disabled' : ''}>
        ${alreadyStudied ? '✓ Marked as studied' : 'Mark as studied'}
      </button>
    `;

    wireKnowledgeChecks(container, sampledChecks);
```

Leave the rest of the function (the `#mark-studied-btn` click listener) unchanged.

- [ ] **Step 2: Load sampling.js in module.html**

In `module.html`, find:

```html
  <script src="js/quiz-engine.js"></script>
  <script src="js/progress.js"></script>
  <script src="data/courses.js"></script>
  <script src="data/modules/ai-fluency-foundations.js"></script>
  <script src="js/render.js"></script>
```

Replace with:

```html
  <script src="js/quiz-engine.js"></script>
  <script src="js/sampling.js"></script>
  <script src="js/progress.js"></script>
  <script src="data/courses.js"></script>
  <script src="data/modules/ai-fluency-foundations.js"></script>
  <script src="js/render.js"></script>
```

- [ ] **Step 3: Verify**

Run: `node --check js/render.js` — expect no output (no syntax errors).

Then verify in the browser (start a local server, e.g. `python3 -m http.server 8123`): visit `module.html?course=ai-fluency-foundations&module=intro` several times (reload each time) and confirm the 3 knowledge-check questions shown are not always identical across reloads (with a pool of 6, expect visible variation within a few reloads). Confirm no console errors.

- [ ] **Step 4: Commit**

```bash
git add js/render.js module.html
git commit -m "Sample 3-of-6 knowledge checks per module visit instead of a fixed set"
```

---

### Task 6: Generalize the scored-test renderer, wire rotation into the Practice Test

**Files:**
- Modify: `js/render.js`
- Modify: `practice-test.html`

- [ ] **Step 1: Rename renderPracticeTest to renderScoredTest with a `kind` parameter**

In `js/render.js`, find the whole `renderPracticeTest` function:

```js
  function renderPracticeTest(course, questions, progressState, container) {
    document.title = `Practice Test: ${course.title} – Claude Certified Architect Study Guide`;
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

Replace it entirely with (renamed, parameterized by `kind`):

```js
  function renderScoredTest(course, questions, progressState, container, kind) {
    const isFinal = kind === 'final';
    const heading = isFinal ? 'Final Exam' : 'Practice Test';
    document.title = `${heading}: ${course.title} – Claude Certified Architect Study Guide`;

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
        <h1>${heading}</h1>
        <p class="subtitle">Answer every question, then submit for your score and a domain breakdown.</p>
      </header>
      <div id="results"></div>
      <form id="scored-test-form">
        ${questionsHtml}
        <button type="submit" class="button">Submit ${isFinal ? 'Exam' : 'Test'}</button>
      </form>
    `;

    const answers = {};
    const form = container.querySelector('#scored-test-form');

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

      if (isFinal) {
        Progress.recordFinalExamScore(progressState, course.id, result.percent);
      } else {
        Progress.recordPracticeScore(progressState, course.id, result.percent);
      }
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

Note the form's `id` changed from `practice-test-form` to `scored-test-form` (it's shared by both test types now) — this is intentional.

- [ ] **Step 2: Update the exported object**

Find:

```js
  return {
    getParam, renderNav, renderCourseMap, courseProgressLabel,
    renderCoursePage, renderModulePage, renderPracticeTest,
  };
```

Replace with:

```js
  return {
    getParam, renderNav, renderCourseMap, courseProgressLabel,
    renderCoursePage, renderModulePage, renderScoredTest,
  };
```

- [ ] **Step 3: Update practice-test.html to sample and pass kind='practice'**

Replace the entire contents of `practice-test.html` with:

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
  <script src="js/sampling.js"></script>
  <script src="js/progress.js"></script>
  <script src="data/courses.js"></script>
  <script src="data/questions/ai-fluency-foundations.js"></script>
  <script src="js/render.js"></script>
  <script>
    document.getElementById('nav').innerHTML = Render.renderNav('home');
    const courseId = Render.getParam('course');
    const course = COURSES.find((c) => c.id === courseId);
    const app = document.getElementById('app');
    const allQuestions = courseId === 'ai-fluency-foundations' ? QUESTIONS_AI_FLUENCY_FOUNDATIONS : [];
    if (!course || allQuestions.length === 0) {
      app.innerHTML = '<p>No practice test available yet for this course. <a href="index.html">Back to course map</a>.</p>';
    } else {
      const sampled = Sampling.sampleByDomain(allQuestions, 3);
      const progressState = Progress.load(window.localStorage);
      Render.renderScoredTest(course, sampled, progressState, app, 'practice');
    }
  </script>
</body>
</html>
```

- [ ] **Step 4: Verify**

Run: `node --check js/render.js` — expect no output.

Then in the browser: visit `practice-test.html?course=ai-fluency-foundations` twice (reload between) and confirm the 15 questions shown differ at least partially between loads, while still totaling 15 across all 5 domains (3 each). Take the test, submit, confirm scoring and domain breakdown still work exactly as before. Go to `course.html?course=ai-fluency-foundations` and confirm "Best score" still updates under Practice Test.

- [ ] **Step 5: Commit**

```bash
git add js/render.js practice-test.html
git commit -m "Generalize renderPracticeTest into renderScoredTest; rotate practice-test questions"
```

---

### Task 7: Final Exam page and course-page wiring

**Files:**
- Create: `final-exam.html`
- Modify: `js/render.js` (renderCoursePage)

- [ ] **Step 1: Create final-exam.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Final Exam – Claude Certified Architect Study Guide</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div id="nav"></div>
  <main id="app"></main>
  <script src="js/quiz-engine.js"></script>
  <script src="js/sampling.js"></script>
  <script src="js/progress.js"></script>
  <script src="data/courses.js"></script>
  <script src="data/questions/ai-fluency-foundations.js"></script>
  <script src="js/render.js"></script>
  <script>
    document.getElementById('nav').innerHTML = Render.renderNav('home');
    const courseId = Render.getParam('course');
    const course = COURSES.find((c) => c.id === courseId);
    const app = document.getElementById('app');
    const allQuestions = courseId === 'ai-fluency-foundations' ? QUESTIONS_AI_FLUENCY_FOUNDATIONS : [];
    if (!course || allQuestions.length === 0) {
      app.innerHTML = '<p>No final exam available yet for this course. <a href="index.html">Back to course map</a>.</p>';
    } else {
      const sampled = Sampling.sampleByDomain(allQuestions, 6);
      const progressState = Progress.load(window.localStorage);
      Render.renderScoredTest(course, sampled, progressState, app, 'final');
    }
  </script>
</body>
</html>
```

- [ ] **Step 2: Add a Final Exam section to renderCoursePage**

In `js/render.js`, find the available-course branch of `renderCoursePage` (the part after the placeholder `return;`):

```js
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

Replace with (adding a Final Exam section, and a note clarifying its scope):

```js
    const best = Progress.bestPracticeScore(progressState, course.id);
    const bestFinal = Progress.bestFinalExamScore(progressState, course.id);

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
      <section class="section">
        <h2>Final Exam</h2>
        <p class="subtitle">A longer, comprehensive test across all of this course's domains — modeled on the real exam's format. Scoped to this course's own material, not the official CCAR-F blueprint (see the <a href="project-plan.html">Project Plan</a>).</p>
        <p class="subtitle">${bestFinal === null ? "You haven't attempted the final exam yet." : `Best score: ${bestFinal}%`}</p>
        <a class="button button--secondary" href="final-exam.html?course=${course.id}">Take Final Exam</a>
      </section>
    `;
  }
```

- [ ] **Step 3: Verify**

Run: `node --check js/render.js` — expect no output.

In the browser: visit `course.html?course=ai-fluency-foundations`, confirm a new "Final Exam" section appears below "Practice Test" with a "Take Final Exam" button. Click it, confirm `final-exam.html` loads with 30 questions (6 per domain — verify by counting `.question-card` elements and checking domain tags via the sampled data, or simply confirm the page renders 30 numbered questions). Submit, confirm scoring/domain breakdown work, confirm "Final Exam" heading appears (not "Practice Test"), and confirm the "Submit Exam" button label. Return to `course.html?course=ai-fluency-foundations` and confirm the Final Exam section now shows a best score, and that the separate Practice Test score (if any from earlier testing) is unaffected by the final exam attempt.

- [ ] **Step 4: Commit**

```bash
git add final-exam.html js/render.js
git commit -m "Add Course 1 Final Exam page and course-page wiring"
```

---

### Task 8: Final verification pass

**Files:**
- None to create — verification only.

- [ ] **Step 1: Run the automated test suites**

```bash
node tests/quiz-engine.test.js
node tests/sampling.test.js
```

Expected: both print their "All ... tests passed." line, exit code 0, no `FAIL` lines.

- [ ] **Step 2: Full browser walkthrough**

Using a local server, starting from cleared `localStorage`:

1. Visit a module page 3 times (reload each time) — confirm the 3 knowledge-check questions shown vary across reloads (pool of 6).
2. Take the Practice Test twice (reload between attempts) — confirm the 15 questions vary at least partially between attempts, while always covering all 5 domains 3-each.
3. Take the Final Exam — confirm 30 questions across all 5 domains (6 each), correct/incorrect coloring, explanations, and a 5-row domain breakdown all work identically in style to the Practice Test.
4. On `course.html?course=ai-fluency-foundations`, confirm both "Practice Test" and "Final Exam" sections show independent best scores that don't overwrite each other.
5. Confirm `index.html`'s course card still shows only the Practice Test score (unchanged behavior) — Final Exam score is intentionally only shown on the course detail page, not the homepage card, to avoid cluttering it.
6. Check browser console for errors on all 7 pages now in the site: `index.html`, `course.html`, `module.html`, `practice-test.html`, `final-exam.html`, `project-plan.html`, and revisiting a placeholder course page.
7. Resize to mobile width and confirm the Final Exam page's domain-breakdown bars render correctly (reusing the existing CSS fix from the original build) with no horizontal overflow.

- [ ] **Step 3: Commit any fixes found**

```bash
git add -A
git commit -m "Fix issues found during final verification pass" # only if changes were made
```

---

## Plan Self-Review

**Spec coverage:** Question-bank expansion (Tasks 2, 3) → rotation via sampling (Tasks 1, 5, 6) → Final Exam (Task 7) → verification (Task 8). All three of the user's asks — rotating questions generally, a comprehensive final test, and that final test's questions also rotating — are covered.

**Placeholder scan:** No TBD/TODO; every step has complete code or a fully specified verification procedure.

**Type consistency:** `Sampling.sampleN(items, n, rng)` and `Sampling.sampleByDomain(questions, perDomain, rng)` signatures are used identically in Tasks 5, 6, and 7. `renderScoredTest(course, questions, progressState, container, kind)` signature matches its two call sites (Task 6's `practice-test.html`, Task 7's `final-exam.html`). `Progress.recordFinalExamScore`/`bestFinalExamScore` signatures mirror `recordPracticeScore`/`bestPracticeScore` exactly and are used consistently in Tasks 4 and 7. Question/knowledge-check object shapes added in Tasks 2–3 match what Tasks 5–7 expect (`id`, `domain`, `prompt`, `options`, `correctOptionId`, `explanation`).
