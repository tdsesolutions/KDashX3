/**
 * Execution Page - Phase A MVP
 * 
 * Real-time task execution view with polling
 * Shows: intent, status, live logs, result
 */

import { store } from '../lib/store.js';
import { getTask, getTaskEvents } from '../lib/api.js';

// Polling state
let pollInterval = null;
let currentTaskId = null;

export function renderExecution(taskId) {
  currentTaskId = taskId;
  
  const tasks = store.get('tasks') || [];
  const task = tasks.find(t => t.id === taskId);
  
  if (!task) {
    // Task not in store yet, show loading
    return `
      <div class="execution-page">
        <header class="page-header">
          <div class="container">
            <a href="#/tasks" class="back-link">← Back to Tasks</a>
            <h1>Execution</h1>
          </div>
        </header>
        <main class="container">
          <div class="loading-state card">
            <div class="spinner"></div>
            <p>Loading task...</p>
          </div>
        </main>
      </div>
    `;
  }
  
  const nodes = store.get('nodes') || [];
  const node = nodes.find(n => n.id === task.node_id);
  
  const isComplete = task.status === 'completed' || task.status === 'failed';
  const isRunning = task.status === 'dispatched' || task.status === 'executing';
  
  return `
    <div class="execution-page">
      <header class="page-header">
        <div class="container">
          <a href="#/tasks" class="back-link">← Back to Tasks</a>
          <h1>Execution</h1>
          <div class="execution-status-header">
            <span class="badge badge-${getStatusBadgeClass(task.status)}">${formatStatus(task.status)}</span>
            ${isRunning ? '<span class="live-indicator">● Live</span>' : ''}
          </div>
        </div>
      </header>
      
      <main class="container">
        <div class="execution-layout">
          <!-- Main: Intent & Logs -->
          <div class="execution-main">
            <!-- Intent Card -->
            <div class="execution-card card">
              <h3>Intent</h3>
              <p class="execution-intent">${task.intent}</p>
              <div class="execution-meta">
                <span class="meta-item">
                  <span class="meta-label">Priority:</span>
                  <span class="meta-value">${task.priority}</span>
                </span>
                <span class="meta-item">
                  <span class="meta-label">Created:</span>
                  <span class="meta-value">${new Date(task.created_at).toLocaleString()}</span>
                </span>
              </div>
            </div>
            
            <!-- Live Logs -->
            <div class="execution-card card">
              <div class="logs-header">
                <h3>Live Logs</h3>
                <div class="logs-actions">
                  <button onclick="refreshExecutionLogs()" class="btn btn-small btn-secondary">
                    🔄 Refresh
                  </button>
                  <button onclick="toggleAutoScroll()" class="btn btn-small btn-secondary" id="autoscroll-btn">
                    Auto-scroll: ON
                  </button>
                </div>
              </div>
              <div id="execution-logs" class="execution-logs">
                <div class="logs-placeholder">
                  ${isRunning ? '<div class="spinner-small"></div> Waiting for logs...' : 'No logs available'}
                </div>
              </div>
            </div>
            
            <!-- Result (shown when complete) -->
            ${task.result ? `
              <div class="execution-card card result-success">
                <h3>✅ Result</h3>
                <pre class="result-content">${formatResult(task.result)}</pre>
              </div>
            ` : ''}
            
            ${task.error ? `
              <div class="execution-card card result-error">
                <h3>❌ Error</h3>
                <pre class="error-content">${task.error}</pre>
              </div>
            ` : ''}
          </div>
          
          <!-- Sidebar: Details -->
          <div class="execution-sidebar">
            <div class="execution-card card">
              <h3>Task Details</h3>
              <div class="detail-list">
                <div class="detail-item">
                  <span class="detail-label">Task ID</span>
                  <span class="detail-value mono">${task.id.slice(0, 8)}...</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Status</span>
                  <span class="detail-value">${formatStatus(task.status)}</span>
                </div>
                ${node ? `
                  <div class="detail-item">
                    <span class="detail-label">Node</span>
                    <span class="detail-value">${node.name}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Node ID</span>
                    <span class="detail-value mono">${node.id.slice(0, 8)}...</span>
                  </div>
                ` : ''}
                ${task.started_at ? `
                  <div class="detail-item">
                    <span class="detail-label">Started</span>
                    <span class="detail-value">${new Date(task.started_at).toLocaleTimeString()}</span>
                  </div>
                ` : ''}
                ${task.completed_at ? `
                  <div class="detail-item">
                    <span class="detail-label">Completed</span>
                    <span class="detail-value">${new Date(task.completed_at).toLocaleTimeString()}</span>
                  </div>
                ` : ''}
              </div>
            </div>
            
            <!-- Actions -->
            <div class="execution-card card">
              <h3>Actions</h3>
              <div class="action-list">
                <a href="#/intent" class="btn btn-primary btn-full">New Task</a>
                ${isComplete ? `
                  <button onclick="rerunTask('${task.id}')" class="btn btn-secondary btn-full">
                    Re-run Task
                  </button>
                ` : ''}
              </div>
            </div>
            
            <!-- Polling Status -->
            <div class="execution-card card polling-status">
              <span class="polling-indicator" id="polling-indicator">●</span>
              <span class="polling-text">Live updates</span>
              <span class="polling-interval">(2s)</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  `;
}

