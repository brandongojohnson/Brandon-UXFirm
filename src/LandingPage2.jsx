import React, { useState, useEffect, useRef } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { ref as dbRef, onValue, set, remove } from 'firebase/database'
import { auth, db } from './firebase'
import AuthModal from './AuthModal'
import ProjectEditor from './ProjectEditor'
import { useAllStudies, FeaturedWork } from './FeaturedWork'
import './landing2.css'
import heroImg from './hero-bg-2.jpg'
import headshotImg from './headshot.jpg'

// Downscales and re-encodes the image so the base64 string saved to the database
// stays a reasonable size — a raw phone photo can be 10MB+, which would otherwise
// get embedded directly into every visitor's page load.
function fileToDataUrl(file, maxDim = 2400, quality = 0.95) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.naturalWidth * scale)
      canvas.height = Math.round(img.naturalHeight * scale)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(objectUrl)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Could not read that image file.'))
    }
    img.src = objectUrl
  })
}

function useReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target) }
      }),
      { threshold: 0.05, rootMargin: '0px 0px -40px 0px' }
    )
    document.querySelectorAll('[data-reveal]').forEach((el) => {
      const r = el.getBoundingClientRect()
      if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('is-visible')
      else obs.observe(el)
    })
    return () => obs.disconnect()
  }, [])
}

function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

function analyzeImageBrightness(src, onResult) {
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    const scale = 0.05
    const canvas = document.createElement('canvas')
    canvas.width  = Math.max(1, Math.floor(img.naturalWidth  * scale))
    canvas.height = Math.max(1, Math.floor(img.naturalHeight * scale))
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)
    let sum = 0
    for (let i = 0; i < data.length; i += 4)
      sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
    onResult(sum / (data.length / 4) > 140)
  }
  img.onerror = () => onResult(false)
  img.src = src
}

/* ─── Navbar ─── */
const NAV = [
  { label: 'Capabilities', id: 'n-capabilities' },
  { label: 'Process',      id: 'n-process' },
  { label: 'Work',         id: 'n-work' },
  // { label: 'Proof',        id: 'n-proof' },
]

function Navbar({ theme, onToggleTheme }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav className={`n-nav${scrolled ? ' n-nav--scrolled' : ''}`}>
      <div className="n-nav__inner">
        <a className="n-nav__logo" href="#">Brandon Johnson</a>
        <div className="n-nav__links">
          {NAV.map((l) => (
            <a key={l.label} href="#"
              onClick={(e) => { e.preventDefault(); scrollToId(l.id) }}>
              {l.label}
            </a>
          ))}
        </div>
        <div className="n-nav__right">
          <button className="n-theme-toggle" onClick={onToggleTheme} aria-label="Toggle light/dark mode">
            <span className="material-symbols-outlined">{theme === 'light' ? 'dark_mode' : 'light_mode'}</span>
          </button>
          <button className="n-btn n-btn--primary n-btn--sm" onClick={() => scrollToId('n-contact')}>
            Book a call
          </button>
        </div>
      </div>
    </nav>
  )
}

