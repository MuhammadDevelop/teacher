import { useState, useEffect, useRef } from 'react'
import {
  studentProfile, studentSetAttPassword, studentAttendance, studentMyAttendance,
  studentTests, studentStartTest, studentSubmitTest,
  studentHomework, studentSubmitHomework, studentUploadHomework, studentEditHomework,
  studentExercises, studentNotifications, studentMarkRead, studentRating, studentMyGrades
} from '../api'
import ThemeToggle from '../components/ThemeToggle'
import { PromptModal } from '../components/Modals'

function StudentPanel({ user, onLogout }) {
  const [tab, setTab] = useState('home')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [data, setData] = useState(null)

  // Davomat
  const [attPassword, setAttPassword] = useState('')
  const [attDone, setAttDone] = useState(false)

  // Profil parol
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [hasAttPwd, setHasAttPwd] = useState(false)

  // Test state
  const [testQuestions, setTestQuestions] = useState(null)
  const [testAnswers, setTestAnswers] = useState({})
  const [testTimer, setTestTimer] = useState(600)
  const [testResult, setTestResult] = useState(null)

  const [linkModal, setLinkModal] = useState(null)

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const timerRef = useRef(null)
  const startedRef = useRef(null)
  const lessonRef = useRef(null)

  const [unread, setUnread] = useState(0)

  const msg = (s, e) => { setSuccess(s || ''); setError(e || ''); if (s) setTimeout(() => setSuccess(''), 3000) }

  useEffect(() => { loadNotifCount(); checkAttStatus() }, [])
  useEffect(() => { loadTab() }, [tab])

  useEffect(() => {
    const handler = () => { if ((document.hidden || !document.hasFocus()) && testQuestions && startedRef.current) finishTest(true) }
    const blurHandler = () => { if (testQuestions && startedRef.current) finishTest(true) }
    
    document.addEventListener('visibilitychange', handler)
    window.addEventListener('blur', blurHandler)
    
    return () => {
      document.removeEventListener('visibilitychange', handler)
      window.removeEventListener('blur', blurHandler)
    }
  }, [testQuestions, testAnswers])

  useEffect(() => {
    if (testQuestions) {
      timerRef.current = setInterval(() => {
        setTestTimer(p => { if (p <= 1) { finishTest(false); return 0 } return p - 1 })
      }, 1000)
      return () => clearInterval(timerRef.current)
    }
  }, [testQuestions])

  const loadNotifCount = async () => { try { const r = await studentNotifications(); setUnread(r.unread_count || 0) } catch {} }

  const checkAttStatus = async () => {
    try {
      const att = await studentMyAttendance()
      const today = new Date().toISOString().split('T')[0]
      const todayAtt = (att.attendance || []).find(a => a.date && a.date.startsWith(today))
      if (todayAtt) setAttDone(true)
    } catch {}
    try {
      const p = await studentProfile()
      setHasAttPwd(p.has_attendance_password)
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
      else if (tab === 'notifications') { setData(await studentNotifications()); await studentMarkRead(); setUnread(0) }
      else if (tab === 'rating') setData(await studentRating())
      else if (tab === 'profile') { const p = await studentProfile(); setData(p); setHasAttPwd(p.has_attendance_password) }
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  // Davomat
  const doAttendance = async () => {
    if (!attPassword.trim()) { msg('', 'Parolni kiriting!'); return }
    try {
      const r = await studentAttendance(attPassword)
      msg(r.message); setAttDone(true); setAttPassword('')
    } catch (e) { msg('', e.message) }
  }

  // Parol saqlash
  const saveAttPassword = async () => {
    if (!newPwd || !confirmPwd) { msg('', 'Barcha maydonlarni to\'ldiring!'); return }
    try {
      await studentSetAttPassword({ password: newPwd, confirm_password: confirmPwd })
      msg('Davomat paroli saqlandi ✅'); setNewPwd(''); setConfirmPwd(''); setHasAttPwd(true)
    } catch (e) { msg('', e.message) }
  }

  // Test
  const startTest = async (lesson) => {
    try {
      setLoading(true)
      const r = await studentStartTest(lesson)
      setTestQuestions(r.questions); setTestAnswers({})
      startedRef.current = r.started_at; lessonRef.current = lesson
      setTestTimer(r.time_limit_seconds); setTestResult(null)
    } catch (e) { msg('', e.message) }
    finally { setLoading(false) }
  }

  const finishTest = async (early) => {
    if (timerRef.current) clearInterval(timerRef.current)
    try {
      const r = await studentSubmitTest({ lesson_number: lessonRef.current, answers: testAnswers, started_at: startedRef.current, finished_early: !!early })
      setTestResult(r); setTestQuestions(null)
    } catch (e) { msg('', e.message); setTestQuestions(null) }
  }

  const submitHomework = async (taskId, link) => {
    try { await studentSubmitHomework({ task_id: taskId, homework_link: link }); msg('Topshirildi ✅ (2 ball)'); loadTab() } catch (e) { msg('', e.message) }
  }

  const uploadFile = async (taskId, file) => {
    if (file.size > 2 * 1024 * 1024) { msg('', 'Fayl 2 MB dan katta!'); return }
    try { await studentUploadHomework(taskId, file); msg('Topshirildi ✅ (2 ball)'); loadTab() } catch (e) { msg('', e.message) }
  }

  const fmtTime = (s) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`

  const tabs = [
    { id: 'home', label: '🏠 Bosh sahifa' },
    { id: 'tests', label: '📝 Testlar' },
    { id: 'homework', label: '📋 Vazifalar' },
    { id: 'exercises', label: '💪 Mashqlar' },
    { id: 'notifications', label: `🔔 Xabarlar${unread > 0 ? ` (${unread})` : ''}` },
    { id: 'rating', label: '🏆 Reyting' },
    { id: 'profile', label: '👤 Profil' },
  ]

  // ═══ Test ishlash ═══
  if (testQuestions) {
    return (
      <div className="panel-wrapper">
        <div className="floating-orbs"><div className="orb orb-1"/><div className="orb orb-2"/></div>
        <header className="panel-header">
          <div className="panel-header-left">
            <span className="brand-icon">📝</span>
            <span className="brand-name glow-text">Test — Dars {lessonRef.current}</span>
          </div>
          <div style={{fontSize:'20px',fontWeight:700,fontVariantNumeric:'tabular-nums',padding:'8px 16px',background:'var(--input-bg)',borderRadius:'10px',color: testTimer < 60 ? 'var(--error)' : 'var(--accent-cyan)'}}>
            ⏱ {fmtTime(testTimer)}
          </div>
        </header>
        <div style={{flex:1,overflowY:'auto',padding:'28px',maxWidth:'750px',margin:'0 auto',width:'100%'}}>
          {testQuestions.map((q, i) => (
            <div key={q.id} className="glass-card" style={{marginBottom:'14px'}}>
              <p style={{color:'var(--text-primary)',fontWeight:600,marginBottom:'12px'}}>{i+1}. {q.question}</p>
              {['A','B','C','D'].map(opt => {
                const val = q[`option_${opt.toLowerCase()}`]
                if (!val) return null
                const sel = testAnswers[q.id] === opt
                return (
                  <label key={opt} className="glass-card"
                    style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 14px',marginBottom:'6px',cursor:'pointer',borderColor: sel?'var(--accent-cyan)':'var(--glass-border)',background: sel?'rgba(0,145,234,0.08)':'var(--glass-bg)'}}
                    onClick={() => setTestAnswers({...testAnswers, [q.id]: opt})}>
                    <span style={{fontSize:'18px',color:'var(--accent-cyan)'}}>{sel ? '●' : '○'}</span>
                    <span style={{color: sel?'var(--text-primary)':'var(--text-secondary)'}}><b>{opt})</b> {val}</span>
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

  // ═══ Test natija ═══
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

  // ═══ Asosiy panel ═══
  return (
    <div className="panel-wrapper">
      <div className="floating-orbs"><div className="orb orb-1"/><div className="orb orb-2"/><div className="orb orb-3"/></div>

      <PromptModal 
        isOpen={!!linkModal}
        title="Vazifa havolasi"
        text="Github yoki Vercel havolasini kiriting:"
        placeholder="https://..."
        onConfirm={(linkVal) => {
          if (linkVal) {
            submitHomework(linkModal, linkVal)
          }
          setLinkModal(null)
        }}
        onCancel={() => setLinkModal(null)}
      />

      <header className="panel-header">
        <div className="panel-header-left">
          <button className="menu-toggle-btn" onClick={() => setIsSidebarOpen(true)}>☰</button>
          <span className="brand-icon">🎓</span>
          <span className="brand-name">{user.fullname}</span>
          <span className="user-info">• {user.technology}</span>
        </div>
        <div className="panel-header-right">
          <ThemeToggle />
          <button onClick={onLogout} className="logout-btn">🚪 Chiqish</button>
        </div>
      </header>

      <div className="panel-body">
        <div className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>
        <nav className={`panel-sidebar ${isSidebarOpen ? 'open' : ''}`}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setIsSidebarOpen(false) }}
              className={`panel-nav-btn ${tab === t.id ? 'active' : ''}`}>
              {t.label}
            </button>
          ))}
        </nav>

        <main className="panel-content">
          {error && <div className="alert alert-error">⚠️ {error}</div>}
          {success && <div className="alert alert-success">✅ {success}</div>}
          {loading && <p className="loading-state">⏳ Yuklanmoqda...</p>}

          {/* ═══ Home ═══ */}
          {tab === 'home' && !loading && (
            <div style={{animation:'fadeIn 0.4s ease'}}>
              <div className="welcome-card">
                <h1>Salom, {user.fullname}! 👋</h1>
                <p>{user.direction} • {user.soha} • {user.technology}</p>
              </div>

              {/* Davomat bloki */}
              <div className="glass-card" style={{marginBottom:'24px',textAlign:'center'}}>
                <h3 style={{color:'var(--text-primary)',marginBottom:'16px'}}>📅 Bugungi davomat</h3>
                {attDone ? (
                  <div>
                    <div style={{fontSize:'48px',marginBottom:'8px'}}>✅</div>
                    <p style={{color:'var(--success)',fontWeight:600,fontSize:'16px'}}>Davomat belgilangan!</p>
                  </div>
                ) : !hasAttPwd ? (
                  <div>
                    <div style={{fontSize:'48px',marginBottom:'8px'}}>🔒</div>
                    <p style={{color:'var(--text-muted)',marginBottom:'12px'}}>Avval <b>Profil</b> sahifasida davomat paroli yarating</p>
                    <button onClick={() => setTab('profile')} className="gradient-btn" style={{width:'auto',margin:'0 auto',padding:'10px 24px'}}>
                      👤 Profilga o'tish
                    </button>
                  </div>
                ) : (
                  <div style={{maxWidth:'350px',margin:'0 auto'}}>
                    <p style={{color:'var(--text-muted)',marginBottom:'12px'}}>Davomat parolingizni kiriting:</p>
                    <div style={{display:'flex',gap:'8px'}}>
                      <input
                        type="password"
                        placeholder="Davomat paroli"
                        value={attPassword}
                        onChange={e => setAttPassword(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && doAttendance()}
                        className="form-input"
                        style={{flex:1}}
                      />
                      <button onClick={doAttendance} className="gradient-btn" style={{width:'auto',padding:'10px 24px'}}>
                        ✅ Davomat
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Statistika */}
              {data && (
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon">📝</div>
                    <div className="stat-label">Test ballari</div>
                    <div className="stat-value">{data.grades?.total_test_score || 0}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">📋</div>
                    <div className="stat-label">Vazifa ballari</div>
                    <div className="stat-value">{data.grades?.total_hw_score || 0}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">🏆</div>
                    <div className="stat-label">Jami ball</div>
                    <div className="stat-value accent">{data.grades?.total_score || 0}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">📅</div>
                    <div className="stat-label">Davomat</div>
                    <div className="stat-value">{data.attendance?.length || 0} kun</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══ Profile ═══ */}
          {tab === 'profile' && !loading && (
            <div style={{animation:'fadeIn 0.4s ease',maxWidth:'500px'}}>
              <h2 className="glow-text" style={{color:'var(--text-primary)',marginBottom:'20px'}}>👤 Profil</h2>

              {data && (
                <div className="glass-card" style={{marginBottom:'20px'}}>
                  <div style={{display:'grid',gap:'12px'}}>
                    <div><span style={{color:'var(--text-muted)',fontSize:'13px'}}>Ism</span><p style={{color:'var(--text-primary)',fontWeight:600,margin:0}}>{data.fullname}</p></div>
                    <div><span style={{color:'var(--text-muted)',fontSize:'13px'}}>Telefon</span><p style={{color:'var(--text-primary)',margin:0}}>{data.phone}</p></div>
                    <div><span style={{color:'var(--text-muted)',fontSize:'13px'}}>Yo'nalish</span><p style={{color:'var(--text-primary)',margin:0}}>{data.direction}</p></div>
                    <div><span style={{color:'var(--text-muted)',fontSize:'13px'}}>Texnologiya</span><p style={{color:'var(--accent-cyan)',fontWeight:600,margin:0}}>{data.technology}</p></div>
                  </div>
                </div>
              )}

              <div className="glass-card">
                <h3 style={{color:'var(--text-primary)',marginBottom:'4px'}}>🔐 Davomat paroli</h3>
                <p style={{color:'var(--text-muted)',fontSize:'13px',marginBottom:'16px'}}>
                  {hasAttPwd ? 'Parolingiz mavjud. Yangilash uchun qayta kiriting.' : 'Davomat qilish uchun parol yarating (kamida 4 belgi).'}
                </p>
                <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                  <input
                    type="password"
                    placeholder="Yangi parol (kamida 4 belgi)"
                    value={newPwd}
                    onChange={e => setNewPwd(e.target.value)}
                    className="form-input"
                  />
                  <input
                    type="password"
                    placeholder="Parolni tasdiqlang"
                    value={confirmPwd}
                    onChange={e => setConfirmPwd(e.target.value)}
                    className="form-input"
                  />
                  <button onClick={saveAttPassword} className="gradient-btn">
                    {hasAttPwd ? '🔄 Parolni yangilash' : '✅ Parol yaratish'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ═══ Tests ═══ */}
          {tab === 'tests' && data && (
            <div style={{animation:'fadeIn 0.4s ease'}}>
              <h2 className="glow-text" style={{color:'var(--text-primary)',marginBottom:'16px'}}>📝 Testlar</h2>
              {(data.tests || []).length === 0 ? <p className="empty-state">Test mavjud emas</p> :
                <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
                  {data.tests.map((t, i) => (
                    <div key={t.lesson_number} className={`glass-card stagger-${(i%5)+1}`} style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <div>
                        <p style={{color:'var(--text-primary)',fontWeight:600,margin:0}}>Dars {t.lesson_number}</p>
                        <p style={{color:'var(--text-muted)',fontSize:'13px',margin:0}}>{t.test_count} ta savol</p>
                      </div>
                      {t.completed ? (
                        <span className="badge badge-success">✅ {t.correct_count}/{t.total_questions} — {t.score} ball</span>
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

          {/* ═══ Homework ═══ */}
          {tab === 'homework' && data && (
            <div style={{animation:'fadeIn 0.4s ease'}}>
              <h2 className="glow-text" style={{color:'var(--text-primary)',marginBottom:'8px'}}>📋 Vazifalar</h2>
              {data.can_submit && <p style={{color:'var(--success)',fontSize:'13px',marginBottom:'16px'}}>⏱ Topshirish muddati: {new Date(data.deadline).toLocaleTimeString()} gacha</p>}
              {!data.can_submit && <p style={{color:'var(--error)',fontSize:'13px',marginBottom:'16px'}}>⚠️ Topshirish muddati tugagan yoki davomat qilinmagan</p>}
              {(data.tasks || []).map((t, i) => (
                <div key={t.id} className={`glass-card stagger-${(i%5)+1}`} style={{marginBottom:'12px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:'12px'}}>
                    <div style={{flex:1}}>
                      <p style={{color:'var(--text-primary)',fontWeight:600,margin:'0 0 4px'}}>{t.title}</p>
                      {t.description && <p style={{color:'var(--text-muted)',fontSize:'13px',margin:'0 0 8px'}}>{t.description}</p>}
                      <span style={{color:'var(--text-muted)',fontSize:'12px'}}>Dars {t.lesson_number}</span>
                    </div>
                    {t.submission_id ? (
                      <span className={`badge ${t.score === null ? 'badge-info' : 'badge-success'}`}>
                        {t.score === null ? '⏳ Kutilmoqda' : `✅ ${t.score} ball`}
                      </span>
                    ) : data.can_submit ? (
                      <div style={{display:'flex',gap:'8px'}}>
                        <button className="action-btn" onClick={() => setLinkModal(t.id)}>🔗 Link</button>
                        <label className="action-btn" style={{cursor:'pointer'}}>
                          📎 Fayl
                          <input type="file" accept="image/*,.pdf,.doc,.docx" style={{display:'none'}} onChange={e => { if (e.target.files[0]) uploadFile(t.id, e.target.files[0]) }} />
                        </label>
                      </div>
                    ) : (
                      <span className="badge badge-error">❌ Topshirilmagan</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ═══ Exercises ═══ */}
          {tab === 'exercises' && data && (
            <div style={{animation:'fadeIn 0.4s ease'}}>
              <h2 className="glow-text" style={{color:'var(--text-primary)',marginBottom:'16px'}}>💪 Mashqlar</h2>
              {(data.exercises || []).length === 0 ? <p className="empty-state">Mashq mavjud emas</p> :
                (data.exercises || []).map((e, i) => (
                  <div key={e.id} className={`glass-card stagger-${(i%5)+1}`} style={{marginBottom:'12px'}}>
                    <p style={{color:'var(--text-primary)',fontWeight:600,margin:0}}>{e.title}</p>
                    {e.description && <p style={{color:'var(--text-muted)',fontSize:'13px',margin:'4px 0 0'}}>{e.description}</p>}
                    <span style={{color:'var(--text-muted)',fontSize:'12px'}}>Dars {e.lesson_number}</span>
                  </div>
                ))
              }
            </div>
          )}

          {/* ═══ Notifications ═══ */}
          {tab === 'notifications' && data && (
            <div style={{animation:'fadeIn 0.4s ease'}}>
              <h2 className="glow-text" style={{color:'var(--text-primary)',marginBottom:'16px'}}>🔔 Xabarlar</h2>
              {(data.notifications || []).length === 0 ? <p className="empty-state">Xabar yo'q</p> :
                data.notifications.map((n, i) => (
                  <div key={n.id} className={`glass-card stagger-${(i%5)+1}`} style={{marginBottom:'8px', borderLeft: n.is_read ? 'none' : '3px solid var(--accent-cyan)'}}>
                    <p style={{color:'var(--text-primary)',fontWeight:600,margin:'0 0 4px'}}>{n.title}</p>
                    <p style={{color:'var(--text-secondary)',fontSize:'14px',margin:0}}>{n.message}</p>
                    <span style={{color:'var(--text-muted)',fontSize:'12px'}}>{new Date(n.created_at).toLocaleString()}</span>
                  </div>
                ))
              }
            </div>
          )}

          {/* ═══ Rating ═══ */}
          {tab === 'rating' && data && (
            <div style={{animation:'fadeIn 0.4s ease'}}>
              <h2 className="glow-text" style={{color:'var(--text-primary)',marginBottom:'8px'}}>🏆 Reyting</h2>
              {data.my_rank && <p style={{color:'var(--accent-cyan)',marginBottom:'16px'}}>Sizning o'rningiz: <b>#{data.my_rank}</b></p>}
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr><th>🏆</th><th>Ism</th><th>Test</th><th>Vazifa</th><th>Jami</th></tr>
                  </thead>
                  <tbody>
                    {(data.rating || []).map((r, i) => (
                      <tr key={r.id} className={`stagger-${(i%5)+1}`} style={{background: r.id === user.id ? 'rgba(0,145,234,0.08)' : 'transparent'}}>
                        <td className={i===0?'rating-medal-1':i===1?'rating-medal-2':i===2?'rating-medal-3':''} style={{fontWeight:700,color:i<3?'gold':'var(--text-muted)'}}>
                          {i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1}
                        </td>
                        <td>{r.fullname} {r.id === user.id ? '👤' : ''}</td>
                        <td><span className="badge badge-info">{r.test_balls}</span></td>
                        <td><span className="badge badge-success">{r.hw_balls}</span></td>
                        <td style={{fontWeight:700,color:'var(--accent-cyan)'}}>{r.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default StudentPanel
