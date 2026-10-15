const form = document.querySelector('#cvForm')
const experienceList = document.querySelector('#experienceList')
const educationList = document.querySelector('#educationList')
const addExperienceButton = document.querySelector('#addExperience')
const addEducationButton = document.querySelector('#addEducation')
const languageSelect = document.querySelector('#cvLanguage')
const templateSelect = document.querySelector('#cvTemplate')
const printButton = document.querySelector('#printCv')
const clearButton = document.querySelector('#clearCv')
const cvPaper = document.querySelector('#cvPaper')
const progressBar = document.querySelector('#cvProgressBar')
const checklistText = document.querySelector('#cvChecklistText')
const sidebar = document.querySelector('#sidebar')
const menuToggle = document.querySelector('#menuToggle')
const autosaveIndicator = document.querySelector('#autosaveIndicator')
const autosaveText = autosaveIndicator?.querySelector('.autosave-text')
const autosaveDot = autosaveIndicator?.querySelector('.dot')
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

const STORAGE_KEY = 'vectus-cv-draft'

const fields = [
  'fullName',
  'professionalTitle',
  'email',
  'phone',
  'location',
  'website',
  'summary',
  'skills',
  'projects',
  'certifications',
]

const sectionLabels = {
  en: {
    PROFILE: 'PROFILE',
    EXPERIENCE: 'EXPERIENCE',
    EDUCATION: 'EDUCATION',
    SKILLS: 'SKILLS',
    PROJECTS: 'PROJECTS',
    CERTIFICATIONS: 'CERTIFICATIONS',
  },
  ar: {
    PROFILE: 'الملخص المهني',
    EXPERIENCE: 'الخبرات العملية',
    EDUCATION: 'التعليم',
    SKILLS: 'المهارات',
    PROJECTS: 'المشاريع',
    CERTIFICATIONS: 'الشهادات والدورات',
  },
}

function makeElement(tag, className, text) {
  const element = document.createElement(tag)

  if (className) element.className = className
  if (text !== undefined) element.textContent = text

  return element
}

function createField(labelText, name, placeholder, options = {}) {
  const wrapper = makeElement('div', 'cv-field')

  if (options.description) {
    wrapper.classList.add('entry-description')
  }

  const label = makeElement('label', '', labelText)
  const input = options.description
    ? document.createElement('textarea')
    : document.createElement('input')

  input.name = name
  input.placeholder = placeholder
  input.dataset.entryField = name

  if (options.description) {
    input.rows = 3
  } else if (options.type) {
    input.type = options.type
  }

  label.htmlFor = name + '-' + Math.random().toString(36).slice(2, 9)

  input.id = label.htmlFor

  wrapper.append(label, input)

  return wrapper
}

function addEntry(list, type, values = {}) {
  const isExperience = type === 'experience'
  const count = list.children.length + 1

  const entry = makeElement('div', 'cv-entry')
  entry.dataset.entryType = type

  const heading = makeElement(
    'div',
    'cv-entry-top'
  )

  const entryTitle = makeElement(
    'strong',
    '',
    `${isExperience ? 'Experience' : 'Education'} ${count}`
  )

  const removeButton = makeElement(
    'button',
    'cv-remove-entry',
    'Remove'
  )

  removeButton.type = 'button'
  removeButton.addEventListener('click', () => {
    entry.remove()
    renumberEntries(list)
    updatePreview()
  })

  heading.append(entryTitle, removeButton)

  const fieldsContainer = makeElement('div', 'cv-entry-fields')

  const definitions = isExperience
    ? [
        ['Role / position', 'role', 'e.g. Web Developer'],
        ['Company', 'company', 'Company name'],
        ['Start date', 'startDate', 'e.g. Jan 2025'],
        ['End date', 'endDate', 'e.g. Present'],
        ['Description', 'description', 'Your responsibilities and achievements', true],
      ]
    : [
        ['Qualification', 'qualification', 'e.g. BSc Computer Science'],
        ['Institution', 'institution', 'University or school'],
        ['Start date', 'startDate', 'e.g. 2022'],
        ['End date', 'endDate', 'e.g. 2026'],
        ['Details', 'description', 'Relevant coursework or achievements', true],
      ]

  definitions.forEach(([label, name, placeholder, description]) => {
    const field = createField(label, name, placeholder, {
      description,
    })

    const input = field.querySelector('input, textarea')
    input.value = values[name] || ''
    fieldsContainer.append(field)
  })

  entry.append(heading, fieldsContainer)
  list.append(entry)
  updatePreview()
}

