const STORAGE_KEYS = {
  PROFILE: 'vectus-profile',
  CAREER: 'vectus-career-prefs',
  LANGUAGE: 'vectus-language-prefs',
  APPEARANCE: 'vectus-appearance-prefs',
  ASSESSMENT: 'vectus-assessment',
  GROWTH_PLANS: 'vectus-growth-plans',
  GROWTH_PROGRESS: 'vectus-growth-progress',
  CV_DRAFT: 'vectus-cv-draft',
  APPLICATIONS: 'vectus-applications'
};

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

function showSavedMessage(elementId) {
  const el = document.getElementById(elementId);
  if (el) {
    el.hidden = false;
    setTimeout(() => { el.hidden = true; }, 3000);
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function calculateStorageSizes() {
  let total = 0;
  const sizes = {};
  Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
    const data = localStorage.getItem(key);
    const size = data ? new Blob([data]).size : 0;
    sizes[name] = size;
    total += size;
  });
  return { sizes, total };
}

function updateStorageDisplay() {
  const { sizes, total } = calculateStorageSizes();
  const mapping = {
    ASSESSMENT: 'sizeAssessment',
    GROWTH_PLANS: 'sizeGrowthPlans',
    GROWTH_PROGRESS: 'sizeGrowthProgress',
    CV_DRAFT: 'sizeCVDrafts',
    APPLICATIONS: 'sizeApplications'
  };
  Object.entries(mapping).forEach(([key, id]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = formatBytes(sizes[key] || 0);
  });
  const totalEl = document.getElementById('sizeTotal');
  if (totalEl) totalEl.textContent = formatBytes(total);
}

// Profile Form
const profileForm = document.getElementById('profileForm');
const profileFields = ['fullName', 'email', 'currentRole', 'location', 'linkedin', 'github', 'portfolio', 'bio'];

function loadProfile() {
  const profile = loadJSON(STORAGE_KEYS.PROFILE, {});
  profileFields.forEach(field => {
    const input = document.getElementById(`profile${field.charAt(0).toUpperCase() + field.slice(1)}`);
    if (input && profile[field]) input.value = profile[field];
  });
}

function saveProfile(e) {
  e.preventDefault();
  const profile = {};
  profileFields.forEach(field => {
    const input = document.getElementById(`profile${field.charAt(0).toUpperCase() + field.slice(1)}`);
    if (input) profile[field] = input.value;
  });
  saveJSON(STORAGE_KEYS.PROFILE, profile);
  if (window.toast) window.toast.success('Profile saved');
  showSavedMessage('profileSaved');
  updateSidebarProfile();
}

function resetProfile() {
  if (confirm('Reset profile to defaults?')) {
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    profileFields.forEach(field => {
      const input = document.getElementById(`profile${field.charAt(0).toUpperCase() + field.slice(1)}`);
      if (input) input.value = '';
    });
    if (window.toast) window.toast.info('Profile reset');
    updateSidebarProfile();
  }
}

function updateSidebarProfile() {
  const profile = loadJSON(STORAGE_KEYS.PROFILE, {});
  const assessment = loadJSON(STORAGE_KEYS.ASSESSMENT, {});
  const userName = document.getElementById('userName');
  const userAvatar = document.getElementById('userAvatar');
  const userPlan = document.getElementById('userPlan');

  if (profile.fullName && userName) {
    userName.textContent = profile.fullName;
  }
  if (profile.fullName && userAvatar) {
    userAvatar.textContent = profile.fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }
  if (assessment.careerGoal && userPlan) {
    userPlan.textContent = `${assessment.careerGoal} · Demo`;
  }
}

profileForm?.addEventListener('submit', saveProfile);
document.getElementById('resetProfileBtn')?.addEventListener('click', resetProfile);

// Career Preferences Form
const careerForm = document.getElementById('careerForm');
const careerFields = ['targetRole', 'experienceLevel', 'preferredTimeline', 'targetIndustries', 'remotePreference'];

