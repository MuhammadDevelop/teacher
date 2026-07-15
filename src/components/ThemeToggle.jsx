import { useState, useEffect } from 'react'

function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved ? saved === 'dark' : true
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <button className="theme-toggle" onClick={() => setDark(!dark)} title={dark ? "Light mode" : "Dark mode"}>
      <div className="theme-toggle-knob">
        {dark ? '🌙' : '☀️'}
      </div>
    </button>
  )
}

export default ThemeToggle
