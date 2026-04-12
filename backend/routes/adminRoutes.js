const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyAdmin } = require('../middleware/auth');

// GET dashboard stats
router.get('/stats', verifyAdmin, (req, res) => {
  const queries = {
    totalItems:       'SELECT COUNT(*) AS count FROM items',
    lostItems:        "SELECT COUNT(*) AS count FROM items WHERE type='lost'",
    // Found items = lost type items with Found status
    foundItems:       "SELECT COUNT(*) AS count FROM items WHERE type='lost' AND status='Found'",
    resolvedItems:    "SELECT COUNT(*) AS count FROM items WHERE status='Resolved'",
    // claim_requests ENUM: 'Pending','Approved','Rejected'
    pendingClaims:    "SELECT COUNT(*) AS count FROM claim_requests WHERE status='Pending'",
    totalUsers:       'SELECT COUNT(*) AS count FROM users WHERE role != "admin"',
    pendingLostItems: "SELECT COUNT(*) AS count FROM items WHERE type='lost' AND status='Pending'",
  };
  const results = {};
  const keys = Object.keys(queries);
  let completed = 0;
  keys.forEach((key) => {
    db.query(queries[key], (err, rows) => {
      if (err) console.error(`Stats error [${key}]:`, err.sqlMessage);
      if (!err) results[key] = rows[0].count;
      if (++completed === keys.length) res.json(results);
    });
  });
});

// GET category distribution
router.get('/stats/categories', verifyAdmin, (req, res) => {
  db.query(
    `SELECT category_id AS category, COUNT(*) AS count
     FROM items GROUP BY category_id ORDER BY count DESC`,
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Server error.' });
      res.json(results.filter(r => r.count > 0));
    }
  );
});

// GET last 30 days activity (changed from 7 to 30 to show older data too)
router.get('/stats/activity', verifyAdmin, (req, res) => {
  db.query(
    `SELECT DATE(created_at) AS date, COUNT(*) AS count
     FROM items
     WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
     GROUP BY DATE(created_at) ORDER BY date ASC`,
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Server error.' });
      // If no recent data, fallback: show all-time activity grouped by month
      if (results.length === 0) {
        db.query(
          `SELECT DATE_FORMAT(created_at, '%Y-%m') AS date, COUNT(*) AS count
           FROM items GROUP BY DATE_FORMAT(created_at, '%Y-%m') ORDER BY date ASC`,
          (err2, results2) => {
            if (err2) return res.status(500).json({ message: 'Server error.' });
            res.json(results2)
          }
        )
      } else {
        res.json(results);
      }
    }
  );
});

// GET top locations
router.get('/stats/locations', verifyAdmin, (req, res) => {
  db.query(
    `SELECT location_lost AS location, COUNT(*) AS count
     FROM items WHERE location_lost IS NOT NULL AND location_lost != ''
     GROUP BY location_lost ORDER BY count DESC LIMIT 4`,
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Server error.' });
      res.json(results);
    }
  );
});

// GET status distribution — items ENUM: 'Pending','Found','Resolved'
router.get('/stats/status', verifyAdmin, (req, res) => {
  db.query(
    `SELECT status, COUNT(*) AS count FROM items GROUP BY status`,
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Server error.' });
      res.json(results);
    }
  );
});

// GET admin notifications
router.get('/notifications', verifyAdmin, (req, res) => {
  db.query(
    `SELECT n.*, u.name AS sender_name
     FROM notifications n
     LEFT JOIN users u ON n.user_id = u.id
     WHERE n.for_admin = 1
     ORDER BY n.created_at DESC LIMIT 20`,
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Server error.' });
      res.json(results);
    }
  );
});

// PUT mark admin notifications as read
router.put('/notifications/read', verifyAdmin, (req, res) => {
  db.query('UPDATE notifications SET is_read = 1 WHERE for_admin = 1', (err) => {
    if (err) return res.status(500).json({ message: 'Server error.' });
    res.json({ message: 'Notifications marked as read.' });
  });
});

// GET all items (admin) — supports type + status filter
router.get('/items', verifyAdmin, (req, res) => {
  const { type, status, search } = req.query;
  let sql = `SELECT items.id, items.user_id,
               items.item_name AS title, items.category_id AS category,
               items.description, items.location_lost AS location,
               items.date_lost AS date_occurred, items.photo,
               items.status, items.type, items.created_at,
               COALESCE(users.name, 'Anonymous') AS reporter_name
             FROM items
             LEFT JOIN users ON items.user_id = users.id
             WHERE 1=1`;
  const params = [];
  if (type)   { sql += ' AND items.type = ?';   params.push(type); }
  if (status) { sql += ' AND items.status = ?'; params.push(status); }
  if (search) {
    sql += ' AND (items.item_name LIKE ? OR items.description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  sql += ' ORDER BY items.created_at DESC';
  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error.' });
    res.json(results);
  });
});

