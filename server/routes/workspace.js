// Property of Zafrid - OverSignature. Closed Source. Copyright © 2024-2025. Unauthorized distribution prohibited.
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database/db');
const { verifyToken, verifyExecutive, verifyAdmin } = require('../middleware/auth');

// Get all users in the workspace
router.get('/users', verifyToken, (req, res) => {
  db.all(
    'SELECT id, username, role, minecraft_ign, discord_id FROM users WHERE workspace_id = ? ORDER BY role ASC', 
    [req.user.workspace_id], 
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Promote/Demote User (Admin+)
router.post('/users/:id/role', verifyToken, verifyAdmin, (req, res) => {
  const { role } = req.body;
  const targetUserId = req.params.id;
  const validRoles = ['Owner', 'Executive', 'Admin', 'Moderator', 'Helper'];

  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  // In a real app, add checks to prevent demoting someone higher than you
  // For now, we assume the Admin/Executive is acting correctly

  db.run('UPDATE users SET role = ? WHERE id = ? AND workspace_id = ?', 
    [role, targetUserId, req.user.workspace_id], 
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      
      // Log it
      const logId = uuidv4();
      const details = `Changed role of user ${targetUserId} to ${role}`;
      db.run('INSERT INTO activity_logs (id, user_id, action_type, details) VALUES (?, ?, ?, ?)',
        [logId, req.user.user_id, 'ROLE_CHANGE', details]);

      res.json({ message: 'Role updated successfully' });
    }
  );
});

// Issue Strike (Admin+)
router.post('/users/:id/strike', verifyToken, verifyAdmin, (req, res) => {
  const { reason } = req.body;
  const targetUserId = req.params.id;

  if (!reason) return res.status(400).json({ message: 'Reason is required' });

  const logId = uuidv4();
  const details = `STRIKE ISSUED to user ${targetUserId}. Reason: ${reason}`;
  
  // Log it
  db.run('INSERT INTO activity_logs (id, user_id, action_type, details) VALUES (?, ?, ?, ?)',
    [logId, req.user.user_id, 'STRIKE_GIVEN', details], 
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Strike issued successfully' });
    }
  );
});

module.exports = router;
