import { useState } from 'react'
import LandingPage from './LandingPage'
import ProjectDetail from './ProjectDetail'

export default function App() {
  const [page, setPage] = useState('home')

  const navigate = (p) => {
    setPage(p)
    window.scrollTo(0, 0)
  }

  if (page === 'project') {
    return <ProjectDetail onBack={() => navigate('home')} />
  }
  return <LandingPage onNavigate={navigate} />
}