// Helper functions
function getStatusBadgeClass(status) {
  const classes = {
    pending: 'warning',
    dispatched: 'info',
    executing: 'info',
    completed: 'success',
    failed: 'error'
  };
  return classes[status] || 'warning';
}

function formatStatus(status) {
  const labels = {
    pending: 'Pending',
    dispatched: 'Dispatched',
    executing: 'Executing',
    completed: 'Completed',
    failed: 'Failed'
  };
  return labels[status] || status;
}

function formatResult(result) {
  if (typeof result === 'string') return result;
  try {
    return JSON.stringify(result, null, 2);
  } catch {
    return String(result);
  }
}

// Polling management
let autoScroll = true;

window.startExecutionPolling = function(taskId) {
  // Clear any existing interval
  if (pollInterval) {
    clearInterval(pollInterval);
  }
  
  currentTaskId = taskId;
  let pollDelay = 2000; // Start with 2 seconds
  
  // Initial load
  loadExecutionLogs(taskId);
  
  // Start polling
  pollInterval = setInterval(async () => {
    if (!currentTaskId) return;
    
    const tasks = store.get('tasks') || [];
    const task = tasks.find(t => t.id === currentTaskId);
    
    if (!task) {
      // Refresh tasks from API
      await store.syncTasks();
    }
    
    // Load logs
    await loadExecutionLogs(currentTaskId);
    
    // Check if complete - back off polling
    if (task && (task.status === 'completed' || task.status === 'failed')) {
      pollDelay = 5000; // Slow to 5 seconds
    }
  }, pollDelay);
};

window.stopExecutionPolling = function() {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
  currentTaskId = null;
};

window.loadExecutionLogs = async function(taskId) {
  const logsContainer = document.getElementById('execution-logs');
  if (!logsContainer) return;
  
  try {
    const events = await getTaskEvents(taskId);
    
    if (events.length === 0) {
      const tasks = store.get('tasks') || [];
      const task = tasks.find(t => t.id === taskId);
      const isRunning = task && (task.status === 'dispatched' || task.status === 'executing');
      
      logsContainer.innerHTML = `
        <div class="logs-placeholder">
          ${isRunning ? '<div class="spinner-small"></div> Waiting for node to report logs...' : 'No logs available for this task'}
        </div>
      `;
      return;
    }
    
    // Render logs
    const logsHtml = events.map(event => {
      const time = new Date(event.created_at).toLocaleTimeString();
      let content = '';
      
      switch (event.event_type) {
        case 'created':
          content = `<span class="log-type">📋</span> Task created`;
          break;
        case 'dispatched':
          const payload = event.payload || {};
          content = `<span class="log-type">🚀</span> Dispatched to ${payload.node_name || 'node'}`;
          break;
        case 'log':
          const line = event.payload?.line || '';
          content = `<span class="log-type">📝</span> <pre class="log-line">${escapeHtml(line)}</pre>`;
          break;
        case 'completed':
          content = `<span class="log-type">✅</span> Task completed successfully`;
          break;
        case 'failed':
          const error = event.payload?.error || 'Unknown error';
          content = `<span class="log-type">❌</span> Task failed: ${escapeHtml(error)}`;
          break;
        default:
          content = `<span class="log-type">📌</span> ${event.event_type}`;
      }
      
      return `
        <div class="log-entry">
          <span class="log-time">${time}</span>
          <span class="log-content">${content}</span>
        </div>
      `;
    }).join('');
    
    logsContainer.innerHTML = `<div class="logs-list">${logsHtml}</div>`;
    
    // Auto-scroll to bottom
    if (autoScroll) {
      logsContainer.scrollTop = logsContainer.scrollHeight;
    }
    
  } catch (err) {
    console.error('Failed to load logs:', err);
    logsContainer.innerHTML = `<div class="logs-error">Failed to load logs: ${err.message}</div>`;
  }
};

window.refreshExecutionLogs = function() {
  if (currentTaskId) {
    loadExecutionLogs(currentTaskId);
  }
};

window.toggleAutoScroll = function() {
  autoScroll = !autoScroll;
  const btn = document.getElementById('autoscroll-btn');
  if (btn) {
    btn.textContent = `Auto-scroll: ${autoScroll ? 'ON' : 'OFF'}`;
  }
};

window.rerunTask = function(taskId) {
  // Navigate to intent with pre-filled data
  const tasks = store.get('tasks') || [];
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    // Store intent for pre-fill (could use sessionStorage)
    sessionStorage.setItem('rerun-intent', task.intent);
    window.navigate('/intent');
  }
};

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Lifecycle hooks for polling
export function onExecutionMount(taskId) {
  startExecutionPolling(taskId);
}

export function onExecutionUnmount() {
  stopExecutionPolling();
}
