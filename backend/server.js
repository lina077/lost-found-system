const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes  = require('./routes/authRoutes');
const itemRoutes  = require('./routes/itemRoutes');
const claimRoutes = require('./routes/claimRoutes');
const adminRoutes = require('./routes/adminRoutes');

const { verifyToken, verifyAdmin } = require('./middleware/auth');
const db = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth',   authRoutes);
app.use('/api/items',  itemRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/admin',  adminRoutes);

// User notifications
app.get('/api/notifications', verifyToken, (req, res) => {
  db.query(
    'SELECT * FROM notifications WHERE user_id = ? AND (for_admin = 0 OR for_admin IS NULL) ORDER BY created_at DESC LIMIT 20',
    [req.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Server error.' });
      res.json(results);
    }
  );
});

app.put('/api/notifications/read', verifyToken, (req, res) => {
  db.query(
    'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
    [req.user.id],
    (err) => {
      if (err) return res.status(500).json({ message: 'Server error.' });
      res.json({ message: 'Notifications marked as read.' });
    }
  );
});

// ✅ Admin notifications
app.get('/api/admin/notifications', verifyAdmin, (req, res) => {
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

app.put('/api/admin/notifications/read', verifyAdmin, (req, res) => {
  db.query('UPDATE notifications SET is_read = 1 WHERE for_admin = 1', (err) => {
    if (err) return res.status(500).json({ message: 'Server error.' });
    res.json({ message: 'Marked as read.' });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));