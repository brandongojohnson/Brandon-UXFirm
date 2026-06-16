import { useState, useEffect } from 'react'
import LandingPage2 from './LandingPage2'
import ProjectDetail from './ProjectDetail'

export default function App() {
  const [page, setPage]           = useState('home')
  const [activeCaseId, setActiveCaseId] = useState('case-01')
  const [theme, setTheme]         = useState(() => localStorage.getItem('n-theme') || 'light')

  useEffect(() => { localStorage.setItem('n-theme', theme) }, [theme])

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))

  const navigate = (p, caseId) => {
    if (caseId) setActiveCaseId(caseId)
    setPage(p)
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
  return <LandingPage2 onNavigate={navigate} theme={theme} onToggleTheme={toggleTheme} />
}
