import { useState, useEffect } from 'react'
import axios from 'axios'
import UserNavbar from '../../components/UserNavbar'
import ItemCard from '../../components/ItemCard'
import ItemDetailModal from '../../components/ItemDetailModal'
import SiteFooter from '../../components/SiteFooter'

export default function Dashboard() {
  const [myItems, setMyItems] = useState([])
  const [myClaims, setMyClaims] = useState([])
  const [notifications, setNotifications] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [activeTab, setActiveTab] = useState('items')
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [itemsRes, claimsRes, notifsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/items', { params: {} }),
          axios.get('http://localhost:5000/api/claims/my', { headers }),
          axios.get('http://localhost:5000/api/notifications', { headers }),
        ])
        setMyItems(itemsRes.data.filter(i => i.user_id === user?.id))
        setMyClaims(claimsRes.data)
        setNotifications(notifsRes.data)
        // Mark all as read
        axios.put('http://localhost:5000/api/notifications/read', {}, { headers }).catch(() => {})
      } catch {}
      finally { setLoading(false) }
    }
    fetchAll()
  }, [])

  const unread = notifications.filter(n => !n.is_read).length

  const claimStatusStyle = (s) => {
    if (s === 'approved') return { background: '#d1fae5', color: '#065f46' }
    if (s === 'rejected') return { background: '#fee2e2', color: '#dc2626' }
    return { background: '#fef3c7', color: '#92400e' }
  }

  return (
    <div>
      <UserNavbar />
      <div style={{ background: 'var(--primary)', color: 'white', padding: '32px 20px' }}>
        <div className="container">
          <h2 style={{ fontWeight: 700, margin: '0 0 4px' }}>👤 My Dashboard</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0 }}>Welcome back, {user?.name}</p>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 20px', maxWidth: '1100px' }}>
        {/* Stats Row */}
        <div className="row g-3 mb-4">
          {[
            { label: 'My Reports', value: myItems.length, icon: '📋', color: '#dbeafe' },
            { label: 'My Claims', value: myClaims.length, icon: '📝', color: '#d1fae5' },
            { label: 'Notifications', value: unread, icon: '🔔', color: '#fef3c7' },
          ].map(s => (
            <div className="col-md-4" key={s.label}>
              <div style={{
                background: 'white', borderRadius: '12px', padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '16px',
              }}>
                <div style={{
                  width: '52px', height: '52px', background: s.color,
                  borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
                }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{s.value}</div>
                  <div style={{ fontSize: '0.82rem', color: '#6b7280' }}>{s.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '4px', background: '#e5e7eb', borderRadius: '8px', padding: '4px', width: 'fit-content', marginBottom: '24px' }}>
          {[
            { key: 'items', label: '📋 My Reports' },
            { key: 'notifications', label: `🔔 Notifications${unread > 0 ? ` (${unread})` : ''}` },
            { key: 'claims', label: '📝 My Claims' },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
              padding: '8px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer',
              background: activeTab === t.key ? 'var(--primary)' : 'transparent',
              color: activeTab === t.key ? 'white' : '#6b7280',
              fontWeight: 500, fontSize: '0.9rem', transition: 'all 0.2s',
            }}>{t.label}</button>
          ))}
        </div>

        {/* My Reports Tab */}
        {activeTab === 'items' && (
          <div>
            {loading ? <p>Loading...</p> : myItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px', color: '#9ca3af' }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📭</div>
                <p>You haven't reported any items yet.</p>
              </div>
            ) : (
              <div className="row row-cols-1 row-cols-md-3 g-4">
                {myItems.map(item => (
                  <div className="col" key={item.id}>
                    <ItemCard item={item} onClick={() => setSelectedItem(item)} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            {notifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px', color: '#9ca3af' }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔔</div>
                <p>No notifications yet.</p>
              </div>
            ) : notifications.map(n => (
              <div key={n.id} style={{
                padding: '16px 20px', borderBottom: '1px solid #f3f4f6',
                background: !n.is_read ? '#eff6ff' : 'white',
                display: 'flex', alignItems: 'flex-start', gap: '12px',
              }}>
                <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{!n.is_read ? '🔵' : '⚪'}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 4px', fontSize: '0.9rem' }}>{n.message}</p>
                  <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* My Claims Tab */}
        {activeTab === 'claims' && (
          <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            {myClaims.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px', color: '#9ca3af' }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📝</div>
                <p>You haven't submitted any claims yet.</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Item</th><th>Type</th><th>Status</th><th>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {myClaims.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600 }}>{c.item_title}</td>
                      <td>
                        <span style={{
                          padding: '3px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600,
                          background: c.item_type === 'lost' ? '#fee2e2' : '#d1fae5',
                          color: c.item_type === 'lost' ? '#dc2626' : '#065f46',
                        }}>{c.item_type?.toUpperCase()}</span>
                      </td>
                      <td>
                        <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600, ...claimStatusStyle(c.status) }}>
                          {c.status?.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ color: '#6b7280', fontSize: '0.85rem' }}>{new Date(c.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      <SiteFooter />
      {selectedItem && <ItemDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
    </div>
  )
}