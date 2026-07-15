import { useState } from 'react'
import { registerUser } from '../api'
import ThemeToggle from '../components/ThemeToggle'

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
)
const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
)
const CompassIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
)
const LayersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
)
const CodeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
)

const TECH_MAP = {
  'Dasturlash': {
    'Frontend': ['HTML/CSS', 'JavaScript', 'React', 'Next.js', 'TypeScript'],
    'Backend': ['Python', 'Node.js', 'FastAPI'],
  },
  'Microsoft dasturlari': {
    '_default': ['Word', 'Excel', 'Canva'],
  },
}

function RegisterPage({ onNavigate }) {
  const [form, setForm] = useState({ fullname: '', phone: '', direction: '', soha: '', technology: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  const set = (key, val) => {
    const next = { ...form, [key]: val }
    // Cascading reset
    if (key === 'direction') {
      next.soha = ''
      next.technology = ''
    }
    if (key === 'soha') {
      next.technology = ''
    }
    setForm(next)
    setErrors(e => ({ ...e, [key]: '' }))
  }

  const formatPhone = (v) => {
    const digits = v.replace(/\D/g, '').slice(0, 9)
    if (digits.length <= 2) return digits
    if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`
    if (digits.length <= 7) return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`
    return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7)}`
  }

  const showSoha = form.direction === 'Dasturlash'
  const techOptions = form.direction === 'Microsoft dasturlari'
    ? TECH_MAP['Microsoft dasturlari']['_default']
    : (form.soha && TECH_MAP['Dasturlash']?.[form.soha]) || []

  const validate = () => {
    const e = {}
    if (!form.fullname.trim() || form.fullname.trim().length < 2) e.fullname = "Ism familiya kiriting"
    if (form.phone.replace(/\s/g, '').length < 9) e.phone = "To'liq raqam kiriting"
    if (!form.direction) e.direction = "Yo'nalish tanlang"
    if (showSoha && !form.soha) e.soha = "Soha tanlang"
    if (!form.technology) e.technology = "Texnologiya tanlang"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true); setError('')
    try {
      const data = {
        fullname: form.fullname.trim(),
        phone: '998' + form.phone.replace(/\s/g, ''),
        direction: form.direction,
        soha: form.direction === 'Dasturlash' ? form.soha : null,
        technology: form.technology,
      }
      await registerUser(data)
      setShowSuccess(true)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  if (showSuccess) {
    return (
      <div className="auth-page">
        <div className="floating-orbs"><div className="orb orb-1"/><div className="orb orb-2"/><div className="orb orb-3"/></div>
        <div className="auth-card" style={{animation: 'slideUp 0.6s ease', textAlign: 'center'}}>
          <div style={{fontSize: '64px', marginBottom: '16px'}}>✅</div>
          <h2 style={{color: 'var(--text-primary)', marginBottom: '12px', fontSize: '24px'}}>Muvaffaqiyatli!</h2>
          <p style={{color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.6'}}>
            Ro'yxatdan o'tdingiz! Endi Telegram botga <b style={{color: 'var(--accent-cyan)'}}>/start</b> yozing va telefon raqamingizni yuboring.
            <br/>Sizga <b style={{color: 'var(--accent-cyan)'}}>tasdiqlash kodi</b> yuboriladi.
          </p>
          <div style={{background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '16px', marginBottom: '24px'}}>
            <p style={{color: 'var(--text-muted)', fontSize: '14px', margin: 0}}>
              📱 Bot → /start → Raqam yuboring → Kod oling → Saytda kiriting
            </p>
          </div>
          <button className="gradient-btn" onClick={onNavigate} style={{width: '100%'}}>
            🚀 Tizimga kirish
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="floating-orbs"><div className="orb orb-1"/><div className="orb orb-2"/><div className="orb orb-3"/></div>
      <div className="auth-card" style={{animation: 'slideUp 0.6s ease'}}>
        <div style={{position:'absolute',top:'16px',right:'16px'}}><ThemeToggle /></div>
        <div className="auth-logo">
          <div className="logo-icon">🎓</div>
          <h1 className="auth-title">Ro'yxatdan O'tish</h1>
          <p className="auth-subtitle">O'quv Markazi platformasi</p>
        </div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <div className="form-section">
          {/* Ism Familiya */}
          <div className="form-group">
            <label>Ism Familiya</label>
            <div className="input-wrapper">
              <span className="input-icon"><UserIcon /></span>
              <input type="text" placeholder="Ism Familiya" value={form.fullname}
                onChange={e => set('fullname', e.target.value)} />
            </div>
            {errors.fullname && <span className="field-error">{errors.fullname}</span>}
          </div>

          {/* Telefon */}
          <div className="form-group">
            <label>Telefon raqam</label>
            <div className="input-wrapper">
              <span className="input-icon"><PhoneIcon /></span>
              <span className="phone-prefix">+998</span>
              <input type="tel" placeholder="90 123 45 67" value={form.phone}
                onChange={e => set('phone', formatPhone(e.target.value))} className="input-with-prefix" />
            </div>
            {errors.phone && <span className="field-error">{errors.phone}</span>}
          </div>

          {/* Yo'nalish */}
          <div className="form-group">
            <label>Yo'nalish</label>
            <div className="input-wrapper">
              <span className="input-icon"><CompassIcon /></span>
              <select value={form.direction} onChange={e => set('direction', e.target.value)}>
                <option value="">Tanlang...</option>
                <option value="Dasturlash">💻 Dasturlash</option>
                <option value="Microsoft dasturlari">📊 Microsoft dasturlari</option>
              </select>
            </div>
            {errors.direction && <span className="field-error">{errors.direction}</span>}
          </div>

          {/* Soha — faqat Dasturlash uchun */}
          {showSoha && (
            <div className="form-group" style={{animation: 'slideUp 0.3s ease'}}>
              <label>Soha</label>
              <div className="input-wrapper">
                <span className="input-icon"><LayersIcon /></span>
                <select value={form.soha} onChange={e => set('soha', e.target.value)}>
                  <option value="">Tanlang...</option>
                  <option value="Frontend">🎨 Frontend</option>
                  <option value="Backend">⚙️ Backend</option>
                </select>
              </div>
              {errors.soha && <span className="field-error">{errors.soha}</span>}
            </div>
          )}

          {/* Texnologiya */}
          {techOptions.length > 0 && (
            <div className="form-group" style={{animation: 'slideUp 0.3s ease'}}>
              <label>Texnologiya</label>
              <div className="input-wrapper">
                <span className="input-icon"><CodeIcon /></span>
                <select value={form.technology} onChange={e => set('technology', e.target.value)}>
                  <option value="">Tanlang...</option>
                  {techOptions.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              {errors.technology && <span className="field-error">{errors.technology}</span>}
            </div>
          )}

          <button className="gradient-btn" onClick={handleSubmit} disabled={loading} style={{marginTop: '8px'}}>
            {loading ? <span className="spinner" /> : "✨ Ro'yxatdan o'tish"}
          </button>
        </div>

        <div className="auth-footer">
          <span>Hisobingiz bormi? </span>
          <button className="link-btn accent" onClick={onNavigate}>Tizimga kiring →</button>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
