const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/kdashx3.db');

let db = null;

function getDatabase() {
  if (!db) {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Database connection failed:', err);
      } else {
        console.log('Connected to SQLite database');
      }
    });
  }
  return db;
}

async function initializeDatabase() {
  const database = getDatabase();
  
  return new Promise((resolve, reject) => {
    database.exec(`
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Workspaces table
      CREATE TABLE IF NOT EXISTS workspaces (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        org_name TEXT NOT NULL,
        timezone TEXT DEFAULT 'UTC',
        notifications_email INTEGER DEFAULT 1,
        notifications_webhook INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
      
      -- Nodes table
      CREATE TABLE IF NOT EXISTS nodes (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT CHECK(type IN ('local', 'vm', 'server')),
        os TEXT CHECK(os IN ('linux', 'macos', 'windows')),
        status TEXT CHECK(status IN ('pending', 'connected', 'disconnected', 'error')) DEFAULT 'pending',
        capabilities TEXT, -- JSON array
        allowed_folders TEXT, -- JSON array
        default_output_folder TEXT DEFAULT './outputs',
        last_heartbeat DATETIME,
        pairing_token TEXT UNIQUE,
        pairing_expires_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
      
      -- Providers table
      CREATE TABLE IF NOT EXISTS providers (
        id TEXT PRIMARY KEY,
        node_id TEXT NOT NULL,
        type TEXT CHECK(type IN ('openai', 'anthropic', 'google', 'local', 'custom')),
        name TEXT NOT NULL,
        endpoint_url TEXT,
        priority INTEGER DEFAULT 1,
        status TEXT CHECK(status IN ('not_configured', 'configured', 'failing', 'testing')) DEFAULT 'not_configured',
        last_tested DATETIME,
        api_key_encrypted TEXT, -- Encrypted API key stored on node
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (node_id) REFERENCES nodes(id)
      );
      
      -- Tasks table
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        intent TEXT NOT NULL,
        status TEXT CHECK(status IN ('pending', 'routing', 'assigned', 'executing', 'completed', 'failed', 'retrying')) DEFAULT 'pending',
        priority TEXT CHECK(priority IN ('low', 'normal', 'high', 'critical')) DEFAULT 'normal',
        assigned_node_id TEXT,
        selected_provider_id TEXT,
        routing_decision TEXT, -- JSON
        result TEXT, -- JSON
        error TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        started_at DATETIME,
        completed_at DATETIME,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (assigned_node_id) REFERENCES nodes(id)
      );
      
      -- Task events table (for timeline)
      CREATE TABLE IF NOT EXISTS task_events (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        message TEXT,
        metadata TEXT, -- JSON
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks(id)
      );
      
      -- Node agent sessions (for WebSocket tracking)
      CREATE TABLE IF NOT EXISTS node_sessions (
        id TEXT PRIMARY KEY,
        node_id TEXT NOT NULL,
        socket_id TEXT NOT NULL,
        connected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (node_id) REFERENCES nodes(id)
      );
      
      CREATE INDEX IF NOT EXISTS idx_nodes_user ON nodes(user_id);
      CREATE INDEX IF NOT EXISTS idx_nodes_status ON nodes(status);
      CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks(user_id);
      CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
      CREATE INDEX IF NOT EXISTS idx_task_events_task ON task_events(task_id);
    `, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

module.exports = { getDatabase, initializeDatabase };
