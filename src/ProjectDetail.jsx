import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import './index.css'
import './ProjectDetail.css'

/* ─────────────────────────────────────
   Hooks
───────────────────────────────────── */

function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.05, rootMargin: '0px 0px -40px 0px' }
    )

    const targets = document.querySelectorAll('[data-reveal]')
    targets.forEach((el) => {
      const rect = el.getBoundingClientRect()
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('is-visible')
      } else {
        observer.observe(el)
      }
    })

    return () => observer.disconnect()
  }, [])
}

/* ─────────────────────────────────────
   ScrollProgress
───────────────────────────────────── */

function ScrollProgress() {
  const barRef = useRef(null)

  useEffect(() => {
    const bar = barRef.current
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight
      const progress = total > 0 ? window.scrollY / total : 0
      bar.style.transform = `scaleX(${progress})`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return <div className="scroll-progress" ref={barRef} aria-hidden="true" />
}

/* ─────────────────────────────────────
   Navbar
───────────────────────────────────── */

const NAV_LINKS = ['ARCHIVE', 'INDEX', 'THEMES', 'LAB']

function Navbar({ onBack }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <div className="navbar__inner">
        <div className="navbar__left">
          <a className="navbar__logo" href="#" onClick={(e) => { e.preventDefault(); onBack() }}>Methodic</a>
          <span className="navbar__sep" aria-hidden="true" />
          <span className="navbar__tagline">Case Study</span>
        </div>
        <div className="navbar__links">
          {NAV_LINKS.map((l) => (
            <a key={l} href="#" className={l === 'ARCHIVE' ? 'active' : ''}>{l}</a>
          ))}
        </div>
        <button className="navbar__cta" onClick={onBack}>BACK TO INDEX</button>
      </div>
    </nav>
  )
}

/* ─────────────────────────────────────
   CountUp
───────────────────────────────────── */

function CountUp({ to, suffix = '', duration = 1600 }) {
  const [value, setValue] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const start = performance.now()
          const tick = (now) => {
            const t = Math.min((now - start) / duration, 1)
            const eased = 1 - Math.pow(1 - t, 3)
            setValue(Math.round(eased * to))
            if (t < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [to, duration])

  return <span ref={ref}>{value}{suffix}</span>
}

/* ─────────────────────────────────────
   Footer
───────────────────────────────────── */

const FOOTER_LINKS = ['PRIVACY', 'TERMS', 'CONTACT', 'INSTAGRAM']

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand" data-reveal="fade">
          <span className="footer__logo">Methodic</span>
          <p className="footer__copy">© 2024 Methodic. London / New York / Berlin.</p>
        </div>
        <nav className="footer__links" data-reveal="fade" data-delay="120">
          {FOOTER_LINKS.map((l) => (
            <a key={l} href="#" className="footer__link">{l}</a>
          ))}
        </nav>
      </div>
    </footer>
  )
}

/* ─────────────────────────────────────
   Data
───────────────────────────────────── */

const PROJECT_IMAGE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCZlSIJiUBFMS9E-glpg7cv2SHV5_R7bTWFe_aJZRpj8RISyUtD2YiFCc1-bkm0pPW3Rnv0CE_19FwTumY20DceswH08FFFHyTrLlx2KUKf2eBWRlHfax7r-rAG-dTYGEk_Q4xNZPOomt2aSQBFIiNjEX0SxzS0Y_CH-BkEkeCx6iad5tYskQdIDByYiCnidbto0w18-lZ9yriW395_mmBPaifWlYdPqM1Ccrlr8Wt1nqq5luPjKck3UYqby7a4jptskxkkjOu1YPHZ'

const META = [
  { icon: 'apartment',      label: 'Client',     value: 'Confidential — Fortune 50' },
  { icon: 'calendar_month', label: 'Year',       value: '2024' },
  { icon: 'category',       label: 'Discipline', value: 'Research Operations' },
  { icon: 'schedule',       label: 'Duration',   value: '6 Months' },
  { icon: 'group',          label: 'Team',       value: '4 Researchers' },
]

const PAIN_POINTS = [
  { icon: 'folder_off',    text: 'Research artifacts scattered across 12+ disconnected repositories and storage systems.' },
  { icon: 'people_alt',   text: 'No standardized recruitment pipeline — each study required rebuilding from scratch.' },
  { icon: 'find_replace', text: 'Duplicate studies conducted unknowingly across business units, wasting 30% of research budget.' },
  { icon: 'block',        text: 'Zero discoverability: findings had an effective shelf-life of 90 days before becoming inaccessible.' },
  { icon: 'timer_off',    text: 'Average study lead-time of 11 weeks from inception to stakeholder briefing.' },
]

