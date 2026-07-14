import { useState, useEffect } from 'react'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import AdminPanel from './pages/AdminPanel'
import StudentPanel from './pages/StudentPanel'
import './App.css'

function App() {
  const [page, setPage] = useState('login')
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    const hash = window.location.hash.slice(1) || 'login'
    setPage(hash)
    const onHash = () => setPage(window.location.hash.slice(1) || 'login')
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    if (token) {
      const stored = localStorage.getItem('user')
      if (stored) setUser(JSON.parse(stored))
    }
  }, [token])

  const handleLogin = (t, u) => {
    localStorage.setItem('token', t)
    localStorage.setItem('user', JSON.stringify(u))
    setToken(t)
    setUser(u)
    window.location.hash = u.role === 'admin' ? 'admin' : 'student'
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
    window.location.hash = 'login'
  }

  if (token && user) {
    if (user.role === 'admin') {
      return <AdminPanel user={user} onLogout={handleLogout} />
    }
    return <StudentPanel user={user} onLogout={handleLogout} />
  }

  if (page === 'register') {
    return <RegisterPage onNavigate={() => window.location.hash = 'login'} />
  }

  return <LoginPage onLogin={handleLogin} onNavigate={() => window.location.hash = 'register'} />
}

export default App
