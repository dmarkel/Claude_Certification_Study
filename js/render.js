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

  return { getParam, renderNav, renderCourseMap, courseProgressLabel, renderCoursePage };
})();
