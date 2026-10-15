'use strict';

const STORAGE_KEY = 'vectus-applications';

const formPanel = document.getElementById('application-form-panel');
const form = document.getElementById('application-form');
const list = document.getElementById('application-list');
const searchInput = document.getElementById('application-search');
const filterSelect = document.getElementById('application-filter');

const openFormButton = document.getElementById('open-application-form');
const cancelFormButton = document.getElementById('cancel-application-form');
const formTitle = document.getElementById('application-form-title');

const autosaveIndicator = document.getElementById('autosaveIndicator');
const autosaveText = autosaveIndicator?.querySelector('.autosave-text');
const autosaveDot = autosaveIndicator?.querySelector('.dot');

const pageTransition = document.querySelector('#pageTransition');

function showPageTransition() {
  if (pageTransition) {
    pageTransition.classList.add('active')
  }
}

document.querySelectorAll('.nav-item[data-page]').forEach((button) => {
  button.addEventListener('click', (e) => {
    const page = button.dataset.page
    const pages = {
      'Overview': 'index.html',
      'Learning Hub': 'learning.html',
      'CV Builder': 'cv-builder.html',
      'Applications': 'applications.html',
      'Settings': 'settings.html',
    }
    if (pages[page] && pages[page] !== window.location.pathname.split('/').pop()) {
      e.preventDefault()
      showPageTransition()
      setTimeout(() => {
        window.location.href = pages[page]
      }, 150)
    }
  })
})

const statusOptions = [
  'Saved',
  'Applied',
  'Interview',
  'Offer',
  'Rejected'
];

const statusColors = {
  Saved: '#a0a0b2',
  Applied: '#8b5cf6',
  Interview: '#60a5fa',
  Offer: '#4ade80',
  Rejected: '#f87171'
};

let applications = loadApplications();
let editingId = null;

function loadApplications() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(stored) ? stored : [];
  } catch (error) {
    console.error('Could not load applications:', error);
    return [];
  }
}

function showAutosave() {
  if (autosaveIndicator && autosaveText && autosaveDot) {
    autosaveIndicator.classList.remove('saved', 'saving');
    autosaveIndicator.classList.add('saving');
    autosaveText.textContent = 'Saving…';
    setTimeout(() => {
      autosaveIndicator.classList.remove('saving');
      autosaveIndicator.classList.add('saved');
      autosaveText.textContent = 'Saved';
      setTimeout(() => {
        autosaveIndicator.classList.remove('saved');
      }, 2000);
    }, 300);
  }
}

function saveApplications() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
    showAutosave();
    return true;
  } catch (error) {
    console.error('Could not save applications:', error);
    alert('Your applications could not be saved in this browser.');
    return false;
  }
}

