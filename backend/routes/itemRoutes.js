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
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    if (allowed.test(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Only image files allowed'));
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

// GET all items
router.get('/', (req, res) => {
  const { type, category, status, keyword, location, sort } = req.query;

  let sql = `
    SELECT
      items.id,
      items.user_id,
      items.type,
      items.status,
      items.item_name       AS title,
      items.category_id     AS category,
      items.description,
      items.location_lost   AS location,
      items.date_lost       AS date_occurred,
      items.photo,
      items.created_at,
      items.updated_at,
      COALESCE(users.name,  'Anonymous') AS reporter_name,
      COALESCE(users.email, '')          AS reporter_email
    FROM items
    LEFT JOIN users ON items.user_id = users.id
    WHERE 1=1`;

  const params = [];
  if (type)     { sql += ' AND items.type = ?';             params.push(type); }
  if (category) { sql += ' AND items.category_id = ?';      params.push(category); }
  if (status)   { sql += ' AND items.status = ?';           params.push(status); }
  if (location) { sql += ' AND items.location_lost LIKE ?'; params.push(`%${location}%`); }
  if (keyword)  {
    sql += ' AND (items.item_name LIKE ? OR items.description LIKE ?)';
    params.push(`%${keyword}%`, `%${keyword}%`);
  }

  sql += sort === 'oldest'
    ? ' ORDER BY items.created_at ASC'
    : ' ORDER BY items.created_at DESC';

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error.', details: err.sqlMessage });
    res.json(results);
  });
});

// GET single item
router.get('/:id', (req, res) => {
  const sql = `
    SELECT
      items.id,
      items.user_id,
      items.type,
      items.status,
      items.item_name       AS title,
      items.category_id     AS category,
      items.description,
      items.location_lost   AS location,
      items.date_lost       AS date_occurred,
      items.photo,
      items.created_at,
      items.updated_at,
      COALESCE(users.name,  'Anonymous') AS reporter_name,
      COALESCE(users.email, '')          AS reporter_email
    FROM items
    LEFT JOIN users ON items.user_id = users.id
    WHERE items.id = ?`;

  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error.' });
    if (results.length === 0) return res.status(404).json({ message: 'Item not found.' });
    res.json(results[0]);
  });
});

// POST report new item
router.post('/', verifyToken, upload.single('photo'), (req, res) => {
  const { type, title, description, category, location, date_occurred } = req.body;
  const photo = req.file ? req.file.filename : null;

  if (!type || !title || !category || !location || !date_occurred)
    return res.status(400).json({ message: 'All fields are required.' });

  const sql = `INSERT INTO items
    (user_id, type, item_name, description, category_id, location_lost, date_lost, photo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(
    sql,
    [req.user.id, type, title, description, category, location, date_occurred, photo],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Server error.', details: err.sqlMessage });

      db.query(
        'INSERT INTO notifications (user_id, message, for_admin) VALUES (?, ?, 1)',
        [req.user.id, `New ${type} item reported: "${title}" at ${location}`]
      );

      const oppositeType = type === 'lost' ? 'found' : 'lost';
      db.query(
        `SELECT DISTINCT user_id FROM items
         WHERE type = ? AND category_id = ? AND status = 'Pending' AND user_id != ?`,
        [oppositeType, category, req.user.id],
        (err2, users) => {
          if (!err2 && users.length > 0) {
            const notifMsg = `A new ${type} item "${title}" matches your ${oppositeType} report!`;
            const values = users.map((u) => [u.user_id, notifMsg, 0]);
            db.query('INSERT INTO notifications (user_id, message, for_admin) VALUES ?', [values]);
          }
        }
      );

      res.status(201).json({ message: 'Item reported successfully!', id: result.insertId });
    }
  );
});

// PUT update item (owner only)
router.put('/:id', verifyToken, (req, res) => {
  const { title, description, category, location, date_occurred, status } = req.body;

  db.query(
    'SELECT * FROM items WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Server error.' });
      if (results.length === 0)
        return res.status(403).json({ message: 'Not authorized or item not found.' });

      db.query(
        `UPDATE items SET item_name=?, description=?, category_id=?,
         location_lost=?, date_lost=?, status=? WHERE id=?`,
        [title, description, category, location, date_occurred, status, req.params.id],
        (err2) => {
          if (err2) return res.status(500).json({ message: 'Server error.' });
          res.json({ message: 'Item updated successfully.' });
        }
      );
    }
  );
});

// DELETE item (owner only)
router.delete('/:id', verifyToken, (req, res) => {
  db.query(
    'SELECT * FROM items WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Server error.' });
      if (results.length === 0)
        return res.status(403).json({ message: 'Not authorized or item not found.' });

      db.query('DELETE FROM items WHERE id = ?', [req.params.id], (err2) => {
        if (err2) return res.status(500).json({ message: 'Server error.' });
        res.json({ message: 'Item deleted.' });
      });
    }
  );
});

module.exports = router;