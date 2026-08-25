import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { ref as dbRef, onValue, set } from 'firebase/database'
import { auth, db } from './firebase'
import AuthModal from './AuthModal'
import './index.css'
import './ProjectDetail.css'
import './landing2.css'

/* ─────────────────────────────────────
   Hooks
───────────────────────────────────── */

function useReveal(ready, key) {
  useEffect(() => {
    if (!ready) return
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
  }, [ready, key])
}

/* ─────────────────────────────────────
   Firebase data hook
───────────────────────────────────── */

function toArr(v) {
  if (!v) return null
  return Array.isArray(v) ? v : Object.values(v)
}

function useCaseStudies() {
  const [studies, setStudies] = useState(undefined)

  useEffect(() => {
    return onValue(
      dbRef(db, 'UXP'),
      (snap) => {
        const val = snap.val()
        if (val) {
          const list = Object.keys(val).sort()
          setStudies(list)
        } else {
          setStudies([])
        }
      },
      () => setStudies([])
    )
  }, [])

  return studies
}

function useProjectData(caseId) {
  const [raw, setRaw] = useState(undefined)

  useEffect(() => {
    return onValue(
      dbRef(db, `UXP/${caseId}`),
      (snap) => setRaw(snap.val()),
      () => setRaw(null)
    )
  }, [caseId])

  const data = {
    title:               raw?.title,
    subtitle:            raw?.subtitle,
    eyebrow:             raw?.eyebrow,
    imageUrl:            raw?.imageUrl,
    imageCaption:        raw?.imageCaption,
    challengeHeading:    raw?.challengeHeading,
    challengeBody:       toArr(raw?.challengeBody)   ?? [],
    approachHeading:     raw?.approachHeading,
    findingsHeading:     raw?.findingsHeading,
    deliverablesHeading: raw?.deliverablesHeading,
    deliverablesDesc:    raw?.deliverablesDesc,
    outcomesHeading:     raw?.outcomesHeading,
    meta:                toArr(raw?.meta)         ?? [],
    painPoints:          toArr(raw?.painPoints)   ?? [],
    approach:            toArr(raw?.approach)     ?? [],
    findings:            toArr(raw?.findings)     ?? [],
    deliverables:        toArr(raw?.deliverables) ?? [],
    outcomes:            toArr(raw?.outcomes)     ?? [],
  }

  return { data, loading: raw === undefined }
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
      bar.style.transform = `scaleX(${total > 0 ? window.scrollY / total : 0})`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return <div className="scroll-progress" ref={barRef} aria-hidden="true" />
}

/* ─────────────────────────────────────
   Navbar
───────────────────────────────────── */

const PD_NAV = [
  { label: 'Capabilities', id: 'n-capabilities' },
  { label: 'Process',      id: 'n-process' },
  { label: 'Work',         id: 'n-work' },
]