function loadCareerPrefs() {
  const prefs = loadJSON(STORAGE_KEYS.CAREER, {});
  careerFields.forEach(field => {
    const input = document.getElementById(field);
    if (input && prefs[field]) input.value = prefs[field];
  });
}

function saveCareerPrefs(e) {
  e.preventDefault();
  const prefs = {};
  careerFields.forEach(field => {
    const input = document.getElementById(field);
    if (input) prefs[field] = input.value;
  });
  saveJSON(STORAGE_KEYS.CAREER, prefs);
  if (window.toast) window.toast.success('Career preferences saved');
  showSavedMessage('careerSaved');
}

function resetCareerPrefs() {
  if (confirm('Reset career preferences?')) {
    localStorage.removeItem(STORAGE_KEYS.CAREER);
    careerFields.forEach(field => {
      const input = document.getElementById(field);
      if (input) input.value = '';
    });
    if (window.toast) window.toast.info('Career preferences reset');
  }
}

careerForm?.addEventListener('submit', saveCareerPrefs);
document.getElementById('resetCareerBtn')?.addEventListener('click', resetCareerPrefs);

// Language Form
const languageForm = document.getElementById('languageForm');
const languageFields = ['interfaceLanguage', 'cvLanguage', 'dateFormat'];

function loadLanguagePrefs() {
  const prefs = loadJSON(STORAGE_KEYS.LANGUAGE, { interfaceLanguage: 'en', cvLanguage: 'en', dateFormat: 'MM/DD/YYYY' });
  languageFields.forEach(field => {
    const input = document.getElementById(field);
    if (input && prefs[field]) input.value = prefs[field];
  });
}

function saveLanguagePrefs(e) {
  e.preventDefault();
  const prefs = {};
  languageFields.forEach(field => {
    const input = document.getElementById(field);
    if (input) prefs[field] = input.value;
  });
  saveJSON(STORAGE_KEYS.LANGUAGE, prefs);
  if (window.toast) window.toast.success('Language settings saved');
  showSavedMessage('languageSaved');
}

languageForm?.addEventListener('submit', saveLanguagePrefs);

// Appearance Form
const appearanceForm = document.getElementById('appearanceForm');

function loadAppearancePrefs() {
  const prefs = loadJSON(STORAGE_KEYS.APPEARANCE, { theme: 'dark', reduceMotion: false, compactMode: false });
  const themeSelect = document.getElementById('themeSelect');
  const reduceMotion = document.getElementById('reduceMotion');
  const compactMode = document.getElementById('compactMode');

  if (themeSelect && prefs.theme) themeSelect.value = prefs.theme;
  if (reduceMotion) reduceMotion.checked = prefs.reduceMotion || false;
  if (compactMode) compactMode.checked = prefs.compactMode || false;

  applyAppearancePrefs(prefs);
}

function applyAppearancePrefs(prefs) {
  const root = document.documentElement;

  // Theme
  if (prefs.theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = prefersDark ? 'dark' : 'light';
  } else {
    root.dataset.theme = prefs.theme;
  }

  // Reduce motion
  if (prefs.reduceMotion) {
    root.style.setProperty('--transition', '0.01ms');
  } else {
    root.style.setProperty('--transition', '180ms ease');
  }

  // Compact mode
  if (prefs.compactMode) {
    root.classList.add('compact-mode');
  } else {
    root.classList.remove('compact-mode');
  }
}

function saveAppearancePrefs(e) {
  e.preventDefault();
  const prefs = {
    theme: document.getElementById('themeSelect')?.value || 'dark',
    reduceMotion: document.getElementById('reduceMotion')?.checked || false,
    compactMode: document.getElementById('compactMode')?.checked || false
  };
  saveJSON(STORAGE_KEYS.APPEARANCE, prefs);
  applyAppearancePrefs(prefs);
  if (window.toast) window.toast.success('Appearance settings saved');
  showSavedMessage('appearanceSaved');
}

appearanceForm?.addEventListener('submit', saveAppearancePrefs);

