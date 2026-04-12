import { useState } from 'react'
import axios from 'axios'

export default function ClaimModal({ item, onClose, onSuccess }) {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    message: '',
  })
  const [image, setImage]     = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const token = localStorage.getItem('token')

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async () => {
    if (!form.full_name.trim()) return setError('Full name is required.')
    if (!form.email.trim())     return setError('Email address is required.')

    setLoading(true)
    setError('')

    try {
      const fd = new FormData()
      fd.append('item_id',   item.id)
      fd.append('full_name', form.full_name)
      fd.append('email',     form.email)
      fd.append('phone',     form.phone)
      fd.append('message',   form.message)
      if (image) fd.append('image', image)

      await axios.post('http://localhost:5000/api/claims', fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      })

      onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit claim. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: '520px' }}>

        {/* ── Header ── */}
        <div className="modal-header">
          <div>
            <h5 style={{ margin: 0 }}>Claim Item</h5>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#6b7280', marginTop: '2px' }}>
              Item: <strong>{item.title}</strong>
            </p>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {/* ── Body ── */}
        <div className="modal-body">

          {error && (
            <div className="alert-custom error">{error}</div>
          )}

          {/* Full Name */}
          <div className="form-group">
            <label>Full Name <span style={{ color: '#ef4444' }}>*</span></label>
            <input
              className="form-control-custom"
              placeholder="Enter your full name"
              value={form.full_name}
              onChange={handleChange('full_name')}
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label>Email Address <span style={{ color: '#ef4444' }}>*</span></label>
            <input
              className="form-control-custom"
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange('email')}
            />
          </div>

          {/* Phone */}
          <div className="form-group">
            <label>Phone Number</label>
            <input
              className="form-control-custom"
              type="tel"
              placeholder="Enter your phone number"
              value={form.phone}
              onChange={handleChange('phone')}
            />
          </div>

          {/* Image upload */}
          <div className="form-group">
            <label>Found Item Image</label>
            <input
              type="file"
              className="form-control-custom"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
            />
            <p style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '4px' }}>
              Upload any documents or photos that prove this item belongs to you.
            </p>
          </div>

          {/* Additional details */}
          <div className="form-group">
            <label>Additional Details</label>
            <textarea
              className="form-control-custom"
              rows={4}
              placeholder="Provide any additional information that can help verify your claim (e.g. unique markings, what was inside the bag, etc.)"
              value={form.message}
              onChange={handleChange('message')}
            />
          </div>

        </div>

        {/* ── Footer ── */}
        <div className="modal-footer" style={{ flexDirection: 'column', gap: '8px' }}>
          <button
            className="btn-accent"
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '13px',
              fontSize: '0.95rem',
            }}
          >
            {loading ? (
              <span>⏳ Submitting...</span>
            ) : (
              <span>🔍 Submit Claim</span>
            )}
          </button>

          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '10px',
              background: '#f3f4f6',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              color: '#6b7280',
              fontWeight: 600,
            }}
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  )
}