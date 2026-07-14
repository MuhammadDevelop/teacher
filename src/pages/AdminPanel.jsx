import { useState, useEffect } from 'react'
import {
  adminDashboard, adminStudents, adminTests, adminCreateTest, adminUpdateTest, adminDeleteTest,
  adminHomework, adminCreateHomework, adminDeleteHomework,
  adminExercises, adminCreateExercise, adminDeleteExercise,
  adminTransferCourse, adminDailyGrades, adminRating, adminSubmissions, adminGradeSubmission
} from '../api'

const DIRECTIONS = ['Dasturlash', 'Microsoft dasturlari']
const SOHA_MAP = { 'Dasturlash': ['Frontend', 'Backend'], 'Microsoft dasturlari': [] }
const TECH_MAP = {
  'Frontend': ['HTML/CSS', 'JavaScript', 'React', 'Next.js', 'TypeScript'],
  'Backend': ['Python', 'Node.js', 'FastAPI'],
  'Microsoft': ['Word', 'Excel', 'Canva'],
}

function AdminPanel({ user, onLogout }) {
  const [tab, setTab] = useState('dashboard')
  const [stats, setStats] = useState(null)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [filterDir, setFilterDir] = useState('')
  const [filterTech, setFilterTech] = useState('')

  // Form state
  const [form, setForm] = useState({})

  const msg = (s, e) => { setSuccess(s || ''); setError(e || ''); if (s) setTimeout(() => setSuccess(''), 3000) }

  useEffect(() => { loadTab() }, [tab, filterDir, filterTech])

  const buildParams = () => {
    const p = new URLSearchParams()
    if (filterDir) p.set('direction', filterDir)
    if (filterTech) p.set('technology', filterTech)
    return p.toString()
  }

  const loadTab = async () => {
    setLoading(true); setError('')
    try {
      if (tab === 'dashboard') { setStats(await adminDashboard()) }
      else if (tab === 'tests') { const r = await adminTests(buildParams()); setData(r.tests || []) }
      else if (tab === 'homework') { const r = await adminHomework(buildParams()); setData(r.tasks || []) }
      else if (tab === 'exercises') { const r = await adminExercises(buildParams()); setData(r.exercises || []) }
      else if (tab === 'students') { const r = await adminStudents(buildParams()); setData(r.students || []) }
      else if (tab === 'grades') { const r = await adminDailyGrades(buildParams()); setData(r.grades || []) }
      else if (tab === 'rating') { const r = await adminRating(buildParams()); setData(r.rating || []) }
      else if (tab === 'submissions') { const r = await adminSubmissions(buildParams()); setData(r.submissions || []) }
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const handleCreate = async () => {
    setLoading(true)
    try {
      if (tab === 'tests') await adminCreateTest(form)
      else if (tab === 'homework') await adminCreateHomework(form)
      else if (tab === 'exercises') await adminCreateExercise(form)
      msg('Yaratildi ✅'); setShowForm(false); setForm({}); loadTab()
    } catch (e) { msg('', e.message) }
    finally { setLoading(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm("O'chirilsinmi?")) return
    try {
      if (tab === 'tests') await adminDeleteTest(id)
      else if (tab === 'homework') await adminDeleteHomework(id)
      else if (tab === 'exercises') await adminDeleteExercise(id)
      msg("O'chirildi ✅"); loadTab()
    } catch (e) { msg('', e.message) }
  }

  const handleTransfer = async (userId) => {
    const dir = prompt("Yangi yo'nalish (Dasturlash / Microsoft dasturlari):")
    if (!dir) return
    const tech = prompt("Yangi texnologiya:")
    if (!tech) return
    const soha = dir === 'Dasturlash' ? prompt("Soha (Frontend / Backend):") : null
    try {
      await adminTransferCourse({ user_id: userId, new_direction: dir, new_soha: soha, new_technology: tech })
      msg("O'tkazildi ✅"); loadTab()
    } catch (e) { msg('', e.message) }
  }

  const handleGrade = async (hwId) => {
    const score = prompt("Ball (0-2):")
    if (score === null) return
    const comment = prompt("Izoh:") || ''
    try {
      await adminGradeSubmission(hwId, { score: parseInt(score), comment })
      msg("Baholandi ✅"); loadTab()
    } catch (e) { msg('', e.message) }
  }

  const tabs = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'tests', label: '📝 Testlar' },
    { id: 'homework', label: '📋 Vazifalar' },
    { id: 'exercises', label: '💪 Mashqlar' },
    { id: 'submissions', label: '📥 Topshirilganlar' },
    { id: 'students', label: '👨‍🎓 Studentlar' },
    { id: 'grades', label: '📈 Baholar' },
    { id: 'rating', label: '🏆 Reyting' },
  ]

  const getTechOptions = () => {
    if (form.direction === 'Microsoft dasturlari') return TECH_MAP['Microsoft']
    if (form.direction === 'Dasturlash' && form.soha) return TECH_MAP[form.soha] || []
    return []
  }

  return (
    <div className="auth-page" style={{justifyContent: 'flex-start', padding: '0', alignItems: 'stretch', minHeight: '100vh'}}>
      <div className="floating-orbs"><div className="orb orb-1"/><div className="orb orb-2"/><div className="orb orb-3"/></div>

      {/* Header */}
      <header style={headerStyle}>
        <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
          <span style={{fontSize:'24px'}}>🎓</span>
          <span style={{color:'var(--text-primary)',fontWeight:700,fontSize:'18px'}}>Admin Panel</span>
        </div>
        <button onClick={onLogout} style={logoutStyle}>🚪 Chiqish</button>
      </header>

      <div style={{display:'flex',flex:1,position:'relative',zIndex:1}}>
        {/* Sidebar */}
        <nav style={sidebarStyle}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setShowForm(false) }}
              style={{...navBtn, ...(tab === t.id ? navActive : {})}}>
              {t.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <main style={{flex:1,padding:'24px',overflowY:'auto',maxHeight:'calc(100vh - 64px)'}}>
          {error && <div className="alert alert-error">⚠️ {error}</div>}
          {success && <div className="alert alert-success">✅ {success}</div>}

          {/* Filters */}
          {['tests','homework','exercises','students','grades','rating','submissions'].includes(tab) && (
            <div style={filterRow}>
              <select value={filterDir} onChange={e => { setFilterDir(e.target.value); setFilterTech('') }} style={selectStyle}>
                <option value="">Barcha yo'nalishlar</option>
                {DIRECTIONS.map(d => <option key={d}>{d}</option>)}
              </select>
              <select value={filterTech} onChange={e => setFilterTech(e.target.value)} style={selectStyle}>
                <option value="">Barcha texnologiyalar</option>
                {[...TECH_MAP.Frontend, ...TECH_MAP.Backend, ...TECH_MAP.Microsoft].map(t => <option key={t}>{t}</option>)}
              </select>
              {['tests','homework','exercises'].includes(tab) && (
                <button onClick={() => { setShowForm(!showForm); setForm({ course: filterDir || 'Dasturlash', direction: filterDir, technology: filterTech }) }} style={addBtn}>
                  ➕ Qo'shish
                </button>
              )}
            </div>
          )}

          {/* Dashboard */}
          {tab === 'dashboard' && stats && (
            <div style={gridStyle}>
              {[
                { l: 'Jami Studentlar', v: stats.total_students, i: '👨‍🎓' },
                { l: 'Faol', v: stats.active_students, i: '✅' },
                { l: 'Testlar', v: stats.total_tests, i: '📝' },
                { l: 'Vazifalar', v: stats.total_homework, i: '📋' },
                { l: 'Mashqlar', v: stats.total_exercises, i: '💪' },
                { l: 'Bugungi davomat', v: stats.today_attendance, i: '📅' },
              ].map((s, i) => (
                <div key={i} style={cardStyle}>
                  <div style={{fontSize:'32px',marginBottom:'8px'}}>{s.i}</div>
                  <div style={{color:'var(--text-muted)',fontSize:'13px',textTransform:'uppercase'}}>{s.l}</div>
                  <div style={{color:'var(--text-primary)',fontSize:'28px',fontWeight:700}}>{s.v}</div>
                </div>
              ))}
            </div>
          )}

          {/* Create Form */}
          {showForm && ['tests','homework','exercises'].includes(tab) && (
            <div style={{...cardStyle, marginBottom:'20px'}}>
              <h3 style={{color:'var(--text-primary)',marginBottom:'16px'}}>
                {tab === 'tests' ? '📝 Yangi test' : tab === 'homework' ? '📋 Yangi vazifa' : '💪 Yangi mashq'}
              </h3>
              <div style={formGrid}>
                {tab === 'tests' && <>
                  <input placeholder="Savol" value={form.question || ''} onChange={e => setForm({...form, question: e.target.value})} style={inputStyle} />
                  <input placeholder="A variant" value={form.option_a || ''} onChange={e => setForm({...form, option_a: e.target.value})} style={inputStyle} />
                  <input placeholder="B variant" value={form.option_b || ''} onChange={e => setForm({...form, option_b: e.target.value})} style={inputStyle} />
                  <input placeholder="C variant" value={form.option_c || ''} onChange={e => setForm({...form, option_c: e.target.value})} style={inputStyle} />
                  <input placeholder="D variant" value={form.option_d || ''} onChange={e => setForm({...form, option_d: e.target.value})} style={inputStyle} />
                  <select value={form.correct_option || ''} onChange={e => setForm({...form, correct_option: e.target.value})} style={inputStyle}>
                    <option value="">To'g'ri javob</option>
                    <option>A</option><option>B</option><option>C</option><option>D</option>
                  </select>
                </>}
                {(tab === 'homework' || tab === 'exercises') && <>
                  <input placeholder="Sarlavha" value={form.title || ''} onChange={e => setForm({...form, title: e.target.value})} style={inputStyle} />
                  <textarea placeholder="Tavsif" value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} style={{...inputStyle,minHeight:'80px'}} />
                </>}
                <select value={form.direction || ''} onChange={e => setForm({...form, direction: e.target.value, course: e.target.value, technology: '', soha: ''})} style={inputStyle}>
                  <option value="">Yo'nalish</option>
                  {DIRECTIONS.map(d => <option key={d}>{d}</option>)}
                </select>
                {form.direction === 'Dasturlash' && (
                  <select value={form.soha || ''} onChange={e => setForm({...form, soha: e.target.value, technology: ''})} style={inputStyle}>
                    <option value="">Soha</option>
                    <option>Frontend</option><option>Backend</option>
                  </select>
                )}
                <select value={form.technology || ''} onChange={e => setForm({...form, technology: e.target.value})} style={inputStyle}>
                  <option value="">Texnologiya</option>
                  {getTechOptions().map(t => <option key={t}>{t}</option>)}
                </select>
                <input type="number" placeholder="Dars raqami" value={form.lesson_number || ''} onChange={e => setForm({...form, lesson_number: parseInt(e.target.value) || 1})} style={inputStyle} min="1" />
              </div>
              <div style={{display:'flex',gap:'8px',marginTop:'16px'}}>
                <button onClick={handleCreate} disabled={loading} className="gradient-btn" style={{flex:1}}>
                  {loading ? '⏳...' : '✅ Saqlash'}
                </button>
                <button onClick={() => setShowForm(false)} style={{...inputStyle, cursor:'pointer',textAlign:'center',flex:'0 0 auto',padding:'12px 20px'}}>Bekor</button>
              </div>
            </div>
          )}

          {/* Data Table */}
          {['tests','homework','exercises','students','grades','rating','submissions'].includes(tab) && (
            <div style={{overflowX:'auto'}}>
              {loading ? <p style={{color:'var(--text-muted)',textAlign:'center',padding:'40px'}}>⏳ Yuklanmoqda...</p> :
              data.length === 0 ? <p style={{color:'var(--text-muted)',textAlign:'center',padding:'40px'}}>Ma'lumot yo'q</p> : (
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      {tab === 'tests' && <><th style={th}>#</th><th style={th}>Savol</th><th style={th}>Texnologiya</th><th style={th}>Dars</th><th style={th}>Javob</th><th style={th}>Amallar</th></>}
                      {tab === 'homework' && <><th style={th}>#</th><th style={th}>Sarlavha</th><th style={th}>Texnologiya</th><th style={th}>Dars</th><th style={th}>Amallar</th></>}
                      {tab === 'exercises' && <><th style={th}>#</th><th style={th}>Sarlavha</th><th style={th}>Texnologiya</th><th style={th}>Dars</th><th style={th}>Amallar</th></>}
                      {tab === 'students' && <><th style={th}>#</th><th style={th}>Ism</th><th style={th}>Telefon</th><th style={th}>Yo'nalish</th><th style={th}>Texnologiya</th><th style={th}>Status</th><th style={th}>Amallar</th></>}
                      {tab === 'grades' && <><th style={th}>#</th><th style={th}>Ism</th><th style={th}>Davomat</th><th style={th}>Test</th><th style={th}>Vazifa</th><th style={th}>Jami</th></>}
                      {tab === 'rating' && <><th style={th}>🏆</th><th style={th}>Ism</th><th style={th}>Test</th><th style={th}>Vazifa</th><th style={th}>Davomat</th><th style={th}>Jami</th></>}
                      {tab === 'submissions' && <><th style={th}>#</th><th style={th}>Student</th><th style={th}>Vazifa</th><th style={th}>Link</th><th style={th}>Ball</th><th style={th}>Baholash</th></>}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((r, i) => (
                      <tr key={r.id || i} style={trStyle}>
                        {tab === 'tests' && <><td style={td}>{i+1}</td><td style={td}>{r.question?.slice(0,50)}</td><td style={td}>{r.technology}</td><td style={td}>{r.lesson_number}</td><td style={td}>{r.correct_option}</td><td style={td}><button onClick={() => handleDelete(r.id)} style={delBtn}>🗑</button></td></>}
                        {tab === 'homework' && <><td style={td}>{i+1}</td><td style={td}>{r.title}</td><td style={td}>{r.technology}</td><td style={td}>{r.lesson_number}</td><td style={td}><button onClick={() => handleDelete(r.id)} style={delBtn}>🗑</button></td></>}
                        {tab === 'exercises' && <><td style={td}>{i+1}</td><td style={td}>{r.title}</td><td style={td}>{r.technology}</td><td style={td}>{r.lesson_number}</td><td style={td}><button onClick={() => handleDelete(r.id)} style={delBtn}>🗑</button></td></>}
                        {tab === 'students' && <><td style={td}>{i+1}</td><td style={td}>{r.fullname}</td><td style={td}>{r.telegram_number}</td><td style={td}>{r.course_direction}</td><td style={td}>{r.technology}</td><td style={td}><span style={{...badge, background: r.status==='active'?'var(--success-bg)':'var(--error-bg)', color: r.status==='active'?'var(--success)':'var(--error)'}}>{r.status}</span></td><td style={td}><button onClick={() => handleTransfer(r.id)} style={transferBtn}>🔄</button></td></>}
                        {tab === 'grades' && <><td style={td}>{i+1}</td><td style={td}>{r.fullname}</td><td style={td}><span style={{...badge, background: r.attendance==='keldi'?'var(--success-bg)':'var(--error-bg)', color: r.attendance==='keldi'?'var(--success)':'var(--error)'}}>{r.attendance}</span></td><td style={td}>{r.test_score}</td><td style={td}>{r.hw_score}</td><td style={{...td,fontWeight:700,color:'var(--accent-cyan)'}}>{r.total_score}</td></>}
                        {tab === 'rating' && <><td style={{...td,fontWeight:700,color: i<3?'gold':'var(--text-muted)'}}>{i+1}</td><td style={td}>{r.fullname}</td><td style={td}>{r.test_balls}</td><td style={td}>{r.hw_balls}</td><td style={td}>{r.attendance_days}</td><td style={{...td,fontWeight:700,color:'var(--accent-cyan)'}}>{r.total}</td></>}
                        {tab === 'submissions' && <><td style={td}>{i+1}</td><td style={td}>{r.fullname}</td><td style={td}>{r.title || '-'}</td><td style={td}>{r.homework_link ? <a href={r.homework_link} target="_blank" style={{color:'var(--accent-cyan)'}}>Link</a> : r.file_data ? '📎 Fayl' : '-'}</td><td style={td}>{r.score ?? '-'}</td><td style={td}>{r.score===null ? <button onClick={() => handleGrade(r.id)} style={transferBtn}>⭐</button> : '✅'}</td></>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

// Styles
const headerStyle = {width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 24px',borderBottom:'1px solid var(--glass-border)',background:'rgba(15,12,41,0.9)',backdropFilter:'blur(20px)',position:'sticky',top:0,zIndex:10}
const logoutStyle = {background:'rgba(255,82,82,0.15)',border:'1px solid rgba(255,82,82,0.3)',borderRadius:'10px',color:'#ff5252',padding:'8px 16px',cursor:'pointer',fontSize:'13px',fontFamily:'var(--font-family)'}
const sidebarStyle = {width:'200px',borderRight:'1px solid var(--glass-border)',padding:'16px 8px',display:'flex',flexDirection:'column',gap:'4px',background:'rgba(15,12,41,0.5)',backdropFilter:'blur(10px)',overflowY:'auto',maxHeight:'calc(100vh - 64px)'}
const navBtn = {background:'transparent',border:'none',color:'var(--text-muted)',padding:'10px 12px',borderRadius:'8px',cursor:'pointer',fontSize:'13px',textAlign:'left',fontFamily:'var(--font-family)',transition:'all 0.2s'}
const navActive = {background:'rgba(0,210,255,0.1)',color:'var(--accent-cyan)'}
const filterRow = {display:'flex',gap:'8px',marginBottom:'16px',flexWrap:'wrap'}
const selectStyle = {padding:'10px 12px',background:'var(--input-bg)',border:'1px solid var(--input-border)',borderRadius:'8px',color:'var(--input-text)',fontSize:'13px',fontFamily:'var(--font-family)',outline:'none',appearance:'none',minWidth:'160px'}
const addBtn = {padding:'10px 16px',background:'var(--accent-gradient)',border:'none',borderRadius:'8px',color:'white',fontWeight:600,cursor:'pointer',fontSize:'13px',fontFamily:'var(--font-family)'}
const cardStyle = {background:'var(--glass-bg)',border:'1px solid var(--glass-border)',borderRadius:'16px',padding:'24px',transition:'all 0.3s'}
const gridStyle = {display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:'16px'}
const formGrid = {display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}
const inputStyle = {padding:'10px 14px',background:'var(--input-bg)',border:'1px solid var(--input-border)',borderRadius:'8px',color:'var(--input-text)',fontSize:'14px',fontFamily:'var(--font-family)',outline:'none',width:'100%'}
const tableStyle = {width:'100%',borderCollapse:'collapse'}
const th = {padding:'10px 12px',textAlign:'left',color:'var(--text-muted)',fontSize:'12px',textTransform:'uppercase',borderBottom:'1px solid var(--glass-border)',whiteSpace:'nowrap'}
const td = {padding:'10px 12px',borderBottom:'1px solid rgba(255,255,255,0.04)',color:'var(--text-secondary)',fontSize:'13px'}
const trStyle = {transition:'background 0.2s'}
const delBtn = {background:'none',border:'none',cursor:'pointer',fontSize:'16px',padding:'4px'}
const transferBtn = {background:'rgba(0,210,255,0.1)',border:'1px solid rgba(0,210,255,0.2)',borderRadius:'6px',color:'var(--accent-cyan)',cursor:'pointer',padding:'4px 10px',fontSize:'13px',fontFamily:'var(--font-family)'}
const badge = {padding:'3px 10px',borderRadius:'12px',fontSize:'12px',fontWeight:500}

export default AdminPanel
