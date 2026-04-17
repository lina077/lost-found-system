import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import UserNavbar from '../../components/UserNavbar'
import ClaimModal from '../../components/ClaimModal'
import SiteFooter from '../../components/SiteFooter'

export default function ItemDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showClaim, setShowClaim] = useState(false)
  const [claimSuccess, setClaimSuccess] = useState(false)
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  useEffect(() => {
    axios.get(`http://localhost:5000/api/items/${id}`)
      .then(r => setItem(r.data))
      .catch(() => navigate('/user'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div style={{ textAlign: 'center', padding: '80px' }}>Loading...</div>
  if (!item) return null

  const statusLabel = item.status === 'open' ? 'Pending' : item.status === 'resolved' ? 'Resolved' : 'Claimed'
  const statusClass = item.status === 'open' ? 'badge-pending' : item.status === 'resolved' ? 'badge-resolved' : 'badge-claimed'

  return (
    <div>
      <UserNavbar />
      <div className="container" style={{ padding: '36px 20px', maxWidth: '900px' }}>
        <button onClick={() => navigate(-1)} style={{
          background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer',
          fontSize: '0.9rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px',
        }}>← Back</button>

        <div style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
          <div className="row g-4">
            <div className="col-md-5">
              {item.photo
                ? <img src={`http://localhost:5000/uploads/${item.photo}`} alt={item.title}
                    style={{ width: '100%', borderRadius: '12px', objectFit: 'cover', maxHeight: '320px' }} />
                : <div style={{
                    width: '100%', height: '260px', background: '#f3f4f6', borderRadius: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem',
                  }}>📦</div>
              }
            </div>
            <div className="col-md-7">
              <span className={`badge-status ${statusClass}`} style={{ marginBottom: '12px', display: 'inline-block' }}>{statusLabel}</span>
              <h2 style={{ fontWeight: 700, marginBottom: '16px' }}>{item.title}</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.95rem', marginBottom: '20px' }}>
                <div><strong>🏷 Category:</strong> {item.category}</div>
                <div><strong>📍 Location:</strong> {item.location}</div>
                <div><strong>📅 Date:</strong> {item.date_occurred ? new Date(item.date_occurred).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}</div>
                <div><strong>👤 Reported by:</strong> {item.reporter_name}</div>
                <div>
                  <strong>📝 Description:</strong>
                  <p style={{ color: '#6b7280', marginTop: '6px' }}>{item.description || 'No description provided.'}</p>
                </div>
              </div>

              {claimSuccess && <div className="alert-custom success">✅ Claim submitted! The admin will review it.</div>}

              {!claimSuccess && item.status === 'open' && user && user.id !== item.user_id && (
                <button className="btn-accent" onClick={() => setShowClaim(true)}
                  style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '1rem' }}>
                  🔍 Report Found Item
                </button>
              )}
              {!user && (
                <button className="btn-primary-custom" onClick={() => navigate('/user/login')}
                  style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                  Login to Submit Claim
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
      {showClaim && (
        <ClaimModal item={item} onClose={() => setShowClaim(false)}
          onSuccess={() => { setShowClaim(false); setClaimSuccess(true) }} />
      )}
    </div>
  )
}