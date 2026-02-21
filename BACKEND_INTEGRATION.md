# KDashX3 Mission Control - Real Backend Integration

## DELIVERABLES

### 1. Backend Repository

**Path**: `~/mission-control-backend/`

**Service Name**: `mission-control-api.service` (created but requires manual start due to no sudo access)

**How to Check Status**:
```bash
# Check if running
ps aux | grep "node server.js"

# Check logs
tail -f ~/mission-control-backend/server.log

# Health check
curl http://localhost:3001/health
```

**Start/Stop Commands**:
```bash
# Start
cd ~/mission-control-backend
export PORT=3001
export JWT_SECRET="your-secret"
export NODE_JWT_SECRET="node-secret"
node server.js &

# Stop
pkill -f "node server.js"
```

### 2. Backend Base URL

**HTTP API**: `http://104.197.56.55:3001`

**WebSocket**: `ws://104.197.56.55:3001/ws/nodes`

**Health Endpoint**: `http://104.197.56.55:3001/health`

### 3. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Register new user |
| POST | /auth/login | Login user |
| GET | /me | Get current user |
| GET | /workspaces | List workspaces |
| POST | /workspaces | Create workspace |
| POST | /pairing-tokens | Create pairing token (10 min TTL) |
| POST | /nodes/pair | Pair node with token |
| POST | /nodes/:id/heartbeat | Node heartbeat |
| GET | /nodes | List nodes |
| POST | /tasks | Create task |
| GET | /tasks | List tasks |
| GET | /tasks/:id | Get task |
| POST | /tasks/:id/dispatch | Dispatch task to node |
| GET | /tasks/:id/events | Get task events |
| GET | /health | Health check |

### 4. Node Connector

**Path**: `~/mission-control-backend/node-connector/connector.js`

**Global Command**: `mc-node` (symlinked to ~/bin/)

**Usage Examples**:

```bash
# On VM (this machine):
mc-node --api "http://104.197.56.55:3001" \
        --token "YOUR_PAIRING_TOKEN" \
        --name "vm-node-1" \
        --type "vm" \
        --capabilities "python,docker"

# On local Mac/PC:
mc-node --api "http://104.197.56.55:3001" \
        --token "YOUR_PAIRING_TOKEN" \
        --name "local-dev" \
        --type "local" \
        --capabilities "python,nodejs"
```

**Node Connector Features**:
- Pair with backend using token
- WebSocket connection for real-time communication
- Heartbeat every 30 seconds
- Task execution (stubbed for now)
- Log streaming to backend

### 5. Frontend Integration

**Frontend URL**: https://tdsesolutions.github.io/KDashX3/

**API Config**: `src/lib/api-config.js`
- Points to backend at `http://104.197.56.55:3001`

**Authentication**: Real JWT-based auth
- Register/login with email/password
- Token stored in localStorage
- Auto-refresh for nodes and tasks

**Real Features**:
- ✅ User registration/login
- ✅ Workspace creation
- ✅ Pairing token generation
- ✅ Real node status (online/offline via heartbeat)
- ✅ Task creation and dispatch
- ✅ Task event timeline from backend

### 6. Database

**Type**: SQLite

**Location**: `~/mission-control-backend/data/mission_control.db`

**Tables**:
- users
- workspaces
- pairing_tokens
- nodes
- tasks
- task_events

### 7. Test Verification

**Backend Test**:
```bash
curl http://localhost:3001/health
# Response: {"status":"ok","timestamp":"..."}
```

**Full Flow Test**:
```bash
# 1. Register
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# 2. Create pairing token (use token from step 1)
curl -X POST http://localhost:3001/pairing-tokens \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"workspace_id":"<WORKSPACE_ID>"}'

# 3. Pair node
curl -X POST http://localhost:3001/nodes/pair \
  -H "Content-Type: application/json" \
  -d '{"token":"<PAIRING_TOKEN>","name":"test","type":"vm"}'
```

### 8. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend (GitHub Pages)                                    │
│  https://tdsesolutions.github.io/KDashX3/                  │
│                                                             │
│  - Real auth with JWT                                       │
│  - API calls to backend                                     │
│  - Real node status                                         │
│  - Real task lifecycle                                      │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/WebSocket
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Backend (VM - 104.197.56.55:3001)                         │
│  ~/mission-control-backend/                                 │
│                                                             │
│  - Express REST API                                         │
│  - WebSocket for nodes                                      │
│  - SQLite database                                          │
│  - JWT authentication                                       │
└──────────────────────┬──────────────────────────────────────┘
                       │ WebSocket
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Node Connector                                             │
│  ~/mission-control-backend/node-connector/                  │
│                                                             │
│  - Runs on VM or local machines                             │
│  - Pairs with token                                         │
│  - Heartbeats every 30s                                     │
│  - Executes tasks                                           │
└─────────────────────────────────────────────────────────────┘
```

### 9. File Structure

```
~/mission-control-backend/
├── server.js              # Main backend server
├── database.js            # SQLite database module
├── data/
│   └── mission_control.db # SQLite database file
├── node-connector/
│   ├── connector.js       # Node connector CLI
│   └── package.json
├── package.json
└── server.log             # Runtime logs

~/KDashX3/
├── src/
│   ├── lib/
│   │   ├── api-config.js  # API URL config
│   │   ├── api-real.js    # Real API calls
│   │   ├── store-real.js  # Real state management
│   │   └── store.js       # Store export
│   └── pages/
│       ├── login.js       # Real auth UI
│       ├── nodes.js       # Real node management
│       └── tasks.js       # Real task management
```

### 10. Current Status

**Backend**: ✅ Running on port 3001
**Frontend**: ✅ Deployed to GitHub Pages
**Node Connector**: ✅ Ready to use
**Database**: ✅ SQLite with real persistence

**KDashX3 NO LONGER RELIES ON SIMULATED NODES/TASKS**

All functionality now uses real backend APIs:
- Real user authentication
- Real workspace management
- Real pairing tokens (single-use, 10 min TTL)
- Real node registration and heartbeats
- Real task creation, dispatch, and events

### 11. Known Limitations

1. **Task Execution**: Currently stubbed in node connector. Real task execution would require:
   - Docker integration
   - Language-specific runners
   - Sandboxing

2. **SSL/HTTPS**: Backend currently runs on HTTP. For production:
   - Set up reverse proxy with SSL
   - Use Let's Encrypt certificates

3. **Systemd Service**: Cannot auto-start due to no sudo. Manual start required.

4. **CORS**: Backend allows all origins for development. Configure properly for production.

### 12. Next Steps for Full Production

1. Add SSL/TLS to backend
2. Implement real task execution in node connector
3. Add provider configuration management
4. Implement routing brain with real LLM calls
5. Add monitoring and alerting
6. Set up proper systemd service with sudo access
