import { useState, useEffect } from 'react'
import LandingPage2 from './LandingPage2'
import ProjectDetail from './ProjectDetail'
import AboutFounder from './AboutFounder'

function locationFromUrl() {
  const path = window.location.pathname
  const match = path.match(/^\/case\/([^/]+)\/?$/)
  if (match) return { page: 'project', caseId: match[1] }
  if (/^\/about\/?$/.test(path)) return { page: 'about', caseId: null }
  return { page: 'home', caseId: null }
}

export default function App() {
  const initial = locationFromUrl()
  const [page, setPage]           = useState(initial.page)
  const [activeCaseId, setActiveCaseId] = useState(initial.caseId || 'case-01')
  const [theme, setTheme]         = useState(() => localStorage.getItem('n-theme') || 'dark')

  useEffect(() => { localStorage.setItem('n-theme', theme) }, [theme])

  useEffect(() => {
    const onPopState = () => {
      const loc = locationFromUrl()
      setPage(loc.page)
      if (loc.caseId) setActiveCaseId(loc.caseId)
      window.scrollTo(0, 0)
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))

  const navigate = (p, caseId) => {
    const targetCaseId = caseId || activeCaseId
    if (caseId) setActiveCaseId(caseId)
    setPage(p)
    const path = p === 'project' ? `/case/${targetCaseId}` : '/'
    window.history.pushState({}, '', path)
    window.scrollTo(0, 0)
  }

  if (page === 'project') {
    return (
      <ProjectDetail
        caseId={activeCaseId}
        onBack={() => navigate('home')}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    )
  }
  if (page === 'about') {
    return <AboutFounder theme={theme} onToggleTheme={toggleTheme} onNavigate={navigate} />
  }
  return <LandingPage2 onNavigate={navigate} theme={theme} onToggleTheme={toggleTheme} />
}
