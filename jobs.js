const jobList = document.querySelector('#jobList')
const searchForm = document.querySelector('#jobSearchForm')
const searchInput = document.querySelector('#jobSearch')
const typeFilter = document.querySelector('#jobType')
const locationFilter = document.querySelector('#jobLocation')
const sortSelect = document.querySelector('#jobSort')
const jobCount = document.querySelector('#jobCount')
const savedJobCount = document.querySelector('#savedJobCount')
const profileStatus = document.querySelector('#profileStatus')
const resultsDescription = document.querySelector('#resultsDescription')
const emptyState = document.querySelector('#jobEmptyState')
const resetFiltersButton = document.querySelector('#resetJobFilters')
const detailDialog = document.querySelector('#jobDetailDialog')
const detailBody = document.querySelector('#jobDetailBody')
const closeDetailButton = document.querySelector('#closeJobDetail')
const sidebar = document.querySelector('#sidebar')
const menuToggle = document.querySelector('#menuToggle')
const pageTransition = document.querySelector('#pageTransition')

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
      'Skill Assessment': 'assessment.html',
      'Growth Plan': 'growth-plan.html',
      'CV Builder': 'cv-builder.html',
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

const PROFILE_KEY = 'vectus-assessment'
const SAVED_JOBS_KEY = 'vectus-saved-jobs'

const jobs = [
  {
    id: 'frontend-intern',
    title: 'Frontend Developer Intern',
    company: 'Vectus Demo Studio',
    type: 'Internship',
    location: 'Remote',
    salary: 'Example: unpaid / learning-focused',
    experience: 'Entry-level',
    description:
      'A sample internship role focused on building accessible, responsive interfaces and learning frontend development workflows.',
    skills: ['HTML', 'CSS', 'JavaScript', 'Git'],
    responsibilities: [
      'Build responsive interface components.',
      'Practice accessibility and clean frontend code.',
      'Use Git to manage project changes.',
    ],
  },
  {
    id: 'junior-frontend',
    title: 'Junior Frontend Developer',
    company: 'Northstar Demo',
    type: 'Full-time',
    location: 'Hybrid',
    salary: 'Example: salary not verified',
    experience: 'Junior',
    description:
      'A sample junior role involving reusable UI components, responsive layouts, and collaboration with designers and developers.',
    skills: ['JavaScript', 'React', 'CSS', 'REST APIs', 'Git'],
    responsibilities: [
      'Implement responsive pages from designs.',
      'Integrate frontend interfaces with APIs.',
      'Debug and maintain existing components.',
    ],
  },
  {
    id: 'python-intern',
    title: 'Python Developer Intern',
    company: 'CodeHarbor Demo',
    type: 'Internship',
    location: 'Remote',
    salary: 'Example: not specified',
    experience: 'Entry-level',
    description:
      'A sample learning opportunity focused on Python fundamentals, backend logic, testing, and small development projects.',
    skills: ['Python', 'SQL', 'Git', 'Problem Solving'],
    responsibilities: [
      'Write and test Python functions.',
      'Practice working with databases.',
      'Document and review code.',
    ],
  },
  {
    id: 'django-developer',
    title: 'Junior Backend Developer',
    company: 'API Works Demo',
    type: 'Full-time',
    location: 'On-site',
    salary: 'Example: salary not verified',
    experience: 'Junior',
    description:
      'A sample backend role involving API development, database operations, validation, and debugging.',
    skills: ['Python', 'Django', 'REST APIs', 'PostgreSQL', 'Git'],
    responsibilities: [
      'Build and maintain REST endpoints.',
      'Work with relational database models.',
      'Write tests and troubleshoot backend issues.',
    ],
  },
  {
    id: 'web-freelancer',
    title: 'Freelance Website Developer',
    company: 'Independent Projects Demo',
    type: 'Freelance',
    location: 'Remote',
    salary: 'Example: project-based',
    experience: 'Flexible',
    description:
      'A sample freelance opportunity for developing simple business websites, improving existing pages, and delivering responsive layouts.',
    skills: ['HTML', 'CSS', 'JavaScript', 'Responsive Design'],
    responsibilities: [
      'Build and update small business websites.',
      'Communicate scope and deliverables clearly.',
      'Test pages across screen sizes.',
    ],
  },
  {
    id: 'data-intern',
    title: 'Data Analyst Intern',
    company: 'Insight Demo',
    type: 'Internship',
    location: 'Hybrid',
    salary: 'Example: not specified',
    experience: 'Entry-level',
    description:
      'A sample internship centered on exploring datasets, writing queries, and communicating findings.',
    skills: ['Python', 'SQL', 'Excel', 'Data Analysis'],
    responsibilities: [
      'Clean and inspect sample datasets.',
      'Write SQL queries to answer questions.',
      'Create concise reports from findings.',
    ],
  },
  {
    id: 'ui-parttime',
    title: 'Web UI Developer',
    company: 'Pixel Route Demo',
    type: 'Part-time',
    location: 'Remote',
    salary: 'Example: hourly rate not verified',
    experience: 'Junior',
    description:
      'A sample part-time role focused on polished interfaces, component consistency, and responsive web design.',
    skills: ['HTML', 'CSS', 'JavaScript', 'UI Design'],
    responsibilities: [
      'Create consistent page layouts.',
      'Refine typography, spacing, and responsiveness.',
      'Check interfaces for usability issues.',
    ],
  },
]

