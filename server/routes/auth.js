// Property of Zafrid - OverSignature. Closed Source. Copyright © 2024-2025. Unauthorized distribution prohibited.
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../database/db');
const { SECRET_KEY } = require('../middleware/auth');

// Login Route
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(401).json({ message: 'Invalid credentials' });

    // Create token
    const token = jwt.sign(
      { user_id: user.id, username: user.username, role: user.role, workspace_id: user.workspace_id },
      SECRET_KEY,
      { expiresIn: '24h' }
    );

    // Log login
    const logId = uuidv4();
    db.run('INSERT INTO activity_logs (id, user_id, action_type, details) VALUES (?, ?, ?, ?)', 
      [logId, user.id, 'LOGIN', 'User logged in']);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        workspace_id: user.workspace_id
      }
    });
  });
});

module.exports = router;
