import { useState, useEffect, useRef } from 'react'
import './index.css'

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

function useParallax(speed = 0.12) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const container = el.parentElement

    const tick = () => {
      const rect = container.getBoundingClientRect()
      const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * speed
      el.style.transform = `translateY(${offset}px)`
    }

    window.addEventListener('scroll', tick, { passive: true })
    tick()
    return () => window.removeEventListener('scroll', tick)
  }, [speed])

  return ref
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
   Navbar
───────────────────────────────────── */

const NAV_LINKS = ['ARCHIVE', 'INDEX', 'THEMES', 'LAB']

function Navbar() {
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
          <a className="navbar__logo" href="#">Methodic</a>
          <span className="navbar__sep" aria-hidden="true" />
          <span className="navbar__tagline">Curated Selection</span>
        </div>
        <div className="navbar__links">
          {NAV_LINKS.map((l) => (
            <a key={l} href="#" className={l === 'INDEX' ? 'active' : ''}>{l}</a>
          ))}
        </div>
        <button className="navbar__cta">READ JOURNAL</button>
      </div>
    </nav>
  )
}

/* ─────────────────────────────────────
   Hero
───────────────────────────────────── */

const HERO_IMAGE = '../src/image 15.png'

function Hero() {
  return (
    <section className="hero">
      <div className="hero__inner">
        <div className="hero__left">
          <div className="hero__intro" data-reveal="up">
            <span className="hero__eyebrow">Institutional Research</span>
            <h1 className="hero__headline">Human insight for the architects.</h1>
          </div>
          <p className="hero__body" data-reveal="up" data-delay="120">
            We bridge the gap between abstract user behavior and actionable
            strategic frameworks through clinical observation and synthesis.
          </p>
          <div className="hero__actions" data-reveal="up" data-delay="200">

            <button className="hero__cta hero__cta--primary">
              Start Engagement
            </button>

            <button className="hero__cta hero__cta--outline">
              Start Engagement
            </button>




            {/* <div className="hero__trust">
              <div className="hero__trust-top">
                <span className="hero__trust-label">Trusted by:</span>
                <div className="hero__trust-logos">
                  <span>Vanguard</span>
                  <span>Goldman</span>
                  <span>BlackRock</span>
                </div>
              </div>
            </div> */}
          </div>
        </div>
        <div className="hero__right" data-reveal="fade" data-delay="160">
          <img src={HERO_IMAGE} alt="Atmospheric research space" className="hero__img" />
          <div className="hero__img-overlay" aria-hidden="true" />
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────
   Capabilities
───────────────────────────────────── */

const CAPABILITIES = [
  {
    icon: 'search_insights',
    title: 'Generative Research',
    desc: 'Deep-dive ethnographic studies to uncover latent needs and mental models before product definition begins.',
  },
  {
    icon: 'analytics',
    title: 'Mixed Methods',
    desc: 'Triangulating qualitative depth with quantitative scale to provide a 360-degree view of user ecosystems.',
  },
  {
    icon: 'settings_input_component',
    title: 'Research Ops',
    desc: 'Standardizing recruitment, data governance, and knowledge management systems for enterprise-scale teams.',
  },
  {
    icon: 'experiment',
    title: 'Concept Testing',
    desc: 'Rapid validation of high-fidelity prototypes and service blueprints through stress-tested clinical scenarios.',
  },
]

const CAP_DELAYS = [undefined, '80', '160', '280']

function Capabilities() {
  return (
    <section className="capabilities">
      <div className="capabilities__inner">
        <div className="capabilities__header" data-reveal="up">
          <div className="capabilities__header-left">
            <span className="label-sm">Methodology</span>
            <h2 className="capabilities__title">Capabilities</h2>
          </div>
          <span className="capabilities__count">Methods // Suite 01.04</span>
        </div>
        <div className="capabilities__grid">
          {CAPABILITIES.map((cap, i) => (
            <div className="cap-card" key={cap.title} data-reveal="up" data-delay={CAP_DELAYS[i]}>
              <span className="material-symbols-outlined cap-card__icon">{cap.icon}</span>
              <div className="cap-card__body">
                <h3 className="cap-card__title">{cap.title}</h3>
                <p className="cap-card__desc">{cap.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────
   SelectedEvidence
───────────────────────────────────── */

const FEATURED_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCZlSIJiUBFMS9E-glpg7cv2SHV5_R7bTWFe_aJZRpj8RISyUtD2YiFCc1-bkm0pPW3Rnv0CE_19FwTumY20DceswH08FFFHyTrLlx2KUKf2eBWRlHfax7r-rAG-dTYGEk_Q4xNZPOomt2aSQBFIiNjEX0SxzS0Y_CH-BkEkeCx6iad5tYskQdIDByYiCnidbto0w18-lZ9yriW395_mmBPaifWlYdPqM1Ccrlr8Wt1nqq5luPjKck3UYqby7a4jptskxkkjOu1YPHZ'

function SelectedEvidence() {
  const featuredImgRef = useParallax(0.08)

  return (
    <section className="evidence">
      <div className="evidence__inner">
        <div className="evidence__header" data-reveal="up">
          <span className="evidence__label">Archive</span>
          <h2 className="evidence__title">Selected Evidence</h2>
        </div>

        <div className="evidence__featured" data-reveal="scale" data-delay="80">
          <img ref={featuredImgRef} src={FEATURED_IMG} alt="Strategic planning session" className="evidence__featured-img" />
          <div className="evidence__featured-body">
            <div className="evidence__featured-tag" data-reveal="up" data-delay="200">
              <span className="evidence__tag-line" aria-hidden="true" />
              Case 01 // Featured
            </div>
            <h3 className="evidence__featured-title" data-reveal="up" data-delay="280">
              Standardizing Research Operations at Scale
            </h3>
            <p className="evidence__featured-desc" data-reveal="up" data-delay="360">
              For a Fortune 50 fintech, we architected a centralized research repository
              that reduced study lead-time by 40% and improved cross-functional data
              democratization.
            </p>
            <div className="evidence__stats" data-reveal="up" data-delay="440">
              <div className="evidence__stat">
                <span className="evidence__stat-num"><CountUp to={60} suffix="%" /></span>
                <span className="evidence__stat-label">Efficiency Gain</span>
              </div>
              <div className="evidence__stat">
                <span className="evidence__stat-num"><CountUp to={12} suffix="k" /></span>
                <span className="evidence__stat-label">Data Points Synthesized</span>
              </div>
              <a href="#" className="evidence__explore">
                Explore Project
                <span className="material-symbols-outlined">north_east</span>
              </a>
            </div>
          </div>
        </div>

        <div className="evidence__secondary">
          <div className="evidence__card" data-reveal="up" data-delay="80">
            <div className="evidence__card-top">
              <span className="evidence__card-label">Case 02 // Enterprise</span>
              <span className="material-symbols-outlined evidence__card-arrow">arrow_forward</span>
            </div>
            <h4 className="evidence__card-title">Optimizing Query Precision</h4>
            <p className="evidence__card-desc">
              Re-mapping the cognitive architecture of internal knowledge bases for global consultancy firms.
            </p>
          </div>
          <div className="evidence__card" data-reveal="up" data-delay="200">
            <div className="evidence__card-top">
              <span className="evidence__card-label">Case 03 // Finance</span>
              <span className="material-symbols-outlined evidence__card-arrow">arrow_forward</span>
            </div>
            <h4 className="evidence__card-title">Frictionless Compliance</h4>
            <p className="evidence__card-desc">
              Balancing regulatory requirements with user autonomy in cross-border transaction flows.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────
   MethodicCycle
───────────────────────────────────── */

const STEPS = [
  { num: '01', title: 'Discovery', desc: 'Audit of existing intelligence and deep stakeholder alignment sessions.', active: true },
  { num: '02', title: 'Framing', desc: 'Constructing the research hypothesis and bespoke methodology design.', active: false },
  { num: '03', title: 'Field Work', desc: 'Active ethnography, expert interviews, and clinical data acquisition.', active: false },
  { num: '04', title: 'Synthesis', desc: 'Pattern identification, behavioral mapping, and thematic extraction.', active: false },
  { num: '05', title: 'Strategy', desc: 'Implementation roadmaps, design principles, and strategic briefings.', active: false },
]

const STEP_DELAYS = [undefined, '80', '160', '280', '360']

function MethodicCycle() {
  return (
    <section className="cycle">
      <div className="cycle__inner">
        <div className="cycle__header" data-reveal="up">
          <h2 className="cycle__title">The Methodic Cycle</h2>
          <p className="cycle__subtitle">A linear approach to complex synthesis</p>
        </div>
        <div className="cycle__steps">
          <div className="cycle__progress-line" aria-hidden="true" />
          {STEPS.map((step, i) => (
            <div className="cycle__step" key={step.num} data-reveal="up" data-delay={STEP_DELAYS[i]}>
              <div className={`cycle__dot${step.active ? ' cycle__dot--active' : ''}`}>{step.num}</div>
              <div className="cycle__step-body">
                <h5 className="cycle__step-title">{step.title}</h5>
                <p className="cycle__step-desc">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────
   Team
───────────────────────────────────── */

const MEMBERS = [
  {
    name: 'Elias Vance',
    role: 'Lead Strategist',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAT2X4IMDV_9NtplWNCkXjWhe-FXkXSNb_6V3SDyAsrCozItQ35DMRSgfGygiSky9qmoJn8A0aMYu5ehA9W6i2_qqYr6IbeKvvnqsjfl5cWXBqYf9E8OCcJ579en_hcaNzoG7CPkItmuPFMbQr2DAB1H6sy65NHe8eDcTUTjbJfWwKGPqfuKmvAR2HKeOGActBzjYEXk4Z6xurtZ856DjeMLazQdYaaPU4FnOd3reAmi6zQlRebsOXKrRNIcxDXLQ582kinGmQwwHGe',
  },
  {
    name: 'Sarah Jenkins',
    role: 'Director of Methods',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDEi6p1_rB3DeXoZ3x9amQztTN7fWqB4h1r4ojwveh7-FhXjIf4iABD4JwnmmxANfIm1b884MwJeScUU3fmkMXwnqMYgG-76KtR-J091HmfUj7zs9dSuKHg0q9yFkvME7JAcMmMEm14Stn_VCiqk7_HQOYNo1KScbsqeowFnQ4Bn6AEgI9Q8wutJmEFHQbWTkJjZpyWM8DLqe5Vz8Qfkt6UZaBgqupEOvC9_3MayLobge8oPwVUGZH3NKQFvD0q_6e_c37WbpDBNUVn',
  },
  {
    name: 'Marcus Thorne',
    role: 'Senior Anthropologist',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjOGtWAIeXPRRUSKSYJK26lRe6ZW5mTecWweoS_XTELujzYjK6zvQfihaxeASTaGXRysMdVbKYCZaV5ohYxGh7ns878BTd0XkTqRDvxuFWzes5EcfFutWcvpApGcbAfYOVskOYc7IdHXAdZ7jJyftwmAkKuMbq-r91KHupS4fOWN_EFfjujGyTHTTVfNVryQxHBoOVacmrMV4238eEV1askeSRkyJ4g0h8RFGPCISnyaJWOOmrBDfU5x26f1ZBoBxOVdyiioZoU6TE',
  },
]

const MEMBER_DELAYS = ['80', '200', '360']

function Team() {
  return (
    <section className="team">
      <div className="team__inner">
        <div className="team__quote-wrap" data-reveal="fade">
          <blockquote className="team__quote">
            "We believe the most valuable data points occur in the silence between actions."
          </blockquote>
          <div className="team__quote-line" aria-hidden="true" />
          <p className="team__quote-body">
            Methodic is a boutique research collective founded on the principle of
            methodological rigor. We don't just find answers; we find the right questions
            for the world's most ambitious design teams.
          </p>
        </div>
        <div className="team__grid">
          {MEMBERS.map((m, i) => (
            <div className="team-card" key={m.name} data-reveal="up" data-delay={MEMBER_DELAYS[i]}>
              <div className="team-card__portrait">
                <img src={m.img} alt={m.name} className="team-card__img" />
              </div>
              <div className="team-card__info">
                <h6 className="team-card__name">{m.name}</h6>
                <span className="team-card__role">{m.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────
   ContactSection
───────────────────────────────────── */

function ContactSection() {
  const [form, setForm] = useState({ name: '', org: '', details: '' })

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = (e) => e.preventDefault()

  return (
    <section className="contact">
      <div className="contact__inner">
        <div className="contact__header" data-reveal="up">
          <h2 className="contact__title">Initiate a Consultation</h2>
          <p className="contact__desc">
            Tell us about your research challenges. We typically respond within 24 hours
            with a preliminary perspective on engagement.
          </p>
        </div>
        <form className="contact__form" onSubmit={handleSubmit} data-reveal="up" data-delay="120">
          <div className="contact__row">
            <div className="contact__field">
              <label className="contact__label" htmlFor="name">Full Name</label>
              <input id="name" name="name" type="text" className="contact__input"
                placeholder="E. Vance" value={form.name} onChange={handleChange} />
            </div>
            <div className="contact__field">
              <label className="contact__label" htmlFor="org">Organization</label>
              <input id="org" name="org" type="text" className="contact__input"
                placeholder="Acme Corp" value={form.org} onChange={handleChange} />
            </div>
          </div>
          <div className="contact__field">
            <label className="contact__label" htmlFor="details">Inquiry Details</label>
            <textarea id="details" name="details" className="contact__input contact__textarea"
              placeholder="Brief description of project scope..." rows={3}
              value={form.details} onChange={handleChange} />
          </div>
          <div className="contact__submit-wrap">
            <button type="submit" className="contact__submit">Send Inquiry</button>
          </div>
        </form>
      </div>
    </section>
  )
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
   LandingPage
───────────────────────────────────── */

export default function LandingPage() {
  useReveal()

  return (
    <div className="app">
      <ScrollProgress />
      <Navbar />
      <main className="main">
        <Hero />
        <Capabilities />
        <SelectedEvidence />
        <MethodicCycle />
        <Team />
        <ContactSection />
      </main>
      <Footer />
    </div>
  )
}
