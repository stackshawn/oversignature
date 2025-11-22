// Property of Zafrid - OverSignature. Closed Source. Copyright © 2024-2025. Unauthorized distribution prohibited.
const express = require('express');
const path = require('path');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const setupRoutes = require('./routes/setup');
const minecraftRoutes = require('./routes/minecraft');

const app = express();
const PORT = process.env.PORT || 24042;

// Middleware
app.use(cors()); // In production, you might want to restrict this to localhost if serving static files
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/setup', setupRoutes);
app.use('/api/minecraft', minecraftRoutes);

// Serve Static Frontend in Production
if (process.env.NODE_ENV === 'production') {
  const clientDistPath = path.join(__dirname, '../client/dist');
  app.use(express.static(clientDistPath));

  // Handle SPA routing: return index.html for any unknown route
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`[Server] OverSignature running on port ${PORT}`);
  console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
});
