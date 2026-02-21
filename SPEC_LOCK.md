# SPEC_LOCK.md - KDashX3 Mission Control

**Product:** KDashX3 - Mission Control BYO Runtime + BYO API Keys  
**Version:** 2.0.0  
**Last Updated:** 2026-02-20  
**Status:** SCOPED - Not Yet Implemented

---

## 1. Product Definition

### Core Principle: BYO (Bring Your Own)
- **BYO Runtime:** Users provide their own compute (VMs, laptops, servers)
- **BYO API Keys:** LLM provider keys stored ON USER NODES, NOT in dashboard
- **Dashboard Role:** Orchestration layer only - never holds sensitive credentials

### Key Differentiators
1. Distributed architecture - nodes connect to dashboard (not reverse)
2. Keys stay on user infrastructure
3. Resumable setup - complete configuration incrementally
4. Hard gates prevent unsafe operations

---

## 2. Required Pages/Routes

| Route | Purpose | Auth Required | Setup Required |
|-------|---------|---------------|----------------|
| `/login` | Authentication entry | No | No |
| `/setup` | Initial setup wizard | Yes | No |
| `/dashboard` | Main command center | Yes | Yes (Node connected) |
| `/nodes` | Node management | Yes | Yes |
| `/providers` | Provider configuration view | Yes | Yes |
| `/routing` | Routing rules & policies | Yes | Yes |
| `/tasks` | Task list & history | Yes | Yes |
| `/tasks/:id` | Task detail view | Yes | Yes |
| `/settings` | Configuration & modules | Yes | Partial (resumable) |
| `/billing` | Usage & subscription | Yes | No |
| `/locked` | Gate blocking page | Yes | When gates fail |

### Navigation Structure
```
[Logo]                    [Node Status] [User Menu]
  |
  +-- Dashboard (overview)
  +-- Nodes (management)
  +-- Providers (view-only)
  +-- Routing (policies)
  +-- Tasks (history)
  +-- Settings (all modules)
```

---

## 3. Setup Modules (Resumable)

Setup can be completed in any order and resumed later via Settings.

### Module 1: Workspace
- [ ] Organization name
- [ ] Timezone preference
- [ ] Default notification settings
- **Completes:** Basic profile

### Module 2: Nodes
- [ ] Pair first node (required for tasks)
- [ ] Node health verification
- [ ] Connection testing
- **Completes:** `has_connected_node` = true
- **Gate:** Cannot run tasks without at least 1 connected node

### Module 3: Storage & Permissions
- [ ] Default workspace directory
- [ ] File size limits
- [ ] Retention policies
- **Completes:** Storage configuration

### Module 4: Providers (Node-local)
- [ ] Configure providers ON NODE (not dashboard)
- [ ] Provider health checks
- [ ] Fallback ordering
- **Completes:** `has_configured_provider` = true
- **Gate:** Cannot run LLM tasks without at least 1 provider on a node

### Module 5: Routing
- [ ] Intent classification rules
- [ ] Agent assignment policies
- [ ] Risk thresholds
- **Completes:** Routing policies active

### Module 6: Health Checks
- [ ] Node connectivity test
- [ ] Provider response test
- [ ] End-to-end pipeline test
- **Completes:** System ready

### Module Status Tracking
```json
{
  "setup_progress": {
    "workspace": {"completed": true, "completed_at": "ISO8601"},
    "nodes": {"completed": false, "pending_actions": ["pair_first_node"]},
    "storage": {"completed": false, "pending_actions": []},
    "providers": {"completed": false, "pending_actions": []},
    "routing": {"completed": false, "pending_actions": []},
    "health_checks": {"completed": false, "pending_actions": []}
  }
}
```

---

## 4. LLM Components

### 4.1 Setup Assistant

**Purpose:** Guide users through setup with contextual help

**Input:**
```json
{
  "current_step": "nodes",
  "completed_modules": ["workspace"],
  "user_context": {
    "has_nodes": false,
    "has_providers": false,
    "previous_attempts": []
  },
  "question": "How do I connect my first node?"
}
```

**Output Schema:**
```json
{
  "next_step": "nodes | providers | routing | health_checks | complete",
  "missing_requirements": ["string"],
  "node_actions": [
    {
      "action": "install_cli | generate_pairing_code | test_connection",
      "description": "string",
      "command": "string (optional)"
    }
  ],
  "provider_actions": [
    {
      "action": "configure_local | test_provider | set_fallback",
      "description": "string"
    }
  ],
  "user_questions": [
    {
      "question": "string",
      "context": "string",
      "required_answer": "string (optional)"
    }
  ]
}
```

### 4.2 Routing Brain

**Purpose:** Determine optimal task routing based on intent and available resources

**Input:**
```json
{
  "intent": "string - user task description",
  "context": {
    "available_nodes": [{"id": "string", "capabilities": ["string"]}],
    "configured_providers": [{"id": "string", "type": "string"}],
    "task_history": []
  },
  "constraints": {
    "max_cost": "number (optional)",
    "priority": "low | normal | high | critical"
  }
}
```

