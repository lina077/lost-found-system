import { Link } from 'react-router-dom'

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-4">
            <h5>🎒 Lost &amp; Found</h5>
            <p>Helping people reunite with their lost belongings since 2026. Our mission is to create a community where lost items find their way back home.</p>
          </div>
          <div className="col-md-2 mb-4">
            <h5>Quick Links</h5>
            <Link to="/user">Home</Link>
            <Link to="/user/lost">Lost Items</Link>
            <Link to="/user/found">Found Items</Link>
            <Link to="/user/how">How It Works</Link>
          </div>
          <div className="col-md-3 mb-4">
            <h5>Support</h5>
            <a href="#">FAQ</a>
            <a href="#">Contact Us</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
          <div className="col-md-3 mb-4">
            <h5>Contact Info</h5>
            <p style={{ fontSize: '0.88rem', lineHeight: 2 }}>
              📍 Bateshwar, Sylhet-3104, Bangladesh<br />
              📞 +88 01313 050044<br />
              ✉ lostandfound@gmail.com
            </p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Lost &amp; Found System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}