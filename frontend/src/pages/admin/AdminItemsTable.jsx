import { useState, useEffect } from 'react'
import axios from 'axios'

export default function AdminItemsTable({ type }) {
  const [items, setItems]     = useState([])
  const [search, setSearch]   = useState('')
  const [loading, setLoading] = useState(true)
  const [editItem, setEditItem] = useState(null)
  const token   = localStorage.getItem('adminToken')
  const headers = { Authorization: `Bearer ${token}` }

  const fetchItems = async () => {
    setLoading(true)
    try {
      // Admin Lost Items: type=lost (all statuses)
      // Admin Found Items: type=lost + status=Found
      const params = { search: search || undefined }
      if (type === 'lost') {
        params.type = 'lost'
      } else {
        params.type   = 'lost'
        params.status = 'Found'
      }
      const res = await axios.get(`http://localhost:5000/api/admin/items`, { headers, params })
      setItems(res.data)
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { fetchItems() }, [type])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return
    try {
      await axios.delete(`http://localhost:5000/api/admin/items/${id}`, { headers })
      setItems(items.filter(i => i.id !== id))
    } catch {}
  }

  const handleStatusChange = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/items/${id}`, { status }, { headers })
      setItems(items.map(i => i.id === id ? { ...i, status } : i))
    } catch {}
  }

  // items ENUM: 'Pending', 'Found', 'Resolved'
  const statusBadge = (s) => {
    const map = {
      'Pending':  ['#fef3c7', '#92400e', 'Pending'],
      'Found':    ['#e0e7ff', '#3730a3', 'Found'],
      'Resolved': ['#d1fae5', '#065f46', 'Resolved'],
    }
    const [bg, col, label] = map[s] || ['#f3f4f6', '#374151', s]
    return (
      <span style={{ background: bg, color: col, padding: '3px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600 }}>
        {label}
      </span>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ fontWeight: 700, margin: '0 0 4px' }}>
          {type === 'lost' ? '🔍 Lost Items' : '✅ Found Items'}
        </h4>
        <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>
          {type === 'lost' ? 'All lost items reported in the system' : 'Lost items that have been found'}
        </p>
      </div>

      <div className="admin-table-card">
        <div className="admin-table-header">
          <h5>{type === 'lost' ? 'Lost Items' : 'Found Items'} ({items.length})</h5>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div className="admin-search">
              <span>🔍</span>
              <input placeholder="Search items..." value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchItems()} />
            </div>
            <button className="btn-primary-custom" onClick={fetchItems}>Search</button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Category</th>
                <th>Description</th>
                <th>Date</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: '#9ca3af' }}>Loading...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: '#9ca3af' }}>No items found.</td></tr>
              ) : items.map(item => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600 }}>{item.title}</td>
                  <td>{item.category}</td>
                  <td style={{ maxWidth: '200px' }}>
                    <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>
                      {item.description?.slice(0, 60)}{item.description?.length > 60 ? '...' : ''}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: '#6b7280', whiteSpace: 'nowrap' }}>
                    {item.date_occurred ? new Date(item.date_occurred).toLocaleDateString() : '—'}
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{item.location}</td>
                  <td>{statusBadge(item.status)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button className="btn-icon red" onClick={() => handleDelete(item.id)} title="Delete">🗑</button>
                      <button className="btn-icon orange" onClick={() => setEditItem(item)} title="Edit Status">✏️</button>
                      {item.photo && (
                        <a href={`http://localhost:5000/uploads/${item.photo}`} target="_blank" rel="noreferrer">
                          <button className="btn-icon teal" title="View Photo">👁</button>
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination-bar">
          <span>Displaying 1 to {items.length} of {items.length} items</span>
        </div>
      </div>

      {/* Edit Status Modal */}
      {editItem && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h5>Update Status</h5>
              <button className="modal-close" onClick={() => setEditItem(null)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: '12px', color: '#374151' }}><strong>{editItem.title}</strong></p>
              <div className="form-group">
                <label>New Status</label>
                {/* ✅ Exact DB ENUM values */}
                <select className="form-control-custom" defaultValue={editItem.status}
                  onChange={e => setEditItem({ ...editItem, status: e.target.value })}>
                  <option value="Pending">Pending</option>
                  <option value="Found">Found</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-primary-custom" onClick={() => {
                handleStatusChange(editItem.id, editItem.status)
                setEditItem(null)
              }}>Save</button>
              <button onClick={() => setEditItem(null)} style={{
                padding: '10px 20px', background: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer',
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}