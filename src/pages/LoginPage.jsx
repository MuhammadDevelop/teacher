import { useState, useEffect, useRef, useCallback } from 'react'
import { sendCode, verifyCode, adminLogin } from '../api'
import ThemeToggle from '../components/ThemeToggle'

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
)
const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>
)
const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
)
const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
)
const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
)
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
)

function LoginPage({ onLogin, onNavigate }) {
  const [tab, setTab] = useState('student')
  const [step, setStep] = useState(1)
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const codeRefs = useRef([])
  const cooldownRef = useRef(null)

  useEffect(() => {
    if (cooldown > 0) {
      cooldownRef.current = setInterval(() => {
        setCooldown(p => { if (p <= 1) { clearInterval(cooldownRef.current); return 0 } return p - 1 })
      }, 1000)
      return () => clearInterval(cooldownRef.current)
    }
  }, [cooldown])

  const formatPhone = (v) => {
    const digits = v.replace(/\D/g, '').slice(0, 9)
    if (digits.length <= 2) return digits
    if (digits.length <= 5) return `${digits.slice(0,2)} ${digits.slice(2)}`
    if (digits.length <= 7) return `${digits.slice(0,2)} ${digits.slice(2,5)} ${digits.slice(5)}`
    return `${digits.slice(0,2)} ${digits.slice(2,5)} ${digits.slice(5,7)} ${digits.slice(7)}`
  }

  const getRawPhone = () => '998' + phone.replace(/\s/g, '')

  const handleSendCode = async () => {
    const raw = getRawPhone()
    if (raw.length < 12) { setError("To'liq telefon raqam kiriting"); return }
    setLoading(true); setError('')
    try {
      await sendCode(raw)
      setStep(2)
      setSuccess('Kod Telegram ga yuborildi!')
      setCooldown(60)
      setTimeout(() => setSuccess(''), 3000)
      setTimeout(() => codeRefs.current[0]?.focus(), 100)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const handleVerify = async () => {
    const c = code.join('')
    if (c.length < 6) { setError("6 xonali kodni to'liq kiriting"); return }
    setLoading(true); setError('')
    try {
      const res = await verifyCode(getRawPhone(), c)
      onLogin(res.access_token, res.user)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const handleResend = async () => {
    if (cooldown > 0) return
    setLoading(true); setError('')
    try {
      await sendCode(getRawPhone())
      setSuccess('Yangi kod yuborildi!')
      setCooldown(60)
      setCode(['', '', '', '', '', ''])
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const handleCodeInput = (i, val) => {
    if (val.length > 1) {
      // Paste support
      const digits = val.replace(/\D/g, '').slice(0, 6).split('')
      const newCode = [...code]
      digits.forEach((d, idx) => { if (i + idx < 6) newCode[i + idx] = d })
      setCode(newCode)
      const next = Math.min(i + digits.length, 5)
      codeRefs.current[next]?.focus()
      return
    }
    if (val && !/^\d$/.test(val)) return
    const newCode = [...code]
    newCode[i] = val
    setCode(newCode)
    if (val && i < 5) codeRefs.current[i + 1]?.focus()
  }

  const handleCodeKey = (i, e) => {
    if (e.key === 'Backspace' && !code[i] && i > 0) {
      codeRefs.current[i - 1]?.focus()
    }
  }

  const handleAdmin = async () => {
    if (!email || !password) { setError("Email va parolni kiriting"); return }
    setLoading(true); setError('')
    try {
      const res = await adminLogin(email, password)
      onLogin(res.access_token, res.user)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="floating-orbs"><div className="orb orb-1"/><div className="orb orb-2"/><div className="orb orb-3"/></div>
      <div className="auth-card" style={{animation: 'slideUp 0.6s ease'}}>
        <div style={{position:'absolute',top:'16px',right:'16px'}}><ThemeToggle /></div>
        <div className="auth-logo">
          <div className="logo-icon"><ShieldIcon /></div>
          <h1 className="auth-title">Tizimga Kirish</h1>
          <p className="auth-subtitle">O'quv Markazi platformasi</p>
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'student' ? 'active' : ''}`} onClick={() => { setTab('student'); setError('') }}>📱 Talaba</button>
          <button className={`auth-tab ${tab === 'admin' ? 'active' : ''}`} onClick={() => { setTab('admin'); setError('') }}>🔑 Admin</button>
        </div>

        {error && (
          <div className="alert alert-error" style={{display:'flex', flexDirection:'column', gap:'8px'}}>
            <span>⚠️ {error}</span>
            {error.toLowerCase().includes('bot') && (
              <a href="https://t.me/turonustoz_bot" target="_blank" rel="noreferrer" style={{color:'#fff', textDecoration:'underline', fontWeight:600}}>
                🤖 Botga o'tish va raqamni yuborish
              </a>
            )}
          </div>
        )}
        {success && <div className="alert alert-success">✅ {success}</div>}

        {tab === 'student' ? (
          step === 1 ? (
            <div className="form-section" key="step1">
              <div className="form-group">
                <label>Telefon raqam</label>
                <div className="input-wrapper">
                  <span className="input-icon"><PhoneIcon /></span>
                  <span className="phone-prefix">+998</span>
                  <input type="tel" placeholder="90 123 45 67" value={phone}
                    onChange={e => setPhone(formatPhone(e.target.value))}
                    onKeyDown={e => e.key === 'Enter' && handleSendCode()}
                    className="input-with-prefix" />
                </div>
              </div>
              <button className="gradient-btn" onClick={handleSendCode} disabled={loading} style={{marginBottom:'16px'}}>
                {loading ? <span className="spinner" /> : '📩 Kod yuborish'}
              </button>
              <div style={{background:'var(--glass-bg)', padding:'12px', borderRadius:'var(--radius-sm)', border:'1px solid var(--glass-border)'}}>
                <p style={{fontSize:'13px', color:'var(--text-secondary)', margin:'0 0 8px'}}>Tasdiqlash kodini olish uchun avval Telegram botimizga kiring:</p>
                <a href="https://t.me/turonustoz_bot" target="_blank" rel="noreferrer" style={{display:'inline-flex', alignItems:'center', justifyContent:'center', width:'100%', padding:'10px', background:'rgba(0, 210, 255, 0.1)', color:'var(--accent-cyan)', border:'1px solid var(--accent-cyan)', borderRadius:'8px', textDecoration:'none', fontWeight:600, fontSize:'14px'}}>
                  🤖 @turonustoz_bot ga o'tish
                </a>
              </div>
            </div>
          ) : (
            <div className="form-section" key="step2">
              <div className="phone-display">📱 +998 {phone} <button className="link-btn" onClick={() => { setStep(1); setCode(['','','','','','']); setError('') }}>O'zgartirish</button></div>
              <div className="form-group">
                <label>Tasdiqlash kodi</label>
                <div className="code-inputs">
                  {code.map((d, i) => (
                    <input key={i} ref={el => codeRefs.current[i] = el} type="text" inputMode="numeric" maxLength={6}
                      value={d} onChange={e => handleCodeInput(i, e.target.value)} onKeyDown={e => handleCodeKey(i, e)}
                      className="code-box" autoFocus={i === 0} />
                  ))}
                </div>
              </div>
              <button className="gradient-btn" onClick={handleVerify} disabled={loading}>
                {loading ? <span className="spinner" /> : '🚀 Kirish'}
              </button>
              <div className="resend-row">
                {cooldown > 0 ? (
                  <span className="cooldown-text">⏱ Qayta yuborish: {cooldown}s</span>
                ) : (
                  <button className="link-btn" onClick={handleResend} disabled={loading}>🔄 Qayta yuborish</button>
                )}
              </div>
            </div>
          )
        ) : (
          <div className="form-section" key="admin">
            <div className="form-group">
              <label>Email</label>
              <div className="input-wrapper">
                <span className="input-icon"><MailIcon /></span>
                <input type="email" placeholder="admin@example.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label>Parol</label>
              <div className="input-wrapper">
                <span className="input-icon"><LockIcon /></span>
                <input type={showPass ? 'text' : 'password'} placeholder="••••••••" value={password}
                  onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdmin()} />
                <button className="eye-btn" onClick={() => setShowPass(!showPass)} type="button">
                  {showPass ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
            <button className="gradient-btn" onClick={handleAdmin} disabled={loading}>
              {loading ? <span className="spinner" /> : '🔑 Admin Kirish'}
            </button>
          </div>
        )}

        <div className="auth-footer">
          <span>Hisobingiz yo'qmi? </span>
          <button className="link-btn accent" onClick={onNavigate}>Ro'yxatdan o'ting →</button>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
