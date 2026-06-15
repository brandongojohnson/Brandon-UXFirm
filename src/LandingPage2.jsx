import { useState, useEffect } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { ref as dbRef, onValue } from 'firebase/database'
import { auth, db } from './firebase'
import AuthModal from './AuthModal'
import './landing2.css'

function toArr(v) {
  if (!v) return []
  return Array.isArray(v) ? v : Object.values(v)
}

function useAllStudies() {
  const [studies, setStudies] = useState(undefined)
  useEffect(() => {
    return onValue(
      dbRef(db, 'UXP'),
      (snap) => {
        const val = snap.val()
        if (val) {
          setStudies(
            Object.entries(val)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([id, data]) => ({ id, ...data, outcomes: toArr(data.outcomes) }))
          )
        } else { setStudies([]) }
      },
      () => setStudies([])
    )
  }, [])
  return studies
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

/* ─── Navbar ─── */
const NAV = [
  { label: 'Capabilities', id: 'n-capabilities' },
  { label: 'Process',      id: 'n-process' },
  { label: 'Work',         id: 'n-work' },
  { label: 'Pricing',      id: 'n-pricing' },
]

function Navbar({ onSwitchDesign }) {
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser]         = useState(null)
  const [showAuth, setShowAuth] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => onAuthStateChanged(auth, setUser), [])

  useEffect(() => {
    if (!menuOpen) return
    const close = () => setMenuOpen(false)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [menuOpen])

  return (
    <>
      <nav className={`n-nav${scrolled ? ' n-nav--scrolled' : ''}`}>
        <div className="n-nav__inner">
          <a className="n-nav__logo" href="#">Methodic<sup className="n-sup">®</sup></a>
          <div className="n-nav__links">
            {NAV.map((l) => (
              <a key={l.label} href="#"
                onClick={(e) => { e.preventDefault(); scrollToId(l.id) }}>
                {l.label}
              </a>
            ))}
          </div>
          <div className="n-nav__right">
            <button className="n-switch" onClick={onSwitchDesign}>Classic</button>
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
            <button className="n-btn n-btn--primary n-btn--sm" onClick={() => scrollToId('n-contact')}>
              Book a call
            </button>
          </div>
        </div>
      </nav>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  )
}

/* ─── Hero ─── */
function Hero() {
  return (
    <section className="n-hero">
      <div className="n-hero__inner">
        <div className="n-hero__tag" data-reveal="fade">
          <span>Research starting from</span>
          <strong>£4,800</strong>
        </div>
        <h1 className="n-hero__h1" data-reveal="up" data-delay="80">
          Not just another<br />research firm.
        </h1>
        <p className="n-hero__sub" data-reveal="up" data-delay="160">
          We bridge the gap between what users say and what they mean — through
          clinical observation, rigorous synthesis, and strategic clarity.
        </p>
        <div className="n-hero__actions" data-reveal="up" data-delay="200">
          <button className="n-btn n-btn--primary n-btn--lg" onClick={() => scrollToId('n-contact')}>
            Start Engagement
          </button>
          <button className="n-btn n-btn--ghost n-btn--lg" onClick={() => scrollToId('n-work')}>
            View Archive
          </button>
        </div>
      </div>
      <div className="n-hero__stem" aria-hidden="true" />
    </section>
  )
}

/* ─── Client Logos ─── */
const CLIENT_LOGOS = ['Acme', 'Northwind', 'Vertex Labs', 'Quanta', 'Orbital', 'Buildstack']

function ClientLogos() {
  return (
    <div className="n-logos" data-reveal="fade">
      <p className="n-logos__label">Trusted by product teams at</p>
      <div className="n-logos__row">
        {CLIENT_LOGOS.map((name) => (
          <span key={name} className="n-logo">{name}</span>
        ))}
      </div>
    </div>
  )
}