const APPROACH = [
  { icon: 'travel_explore',    title: 'Landscape Audit',      desc: 'Comprehensive inventory of all existing research outputs, tools, and workflows across 7 business units.' },
  { icon: 'hub',               title: 'System Architecture',  desc: 'Designed a centralized taxonomy and metadata schema to make all research cross-searchable and retrievable.' },
  { icon: 'manage_accounts',   title: 'Process Design',       desc: 'Co-created standardized recruitment protocols and study templates with embedded compliance guardrails.' },
  { icon: 'school',            title: 'Capability Building',  desc: 'Delivered a 3-module training programme enabling 60+ non-researcher stakeholders to access and interpret findings.' },
]

const FINDINGS = [
  { icon: 'psychology',         title: 'Knowledge Fragmentation', body: 'The primary failure mode was not a lack of research, but an inability to surface existing knowledge at the moment of need.' },
  { icon: 'sync_problem',       title: 'Tool Proliferation',      body: 'An average of 6.3 discrete tools were used per study with no enforced handoff — each transition was a data loss event.' },
  { icon: 'person_off',         title: 'Invisible Gatekeeping',   body: 'Research access was controlled informally by individuals rather than policy, creating bottlenecks and knowledge hoarding.' },
  { icon: 'signal_cellular_alt',title: 'Signal vs. Noise',        body: 'Without a tagging standard, 73% of archived studies were effectively unsearchable within 6 months of completion.' },
]

const DELIVERABLES = [
  { icon: 'description',        text: 'Research Repository Architecture & Taxonomy' },
  { icon: 'checklist',          text: 'Standardized Study Brief and Protocol Templates' },
  { icon: 'route',              text: 'Recruitment Pipeline Design and Vendor SLAs' },
  { icon: 'auto_stories',       text: 'Research Ops Handbook (62 pages)' },
  { icon: 'present_to_all',     text: 'Executive Briefing: ROI of Research Infrastructure' },
  { icon: 'workspace_premium',  text: 'Capability Training Programme (3 modules)' },
]

const OUTCOMES = [
  { icon: 'trending_down', value: 40,   suffix: '%', label: 'Reduction in study lead-time',    sub: 'From 11 weeks to 6.5 weeks average' },
  { icon: 'savings',       value: 28,   suffix: '%', label: 'Research budget recovered',        sub: 'By eliminating duplicate studies across BUs' },
  { icon: 'database',      value: 1200, suffix: '+', label: 'Studies migrated and tagged',      sub: 'Fully searchable within 30 days of launch' },
  { icon: 'groups',        value: 60,   suffix: '+', label: 'Stakeholders trained',             sub: 'Cross-functional research literacy programme' },
]

const APPROACH_DELAYS  = [undefined, '80', '160', '280']
const FINDING_DELAYS   = [undefined, '80', '160', '280']
const OUTCOME_DELAYS   = [undefined, '80', '160', '280']
const DELIV_DELAYS     = [undefined, '80', '120', '160', '200', '280']

/* ─────────────────────────────────────
   ProjectHeader
───────────────────────────────────── */

