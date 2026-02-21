/**
 * API Layer - Stubbed
 * 
 * These are placeholder functions that will be implemented
 * when the backend is ready. For now, they return mock data.
 */

// Setup Module Status
export async function getSetupStatus() {
  // Mock implementation
  return {
    workspace: { completed: true, completed_at: "2026-02-20T10:00:00Z" },
    nodes: { completed: false, pending_actions: ["pair_first_node"] },
    storage: { completed: false, pending_actions: [] },
    providers: { completed: false, pending_actions: [] },
    routing: { completed: false, pending_actions: [] },
    health_checks: { completed: false, pending_actions: [] }
  };
}

// Nodes
export async function getNodes() {
  return [
    { id: "node-1", name: "Local Dev", status: "connected", last_heartbeat: new Date().toISOString() }
  ];
}

export async function initiatePairing() {
  return { pairing_code: "123456", expires_in: 300 };
}

// Tasks
export async function getTasks() {
  return [];
}

export async function createTask(intent) {
  console.log("[STUB] Creating task:", intent);
  return { id: "task-" + Date.now(), status: "pending" };
}

export async function getTask(id) {
  return { id, status: "pending", intent: "Sample task" };
}

// Routing
export async function getRoutingConfig() {
  return {
    rules: [],
    fallback_enabled: true
  };
}

export async function updateRoutingConfig(config) {
  console.log("[STUB] Updating routing:", config);
  return config;
}

// Auth
export async function login(provider) {
  console.log("[STUB] Login with:", provider);
  return { token: "mock-jwt-token", user: { id: "user-1", email: "user@example.com" } };
}

export async function logout() {
  console.log("[STUB] Logout");
  return { success: true };
}

// Gates
export async function checkGates() {
  const nodes = await getNodes();
  return {
    can_execute_tasks: nodes.length > 0,
    has_provider_configured: false,
    blocks: nodes.length === 0 ? ["NODE_REQUIRED"] : []
  };
}
