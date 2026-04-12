import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ClaimModal from './ClaimModal'
import { getImgSrc, getStatusInfo } from './ItemCard'

export default function ItemDetailModal({ item, onClose }) {
  const [showClaim, setShowClaim]       = useState(false)
  const [claimSuccess, setClaimSuccess] = useState(false)
  const navigate = useNavigate()

  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const { label: statusLabel, cls: statusClass } = getStatusInfo(item.status)
  const imgSrc = getImgSrc(item.photo)

  // DB ENUM: 'Pending', 'Found', 'Resolved'
  // Use toLowerCase() so 'Pending' === 'pending' matches safely
  const s          = (item.status || '').toLowerCase().trim()
  const isPending  = s === 'pending' || s === ''   // empty string also treated as pending
  const isFound    = s === 'found'
  const isResolved = s === 'resolved'

  const isOwner = user && item.user_id && String(user.id) === String(item.user_id)

  const handleClaimClick = () => {
    if (!user) { navigate('/user/login'); return }
    setShowClaim(true)
  }

  if (showClaim) {
    return (
      <ClaimModal
        item={item}
        onClose={() => setShowClaim(false)}
        onSuccess={() => { setShowClaim(false); setClaimSuccess(true) }}
      />
    )
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: '640px' }}>

        <div className="modal-header">
          <h5>{item.title} Details</h5>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="row g-3">

            <div className="col-md-5">
              {imgSrc ? (
                <img src={imgSrc} alt={item.title}
                  style={{ width: '100%', borderRadius: '10px', objectFit: 'cover', maxHeight: '260px' }} />
              ) : (
                <div style={{
                  width: '100%', height: '200px', background: '#f3f4f6', borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem',
                }}>📦</div>
              )}
            </div>

            <div className="col-md-7">
              <h4 style={{ fontWeight: 700, marginBottom: '8px' }}>{item.title}</h4>

              <span className={`badge-status ${statusClass}`}
                style={{ marginBottom: '14px', display: 'inline-block' }}>
                {statusLabel}
              </span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
                <div><strong>Category:</strong> {item.category}</div>
                <div><strong>📍 Location:</strong> {item.location}</div>
                <div>
                  <strong>📅 Date Reported:</strong>{' '}
                  {item.date_occurred
                    ? new Date(item.date_occurred).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric' })
                    : 'N/A'}
                </div>
                <div>
                  <strong>Description:</strong>
                  <p style={{ color: '#6b7280', marginTop: '4px', marginBottom: 0 }}>
                    {item.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              {/* Claim submitted success */}
              {claimSuccess && (
                <div className="alert-custom success" style={{ marginTop: '14px' }}>
                  ✅ Claim submitted! Admin will review and get back to you.
                </div>
              )}

              {/* Pending + not owner → green button */}
              {!claimSuccess && isPending && !isOwner && (
                <button onClick={handleClaimClick} style={{
                  marginTop: '16px', width: '100%', padding: '13px',
                  fontSize: '0.95rem', background: '#22c55e', border: 'none',
                  borderRadius: '10px', color: 'white', fontWeight: 700,
                  cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}>
                  🔍 Report Found Item
                </button>
              )}

              {/* Pending + owner */}
              {!claimSuccess && isPending && isOwner && (
                <div className="alert-custom info" style={{ marginTop: '14px' }}>
                  📋 This is your reported item. Waiting for someone to find it.
                </div>
              )}

              {/* Found */}
              {!claimSuccess && isFound && (
                <div className="alert-custom info" style={{ marginTop: '14px' }}>
                  ✅ This item has been found and is under admin review.
                </div>
              )}

              {/* Resolved */}
              {!claimSuccess && isResolved && (
                <div className="alert-custom success" style={{ marginTop: '14px' }}>
                  ✅ This item has already been resolved/returned to its owner.
                </div>
              )}

              {/* Login hint */}
              {!user && isPending && !isOwner && !claimSuccess && (
                <p style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '6px', textAlign: 'center' }}>
                  You need to{' '}
                  <span style={{ color: '#1a1a2e', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                    onClick={() => navigate('/user/login')}>login</span>{' '}
                  to report a found item.
                </p>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}