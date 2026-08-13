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
