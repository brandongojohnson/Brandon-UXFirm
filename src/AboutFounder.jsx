import { useEffect } from 'react'
import './landing2.css'
import './AboutFounder.css'
import headshotImg from './headshot.jpg'

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

const BACKGROUND = [
  { year: '2023 — Present', role: 'Founder & Principal Researcher', org: 'Methodic Research' },
  { year: '2020 — 2023',    role: 'Head of Research',               org: 'Series B Fintech Platform' },
  { year: '2017 — 2020',    role: 'Senior UX Researcher',           org: 'Enterprise SaaS' },
  { year: '2014 — 2017',    role: 'UX Researcher',                  org: 'Consumer Fintech Startup' },
]

const VALUES = [
  {
    icon: 'balance',
    title: 'Rigor over speed',
    desc: 'A fast answer that is wrong costs more than a careful one that takes an extra week. Methods are chosen for validity first.',
  },
  {
    icon: 'handshake',
    title: 'No hand-offs',
    desc: 'The person who plans the study runs the sessions and writes the synthesis. Insight never passes through a game of telephone.',
  },
  {
    icon: 'fact_check',
    title: 'Evidence over opinion',
    desc: 'Every recommendation traces back to something a real user said or did — never a hunch dressed up as a finding.',
  },
]

function Header({ theme, onToggleTheme }) {
  return (
    <header className="af-header">
      <div className="af-header__inner">
        <span className="af-header__logo">Methodic<sup className="n-sup">®</sup></span>
        <button className="n-theme-toggle" onClick={onToggleTheme} aria-label="Toggle light/dark mode">
          <span className="material-symbols-outlined">{theme === 'light' ? 'dark_mode' : 'light_mode'}</span>
        </button>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="af-hero">
      <div className="n-inner af-hero__inner">
        <div className="af-hero__text" data-reveal="up">
          <p className="n-eyebrow">About the Founder</p>
          <h1 className="af-hero__title">Research is a discipline, not a deliverable.</h1>
          <p className="af-hero__sub">
            I started Methodic after a decade of watching good research arrive too late to change
            anything. This is the practice I wished existed when I was the one waiting on it.
          </p>
        </div>
        <div className="af-hero__photo-wrap" data-reveal="scale" data-delay="120">
          <img src={headshotImg} alt="Founder of Methodic Research" className="af-hero__photo" />
        </div>
      </div>
    </section>
  )
}

function Bio() {
  return (
    <section className="af-bio">
      <div className="n-inner af-bio__inner">
        <div className="af-bio__label" data-reveal="fade">
          <span className="material-symbols-outlined">history_edu</span>
          The Story
        </div>
        <div className="af-bio__body">
          <p data-reveal="up">
            I spent my first ten years in research on the inside — as an in-house researcher at a
            consumer fintech startup, then an enterprise SaaS company, then as Head of Research at a
            Series B platform racing toward its next round. In every one of those seats, I watched
            the same pattern repeat: leadership needed evidence, research needed weeks, and by the
            time the report was ready the decision had already been made without it.
          </p>
          <p data-reveal="up" data-delay="80">
            Methodic exists to close that gap. There are no account managers here, no junior
            researchers running sessions I never see the recordings of. I plan every study, run the
            fieldwork, and write the synthesis myself — because insight degrades every time it
            changes hands.
          </p>
          <blockquote className="af-bio__quote" data-reveal="up" data-delay="140">
            "Good research doesn't tell people what they want to hear. It tells them what's true —
            early enough to act on it."
          </blockquote>
          <p data-reveal="up" data-delay="200">
            Today the practice works across consumer, fintech, and B2B platforms, on engagements that
            range from a two-week usability sprint to a full quarter embedded with a product team.
            The scope changes; the method doesn't.
          </p>
        </div>
      </div>
    </section>
  )
}

function Background() {
  return (
    <section className="af-track">
      <div className="n-inner">
        <div className="af-track__header" data-reveal="up">
          <p className="n-eyebrow">Background</p>
          <h2 className="n-section-title">A decade in the room.</h2>
        </div>
        <div className="af-track__list" data-reveal="up" data-delay="80">
          {BACKGROUND.map((b) => (
            <div key={b.year} className="af-track__row">
              <span className="af-track__year">{b.year}</span>
              <div className="af-track__role">
                <h3>{b.role}</h3>
                <p>{b.org}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Values() {
  return (
    <section className="af-values">
      <div className="n-inner">
        <div className="af-values__header" data-reveal="up">
          <p className="n-eyebrow">How I Work</p>
          <h2 className="n-section-title">Three things that don't move.</h2>
        </div>
        <div className="af-values__grid" data-reveal="up" data-delay="80">
          {VALUES.map((v) => (
            <div key={v.title} className="n-cap-card">
              <span className="material-symbols-outlined n-cap-card__icon">{v.icon}</span>
              <h3 className="n-cap-card__title">{v.title}</h3>
              <p className="n-cap-card__desc">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ContactStrip() {
  return (
    <section className="af-contact">
      <div className="n-inner af-contact__inner" data-reveal="fade">
        <h2 className="af-contact__title">Have a research problem worth solving?</h2>
        <a className="n-btn n-btn--primary n-btn--lg" href="mailto:hello@methodicresearch.com">
          hello@methodicresearch.com
        </a>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="af-footer">
      <div className="n-inner af-footer__inner">
        <span className="af-footer__logo">Methodic<sup className="n-sup">®</sup></span>
        <p className="af-footer__copy">© 2025 Methodic Research Ltd. London / New York.</p>
      </div>
    </footer>
  )
}

export default function AboutFounder({ theme, onToggleTheme }) {
  useReveal()
  return (
    <div className={`n${theme === 'light' ? ' n--light' : ''}`}>
      <Header theme={theme} onToggleTheme={onToggleTheme} />
      <main>
        <Hero />
        <Bio />
        <Background />
        <Values />
        <ContactStrip />
      </main>
      <Footer />
    </div>
  )
}
