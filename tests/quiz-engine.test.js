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
