import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { ref as dbRef, remove } from 'firebase/database'
import { auth, db } from './firebase'
import ProjectEditor from './ProjectEditor'
import { useAllStudies, FeaturedWork } from './FeaturedWork'
import './landing2.css'
import './AboutFounder.css'

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

function Hero() {
  return (
    <section className="af-hero--plain">
      <div className="n-inner af-hero__inner">
        <p className="n-eyebrow af-hero__eyebrow" data-reveal="fade">About</p>

        <h1 className="af-hero__title" data-reveal="up" data-delay="60">
          Brandon<br />Johnson
        </h1>

        <p className="af-hero__role" data-reveal="up" data-delay="120">
          User Experience Researcher &amp; Consultant
        </p>

        <p className="af-hero__lead" data-reveal="up" data-delay="180">
          A background in human-centered design, research strategy, and data-informed
          decision-making. Throughout his career, Brandon has partnered with cross-functional
          teams to uncover user needs, translate research findings into actionable insights, and
          drive meaningful product and organizational improvements.
        </p>

        <div className="af-hero__creds" data-reveal="up" data-delay="220">
          <div className="af-hero__cred">
            <span className="material-symbols-outlined">school</span>
            B.S. Computer Science — Rollins College
          </div>
          <div className="af-hero__cred">
            <span className="material-symbols-outlined">school</span>
            M.S. Human-Computer Interaction — DePaul University
          </div>
        </div>

        <a className="af-hero__scroll n-text-link" href="#n-work" data-reveal="fade" data-delay="260">
          Selected work <span aria-hidden="true">↓</span>
        </a>
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
