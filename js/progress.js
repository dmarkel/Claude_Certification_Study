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
      const fresh = freshState();
      return {
        modulesStudied: (parsed.modulesStudied && typeof parsed.modulesStudied === 'object') ? parsed.modulesStudied : fresh.modulesStudied,
        practiceScores: (parsed.practiceScores && typeof parsed.practiceScores === 'object') ? parsed.practiceScores : fresh.practiceScores,
      };
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
