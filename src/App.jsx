import { useState } from 'react'
import LandingPage from './LandingPage'
import LandingPage2 from './LandingPage2'
import ProjectDetail from './ProjectDetail'

export default function App() {
  const [page, setPage]           = useState('home')
  const [activeCaseId, setActiveCaseId] = useState('case-01')

  const navigate = (p, caseId) => {
    if (caseId) setActiveCaseId(caseId)
    setPage(p)
    window.scrollTo(0, 0)
  }

  if (page === 'project') {
    return <ProjectDetail caseId={activeCaseId} onBack={() => navigate('home')} />
  }
  if (page === 'alt') {
    return <LandingPage2 onNavigate={navigate} onSwitchDesign={() => navigate('home')} />
  }
  return <LandingPage onNavigate={navigate} onSwitchDesign={() => navigate('alt')} />
}
