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
