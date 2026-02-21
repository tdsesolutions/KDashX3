/**
 * Real API Layer - Mission Control Backend
 */

import { API_BASE_URL } from './api-config.js';

// Helper for API calls
async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem('kdashx3-auth-token');
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Auth
export async function register(email, password) {
  const result = await apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  localStorage.setItem('kdashx3-auth-token', result.token);
  return result;
}

export async function login(email, password) {
  const result = await apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  localStorage.setItem('kdashx3-auth-token', result.token);
  return result;
}

export async function getMe() {
  return apiCall('/me');
}

// Workspaces
export async function getWorkspaces() {
  return apiCall('/workspaces');
}

export async function createWorkspace(name, timezone = 'UTC') {
  return apiCall('/workspaces', {
    method: 'POST',
    body: JSON.stringify({ name, timezone })
  });
}

// Pairing Tokens
export async function createPairingToken(workspaceId) {
  return apiCall('/pairing-tokens', {
    method: 'POST',
    body: JSON.stringify({ workspace_id: workspaceId })
  });
}

// Nodes
export async function getNodes(workspaceId) {
  return apiCall(`/nodes?workspace_id=${workspaceId}`);
}

export async function pairNode(token, name, type, os, capabilities) {
  return apiCall('/nodes/pair', {
    method: 'POST',
    body: JSON.stringify({ token, name, type, os, capabilities })
  });
}

// Tasks
export async function getTasks(workspaceId) {
  return apiCall(`/tasks?workspace_id=${workspaceId}`);
}

export async function createTask(workspaceId, intent, priority = 'normal') {
  return apiCall('/tasks', {
    method: 'POST',
    body: JSON.stringify({ workspace_id: workspaceId, intent, priority })
  });
}

export async function getTaskEvents(taskId) {
  return apiCall(`/tasks/${taskId}/events`);
}

export async function dispatchTask(taskId, nodeId) {
  return apiCall(`/tasks/${taskId}/dispatch`, {
    method: 'POST',
    body: JSON.stringify({ node_id: nodeId })
  });
}