**Output Schema:**
```json
{
  "selected_node_id": "string",
  "required_capabilities": ["string"],
  "provider_preference": "openai | anthropic | google | local | auto",
  "fallback_order": ["provider_id"],
  "output_location": {
    "type": "node_local | dashboard_temp",
    "path": "string (relative)"
  },
  "risk_level": "low | medium | high | critical",
  "approval_required": true,
  "estimated_tokens": "number",
  "estimated_cost": "number (USD)"
}
```

---

## 5. Hard Gates

### Gate 1: Node Connection Required
**Condition:** `connected_nodes_count < 1`
**Behavior:**
- Block: Task creation, execution
- Allow: Setup, Settings, Billing
- Redirect: `/locked` with message "Connect a node to start executing tasks"
- CTA: "Go to Setup" or "View Node Docs"

### Gate 2: Provider Configuration Required
**Condition:** `has_llm_provider_configured == false`
**Behavior:**
- Block: LLM-based task execution
- Allow: Non-LLM tasks (if any), all other pages
- Warning: "Configure a provider on your node to use AI features"
- CTA: "Configure Provider" (links to node-local config)

### Gate 3: Deployment Approval
**Condition:** User attempts to deploy/push/production change
**Behavior:**
- ALWAYS block without explicit approval phrase
- Required phrase: "APPROVED TO DEPLOY"
- No automation, no workarounds

---

## 6. Data Models

### 6.1 Node
```typescript
interface Node {
  id: string;                    // UUID
  name: string;
  pairing_code: string;          // One-time use, short-lived
  status: 'pending' | 'connected' | 'disconnected' | 'error';
  last_heartbeat: ISO8601;
  capabilities: string[];        // ['gpu', 'docker', 'python', ...]
  ip_address: string;            // Optional
  version: string;               // Agent version
  workspace_path: string;        // Local to node
  providers: ProviderConfig[];   // Node-local provider configs
}
```

### 6.2 Task
```typescript
interface Task {
  id: string;
  intent: string;
  status: 'pending' | 'routing' | 'assigned' | 'executing' | 'completed' | 'failed';
  assigned_node_id: string | null;
  routing_decision: RoutingBrainOutput;
  created_at: ISO8601;
  started_at: ISO8601 | null;
  completed_at: ISO8601 | null;
  result: {
    output: string;
    artifacts: string[];         // File paths
    token_usage: number;
    cost: number;
  } | null;
  error: string | null;
}
```

### 6.3 ProviderConfig (Node-local)
```typescript
interface ProviderConfig {
  id: string;
  type: 'openai' | 'anthropic' | 'google' | 'local' | 'custom';
  // NOTE: API keys stored ON NODE, not here
  endpoint_url: string;          // For custom/local providers
  health_status: 'healthy' | 'degraded' | 'unhealthy';
  last_health_check: ISO8601;
  priority: number;              // Lower = higher priority
}
```

---

## 7. API Stubs (No Implementation)

### GET /api/setup/status
Returns setup progress for all modules.

### POST /api/nodes/pair
Initiates node pairing (generates code).

### GET /api/nodes
List all nodes with status.

### GET /api/tasks
List tasks with pagination.

### POST /api/tasks
Create new task (respects gates).

### GET /api/tasks/:id
Get task details and results.

### GET /api/routing/config
Get routing policies.

### POST /api/routing/config
Update routing policies.

---

## 8. Security Requirements

### 8.1 Key Storage
- **NEVER** store API keys in dashboard database
- Keys live only on user nodes
- Dashboard requests node to perform operations
- Node validates dashboard request via pairing

### 8.2 Authentication
- JWT-based sessions
- OAuth providers: Google, GitHub
- Token expiration: 24 hours
- Refresh token: 7 days

### 8.3 Authorization
- Row-level security (RLS) on all data
- Users can only see their own nodes, tasks, configs
- No cross-tenant access

---

## 9. Compliance Notes

### No Deploy Without Approval
- Deployment action requires explicit phrase
- No automated deployments
- All production changes require manual approval
- Audit log of all deployments

### Key Rotation
- Users rotate keys on their nodes
- Dashboard never has access to keys
- No key storage = no key breach risk

---

## 10. Implementation Status

| Component | Status | Notes |
|-----------|--------|-------|
| Repo created | ✅ Complete | https://github.com/tdsesolutions/KDashX3 |
| SPEC_LOCK.md | ✅ Complete | This document |
| Page scaffolding | 🔄 Pending | Create src/pages/* |
| Setup modules | 🔄 Pending | Implement wizard |
| LLM interfaces | 🔄 Pending | Stub with JSON schemas |
| Backend API | 🔄 Pending | Stub endpoints |
| Hard gates | 🔄 Pending | Implement checks |
| Auth system | 🔄 Pending | OAuth integration |

---

**Next Steps:**
1. Scaffold React/Vue app structure
2. Create page components (stubs)
3. Implement navigation
4. Add Setup Center with mock data
5. Stub API layer
6. Create LLM interface stubs

**Locked Until:** Implementation begins
