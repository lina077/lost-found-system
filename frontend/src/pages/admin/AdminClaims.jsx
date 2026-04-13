import { useState, useEffect } from 'react'
import axios from 'axios'

export default function AdminClaims() {
  const [claims, setClaims]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState(null)
  const [search, setSearch]     = useState('')
  const token   = localStorage.getItem('adminToken')
  const headers = { Authorization: `Bearer ${token}` }

  const fetchClaims = async () => {
    setLoading(true)
    try {
      const res = await axios.get('http://localhost:5000/api/admin/claims', { headers })
      setClaims(res.data)
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { fetchClaims() }, [])

  // ✅ Send 'approved'/'rejected' — backend maps to 'Approved'/'Rejected'
  const handleStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/claims/${id}`, { status }, { headers })
      fetchClaims()
      setSelected(null)
    } catch {}
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this claim?')) return
    try {
      await axios.delete(`http://localhost:5000/api/admin/claims/${id}`, { headers })
      fetchClaims()
      setSelected(null)
    } catch {}
  }

  const filtered = claims.filter((c) =>
    c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.item_title?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  )

  // ✅ DB ENUM: 'Pending','Approved','Rejected'
  const statusBadge = (s) => {
    const map = {
      'Pending':  { bg: '#fef3c7', color: '#92400e' },
      'Approved': { bg: '#d1fae5', color: '#065f46' },
      'Rejected': { bg: '#fee2e2', color: '#dc2626' },
    }
    const st = map[s] || map['Pending']
    return (
      <span style={{
        background: st.bg, color: st.color,
        padding: '3px 10px', borderRadius: '20px',
        fontSize: '0.75rem', fontWeight: 600,
      }}>
        {s}
      </span>
    )
  }

  return (
    <div>
      <h4 style={{ fontWeight: 700, marginBottom: '20px' }}>Claim Requests</h4>

      <div className="admin-table-card">
        <div className="admin-table-header">
          <h5>All Claims ({filtered.length})</h5>
          <div className="admin-search">
            <span>🔍</span>
            <input
              placeholder="Search by name, item or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>No claims found.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Claimant</th>
                <th>Item</th>
                <th>Phone</th>
                <th>Image</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c.id}>
                  <td>{i + 1}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{c.full_name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>{c.email}</div>
                  </td>
                  <td>
                    <div>{c.item_title || '—'}</div>
                    {c.item_type && (
                      <span style={{
                        fontSize: '0.72rem', fontWeight: 600,
                        background: c.item_type === 'lost' ? '#fee2e2' : '#d1fae5',
                        color: c.item_type === 'lost' ? '#dc2626' : '#065f46',
                        padding: '2px 8px', borderRadius: '12px',
                      }}>
                        {c.item_type.toUpperCase()}
                      </span>
                    )}
                  </td>
                  <td>{c.phone_number || '—'}</td>
                  <td>
                    {c.image
                      ? <img src={`http://localhost:5000/uploads/${c.image}`} alt="claim"
                          style={{ width: 48, height: 48, borderRadius: 6, objectFit: 'cover' }} />
                      : '—'
                    }
                  </td>
                  <td>{statusBadge(c.status)}</td>
                  <td style={{ fontSize: '0.82rem' }}>
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <button className="btn-icon blue" title="View" onClick={() => setSelected(c)}>👁</button>
                      {/* ✅ Only show approve/reject for 'Pending' claims */}
                      {c.status === 'Pending' && (
                        <>
                          <button className="btn-icon teal" title="Approve"
                            onClick={() => handleStatus(c.id, 'approved')}>✓</button>
                          <button className="btn-icon orange" title="Reject"
                            onClick={() => handleStatus(c.id, 'rejected')}>✗</button>
                        </>
                      )}
                      <button className="btn-icon red" title="Delete" onClick={() => handleDelete(c.id)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setSelected(null)}>
          <div className="modal-box" style={{ maxWidth: '560px' }}>
            <div className="modal-header">
              <h5>Claim Details</h5>
              <button className="modal-close" onClick={() => setSelected(null)}>×</button>
            </div>

            <div className="modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: '2px' }}>ITEM</div>
                    <div style={{ fontWeight: 600 }}>{selected.item_title}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: '2px' }}>STATUS</div>
                    {statusBadge(selected.status)}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: '2px' }}>FULL NAME</div>
                    <div>{selected.full_name}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: '2px' }}>EMAIL</div>
                    <div>{selected.email}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: '2px' }}>PHONE</div>
                    <div>{selected.phone_number || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: '2px' }}>SUBMITTED</div>
                    <div>{new Date(selected.created_at).toLocaleString()}</div>
                  </div>
                </div>

                {selected.additional_details && (
                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: '4px' }}>ADDITIONAL DETAILS</div>
                    <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '10px 12px', fontSize: '0.9rem' }}>
                      {selected.additional_details}
                    </div>
                  </div>
                )}

                {selected.image && (
                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: '6px' }}>PROOF IMAGE</div>
                    <img src={`http://localhost:5000/uploads/${selected.image}`} alt="proof"
                      style={{ width: '100%', borderRadius: '10px', maxHeight: '240px', objectFit: 'cover' }} />
                  </div>
                )}
              </div>
            </div>

            {/* ✅ Show action buttons only for 'Pending' */}
            {selected.status === 'Pending' && (
              <div className="modal-footer">
                <button className="btn-accent"
                  style={{ background: '#22c55e', borderColor: '#22c55e' }}
                  onClick={() => handleStatus(selected.id, 'approved')}>
                  ✓ Approve — Mark as Found
                </button>
                <button className="btn-danger-sm"
                  style={{ padding: '10px 20px', fontSize: '0.9rem' }}
                  onClick={() => handleStatus(selected.id, 'rejected')}>
                  ✗ Reject
                </button>
              </div>
            )}

            {selected.status === 'Approved' && (
              <div className="modal-footer">
                <div className="alert-custom success" style={{ width: '100%', margin: 0 }}>
                  ✅ Claim approved. Item marked as Resolved.
                </div>
              </div>
            )}

            {selected.status === 'Rejected' && (
              <div className="modal-footer">
                <div className="alert-custom error" style={{ width: '100%', margin: 0 }}>
                  ✗ This claim was rejected.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}