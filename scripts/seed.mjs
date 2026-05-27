// Uploads the case-01 case study to Firebase Realtime DB under UXP/case-01
// Run: node scripts/seed.mjs

const DB_URL = 'https://portfolio-2716c-default-rtdb.firebaseio.com'
const PATH   = 'UXP/case-01'

const caseStudy = {
  title:    'Standardizing Research Operations at Scale',
  subtitle: 'A systemic overhaul of how a Fortune 50 fintech organization conducts, stores, and distributes UX intelligence across seven autonomous business units.',
  eyebrow:  'Case 01 // Featured Work',

  imageUrl:     'https://lh3.googleusercontent.com/aida-public/AB6AXuCZlSIJiUBFMS9E-glpg7cv2SHV5_R7bTWFe_aJZRpj8RISyUtD2YiFCc1-bkm0pPW3Rnv0CE_19FwTumY20DceswH08FFFHyTrLlx2KUKf2eBWRlHfax7r-rAG-dTYGEk_Q4xNZPOomt2aSQBFIiNjEX0SxzS0Y_CH-BkEkeCx6iad5tYskQdIDByYiCnidbto0w18-lZ9yriW395_mmBPaifWlYdPqM1Ccrlr8Wt1nqq5luPjKck3UYqby7a4jptskxkkjOu1YPHZ',
  imageCaption: 'Cross-functional alignment workshop — Q1 2024, New York',

  challengeHeading: 'A knowledge infrastructure failing at scale',
  challengeBody: [
    "The client's UX research function had grown organically over seven years — each business unit developing its own tools, rituals, and repositories. What began as nimble autonomy had calcified into organizational debt: a fragmented ecosystem where valuable intelligence was siloed, duplicated, or simply lost.",
    "Our mandate was to architect a unified research operations system — one that could serve a team of 40 active researchers while remaining legible to the 300+ non-researcher stakeholders who needed to consume, commission, and act on findings.",
  ],

  approachHeading:     'Systemic design, not surface-level fixes',
  findingsHeading:     'What the data revealed',
  deliverablesHeading: 'What was handed over',
  deliverablesDesc:    'All outputs were designed for longevity — built to evolve with the organization rather than expire with the engagement.',
  outcomesHeading:     'Measurable impact at 90 days',

  meta: [
    { icon: 'apartment',      label: 'Client',     value: 'Confidential — Fortune 50' },
    { icon: 'calendar_month', label: 'Year',       value: '2024' },
    { icon: 'category',       label: 'Discipline', value: 'Research Operations' },
    { icon: 'schedule',       label: 'Duration',   value: '6 Months' },
    { icon: 'group',          label: 'Team',       value: '4 Researchers' },
  ],

  painPoints: [
    { icon: 'folder_off',    text: 'Research artifacts scattered across 12+ disconnected repositories and storage systems.' },
    { icon: 'people_alt',   text: 'No standardized recruitment pipeline — each study required rebuilding from scratch.' },
    { icon: 'find_replace', text: 'Duplicate studies conducted unknowingly across business units, wasting 30% of research budget.' },
    { icon: 'block',        text: 'Zero discoverability: findings had an effective shelf-life of 90 days before becoming inaccessible.' },
    { icon: 'timer_off',    text: 'Average study lead-time of 11 weeks from inception to stakeholder briefing.' },
  ],

  approach: [
    { icon: 'travel_explore',  title: 'Landscape Audit',     desc: 'Comprehensive inventory of all existing research outputs, tools, and workflows across 7 business units.' },
    { icon: 'hub',             title: 'System Architecture', desc: 'Designed a centralized taxonomy and metadata schema to make all research cross-searchable and retrievable.' },
    { icon: 'manage_accounts', title: 'Process Design',      desc: 'Co-created standardized recruitment protocols and study templates with embedded compliance guardrails.' },
    { icon: 'school',          title: 'Capability Building', desc: 'Delivered a 3-module training programme enabling 60+ non-researcher stakeholders to access and interpret findings.' },
  ],

  findings: [
    { icon: 'psychology',          title: 'Knowledge Fragmentation', body: 'The primary failure mode was not a lack of research, but an inability to surface existing knowledge at the moment of need.' },
    { icon: 'sync_problem',        title: 'Tool Proliferation',      body: 'An average of 6.3 discrete tools were used per study with no enforced handoff — each transition was a data loss event.' },
    { icon: 'person_off',          title: 'Invisible Gatekeeping',   body: 'Research access was controlled informally by individuals rather than policy, creating bottlenecks and knowledge hoarding.' },
    { icon: 'signal_cellular_alt', title: 'Signal vs. Noise',        body: 'Without a tagging standard, 73% of archived studies were effectively unsearchable within 6 months of completion.' },
  ],

  deliverables: [
    { icon: 'description',       text: 'Research Repository Architecture & Taxonomy' },
    { icon: 'checklist',         text: 'Standardized Study Brief and Protocol Templates' },
    { icon: 'route',             text: 'Recruitment Pipeline Design and Vendor SLAs' },
    { icon: 'auto_stories',      text: 'Research Ops Handbook (62 pages)' },
    { icon: 'present_to_all',    text: 'Executive Briefing: ROI of Research Infrastructure' },
    { icon: 'workspace_premium', text: 'Capability Training Programme (3 modules)' },
  ],

  outcomes: [
    { icon: 'trending_down', value: 40,   suffix: '%', label: 'Reduction in study lead-time',    sub: 'From 11 weeks to 6.5 weeks average' },
    { icon: 'savings',       value: 28,   suffix: '%', label: 'Research budget recovered',        sub: 'By eliminating duplicate studies across BUs' },
    { icon: 'database',      value: 1200, suffix: '+', label: 'Studies migrated and tagged',      sub: 'Fully searchable within 30 days of launch' },
    { icon: 'groups',        value: 60,   suffix: '+', label: 'Stakeholders trained',             sub: 'Cross-functional research literacy programme' },
  ],
}

async function seed() {
  const url = `${DB_URL}/${PATH}.json`
  console.log(`Uploading to: ${url}`)

  const res = await fetch(url, {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(caseStudy, null, 2),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error(`Error ${res.status}: ${text}`)
    process.exit(1)
  }

  const data = await res.json()
  console.log('Upload successful.')
  console.log(`Path:  ${PATH}`)
  console.log(`Keys:  ${Object.keys(data).join(', ')}`)
}

seed()
