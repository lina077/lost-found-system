import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function UserNavbar() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const token = localStorage.getItem('token')
  const [notifications, setNotifications] = useState([])
  const [showNotif, setShowNotif] = useState(false)
  const notifRef = useRef(null)

  useEffect(() => {
    if (!token) return
    axios.get('http://localhost:5000/api/notifications', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => setNotifications(r.data)).catch(() => {})
  }, [token])

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/user/login')
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  const handleOpenNotif = () => {
    setShowNotif(!showNotif)
    if (!showNotif && token) {
      axios.put('http://localhost:5000/api/notifications/read', {}, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(() => setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })))).catch(() => {})
    }
  }

  return (
    <nav className="user-navbar">
      <Link className="brand" to="/user">
        <span>🎒</span> Found &amp; Lost
      </Link>

      <ul className="nav-links">
        <li><NavLink to="/user" end>Home</NavLink></li>
        <li><NavLink to="/user/lost">Lost Items</NavLink></li>
        <li><NavLink to="/user/found">Found Items</NavLink></li>
        <li><NavLink to="/user/how">How It Works</NavLink></li>
      </ul>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {user ? (
          <>
            {/* Notification Bell */}
            <div className="notif-bell" ref={notifRef} onClick={handleOpenNotif}>
              <span style={{ fontSize: '1.3rem', color: 'white' }}>🔔</span>
              {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
              {showNotif && (
                <div className="notif-dropdown">
                  <div style={{ padding: '12px 16px', fontWeight: 700, fontSize: '0.9rem', borderBottom: '1px solid #f3f4f6' }}>
                    Notifications
                  </div>
                  {notifications.length === 0 ? (
                    <div className="notif-item">No notifications yet.</div>
                  ) : notifications.map(n => (
                    <div key={n.id} className={`notif-item ${!n.is_read ? 'unread' : ''}`}>
                      <div>{n.message}</div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '3px' }}>
                        {new Date(n.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <NavLink to="/user/dashboard" style={{ color: '#1a1a2e', textDecoration: 'none', fontSize: '0.9rem'}}>
              👤 {user.name}
            </NavLink>
            <button onClick={handleLogout} style={{
              background: 'rgba(239,68,68,0.8)', color: 'white', border: 'none',
              padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem',
            }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/user/login" style={{ color: '#374151', textDecoration: 'none', fontSize: '0.9rem' }}>
            Login
            </Link>
            <Link to="/user/register" style={{
              background: '#1a1a2e', color: 'white', textDecoration: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '0.9rem',}}>
             Register
            </Link>
          </>
        )}
        <Link to="/user/report" className="btn-report-item">
          + Report Item
        </Link>
      </div>
    </nav>
  )
}