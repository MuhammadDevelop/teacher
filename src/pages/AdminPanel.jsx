import { useState, useEffect } from 'react'
import {
  adminDashboard, adminStudents, adminTests, adminCreateTest, adminUpdateTest, adminDeleteTest,
  adminHomework, adminCreateHomework, adminDeleteHomework,
  adminExercises, adminCreateExercise, adminDeleteExercise,
  adminTransferCourse, adminDailyGrades, adminRating, adminSubmissions, adminGradeSubmission
} from '../api'
import ThemeToggle from '../components/ThemeToggle'

const DIRECTIONS = ['Dasturlash', 'Microsoft dasturlari']
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
    <div className="panel-wrapper">
      <div className="floating-orbs"><div className="orb orb-1"/><div className="orb orb-2"/><div className="orb orb-3"/></div>

      <header className="panel-header">
        <div className="panel-header-left">
          <span className="brand-icon">🎓</span>
          <span className="brand-name">Admin Panel</span>
        </div>
        <div className="panel-header-right">
          <ThemeToggle />
          <button onClick={onLogout} className="logout-btn">🚪 Chiqish</button>
        </div>
      </header>

      <div className="panel-body">
        <nav className="panel-sidebar">
          {tabs.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setShowForm(false) }}
              className={`panel-nav-btn ${tab === t.id ? 'active' : ''}`}>
              {t.label}
            </button>
          ))}
        </nav>

        <main className="panel-content">
          {error && <div className="alert alert-error">⚠️ {error}</div>}
          {success && <div className="alert alert-success">✅ {success}</div>}

          {/* Filters */}
          {['tests','homework','exercises','students','grades','rating','submissions'].includes(tab) && (
            <div className="filter-row">
              <select value={filterDir} onChange={e => { setFilterDir(e.target.value); setFilterTech('') }} className="filter-select">
                <option value="">Barcha yo'nalishlar</option>
                {DIRECTIONS.map(d => <option key={d}>{d}</option>)}
              </select>
              <select value={filterTech} onChange={e => setFilterTech(e.target.value)} className="filter-select">
                <option value="">Barcha texnologiyalar</option>
                {[...TECH_MAP.Frontend, ...TECH_MAP.Backend, ...TECH_MAP.Microsoft].map(t => <option key={t}>{t}</option>)}
              </select>
              {['tests','homework','exercises'].includes(tab) && (
                <button onClick={() => { setShowForm(!showForm); setForm({ direction: filterDir, technology: filterTech }) }} className="add-btn">
                  ➕ Qo'shish
                </button>
              )}
            </div>
          )}

          {/* Dashboard */}
          {tab === 'dashboard' && stats && (
            <div className="stats-grid" style={{animation:'fadeIn 0.4s ease'}}>
              {[
                { l: 'Jami Studentlar', v: stats.total_students, i: '👨‍🎓' },
                { l: 'Faol', v: stats.active_students, i: '✅' },
                { l: 'Testlar', v: stats.total_tests, i: '📝' },
                { l: 'Vazifalar', v: stats.total_homework, i: '📋' },
                { l: 'Mashqlar', v: stats.total_exercises, i: '💪' },
                { l: 'Bugungi davomat', v: stats.today_attendance, i: '📅' },
              ].map((s, i) => (
                <div key={i} className="stat-card">
                  <div className="stat-icon">{s.i}</div>
                  <div className="stat-label">{s.l}</div>
                  <div className="stat-value">{s.v}</div>
                </div>
              ))}
            </div>
          )}

          {/* Create Form */}
          {showForm && ['tests','homework','exercises'].includes(tab) && (
            <div className="glass-card" style={{marginBottom:'20px',animation:'slideUp 0.3s ease'}}>
              <h3 style={{color:'var(--text-primary)',marginBottom:'16px'}}>
                {tab === 'tests' ? '📝 Yangi test' : tab === 'homework' ? '📋 Yangi vazifa' : '💪 Yangi mashq'}
              </h3>
              <div className="form-grid">
                {tab === 'tests' && <>
                  <input placeholder="Savol" value={form.question || ''} onChange={e => setForm({...form, question: e.target.value})} className="form-input" />
                  <input placeholder="A variant" value={form.option_a || ''} onChange={e => setForm({...form, option_a: e.target.value})} className="form-input" />
                  <input placeholder="B variant" value={form.option_b || ''} onChange={e => setForm({...form, option_b: e.target.value})} className="form-input" />
                  <input placeholder="C variant" value={form.option_c || ''} onChange={e => setForm({...form, option_c: e.target.value})} className="form-input" />
                  <input placeholder="D variant" value={form.option_d || ''} onChange={e => setForm({...form, option_d: e.target.value})} className="form-input" />
                  <select value={form.correct_option || ''} onChange={e => setForm({...form, correct_option: e.target.value})} className="form-input">
                    <option value="">To'g'ri javob</option>
                    <option>A</option><option>B</option><option>C</option><option>D</option>
                  </select>
                </>}
                {(tab === 'homework' || tab === 'exercises') && <>
                  <input placeholder="Sarlavha" value={form.title || ''} onChange={e => setForm({...form, title: e.target.value})} className="form-input" />
                  <textarea placeholder="Tavsif" value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} className="form-input" style={{minHeight:'80px'}} />
                </>}
                <select value={form.direction || ''} onChange={e => setForm({...form, direction: e.target.value, technology: '', soha: ''})} className="form-input">
                  <option value="">Yo'nalish</option>
                  {DIRECTIONS.map(d => <option key={d}>{d}</option>)}
                </select>
                {form.direction === 'Dasturlash' && (
                  <select value={form.soha || ''} onChange={e => setForm({...form, soha: e.target.value, technology: ''})} className="form-input">
                    <option value="">Soha</option>
                    <option>Frontend</option><option>Backend</option>
                  </select>
                )}
                <select value={form.technology || ''} onChange={e => setForm({...form, technology: e.target.value})} className="form-input">
                  <option value="">Texnologiya</option>
                  {getTechOptions().map(t => <option key={t}>{t}</option>)}
                </select>
                <input type="number" placeholder="Dars raqami" value={form.lesson_number || ''} onChange={e => setForm({...form, lesson_number: parseInt(e.target.value) || 1})} className="form-input" min="1" />
              </div>
              <div style={{display:'flex',gap:'8px',marginTop:'16px'}}>
                <button onClick={handleCreate} disabled={loading} className="gradient-btn" style={{flex:1}}>{loading ? '⏳...' : '✅ Saqlash'}</button>
                <button onClick={() => setShowForm(false)} className="form-input" style={{cursor:'pointer',textAlign:'center',flex:'0 0 auto',padding:'12px 20px'}}>Bekor</button>
              </div>
            </div>
          )}

          {/* Data Table */}
          {['tests','homework','exercises','students','grades','rating','submissions'].includes(tab) && (
            <div style={{overflowX:'auto'}}>
              {loading ? <p className="loading-state">⏳ Yuklanmoqda...</p> :
              data.length === 0 ? <p className="empty-state">Ma'lumot yo'q</p> : (
                <table className="data-table">
                  <thead>
                    <tr>
                      {tab === 'tests' && <><th>#</th><th>Savol</th><th>Texnologiya</th><th>Dars</th><th>Javob</th><th>Amallar</th></>}
                      {tab === 'homework' && <><th>#</th><th>Sarlavha</th><th>Texnologiya</th><th>Dars</th><th>Amallar</th></>}
                      {tab === 'exercises' && <><th>#</th><th>Sarlavha</th><th>Texnologiya</th><th>Dars</th><th>Amallar</th></>}
                      {tab === 'students' && <><th>#</th><th>Ism</th><th>Telefon</th><th>Yo'nalish</th><th>Texnologiya</th><th>Status</th><th>Amallar</th></>}
                      {tab === 'grades' && <><th>#</th><th>Ism</th><th>Davomat</th><th>Test</th><th>Vazifa</th><th>Jami</th></>}
                      {tab === 'rating' && <><th>🏆</th><th>Ism</th><th>Test</th><th>Vazifa</th><th>Davomat</th><th>Jami</th></>}
                      {tab === 'submissions' && <><th>#</th><th>Student</th><th>Vazifa</th><th>Link</th><th>Ball</th><th>Baholash</th></>}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((r, i) => (
                      <tr key={r.id || i}>
                        {tab === 'tests' && <><td>{i+1}</td><td>{r.question?.slice(0,50)}</td><td>{r.technology}</td><td>{r.lesson_number}</td><td>{r.correct_option}</td><td><button onClick={() => handleDelete(r.id)} className="delete-btn">🗑</button></td></>}
                        {tab === 'homework' && <><td>{i+1}</td><td>{r.title}</td><td>{r.technology}</td><td>{r.lesson_number}</td><td><button onClick={() => handleDelete(r.id)} className="delete-btn">🗑</button></td></>}
                        {tab === 'exercises' && <><td>{i+1}</td><td>{r.title}</td><td>{r.technology}</td><td>{r.lesson_number}</td><td><button onClick={() => handleDelete(r.id)} className="delete-btn">🗑</button></td></>}
                        {tab === 'students' && <><td>{i+1}</td><td>{r.fullname}</td><td>{r.telegram_number}</td><td>{r.course_direction}</td><td>{r.technology}</td><td><span className={`badge ${r.status==='active'?'badge-success':'badge-error'}`}>{r.status}</span></td><td><button onClick={() => handleTransfer(r.id)} className="action-btn">🔄</button></td></>}
                        {tab === 'grades' && <><td>{i+1}</td><td>{r.fullname}</td><td><span className={`badge ${r.attendance==='keldi'?'badge-success':'badge-error'}`}>{r.attendance}</span></td><td>{r.test_score}</td><td>{r.hw_score}</td><td style={{fontWeight:700,color:'var(--accent-cyan)'}}>{r.total_score}</td></>}
                        {tab === 'rating' && <><td style={{fontWeight:700,color:i<3?'gold':'var(--text-muted)'}}>{i+1}</td><td>{r.fullname}</td><td>{r.test_balls}</td><td>{r.hw_balls}</td><td>{r.attendance_days}</td><td style={{fontWeight:700,color:'var(--accent-cyan)'}}>{r.total}</td></>}
                        {tab === 'submissions' && <><td>{i+1}</td><td>{r.fullname}</td><td>{r.title || '-'}</td><td>{r.homework_link ? <a href={r.homework_link} target="_blank" style={{color:'var(--accent-cyan)'}}>Link</a> : r.file_data ? '📎 Fayl' : '-'}</td><td>{r.score ?? '-'}</td><td>{r.score===null ? <button onClick={() => handleGrade(r.id)} className="action-btn">⭐ Baholash</button> : '✅'}</td></>}
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

export default AdminPanel
