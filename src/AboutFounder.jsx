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
    minHeight: '100vh',
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
    fontSize: 10.35,
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
    fontSize: 'clamp(37.62px, 3.2vw, 63.95px)',
    fontWeight: 400,
    lineHeight: 1,
    letterSpacing: '-0.02em',
    color: '#efefef',
    marginBottom: '-10px',
  },
  role: {
    fontFamily: 'var(--font-serif)',
    fontStyle: 'normal',
    fontSize: 'clamp(16.93px, 1.88vw, 20.69px)',
    fontWeight: 400,
    letterSpacing: '-0.01em',
    color: '#aaaaaa',
  },
  lead: {
    fontSize: 14.11,
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
    fontSize: 12.23,
    color: 'rgba(239, 239, 239, 0.75)',
    whiteSpace: 'nowrap',
  },
  credIcon: {
    fontSize: 15.05,
    color: '#aaaaaa',
  },
  scroll: (hovered) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    marginTop: 28,
    fontSize: 12.23,
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

        {/* <a href="#selected-work" style={heroStyle.scroll(scrollHover)}
          onClick={(e) => { e.preventDefault(); scrollToId('selected-work') }}
          onMouseEnter={() => setScrollHover(true)}
          onMouseLeave={() => setScrollHover(false)}
          data-reveal="fade" data-delay="260">
          Selected work <span aria-hidden="true" style={heroStyle.scrollArrow(scrollHover)}>↓</span>
        </a> */}
      </div>
    </section>
  )
}

const videoStyle = {
  section: {
    padding: '120px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
  inner: {
    maxWidth: 'var(--max)',
    margin: '0 auto',
    padding: '0 var(--pad)',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 56,
    boxSizing: 'border-box',
  },
  textCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 18,
    flex: '1 1 360px',
    maxWidth: 480,
  },
  eyebrow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: 10.35,
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
    fontSize: 'clamp(28.21px, 3.2vw, 39.5px)',
    fontWeight: 400,
    lineHeight: 1.15,
    letterSpacing: '-0.02em',
    color: '#efefef',
    margin: 0,
  },
  description: {
    fontSize: 14.11,
    lineHeight: 1.72,
    color: '#7a7979',
    margin: 0,
  },
  watchLink: (hovered) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    fontSize: 12.23,
    fontWeight: 500,
    color: '#efefef',
    textDecoration: 'underline',
    textUnderlineOffset: '4px',
    textDecorationColor: hovered ? '#efefef' : '#333333',
    cursor: 'pointer',
  }),
  watchArrow: (hovered) => ({
    display: 'inline-block',
    transition: 'transform 0.25s var(--ease)',
    transform: hovered ? 'translateX(3px)' : 'none',
  }),
  frameWrap: {
    flex: '1 1 420px',
    maxWidth: 560,
    width: '100%',
  },
  frame: {
    position: 'relative',
    display: 'block',
    width: '100%',
    aspectRatio: '16 / 9',
    borderRadius: 20,
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    background: 'rgba(255, 255, 255, 0.08)',
  },
  thumb: (hovered) => ({
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
    transform: hovered ? 'scale(1.04)' : 'scale(1)',
    transition: 'transform 0.5s var(--ease)',
  }),
  play: (hovered) => ({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: hovered ? 'translate(-50%, -50%) scale(1.08)' : 'translate(-50%, -50%) scale(1)',
    width: 72,
    height: 72,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: hovered ? '#efefef' : 'rgba(0, 0, 0, 0.55)',
    border: '1px solid rgba(255, 255, 255, 0.35)',
    color: hovered ? '#0a0a0a' : '#fff',
    transition: 'transform 0.3s var(--ease), background 0.3s var(--ease), color 0.3s var(--ease)',
  }),
}

function Video() {
  const [frameHover, setFrameHover] = useState(false)

  return (
    <section style={videoStyle.section}>
      <div style={videoStyle.inner}>
        <div style={videoStyle.textCol} data-reveal="up">
          <p style={videoStyle.eyebrow}>
            <span style={videoStyle.eyebrowDash} />
            Watch
          </p>
          <h2 style={videoStyle.title}>See the practice in motion.</h2>
          <p style={videoStyle.description}>
            Turning Feedback into Actionable Insight explores how to transform feedback into
            meaningful actions that drive improvement and growth. This talk will share practical
            approaches for identifying key insights, prioritizing opportunities, and turning
            feedback into clear, effective next steps.
          </p>
          <a
            href="https://youtu.be/w-OYUx1EWHY?t=10003"
            target="_blank"
            rel="noopener noreferrer"
            style={videoStyle.watchLink(frameHover)}
            onMouseEnter={() => setFrameHover(true)}
            onMouseLeave={() => setFrameHover(false)}
          >
            Watch on YouTube <span aria-hidden="true" style={videoStyle.watchArrow(frameHover)}>→</span>
          </a>
        </div>

        <div style={videoStyle.frameWrap} data-reveal="scale" data-delay="80">
          <a
            style={videoStyle.frame}
            href="https://youtu.be/w-OYUx1EWHY?t=10003"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Watch the video on YouTube"
            onMouseEnter={() => setFrameHover(true)}
            onMouseLeave={() => setFrameHover(false)}
          >
            <img
              style={videoStyle.thumb(frameHover)}
              src="https://img.youtube.com/vi/w-OYUx1EWHY/maxresdefault.jpg"
              alt=""
            />
            <span style={videoStyle.play(frameHover)}>
              <span className="material-symbols-outlined">play_arrow</span>
            </span>
          </a>
        </div>
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
        <Video />
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
