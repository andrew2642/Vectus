const sidebar = document.querySelector('#sidebar');
const sidebarOverlay = document.querySelector('#sidebarOverlay');
const menuToggle = document.querySelector('#menuToggle');
const pageName = document.querySelector('#pageName');
const breadcrumb = document.querySelector('#breadcrumb');
const notificationButton = document.querySelector('#notificationButton');
const userAvatar = document.querySelector('#userAvatar');
const userName = document.querySelector('#userName');
const userPlan = document.querySelector('#userPlan');
const pageTransition = document.querySelector('#pageTransition');

const navigationButtons = document.querySelectorAll('[data-page]');

function showPageTransition() {
  if (pageTransition) {
    pageTransition.classList.add('active');
  }
}

// Update the active navigation item and current page heading.
function navigateTo(page) {
  if (pageName) pageName.textContent = page;
  if (breadcrumb) breadcrumb.textContent = page;

  document.querySelectorAll('.nav-item[data-page]').forEach((button) => {
    const isActive = button.dataset.page === page;
    button.classList.toggle('active', isActive);

    if (isActive) {
      button.setAttribute('aria-current', 'page');
    } else {
      button.removeAttribute('aria-current');
    }
  });

  closeSidebar();
}

// Make navigation and call-to-action buttons functional.
navigationButtons.forEach((button) => {
  button.addEventListener('click', (e) => {
    const page = button.dataset.page;

    const pages = {
      'Learning Hub': 'learning.html',
      'CV Builder': 'cv-builder.html',
      'Applications': 'applications.html',
      'Settings': 'settings.html',
    };

    if (pages[page]) {
      e.preventDefault();
      showPageTransition();
      setTimeout(() => {
        window.location.href = pages[page];
      }, 150);
      return;
    }

    navigateTo(page);
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

// Open and close the mobile sidebar.
if (menuToggle && sidebar) {
  menuToggle.addEventListener('click', () => {
    if (sidebar.classList.contains('open')) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });
}

// Close sidebar on overlay click
if (sidebarOverlay) {
  sidebarOverlay.addEventListener('click', closeSidebar);
}

// Close sidebar on escape key
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeSidebar();
  }
});

// Close sidebar when clicking outside on mobile
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

// Placeholder notification until real notifications are implemented.
if (notificationButton) {
  notificationButton.addEventListener('click', () => {
    window.alert('You are all caught up! Notifications will be available soon.');
  });
}

// Load user profile from storage
function loadUserProfile() {
  try {
    const cvDraft = JSON.parse(localStorage.getItem('vectus-cv-draft') || 'null');
    const learningProgress = JSON.parse(localStorage.getItem('vectus-learning-progress') || '{}');

    if (cvDraft?.fullName) {
      if (userName) userName.textContent = cvDraft.fullName;
      if (userAvatar) userAvatar.textContent = cvDraft.fullName
        .split(' ')
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
    }

    if (learningProgress.currentSkill) {
      if (userPlan) userPlan.textContent = `${learningProgress.currentSkill} · Learning`;
    }
  } catch (error) {
    console.warn('Could not load user profile:', error);
  }
}

// Initialize dashboard stats from storage (if available)
function initDashboardStats() {
  try {
    const learningProgress = JSON.parse(localStorage.getItem('vectus-learning-progress') || '{}');
    const applications = JSON.parse(localStorage.getItem('vectus-applications') || '[]');
    const cvDraft = JSON.parse(localStorage.getItem('vectus-cv-draft') || 'null');

    // Main stat bar
    const statLearning = document.querySelector('#statLearning');
    const statProjects = document.querySelector('#statProjects');
    const statSkills = document.querySelector('#statSkills');
    const statApplications = document.querySelector('#statApplications');

    // Lessons completed
    const lessonsCompleted = learningProgress.lessonsCompleted || 0;
    if (statLearning) animateCounter(statLearning, 0, lessonsCompleted);

    // Projects built
    const projectsBuilt = learningProgress.projectsBuilt || 0;
    if (statProjects) animateCounter(statProjects, 0, projectsBuilt);

    // Skills in progress
    const skillsInProgress = learningProgress.skillsInProgress?.length || 0;
    if (statSkills) animateCounter(statSkills, 0, skillsInProgress);

    // Applications
    if (statApplications) animateCounter(statApplications, 0, applications?.length || 0);

    // Update sidebar progress card
    updateSidebarProgress(learningProgress, applications, cvDraft);
  } catch (error) {
    console.warn('Could not initialize dashboard stats:', error);
  }
}

function animateCounter(element, start, end, suffix = '') {
  const duration = 800;
  const startTime = performance.now();
  const isPercentage = suffix === '%';

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(start + (end - start) * eased);
    element.textContent = `${current}${suffix}`;
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

function updateSidebarProgress(learningProgress, applications, cvDraft) {
  const progressFill = document.querySelector('.roadmap-card .progress-fill');
  const progressMeta = document.querySelector('.roadmap-card .progress-meta');

  if (!progressFill || !progressMeta) return;

  let milestones = 0;
  let completed = 0;

  // Learning milestones
  if (learningProgress.skillsInProgress?.length) {
    milestones += learningProgress.skillsInProgress.length;
    completed += learningProgress.skillsCompleted?.length || 0;
  }

  // CV milestone
  if (cvDraft?.fullName && cvDraft?.professionalTitle) {
    milestones++;
    completed++;
  }

  // Applications milestone
  if (applications?.length > 0) {
    milestones++;
    completed++;
  }

  // Default milestones if no data
  if (milestones === 0) {
    milestones = 4;
    completed = 0;
  }

  const percentage = milestones > 0 ? Math.round((completed / milestones) * 100) : 0;
  progressFill.style.width = `${percentage}%`;
  const metaSpans = progressMeta.querySelectorAll('span');
  if (metaSpans[0]) metaSpans[0].textContent = `${completed} of ${milestones} milestones`;
  if (metaSpans[1]) metaSpans[1].textContent = `${percentage}%`;
}

// Initialize on load
loadUserProfile();
initDashboardStats();

// Listen for storage changes from other tabs/pages
window.addEventListener('storage', () => {
  loadUserProfile();
  initDashboardStats();
});