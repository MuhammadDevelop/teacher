import { useState, useEffect, useRef, useCallback } from 'react'
import { sendCode, loginUser, adminLogin } from '../api'

/* ── Inline SVG Icons ── */
const PhoneIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
)
const MailIcon = () => (
  <svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>
)
const LockIcon = () => (
  <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
)
const EyeIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
)
const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
)
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
)

function LoginPage({ onLogin, onNavigate }) {
  const [tab, setTab] = useState('student') // 'student' | 'admin'
  const [step, setStep] = useState(1) // 1: phone, 2: code
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)
  const [timer, setTimer] = useState(0)
  const codeRefs = useRef([])
  const timerRef = useRef(null)

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      timerRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [timer])

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000)
      return () => clearTimeout(t)
    }
  }, [toast])

  const formatTimer = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  const formatPhone = (raw) => {
    const digits = raw.replace(/\D/g, '').slice(0, 9)
    if (digits.length <= 2) return digits
    if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`
    if (digits.length <= 7) return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`
    return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7)}`
  }

  const getPhoneDigits = () => phone.replace(/\D/g, '')

  // Send verification code
  const handleSendCode = async (e) => {
    e.preventDefault()
    setError('')
    const digits = getPhoneDigits()
    if (digits.length !== 9) {
      setError("Telefon raqam 9 ta raqamdan iborat bo'lishi kerak")
      return
    }
    setLoading(true)
    try {
      await sendCode(`+998${digits}`)
      setStep(2)
      setTimer(600) // 10 minutes
      setToast({ type: 'success', message: "Tasdiqlash kodi Telegram orqali yuborildi!" })
      setTimeout(() => codeRefs.current[0]?.focus(), 100)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Resend code
  const handleResend = async () => {
    if (timer > 0) return
    setError('')
    setLoading(true)
    try {
      await sendCode(`+998${getPhoneDigits()}`)
      setTimer(600)
      setCode(['', '', '', '', '', ''])
      setToast({ type: 'success', message: "Kod qayta yuborildi!" })
      setTimeout(() => codeRefs.current[0]?.focus(), 100)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Code input handlers
  const handleCodeChange = useCallback((index, value) => {
    if (!/^\d*$/.test(value)) return
    const newCode = [...code]
    newCode[index] = value.slice(-1)
    setCode(newCode)

    if (value && index < 5) {
      codeRefs.current[index + 1]?.focus()
    }
  }, [code])

  const handleCodeKeyDown = useCallback((index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      codeRefs.current[index - 1]?.focus()
    }
  }, [code])

  const handleCodePaste = useCallback((e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted) {
      const newCode = [...code]
      for (let i = 0; i < 6; i++) {
        newCode[i] = pasted[i] || ''
      }
      setCode(newCode)
      const nextEmpty = pasted.length < 6 ? pasted.length : 5
      codeRefs.current[nextEmpty]?.focus()
    }
  }, [code])

  // Student login
  const handleStudentLogin = async (e) => {
    e.preventDefault()
    setError('')
    const codeStr = code.join('')
    if (codeStr.length !== 6) {
      setError("6 xonali kodni kiriting")
      return
    }
    setLoading(true)
    try {
      const data = await loginUser(`+998${getPhoneDigits()}`, codeStr)
      onLogin(data.access_token, data.user || { phone: `+998${getPhoneDigits()}`, role: data.role })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Admin login
  const handleAdminLogin = async (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim()) {
      setError("Email kiriting")
      return
    }
    if (!password) {
      setError("Parolni kiriting")
      return
    }
    setLoading(true)
    try {
      const data = await adminLogin(email.trim(), password)
      onLogin(data.access_token, data.user || { email, role: 'admin' })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Reset when switching tabs
  const switchTab = (t) => {
    setTab(t)
    setStep(1)
    setError('')
    setCode(['', '', '', '', '', ''])
  }

  return (
    <div className="auth-page">
      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>
            <span className="alert-icon">{toast.type === 'success' ? '✅' : '❌'}</span>
            {toast.message}
          </div>
        </div>
      )}

      <div className="glass-card auth-card">
        {/* Brand */}
        <div className="auth-brand">
          <div className="auth-brand-icon">🎓</div>
          <h1 className="gradient-text">Tizimga Kirish</h1>
          <p>O'quv Markazi ta'lim platformasi</p>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab-btn ${tab === 'student' ? 'active' : ''}`}
            onClick={() => switchTab('student')}
          >
            👨‍🎓 Talaba / O'qituvchi
          </button>
          <button
            className={`tab-btn ${tab === 'admin' ? 'active' : ''}`}
            onClick={() => switchTab('admin')}
          >
            🛡️ Admin
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">⚠️</span>
            {error}
          </div>
        )}

        {/* ── Student / Teacher Tab ── */}
        {tab === 'student' && (
          <>
            {step === 1 ? (
              <form onSubmit={handleSendCode}>
                <div className="form-group">
                  <label className="form-label">Telefon raqam</label>
                  <div className="phone-input-group">
                    <div className="phone-prefix">+998</div>
                    <div className="input-wrapper" style={{ flex: 1 }}>
                      <input
                        type="tel"
                        className="form-input"
                        placeholder="XX XXX XX XX"
                        value={phone}
                        onChange={(e) => setPhone(formatPhone(e.target.value))}
                        autoFocus
                        autoComplete="tel"
                      />
                      <span className="input-icon" style={{ left: 'auto', right: '14px' }}>
                        <PhoneIcon />
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-full"
                  disabled={loading || getPhoneDigits().length !== 9}
                >
                  {loading ? <span className="spinner" /> : null}
                  Kod yuborish
                </button>
              </form>
            ) : (
              <form onSubmit={handleStudentLogin}>
                {/* Phone display */}
                <div className="step-info">
                  <div className="step-phone">
                    📱 +998 {phone}
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Telegram orqali yuborilgan kodni kiriting
                  </p>
                </div>

                {/* Code input */}
                <div className="form-group">
                  <div className="code-input-wrapper" onPaste={handleCodePaste}>
                    {code.map((digit, i) => (
                      <input
                        key={i}
                        ref={el => (codeRefs.current[i] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        className={`code-digit ${digit ? 'filled' : ''}`}
                        value={digit}
                        onChange={(e) => handleCodeChange(i, e.target.value)}
                        onKeyDown={(e) => handleCodeKeyDown(i, e)}
                        autoFocus={i === 0}
                      />
                    ))}
                  </div>
                </div>

                {/* Timer & Resend */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                  <div className={`timer ${timer > 0 ? 'timer-active' : ''}`}>
                    ⏱️ {timer > 0 ? formatTimer(timer) : "Vaqt tugadi"}
                  </div>
                  <button
                    type="button"
                    className="link-btn"
                    onClick={handleResend}
                    disabled={timer > 0 || loading}
                  >
                    Qayta yuborish
                  </button>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-full"
                  disabled={loading || code.join('').length !== 6}
                >
                  {loading ? <span className="spinner" /> : null}
                  Kirish
                </button>

                <div style={{ textAlign: 'center', marginTop: 'var(--space-md)' }}>
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => { setStep(1); setCode(['', '', '', '', '', '']); setError(''); clearInterval(timerRef.current); setTimer(0) }}
                  >
                    ← Raqamni o'zgartirish
                  </button>
                </div>
              </form>
            )}
          </>
        )}

        {/* ── Admin Tab ── */}
        {tab === 'admin' && (
          <form onSubmit={handleAdminLogin}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="input-wrapper">
                <input
                  type="email"
                  className="form-input"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                  autoComplete="email"
                />
                <span className="input-icon"><MailIcon /></span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Parol</label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Parolni kiriting"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <span className="input-icon"><LockIcon /></span>
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading || !email.trim() || !password}
            >
              {loading ? <span className="spinner" /> : <span style={{ display: 'flex', alignItems: 'center' }}><ShieldIcon /></span>}
              Admin Kirish
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="auth-footer">
          Hisobingiz yo'qmi?{' '}
          <button className="link-btn" onClick={onNavigate} style={{ fontWeight: 600 }}>
            Ro'yxatdan o'ting
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
