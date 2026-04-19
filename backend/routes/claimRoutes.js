const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../config/db');
const { verifyToken } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// POST submit a claim
router.post('/', verifyToken, upload.single('image'), (req, res) => {
  const { item_id, full_name, email, phone, message } = req.body;
  const image = req.file ? req.file.filename : null;

  if (!item_id || !full_name || !email)
    return res.status(400).json({ message: 'Item ID, full name and email are required.' });

  db.query('SELECT * FROM items WHERE id = ?', [item_id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error.', details: err.sqlMessage });
    if (!results.length) return res.status(404).json({ message: 'Item not found.' });

    const item = results[0];

    const sql = `INSERT INTO claim_requests
      (lost_item_id, full_name, email, phone_number, image, additional_details, status)
      VALUES (?, ?, ?, ?, ?, ?, 'Pending')`;

    db.query(sql, [item_id, full_name, email, phone || '', image, message || ''], (err2) => {
      if (err2) {
        console.error('❌ Claim insert error:', err2.sqlMessage);
        return res.status(500).json({ message: 'Server error.', details: err2.sqlMessage });
      }

      const notifyAdmins = req.app.locals.notifyAdmins;
      const notifyUser   = req.app.locals.notifyUser;
      const adminMsg     = `New claim by ${full_name} on "${item.item_name}"`;
      const ownerMsg     = `Someone claimed your item "${item.item_name}". Admin is reviewing.`;

      // Save to DB + live push to admins
      db.query(
        'INSERT INTO notifications (user_id, message, is_read, for_admin) VALUES (?, ?, 0, 1)',
        [req.user.id, adminMsg],
        () => { if (notifyAdmins) notifyAdmins({ type: 'new_claim', message: adminMsg }); }
      );

      // Save to DB + live push to item owner
      if (item.user_id) {
        db.query(
          'INSERT INTO notifications (user_id, message, is_read, for_admin) VALUES (?, ?, 0, 0)',
          [item.user_id, ownerMsg],
          () => { if (notifyUser) notifyUser(item.user_id, { type: 'claim_received', message: ownerMsg }); }
        );
      }

      res.status(201).json({ message: 'Claim submitted successfully!' });
    });
  });
});

// GET claims for a specific item
router.get('/item/:item_id', verifyToken, (req, res) => {
  db.query(
    'SELECT * FROM claim_requests WHERE lost_item_id = ? ORDER BY created_at DESC',
    [req.params.item_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Server error.' });
      res.json(results);
    }
  );
});

// GET my submitted claims
router.get('/my', verifyToken, (req, res) => {
  const sql = `SELECT cr.*, i.item_name AS item_title, i.type AS item_type
               FROM claim_requests cr
               JOIN items i ON cr.lost_item_id = i.id
               WHERE cr.email = ?
               ORDER BY cr.created_at DESC`;
  db.query(sql, [req.user.email], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error.' });
    res.json(results);
  });
});

module.exports = router;