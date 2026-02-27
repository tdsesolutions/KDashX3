/**
 * KDashX3 API Layer - Real Backend Integration
 */

import { API_BASE_URL } from './config.js';

// Helper to get auth token
function getToken() {
  return localStorage.getItem('kdashx3-token');
}

// Helper for API calls
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  return response.json();
}

// ==================== AUTH ====================

export async function register(email, password) {
  return apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

export async function login(email, password) {
  return apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

export async function getMe() {
  return apiCall('/me');
}

// ==================== WORKSPACES ====================

export async function getWorkspaces() {
  return apiCall('/workspaces');
}

export async function createWorkspace(name, timezone = 'UTC') {
  return apiCall('/workspaces', {
    method: 'POST',
    body: JSON.stringify({ name, timezone })
  });
}

// ==================== PAIRING TOKENS ====================

export async function createPairingToken() {
  return apiCall('/pairing-tokens', { method: 'POST' });
}

export async function createReconnectToken(nodeId) {
  return apiCall('/pairing-tokens/reconnect', {
    method: 'POST',
    body: JSON.stringify({ node_id: nodeId })
  });
}

// ==================== NODES ====================

export async function getNodes() {
  return apiCall('/nodes');
}

// ==================== TASKS ====================

export async function getTasks() {
  return apiCall('/tasks');
}

export async function createTask(intent, priority = 'normal', routingDecision = null) {
  return apiCall('/tasks', {
    method: 'POST',
    body: JSON.stringify({
      intent,
      priority,
      routing_decision: routingDecision
    })
  });
}

export async function createTaskWithAssignment(taskData) {
  return apiCall('/tasks', {
    method: 'POST',
    body: JSON.stringify(taskData)
  });
}

export async function getTask(taskId) {
  return apiCall(`/tasks/${taskId}`);
}

export async function dispatchTask(taskId, nodeId) {
  return apiCall(`/tasks/${taskId}/dispatch`, {
    method: 'POST',
    body: JSON.stringify({ node_id: nodeId })
  });
}

export async function getTaskEvents(taskId) {
  return apiCall(`/tasks/${taskId}/events`);
}

// ==================== NODE MANAGEMENT ====================

export async function disconnectNode(nodeId) {
  return apiCall(`/nodes/${nodeId}/disconnect`, { method: 'POST' });
}

export async function deleteNode(nodeId) {
  return apiCall(`/nodes/${nodeId}`, { method: 'DELETE' });
}
