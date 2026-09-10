import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { ref as dbRef, remove } from 'firebase/database'
import { auth, db } from './firebase'
import ProjectEditor from './ProjectEditor'
import { useAllStudies, FeaturedWork } from './FeaturedWork'
import './landing2.css'
import './AboutFounder.css'

function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

function useHashScroll(dep) {
  useEffect(() => {
    if (!window.location.hash) return
    const id = window.location.hash.slice(1)
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView())
  }, [dep])
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

const heroStyle = {
  section: {
    minHeight: '86vh',
    display: 'flex',
    alignItems: 'center',
    padding: '160px 0 96px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
  inner: {
    maxWidth: 'var(--max)',
    margin: '0 auto',
    padding: '0 var(--pad)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 22,
    width: '100%',
    boxSizing: 'border-box',
  },
  eyebrow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: '#aaaaaa',
  },
  eyebrowDash: {
    width: 28,
    height: 1,
    background: '#efefef',
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: 'clamp(40px, 3.4vw, 68px)',
    fontWeight: 400,
    lineHeight: 1,
    letterSpacing: '-0.02em',
    color: '#efefef',
    marginBottom: '-10px',
  },
  role: {
    fontFamily: 'var(--font-serif)',
    fontStyle: 'normal',
    fontSize: 'clamp(18px, 2vw, 22px)',
    fontWeight: 400,
    letterSpacing: '-0.01em',
    color: '#aaaaaa',
  },
  lead: {
    fontSize: 15,
    lineHeight: 1.72,
    color: '#7a7979',
    maxWidth: 500,
    marginTop: 4,
  },
  creds: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  cred: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 18px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: 100,
    fontSize: 13,
    color: 'rgba(239, 239, 239, 0.75)',
    whiteSpace: 'nowrap',
  },
  credIcon: {
    fontSize: 16,
    color: '#aaaaaa',
  },
  scroll: (hovered) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    marginTop: 28,
    fontSize: 13,
    fontWeight: 500,
    color: '#efefef',
    textDecoration: 'underline',
    textUnderlineOffset: '4px',
    textDecorationColor: hovered ? '#efefef' : '#333333',
    cursor: 'pointer',
  }),
  scrollArrow: (hovered) => ({
    display: 'inline-block',
    transition: 'transform 0.25s var(--ease)',
    transform: hovered ? 'translateY(3px)' : 'none',
  }),
}

function Hero() {
  const [scrollHover, setScrollHover] = useState(false)

  return (
    <section style={heroStyle.section}>
      <div style={heroStyle.inner}>
        <p style={heroStyle.eyebrow} data-reveal="fade">
          <span style={heroStyle.eyebrowDash} />
          About
        </p>

        <h1 style={heroStyle.title} data-reveal="up" data-delay="60">
          Brandon Johnson, M.S.
        </h1>

        <p style={heroStyle.role} data-reveal="up" data-delay="120">
          User Experience Researcher &amp; Consultant
        </p>

        <p style={heroStyle.lead} data-reveal="up" data-delay="180">
          A background in human-centered design, research strategy, and data-informed
          decision-making. Throughout his career, Brandon has partnered with cross-functional
          teams to uncover user needs, translate research findings into actionable insights, and
          drive meaningful product and organizational improvements.
        </p>

        {/* <div style={heroStyle.creds} data-reveal="up" data-delay="220">
          <div style={heroStyle.cred}>
            <span className="material-symbols-outlined" style={heroStyle.credIcon}>school</span>
            B.S. Computer Science — Rollins College
          </div>
          <div style={heroStyle.cred}>
            <span className="material-symbols-outlined" style={heroStyle.credIcon}>school</span>
            M.S. Human-Computer Interaction — DePaul University
          </div>
        </div> */}

        {/* <a href="#n-work" style={heroStyle.scroll(scrollHover)}
          onClick={(e) => { e.preventDefault(); scrollToId('n-work') }}
          onMouseEnter={() => setScrollHover(true)}
          onMouseLeave={() => setScrollHover(false)}
          data-reveal="fade" data-delay="260">
          Selected work <span aria-hidden="true" style={heroStyle.scrollArrow(scrollHover)}>↓</span>
        </a> */}
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="af-footer">
      <div className="n-inner af-footer__inner">
        <span className="af-footer__logo">Brandon Johnson</span>
        <p className="af-footer__copy">© 2025 Brandon Johnson Research Ltd. London / New York.</p>
      </div>
    </footer>
  )
}

export default function AboutFounder({ theme, onNavigate }) {
  useReveal()
  const studies = useAllStudies()
  useHashScroll(studies)

  const [user, setUser] = useState(null)
  useEffect(() => onAuthStateChanged(auth, setUser), [])
  const isAdmin = !!user

  const [showProjectEditor, setShowProjectEditor] = useState(false)

  return (
    <div className={`n${theme === 'light' ? ' n--light' : ''}`}>
      <main>
        <Hero />
        <FeaturedWork
          studies={studies}
          onNavigate={onNavigate}
          isAdmin={isAdmin}
          onAddProject={() => setShowProjectEditor(true)}
          onDeleteProject={id => remove(dbRef(db, 'UXP/' + id))}
        />
      </main>
      <Footer />
      {showProjectEditor && <ProjectEditor studies={studies} onClose={() => setShowProjectEditor(false)} />}
    </div>
  )
}