// Data Actions
document.getElementById('exportDataBtn')?.addEventListener('click', () => {
  const data = {};
  Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
    data[name] = loadJSON(key);
  });
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `vectus-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  if (window.toast) window.toast.success('Data exported');
});

document.getElementById('importDataBtn')?.addEventListener('click', () => {
  document.getElementById('importFile').click();
});

document.getElementById('importFile')?.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target.result);
      let imported = 0;
      Object.entries(data).forEach(([name, value]) => {
        if (STORAGE_KEYS[name] && value !== null && value !== undefined) {
          saveJSON(STORAGE_KEYS[name], value);
          imported++;
        }
      });
      if (window.toast) window.toast.success(`Imported ${imported} data sections`);
      updateStorageDisplay();
      updateSidebarProfile();
      e.target.value = '';
    } catch (err) {
      if (window.toast) window.toast.error('Invalid JSON file');
    }
  };
  reader.readAsText(file);
});

document.getElementById('clearDataBtn')?.addEventListener('click', () => {
  if (confirm('⚠️ This will permanently delete ALL your Vectus data:\n\n• Skill assessments\n• Growth plans & progress\n• CV drafts\n• Job applications\n• All preferences\n\nThis cannot be undone. Continue?')) {
    if (confirm('Are you absolutely sure? Type "DELETE" to confirm.')) {
      const input = prompt('Type DELETE to confirm:');
      if (input === 'DELETE') {
        Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
        if (window.toast) window.toast.success('All data cleared');
        updateStorageDisplay();
        updateSidebarProfile();
        loadProfile();
        loadCareerPrefs();
        loadLanguagePrefs();
        loadAppearancePrefs();
      }
    }
  }
});

// Initialize
loadProfile();
loadCareerPrefs();
loadLanguagePrefs();
loadAppearancePrefs();
updateStorageDisplay();
updateSidebarProgress();

// Sidebar progress (shared with dashboard)
function updateSidebarProgress() {
  const assessment = loadJSON(STORAGE_KEYS.ASSESSMENT);
  const growthProgress = loadJSON(STORAGE_KEYS.GROWTH_PROGRESS, {});
  const applications = loadJSON(STORAGE_KEYS.APPLICATIONS, []);
  const cvDraft = loadJSON(STORAGE_KEYS.CV_DRAFT);
  const growthPlans = loadJSON(STORAGE_KEYS.GROWTH_PLANS, []);

  const progressFill = document.querySelector('.roadmap-card .progress-fill');
  const progressMeta = document.querySelector('.roadmap-card .progress-meta');

  if (!progressFill || !progressMeta) return;

  let milestones = 0;
  let completed = 0;

  // Assessment milestone
  if (assessment?.skills?.length) {
    milestones++;
    completed++;
  }

  // Growth plan milestones
  if (growthPlans.length > 0) {
    milestones++;
    const activePlan = growthPlans.find(p => p.status === 'active') || growthPlans[0];
    if (activePlan?.phases) {
      activePlan.phases.forEach(phase => {
        milestones++;
        if (phase.completed) completed++;
      });
    }
  } else if (assessment?.skills?.length) {
    assessment.skills.forEach(skill => {
      milestones++;
      const tasks = Object.keys(growthProgress).filter(k => k.startsWith(skill.name.toLowerCase()));
      if (tasks.length > 0 && tasks.every(t => growthProgress[t] === true)) {
        completed++;
      }
    });
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

  if (milestones === 0) {
    milestones = 9;
    completed = 0;
  }

  const percentage = milestones > 0 ? Math.round((completed / milestones) * 100) : 0;
  progressFill.style.width = `${percentage}%`;
  const metaSpans = progressMeta.querySelectorAll('span');
  if (metaSpans[0]) metaSpans[0].textContent = `${completed} of ${milestones} milestones`;
  if (metaSpans[1]) metaSpans[1].textContent = `${percentage}%`;
}

// Listen for storage changes from other tabs
window.addEventListener('storage', () => {
  loadProfile();
  loadCareerPrefs();
  loadLanguagePrefs();
  loadAppearancePrefs();
  updateStorageDisplay();
  updateSidebarProfile();
  updateSidebarProgress();
});