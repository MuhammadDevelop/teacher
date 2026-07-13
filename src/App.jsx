import { useState, useEffect } from 'react'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import './App.css'

function App() {
  const [page, setPage] = useState('login')
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    const hash = window.location.hash.slice(1) || 'login'
    setPage(hash)

    const onHashChange = () => setPage(window.location.hash.slice(1) || 'login')
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    if (token) {
      const stored = localStorage.getItem('user')
      if (stored) setUser(JSON.parse(stored))
    }
  }, [token])

  const handleLogin = (tokenData, userData) => {
    localStorage.setItem('token', tokenData)
    localStorage.setItem('user', JSON.stringify(userData))
    setToken(tokenData)
    setUser(userData)
    window.location.hash = 'dashboard'
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
    window.location.hash = 'login'
  }

  if (token && user) {
    return <DashboardPage user={user} onLogout={handleLogout} />
  }

  if (page === 'register') {
    return <RegisterPage onNavigate={() => (window.location.hash = 'login')} />
  }

  return <LoginPage onLogin={handleLogin} onNavigate={() => (window.location.hash = 'register')} />
}

export default App