function Navbar({ onBack, caseId, setCaseId, studies, onEdit, onExport, isAdmin, theme, onToggleTheme }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`n-nav${scrolled ? ' n-nav--scrolled' : ''}`}>
      <div className="n-nav__inner">
        <a className="n-nav__logo" href="#"
          onClick={(e) => { e.preventDefault(); onBack() }}>
          Methodic<sup className="n-sup">®</sup>
        </a>
        <div className="n-nav__links">
          {PD_NAV.map((l) => (
            <a key={l.label} href="#"
              onClick={(e) => { e.preventDefault(); onBack() }}>
              {l.label}
            </a>
          ))}
        </div>
        <div className="n-nav__right">
          {studies?.length > 0 && (
            <select className="pd-nav__select" value={caseId}
              onChange={(e) => setCaseId(e.target.value)}>
              {studies.map((id) => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>
          )}
          {isAdmin && (
            <>
              <button className="n-btn n-btn--sm n-btn--ghost pd-nav__btn" onClick={onExport}>
                <span className="material-symbols-outlined">download</span>Export
              </button>
              <button className="n-btn n-btn--sm n-btn--ghost pd-nav__btn" onClick={onEdit}>
                <span className="material-symbols-outlined">edit</span>Edit
              </button>
            </>
          )}
          <button className="n-theme-toggle" onClick={onToggleTheme} aria-label="Toggle theme">
            <span className="material-symbols-outlined">{theme === 'light' ? 'dark_mode' : 'light_mode'}</span>
          </button>
          <button className="n-btn n-btn--primary n-btn--sm" onClick={onBack}>
            Book a call
          </button>
        </div>
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
            setValue(Math.round((1 - Math.pow(1 - t, 3)) * to))
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

function Footer({ user, onShowAuth }) {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!menuOpen) return
    const close = () => setMenuOpen(false)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [menuOpen])

  return (
    <footer className="pd-footer">
      <div className="n-inner pd-footer__inner">
        <span className="pd-footer__logo">Methodic<sup className="n-sup">®</sup></span>
        <nav className="pd-footer__links">
          {FOOTER_LINKS.map((l) => (
            <a key={l} href="#" className="pd-footer__link">{l}</a>
          ))}
        </nav>
        <div className="pd-footer__auth">
          <p className="pd-footer__copy">© 2025 Methodic Research Ltd. London / New York.</p>
          {user ? (
            <div className="n-avatar"
              onClick={(e) => { e.stopPropagation(); setMenuOpen((m) => !m) }}>
              {user.photoURL
                ? <img src={user.photoURL} alt="" />
                : (user.displayName || user.email || 'U')[0].toUpperCase()}
              {menuOpen && (
                <div className="n-avatar__menu pd-footer__avatar-menu">
                  <span className="n-avatar__email">{user.email}</span>
                  <button onClick={() => signOut(auth)}>Sign Out</button>
                </div>
              )}
            </div>
          ) : (
            <button className="n-btn n-btn--sm n-btn--ghost" onClick={onShowAuth}>
              Sign In
            </button>
          )}
        </div>
      </div>
    </footer>
  )
}

/* ─────────────────────────────────────
   Section components (data-driven)
───────────────────────────────────── */