/* ─── Benefits Row ─── */
const BENEFITS = [
  { stat: '£4,800',  label: 'Flexible pricing',    desc: 'Starting fee for a focused research sprint with clear deliverables.' },
  { stat: '24 h',    label: 'Fast communication',  desc: 'Guaranteed response within one business day, always.' },
  { stat: '2–6 wks', label: 'Fast turnarounds',    desc: 'From kickoff to synthesis report — without cutting corners.' },
]

function BenefitsRow() {
  return (
    <div className="n-benefits">
      {BENEFITS.map((b, i) => (
        <div key={b.label} className="n-benefit"
          data-reveal="up" data-delay={i > 0 ? String(i * 80) : undefined}>
          <span className="n-benefit__stat">{b.stat}</span>
          <span className="n-benefit__label">{b.label}</span>
          <p className="n-benefit__desc">{b.desc}</p>
        </div>
      ))}
    </div>
  )
}

/* ─── Capabilities ─── */
const CAPABILITIES = [
  {
    group: 'Strategic Research',
    items: [
      { icon: 'explore', title: 'Generative Research', desc: 'Uncover unmet needs and map opportunity spaces before you build.' },
      { icon: 'insights', title: 'Market & Competitive Analysis', desc: 'Benchmark your position and surface whitespace competitors missed.' },
      { icon: 'hub', title: 'Research Operations', desc: 'Stand up the panels, tools and processes that make research repeatable.' },
    ],
  },
  {
    group: 'Tactical Research',
    items: [
      { icon: 'touch_app', title: 'Usability Testing', desc: 'Validate flows and interfaces with real users before you ship.' },
      { icon: 'lightbulb', title: 'Concept & Prototype Testing', desc: 'Pressure-test ideas early — before costly development begins.' },
      { icon: 'calendar_month', title: 'Diary & Longitudinal Studies', desc: 'Track behaviour change over time in real-world contexts.' },
    ],
  },
]

