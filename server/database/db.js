// Property of Zafrid - OverSignature. Closed Source. Copyright © 2024-2025. Unauthorized distribution prohibited.
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

let dbPath;

// Determine storage path based on environment
if (process.env.NODE_ENV === 'production') {
  // Production: Use user's home directory or /var/lib if root
  const homeDir = process.env.HOME || (process.env.USERPROFILE);
  const storageDir = path.join(homeDir, '.oversignature', 'storage');
  
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }
  
  dbPath = path.join(storageDir, 'oversignature.db');
  console.log(`[DB] Production mode. Database path: ${dbPath}`);
} else {
  // Development: Use project root (relative to this file: server/database/db.js -> server/ -> root/)
  // We want it in the root of the project, which is two levels up from here?
  // Actually, typical dev setup is to have it in the server folder or root.
  // Let's put it in the project root for easy access.
  // This file is at <project>/server/database/db.js
  // We want <project>/oversignature.db
  dbPath = path.resolve(__dirname, '../../oversignature.db');
  console.log(`[DB] Development mode. Database path: ${dbPath}`);
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('[DB] Connection error:', err.message);
  } else {
    console.log('[DB] Connected to the SQLite database.');
    initSchema();
  }
});

function initSchema() {
  db.serialize(() => {
    // 1. workspaces
    db.run(`CREATE TABLE IF NOT EXISTS workspaces (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      owner_id TEXT,
      api_key TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 2. users
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      workspace_id TEXT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL, -- Owner, Executive, Admin, Moderator, Helper
      discord_id TEXT,
      minecraft_ign TEXT,
      FOREIGN KEY(workspace_id) REFERENCES workspaces(id)
    )`);

    // 3. agreements
    db.run(`CREATE TABLE IF NOT EXISTS agreements (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      title TEXT NOT NULL,
      content TEXT,
      is_signed BOOLEAN DEFAULT 0,
      signed_at DATETIME,
      signature_hash TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // 4. goals
    db.run(`CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      workspace_id TEXT,
      assigned_to TEXT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'Pending', -- Pending, In-Progress, Completed
      due_date DATETIME,
      FOREIGN KEY(workspace_id) REFERENCES workspaces(id),
      FOREIGN KEY(assigned_to) REFERENCES users(id)
    )`);

    // 5. activity_logs
    db.run(`CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      action_type TEXT NOT NULL,
      details TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // 6. integrations
    db.run(`CREATE TABLE IF NOT EXISTS integrations (
      id TEXT PRIMARY KEY,
      workspace_id TEXT,
      type TEXT DEFAULT 'MINECRAFT_SERVER',
      ip_address TEXT NOT NULL,
      port INTEGER DEFAULT 25565,
      rcon_password TEXT,
      FOREIGN KEY(workspace_id) REFERENCES workspaces(id)
    )`);
  });
}

module.exports = db;