function renumberEntries(list) {
  Array.from(list.children).forEach((entry, index) => {
    const heading = entry.querySelector('.cv-entry-top strong')
    if (!heading) return

    const isExperience = entry.dataset.entryType === 'experience'

    heading.textContent =
      `${isExperience ? 'Experience' : 'Education'} ${index + 1}`
  })
}

function getEntryData(list) {
  return Array.from(list.querySelectorAll('.cv-entry')).map((entry) => {
    const data = {}

    entry.querySelectorAll('[data-entry-field]').forEach((input) => {
      data[input.dataset.entryField] = input.value.trim()
    })

    return data
  })
}

function getFormData() {
  const data = {}

  fields.forEach((name) => {
    const input = document.getElementById(name)
    data[name] = input ? input.value.trim() : ''
  })

  data.experience = getEntryData(experienceList)
  data.education = getEntryData(educationList)
  data.language = languageSelect.value
  data.template = templateSelect.value

  return data
}

function appendContact(container, label, value, url) {
  if (!value) return

  const item = url
    ? makeElement('a', '', label ? `${label}: ${value}` : value)
    : makeElement('span', '', label ? `${label}: ${value}` : value)

  if (url) {
    item.href = url
    item.target = '_blank'
    item.rel = 'noopener noreferrer'
  }

  container.append(item)
}

function appendTextSection(container, content) {
  container.replaceChildren()

  if (!content) {
    container.textContent = '—'
    container.classList.add('cv-empty-value')
    return
  }

  container.classList.remove('cv-empty-value')
  container.textContent = content
}

function renderEntries(container, entries, type) {
  container.replaceChildren()

  const isExperience = type === 'experience'

  const relevantEntries = entries.filter((entry) =>
    Object.values(entry).some((value) => value)
  )

  if (relevantEntries.length === 0) {
    container.append(makeElement('p', '', '—'))
    return
  }

  relevantEntries.forEach((entry) => {
    const block = makeElement('div', 'cv-paper-entry')

    const headingText = isExperience
      ? entry.role
      : entry.qualification

    const heading = makeElement(
      'h3',
      '',
      headingText || (isExperience ? 'Position' : 'Qualification')
    )

    const metaParts = isExperience
      ? [entry.company, entry.startDate, entry.endDate]
      : [entry.institution, entry.startDate, entry.endDate]

    const metaText = metaParts.filter(Boolean).join(' · ')
    const meta = makeElement('p', 'cv-entry-meta', metaText)

    const description = makeElement(
      'p',
      '',
      entry.description || ''
    )

    block.append(heading)

    if (metaText) block.append(meta)
    if (entry.description) block.append(description)

    container.append(block)
  })
}

function renderSkills(skillsText, container) {
  container.replaceChildren()

  const skills = skillsText
    .split(/[,;\n]/)
    .map((skill) => skill.trim())
    .filter(Boolean)

  if (skills.length === 0) {
    container.append(makeElement('p', '', '—'))
    return
  }

  const list = makeElement('div', 'cv-skill-list')

  skills.forEach((skill) => {
    list.append(makeElement('span', 'cv-skill-chip', skill))
  })

  container.append(list)
}

function updateSectionLabels(language) {
  cvPaper.querySelectorAll('.cv-paper-section h2').forEach((heading) => {
    const key = heading.dataset.sectionKey

    if (key) {
      heading.textContent = sectionLabels[language][key]
    }
  })

  cvPaper.dir = language === 'ar' ? 'rtl' : 'ltr'
  cvPaper.lang = language
}

