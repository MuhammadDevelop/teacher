import { useState, useEffect, useRef } from 'react'
import {
  studentAttendance, studentMyAttendance, studentTests, studentStartTest, studentSubmitTest,
  studentHomework, studentSubmitHomework, studentUploadHomework, studentEditHomework,
  studentExercises, studentNotifications, studentMarkRead, studentRating, studentMyGrades
} from '../api'
import ThemeToggle from '../components/ThemeToggle'

function StudentPanel({ user, onLogout }) {
  const [tab, setTab] = useState('home')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [data, setData] = useState(null)

  // Test state
  const [testQuestions, setTestQuestions] = useState(null)
  const [testAnswers, setTestAnswers] = useState({})
  const [testStarted, setTestStarted] = useState(null)
  const [testTimer, setTestTimer] = useState(600)
  const [testResult, setTestResult] = useState(null)
  const timerRef = useRef(null)
  const startedRef = useRef(null)
  const lessonRef = useRef(null)

  // Notification badge
  const [unread, setUnread] = useState(0)

  const msg = (s, e) => { setSuccess(s || ''); setError(e || ''); if (s) setTimeout(() => setSuccess(''), 3000) }

  useEffect(() => {
    markAttendance()
    loadNotifCount()
  }, [])

  useEffect(() => { loadTab() }, [tab])

  // Page visibility — test yakunlash
  useEffect(() => {
    const handler = () => {
      if (document.hidden && testQuestions && startedRef.current) {
        finishTest(true)
      }
    }
    document.addEventListener('visibilitychange', handler)
    return () => document.removeEventListener('visibilitychange', handler)
  }, [testQuestions, testAnswers])

  // Timer
  useEffect(() => {
    if (testQuestions) {
      timerRef.current = setInterval(() => {
        setTestTimer(p => {
          if (p <= 1) { finishTest(false); return 0 }
          return p - 1
        })
      }, 1000)
      return () => clearInterval(timerRef.current)
    }
  }, [testQuestions])

  const markAttendance = async () => {
    try { await studentAttendance() } catch {}
  }

  const loadNotifCount = async () => {
    try {
      const r = await studentNotifications()
      setUnread(r.unread_count || 0)
    } catch {}
  }

  const loadTab = async () => {
    setLoading(true); setError(''); setData(null)
    try {
      if (tab === 'home') {
        const [grades, att] = await Promise.all([studentMyGrades(), studentMyAttendance()])
        setData({ grades, attendance: att.attendance })
      }
      else if (tab === 'tests') setData(await studentTests())
      else if (tab === 'homework') setData(await studentHomework())
      else if (tab === 'exercises') setData(await studentExercises())
      else if (tab === 'notifications') {
        setData(await studentNotifications())
        await studentMarkRead()
        setUnread(0)
      }
      else if (tab === 'rating') setData(await studentRating())
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const startTest = async (lesson) => {
    try {
      setLoading(true)
      const r = await studentStartTest(lesson)
      setTestQuestions(r.questions)
      setTestAnswers({})
      setTestStarted(r.started_at)
      startedRef.current = r.started_at
      lessonRef.current = lesson
      setTestTimer(r.time_limit_seconds)
      setTestResult(null)
    } catch (e) { msg('', e.message) }
    finally { setLoading(false) }
  }

  const finishTest = async (early) => {
    if (timerRef.current) clearInterval(timerRef.current)
    try {
      const r = await studentSubmitTest({
        lesson_number: lessonRef.current,
        answers: testAnswers,
        started_at: startedRef.current,
        finished_early: !!early
      })
      setTestResult(r)
      setTestQuestions(null)
    } catch (e) { msg('', e.message); setTestQuestions(null) }
  }

  const submitHomework = async (taskId, link) => {
    try {
      await studentSubmitHomework({ task_id: taskId, homework_link: link })
      msg('Topshirildi ✅ (2 ball)'); loadTab()
    } catch (e) { msg('', e.message) }
  }

  const uploadFile = async (taskId, file) => {
    if (file.size > 2 * 1024 * 1024) { msg('', 'Fayl 2 MB dan katta!'); return }
    try {
      await studentUploadHomework(taskId, file)
      msg('Topshirildi ✅ (2 ball)'); loadTab()
    } catch (e) { msg('', e.message) }
  }

  const fmtTime = (s) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`

  const tabs = [
    { id: 'home', label: '🏠 Bosh sahifa' },
    { id: 'tests', label: '📝 Testlar' },
    { id: 'homework', label: '📋 Vazifalar' },
    { id: 'exercises', label: '💪 Mashqlar' },
    { id: 'notifications', label: `🔔 Xabarlar${unread > 0 ? ` (${unread})` : ''}` },
    { id: 'rating', label: '🏆 Reyting' },
  ]

  // ═══════════════ Test ishlash UI ═══════════════
  if (testQuestions) {
    return (
      <div className="auth-page" style={{padding:'20px'}}>
        <div className="floating-orbs"><div className="orb orb-1"/><div className="orb orb-2"/></div>
        <div style={{width:'100%',maxWidth:'700px',position:'relative',zIndex:1}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
            <h2 style={{color:'var(--text-primary)',margin:0}}>📝 Test — Dars {lessonRef.current}</h2>
            <div style={{...timerStyle, color: testTimer < 60 ? 'var(--error)' : 'var(--accent-cyan)'}}>
              ⏱ {fmtTime(testTimer)}
            </div>
          </div>
          {testQuestions.map((q, i) => (
            <div key={q.id} style={{...cardStyle, marginBottom:'12px'}}>
              <p style={{color:'var(--text-primary)',fontWeight:600,marginBottom:'12px'}}>{i+1}. {q.question}</p>
              {['A','B','C','D'].map(opt => {
                const val = q[`option_${opt.toLowerCase()}`]
                if (!val) return null
                const selected = testAnswers[q.id] === opt
                return (
                  <label key={opt} style={{...optionStyle, ...(selected ? optionActive : {})}}
                    onClick={() => setTestAnswers({...testAnswers, [q.id]: opt})}>
                    <span style={radioStyle}>{selected ? '●' : '○'}</span>
                    <span><b>{opt})</b> {val}</span>
                  </label>
                )
              })}
            </div>
          ))}
          <button onClick={() => finishTest(false)} className="gradient-btn" style={{marginTop:'12px'}}>
            ✅ Topshirish ({Object.keys(testAnswers).length}/{testQuestions.length})
          </button>
        </div>
      </div>
    )
  }

  // ═══════════════ Test natija ═══════════════
  if (testResult) {
    return (
      <div className="auth-page">
        <div className="floating-orbs"><div className="orb orb-1"/><div className="orb orb-2"/></div>
        <div className="auth-card" style={{textAlign:'center',animation:'slideUp 0.5s ease'}}>
          <div style={{fontSize:'64px',marginBottom:'16px'}}>{testResult.score >= 3 ? '🏆' : testResult.score >= 2 ? '👍' : '📝'}</div>
          <h2 style={{color:'var(--text-primary)',marginBottom:'8px'}}>Test yakunlandi!</h2>
          <p style={{color:'var(--accent-cyan)',fontSize:'24px',fontWeight:700}}>{testResult.correct_count}/{testResult.total} to'g'ri</p>
          <p style={{color:'var(--text-primary)',fontSize:'32px',fontWeight:700,margin:'8px 0'}}>{testResult.score} ball</p>
          {testResult.finished_early && <p style={{color:'var(--error)',fontSize:'14px'}}>⚠️ Sahifadan chiqdingiz — test yakunlandi</p>}
          <p style={{color:'var(--text-muted)',fontSize:'14px',marginBottom:'24px'}}>Vaqt: {fmtTime(testResult.time_taken)}</p>
          <button onClick={() => { setTestResult(null); setTab('tests'); loadTab() }} className="gradient-btn">Testlarga qaytish</button>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page" style={{justifyContent:'flex-start',padding:0,alignItems:'stretch',minHeight:'100vh'}}>
      <div className="floating-orbs"><div className="orb orb-1"/><div className="orb orb-2"/><div className="orb orb-3"/></div>

      {/* Header */}
      <header style={headerStyle}>
        <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
          <span style={{fontSize:'24px'}}>🎓</span>
          <span style={{color:'var(--text-primary)',fontWeight:600}}>{user.fullname}</span>
          <span style={{color:'var(--text-muted)',fontSize:'13px'}}>• {user.technology}</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
          <ThemeToggle />
          <button onClick={onLogout} style={logoutStyle}>🚪 Chiqish</button>
        </div>
      </header>

      <div style={{display:'flex',flex:1,position:'relative',zIndex:1}}>
        {/* Sidebar */}
        <nav style={sidebarStyle}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{...navBtn, ...(tab === t.id ? navActive : {})}}>
              {t.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <main style={{flex:1,padding:'24px',overflowY:'auto',maxHeight:'calc(100vh - 64px)'}}>
          {error && <div className="alert alert-error">⚠️ {error}</div>}
          {success && <div className="alert alert-success">✅ {success}</div>}
          {loading && <p style={{color:'var(--text-muted)',textAlign:'center',padding:'40px'}}>⏳ Yuklanmoqda...</p>}

          {/* Home */}
          {tab === 'home' && data && (
            <div>
              <div style={{...cardStyle, marginBottom:'20px',textAlign:'center'}}>
                <h1 style={{fontSize:'28px',fontWeight:700,margin:'0 0 8px',background:'var(--accent-gradient)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
                  Salom, {user.fullname}! 👋
                </h1>
                <p style={{color:'var(--text-muted)',margin:0}}>{user.direction} • {user.soha} • {user.technology}</p>
              </div>
              <div style={gridStyle}>
                <div style={cardStyle}>
                  <div style={{fontSize:'28px'}}>📝</div>
                  <div style={{color:'var(--text-muted)',fontSize:'13px'}}>Test ballari</div>
                  <div style={{color:'var(--text-primary)',fontSize:'24px',fontWeight:700}}>{data.grades?.total_test_score || 0}</div>
                </div>
                <div style={cardStyle}>
                  <div style={{fontSize:'28px'}}>📋</div>
                  <div style={{color:'var(--text-muted)',fontSize:'13px'}}>Vazifa ballari</div>
                  <div style={{color:'var(--text-primary)',fontSize:'24px',fontWeight:700}}>{data.grades?.total_hw_score || 0}</div>
                </div>
                <div style={cardStyle}>
                  <div style={{fontSize:'28px'}}>🏆</div>
                  <div style={{color:'var(--text-muted)',fontSize:'13px'}}>Jami ball</div>
                  <div style={{color:'var(--accent-cyan)',fontSize:'24px',fontWeight:700}}>{data.grades?.total_score || 0}</div>
                </div>
                <div style={cardStyle}>
                  <div style={{fontSize:'28px'}}>📅</div>
                  <div style={{color:'var(--text-muted)',fontSize:'13px'}}>Davomat</div>
                  <div style={{color:'var(--text-primary)',fontSize:'24px',fontWeight:700}}>{data.attendance?.length || 0} kun</div>
                </div>
              </div>
            </div>
          )}

          {/* Tests */}
          {tab === 'tests' && data && (
            <div>
              <h2 style={{color:'var(--text-primary)',marginBottom:'16px'}}>📝 Testlar</h2>
              {(data.tests || []).length === 0 ? <p style={{color:'var(--text-muted)'}}>Test mavjud emas</p> :
                <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
                  {data.tests.map(t => (
                    <div key={t.lesson_number} style={{...cardStyle, display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <div>
                        <p style={{color:'var(--text-primary)',fontWeight:600,margin:0}}>Dars {t.lesson_number}</p>
                        <p style={{color:'var(--text-muted)',fontSize:'13px',margin:0}}>{t.test_count} ta savol</p>
                      </div>
                      {t.completed ? (
                        <div style={{textAlign:'right'}}>
                          <span style={{...badgeStyle, background:'var(--success-bg)', color:'var(--success)'}}>
                            ✅ {t.correct_count}/{t.total_questions} — {t.score} ball
                          </span>
                        </div>
                      ) : (
                        <button onClick={() => startTest(t.lesson_number)} className="gradient-btn" style={{width:'auto',padding:'8px 20px',fontSize:'13px'}}>
                          ▶ Boshlash
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              }
            </div>
          )}

          {/* Homework */}
          {tab === 'homework' && data && (
            <div>
              <h2 style={{color:'var(--text-primary)',marginBottom:'8px'}}>📋 Vazifalar</h2>
              {data.can_submit && <p style={{color:'var(--success)',fontSize:'13px',marginBottom:'16px'}}>⏱ Topshirish muddati: {new Date(data.deadline).toLocaleTimeString()} gacha</p>}
              {!data.can_submit && <p style={{color:'var(--error)',fontSize:'13px',marginBottom:'16px'}}>⚠️ Topshirish muddati tugagan yoki davomat qilinmagan</p>}
              {(data.tasks || []).map(t => (
                <div key={t.id} style={{...cardStyle, marginBottom:'12px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                    <div>
                      <p style={{color:'var(--text-primary)',fontWeight:600,margin:'0 0 4px'}}>{t.title}</p>
                      {t.description && <p style={{color:'var(--text-muted)',fontSize:'13px',margin:'0 0 8px'}}>{t.description}</p>}
                      <span style={{color:'var(--text-muted)',fontSize:'12px'}}>Dars {t.lesson_number}</span>
                    </div>
                    {t.submission_id ? (
                      <span style={{...badgeStyle, background:'var(--success-bg)',color:'var(--success)'}}>✅ {t.score} ball</span>
                    ) : data.can_submit ? (
                      <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                        <button onClick={() => {
                          const link = prompt("Havola kiriting:")
                          if (link) submitHomework(t.id, link)
                        }} style={smallBtn}>🔗 Link</button>
                        <label style={smallBtn}>
                          📎 Fayl
                          <input type="file" accept="image/*,.pdf,.doc,.docx" style={{display:'none'}}
                            onChange={e => { if (e.target.files[0]) uploadFile(t.id, e.target.files[0]) }} />
                        </label>
                      </div>
                    ) : (
                      <span style={{...badgeStyle, background:'var(--error-bg)',color:'var(--error)'}}>❌ Topshirilmagan</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Exercises */}
          {tab === 'exercises' && data && (
            <div>
              <h2 style={{color:'var(--text-primary)',marginBottom:'16px'}}>💪 Mashqlar</h2>
              {(data.exercises || []).map(e => (
                <div key={e.id} style={{...cardStyle, marginBottom:'12px'}}>
                  <p style={{color:'var(--text-primary)',fontWeight:600,margin:0}}>{e.title}</p>
                  {e.description && <p style={{color:'var(--text-muted)',fontSize:'13px',margin:'4px 0 0'}}>{e.description}</p>}
                  <span style={{color:'var(--text-muted)',fontSize:'12px'}}>Dars {e.lesson_number}</span>
                </div>
              ))}
            </div>
          )}

          {/* Notifications */}
          {tab === 'notifications' && data && (
            <div>
              <h2 style={{color:'var(--text-primary)',marginBottom:'16px'}}>🔔 Xabarlar</h2>
              {(data.notifications || []).length === 0 ? <p style={{color:'var(--text-muted)'}}>Xabar yo'q</p> :
                data.notifications.map(n => (
                  <div key={n.id} style={{...cardStyle, marginBottom:'8px', borderLeft: n.is_read ? 'none' : '3px solid var(--accent-cyan)'}}>
                    <p style={{color:'var(--text-primary)',fontWeight:600,margin:'0 0 4px'}}>{n.title}</p>
                    <p style={{color:'var(--text-secondary)',fontSize:'14px',margin:0}}>{n.message}</p>
                    <span style={{color:'var(--text-muted)',fontSize:'12px'}}>{new Date(n.created_at).toLocaleString()}</span>
                  </div>
                ))
              }
            </div>
          )}

          {/* Rating */}
          {tab === 'rating' && data && (
            <div>
              <h2 style={{color:'var(--text-primary)',marginBottom:'8px'}}>🏆 Reyting</h2>
              {data.my_rank && <p style={{color:'var(--accent-cyan)',marginBottom:'16px'}}>Sizning o'rningiz: #{data.my_rank}</p>}
              <table style={tableStyle}>
                <thead>
                  <tr><th style={th}>🏆</th><th style={th}>Ism</th><th style={th}>Test</th><th style={th}>Vazifa</th><th style={th}>Jami</th></tr>
                </thead>
                <tbody>
                  {(data.rating || []).map((r, i) => (
                    <tr key={r.id} style={{...trStyle, background: r.id === user.id ? 'rgba(0,210,255,0.08)' : 'transparent'}}>
                      <td style={{...tdStyle,fontWeight:700,color:i<3?'gold':'var(--text-muted)'}}>{i+1}</td>
                      <td style={tdStyle}>{r.fullname} {r.id === user.id ? '⭐' : ''}</td>
                      <td style={tdStyle}>{r.test_balls}</td>
                      <td style={tdStyle}>{r.hw_balls}</td>
                      <td style={{...tdStyle,fontWeight:700,color:'var(--accent-cyan)'}}>{r.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

// Styles — CSS variable based (dark/light compatible)
const headerStyle = {width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 24px',borderBottom:'1px solid var(--glass-border)',background:'var(--header-bg)',backdropFilter:'blur(20px)',position:'sticky',top:0,zIndex:10}
const logoutStyle = {background:'var(--error-bg)',border:'1px solid var(--error)',borderRadius:'10px',color:'var(--error)',padding:'8px 16px',cursor:'pointer',fontSize:'13px',fontFamily:'var(--font-family)'}
const sidebarStyle = {width:'200px',borderRight:'1px solid var(--glass-border)',padding:'16px 8px',display:'flex',flexDirection:'column',gap:'4px',background:'var(--sidebar-bg)',overflowY:'auto',maxHeight:'calc(100vh - 64px)'}
const navBtn = {background:'transparent',border:'none',color:'var(--text-muted)',padding:'10px 12px',borderRadius:'8px',cursor:'pointer',fontSize:'13px',textAlign:'left',fontFamily:'var(--font-family)',transition:'all 0.2s'}
const navActive = {background:'rgba(0,145,234,0.1)',color:'var(--accent-cyan)'}
const cardStyle = {background:'var(--glass-bg)',border:'1px solid var(--glass-border)',borderRadius:'16px',padding:'20px',transition:'all 0.3s'}
const gridStyle = {display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(170px,1fr))',gap:'16px',marginTop:'20px'}
const timerStyle = {fontSize:'20px',fontWeight:700,fontVariantNumeric:'tabular-nums',padding:'8px 16px',background:'var(--input-bg)',borderRadius:'10px'}
const optionStyle = {display:'flex',alignItems:'center',gap:'10px',padding:'10px 14px',borderRadius:'10px',cursor:'pointer',marginBottom:'6px',border:'1px solid var(--glass-border)',transition:'all 0.2s',color:'var(--text-secondary)'}
const optionActive = {borderColor:'var(--accent-cyan)',background:'rgba(0,145,234,0.08)',color:'var(--text-primary)'}
const radioStyle = {fontSize:'18px',color:'var(--accent-cyan)'}
const badgeStyle = {padding:'4px 12px',borderRadius:'12px',fontSize:'12px',fontWeight:500,whiteSpace:'nowrap'}
const smallBtn = {padding:'6px 12px',background:'rgba(0,145,234,0.1)',border:'1px solid rgba(0,145,234,0.2)',borderRadius:'8px',color:'var(--accent-cyan)',cursor:'pointer',fontSize:'12px',fontFamily:'var(--font-family)',display:'flex',alignItems:'center',gap:'4px'}
const tableStyle = {width:'100%',borderCollapse:'collapse'}
const th = {padding:'10px 12px',textAlign:'left',color:'var(--text-muted)',fontSize:'12px',textTransform:'uppercase',borderBottom:'1px solid var(--glass-border)'}
const tdStyle = {padding:'10px 12px',borderBottom:'1px solid var(--glass-border)',color:'var(--text-secondary)',fontSize:'13px'}
const trStyle = {transition:'background 0.2s'}

export default StudentPanel
