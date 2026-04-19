import { useNavigate } from 'react-router-dom'

export default function Portal() {
  const navigate = useNavigate()

  return (
    <div style={{
      minHeight: '100vh',
      background: '#eef2f9',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🚪</div>
        <h1 style={{ color: '#1a1a2e', fontSize: '2rem', fontWeight: 700, margin: '0 0 8px' }}>
          Welcome to MU Lost & Found Web
        </h1>
        <p style={{ color: '#6b7280', fontSize: '1rem' }}>
          Choose your access portal to continue
        </p>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* Admin Portal */}
        <div style={{
          background: '#f8fafc',
          borderRadius: '16px',
          padding: '40px 36px',
          width: '300px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        }}
          onClick={() => navigate('/admin/login')}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)'; }}
        >
          <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🛡️</div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '12px', color: '#1a1a2e' }}>
            Admin Portal
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#6b7280', lineHeight: 1.6, marginBottom: '24px' }}>
            Access the administrative dashboard to manage users, view analytics, and control system settings.
            Full administrative privileges required.
          </p>
          <button style={{
            background: '#1a1a2e', color: 'white', border: 'none',
            padding: '12px 24px', borderRadius: '8px', fontWeight: 600,
            fontSize: '0.95rem', cursor: 'pointer', width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}>
            ➡ Enter Admin Portal
          </button>
        </div>

        {/* User Portal */}
        <div style={{
          background: '#f8fafc',
          borderRadius: '16px',
          padding: '40px 36px',
          width: '300px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        }}
          onClick={() => navigate('/user')}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)'; }}
        >
          <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>👤</div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '12px', color: '#1a1a2e' }}>
            User Portal
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#6b7280', lineHeight: 1.6, marginBottom: '24px' }}>
            Access the user dashboard to manage your profile, submit requests, and interact with system features.
            Available for all registered users.
          </p>
          <button style={{
            background: '#1a1a2e', color: 'white', border: 'none',
            padding: '12px 24px', borderRadius: '8px', fontWeight: 600,
            fontSize: '0.95rem', cursor: 'pointer', width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}>
            ➡ Enter User Portal
          </button>
        </div>
      </div>

      <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '40px', fontSize: '0.85rem' }}>
        ℹ Need help? Contact system administrator
      </p>
    </div>
  )
}