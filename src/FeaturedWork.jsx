import { useState, useEffect } from 'react'
import { ref as dbRef, onValue } from 'firebase/database'
import { db } from './firebase'

function toArr(v) {
  if (!v) return []
  return Array.isArray(v) ? v : Object.values(v)
}

export function useAllStudies() {
  const [studies, setStudies] = useState(undefined)
  useEffect(() => {
    return onValue(
      dbRef(db, 'UXP'),
      (snap) => {
        const val = snap.val()
        if (val) {
          setStudies(
            Object.entries(val)
              .filter(([, data]) => !data.hidden)
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

/* ─── Featured Work ─── */
export function FeaturedWork({ studies, onNavigate, isAdmin, onAddProject, onDeleteProject }) {
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [showAll, setShowAll] = useState(true)

  async function handleDeleteConfirm(id) {
    await onDeleteProject?.(id)
    setConfirmDelete(null)
  }

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
  }, [studies, showAll])

  return (
    <section className="n-work" id="n-work">
      <div className="n-inner">
        <div className="n-work__header" data-reveal="up">
          <div>
            <p className="n-eyebrow">Featured work between ©2023–25</p>
            <h2 className="n-section-title">Selected projects.</h2>
          </div>
          <div className="n-work__header-right">
            {studies && studies.length > 3 && (
              <a href="#" className="n-text-link" onClick={(e) => { e.preventDefault(); setShowAll((v) => !v) }}>
                {showAll ? 'Show fewer projects' : 'Discover all projects'} <span>→</span>
              </a>
            )}
            {isAdmin && (
              <button className="n-btn n-btn--sm n-btn--outline" onClick={onAddProject}>
                <span className="material-symbols-outlined" style={{ fontSize: 15 }}>add</span>
                Add Project
              </button>
            )}
          </div>
        </div>

        {studies === undefined && <p className="n-placeholder">Loading case studies…</p>}
        {studies?.length === 0  && <p className="n-placeholder">No case studies yet.</p>}

        {studies && studies.length > 0 && (
          <div className="n-work__grid">
            {(showAll ? studies : studies.slice(0, 3)).map((s, i) => (
              <div key={s.id} className="n-wcard"
                data-reveal="up" data-delay={i > 0 ? String(i * 80) : undefined}
                onClick={() => confirmDelete !== s.id && onNavigate?.('project', s.id)}>
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
                {isAdmin && (
                  <button
                    className="n-wcard__delete"
                    aria-label="Delete project"
                    onClick={e => { e.stopPropagation(); setConfirmDelete(s.id) }}>
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                )}
                {isAdmin && confirmDelete === s.id && (
                  <div className="n-wcard__del-confirm" onClick={e => e.stopPropagation()}>
                    <span>Delete this project?</span>
                    <div className="n-wcard__del-actions">
                      <button className="n-wcard__del-btn n-wcard__del-btn--cancel"
                        onClick={() => setConfirmDelete(null)}>Cancel</button>
                      <button className="n-wcard__del-btn n-wcard__del-btn--confirm"
                        onClick={() => handleDeleteConfirm(s.id)}>Delete</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