function createId() {
  if (window.crypto && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getToday() {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
}

function openForm(application = null) {
  const isEdit = Boolean(application);

  editingId = isEdit ? application.id : null;
  formTitle.textContent = isEdit
    ? 'Edit application'
    : 'Add an application';

  form.elements.jobTitle.value = application?.jobTitle || '';
  form.elements.company.value = application?.company || '';
  form.elements.status.value = application?.status || 'Saved';
  form.elements.date.value = application?.date || getToday();
  form.elements.link.value = application?.link || '';
  form.elements.notes.value = application?.notes || '';

  formPanel.hidden = false;
  document.getElementById('job-title').focus();
}

function closeForm() {
  formPanel.hidden = true;
  form.reset();
  editingId = null;
}

function createTextElement(tagName, className, text) {
  const element = document.createElement(tagName);
  element.className = className;
  element.textContent = text;
  return element;
}

function updateStats() {
  const totals = {
    total: applications.length,
    applied: 0,
    interview: 0,
    offer: 0
  };

  for (const application of applications) {
    const key = application.status.toLowerCase();

    if (key in totals) {
      totals[key]++;
    }
  }

  document.getElementById('stat-total').textContent = totals.total;
  document.getElementById('stat-applied').textContent = totals.applied;
  document.getElementById('stat-interview').textContent = totals.interview;
  document.getElementById('stat-offer').textContent = totals.offer;
}

function formatDate(dateString) {
  if (!dateString) return 'No date recorded';

  const date = new Date(`${dateString}T12:00:00`);

  if (Number.isNaN(date.getTime())) return 'Invalid date';

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}

function renderApplications() {
  updateStats();
  list.replaceChildren();

  const searchTerm = searchInput.value.trim().toLowerCase();
  const selectedStatus = filterSelect.value;

  const filteredApplications = applications
    .filter((application) => {
      const matchesSearch = [
        application.jobTitle,
        application.company
      ].some((value) => String(value || '').toLowerCase().includes(searchTerm));

      const matchesStatus =
        selectedStatus === 'All' || application.status === selectedStatus;

      return matchesSearch && matchesStatus;
    })
    .sort((first, second) => {
      return String(second.updatedAt || '').localeCompare(
        String(first.updatedAt || '')
      );
    });

  if (filteredApplications.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'application-empty';

    const heading = document.createElement('h3');
    heading.textContent = applications.length === 0
      ? 'Your tracker is ready'
      : 'No matching applications';

    const message = document.createElement('p');
    message.textContent = applications.length === 0
      ? 'Add your first opportunity to start tracking your job search.'
      : 'Try a different search term or status filter.';

    emptyState.append(heading, message);
    list.append(emptyState);
    return;
  }

  for (const application of filteredApplications) {
    list.append(createApplicationCard(application));
  }
}

function createApplicationCard(application) {
  const card = document.createElement('article');
  card.className = 'application-card';

  const top = document.createElement('div');
  top.className = 'application-card-top';

  const headingGroup = document.createElement('div');
  headingGroup.append(
    createTextElement('h3', '', application.jobTitle || 'Untitled role'),
    createTextElement('p', 'application-company', application.company || 'Unknown company')
  );

  const statusBadge = createTextElement(
    'span',
    'application-status',
    application.status
  );

  top.append(headingGroup, statusBadge);

  const date = createTextElement(
    'p',
    'application-date',
    `Date: ${formatDate(application.date)}`
  );

  const statusLabel = createTextElement('label', '', 'Update status');

  const statusSelect = document.createElement('select');
  statusSelect.setAttribute(
    'aria-label',
    `Update status for ${application.jobTitle || 'this application'}`
  );

  for (const status of statusOptions) {
    const option = document.createElement('option');
    option.value = status;
    option.textContent = status;
    option.selected = application.status === status;
    statusSelect.append(option);
  }

  statusSelect.addEventListener('change', () => {
    updateApplication(application.id, { status: statusSelect.value });
  });

  card.append(top, date, statusLabel, statusSelect);

  if (application.notes) {
    card.append(
      createTextElement('p', 'application-notes', application.notes)
    );
  }

  if (application.link) {
    try {
      const parsedUrl = new URL(application.link);

      if (parsedUrl.protocol === 'https:' || parsedUrl.protocol === 'http:') {
        const link = document.createElement('a');
        link.href = parsedUrl.href;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.className = 'text-link';
        link.textContent = 'Open job listing';
        card.append(link);
      }
    } catch {
      // Ignore an invalid optional URL.
    }
  }

  const actions = document.createElement('div');
  actions.className = 'application-actions';

  const editButton = document.createElement('button');
  editButton.type = 'button';
  editButton.textContent = 'Edit';
  editButton.addEventListener('click', () => openForm(application));

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'delete-application';
  deleteButton.textContent = 'Delete';
  deleteButton.addEventListener('click', () => {
    const confirmed = window.confirm(
      `Delete the application for "${application.jobTitle || 'this role'}" at "${application.company || 'this company'}"?`
    );

    if (!confirmed) return;

    applications = applications.filter((item) => item.id !== application.id);

    if (saveApplications()) {
      renderApplications();
      if (window.toast) {
        window.toast.success('Application deleted')
      }
    }
  });

  actions.append(editButton, deleteButton);
  card.append(actions);

  return card;
}

function updateApplication(id, changes) {
  const previousApplications = applications;

  applications = applications.map((application) => {
    if (application.id !== id) return application;

    return {
      ...application,
      ...changes,
      updatedAt: new Date().toISOString()
    };
  });

  if (!saveApplications()) {
    applications = previousApplications;
  }

  renderApplications();

  if (window.toast && changes.status) {
    window.toast.success(`Status updated to ${changes.status}`)
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const jobTitle = form.elements.jobTitle.value.trim();
  const company = form.elements.company.value.trim();
  const status = form.elements.status.value;
  const date = form.elements.date.value;
  const link = form.elements.link.value.trim();
  const notes = form.elements.notes.value.trim();

  if (!jobTitle || !company) {
    alert('Please enter both the job title and company.');
    return;
  }

  if (!statusOptions.includes(status)) {
    alert('Please choose a valid application status.');
    return;
  }

  if (link) {
    try {
      const parsedUrl = new URL(link);

      if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
        alert('Please enter a valid HTTP or HTTPS job link.');
        return;
      }
    } catch {
      alert('Please enter a valid job link.');
      return;
    }
  }

  const now = new Date().toISOString();

  if (editingId) {
    applications = applications.map((application) => {
      if (application.id !== editingId) return application;

      return {
        ...application,
        jobTitle,
        company,
        status,
        date,
        link,
        notes,
        updatedAt: now
      };
    });
  } else {
    applications.push({
      id: createId(),
      jobTitle,
      company,
      status,
      date,
      link,
      notes,
      createdAt: now,
      updatedAt: now
    });
  }

  if (saveApplications()) {
    closeForm();
    renderApplications();
    if (window.toast) {
      if (editingId) {
        window.toast.success('Application updated')
      } else {
        window.toast.success('Application added')
      }
    }
  }
});

openFormButton.addEventListener('click', () => openForm());
cancelFormButton.addEventListener('click', closeForm);
searchInput.addEventListener('input', renderApplications);
filterSelect.addEventListener('change', renderApplications);

let hasPendingChanges = false;

form.addEventListener('change', () => {
  hasPendingChanges = true;
});

form.addEventListener('reset', () => {
  hasPendingChanges = false;
});

window.addEventListener('beforeunload', () => {
  if (formPanel.hidden || !hasPendingChanges) return;
  return;
});

// Mobile sidebar handling
const sidebar = document.querySelector('#sidebar');
const sidebarOverlay = document.querySelector('#sidebarOverlay');
const menuToggle = document.querySelector('#menuToggle');

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