function readJson(key, fallback) {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function readProfile() {
  try {
    const raw = sessionStorage.getItem(PROFILE_KEY)
    const profile = raw ? JSON.parse(raw) : null

    if (
      !profile ||
      !Array.isArray(profile.skills) ||
      profile.skills.length === 0
    ) {
      return null
    }

    return profile
  } catch {
    return null
  }
}

function getProfileSkills(profile) {
  if (!profile) return []

  return profile.skills
    .filter((skill) => skill && skill.name)
    .map((skill) => String(skill.name).trim().toLowerCase())
    .filter(Boolean)
}

function normalizeSkill(skill) {
  return skill.toLowerCase().replace(/\s+/g, ' ').trim()
}

function hasMatchingSkill(requiredSkill, profileSkills) {
  const required = normalizeSkill(requiredSkill)

  return profileSkills.some((userSkill) => {
    const user = normalizeSkill(userSkill)

    return user === required ||
      user.includes(required) ||
      required.includes(user)
  })
}

function getJobMatch(job, profileSkills) {
  if (!profileSkills.length) return null

  const matchedSkills = job.skills.filter((skill) =>
    hasMatchingSkill(skill, profileSkills)
  )

  return Math.round((matchedSkills.length / job.skills.length) * 100)
}

function getSavedJobIds() {
  const saved = readJson(SAVED_JOBS_KEY, [])

  return Array.isArray(saved)
    ? saved.filter((id) => typeof id === 'string')
    : []
}

function saveJobIds(ids) {
  try {
    localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(ids))
  } catch {
  }
}

function makeElement(tag, className, text) {
  const element = document.createElement(tag)

  if (className) element.className = className
  if (text !== undefined) element.textContent = text

  return element
}

function makeTag(text) {
  return makeElement('span', 'job-tag', text)
}