/* ─── Hero Image Editor ─── */
function HeroImageEditor({ src, settings, onChange }) {
  const containerRef = useRef(null)
  const startRef = useRef(null)
  const settingsRef = useRef(settings)
  useEffect(() => { settingsRef.current = settings }, [settings])

  function onPointerDown(e) {
    containerRef.current?.setPointerCapture(e.pointerId)
    startRef.current = {
      x: e.clientX, y: e.clientY,
      posX: settingsRef.current.positionX,
      posY: settingsRef.current.positionY,
    }
    e.preventDefault()
  }
  function onPointerMove(e) {
    if (!startRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const scale = settingsRef.current.scale
    // Normalize drag by overflow amount so 1px drag = 1px visual pan
    const overflow = Math.max(scale - 1, 0.001)
    const dx = (e.clientX - startRef.current.x) / rect.width  * 100 / overflow
    const dy = (e.clientY - startRef.current.y) / rect.height * 100 / overflow
    onChange({
      positionX: Math.min(100, Math.max(0, startRef.current.posX - dx)),
      positionY: Math.min(100, Math.max(0, startRef.current.posY - dy)),
    })
  }
  function onPointerUp() { startRef.current = null }

  return (
    <div className="n-hero-editor">
      <div
        ref={containerRef}
        className="n-hero-editor__preview"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <img
          src={src}
          draggable="false"
          style={{
            objectFit: settings.objectFit,
            width:  `${settings.scale * 100}%`,
            height: `${settings.scale * 100}%`,
            left: `${(1 - settings.scale) * settings.positionX}%`,
            top:  `${(1 - settings.scale) * settings.positionY}%`,
          }}
        />
        <div className="n-hero__overlay" style={{ opacity: settings.overlayOpacity }} />
        <div className="n-hero-editor__hint">
          <span className="material-symbols-outlined">open_with</span>
          Drag to reposition
        </div>
      </div>
      <div className="n-hero-editor__controls">
        <div className="n-hero-editor__row">
          <span className="n-hero-editor__label">Fit</span>
          <div className="n-hero-editor__fit-btns">
            {['cover', 'contain', 'fill'].map((f) => (
              <button
                key={f}
                className={`n-hero-editor__fit-btn${settings.objectFit === f ? ' is-active' : ''}`}
                onClick={() => onChange({ objectFit: f })}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="n-hero-editor__row">
          <span className="n-hero-editor__label">Zoom</span>
          <input
            type="range"
            className="n-hero-editor__slider"
            min="1" max="3" step="0.01"
            value={settings.scale}
            onChange={(e) => onChange({ scale: parseFloat(e.target.value) })}
          />
          <span className="n-hero-editor__val">{Math.round(settings.scale * 100)}%</span>
        </div>
        <div className="n-hero-editor__row">
          <span className="n-hero-editor__label">Dim</span>
          <input
            type="range"
            className="n-hero-editor__slider"
            min="0" max="1" step="0.01"
            value={settings.overlayOpacity}
            onChange={(e) => onChange({ overlayOpacity: parseFloat(e.target.value) })}
          />
          <span className="n-hero-editor__val">{Math.round((settings.overlayOpacity ?? 0.38) * 100)}%</span>
        </div>
      </div>
    </div>
  )
}

const DEFAULT_HERO_SETTINGS = { objectFit: 'cover', positionX: 50, positionY: 50, scale: 1, overlayOpacity: 0.38 }

/* ─── Hero ─── */
function Hero({ isAdmin, heroImageUrl, heroTextDark, heroSettings, onHeroSave, onHeroRemove }) {
  const imgSrc = heroImageUrl || heroImg
  const [editOpen, setEditOpen] = useState(false)
  const [urlVal,   setUrlVal]   = useState('')
  const [pending,  setPending]  = useState(null) // { src, file?, url?, settings }
  const [saving,   setSaving]   = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [removeConfirm, setRemoveConfirm] = useState(false)
  const wrapRef = useRef(null)
  const parallaxImgRef = useRef(null)

  useEffect(() => { if (!editOpen) setRemoveConfirm(false) }, [editOpen])

  // Background moves slower than the page scrolls, mutated directly on the DOM node
  // (rather than via React state) so it doesn't re-render the whole hero every scroll tick.
  useEffect(() => {
    let ticking = false
    function apply() {
      if (parallaxImgRef.current) {
        parallaxImgRef.current.style.transform = `translateY(${window.scrollY * 0.18}px)`
      }
      ticking = false
    }
    function onScroll() {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(apply)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    apply()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!editOpen && !pending) return
    const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) { setEditOpen(false) } }
    window.addEventListener('mousedown', handler)
    return () => window.removeEventListener('mousedown', handler)
  }, [editOpen, pending])

  function selectFile(e) {
    const file = e.target.files[0]
    if (!file) return
    setSaveError(null)
    setPending({ src: URL.createObjectURL(file), file, settings: { ...heroSettings } })
    setEditOpen(false)
  }

  function submitUrl(e) {
    e.preventDefault()
    const u = urlVal.trim()
    if (u) {
      setSaveError(null)
      setPending({ src: u, url: u, settings: { ...heroSettings } })
      setUrlVal('')
      setEditOpen(false)
    }
  }

  function openAdjust() {
    setSaveError(null)
    setPending({ src: imgSrc, settings: { ...heroSettings } })
    setEditOpen(false)
  }

  function updatePendingSettings(patch) {
    setPending((p) => ({ ...p, settings: { ...p.settings, ...patch } }))
  }

  async function confirmSave() {
    setSaving(true)
    setSaveError(null)
    try {
      let url = pending.url || heroImageUrl
      if (pending.file) {
        url = await fileToDataUrl(pending.file)
      }
      await onHeroSave(url, pending.settings)
      if (pending.file) URL.revokeObjectURL(pending.src)
      setPending(null)
    } catch (err) {
      // Keep `pending` set so the admin doesn't lose their selection and can retry —
      // a failed save used to fail silently (finally cleared pending either way).
      setSaveError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  function cancelPending() {
    if (pending?.file) URL.revokeObjectURL(pending.src)
    setPending(null)
    setSaveError(null)
  }

  async function handleRemovePhoto() {
    setRemoveConfirm(false)
    setEditOpen(false)
    await onHeroRemove()
  }

  return (
    <section className={`n-hero${heroTextDark ? ' n-hero--light-img' : ''}`}>
      <div className="n-hero__image" aria-hidden="true">
        <img
          ref={parallaxImgRef}
          src={imgSrc}
          alt=""
          className="n-hero__img"
          style={{
            objectFit: heroSettings.objectFit,
            width:  `${heroSettings.scale * 100}%`,
            height: `${heroSettings.scale * 100}%`,
            left: `${(1 - heroSettings.scale) * heroSettings.positionX}%`,
            top:  `${(1 - heroSettings.scale) * heroSettings.positionY}%`,
          }}
        />
        <div className="n-hero__overlay" style={{ opacity: heroSettings.overlayOpacity }} />
        <div className="n-hero__gradient" />
      </div>
      {isAdmin && (
        <div className="n-hero__edit-wrap" ref={wrapRef}>
          <button className="n-hero__edit" onClick={() => setEditOpen(o => !o)}>
            <span className="material-symbols-outlined">photo_camera</span>
            Edit photo
          </button>
          {pending && (
            <div className="n-hero__confirm">
              <HeroImageEditor
                src={pending.src}
                settings={pending.settings}
                onChange={updatePendingSettings}
              />
              {saveError && (
                <p className="n-hero__confirm-error">
                  <span className="material-symbols-outlined">error</span>
                  {saveError}
                </p>
              )}
              <div className="n-hero__confirm-btns">
                <button className="n-hero__confirm-save" onClick={confirmSave} disabled={saving}>
                  <span className="material-symbols-outlined">{saving ? 'hourglass_empty' : 'check'}</span>
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button className="n-hero__confirm-cancel" onClick={cancelPending} disabled={saving}>Cancel</button>
              </div>
            </div>
          )}
          {!pending && editOpen && (
            <div className="n-hero__edit-panel">
              {removeConfirm ? (
                <div className="n-hero__edit-confirm">
                  <p>Remove the current photo and revert to the default image?</p>
                  <div className="n-hero__edit-confirm-actions">
                    <button className="n-hero__edit-confirm-btn" onClick={() => setRemoveConfirm(false)}>
                      Cancel
                    </button>
                    <button
                      className="n-hero__edit-confirm-btn n-hero__edit-confirm-btn--danger"
                      onClick={handleRemovePhoto}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <button className="n-hero__edit-option" onClick={openAdjust}>
                    <span className="material-symbols-outlined">tune</span>
                    Adjust position &amp; fit
                  </button>
                  <div className="n-hero__edit-divider" />
                  <label className="n-hero__edit-option">
                    <span className="material-symbols-outlined">upload</span>
                    Upload new image
                    <input type="file" accept="image/*" hidden onChange={selectFile} />
                  </label>
                  <div className="n-hero__edit-divider" />
                  <form className="n-hero__edit-url" onSubmit={submitUrl}>
                    <input
                      type="url"
                      className="n-hero__edit-input"
                      placeholder="Paste image URL…"
                      value={urlVal}
                      onChange={(e) => setUrlVal(e.target.value)}
                      autoFocus
                    />
                    <button type="submit" className="n-hero__edit-submit">
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                  </form>
                  {heroImageUrl && (
                    <>
                      <div className="n-hero__edit-divider" />
                      <button
                        className="n-hero__edit-option n-hero__edit-option--danger"
                        onClick={() => setRemoveConfirm(true)}
                      >
                        <span className="material-symbols-outlined">delete</span>
                        Remove photo
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}
      <div className="n-hero__blur" aria-hidden="true">
        <div /><div /><div /><div />
      </div>
      <div className="n-hero__inner">
        <div className="n-hero__content">
          <p className="n-hero__eyebrow" data-reveal="up" data-delay="0">
            Research &amp; Strategy Studio
          </p>
          <h1 className="n-hero__h1" data-reveal="up" data-delay="80">
            Not just another<br />research firm.
          </h1>
          <p className="n-hero__sub" data-reveal="up" data-delay="160">
            We bridge the gap between what users say and what they mean — through
            clinical observation, rigorous synthesis, and strategy.
          </p>
          <div className="n-hero__actions" data-reveal="up" data-delay="240">
            <button className="n-btn n-btn--primary n-btn--lg" onClick={() => scrollToId('n-contact')}>
              Start Engagement
            </button>
            <button className="n-btn n-btn--ghost n-btn--lg" onClick={() => scrollToId('n-work')}>
              View Archive
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── About ─── */
function About() {
  return (
    <section className="n-about" id="n-about">
      <div className="n-inner n-about__inner">
        <div className="n-about__header" data-reveal="up">
          <img src={headshotImg} alt="Founder" className="n-about__photo" />
          <p className="n-eyebrow">About the firm</p>
          <h2 className="n-section-title">Research-led, founder-run.</h2>
        </div>
        <div className="n-about__body" data-reveal="up" data-delay="80">
          <p>
            Methodic is an independent research practice founded by former in-house researchers
            who grew tired of insight arriving too late to matter. We work directly with product
            and leadership teams — no account managers, no junior hand-offs — turning ambiguity
            into evidence you can act on.
          </p>
          <p>
            Every engagement is led end-to-end by a senior researcher, drawing on a decade of
            experience across consumer, fintech and B2B platforms.
          </p>
        </div>
      </div>
    </section>
  )
}

/* ─── Logo Strip ─── */
const CLIENTS = ['Acme', 'BuildStack', 'Nexus', 'Orbit Labs', 'Quantify', 'Stellar']

function LogoStrip() {
  return (
    <div className="n-logos">
      <div className="n-inner n-logos__inner">
        <p className="n-logos__label">Trusted by product teams at</p>
        <div className="n-logos__row">
          {CLIENTS.map((c) => <span key={c} className="n-logos__item">{c}</span>)}
        </div>
      </div>
    </div>
  )
}

/* ─── Capabilities ─── */
const CAPABILITIES = [
  { icon: 'explore', title: 'Generative Research', desc: 'Uncover unmet needs and map opportunity spaces before you build.' },
  { icon: 'insights', title: 'Market & Competitive Analysis', desc: 'Benchmark your position and surface whitespace competitors missed.' },
  { icon: 'hub', title: 'Research Operations', desc: 'Stand up the panels, tools and processes that make research repeatable.' },
  { icon: 'touch_app', title: 'Usability Testing', desc: 'Validate flows and interfaces with real users before you ship.' },
  { icon: 'lightbulb', title: 'Concept & Prototype Testing', desc: 'Pressure-test ideas early — before costly development begins.' },
  { icon: 'calendar_month', title: 'Diary & Longitudinal Studies', desc: 'Track behaviour change over time in real-world contexts.' },
]

function Capabilities() {
  return (
    <section className="n-cap" id="n-capabilities">
      <div className="n-inner">
        <div className="n-cap__header" data-reveal="up">
          <p className="n-eyebrow">Capabilities</p>
          <h2 className="n-section-title">Research, end to end.</h2>
        </div>
        <div className="n-cap__grid" data-reveal="up" data-delay="80">
          {CAPABILITIES.map((c) => (
            <div key={c.title} className="n-cap-card">
              <span className="material-symbols-outlined n-cap-card__icon">{c.icon}</span>
              <h3 className="n-cap-card__title">{c.title}</h3>
              <p className="n-cap-card__desc">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Process ─── */
const PROCESS_STEPS = [
  { num: '01', icon: 'search',          title: 'Discovery',       desc: 'Align on goals, audiences and the questions that matter most.' },
  { num: '02', icon: 'design_services', title: 'Design',          desc: 'Design the study — methods, screeners, scripts and stimuli.' },
  { num: '03', icon: 'groups',          title: 'Fieldwork',       desc: 'Run sessions with real users, in person or remote.' },
  { num: '04', icon: 'analytics',       title: 'Analysis',        desc: 'Synthesize findings into clear patterns and themes.' },
  { num: '05', icon: 'flag',            title: 'Recommendations', desc: 'Deliver a prioritized roadmap your team can act on.' },
]

function Process() {
  return (
    <section className="n-process" id="n-process">
      <div className="n-inner">
        <div className="n-process__header" data-reveal="up">
          <p className="n-eyebrow">Process</p>
          <h2 className="n-section-title">A structured path to clarity.</h2>
        </div>
        <div className="n-process__grid" data-reveal="up" data-delay="80">
          {PROCESS_STEPS.map((s) => (
            <div key={s.num} className="n-step">
              <div className="n-step__head">
                <span className="material-symbols-outlined n-step__icon">{s.icon}</span>
                <span className="n-step__num">{s.num}</span>
              </div>
              <h3 className="n-step__title">{s.title}</h3>
              <p className="n-step__desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Testimonials (Social Proof) ─── */
const TESTIMONIALS = [
  {
    text: 'Working with Methodic fundamentally changed how we approach product decisions. The quality of insight they delivered in six weeks would have taken our internal team a full year.',
    name: 'Sarah Chen',
    role: 'VP of Product — Acme Corp',
    initials: 'SC',
  },
  {
    text: 'The research synthesis was unlike anything we had seen. It directly informed our Series B product strategy and gave us the evidence we needed to move forward with confidence.',
    name: 'James Harwood',
    role: 'CPO — BuildStack',
    initials: 'JH',
  },
]

function Testimonials() {
  const [active, setActive] = useState(0)
  const t = TESTIMONIALS[active]
  return (
    <section className="n-testi" id="n-proof">
      <div className="n-inner">
        <div className="n-testi__header" data-reveal="up">
          <p className="n-eyebrow">Social proof</p>
          <h2 className="n-section-title">Trusted by teams who value evidence.</h2>
          <div className="n-rating">
            <span className="n-rating__stars">★★★★★</span>
            <span className="n-rating__score">4.9 / 5</span>
            <span className="n-rating__count">— 18 engagements</span>
          </div>
        </div>
        <div className="n-testi__body" data-reveal="fade" data-delay="80">
          <div className="n-testi__nav">
            {TESTIMONIALS.map((_, i) => (
              <button key={i}
                className={`n-testi__dot${active === i ? ' active' : ''}`}
                onClick={() => setActive(i)}
                aria-label={`Testimonial ${i + 1}`} />
            ))}
            <span className="n-testi__count">
              {String(active + 1).padStart(2, '0')} / {String(TESTIMONIALS.length).padStart(2, '0')}
            </span>
          </div>
          <blockquote className="n-testi__quote">"{t.text}"</blockquote>
          <div className="n-testi__attr">
            <div className="n-testi__avatar">{t.initials}</div>
            <div>
              <p className="n-testi__name">{t.name}</p>
              <p className="n-testi__role">{t.role}</p>
            </div>
          </div>
        </div>
        {/* <div className="n-metrics" data-reveal="up" data-delay="120">
          {[
            { val: '50+',  lbl: 'Engagements completed' },
            { val: '3×',   lbl: 'Faster than in-house' },
            { val: '94%',  lbl: 'Client return rate' },
          ].map(m => (
            <div key={m.lbl} className="n-metric">
              <span className="n-metric__val">{m.val}</span>
              <span className="n-metric__lbl">{m.lbl}</span>
            </div>
          ))}
        </div> */}
      </div>
    </section>
  )
}

/* ─── FAQ ─── */
const FAQS = [
  { q: 'How long does a typical engagement take?',     a: 'Sprint engagements are delivered in 2 weeks. Full quarterly engagements run on a rolling basis with weekly updates. Most project-based work falls between 6–12 weeks.' },
  { q: 'Can we update our own findings after delivery?', a: 'Yes — all synthesis reports are delivered as editable documents. We also offer optional handover workshops to ensure your team can interpret and build on findings independently.' },
  { q: 'Do we need existing research to get started?', a: 'Not at all. We handle everything from participant recruitment through to final delivery. Existing research is useful context but never a prerequisite.' },
  { q: 'What does post-project support look like?',    a: 'Every engagement includes a 30-day Q&A period after delivery. For ongoing support, we offer retainer arrangements — ask about our quarterly engagement model.' },
  { q: 'What is the typical payment structure?',       a: "Sprint engagements are billed in full upfront. Quarterly engagements are split into monthly installments. Enterprise arrangements are bespoke — we'll propose what works for both parties." },
]

function FAQ() {
  const [open, setOpen] = useState(null)
  return (
    <section className="n-faq">
      <div className="n-inner n-faq__inner">
        <div className="n-faq__left" data-reveal="up">
          <p className="n-eyebrow">FAQ</p>
          <h2 className="n-section-title">Common questions.</h2>
          <p className="n-faq__hint">
            Still have a question?{' '}
            <a href="#" className="n-text-link"
              onClick={(e) => { e.preventDefault(); scrollToId('n-contact') }}>
              Ask us directly →
            </a>
          </p>
        </div>
        <div className="n-faq__list" data-reveal="up" data-delay="80">
          {FAQS.map((faq, i) => (
            <div key={i} className={`n-faq__item${open === i ? ' open' : ''}`}
              onClick={() => setOpen(open === i ? null : i)}>
              <div className="n-faq__q">
                {faq.q}
                <span className="n-faq__icon">{open === i ? '−' : '+'}</span>
              </div>
              {open === i && <p className="n-faq__a">{faq.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Final CTA ─── */
function ContactCTA() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  const handleSubmit = (e) => e.preventDefault()

  return (
    <section className="n-cta" id="n-contact">
      <div className="n-inner n-cta__inner">
        <div className="n-cta__intro" data-reveal="fade">
          <p className="n-eyebrow">Get in touch</p>
          <h2 className="n-cta__title">Ready to understand your users?</h2>
          <p className="n-cta__body">
            If your team is making decisions without sufficient evidence, or you simply
            want sharper insight faster — Methodic is here to help.
          </p>
          <div className="n-cta__actions">
            <button className="n-btn n-btn--ghost n-btn--lg" onClick={() => scrollToId('n-contact')}>
              Book a 30-min call
            </button>
          </div>
        </div>
        <form className="n-cform" onSubmit={handleSubmit} data-reveal="fade" data-delay="80">
          <div className="n-cform__row">
            <div className="n-cform__field">
              <label htmlFor="n-name">Name</label>
              <input id="n-name" name="name" type="text" value={form.name} onChange={handleChange} placeholder="Jane Doe" />
            </div>
            <div className="n-cform__field">
              <label htmlFor="n-email">Email</label>
              <input id="n-email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="jane@company.com" />
            </div>
          </div>
          <div className="n-cform__field">
            <label htmlFor="n-message">Message</label>
            <textarea id="n-message" name="message" rows={4} value={form.message} onChange={handleChange} placeholder="Tell us about your project..." />
          </div>
          <button type="submit" className="n-btn n-btn--primary n-btn--full">Send message</button>
        </form>
      </div>
    </section>
  )
}

/* ─── Footer ─── */
const FOOTER_COLS = [
  { head: 'Services', links: ['Research Sprint', 'Full Engagement', 'Enterprise', 'Research Ops'] },
  { head: 'Company',  links: ['About', 'Work', 'Process', 'Contact'] },
  { head: 'Legal',    links: ['Privacy Policy', 'Terms of Service'] },
]

function Footer({ user }) {
  const [showAuth, setShowAuth] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!menuOpen) return
    const close = () => setMenuOpen(false)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [menuOpen])

  return (
    <footer className="n-footer">
      <div className="n-inner n-footer__inner">
        <div className="n-footer__brand">
          <span className="n-footer__logo">Methodic<sup className="n-sup">®</sup></span>
          <p className="n-footer__tagline">Human insight for the disrupters.</p>
          <p className="n-footer__copy">© 2025 Methodic Research Ltd. London / New York.</p>
        </div>
        <div className="n-footer__cols">
          {FOOTER_COLS.map((col) => (
            <div key={col.head} className="n-footer__col">
              <h5 className="n-footer__col-head">{col.head}</h5>
              {col.links.map((l) => <a key={l} href="#" className="n-footer__link">{l}</a>)}
            </div>
          ))}
        </div>
      </div>
      <div className="n-inner n-footer__bottom">
        {user ? (
          <div className="n-avatar" onClick={(e) => { e.stopPropagation(); setMenuOpen(m => !m) }}>
            {user.photoURL
              ? <img src={user.photoURL} alt="" />
              : (user.displayName || user.email || 'U')[0].toUpperCase()}
            {menuOpen && (
              <div className="n-avatar__menu">
                <span className="n-avatar__email">{user.email}</span>
                <button onClick={() => signOut(auth)}>Sign Out</button>
              </div>
            )}
          </div>
        ) : (
          <button className="n-btn n-btn--ghost n-btn--sm" onClick={() => setShowAuth(true)}>
            Sign In
          </button>
        )}
      </div>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </footer>
  )
}

/* ─── Page ─── */
export default function LandingPage2({ onNavigate, theme, onToggleTheme }) {
  const studies = useAllStudies()
  useReveal()

  const [user, setUser] = useState(null)
  useEffect(() => onAuthStateChanged(auth, setUser), [])
  const isAdmin = !!user

  const [showProjectEditor, setShowProjectEditor] = useState(false)

  const [heroImageUrl, setHeroImageUrl] = useState(null)
  const [heroTextDark, setHeroTextDark] = useState(false)
  const [heroSettings, setHeroSettings] = useState(DEFAULT_HERO_SETTINGS)

  useEffect(() => {
    return onValue(dbRef(db, 'siteSettings/heroImageUrl'), (snap) => {
      setHeroImageUrl(snap.exists() ? snap.val() : null)
    })
  }, [])

  useEffect(() => {
    return onValue(dbRef(db, 'siteSettings/heroSettings'), (snap) => {
      setHeroSettings(snap.exists() ? snap.val() : DEFAULT_HERO_SETTINGS)
    })
  }, [])

  useEffect(() => {
    analyzeImageBrightness(heroImageUrl || heroImg, setHeroTextDark)
  }, [heroImageUrl])

  async function handleHeroSave(url, settings) {
    if (url) {
      await set(dbRef(db, 'siteSettings/heroImageUrl'), url)
      setHeroImageUrl(url)
    }
    await set(dbRef(db, 'siteSettings/heroSettings'), settings)
    setHeroSettings(settings)
  }

  async function handleHeroRemove() {
    await remove(dbRef(db, 'siteSettings/heroImageUrl'))
    await remove(dbRef(db, 'siteSettings/heroSettings'))
    setHeroImageUrl(null)
    setHeroSettings(DEFAULT_HERO_SETTINGS)
  }

  return (
    <div className={`n${theme === 'light' ? ' n--light' : ''}`}>
      <Navbar theme={theme} onToggleTheme={onToggleTheme} />
      <main>
        <Hero
          isAdmin={isAdmin}
          heroImageUrl={heroImageUrl}
          heroTextDark={heroTextDark}
          heroSettings={heroSettings}
          onHeroSave={handleHeroSave}
          onHeroRemove={handleHeroRemove}
        />
        <Capabilities />
        <Process />
        <FeaturedWork studies={studies} onNavigate={onNavigate} isAdmin={isAdmin} onAddProject={() => setShowProjectEditor(true)} onDeleteProject={id => remove(dbRef(db, 'UXP/' + id))} />
        <FAQ />
        <ContactCTA />
      </main>
      <Footer user={user} />
      {showProjectEditor && <ProjectEditor studies={studies} onClose={() => setShowProjectEditor(false)} />}
    </div>
  )
}