function Capabilities() {
  return (
    <section className="n-cap" id="n-capabilities">
      <div className="n-inner">
        <div className="n-cap__header" data-reveal="up">
          <p className="n-eyebrow">Capabilities</p>
          <h2 className="n-section-title">Research, end to end.</h2>
        </div>
        {CAPABILITIES.map((group, gi) => (
          <div key={group.group} className="n-cap__group"
            data-reveal="up" data-delay={gi > 0 ? '80' : undefined}>
            <h4 className="n-cap__group-label">{group.group}</h4>
            <div className="n-cap__grid">
              {group.items.map((c) => (
                <div key={c.title} className="n-cap-card">
                  <span className="material-symbols-outlined n-cap-card__icon">{c.icon}</span>
                  <h3 className="n-cap-card__title">{c.title}</h3>
                  <p className="n-cap-card__desc">{c.desc}</p>
                  <a href="#" className="n-text-link" onClick={(e) => e.preventDefault()}>
                    Learn more <span>→</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        ))}
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
                <span className="n-step__num">{s.num}</span>
                <span className="material-symbols-outlined n-step__icon">{s.icon}</span>
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

/* ─── Featured Work ─── */
function FeaturedWork({ studies, onNavigate }) {
  useEffect(() => {
    if (!studies) return
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target) }
      }),
      { threshold: 0.05, rootMargin: '0px 0px -40px 0px' }
    )
    document.querySelectorAll('[data-reveal]:not(.is-visible)').forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [studies])

  return (
    <section className="n-work" id="n-work">
      <div className="n-inner">
        <div className="n-work__header" data-reveal="up">
          <div>
            <p className="n-eyebrow">Featured work between ©2023–25</p>
            <h2 className="n-section-title">Selected projects.</h2>
          </div>
          <a href="#" className="n-text-link" onClick={(e) => e.preventDefault()}>
            Discover all projects <span>→</span>
          </a>
        </div>

        {studies === undefined && <p className="n-placeholder">Loading case studies…</p>}
        {studies?.length === 0  && <p className="n-placeholder">No case studies yet.</p>}

        {studies && studies.length > 0 && (
          <div className="n-work__grid">
            {studies.slice(0, 3).map((s, i) => (
              <div key={s.id} className="n-wcard"
                data-reveal="up" data-delay={i > 0 ? String(i * 80) : undefined}
                onClick={() => onNavigate?.('project', s.id)}>
                {s.imageUrl ? (
                  <div className="n-wcard__img-wrap">
                    <img src={s.imageUrl} alt={s.title} className="n-wcard__img" />
                  </div>
                ) : (
                  <div className="n-wcard__img-placeholder" />
                )}
                <div className="n-wcard__body">
                  <div className="n-wcard__top">
                    <span className="n-eyebrow">{s.eyebrow || 'Research'}</span>
                    <span className="n-wcard__arrow">→</span>
                  </div>
                  <h3 className="n-wcard__title">{s.title}</h3>
                  {s.subtitle && <p className="n-wcard__desc">{s.subtitle}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
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
        <div className="n-metrics" data-reveal="up" data-delay="120">
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
        </div>
      </div>
    </section>
  )
}

/* ─── Pricing ─── */
const PLANS = [
  {
    name: 'Sprint',
    price: '£4,800',
    period: 'one-time',
    desc: 'Focused insight for a specific product question.',
    features: ['2-week delivery', '5 user interviews', 'Synthesis report', 'Strategic presentation'],
  },
  {
    name: 'Engagement',
    price: '£14,500',
    period: 'per quarter',
    desc: 'A fully embedded research function for your team.',
    features: ['20+ interviews / quarter', 'Weekly synthesis updates', 'Dedicated research lead', 'Custom method design', 'Priority scheduling'],
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'tailored',
    desc: "Got ambitious goals? Let's discuss an embedded practice.",
    features: ['Embedded research team', 'Custom methodology', 'Process integration', 'Executive reporting', 'Team enablement'],
  },
]

function Pricing() {
  return (
    <section className="n-pricing" id="n-pricing">
      <div className="n-inner">
        <div className="n-pricing__header" data-reveal="up">
          <p className="n-eyebrow">Pricing</p>
          <h2 className="n-section-title">Research that pays for itself.</h2>
          <p className="n-pricing__sub">Transparent pricing. No hidden fees. Clear deliverables.</p>
        </div>
        <div className="n-pricing__grid" data-reveal="up" data-delay="80">
          {PLANS.map((p) => (
            <div key={p.name} className={`n-plan${p.featured ? ' n-plan--feat' : ''}`}>
              <div className="n-plan__head">
                <h3 className="n-plan__name">{p.name}</h3>
                <div className="n-plan__price">
                  {p.price}<span className="n-plan__period"> / {p.period}</span>
                </div>
                <p className="n-plan__desc">{p.desc}</p>
              </div>
              <ul className="n-plan__list">
                {p.features.map((f) => (
                  <li key={f}><span className="n-check">✓</span>{f}</li>
                ))}
              </ul>
              <button className={`n-btn n-btn--full ${p.featured ? 'n-btn--primary' : 'n-btn--outline'}`}>
                {p.price === 'Custom' ? 'Book a meeting' : 'Get started'}
              </button>
            </div>
          ))}
        </div>
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

function Footer() {
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
    </footer>
  )
}

/* ─── Page ─── */
export default function LandingPage2({ onNavigate, onSwitchDesign }) {
  const studies = useAllStudies()
  useReveal()

  return (
    <div className="n">
      <Navbar onSwitchDesign={onSwitchDesign} />
      <main>
        <Hero />
        <ClientLogos />
        <BenefitsRow />
        <Capabilities />
        <Process />
        <Testimonials />
        <FeaturedWork studies={studies} onNavigate={onNavigate} />
        <Pricing />
        <FAQ />
        <ContactCTA />
      </main>
      <Footer />
    </div>
  )
}