function ProjectHeader() {
  return (
    <section className="ph">
      <div className="ph__inner">
        <span className="ph__eyebrow" data-reveal="fade">Case 01 // Featured Work</span>
        <h1 className="ph__title" data-reveal="up" data-delay="80">
          Standardizing Research Operations at Scale
        </h1>
        <p className="ph__subtitle" data-reveal="up" data-delay="160">
          A systemic overhaul of how a Fortune 50 fintech organization conducts, stores, and
          distributes UX intelligence across seven autonomous business units.
        </p>
        <div className="ph__meta" data-reveal="up" data-delay="280">
          {META.map((m) => (
            <div className="ph-meta" key={m.label}>
              <span className="material-symbols-outlined ph-meta__icon">{m.icon}</span>
              <div className="ph-meta__body">
                <span className="ph-meta__label">{m.label}</span>
                <span className="ph-meta__value">{m.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────
   ProjectImage
───────────────────────────────────── */

function ProjectImage() {
  return (
    <div className="pi" data-reveal="scale">
      <div className="pi__inner">
        <div className="pi__frame">
          <img src={PROJECT_IMAGE} alt="Cross-functional alignment workshop" className="pi__img" />
        </div>
        <div className="pi__caption">
          <span className="material-symbols-outlined">photo_camera</span>
          Cross-functional alignment workshop — Q1 2024, New York
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────
   Challenge
───────────────────────────────────── */

function Challenge() {
  return (
    <section className="ps">
      <div className="ps__inner">
        <div className="ps__label" data-reveal="fade">
          <span className="material-symbols-outlined">flag</span>
          The Challenge
        </div>
        <div className="ps__two-col">
          <div className="ps__col-left" data-reveal="up">
            <h2 className="ps__heading">A knowledge infrastructure failing at scale</h2>
          </div>
          <div className="ps__col-right">
            <p className="ps__body" data-reveal="up" data-delay="80">
              The client's UX research function had grown organically over seven years — each business
              unit developing its own tools, rituals, and repositories. What began as nimble autonomy
              had calcified into organizational debt: a fragmented ecosystem where valuable intelligence
              was siloed, duplicated, or simply lost.
            </p>
            <p className="ps__body" data-reveal="up" data-delay="120">
              Our mandate was to architect a unified research operations system — one that could serve
              a team of 40 active researchers while remaining legible to the 300+ non-researcher
              stakeholders who needed to consume, commission, and act on findings.
            </p>
            <div className="ps__pain-list" data-reveal="up" data-delay="200">
              {PAIN_POINTS.map((p) => (
                <div className="ps__pain-item" key={p.icon}>
                  <span className="material-symbols-outlined ps__pain-icon">{p.icon}</span>
                  <span className="ps__pain-text">{p.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────
   Approach
───────────────────────────────────── */

function Approach() {
  return (
    <section className="ps ps--dark">
      <div className="ps__inner">
        <div className="ps__label" data-reveal="fade">
          <span className="material-symbols-outlined">route</span>
          Approach
        </div>
        <h2 className="ps__heading ps__heading--wide" data-reveal="up">
          Systemic design, not surface-level fixes
        </h2>
        <div className="ps__card-grid">
          {APPROACH.map((card, i) => (
            <div className="ps__card" key={card.title} data-reveal="up" data-delay={APPROACH_DELAYS[i]}>
              <span className="material-symbols-outlined ps__card-icon">{card.icon}</span>
              <h3 className="ps__card-title">{card.title}</h3>
              <p className="ps__card-desc">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────
   Findings
───────────────────────────────────── */

function Findings() {
  return (
    <section className="ps">
      <div className="ps__inner">
        <div className="ps__label" data-reveal="fade">
          <span className="material-symbols-outlined">search_insights</span>
          Key Findings
        </div>
        <h2 className="ps__heading" data-reveal="up">What the data revealed</h2>
        <div className="ps__finding-grid">
          {FINDINGS.map((f, i) => (
            <div className="ps__finding" key={f.title} data-reveal="up" data-delay={FINDING_DELAYS[i]}>
              <div className="ps__finding-head">
                <span className="material-symbols-outlined ps__finding-icon">{f.icon}</span>
                <h4 className="ps__finding-title">{f.title}</h4>
              </div>
              <p className="ps__finding-body">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────
   Deliverables
───────────────────────────────────── */

function Deliverables() {
  return (
    <section className="ps ps--dark">
      <div className="ps__inner ps__deliv-layout">
        <div className="ps__deliv-left" data-reveal="up">
          <div className="ps__label">
            <span className="material-symbols-outlined">inventory_2</span>
            Deliverables
          </div>
          <h2 className="ps__heading">What was handed over</h2>
          <p className="ps__body ps__body--muted">
            All outputs were designed for longevity — built to evolve with the organization
            rather than expire with the engagement.
          </p>
        </div>
        <div className="ps__deliv-right">
          {DELIVERABLES.map((d, i) => (
            <div className="ps__deliv-item" key={d.icon} data-reveal="up" data-delay={DELIV_DELAYS[i]}>
              <span className="material-symbols-outlined ps__deliv-icon">{d.icon}</span>
              <span className="ps__deliv-text">{d.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────
   Outcomes
───────────────────────────────────── */

function Outcomes() {
  return (
    <section className="ps">
      <div className="ps__inner">
        <div className="ps__label" data-reveal="fade">
          <span className="material-symbols-outlined">trending_up</span>
          Outcomes
        </div>
        <h2 className="ps__heading" data-reveal="up">Measurable impact at 90 days</h2>
        <div className="ps__outcome-grid">
          {OUTCOMES.map((o, i) => (
            <div className="ps__outcome" key={o.label} data-reveal="up" data-delay={OUTCOME_DELAYS[i]}>
              <span className="material-symbols-outlined ps__outcome-icon">{o.icon}</span>
              <div className="ps__outcome-num">
                <CountUp to={o.value} suffix={o.suffix} />
              </div>
              <div className="ps__outcome-label">{o.label}</div>
              <div className="ps__outcome-sub">{o.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────
   CTA
───────────────────────────────────── */

function CTA({ onBack }) {
  return (
    <section className="ps ps--dark ps--cta">
      <div className="ps__inner">
        <div className="ps__cta-content" data-reveal="fade">
          <span className="ps__cta-eyebrow">
            <span className="material-symbols-outlined">arrow_back</span>
            Index
          </span>
          <h2 className="ps__cta-title">Explore more work</h2>
          <p className="ps__cta-desc">
            Return to the archive to see more case studies from Methodic's research portfolio.
          </p>
          <button className="ps__cta-btn" onClick={onBack}>
            Back to Index
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────
   ProjectDetail
───────────────────────────────────── */

export default function ProjectDetail({ onBack }) {
  useLayoutEffect(() => { window.scrollTo(0, 0) }, [])
  useReveal()

  return (
    <div className="app">
      <ScrollProgress />
      <Navbar onBack={onBack} />
      <main className="main">
        <ProjectHeader />
        <ProjectImage />
        <Challenge />
        <Approach />
        <Findings />
        <Deliverables />
        <Outcomes />
        <CTA onBack={onBack} />
      </main>
      <Footer />
    </div>
  )
}