function ProjectHeader({ data }) {
  return (
    <section className="ph">
      <div className="ph__inner">
        <span className="ph__eyebrow" data-reveal="fade">{data.eyebrow}</span>
        <h1 className="ph__title" data-reveal="up" data-delay="80">{data.title}</h1>
        <p className="ph__subtitle" data-reveal="up" data-delay="160">{data.subtitle}</p>
        <div className="ph__meta" data-reveal="up" data-delay="280">
          {data.meta.map((m) => (
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

function ProjectImage({ data }) {
  return (
    <div className="pi" data-reveal="scale">
      <div className="pi__inner">
        <div className="pi__frame">
          <img src={data.imageUrl} alt={data.imageCaption} className="pi__img" />
        </div>
        <div className="pi__caption">
          <span className="material-symbols-outlined">photo_camera</span>
          {data.imageCaption}
        </div>
      </div>
    </div>
  )
}

function Challenge({ data }) {
  return (
    <section className="ps">
      <div className="ps__inner">
        <div className="ps__label" data-reveal="fade">
          <span className="material-symbols-outlined">flag</span>
          The Challenge
        </div>
        <div className="ps__two-col">
          <div className="ps__col-left" data-reveal="up">
            <h2 className="ps__heading">{data.challengeHeading}</h2>
          </div>
          <div className="ps__col-right">
            {data.challengeBody.map((para, i) => (
              <p className="ps__body" key={i} data-reveal="up" data-delay={i === 0 ? '80' : '120'}>
                {para}
              </p>
            ))}
            <div className="ps__pain-list" data-reveal="up" data-delay="200">
              <div className="ps__pain-label">
                <span className="material-symbols-outlined">monitoring</span>
                Symptoms
              </div>
              {data.painPoints.map((p) => (
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

const APPROACH_DELAYS = [undefined, '80', '160', '280']

function Approach({ data }) {
  return (
    <section className="ps ps--dark">
      <div className="ps__inner">
        <div className="ps__label" data-reveal="fade">
          <span className="material-symbols-outlined">route</span>
          Approach
        </div>
        <h2 className="ps__heading ps__heading--wide" data-reveal="up">
          {data.approachHeading}
        </h2>
        <div className="ps__card-grid">
          {data.approach.map((card, i) => (
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

const FINDING_DELAYS = [undefined, '80', '160', '280']

function Findings({ data }) {
  return (
    <section className="ps">
      <div className="ps__inner">
        <div className="ps__label" data-reveal="fade">
          <span className="material-symbols-outlined">report_problem</span>
          Pain Points
        </div>
        <h2 className="ps__heading" data-reveal="up">{data.findingsHeading}</h2>
        <div className="ps__finding-grid">
          {data.findings.map((f, i) => (
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

const DELIV_DELAYS = [undefined, '80', '120', '160', '200', '280']

function Deliverables({ data }) {
  return (
    <section className="ps ps--dark">
      <div className="ps__inner ps__deliv-layout">
        <div className="ps__deliv-left" data-reveal="up">
          <div className="ps__label">
            <span className="material-symbols-outlined">inventory_2</span>
            Deliverables
          </div>
          <h2 className="ps__heading">{data.deliverablesHeading}</h2>
          <p className="ps__body ps__body--muted">{data.deliverablesDesc}</p>
        </div>
        <div className="ps__deliv-right">
          {data.deliverables.map((d, i) => (
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

const OUTCOME_DELAYS = [undefined, '80', '160', '280']

function Outcomes({ data }) {
  return (
    <section className="ps">
      <div className="ps__inner">
        <div className="ps__label" data-reveal="fade">
          <span className="material-symbols-outlined">trending_up</span>
          Outcomes
        </div>
        <h2 className="ps__heading" data-reveal="up">{data.outcomesHeading}</h2>
        <div className="ps__outcome-grid">
          {data.outcomes.map((o, i) => (
            <div className="ps__outcome" key={o.label} data-reveal="up" data-delay={OUTCOME_DELAYS[i]}>
              <span className="material-symbols-outlined ps__outcome-icon">{o.icon}</span>
              <div className="ps__outcome-num">
                <CountUp to={Number(o.value)} suffix={o.suffix} />
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

function EField({ label, children }) {
  return (
    <div className="em-field">
      <label className="em-label">{label}</label>
      {children}
    </div>
  )
}

function ESectionHead({ icon, title }) {
  return (
    <div className="em-section-head">
      <span className="material-symbols-outlined">{icon}</span>
      {title}
    </div>
  )
}

function EditModal({ data, caseId, studies, onClose, onSave, onCreateNew }) {
  const [form, setForm] = useState(data)
  const [saving, setSaving] = useState(false)

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const handleSave = async () => {
    setSaving(true)
    try { await onSave(caseId, form) } finally { setSaving(false) }
  }

  const handleCreateNew = async () => {
    const nextNum = Math.max(...studies.map((s) => parseInt(s.split('-')[1]) || 0), 0) + 1
    const newId = `case-${String(nextNum).padStart(2, '0')}`
    setSaving(true)
    try { await onCreateNew(newId, form) } finally { setSaving(false) }
  }

  return (
    <div className="auth-backdrop" onClick={onClose}>
      <div className="em-modal" onClick={(e) => e.stopPropagation()}>

        <div className="em-header">
          <div className="em-header__left">
            <span className="em-header__eyebrow">Admin</span>
            <h2 className="em-header__title">Edit Case Study</h2>
          </div>
          <button className="em-close" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="em-body">

          <section className="em-section">
            <ESectionHead icon="title" title="Overview" />
            <div className="em-grid em-grid--2">
              <EField label="Eyebrow">
                <input className="em-input" value={form.eyebrow || ''} onChange={(e) => set('eyebrow', e.target.value)} />
              </EField>
              <EField label="Title">
                <input className="em-input" value={form.title || ''} onChange={(e) => set('title', e.target.value)} />
              </EField>
            </div>
            <EField label="Subtitle">
              <textarea className="em-input em-input--area" rows="3" value={form.subtitle || ''} onChange={(e) => set('subtitle', e.target.value)} />
            </EField>
          </section>

          <section className="em-section">
            <ESectionHead icon="photo_camera" title="Image" />
            <EField label="URL">
              <input className="em-input" type="url" value={form.imageUrl || ''} onChange={(e) => set('imageUrl', e.target.value)} />
            </EField>
            <EField label="Caption">
              <input className="em-input" value={form.imageCaption || ''} onChange={(e) => set('imageCaption', e.target.value)} />
            </EField>
          </section>

          <section className="em-section">
            <ESectionHead icon="flag" title="Challenge" />
            <EField label="Heading">
              <input className="em-input" value={form.challengeHeading || ''} onChange={(e) => set('challengeHeading', e.target.value)} />
            </EField>
            <EField label="Body — one paragraph per line">
              <textarea className="em-input em-input--area" rows="6" value={(form.challengeBody || []).join('\n')} onChange={(e) => set('challengeBody', e.target.value.split('\n'))} />
            </EField>
          </section>

          <section className="em-section">
            <ESectionHead icon="view_headline" title="Section Headings" />
            <div className="em-grid em-grid--2">
              <EField label="Approach">
                <input className="em-input" value={form.approachHeading || ''} onChange={(e) => set('approachHeading', e.target.value)} />
              </EField>
              <EField label="Findings">
                <input className="em-input" value={form.findingsHeading || ''} onChange={(e) => set('findingsHeading', e.target.value)} />
              </EField>
              <EField label="Deliverables">
                <input className="em-input" value={form.deliverablesHeading || ''} onChange={(e) => set('deliverablesHeading', e.target.value)} />
              </EField>
              <EField label="Outcomes">
                <input className="em-input" value={form.outcomesHeading || ''} onChange={(e) => set('outcomesHeading', e.target.value)} />
              </EField>
            </div>
            <EField label="Deliverables Description">
              <textarea className="em-input em-input--area" rows="2" value={form.deliverablesDesc || ''} onChange={(e) => set('deliverablesDesc', e.target.value)} />
            </EField>
          </section>

        </div>

        <div className="em-footer">
          <button className="em-btn em-btn--ghost" onClick={onClose}>Cancel</button>
          <div className="em-footer__right">
            {caseId && (
              <button className="em-btn em-btn--primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            )}
            <button className="em-btn em-btn--outline" onClick={handleCreateNew} disabled={saving}>
              {saving ? 'Creating…' : 'Create New Study'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

/* ─────────────────────────────────────
   ProjectDetail
───────────────────────────────────── */

export default function ProjectDetail({ onBack, caseId: initialCaseId = 'case-01', theme, onToggleTheme }) {
  const studies = useCaseStudies()
  const [caseId, setCaseId] = useState(initialCaseId)
  const { data, loading } = useProjectData(caseId)
  const didMount = useRef(false)

  useEffect(() => {
    if (!didMount.current) { didMount.current = true; return }
    window.history.replaceState({}, '', `/case/${caseId}`)
  }, [caseId])
  const [showEdit, setShowEdit] = useState(false)
  const [user, setUser]         = useState(null)
  const [showAuth, setShowAuth] = useState(false)

  useLayoutEffect(() => { window.scrollTo(0, 0) }, [caseId])
  useReveal(!loading, data.title)
  useEffect(() => onAuthStateChanged(auth, setUser), [])

  const isAdmin = user?.email === 'brandon.johnson0416@gmail.com'

  const handleExport = () => {
    const json = JSON.stringify(data, null, 2)
    const url  = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
    const a    = Object.assign(document.createElement('a'), { href: url, download: `${caseId}.json` })
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleSaveCase = async (id, formData) => {
    await set(dbRef(db, `UXP/${id}`), formData)
    setShowEdit(false)
  }

  const handleCreateNewCase = async (newId, formData) => {
    await set(dbRef(db, `UXP/${newId}`), formData)
    setCaseId(newId)
    setShowEdit(false)
  }

  if (loading) {
    return (
      <div className={`n${theme === 'light' ? ' n--light' : ''} loading-screen`}>
        <span className="loading-screen__logo">Methodic</span>
      </div>
    )
  }

  return (
    <div className={`n${theme === 'light' ? ' n--light' : ''}`}>
      <ScrollProgress />
      <Navbar
        onBack={onBack}
        caseId={caseId}
        setCaseId={setCaseId}
        studies={studies}
        onEdit={() => setShowEdit(true)}
        onExport={handleExport}
        isAdmin={isAdmin}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />

      <main className="main">
        <ProjectHeader data={data} />
        <ProjectImage data={data} />
        <Challenge data={data} />
        <Approach data={data} />
        <Findings data={data} />
        <Deliverables data={data} />
        <Outcomes data={data} />
        <CTA onBack={onBack} />
      </main>
      <Footer user={user} onShowAuth={() => setShowAuth(true)} />
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {showEdit && (
        <EditModal
          data={data}
          caseId={caseId}
          studies={studies || []}
          onClose={() => setShowEdit(false)}
          onSave={handleSaveCase}
          onCreateNew={handleCreateNewCase}
        />
      )}
    </div>
  )
}
