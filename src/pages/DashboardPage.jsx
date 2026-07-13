import { useState } from 'react'

function DashboardPage({ user, onLogout }) {
  const [showConfirm, setShowConfirm] = useState(false)

  const getInitials = (name) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin': return { label: 'Admin', className: 'badge-purple' }
      case 'teacher': return { label: "O'qituvchi", className: 'badge-cyan' }
      default: return { label: 'Talaba', className: 'badge-green' }
    }
  }

  const roleBadge = getRoleBadge(user?.role)
  const displayName = user?.fullname || user?.email || 'Foydalanuvchi'

  const stats = [
    { icon: '📚', label: 'Kurslar', value: '—', colorClass: 'stat-icon-cyan' },
    { icon: '📝', label: 'Topshiriqlar', value: '—', colorClass: 'stat-icon-purple' },
    { icon: '✅', label: 'Bajarilgan', value: '—', colorClass: 'stat-icon-green' },
    { icon: '⏳', label: 'Jarayonda', value: '—', colorClass: 'stat-icon-orange' },
  ]

  const userInfo = [
    { icon: '👤', label: 'Ism Familiya', value: user?.fullname || '—' },
    { icon: '📱', label: 'Telefon', value: user?.phone || '—' },
    { icon: '🧭', label: "Yo'nalish", value: user?.direction || '—' },
    { icon: '📖', label: 'Soha', value: user?.subject || '—' },
    { icon: '💻', label: 'Texnologiya', value: user?.technology || '—' },
    { icon: '🏷️', label: 'Role', value: roleBadge.label },
  ]

  return (
    <div className="dashboard">
      {/* Logout Confirmation */}
      {showConfirm && (
        <div className="confirm-overlay" onClick={() => setShowConfirm(false)}>
          <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
            <h3>Chiqishni tasdiqlang</h3>
            <p>Haqiqatan ham tizimdan chiqmoqchimisiz?</p>
            <div className="confirm-actions">
              <button className="btn btn-ghost" onClick={() => setShowConfirm(false)}>
                Bekor qilish
              </button>
              <button className="btn btn-danger" onClick={onLogout}>
                Chiqish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <span>🎓</span>
          <span>O'quv Markazi</span>
        </div>
        <div className="dashboard-user">
          <span className={`badge ${roleBadge.className}`}>{roleBadge.label}</span>
          <div className="dashboard-avatar">
            {getInitials(displayName)}
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowConfirm(true)}>
            Chiqish
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="dashboard-content">
        {/* Welcome Card */}
        <div className="welcome-card">
          <h2>
            Xush kelibsiz, <span className="gradient-text">{displayName}</span>! 👋
          </h2>
          <p>
            O'quv Markazi ta'lim platformasiga xush kelibsiz. Bu yerda siz o'z kurslaringiz va topshiriqlaringizni boshqarishingiz mumkin.
          </p>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          {stats.map((stat, i) => (
            <div className="stat-card" key={i}>
              <div className={`stat-icon ${stat.colorClass}`}>{stat.icon}</div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* User Info */}
        <div className="glass-card" style={{ marginBottom: 'var(--space-xl)' }}>
          <h3 style={{ marginBottom: 'var(--space-lg)' }}>
            📋 Shaxsiy ma'lumotlar
          </h3>
          <div className="info-grid">
            {userInfo.map((item, i) => (
              <div className="info-item" key={i}>
                <div className="info-item-icon">{item.icon}</div>
                <div>
                  <div className="info-item-label">{item.label}</div>
                  <div className="info-item-value">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
