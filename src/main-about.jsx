import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AboutFounder from './AboutFounder.jsx'

function AboutOnly() {
  const [theme] = useState(() => localStorage.getItem('n-theme') || 'dark')
  const onNavigate = (page, caseId) => {
    if (page === 'project') window.open(`https://methodicinsight.com/case/${caseId}`, '_blank')
  }
  return <AboutFounder theme={theme} onNavigate={onNavigate} />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AboutOnly />
  </StrictMode>,
)
