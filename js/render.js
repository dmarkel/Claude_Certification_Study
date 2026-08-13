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