function updatePreview() {
  const data = getFormData()
  const language = data.language

  document.querySelector('#previewName').textContent =
    data.fullName || (language === 'ar' ? 'اسمك هنا' : 'Your Name')

  document.querySelector('#previewTitle').textContent =
    data.professionalTitle ||
    (language === 'ar' ? 'المسمى الوظيفي' : 'Your Professional Title')

  const contact = document.querySelector('#previewContact')
  contact.replaceChildren()

  appendContact(contact, '', data.email)
  appendContact(contact, '', data.phone)
  appendContact(contact, '', data.location)

  if (data.website) {
    let validWebsite = ''

    try {
      const parsed = new URL(data.website)
      if (['http:', 'https:'].includes(parsed.protocol)) {
        validWebsite = parsed.href
      }
    } catch {
    }

    appendContact(contact, '', data.website, validWebsite)
  }

  appendTextSection(
    document.querySelector('#previewSummary'),
    data.summary || (
      language === 'ar'
        ? 'أضف ملخصك المهني هنا.'
        : 'Your professional summary will appear here.'
    )
  )

  renderEntries(
    document.querySelector('#previewExperience'),
    data.experience,
    'experience'
  )

  renderEntries(
    document.querySelector('#previewEducation'),
    data.education,
    'education'
  )

  renderSkills(
    data.skills,
    document.querySelector('#previewSkills')
  )

  appendTextSection(
    document.querySelector('#previewProjects'),
    data.projects
  )

  appendTextSection(
    document.querySelector('#previewCertifications'),
    data.certifications
  )

  cvPaper.classList.toggle(
    'template-modern',
    data.template === 'modern'
  )

  updateSectionLabels(language)
  updateChecklist(data)
  saveDraft(data)
}

function updateChecklist(data) {
  const completed = [
    data.fullName,
    data.professionalTitle,
    data.email,
    data.summary,
    data.skills,
  ].filter((value) => value.trim()).length

  const percentage = Math.round((completed / 5) * 100)

  progressBar.style.width = `${percentage}%`
  checklistText.textContent =
    `${completed} of 5 key sections completed`
}

function saveDraft(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    if (autosaveIndicator && autosaveText && autosaveDot) {
      autosaveIndicator.classList.remove('saved', 'saving')
      autosaveIndicator.classList.add('saving')
      autosaveText.textContent = 'Saving…'
      setTimeout(() => {
        autosaveIndicator.classList.remove('saving')
        autosaveIndicator.classList.add('saved')
        autosaveText.textContent = 'Saved'
        setTimeout(() => {
          autosaveIndicator.classList.remove('saved')
        }, 2000)
      }, 300)
    }
  } catch {
  }
}

function loadDraft() {
  let saved

  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
  } catch {
    saved = null
  }

  if (!saved || typeof saved !== 'object') {
    addEntry(experienceList, 'experience')
    addEntry(educationList, 'education')
    return
  }

  fields.forEach((name) => {
    const input = document.getElementById(name)
    if (input && typeof saved[name] === 'string') {
      input.value = saved[name]
    }
  })

  languageSelect.value = saved.language === 'ar' ? 'ar' : 'en'
  templateSelect.value = saved.template === 'modern' ? 'modern' : 'classic'

  const experiences = Array.isArray(saved.experience)
    ? saved.experience
    : []

  const education = Array.isArray(saved.education)
    ? saved.education
    : []

  experiences.forEach((entry) => {
    addEntry(experienceList, 'experience', entry)
  })

  education.forEach((entry) => {
    addEntry(educationList, 'education', entry)
  })

  if (!experiences.length) addEntry(experienceList, 'experience')
  if (!education.length) addEntry(educationList, 'education')
}

addExperienceButton.addEventListener('click', () => {
  addEntry(experienceList, 'experience')
})

addEducationButton.addEventListener('click', () => {
  addEntry(educationList, 'education')
})

form.addEventListener('input', updatePreview)
form.addEventListener('change', updatePreview)

languageSelect.addEventListener('change', updatePreview)
templateSelect.addEventListener('change', updatePreview)

printButton.addEventListener('click', () => {
  if (window.toast) {
    window.toast.info('Opening print dialog...')
  }
  window.print()
})

clearButton.addEventListener('click', () => {
  const confirmed = window.confirm(
    'Clear your CV draft? This removes the saved draft from this browser.'
  )

  if (!confirmed) return

  form.reset()
  experienceList.replaceChildren()
  educationList.replaceChildren()

  addEntry(experienceList, 'experience')
  addEntry(educationList, 'education')

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {

  }
  if (window.toast) {
    window.toast.success('CV draft cleared')
  }
  updatePreview()
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

cvPaper.querySelectorAll('.cv-paper-section h2').forEach((heading) => {
  heading.dataset.sectionKey = heading.textContent
})

loadDraft()
updatePreview()