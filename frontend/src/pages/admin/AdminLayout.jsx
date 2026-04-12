import { useState, useEffect, useRef } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import axios from 'axios'

const NAV = [
  { to: '/admin',         icon: '📊', label: 'Dashboard',      end: true },
  { to: '/admin/lost',    icon: '🔍', label: 'Lost Items' },
  { to: '/admin/found',   icon: '✅', label: 'Found Items' },
  { to: '/admin/claims',  icon: '📋', label: 'Claim Requests' },
  { to: '/admin/users',   icon: '👥', label: 'Users' },
  { to: '/admin/reports', icon: '📈', label: 'Reports' },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const [collapsed, setCollapsed]         = useState(false)
  const [notifications, setNotifications] = useState([])
  const [showNotif, setShowNotif]         = useState(false)
  const notifRef = useRef(null)
  const token    = localStorage.getItem('adminToken')

  // Fetch admin notifications
  useEffect(() => {
    if (!token) return
    const fetchNotifs = () => {
      axios
        .get('http://localhost:5000/api/admin/notifications', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((r) => setNotifications(r.data))
        .catch(() => {})
    }
    fetchNotifs()
    const interval = setInterval(fetchNotifs, 30000) // refresh every 30s
    return () => clearInterval(interval)
  }, [token])

  // Close dropdown on outside click
  useEffect(() => {
    const handle = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target))
        setShowNotif(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    navigate('/admin/login')
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  const handleOpenNotif = () => {
    setShowNotif((prev) => !prev)
    if (!showNotif && unreadCount > 0 && token) {
      axios
        .put('http://localhost:5000/api/admin/notifications/read', {}, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() =>
          setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })))
        )
        .catch(() => {})
    }
  }

  return (
    <div className="admin-layout">

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className={`admin-sidebar${collapsed ? ' collapsed' : ''}`}>
        <div className="sidebar-brand">
          <span>🎒</span>
          {!collapsed && <span>Lost &amp; Found</span>}
        </div>

        <nav className="sidebar-nav">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              <span className="nav-icon">{item.icon}</span>
              {!collapsed && item.label}
            </NavLink>
          ))}
        </nav>

        <button className="sidebar-logout" onClick={handleLogout}>
          <span className="nav-icon">🚪</span>
          {!collapsed && 'Logout'}
        </button>

        <button
          className="sidebar-toggle-btn"
          onClick={() => setCollapsed((c) => !c)}
        >
          {collapsed ? '›' : '‹'}
        </button>
      </aside>

      {/* ── Main ────────────────────────────────────────────── */}
      <main className={`admin-main${collapsed ? ' sidebar-collapsed' : ''}`}>

        {/* Top bar */}
        <div className="admin-topbar">
          <span style={{ fontWeight: 600, color: '#374151' }}>Admin Panel</span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>

            {/* 🔔 Notification Bell */}
            <div
              className="notif-bell"
              ref={notifRef}
              onClick={handleOpenNotif}
              style={{ cursor: 'pointer', position: 'relative' }}
            >
              <span style={{ fontSize: '1.4rem' }}>🔔</span>

              {unreadCount > 0 && (
                <span className="notif-badge">{unreadCount}</span>
              )}

              {showNotif && (
                <div
                  className="notif-dropdown"
                  style={{ right: 0, top: 'calc(100% + 10px)' }}
                >
                  {/* Dropdown header */}
                  <div style={{
                    padding: '12px 16px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    borderBottom: '1px solid #f3f4f6',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <span style={{
                        background: '#ef4444',
                        color: 'white',
                        borderRadius: '12px',
                        padding: '2px 8px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                      }}>
                        {unreadCount} new
                      </span>
                    )}
                  </div>

                  {/* Notification list */}
                  {notifications.length === 0 ? (
                    <div className="notif-item">No notifications yet.</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`notif-item${!n.is_read ? ' unread' : ''}`}
                      >
                        <div>{n.message}</div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '3px' }}>
                          {new Date(n.created_at).toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}

                  {/* View all link */}
                  {notifications.length > 0 && (
                    <div style={{
                      padding: '10px 16px',
                      textAlign: 'center',
                      borderTop: '1px solid #f3f4f6',
                    }}>
                      <NavLink
                        to="/admin/claims"
                        style={{ color: '#1a1a2e', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}
                        onClick={() => setShowNotif(false)}
                      >
                        View All Claims →
                      </NavLink>
                    </div>
                  )}
                </div>
              )}
            </div>

            <span style={{ fontSize: '0.9rem', color: '#374151' }}>👤 Admin</span>

            <button
              onClick={handleLogout}
              style={{
                background: '#ef4444',
                color: 'white',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Page content */}
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}