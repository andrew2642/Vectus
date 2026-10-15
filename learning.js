const STORAGE_KEY = 'vectus-learning-progress';

const sidebar = document.querySelector('#sidebar');
const sidebarOverlay = document.querySelector('#sidebarOverlay');
const menuToggle = document.querySelector('#menuToggle');
const pageTransition = document.querySelector('#pageTransition');

function showPageTransition() {
  if (pageTransition) {
    pageTransition.classList.add('active');
  }
}

// Navigation
document.querySelectorAll('.nav-item[data-page]').forEach((button) => {
  button.addEventListener('click', (e) => {
    const page = button.dataset.page;
    const pages = {
      'Overview': 'index.html',
      'Learning Hub': 'learning.html',
      'CV Builder': 'cv-builder.html',
      'Applications': 'applications.html',
      'Settings': 'settings.html',
    };
    if (pages[page] && pages[page] !== window.location.pathname.split('/').pop()) {
      e.preventDefault();
      showPageTransition();
      setTimeout(() => {
        window.location.href = pages[page];
      }, 150);
    }
  });
});

// Sidebar functions
function openSidebar() {
  sidebar?.classList.add('open');
  sidebarOverlay?.classList.add('visible');
  menuToggle?.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeSidebar() {
  sidebar?.classList.remove('open');
  sidebarOverlay?.classList.remove('visible');
  menuToggle?.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

if (menuToggle && sidebar) {
  menuToggle.addEventListener('click', () => {
    if (sidebar.classList.contains('open')) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });
}

if (sidebarOverlay) {
  sidebarOverlay.addEventListener('click', closeSidebar);
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeSidebar();
  }
});

document.addEventListener('click', (event) => {
  if (
    window.innerWidth <= 900 &&
    sidebar?.classList.contains('open') &&
    !sidebar.contains(event.target) &&
    !menuToggle?.contains(event.target)
  ) {
    closeSidebar();
  }
});

