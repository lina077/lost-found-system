import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', form)
      if (res.data.user.role !== 'admin') {
        setError('Access denied. Admin accounts only.')
        return
      }
      localStorage.setItem('adminToken', res.data.token)
      localStorage.setItem('adminUser', JSON.stringify(res.data.user))
      navigate('/admin')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.')
    } finally { setLoading(false) }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🛡️</div>
          <h3 style={{ fontWeight: 700, margin: '0 0 6px' }}>Welcome Back</h3>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>Sign in to your Admin Panel</p>
        </div>

        {error && <div className="alert-custom error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label>Username or Email</label>
            <input className="form-control-custom" type="email" placeholder="admin@example.com"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label>Password</label>
            <input className="form-control-custom" type="password" placeholder="Enter password"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          <button type="submit" disabled={loading}
            style={{
              width: '100%', background: '#1a1a2e', color: 'white', border: 'none',
              padding: '13px', borderRadius: '8px', fontWeight: 700, fontSize: '1rem',
              cursor: 'pointer', marginTop: '8px',
            }}>
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>
        <p style={{ marginTop: '20px', fontSize: '0.85rem', color: '#9ca3af' }}>
          <a href="/" style={{ color: '#9ca3af' }}>← Back to Portal</a>
        </p>
      </div>
    </div>
  )
}