function renderJobCard(job, profileSkills, savedIds) {
  const card = makeElement('article', 'job-card')
  const top = makeElement('div', 'job-card-top')
  const titleBlock = makeElement('div', 'job-card-title')

  titleBlock.append(
    makeElement('h3', '', job.title),
    makeElement('p', 'job-company', job.company)
  )

  const match = getJobMatch(job, profileSkills)
  const matchBadge = makeElement('div', 'job-match')

  matchBadge.append(
    makeElement('strong', '', match === null ? '—' : `${match}%`),
    makeElement('span', '', match === null ? 'No profile' : 'Skill match')
  )

  top.append(titleBlock, matchBadge)

  const tags = makeElement('div', 'job-tags')
  tags.append(
    makeTag(job.type),
    makeTag(job.location),
    makeTag(job.experience)
  )

  const description = makeElement('p', 'job-description', job.description)

  const skillList = makeElement('div', 'job-card-skills')

  job.skills.forEach((skill) => {
    const matched = hasMatchingSkill(skill, profileSkills)
    const chip = makeElement(
      'span',
      `job-skill-chip ${
        profileSkills.length
          ? matched
            ? 'has-skill'
            : 'missing-skill'
          : ''
      }`,
      skill
    )

    skillList.append(chip)
  })

  const footer = makeElement('div', 'job-card-footer')
  const salary = makeElement('span', 'job-salary', job.salary)
  const actions = makeElement('div', 'job-actions')

  const saved = savedIds.includes(job.id)
  const saveButton = makeElement(
    'button',
    saved ? 'is-saved' : '',
    saved ? '★ Saved' : '☆ Save'
  )

  saveButton.type = 'button'
  saveButton.setAttribute('aria-pressed', String(saved))

  saveButton.addEventListener('click', () => {
    const current = new Set(getSavedJobIds())

    if (current.has(job.id)) {
      current.delete(job.id)
      if (window.toast) {
        window.toast.info('Job removed from saved')
      }
    } else {
      current.add(job.id)
      if (window.toast) {
        window.toast.success('Job saved!')
      }
    }

    saveJobIds([...current])
    renderJobs()
  })

  const viewButton = makeElement(
    'button',
    'job-view-button',
    'View details'
  )

  viewButton.type = 'button'
  viewButton.addEventListener('click', () => openJobDetails(job))

  actions.append(saveButton, viewButton)
  footer.append(salary, actions)

  card.append(top, tags, description, skillList, footer)

  return card
}

function renderJobs() {
  const query = searchInput.value.trim().toLowerCase()
  const selectedType = typeFilter.value
  const selectedLocation = locationFilter.value
  const sortBy = sortSelect.value

  const profile = readProfile()
  const profileSkills = getProfileSkills(profile)
  const savedIds = getSavedJobIds()

  let filteredJobs = jobs.filter((job) => {
    const searchableText = [
      job.title,
      job.company,
      job.description,
      job.type,
      job.location,
      ...job.skills,
    ].join(' ').toLowerCase()

    const matchesQuery = !query || searchableText.includes(query)
    const matchesType =
      selectedType === 'all' || job.type === selectedType
    const matchesLocation =
      selectedLocation === 'all' || job.location === selectedLocation

    return matchesQuery && matchesType && matchesLocation
  })

  if (sortBy === 'match') {
    filteredJobs.sort((a, b) => {
      const matchA = getJobMatch(a, profileSkills) ?? -1
      const matchB = getJobMatch(b, profileSkills) ?? -1

      return matchB - matchA
    })
  } else {
    filteredJobs.sort((a, b) => a.title.localeCompare(b.title))
  }

  jobList.replaceChildren()

  filteredJobs.forEach((job) => {
    jobList.append(renderJobCard(job, profileSkills, savedIds))
  })

  jobCount.textContent = String(filteredJobs.length)
  savedJobCount.textContent = String(savedIds.length)
  profileStatus.textContent = profile ? 'Assessed' : 'Not assessed'

  resultsDescription.textContent = profile
    ? 'Skill matches are estimated from the skills in your assessment.'
    : 'Sample opportunities. Complete your assessment to compare skills.'

  emptyState.hidden = filteredJobs.length > 0
  jobList.hidden = filteredJobs.length === 0

  updateProfilePanel(profile, profileSkills)
}

function updateProfilePanel(profile, profileSkills) {
  const role = document.querySelector('#profileRole')
  const summary = document.querySelector('#profileSummary')
  const gapTitle = document.querySelector('#skillGapTitle')
  const gapDescription = document.querySelector('#skillGapDescription')

  if (!profile) {
    role.textContent = 'Set your career goal'
    summary.textContent =
      'Complete the assessment to compare your skills with sample job requirements.'
    gapTitle.textContent = 'Build your skill profile'
    gapDescription.textContent =
      'Your growth plan can help you develop skills for the roles you want.'
    return
  }

  role.textContent = profile.goal || 'Career goal not set'
  summary.textContent =
    `Your profile includes ${profileSkills.length} self-reported skills.`

  const missingSkills = new Set()

  jobs.forEach((job) => {
    job.skills.forEach((skill) => {
      if (!hasMatchingSkill(skill, profileSkills)) {
        missingSkills.add(skill)
      }
    })
  })

  gapTitle.textContent = missingSkills.size
    ? `${missingSkills.size} skills to explore`
    : 'Keep building experience'

  gapDescription.textContent = missingSkills.size
    ? `Some skills appearing in the sample listings that you have not reported include: ${
        [...missingSkills].slice(0, 4).join(', ')
      }. These are suggestions to investigate, not confirmed deficiencies.`
    : 'Try projects, internships, and real job descriptions to keep strengthening your profile.'
}

