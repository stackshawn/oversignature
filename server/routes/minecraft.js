// Property of Zafrid - OverSignature. Closed Source. Copyright © 2024-2025. Unauthorized distribution prohibited.
const express = require('express');
const router = express.Router();
const util = require('minecraft-server-util');
const db = require('../database/db');
const { verifyToken, verifyExecutive } = require('../middleware/auth');

// Get all servers
router.get('/', verifyToken, (req, res) => {
  db.all('SELECT * FROM integrations WHERE workspace_id = ?', [req.user.workspace_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get status of a specific server
router.get('/status/:id', verifyToken, (req, res) => {
  db.get('SELECT * FROM integrations WHERE id = ? AND workspace_id = ?', [req.params.id, req.user.workspace_id], (err, server) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!server) return res.status(404).json({ message: 'Server not found' });

    const options = { timeout: 1000 * 5 }; // 5 sec timeout

    // Assuming Java Edition for now, could add Bedrock support if needed based on type
    util.status(server.ip_address, server.port, options)
      .then((result) => {
        res.json({
          online: true,
          players: result.players.online,
          maxPlayers: result.players.max,
          version: result.version.name,
          motd: result.motd.clean
        });
      })
      .catch((error) => {
        res.json({ online: false, error: error.message });
      });
  });
});

// Add a new server (Executive only)
router.post('/', verifyToken, verifyExecutive, (req, res) => {
  const { ip_address, port, rcon_password } = req.body;
  const { v4: uuidv4 } = require('uuid');
  
  if (!ip_address) return res.status(400).json({ message: 'IP Address is required' });

  const id = uuidv4();
  db.run('INSERT INTO integrations (id, workspace_id, ip_address, port, rcon_password) VALUES (?, ?, ?, ?, ?)',
    [id, req.user.workspace_id, ip_address, port || 25565, rcon_password],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Server added successfully', id });
    }
  );
});

module.exports = router;
