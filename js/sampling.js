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