// PUT update item status — items ENUM: 'Pending','Found','Resolved'
router.put('/items/:id', verifyAdmin, (req, res) => {
  const { status } = req.body;
  const allowed = ['Pending', 'Found', 'Resolved'];
  if (!allowed.includes(status))
    return res.status(400).json({ message: `Invalid status. Allowed: ${allowed.join(', ')}` });
  db.query('UPDATE items SET status = ? WHERE id = ?', [status, req.params.id], (err) => {
    if (err) return res.status(500).json({ message: 'Server error.' });
    res.json({ message: 'Item updated.' });
  });
});

// DELETE item (admin)
router.delete('/items/:id', verifyAdmin, (req, res) => {
  db.query('DELETE FROM items WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: 'Server error.' });
    res.json({ message: 'Item deleted.' });
  });
});

// GET all claims
router.get('/claims', verifyAdmin, (req, res) => {
  const sql = `SELECT cr.*, i.item_name AS item_title, i.type AS item_type
               FROM claim_requests cr
               LEFT JOIN items i ON cr.lost_item_id = i.id
               ORDER BY cr.created_at DESC`;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error.' });
    res.json(results);
  });
});

// GET single claim
router.get('/claims/:id', verifyAdmin, (req, res) => {
  const sql = `SELECT cr.*, i.item_name AS item_title, i.type AS item_type
               FROM claim_requests cr
               LEFT JOIN items i ON cr.lost_item_id = i.id
               WHERE cr.id = ?`;
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error.' });
    if (!results.length) return res.status(404).json({ message: 'Claim not found.' });
    res.json(results[0]);
  });
});

// PUT approve/reject claim
// claim_requests ENUM: 'Pending','Approved','Rejected'
router.put('/claims/:id', verifyAdmin, (req, res) => {
  const { status } = req.body;
  const statusMap = { 'approved': 'Approved', 'rejected': 'Rejected', 'Approved': 'Approved', 'Rejected': 'Rejected' };
  const dbStatus = statusMap[status];
  if (!dbStatus) return res.status(400).json({ message: 'Invalid status.' });

  db.query('SELECT * FROM claim_requests WHERE id = ?', [req.params.id], (err, rows) => {
    if (err || !rows.length) return res.status(404).json({ message: 'Claim not found.' });
    const claim = rows[0];

    db.query('UPDATE claim_requests SET status = ? WHERE id = ?', [dbStatus, req.params.id], (err2) => {
      if (err2) return res.status(500).json({ message: 'Server error.' });

      if (dbStatus === 'Approved') {
        // Set item status to 'Found' (not Resolved — admin approved that it was found)
        db.query("UPDATE items SET status='Found' WHERE id=?", [claim.lost_item_id]);

        db.query(
          `INSERT INTO notifications (user_id, message, is_read, for_admin)
           SELECT id, ?, 0, 0 FROM users WHERE email = ? LIMIT 1`,
          ['Your claim has been approved! The item has been found. Please collect it.', claim.email]
        );

        db.query(
          `SELECT user_id, item_name FROM items WHERE id = ? LIMIT 1`,
          [claim.lost_item_id],
          (err3, itemRows) => {
            if (!err3 && itemRows.length && itemRows[0].user_id) {
              db.query(
                'INSERT INTO notifications (user_id, message, is_read, for_admin) VALUES (?, ?, 0, 0)',
                [itemRows[0].user_id, `Your lost item "${itemRows[0].item_name}" has been found!`]
              );
            }
          }
        );
      } else if (dbStatus === 'Rejected') {
        db.query(
          `INSERT INTO notifications (user_id, message, is_read, for_admin)
           SELECT id, ?, 0, 0 FROM users WHERE email = ? LIMIT 1`,
          ['Your claim request has been rejected.', claim.email]
        );
      }

      res.json({ message: `Claim ${dbStatus} successfully.` });
    });
  });
});

// DELETE claim
router.delete('/claims/:id', verifyAdmin, (req, res) => {
  db.query('DELETE FROM claim_requests WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: 'Server error.' });
    res.json({ message: 'Claim deleted.' });
  });
});

// GET all users
router.get('/users', verifyAdmin, (req, res) => {
  db.query(
    'SELECT id, name, email, role, created_at FROM users WHERE role != "admin" ORDER BY created_at DESC',
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Server error.' });
      res.json(results);
    }
  );
});

// DELETE user
router.delete('/users/:id', verifyAdmin, (req, res) => {
  db.query('DELETE FROM users WHERE id = ? AND role != "admin"', [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: 'Server error.' });
    res.json({ message: 'User deleted.' });
  });
});

module.exports = router;