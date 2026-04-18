import UserNavbar from '../../components/UserNavbar'
import SiteFooter from '../../components/SiteFooter'
import { Link } from 'react-router-dom'

const steps = [
  { icon: '📋', title: 'Report Your Item', desc: 'Fill out a simple form with details about your lost or found item. Include photos to help with identification.' },
  { icon: '✉️', title: 'Email Verification', desc: 'Verify your report with a 6-digit OTP sent to your email. This ensures authenticity of all reports.' },
  { icon: '🔍', title: 'Search & Browse', desc: 'Browse through our database or use smart filters to find matching items by category, location, or date.' },
  { icon: '📩', title: 'Submit a Claim', desc: 'If you find your item, submit a claim with proof. Our admin team will review and approve it.' },
  { icon: '✅', title: 'Get Reunited', desc: 'Once approved, you\'ll be notified and can collect your item. Our mission complete!' },
]

export default function HowItWorks() {
  return (
    <div>
      <UserNavbar />
      <div style={{ background: 'var(--primary)', color: 'white', textAlign: 'center', padding: '48px 20px' }}>
        <h1 style={{ fontWeight: 700, marginBottom: '12px' }}>How It Works</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)' }}>Simple steps to reunite with your belongings</p>
      </div>

      <div className="container" style={{ padding: '60px 20px' }}>
        <div className="row g-4 justify-content-center">
          {steps.map((s, i) => (
            <div className="col-md-4" key={i}>
              <div style={{
                background: 'white', borderRadius: '12px', padding: '32px 24px',
                textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                height: '100%',
              }}>
                <div style={{
                  width: '64px', height: '64px', background: '#f0f4ff', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.8rem', margin: '0 auto 16px',
                }}>{s.icon}</div>
                <div style={{
                  background: 'var(--primary)', color: 'white', width: '28px', height: '28px',
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '0.85rem', margin: '0 auto 12px',
                }}>{i + 1}</div>
                <h5 style={{ fontWeight: 700, marginBottom: '10px' }}>{s.title}</h5>
                <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '48px' }}>
          <Link to="/user/report" className="btn-accent" style={{ padding: '14px 36px', fontSize: '1rem' }}>
            + Report an Item Now
          </Link>
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}