import { useState } from 'react'
import { registerUser } from '../api'

/* ── Inline SVG Icons ── */
const UserIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
)
const PhoneIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
)
const CompassIcon = () => (
  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
)
const BriefcaseIcon = () => (
  <svg viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>
)
const CodeIcon = () => (
  <svg viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
)

/* ── Technology options per direction ── */
const TECH_MAP = {
  'Frontend': ['HTML/CSS', 'JavaScript', 'React', 'Vue.js', 'Angular', 'Next.js', 'TypeScript'],
  'Backend': ['Python', 'Node.js', 'Java', 'Go', 'Django', 'FastAPI', 'Express.js'],
  'Mobile': ['Flutter', 'React Native', 'Swift', 'Kotlin'],
  'Full Stack': ['MERN', 'MEAN', 'Python+React', 'Java+Angular'],
  'Data Science': ['Python', 'R', 'TensorFlow', 'PyTorch'],
  'UI/UX Design': ['Figma', 'Adobe XD', 'Sketch'],
}

const DIRECTIONS = Object.keys(TECH_MAP)

const SUBJECTS = [
  'Dasturlash',
  'Web Development',
  'Mobile Development',
  'Data Science',
  'Cyber Security',
  'DevOps',
]

function RegisterPage({ onNavigate }) {
  const [form, setForm] = useState({
    fullname: '',
    phone: '',
    direction: '',
    subject: '',
    technology: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  const formatPhone = (raw) => {
    const digits = raw.replace(/\D/g, '').slice(0, 9)
    if (digits.length <= 2) return digits
    if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`
    if (digits.length <= 7) return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`
    return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7)}`
  }

  const handleChange = (field, value) => {
    if (field === 'phone') {
      value = formatPhone(value)
    }
    setForm(prev => {
      const next = { ...prev, [field]: value }
      // Reset technology when direction changes
      if (field === 'direction') next.technology = ''
      return next
    })
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
    setError('')
  }

  const validate = () => {
    const newErrors = {}
    if (!form.fullname.trim() || form.fullname.trim().length < 2) {
      newErrors.fullname = "Ism familiya kamida 2 ta belgidan iborat bo'lishi kerak"
    }
    const phoneDigits = form.phone.replace(/\D/g, '')
    if (phoneDigits.length !== 9) {
      newErrors.phone = "Telefon raqam 9 ta raqamdan iborat bo'lishi kerak"
    }
    if (!form.direction) {
      newErrors.direction = "Yo'nalishni tanlang"
    }
    if (!form.subject) {
      newErrors.subject = "Sohani tanlang"
    }
    if (!form.technology) {
      newErrors.technology = "Texnologiyani tanlang"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!validate()) return

    setLoading(true)
    try {
      const phoneDigits = form.phone.replace(/\D/g, '')
      await registerUser({
        fullname: form.fullname.trim(),
        phone: `+998${phoneDigits}`,
        direction: form.direction,
        subject: form.subject,
        technology: form.technology,
      })
      setShowSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const techOptions = form.direction ? (TECH_MAP[form.direction] || []) : []

  return (
    <div className="auth-page">
      {/* Success Modal */}
      {showSuccess && (
        <div className="success-overlay">
          <div className="success-modal">
            <div className="success-icon">✅</div>
            <h2 className="gradient-text">Muvaffaqiyatli!</h2>
            <p>
              Ro'yxatdan o'tish yakunlandi. Telegram botga kiring va telefon raqamingizni yuboring.
              <br />
              <strong style={{ color: 'var(--accent-cyan)' }}>Sizga tasdiqlash kodi yuboriladi.</strong>
            </p>
            <button
              className="btn btn-primary btn-full"
              onClick={onNavigate}
            >
              Tizimga kirish →
            </button>
          </div>
        </div>
      )}

      <div className="glass-card auth-card">
        {/* Brand */}
        <div className="auth-brand">
          <div className="auth-brand-icon">📝</div>
          <h1 className="gradient-text">Ro'yxatdan O'tish</h1>
          <p>O'quv Markaziga xush kelibsiz</p>
        </div>

        {/* Global Error */}
        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Fullname */}
          <div className="form-group">
            <label className="form-label">Ism Familiya</label>
            <div className="input-wrapper">
              <input
                type="text"
                className="form-input"
                placeholder="Ismingiz va familiyangiz"
                value={form.fullname}
                onChange={(e) => handleChange('fullname', e.target.value)}
                autoFocus
              />
              <span className="input-icon"><UserIcon /></span>
            </div>
            {errors.fullname && <div className="form-error">{errors.fullname}</div>}
          </div>

          {/* Phone */}
          <div className="form-group">
            <label className="form-label">Telefon raqam</label>
            <div className="phone-input-group">
              <div className="phone-prefix">+998</div>
              <div className="input-wrapper" style={{ flex: 1 }}>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="XX XXX XX XX"
                  value={form.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  autoComplete="tel"
                />
                <span className="input-icon" style={{ left: 'auto', right: '14px' }}>
                  <PhoneIcon />
                </span>
              </div>
            </div>
            {errors.phone && <div className="form-error">{errors.phone}</div>}
          </div>

          {/* Direction */}
          <div className="form-group">
            <label className="form-label">Yo'nalish</label>
            <div className="input-wrapper">
              <select
                className="form-select"
                value={form.direction}
                onChange={(e) => handleChange('direction', e.target.value)}
              >
                <option value="">Yo'nalishni tanlang</option>
                {DIRECTIONS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <span className="input-icon"><CompassIcon /></span>
            </div>
            {errors.direction && <div className="form-error">{errors.direction}</div>}
          </div>

          {/* Subject */}
          <div className="form-group">
            <label className="form-label">Soha</label>
            <div className="input-wrapper">
              <select
                className="form-select"
                value={form.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
              >
                <option value="">Sohani tanlang</option>
                {SUBJECTS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <span className="input-icon"><BriefcaseIcon /></span>
            </div>
            {errors.subject && <div className="form-error">{errors.subject}</div>}
          </div>

          {/* Technology (depends on direction) */}
          <div className="form-group">
            <label className="form-label">Texnologiya</label>
            <div className="input-wrapper">
              <select
                className="form-select"
                value={form.technology}
                onChange={(e) => handleChange('technology', e.target.value)}
                disabled={!form.direction}
              >
                <option value="">
                  {form.direction ? 'Texnologiyani tanlang' : "Avval yo'nalishni tanlang"}
                </option>
                {techOptions.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <span className="input-icon"><CodeIcon /></span>
            </div>
            {errors.technology && <div className="form-error">{errors.technology}</div>}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? <span className="spinner" /> : null}
            Ro'yxatdan o'tish
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          Hisobingiz bormi?{' '}
          <button className="link-btn" onClick={onNavigate} style={{ fontWeight: 600 }}>
            Tizimga kiring
          </button>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
