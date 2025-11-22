// Property of Zafrid - OverSignature. Closed Source. Copyright © 2024-2025. Unauthorized distribution prohibited.
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database/db');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Get agreements for the current user
router.get('/', verifyToken, (req, res) => {
  db.all('SELECT * FROM agreements WHERE user_id = ? ORDER BY is_signed ASC, created_at DESC', 
    [req.user.user_id], 
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Assign Agreement (Admin only)
router.post('/assign', verifyToken, verifyAdmin, (req, res) => {
  const { targetUserId, title, content } = req.body;

  if (!targetUserId || !title || !content) {
    return res.status(400).json({ message: 'User, Title, and Content are required' });
  }

  const id = uuidv4();
  db.run('INSERT INTO agreements (id, user_id, title, content) VALUES (?, ?, ?, ?)',
    [id, targetUserId, title, content],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      
      // Log it
      const logId = uuidv4();
      db.run('INSERT INTO activity_logs (id, user_id, action_type, details) VALUES (?, ?, ?, ?)',
        [logId, req.user.user_id, 'AGREEMENT_ASSIGN', `Assigned '${title}' to user ${targetUserId}`]);

      res.json({ message: 'Agreement assigned successfully' });
    }
  );
});

// Sign Agreement
router.post('/:id/sign', verifyToken, (req, res) => {
  const { signature } = req.body;
  const agreementId = req.params.id;

  if (!signature) return res.status(400).json({ message: 'Signature is required' });

  // Verify signature matches full username (Case sensitive? Let's be lenient but strict enough)
  if (signature.trim() !== req.user.username) {
    return res.status(400).json({ message: 'Signature must match your username exactly.' });
  }

  db.get('SELECT * FROM agreements WHERE id = ? AND user_id = ?', [agreementId, req.user.user_id], (err, agreement) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!agreement) return res.status(404).json({ message: 'Agreement not found' });
    if (agreement.is_signed) return res.status(400).json({ message: 'Agreement already signed' });

    const signedAt = new Date().toISOString();
    // Simple hash simulation (in real app, sign with crypto key)
    const signatureHash = Buffer.from(signature + signedAt).toString('base64');

    db.run('UPDATE agreements SET is_signed = 1, signed_at = ?, signature_hash = ? WHERE id = ?',
      [signedAt, signatureHash, agreementId],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        
         // Log it
        const logId = uuidv4();
        db.run('INSERT INTO activity_logs (id, user_id, action_type, details) VALUES (?, ?, ?, ?)',
            [logId, req.user.user_id, 'AGREEMENT_SIGN', `Signed '${agreement.title}'`]);

        res.json({ message: 'Agreement signed successfully' });
      }
    );
  });
});

module.exports = router;