function openJobDetails(job) {
  const profileSkills = getProfileSkills(readProfile())
  const match = getJobMatch(job, profileSkills)

  detailBody.replaceChildren()

  detailBody.append(
    makeElement('h2', '', job.title),
    makeElement('p', '', `${job.company} · ${job.type} · ${job.location}`),
    makeElement(
      'p',
      '',
      match === null
        ? 'Complete your assessment to estimate a skill match.'
        : `Estimated skill match: ${match}%. This compares listed requirements with your self-reported skills only.`
    ),
    makeElement('h3', '', 'Role overview'),
    makeElement('p', '', job.description),
    makeElement('h3', '', 'Example responsibilities')
  )

  const responsibilities = document.createElement('ul')

  job.responsibilities.forEach((item) => {
    responsibilities.append(makeElement('li', '', item))
  })

  detailBody.append(responsibilities)
  detailBody.append(makeElement('h3', '', 'Skills listed'))
  detailBody.append(makeElement('p', '', job.skills.join(', ')))
  detailBody.append(
    makeElement(
      'p',
      '',
      'This is demonstration content, not a live vacancy. No application is submitted.'
    )
  )

  if (typeof detailDialog.showModal === 'function') {
    detailDialog.showModal()
  } else {
    window.alert(
      `${job.title}\n${job.company}\n\n${job.description}\n\nDemo listing only.`
    )
  }
}

function resetFilters() {
  searchInput.value = ''
  typeFilter.value = 'all'
  locationFilter.value = 'all'
  sortSelect.value = 'match'
  renderJobs()
}

searchForm.addEventListener('submit', (event) => {
  event.preventDefault()
  renderJobs()
})

searchInput.addEventListener('input', renderJobs)
typeFilter.addEventListener('change', renderJobs)
locationFilter.addEventListener('change', renderJobs)
sortSelect.addEventListener('change', renderJobs)
resetFiltersButton.addEventListener('click', resetFilters)

closeDetailButton.addEventListener('click', () => {
  detailDialog.close()
})

detailDialog.addEventListener('click', (event) => {
  if (event.target === detailDialog) {
    detailDialog.close()
  }
})

const sidebar = document.querySelector('#sidebar')
const sidebarOverlay = document.querySelector('#sidebarOverlay')
const menuToggle = document.querySelector('#menuToggle')

function openSidebar() {
  sidebar?.classList.add('open')
  sidebarOverlay?.classList.add('visible')
  menuToggle?.setAttribute('aria-expanded', 'true')
  document.body.style.overflow = 'hidden'
}

function closeSidebar() {
  sidebar?.classList.remove('open')
  sidebarOverlay?.classList.remove('visible')
  menuToggle?.setAttribute('aria-expanded', 'false')
  document.body.style.overflow = ''
}

if (menuToggle && sidebar) {
  menuToggle.addEventListener('click', () => {
    if (sidebar.classList.contains('open')) {
      closeSidebar()
    } else {
      openSidebar()
    }
  })
}

if (sidebarOverlay) {
  sidebarOverlay.addEventListener('click', closeSidebar)
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeSidebar()
  }
})

document.addEventListener('click', (event) => {
  if (
    window.innerWidth <= 900 &&
    sidebar?.classList.contains('open') &&
    !sidebar.contains(event.target) &&
    !menuToggle?.contains(event.target)
  ) {
    closeSidebar()
  }
})

renderJobs()