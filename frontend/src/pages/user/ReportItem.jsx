import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import UserNavbar from '../../components/UserNavbar'
import OTPModal from '../../components/OTPModal'

const CATEGORIES = ['Electronics', 'Books', 'Clothing', 'Keys', 'Wallet', 'ID Card', 'Bag', 'Mobile Phone', 'Watches', 'Other']

export default function ReportItem() {
  const [form, setForm] = useState({
    type: 'lost', title: '', description: '',
    category: 'Electronics', location: '', date_occurred: ''
  })
  const [photo, setPhoto] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showOTP, setShowOTP] = useState(false)
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const token = localStorage.getItem('token')

  const handleRequestOTP = async (e) => {
    e.preventDefault()
    if (!form.title || !form.category || !form.location || !form.date_occurred)
      return setError('Please fill in all required fields.')
    setError('')
    setLoading(true)
    try {
      await axios.post('http://localhost:5000/api/auth/send-otp', {
        email: user.email, name: user.name, itemData: form
      })
      setShowOTP(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP.')
    } finally { setLoading(false) }
  }

  const handleSubmitAfterOTP = async () => {
    setShowOTP(false)
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (photo) fd.append('photo', photo)
      await axios.post('http://localhost:5000/api/items', fd, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      })
      navigate('/user/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to report item.')
    } finally { setLoading(false) }
  }

  return (
    <div>
      <UserNavbar />
      <div style={{ background: 'var(--primary)', color: 'white', textAlign: 'center', padding: '36px 20px' }}>
        <h2 style={{ fontWeight: 700, margin: 0 }}>📋 Report an Item</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', margin: '8px 0 0' }}>
          Help us reunite lost items with their owners
        </p>
      </div>

      <div className="container" style={{ padding: '36px 20px', maxWidth: '700px' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
          {error && <div className="alert-custom error">{error}</div>}

          <form onSubmit={handleRequestOTP}>
            {/* Item Type */}
            <div className="form-group">
              <label>Item Type *</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                {['lost', 'found'].map(t => (
                  <label key={t} style={{
                    flex: 1, padding: '12px', border: `2px solid ${form.type === t ? '#1a1a2e' : '#e5e7eb'}`,
                    borderRadius: '8px', textAlign: 'center', cursor: 'pointer', fontWeight: 600,
                    background: form.type === t ? '#1a1a2e' : 'white',
                    color: form.type === t ? 'white' : '#374151',
                    transition: 'all 0.2s',
                  }}>
                    <input type="radio" value={t} checked={form.type === t}
                      onChange={e => setForm({ ...form, type: e.target.value })}
                      style={{ display: 'none' }} />
                    {t === 'lost' ? '🔍 Lost Item' : '✅ Found Item'}
                  </label>
                ))}
              </div>
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <div className="form-group">
                  <label>Item Title *</label>
                  <input className="form-control-custom" placeholder="e.g. Black Leather Wallet"
                    value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label>Category *</label>
                  <select className="form-control-custom" value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea className="form-control-custom" rows={3}
                placeholder="Describe the item in detail (color, brand, distinguishing features...)"
                value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <div className="form-group">
                  <label>Location *</label>
                  <input className="form-control-custom" placeholder="e.g. Library 2nd Floor"
                    value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label>Date *</label>
                  <input type="date" className="form-control-custom"
                    value={form.date_occurred} onChange={e => setForm({ ...form, date_occurred: e.target.value })} required />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Photo (optional)</label>
              <input type="file" className="form-control-custom" accept="image/*"
                onChange={e => setPhoto(e.target.files[0])} />
              {photo && <p style={{ fontSize: '0.8rem', color: '#22c55e', marginTop: '4px' }}>✓ {photo.name}</p>}
            </div>

            <button type="submit" className="btn-primary-custom" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: '1rem', marginTop: '8px' }}>
              {loading ? '⏳ Sending OTP...' : '📧 Verify & Submit Report'}
            </button>
          </form>
        </div>
      </div>

      {showOTP && (
        <OTPModal
          email={user?.email}
          name={user?.name}
          onVerified={handleSubmitAfterOTP}
          onCancel={() => setShowOTP(false)}
        />
      )}
    </div>
  )
}