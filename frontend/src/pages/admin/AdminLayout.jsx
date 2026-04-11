import { useState, useEffect, useRef } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import axios from 'axios'

const navItems = [
  { to: '/admin',         label: 'Dashboard',      icon: '🏠', end: true },
  { to: '/admin/lost',    label: 'Lost Items',      icon: '🔍' },
  { to: '/admin/found',   label: 'Found Items',     icon: '✅' },
  { to: '/admin/claims',  label: 'Claim Requests',  icon: '📋' },
  { to: '/admin/users',   label: 'Users',           icon: '👥' },
  { to: '/admin/reports', label: 'Reports',         icon: '📊' },
]

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [showNotif, setShowNotif] = useState(false)
  const navigate = useNavigate()
  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}')
  const token = localStorage.getItem('adminToken')
  const headers = { Authorization: `Bearer ${token}` }
  const notifRef = useRef(null)

  const fetchNotifications = () => {
    axios.get('http://localhost:5000/api/admin/notifications', { headers })
      .then(r => setNotifications(r.data))
      .catch(() => {})
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target))
        setShowNotif(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleOpenNotif = () => {
    setShowNotif(!showNotif)
    if (!showNotif) {
      axios.put('http://localhost:5000/api/admin/notifications/read', {}, { headers })
        .then(() => setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 }))))
        .catch(() => {})
    }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    navigate('/admin/login')
  }

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-brand">
          <span style={{ fontSize: '1.4rem' }}>🎒</span>
          {!collapsed && <span>Lost&amp;Found</span>}
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end}
              className={({ isActive }) => isActive ? 'active' : ''}>
              <span className="nav-icon">{item.icon}</span>
              {!collapsed && item.label}
            </NavLink>
          ))}
          <button className="sidebar-logout" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            {!collapsed && 'Logout'}
          </button>
        </nav>
        <button className="sidebar-toggle-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? '›' : '‹'}
        </button>
      </aside>

      <main className={`admin-main ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="admin-topbar">
          <div style={{ fontWeight: 600, color: '#374151', fontSize: '0.95rem' }}>
            Welcome, {adminUser.name || 'Admin'}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>

            {/* ✅ Notification Bell */}
            <div ref={notifRef} onClick={handleOpenNotif}
              style={{ position: 'relative', cursor: 'pointer' }}>
              <span style={{ fontSize: '1.3rem' }}>🔔</span>
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-6px', right: '-6px',
                  background: '#ef4444', color: 'white', fontSize: '0.65rem',
                  fontWeight: 700, width: '18px', height: '18px',
                  borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                }}>{unreadCount}</span>
              )}

              {showNotif && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 12px)', right: 0,
                  width: '320px', background: 'white', borderRadius: '12px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                  zIndex: 3000, maxHeight: '380px', overflowY: 'auto',
                }}>
                  <div style={{
                    padding: '12px 16px', fontWeight: 700, fontSize: '0.9rem',
                    borderBottom: '1px solid #f3f4f6',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <span style={{
                        background: '#ef4444', color: 'white', fontSize: '0.72rem',
                        padding: '2px 8px', borderRadius: '20px',
                      }}>{unreadCount} new</span>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem' }}>
                      No notifications yet.
                    </div>
                  ) : notifications.map(n => (
                    <div key={n.id} style={{
                      padding: '12px 16px', borderBottom: '1px solid #f3f4f6',
                      background: !n.is_read ? '#eff6ff' : 'white',
                    }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: !n.is_read ? 600 : 400 }}>
                        {n.message}
                      </div>
                      {n.sender_name && (
                        <div style={{ fontSize: '0.78rem', color: '#3b82f6', marginTop: '2px' }}>
                          by {n.sender_name}
                        </div>
                      )}
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '3px' }}>
                        {new Date(n.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button onClick={handleLogout} style={{
              background: '#fee2e2', color: '#dc2626', border: 'none',
              padding: '6px 14px', borderRadius: '6px', cursor: 'pointer',
              fontWeight: 600, fontSize: '0.85rem',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              🚪 Logout
            </button>
          </div>
        </div>

        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}