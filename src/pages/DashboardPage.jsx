function DashboardPage({ user, onLogout }) {
  const info = [
    { label: "Yo'nalish", value: user.direction, icon: '🧭' },
    { label: 'Soha', value: user.soha, icon: '📂' },
    { label: 'Texnologiya', value: user.technology, icon: '💻' },
    { label: 'Telefon', value: user.phone ? `+${user.phone}` : '—', icon: '📱' },
    { label: 'Rol', value: user.role === 'admin' ? 'Administrator' : 'Talaba', icon: '👤' },
  ].filter(i => i.value)

  return (
    <div className="auth-page" style={{justifyContent: 'flex-start', paddingTop: '0'}}>
      <div className="floating-orbs"><div className="orb orb-1"/><div className="orb orb-2"/><div className="orb orb-3"/></div>

      {/* Header */}
      <header style={{
        width: '100%', maxWidth: '800px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 0', borderBottom: '1px solid var(--glass-border)', marginBottom: '32px',
      }}>
        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
          <span style={{fontSize: '28px'}}>🎓</span>
          <span style={{color: 'var(--text-primary)', fontWeight: 600, fontSize: '18px'}}>O'quv Markazi</span>
        </div>
        <button onClick={onLogout} style={{
          background: 'rgba(255,82,82,0.15)', border: '1px solid rgba(255,82,82,0.3)', borderRadius: '10px',
          color: '#ff5252', padding: '8px 20px', cursor: 'pointer', fontSize: '14px', fontWeight: 500,
          transition: 'all 0.3s ease', fontFamily: 'var(--font-family)',
        }}
        onMouseEnter={e => { e.target.style.background = 'rgba(255,82,82,0.25)'; e.target.style.transform = 'translateY(-1px)' }}
        onMouseLeave={e => { e.target.style.background = 'rgba(255,82,82,0.15)'; e.target.style.transform = 'translateY(0)' }}
        >
          🚪 Chiqish
        </button>
      </header>

      {/* Welcome */}
      <div style={{
        width: '100%', maxWidth: '800px',
        background: 'var(--glass-bg)', backdropFilter: 'blur(var(--glass-blur))',
        border: '1px solid var(--glass-border)', borderRadius: '20px', padding: '40px',
        marginBottom: '24px', animation: 'slideUp 0.5s ease', textAlign: 'center',
      }}>
        <h1 style={{
          fontSize: '32px', fontWeight: 700, margin: '0 0 8px',
          background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          Salom, {user.fullname}! 👋
        </h1>
        <p style={{color: 'var(--text-muted)', margin: 0, fontSize: '16px'}}>
          Platformaga xush kelibsiz
        </p>
      </div>

      {/* Info Grid */}
      <div style={{
        width: '100%', maxWidth: '800px',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px',
        animation: 'slideUp 0.6s ease',
      }}>
        {info.map((item, i) => (
          <div key={i} style={{
            background: 'var(--glass-bg)', backdropFilter: 'blur(var(--glass-blur))',
            border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '24px',
            transition: 'all 0.3s ease', cursor: 'default',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-cyan)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <div style={{fontSize: '28px', marginBottom: '12px'}}>{item.icon}</div>
            <div style={{color: 'var(--text-muted)', fontSize: '13px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px'}}>{item.label}</div>
            <div style={{color: 'var(--text-primary)', fontSize: '18px', fontWeight: 600}}>{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DashboardPage
