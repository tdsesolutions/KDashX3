const express = require('express');
const cors = require('cors');
const path = require('path');
const WebSocket = require('ws');
const http = require('http');
require('dotenv').config();

const { initializeDatabase } = require('./models/database');
const { setupWebSocket } = require('./services/websocket');
const { startNodeHeartbeatMonitor } = require('./services/nodeMonitor');
const { startTaskProcessor } = require('./services/taskProcessor');

// Routes
const authRoutes = require('./routes/auth');
const nodeRoutes = require('./routes/nodes');
const taskRoutes = require('./routes/tasks');
const providerRoutes = require('./routes/providers');
const setupRoutes = require('./routes/setup');
const eventRoutes = require('./routes/events');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/nodes', nodeRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/setup', setupRoutes);
app.use('/api/events', eventRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Initialize services
async function startServer() {
  try {
    // Initialize database
    await initializeDatabase();
    console.log('✅ Database initialized');
    
    // Setup WebSocket
    setupWebSocket(server);
    console.log('✅ WebSocket server ready');
    
    // Start node heartbeat monitor
    startNodeHeartbeatMonitor();
    console.log('✅ Node monitor started');
    
    // Start task processor
    startTaskProcessor();
    console.log('✅ Task processor started');
    
    // Start HTTP server
    server.listen(PORT, () => {
      console.log(`\n🚀 KDashX3 Backend running on ${BASE_URL}`);
      console.log(`   Health: ${BASE_URL}/health`);
      console.log(`   API: ${BASE_URL}/api`);
    });
    
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();

module.exports = { app, server };
