import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AboutFounder from './AboutFounder.jsx'
import ProjectDetail from './ProjectDetail.jsx'

function AboutOnly() {
  const [theme, setTheme] = useState(() => localStorage.getItem('n-theme') || 'dark')
  const [caseId, setCaseId] = useState(null)

  useEffect(() => { localStorage.setItem('n-theme', theme) }, [theme])

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))

  if (caseId) {
    return (
      <ProjectDetail
        caseId={caseId}
        onBack={() => setCaseId(null)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    )
  }

  const onNavigate = (page, id) => {
    if (page === 'project') setCaseId(id)
  }
  return <AboutFounder theme={theme} onNavigate={onNavigate} />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AboutOnly />
  </StrictMode>,
)
