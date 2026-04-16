import { useState, useEffect } from 'react'
import axios from 'axios'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const token = localStorage.getItem('adminToken')
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    axios.get('http://localhost:5000/api/admin/users', { headers })
      .then(r => setUsers(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user? This will also delete all their items and claims.')) return
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`, { headers })
      setUsers(users.filter(u => u.id !== id))
    } catch {}
  }

  const filtered = users.filter(u =>
    !search ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ fontWeight: 700, margin: '0 0 4px' }}>👥 Users</h4>
        <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>Manage all registered users</p>
      </div>

      <div className="admin-table-card">
        <div className="admin-table-header">
          <h5>All Users ({filtered.length})</h5>
          <div className="admin-search">
            <span>🔍</span>
            <input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: '#9ca3af' }}>Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: '#9ca3af' }}>No users found.</td></tr>
              ) : filtered.map(u => (
                <tr key={u.id}>
                  <td style={{ color: '#6b7280', fontWeight: 600 }}>{u.id}</td>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td style={{ fontSize: '0.88rem', color: '#6b7280' }}>{u.email}</td>
                  <td>
                    <span style={{
                      background: u.role === 'admin' ? '#ede9fe' : u.role === 'staff' ? '#dbeafe' : '#f3f4f6',
                      color: u.role === 'admin' ? '#7c3aed' : u.role === 'staff' ? '#1e40af' : '#374151',
                      padding: '3px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600,
                    }}>{u.role?.toUpperCase()}</span>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <button className="btn-icon red" onClick={() => handleDelete(u.id)} title="Delete User">🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination-bar">
          <span>Displaying 1 to {filtered.length} of {filtered.length} users</span>
        </div>
      </div>
    </div>
  )
}