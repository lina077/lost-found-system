import { useState, useEffect } from 'react'
import axios from 'axios'

export default function OTPModal({ email, name, onVerified, onCancel }) {
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(30)
  const [canResend, setCanResend] = useState(false)

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(t)
    } else {
      setCanResend(true)
    }
  }, [resendTimer])

  const handleVerify = async () => {
    if (!otp || otp.length !== 6) return setError('Enter the 6-digit OTP.')
    setLoading(true)
    setError('')
    try {
      await axios.post('http://localhost:5000/api/auth/verify-otp', { email, otp })
      setSuccess('OTP verified!')
      setTimeout(() => onVerified(), 800)
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!canResend) return
    setCanResend(false)
    setResendTimer(30)
    setError('')
    try {
      await axios.post('http://localhost:5000/api/auth/send-otp', { email, name })
      setSuccess('OTP has been resent successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('Failed to resend OTP.')
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: '420px' }}>
        <div className="otp-modal">
          <div className="otp-icon">ℹ️</div>
          <h4 style={{ fontWeight: 700, marginBottom: '8px' }}>Verify Your Email</h4>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '4px' }}>
            We've sent a 6-digit OTP to <strong>{email}</strong>
          </p>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '20px' }}>
            Please check your email and enter the OTP below:
          </p>

          {error && <div className="alert-custom error">{error}</div>}
          {success && <div className="alert-custom success">{success}</div>}

          <div className="otp-input-group">
            <input
              className="otp-input"
              type="text"
              placeholder="Enter OTP"
              maxLength={6}
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
            />
            <button className="resend-btn" onClick={handleResend} disabled={!canResend}>
              Resend OTP
            </button>
          </div>

          {!canResend && (
            <p style={{ color: '#22c55e', fontSize: '0.82rem', marginBottom: '16px' }}>
              You can resend in {resendTimer} seconds
            </p>
          )}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              className="btn-primary-custom"
              onClick={handleVerify}
              disabled={loading}
              style={{ padding: '10px 28px' }}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button
              onClick={onCancel}
              style={{
                padding: '10px 28px', background: '#6b7280', color: 'white',
                border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600,
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}