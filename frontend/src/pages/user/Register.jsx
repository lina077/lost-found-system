import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) return setError('All fields are required.')
    setLoading(true); setError('')
    try {
      await axios.post('http://localhost:5000/api/auth/register', form)
      setSuccess('Registration successful! Redirecting to login...')
      setTimeout(() => navigate('/user/login'), 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'white', borderRadius: '16px', padding: '40px 36px', width: '100%', maxWidth: '440px', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📝</div>
          <h3 style={{ fontWeight: 700, margin: '0 0 4px' }}>Create Account</h3>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>Join our Lost & Found community</p>
        </div>

        {error && <div className="alert-custom error">{error}</div>}
        {success && <div className="alert-custom success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input className="form-control-custom" placeholder="Enter your full name" 
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input className="form-control-custom" type="email" placeholder="Enter your email"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="form-control-custom" type="password" placeholder="Create a password"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select className="form-control-custom" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              <option value="student">Student</option>
              <option value="staff">Staff</option>
            </select>
          </div>
          <button type="submit" className="btn-accent" disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '8px' }}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: '#6b7280' }}>
          Already have an account? <Link to="/user/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Login</Link>
        </p>
      </div>
    </div>
  )
}