// Utility functions
function loadJSON(key, fallback = null) {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Learning Hub specific functionality
const resourceLibrary = {
  'html & css': [
    { type: 'Course', title: 'MDN Web Docs - HTML & CSS', url: 'https://developer.mozilla.org/en-US/docs/Learn/HTML', time: '4–6 hours' },
    { type: 'Practice', title: 'Frontend Mentor - Newbie Challenges', url: 'https://www.frontendmentor.io/challenges', time: '2–3 hours/week' },
    { type: 'Project', title: 'Build a Responsive Portfolio', time: '1–2 days' }
  ],
  'javascript': [
    { type: 'Course', title: 'MDN JavaScript Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide', time: '6–8 hours' },
    { type: 'Practice', title: 'JavaScript.info Exercises', url: 'https://javascript.info/', time: 'Ongoing' },
    { type: 'Project', title: 'Interactive To-Do App', time: '4–6 hours' }
  ],
  'react': [
    { type: 'Course', title: 'React Official Tutorial', url: 'https://react.dev/learn', time: '4–6 hours' },
    { type: 'Project', title: 'Build a Small App in React', time: '4–8 hours' },
    { type: 'Practice', title: 'React Hooks Practice', time: '2–4 hours' }
  ],
  'python': [
    { type: 'Course', title: 'Python.org Tutorial', url: 'https://docs.python.org/3/tutorial/', time: '6–8 hours' },
    { type: 'Project', title: 'CLI Data Tool', time: '4–6 hours' },
    { type: 'Practice', title: 'Small Coding Exercises', time: 'Ongoing' }
  ],
  'system design': [
    { type: 'Course', title: 'System Design Primer', url: 'https://github.com/donnemartin/system-design-primer', time: '8–12 hours' },
    { type: 'Practice', title: 'Design a URL Shortener', time: '2–4 hours' },
    { type: 'Project', title: 'Scale a Simple App', time: '3–5 hours' }
  ],
  'communication': [
    { type: 'Reading', title: 'Tech Writing & Communication', time: '2–3 hours' },
    { type: 'Practice', title: 'Document Your Projects', time: 'Weekly habit' },
    { type: 'Project', title: 'Write a README for a Repo', time: '1–2 hours' }
  ]
};

function renderLearningPath() {
  const learningPathCard = document.getElementById('learningPathCard');
  const learningProgress = loadJSON(STORAGE_KEY, {});
  const assessment = loadJSON('vectus-assessment');
  const growthPlans = loadJSON('vectus-growth-plans', []);

  if (!learningPathCard) return;

  // Check if there's an active growth plan
  const activePlan = growthPlans.find(p => p.status === 'active') || growthPlans[0];

  if (activePlan?.phases?.length) {
    const firstIncompletePhase = activePlan.phases.find(p => !p.completed);
    const nextPhase = firstIncompletePhase || activePlan.phases[activePlan.phases.length - 1];

    learningPathCard.innerHTML = `
      <div class="learning-path-active">
        <div class="learning-path-header">
          <h3>${activePlan.title || 'Your Learning Path'}</h3>
          <span class="learning-path-status">${activePlan.status || 'Active'}</span>
        </div>
        <p class="muted-text" style="margin: var(--space-2) 0;">Target: ${activePlan.targetRole || 'Not set'}</p>
        <div class="learning-path-next">
          <span class="eyebrow">NEXT UP</span>
          <h4>${nextPhase.name || 'Phase 1'}</h4>
          <p class="muted-text">${nextPhase.description || 'Start your learning journey'}</p>
          <div class="learning-path-skills">
            ${(nextPhase.skills || []).map(s => `<span class="timeline-skill">${s}</span>`).join('')}
          </div>
        </div>
        <div class="learning-path-progress">
          <div class="progress-track" style="margin: var(--space-3) 0;">
            <div class="progress-fill" style="width: ${Math.round((activePlan.phases.filter(p => p.completed).length / activePlan.phases.length) * 100)}%"></div>
          </div>
          <p class="muted-text" style="margin: 0; font-size: 0.875rem;">${activePlan.phases.filter(p => p.completed).length} of ${activePlan.phases.length} phases completed</p>
        </div>
        <a class="primary-button" href="growth-plan.html" style="margin-top: var(--space-3);">Continue in Growth Plan →</a>
      </div>
    `;
  } else if (assessment?.skills?.length) {
    // Has assessment but no growth plan
    const skillsToImprove = assessment.skills.filter(s => s.level < 3).slice(0, 3);
    learningPathCard.innerHTML = `
      <div class="learning-path-suggested">
        <h3>Suggested Learning Path</h3>
        <p class="muted-text">Based on your assessment, here are your top skill gaps:</p>
        <ul style="margin: var(--space-3) 0; padding-left: var(--space-4);">
          ${skillsToImprove.map(s => `<li>${s.name} — ${s.levelLabel} (${s.score}%)</li>`).join('')}
        </ul>
        <a class="primary-button" href="growth-plan.html" style="margin-top: var(--space-3);">Generate Growth Plan →</a>
      </div>
    `;
  } else {
    learningPathCard.innerHTML = `
      <div class="learning-path-placeholder">
        <div class="placeholder-icon">📚</div>
        <h3>No learning path yet</h3>
        <p>Complete a skill assessment to unlock a tailored curriculum with lessons, exercises, and projects.</p>
        <a class="primary-button" href="growth-plan.html" style="margin-top: var(--space-3);">Start assessment →</a>
      </div>
    `;
  }
}

function renderSkillProgress() {
  const skillProgressGrid = document.getElementById('skillProgressGrid');
  const learningProgress = loadJSON(STORAGE_KEY, {});

  if (!skillProgressGrid) return;

  const skillsInProgress = learningProgress.skillsInProgress || [];
  const skillsCompleted = learningProgress.skillsCompleted || [];

  if (skillsInProgress.length === 0 && skillsCompleted.length === 0) {
    skillProgressGrid.innerHTML = `
      <div class="skill-progress-placeholder">
        <p class="muted-text">Start learning to track your skill progress here.</p>
      </div>
    `;
    return;
  }

  const allSkills = [...new Set([...skillsInProgress, ...skillsCompleted])];
  skillProgressGrid.innerHTML = allSkills.map(skill => {
    const isCompleted = skillsCompleted.includes(skill);
    const lessons = learningProgress[`${skill}-lessons`] || 0;
    const exercises = learningProgress[`${skill}-exercises`] || 0;
    const projects = learningProgress[`${skill}-projects`] || 0;
    return `
      <article class="skill-progress-card">
        <div class="skill-progress-header">
          <h4>${skill}</h4>
          <span class="skill-progress-status ${isCompleted ? 'completed' : 'in-progress'}">
            ${isCompleted ? 'Completed' : 'In Progress'}
          </span>
        </div>
        <div class="skill-progress-stats">
          <div class="skill-progress-stat">
            <strong>${lessons}</strong>
            <span>Lessons</span>
          </div>
          <div class="skill-progress-stat">
            <strong>${exercises}</strong>
            <span>Exercises</span>
          </div>
          <div class="skill-progress-stat">
            <strong>${projects}</strong>
            <span>Projects</span>
          </div>
        </div>
        <div class="progress-track" style="margin-top: var(--space-3);">
          <div class="progress-fill" style="width: ${isCompleted ? 100 : Math.min(100, (lessons + exercises + projects) * 10)}%"></div>
        </div>
      </article>
    `;
  }).join('');
}

function renderResources() {
  const resourcesGrid = document.getElementById('resourcesGrid');
  if (!resourcesGrid) return;

  let allResources = [];
  Object.entries(resourceLibrary).forEach(([skill, resources]) => {
    resources.forEach(r => allResources.push({ ...r, skill }));
  });

  resourcesGrid.innerHTML = allResources.map(resource => `
    <article class="resource-card">
      <div class="resource-type">${resource.type}</div>
      <h4>${resource.title}</h4>
      <p class="muted-text" style="margin: var(--space-1) 0; font-size: 0.8125rem;">${resource.skill}</p>
      <p class="muted-text" style="margin: 0; font-size: 0.75rem;">${resource.time}</p>
      ${resource.url ? `<a href="${resource.url}" target="_blank" rel="noopener" class="text-button" style="margin-top: var(--space-2);">Open resource →</a>` : ''}
    </article>
  `).join('');
}

function setupResourceFilters() {
  const searchInput = document.getElementById('resourceSearch');
  const skillFilter = document.getElementById('resourceFilter');
  const typeFilter = document.getElementById('resourceTypeFilter');

  function filterResources() {
    const searchTerm = searchInput?.value.toLowerCase() || '';
    const skill = skillFilter?.value || 'all';
    const type = typeFilter?.value || 'all';

    const cards = document.querySelectorAll('.resource-card');
    cards.forEach(card => {
      const title = card.querySelector('h4')?.textContent.toLowerCase() || '';
      const cardSkill = card.querySelector('.muted-text')?.textContent.toLowerCase() || '';
      const cardType = card.querySelector('.resource-type')?.textContent.toLowerCase() || '';

      const matchesSearch = title.includes(searchTerm) || cardSkill.includes(searchTerm);
      const matchesSkill = skill === 'all' || cardSkill.includes(skill);
      const matchesType = type === 'all' || cardType.includes(type);

      card.style.display = (matchesSearch && matchesSkill && matchesType) ? '' : 'none';
    });
  }

  searchInput?.addEventListener('input', filterResources);
  skillFilter?.addEventListener('change', filterResources);
  typeFilter?.addEventListener('change', filterResources);
}

// Initialize
renderLearningPath();
renderSkillProgress();
renderResources();
setupResourceFilters();

// Listen for storage changes
window.addEventListener('storage', () => {
  renderLearningPath();
  renderSkillProgress();
});