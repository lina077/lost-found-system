import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', form)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      navigate('/user')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'white', borderRadius: '16px', padding: '40px 36px', width: '100%', maxWidth: '420px', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🎒</div>
          <h3 style={{ fontWeight: 700, margin: '0 0 4px' }}>Welcome Back</h3>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>Sign in to your account</p>
        </div>

        {error && <div className="alert-custom error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input className="form-control-custom" type="email" placeholder="Enter your email"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="form-control-custom" type="password" placeholder="Enter your password"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          <button type="submit" className="btn-primary-custom" disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '8px' }}>
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: '#6b7280' }}>
          Don't have an account? <Link to="/user/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Register</Link>
        </p>
        <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#6b7280' }}>
          <Link to="/" style={{ color: '#9ca3af', fontSize: '0.85rem' }}>← Back to Portal</Link>
        </p>
      </div>
    </div>
  )
}