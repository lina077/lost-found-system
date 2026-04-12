const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const db = require('../config/db');

// ── Mailer Setup ──────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
});

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ── REGISTER ─────────────────────────────────────────────
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: 'All fields are required.' });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role ? role.toLowerCase() : 'student';
    const sql = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
    db.query(sql, [name, email, hashedPassword, userRole], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY')
          return res.status(409).json({ message: 'Email already registered.' });
        return res.status(500).json({ message: 'Database error.', details: err.sqlMessage });
      }
      res.status(201).json({ message: 'Registration successful!' });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// ── LOGIN ─────────────────────────────────────────────────
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error.' });
    if (results.length === 0)
      return res.status(401).json({ message: 'Invalid email or password.' });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid email or password.' });

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  });
});

// ── SEND OTP (for item report verification) ───────────────
router.post('/send-otp', async (req, res) => {
  const { email, name, itemData } = req.body;
  if (!email) return res.status(400).json({ message: 'Email required.' });

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  // Delete old OTPs for this email
  db.query('DELETE FROM otps WHERE email = ?', [email]);

  // Save new OTP
  db.query(
    'INSERT INTO otps (email, otp, item_data, expires_at) VALUES (?, ?, ?, ?)',
    [email, otp, JSON.stringify(itemData || {}), expiresAt],
    async (err) => {
      if (err) return res.status(500).json({ message: 'Failed to save OTP.' });

      try {
        await transporter.sendMail({
          from: process.env.MAIL_FROM,
          to: email,
          subject: 'OTP Verification - Lost Item Report',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
              <div style="background: #1a1a2e; padding: 20px; text-align: center;">
                <h2 style="color: white; margin: 0;">Lost & Found System</h2>
              </div>
              <div style="padding: 30px; background: #f9f9f9;">
                <p>Hello <strong>${name || 'User'}</strong>,</p>
                <p>Thank you for reporting your lost item. Please use the following OTP to verify your report:</p>
                <div style="text-align: center; margin: 20px 0;">
                  <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1a1a2e;">${otp}</span>
                </div>
                <p>This OTP is valid for <strong>10 minutes</strong>. If you didn't request this, please ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                <p style="color: #888; font-size: 12px;">© 2024 Lost & Found System. All rights reserved.</p>
              </div>
            </div>
          `,
        });
        res.json({ message: 'OTP sent successfully.' });
      } catch (mailErr) {
        console.error('Mail error:', mailErr);
        res.status(500).json({ message: 'Failed to send OTP email.' });
      }
    }
  );
});

// ── VERIFY OTP ────────────────────────────────────────────
router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  db.query(
    'SELECT * FROM otps WHERE email = ? AND otp = ? AND expires_at > NOW()',
    [email, otp],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Server error.' });
      if (results.length === 0)
        return res.status(400).json({ message: 'Invalid or expired OTP.' });

      // Clean up used OTP
      db.query('DELETE FROM otps WHERE email = ?', [email]);
      res.json({ message: 'OTP verified successfully.', verified: true });
    }
  );
});

module.exports = router;