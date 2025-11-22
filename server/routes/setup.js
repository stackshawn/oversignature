// Property of Zafrid - OverSignature. Closed Source. Copyright © 2024-2025. Unauthorized distribution prohibited.
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const db = require('../database/db');

// Check if setup is required
router.get('/status', (req, res) => {
  db.get('SELECT count(*) as count FROM users', [], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ setupRequired: row.count === 0 });
  });
});

// Initial Setup
router.post('/init', async (req, res) => {
  // Double check if setup is allowed
  db.get('SELECT count(*) as count FROM users', [], async (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row.count > 0) {
      return res.status(403).json({ message: 'Setup has already been completed.' });
    }

    const { workspaceName, username, password, minecraftIgn } = req.body;

    if (!workspaceName || !username || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const workspaceId = uuidv4();
      const userId = uuidv4();

      // Use transaction-like flow (manual in sqlite without explicit transaction command wrapper for simplicity here, but ordered)
      
      // 1. Create Workspace
      db.run('INSERT INTO workspaces (id, name, owner_id) VALUES (?, ?, ?)', 
        [workspaceId, workspaceName, userId], (err) => {
        if (err) return res.status(500).json({ error: 'Failed to create workspace: ' + err.message });

        // 2. Create Owner User
        db.run('INSERT INTO users (id, workspace_id, username, password_hash, role, minecraft_ign) VALUES (?, ?, ?, ?, ?, ?)',
          [userId, workspaceId, username, hashedPassword, 'Owner', minecraftIgn], (err) => {
            if (err) return res.status(500).json({ error: 'Failed to create user: ' + err.message });

            res.json({ message: 'Setup completed successfully. Please login.' });
          });
      });

    } catch (error) {
      res.status(500).json({ error: 'Server error during setup.' });
    }
  });
});

module.exports = router;
