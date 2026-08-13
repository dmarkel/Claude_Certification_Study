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
    document.title = `${course.title} – Claude Certified Architect Study Guide`;

    if (course.status === 'placeholder') {
      const examDomainHtml = course.examDomain
        ? `<p class="subtitle" style="margin-top:0.5rem;"><strong>Exam blueprint:</strong> ${course.examDomain}</p>`
        : '';
      container.innerHTML = `
        <header class="page-header">
          <h1>${course.title}</h1>
          <p class="subtitle">${course.description}</p>
          <a class="external-link" href="${course.skilljarUrl}" target="_blank" rel="noopener">Open official course on Skilljar ↗</a>
        </header>
        <section class="section">
          <span class="status-badge status-badge--placeholder">Coming Soon</span>
          <p class="subtitle" style="margin-top:0.75rem;">Not yet started. This course's study guide and practice test will be built out once it's actually completed.</p>
          ${examDomainHtml}
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

    container.querySelector('#mark-studied-btn').addEventListener('click', (e) => {
      Progress.markModuleStudied(progressState, course.id, module.id);
      Progress.save(progressState, window.localStorage);
      e.target.disabled = true;
      e.target.textContent = '✓ Marked as studied';
    });
  }

  const DOMAIN_LABELS = {
    delegation: 'Delegation',
    description: 'Description',
    discernment: 'Discernment',
    diligence: 'Diligence',
    'genai-fundamentals': 'Generative AI Fundamentals',
  };

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

  return {
    getParam, renderNav, renderCourseMap, courseProgressLabel,
    renderCoursePage, renderModulePage, renderScoredTest,
  };
})();
