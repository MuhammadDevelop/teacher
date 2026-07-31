import { useState, useEffect } from 'react'
import {
  adminDashboard, adminStudents, adminDeleteStudent, adminDeleteAllStudents, adminTests, adminCreateTest, adminCreateBulkTests, adminUpdateTest, adminDeleteTest, adminDeleteAllTests,
  adminHomework, adminCreateHomework, adminDeleteHomework, adminDeleteAllHomework,
  adminExercises, adminCreateExercise, adminDeleteExercise, adminDeleteAllExercises,
  adminTransferCourse, adminDailyGrades, adminRating, adminSubmissions, adminGradeSubmission
} from '../api'
import { ConfirmModal, PromptModal } from '../components/Modals'

const DIRECTIONS = ['Dasturlash', 'Microsoft dasturlari']
const SOHA_MAP = { 'Dasturlash': ['Frontend', 'Backend'], 'Microsoft dasturlari': [] }
const TECH_MAP = {
  'Frontend': ['HTML/CSS', 'JavaScript', 'React', 'Next.js', 'TypeScript'],
  'Backend': ['Python', 'Node.js', 'FastAPI'],
  'Microsoft': ['Word', 'Excel', 'Canva'],
}
const ALL_TECHS = [...TECH_MAP.Frontend, ...TECH_MAP.Backend, ...TECH_MAP.Microsoft]

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Transfer modal
  const [transferModal, setTransferModal] = useState(null)
  const [trDir, setTrDir] = useState('')
  const [trSoha, setTrSoha] = useState('')
  const [trTech, setTrTech] = useState('')

  // Custom Modals
  const [confirmModal, setConfirmModal] = useState(null)
  const [promptModal, setPromptModal] = useState(null)
  const [gradeModal, setGradeModal] = useState(null)
  const [gradeScore, setGradeScore] = useState('')
  const [gradeComment, setGradeComment] = useState('')

  const msg = (s, e) => { setSuccess(s||''); setError(e||''); if(s) setTimeout(()=>setSuccess(''),3000) }
  useEffect(() => { loadTab() }, [tab, filterDir, filterTech])

  const bp = () => {
    const p = new URLSearchParams()
    if (filterDir) p.set('direction', filterDir)
    if (filterTech) p.set('technology', filterTech)
    return p.toString()
  }

  const loadTab = async () => {
    setLoading(true); setError('')
    try {
      if (tab === 'dashboard') setStats(await adminDashboard())
      else if (tab === 'tests') { const r = await adminTests(bp()); setData(r.tests||[]) }
      else if (tab === 'homework') { const r = await adminHomework(bp()); setData(r.tasks||[]) }
      else if (tab === 'exercises') { const r = await adminExercises(bp()); setData(r.exercises||[]) }
      else if (tab === 'students') { const r = await adminStudents(bp()); setData(r.students||[]) }
      else if (tab === 'grades') { const r = await adminDailyGrades(bp()); setData(r.grades||[]) }
      else if (tab === 'rating') { const r = await adminRating(bp()); setData(r.rating||[]) }
      else if (tab === 'submissions') { const r = await adminSubmissions(bp()); setData(r.submissions||[]) }
    } catch(e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const handleCreate = async () => {
    setLoading(true)
    try {
      if (tab === 'tests') {
        const qs = form.questions || []
        if (qs.length !== 10) throw new Error("Aynan 10 ta savol kiritilishi shart!")
        for (let i=0; i<10; i++) {
          if (!qs[i].question || !qs[i].option_a || !qs[i].option_b || !qs[i].correct_option) {
            throw new Error(`${i+1}-savol to'liq to'ldirilmagan!`)
          }
        }
        const payload = qs.map(q => ({
          ...q,
          course: form.direction || '',
          direction: form.direction,
          technology: form.technology,
          lesson_number: form.lesson_number
        }))
        await adminCreateBulkTests(payload)
      } else {
        const payload = { ...form }
        if (!payload.course) payload.course = payload.direction || ''
        if (tab==='homework') await adminCreateHomework(payload)
        else if (tab==='exercises') await adminCreateExercise(payload)
      }
      msg('Yaratildi ✅'); setShowForm(false); setForm({}); loadTab()
    } catch(e) { msg('',e.message) }
    finally { setLoading(false) }
  }

  const handleDelete = (id) => {
    setConfirmModal({
      title: "O'chirish",
      text: "Haqiqatan ham o'chirmoqchimisiz?",
      onConfirm: async () => {
        setConfirmModal(null)
        try {
          if (tab==='tests') await adminDeleteTest(id)
          else if (tab==='homework') await adminDeleteHomework(id)
          else if (tab==='exercises') await adminDeleteExercise(id)
          msg("O'chirildi ✅"); loadTab()
        } catch(e) { msg('',e.message) }
      }
    })
  }

  const handleDeleteAll = () => {
    if (tab === 'students') {
      setPromptModal({
        title: "Barcha o'quvchilarni o'chirish",
        text: "DIQQAT: Barcha o'quvchilar va ularning ma'lumotlari to'liq o'chib ketadi! Tasdiqlash uchun 'OCHIRISH' so'zini yozing:",
        placeholder: "OCHIRISH",
        onConfirm: async (ans) => {
          setPromptModal(null)
          if (ans !== 'OCHIRISH') {
            msg('', "Xato so'z kiritildi. Bekor qilindi.")
            return
          }
          executeDeleteAll()
        }
      })
    } else {
      setConfirmModal({
        title: "Barchasini o'chirish",
        text: `Haqiqatan ham barcha ${tab} ma'lumotlarini o'chirmoqchimisiz? Bu amalni orqaga qaytarib bo'lmaydi!`,
        onConfirm: () => {
          setConfirmModal(null)
          executeDeleteAll()
        }
      })
    }
  }

  const executeDeleteAll = async () => {
    try {
      setLoading(true)
      if (tab==='tests') await adminDeleteAllTests()
      else if (tab==='homework') await adminDeleteAllHomework()
      else if (tab==='exercises') await adminDeleteAllExercises()
      else if (tab==='students') await adminDeleteAllStudents()
      msg("Barchasi muvaffaqiyatli o'chirildi ✅"); loadTab()
    } catch(e) { msg('',e.message) }
    finally { setLoading(false) }
  }

  const handleDeleteStudent = (id, name) => {
    setConfirmModal({
      title: "O'quvchini o'chirish",
      text: `"${name}" ni o'chirmoqchimisiz? Bu amal qaytarilmas!`,
      onConfirm: async () => {
        setConfirmModal(null)
        try {
          await adminDeleteStudent(id)
          msg(`${name} o'chirildi ✅`); loadTab()
        } catch(e) { msg('',e.message) }
      }
    })
  }

  const openTransfer = (student) => {
    setTransferModal(student)
    setTrDir(student.course_direction || '')
    setTrSoha(student.subject || '')
    setTrTech(student.technology || '')
  }

  const doTransfer = async () => {
    if (!trDir || !trTech) { msg('', "Yo'nalish va texnologiya tanlang!"); return }
    try {
      await adminTransferCourse({ user_id: transferModal.id, new_direction: trDir, new_soha: trSoha || null, new_technology: trTech })
      msg("O'tkazildi ✅"); setTransferModal(null); loadTab()
    } catch(e) { msg('',e.message) }
  }

  const handleGrade = (hwId) => {
    setGradeScore('')
    setGradeComment('')
    setGradeModal(hwId)
  }

  const doGrade = async () => {
    if (!gradeScore) { msg('', "Ball kiriting!"); return }
    try {
      await adminGradeSubmission(gradeModal, { score: parseInt(gradeScore), comment: gradeComment })
      msg("Baholandi ✅"); setGradeModal(null); loadTab()
    } catch(e) { msg('',e.message) }
  }

  const getTechOpts = (dir, soha) => {
    if (dir === 'Microsoft dasturlari') return TECH_MAP.Microsoft
    if (dir === 'Dasturlash' && soha) return TECH_MAP[soha] || []
    return []
  }

  const tabs = [
    { id:'dashboard', icon:'📊', label:'Dashboard' },
    { id:'tests', icon:'📝', label:'Testlar' },
    { id:'homework', icon:'📋', label:'Vazifalar' },
    { id:'exercises', icon:'💪', label:'Mashqlar' },
    { id:'submissions', icon:'📥', label:'Topshirilganlar' },
    { id:'students', icon:'👨‍🎓', label:'Studentlar' },
    { id:'grades', icon:'📈', label:'Baholar' },
    { id:'rating', icon:'🏆', label:'Reyting' },
  ]

  return (
    <div className="panel-wrapper">
      
      <ConfirmModal 
        isOpen={!!confirmModal}
        {...confirmModal}
        onCancel={() => setConfirmModal(null)}
      />

      <PromptModal 
        isOpen={!!promptModal}
        {...promptModal}
        onCancel={() => setPromptModal(null)}
      />

      {/* Grade Modal */}
      {gradeModal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',backdropFilter:'blur(8px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,animation:'fadeIn 0.2s ease'}}>
          <div className="glass-card" style={{width:'420px',maxWidth:'90vw',animation:'slideUp 0.3s ease'}}>
            <h3 style={{color:'var(--text-primary)',marginBottom:'16px'}}>Baholash</h3>
            <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
              <div>
                <label style={{color:'var(--text-muted)',fontSize:'12px',display:'block',marginBottom:'4px'}}>Ball (0-2)</label>
                <input type="number" min="0" max="2" value={gradeScore} onChange={e => setGradeScore(e.target.value)} className="form-input" autoFocus />
              </div>
              <div>
                <label style={{color:'var(--text-muted)',fontSize:'12px',display:'block',marginBottom:'4px'}}>Izoh (ixtiyoriy)</label>
                <input type="text" value={gradeComment} onChange={e => setGradeComment(e.target.value)} className="form-input" onKeyDown={(e) => { if(e.key === 'Enter') doGrade() }} />
              </div>
            </div>
            <div style={{display:'flex',gap:'10px',marginTop:'20px'}}>
              <button onClick={() => setGradeModal(null)} className="form-input" style={{cursor:'pointer',textAlign:'center',flex:'0 0 auto',padding:'12px 20px'}}>Bekor</button>
              <button onClick={doGrade} className="gradient-btn" style={{flex:1}}>Saqlash</button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {transferModal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',backdropFilter:'blur(8px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,animation:'fadeIn 0.2s ease'}}>
          <div className="glass-card" style={{width:'420px',maxWidth:'90vw',animation:'slideUp 0.3s ease'}}>
            <h3 style={{color:'var(--text-primary)',marginBottom:'4px'}}>🔄 Kurs o'tkazish</h3>
            <p style={{color:'var(--text-muted)',fontSize:'13px',marginBottom:'20px'}}>{transferModal.fullname}</p>

            <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
              <div>
                <label style={{color:'var(--text-muted)',fontSize:'12px',display:'block',marginBottom:'4px'}}>Yo'nalish</label>
                <select value={trDir} onChange={e => { setTrDir(e.target.value); setTrSoha(''); setTrTech('') }} className="form-input">
                  <option value="">Tanlang...</option>
                  {DIRECTIONS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>

              {trDir === 'Dasturlash' && (
                <div>
                  <label style={{color:'var(--text-muted)',fontSize:'12px',display:'block',marginBottom:'4px'}}>Soha</label>
                  <select value={trSoha} onChange={e => { setTrSoha(e.target.value); setTrTech('') }} className="form-input">
                    <option value="">Tanlang...</option>
                    {(SOHA_MAP['Dasturlash']||[]).map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label style={{color:'var(--text-muted)',fontSize:'12px',display:'block',marginBottom:'4px'}}>Texnologiya</label>
                <select value={trTech} onChange={e => setTrTech(e.target.value)} className="form-input">
                  <option value="">Tanlang...</option>
                  {getTechOpts(trDir, trSoha).map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div style={{display:'flex',gap:'10px',marginTop:'20px'}}>
              <button onClick={doTransfer} className="gradient-btn" style={{flex:1}}>✅ O'tkazish</button>
              <button onClick={() => setTransferModal(null)} className="form-input" style={{cursor:'pointer',textAlign:'center',flex:'0 0 auto',padding:'12px 20px'}}>Bekor</button>
            </div>
          </div>
        </div>
      )}

      <header className="panel-header">
        <div className="panel-header-left">
          <button className="menu-toggle-btn" onClick={() => setIsSidebarOpen(true)}>☰</button>
          <span className="brand-icon">🎓</span>
          <span className="brand-name">Admin Panel</span>
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
            <button key={t.id} onClick={() => { setTab(t.id); setShowForm(false); setIsSidebarOpen(false) }}
              className={`panel-nav-btn ${tab===t.id?'active':''}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </nav>

        <main className="panel-content">
          {error && <div className="alert alert-error" style={{marginBottom:'16px'}}>⚠️ {error}</div>}
          {success && <div className="alert alert-success" style={{marginBottom:'16px'}}>✅ {success}</div>}

          {/* ═══ Filters ═══ */}
          {tab !== 'dashboard' && (
            <div className="filter-row">
              <select value={filterDir} onChange={e => { setFilterDir(e.target.value); setFilterTech('') }} className="filter-select">
                <option value="">🎯 Barcha yo'nalishlar</option>
                {DIRECTIONS.map(d => <option key={d}>{d}</option>)}
              </select>
              <select value={filterTech} onChange={e => setFilterTech(e.target.value)} className="filter-select">
                <option value="">💻 Barcha texnologiyalar</option>
                {ALL_TECHS.map(t => <option key={t}>{t}</option>)}
              </select>
              {['tests','homework','exercises'].includes(tab) && (
                <div style={{display:'flex', gap:'12px'}}>
                  <button onClick={() => { 
                    setShowForm(!showForm); 
                    if (!showForm && tab === 'tests') {
                      setForm({
                        direction: filterDir, 
                        technology: filterTech,
                        lesson_number: 1,
                        questions: Array.from({length: 10}, () => ({
                          question:'', option_a:'', option_b:'', option_c:'', option_d:'', correct_option:'A'
                        }))
                      })
                    } else {
                      setForm({direction:filterDir, technology:filterTech, lesson_number:1}) 
                    }
                  }} className="add-btn">
                    {showForm ? '✖ Yopish' : '➕ Qo\'shish'}
                  </button>
                  <button onClick={handleDeleteAll} className="delete-btn" style={{background:'var(--error)',color:'white',padding:'10px 18px',borderRadius:'var(--radius-sm)',fontWeight:600,fontSize:'13px'}}>
                    🗑 Barchasini o'chirish
                  </button>
                </div>
              )}
              {tab === 'students' && (
                <div style={{display:'flex',gap:'12px',alignItems:'center'}}>
                  <button onClick={handleDeleteAll} className="delete-btn" style={{background:'var(--error)',color:'white',padding:'10px 18px',borderRadius:'var(--radius-sm)',fontWeight:600,fontSize:'13px',boxShadow:'0 4px 15px rgba(255, 82, 82, 0.3)'}}>
                    🗑 Barcha studentlarni o'chirish
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ═══ Dashboard ═══ */}
          {tab === 'dashboard' && stats && (
            <div style={{animation:'fadeIn 0.4s ease'}}>
              <div className="welcome-card" style={{marginBottom:'24px'}}>
                <h1>Admin Dashboard 📊</h1>
                <p>O'quv markazi boshqaruv paneli</p>
              </div>
              <div className="stats-grid">
                {[
                  {l:'Jami studentlar', v:stats.total_students, i:'👨‍🎓', c:'var(--accent-cyan)'},
                  {l:'Faol', v:stats.active_students, i:'✅', c:'var(--success)'},
                  {l:'Testlar', v:stats.total_tests, i:'📝', c:'var(--accent-cyan)'},
                  {l:'Vazifalar', v:stats.total_homework, i:'📋', c:'#f59e0b'},
                  {l:'Mashqlar', v:stats.total_exercises, i:'💪', c:'#a855f7'},
                  {l:'Bugungi davomat', v:stats.today_attendance, i:'📅', c:'var(--success)'},
                ].map((s,i) => (
                  <div key={i} className="stat-card" style={{animationDelay: `${i * 0.05}s`}}>
                    <div className="stat-icon">{s.i}</div>
                    <div className="stat-label">{s.l}</div>
                    <div className="stat-value" style={{color:s.c}}>{s.v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ Create Form ═══ */}
          {showForm && ['tests','homework','exercises'].includes(tab) && (
            <div className="glass-card" style={{marginBottom:'24px',animation:'slideUp 0.3s ease',borderLeft:'3px solid var(--accent-cyan)'}}>
              <h3 style={{color:'var(--text-primary)',marginBottom:'16px',fontSize:'16px'}}>
                {tab==='tests' ? '📝 Yangi test qo\'shish' : tab==='homework' ? '📋 Yangi vazifa qo\'shish' : '💪 Yangi mashq qo\'shish'}
              </h3>
              <div className="form-grid">
                {/* Yo'nalish */}
                <div>
                  <label style={{color:'var(--text-muted)',fontSize:'12px',display:'block',marginBottom:'4px'}}>Yo'nalish *</label>
                  <select value={form.direction||''} onChange={e => setForm({...form, direction:e.target.value, soha:'', technology:''})} className="form-input">
                    <option value="">Tanlang...</option>
                    {DIRECTIONS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>

                {/* Soha */}
                {form.direction === 'Dasturlash' && (
                  <div>
                    <label style={{color:'var(--text-muted)',fontSize:'12px',display:'block',marginBottom:'4px'}}>Soha *</label>
                    <select value={form.soha||''} onChange={e => setForm({...form, soha:e.target.value, technology:''})} className="form-input">
                      <option value="">Tanlang...</option>
                      {(SOHA_MAP['Dasturlash']||[]).map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                )}

                {/* Texnologiya */}
                <div>
                  <label style={{color:'var(--text-muted)',fontSize:'12px',display:'block',marginBottom:'4px'}}>Texnologiya *</label>
                  <select value={form.technology||''} onChange={e => setForm({...form, technology:e.target.value})} className="form-input">
                    <option value="">Tanlang...</option>
                    {getTechOpts(form.direction, form.soha).map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>

                {/* Dars raqami */}
                <div>
                  <label style={{color:'var(--text-muted)',fontSize:'12px',display:'block',marginBottom:'4px'}}>Dars raqami</label>
                  <input type="number" min="1" placeholder="1" value={form.lesson_number||''} onChange={e => setForm({...form, lesson_number:parseInt(e.target.value)||1})} className="form-input" />
                </div>

                {/* Test fields (10 ta savol) */}
                {tab === 'tests' && form.questions && form.questions.map((q, idx) => (
                  <div key={idx} style={{gridColumn:'1/-1', background:'var(--input-bg)', padding:'16px', borderRadius:'var(--radius-sm)', border:'1px solid var(--input-border)', marginBottom:'12px'}}>
                    <h4 style={{color:'var(--accent-cyan)', marginBottom:'12px', fontSize:'14px'}}>{idx + 1}-Savol</h4>
                    <div className="form-grid">
                      <div style={{gridColumn:'1/-1'}}>
                        <label style={{color:'var(--text-muted)',fontSize:'12px',display:'block',marginBottom:'4px'}}>Savol *</label>
                        <input placeholder="Test savolini yozing..." value={q.question} onChange={e => {
                          const newQ = [...form.questions]; newQ[idx].question = e.target.value; setForm({...form, questions: newQ});
                        }} className="form-input" />
                      </div>
                      <div>
                        <label style={{color:'var(--text-muted)',fontSize:'12px',display:'block',marginBottom:'4px'}}>A variant *</label>
                        <input placeholder="A)" value={q.option_a} onChange={e => {
                          const newQ = [...form.questions]; newQ[idx].option_a = e.target.value; setForm({...form, questions: newQ});
                        }} className="form-input" />
                      </div>
                      <div>
                        <label style={{color:'var(--text-muted)',fontSize:'12px',display:'block',marginBottom:'4px'}}>B variant *</label>
                        <input placeholder="B)" value={q.option_b} onChange={e => {
                          const newQ = [...form.questions]; newQ[idx].option_b = e.target.value; setForm({...form, questions: newQ});
                        }} className="form-input" />
                      </div>
                      <div>
                        <label style={{color:'var(--text-muted)',fontSize:'12px',display:'block',marginBottom:'4px'}}>C variant</label>
                        <input placeholder="C)" value={q.option_c} onChange={e => {
                          const newQ = [...form.questions]; newQ[idx].option_c = e.target.value; setForm({...form, questions: newQ});
                        }} className="form-input" />
                      </div>
                      <div>
                        <label style={{color:'var(--text-muted)',fontSize:'12px',display:'block',marginBottom:'4px'}}>D variant</label>
                        <input placeholder="D)" value={q.option_d} onChange={e => {
                          const newQ = [...form.questions]; newQ[idx].option_d = e.target.value; setForm({...form, questions: newQ});
                        }} className="form-input" />
                      </div>
                      <div>
                        <label style={{color:'var(--text-muted)',fontSize:'12px',display:'block',marginBottom:'4px'}}>To'g'ri javob *</label>
                        <select value={q.correct_option} onChange={e => {
                          const newQ = [...form.questions]; newQ[idx].correct_option = e.target.value; setForm({...form, questions: newQ});
                        }} className="form-input">
                          <option>A</option><option>B</option><option>C</option><option>D</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Homework/Exercise fields */}
                {(tab==='homework' || tab==='exercises') && <>
                  <div style={{gridColumn:'1/-1'}}>
                    <label style={{color:'var(--text-muted)',fontSize:'12px',display:'block',marginBottom:'4px'}}>Sarlavha *</label>
                    <input placeholder="Vazifa/mashq sarlavhasi..." value={form.title||''} onChange={e => setForm({...form, title:e.target.value})} className="form-input" />
                  </div>
                  <div style={{gridColumn:'1/-1'}}>
                    <label style={{color:'var(--text-muted)',fontSize:'12px',display:'block',marginBottom:'4px'}}>Tavsif</label>
                    <textarea placeholder="Batafsil tavsif..." value={form.description||''} onChange={e => setForm({...form, description:e.target.value})} className="form-input" style={{minHeight:'80px',resize:'vertical'}} />
                  </div>
                </>}
              </div>

              <div style={{display:'flex',gap:'10px',marginTop:'20px'}}>
                <button onClick={handleCreate} disabled={loading} className="gradient-btn" style={{flex:1}}>
                  {loading ? '⏳ Saqlanmoqda...' : '✅ Saqlash'}
                </button>
                <button onClick={() => { setShowForm(false); setForm({}) }} className="logout-btn" style={{borderColor:'var(--glass-border)',color:'var(--text-muted)'}}>Bekor</button>
              </div>
            </div>
          )}

          {/* ═══ Data Tables ═══ */}
          {tab !== 'dashboard' && (
            <div style={{animation:'fadeIn 0.3s ease'}}>
              {loading ? <p className="loading-state">⏳ Yuklanmoqda...</p> :
              data.length === 0 ? <p className="empty-state">📭 Ma'lumot topilmadi</p> : (

                <div className="glass-card" style={{padding:'0',overflow:'hidden'}}>
                  <div style={{overflowX:'auto'}}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          {tab==='tests' && <><th>#</th><th>Savol</th><th>A</th><th>B</th><th>C</th><th>D</th><th>✅</th><th>Texnologiya</th><th>Dars</th><th></th></>}
                          {tab==='homework' && <><th>#</th><th>Sarlavha</th><th>Tavsif</th><th>Texnologiya</th><th>Dars</th><th></th></>}
                          {tab==='exercises' && <><th>#</th><th>Sarlavha</th><th>Tavsif</th><th>Texnologiya</th><th>Dars</th><th></th></>}
                          {tab==='students' && <><th>#</th><th>Ism</th><th>Telefon</th><th>Yo'nalish</th><th>Texnologiya</th><th>Status</th><th>Amallar</th></>}
                          {tab==='grades' && <><th>#</th><th>Ism</th><th>Davomat</th><th>Test</th><th>Vazifa</th><th>Jami</th></>}
                          {tab==='rating' && <><th>🏆</th><th>Ism</th><th>Test</th><th>Vazifa</th><th>Davomat</th><th>Jami</th></>}
                          {tab==='submissions' && <><th>#</th><th>Student</th><th>Vazifa</th><th>Link</th><th>Ball</th><th></th></>}
                        </tr>
                      </thead>
                      <tbody>
                        {data.map((r,i) => (
                          <tr key={r.id||i} className={`stagger-${(i%5)+1}`}>
                            {tab==='tests' && <>
                              <td style={{color:'var(--text-muted)'}}>{i+1}</td>
                              <td style={{maxWidth:'200px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.question}</td>
                              <td>{r.option_a}</td><td>{r.option_b}</td><td>{r.option_c}</td><td>{r.option_d}</td>
                              <td><span className="badge badge-success">{r.correct_option}</span></td>
                              <td><span className="badge badge-info">{r.technology}</span></td>
                              <td>{r.lesson_number}</td>
                              <td><button onClick={()=>handleDelete(r.id)} className="delete-btn" title="O'chirish">🗑</button></td>
                            </>}
                            {tab==='homework' && <>
                              <td style={{color:'var(--text-muted)'}}>{i+1}</td>
                              <td style={{fontWeight:500}}>{r.title}</td>
                              <td style={{maxWidth:'200px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:'var(--text-muted)'}}>{r.description||'—'}</td>
                              <td><span className="badge badge-info">{r.technology}</span></td>
                              <td>{r.lesson_number}</td>
                              <td><button onClick={()=>handleDelete(r.id)} className="delete-btn" title="O'chirish">🗑</button></td>
                            </>}
                            {tab==='exercises' && <>
                              <td style={{color:'var(--text-muted)'}}>{i+1}</td>
                              <td style={{fontWeight:500}}>{r.title}</td>
                              <td style={{maxWidth:'200px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:'var(--text-muted)'}}>{r.description||'—'}</td>
                              <td><span className="badge badge-info">{r.technology}</span></td>
                              <td>{r.lesson_number}</td>
                              <td><button onClick={()=>handleDelete(r.id)} className="delete-btn" title="O'chirish">🗑</button></td>
                            </>}
                            {tab==='students' && <>
                              <td style={{color:'var(--text-muted)'}}>{i+1}</td>
                              <td style={{fontWeight:600}}>{r.fullname}</td>
                              <td style={{color:'var(--text-muted)',fontSize:'12px'}}>{r.telegram_number}</td>
                              <td>{r.course_direction}</td>
                              <td><span className="badge badge-info">{r.technology}</span></td>
                              <td><span className={`badge ${r.status==='active'?'badge-success':'badge-error'}`}>{r.status==='active'?'Faol':'Nofaol'}</span></td>
                              <td>
                                <div style={{display:'flex',gap:'6px'}}>
                                  <button onClick={()=>openTransfer(r)} className="action-btn" title="Kurs o'tkazish">🔄</button>
                                  <button onClick={()=>handleDeleteStudent(r.id,r.fullname)} className="delete-btn" title="O'chirish" style={{color:'var(--error)'}}>🗑</button>
                                </div>
                              </td>
                            </>}
                            {tab==='grades' && <>
                              <td style={{color:'var(--text-muted)'}}>{i+1}</td>
                              <td style={{fontWeight:500}}>{r.fullname}</td>
                              <td><span className={`badge ${r.attendance==='keldi'?'badge-success':'badge-error'}`}>{r.attendance==='keldi'?'✅ Keldi':'❌ Kelmadi'}</span></td>
                              <td>{r.test_score}</td>
                              <td>{r.hw_score}</td>
                              <td style={{fontWeight:700,color:'var(--accent-cyan)',fontSize:'16px'}}>{r.total_score}</td>
                            </>}
                            {tab==='rating' && <>
                              <td className={i===0?'rating-medal-1':i===1?'rating-medal-2':i===2?'rating-medal-3':''} style={{fontWeight:700,fontSize:'16px',color:i<3?'gold':'var(--text-muted)'}}>
                                {i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1}
                              </td>
                              <td style={{fontWeight:600}}>{r.fullname}</td>
                              <td><span className="badge badge-info">{r.test_balls}</span></td>
                              <td><span className="badge badge-success">{r.hw_balls}</span></td>
                              <td>{r.attendance_days}</td>
                              <td style={{fontWeight:700,color:'var(--accent-cyan)',fontSize:'16px'}}>{r.total}</td>
                            </>}
                            {tab==='submissions' && <>
                              <td style={{color:'var(--text-muted)'}}>{i+1}</td>
                              <td style={{fontWeight:500}}>{r.fullname}</td>
                              <td>{r.title||'—'}</td>
                              <td>{r.homework_link ? <a href={r.homework_link} target="_blank" rel="noopener" style={{color:'var(--accent-cyan)',textDecoration:'none'}}>🔗 Ko'rish</a> : r.file_data ? '📎 Fayl' : '—'}</td>
                              <td>{r.score!==null && r.score!==undefined ? <span className="badge badge-success">{r.score} ball</span> : <span className="badge badge-error">—</span>}</td>
                              <td>{(r.score===null||r.score===undefined) ? <button onClick={()=>handleGrade(r.id)} className="action-btn">⭐ Baholash</button> : <span style={{color:'var(--success)'}}>✅</span>}</td>
                            </>}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{padding:'12px 16px',borderTop:'1px solid var(--glass-border)',color:'var(--text-muted)',fontSize:'12px'}}>
                    Jami: {data.length} ta
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default AdminPanel
