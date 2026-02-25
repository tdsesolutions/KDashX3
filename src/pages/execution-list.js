/**
 * Execution Page - Lists all tasks with status
 * UI Parity: Central place to view all execution activity
 */

import { store } from '../lib/store.js';

export function renderExecution() {
  const tasks = store.get('tasks') || [];
  const hasOnlineNodes = store.hasConnectedNodes();
  const hasPairedNodes = (store.get('nodes') || []).length > 0;
  
  // Sort by most recent first
  const sortedTasks = [...tasks].sort((a, b) => 
    new Date(b.created_at) - new Date(a.created_at)
  );
  
  const activeTasks = sortedTasks.filter(t => 
    t.status === 'pending' || t.status === 'dispatched' || t.status === 'executing'
  );
  
  const completedTasks = sortedTasks.filter(t => 
    t.status === 'completed' || t.status === 'failed'
  );
  
  return `
    <div class="execution-page">
      <header class="page-header">
        <div class="container">
          <h1>Execution</h1>
          <p class="text-muted">View and monitor all your tasks</p>
        </div>
      </header>
      
      <main class="container">
        ${!hasPairedNodes ? `
          <div class="blocked-state card">
            <div class="blocked-icon">🔒</div>
            <h2>Add a Node First</h2>
            <p>You need to connect at least one node to start executing tasks.</p>
            <a href="#/nodes" class="btn btn-primary">Add Node</a>
          </div>
        ` : !hasOnlineNodes ? `
          <div class="blocked-state card">
            <div class="blocked-icon">⏳</div>
            <h2>Node Paired, But Offline</h2>
            <p>Start the connector on your node to go online and execute tasks.</p>
            <div class="blocked-actions">
              <a href="#/nodes" class="btn btn-primary">Go to Nodes</a>
              <button onclick="refreshExecutionPage()" class="btn btn-secondary">Refresh Status</button>
            </div>
          </div>
        ` : ''}
        
        <!-- Active Tasks Section -->
        <div class="execution-section">
          <div class="section-header">
            <h2>Active Tasks</h2>
            <span class="badge badge-info">${activeTasks.length}</span>
          </div>
          
          ${activeTasks.length === 0 ? `
            <div class="empty-state card">
              <div class="empty-icon">⚡</div>
              <p class="empty-text">No active tasks running</p>
              <a href="#/intent" class="btn btn-primary">Create Intent</a>
            </div>
          ` : `
            <div class="execution-list">
              ${activeTasks.map(task => renderExecutionItem(task)).join('')}
            </div>
          `}
        </div>
        
        <!-- Completed Tasks Section -->
        ${completedTasks.length > 0 ? `
          <div class="execution-section">
            <div class="section-header">
              <h2>Completed</h2>
              <span class="badge badge-secondary">${completedTasks.length}</span>
            </div>
            <div class="execution-list">
              ${completedTasks.slice(0, 10).map(task => renderExecutionItem(task)).join('')}
            </div>
            ${completedTasks.length > 10 ? `
              <p class="text-muted text-center">+ ${completedTasks.length - 10} more tasks</p>
            ` : ''}
          </div>
        ` : ''}
      </main>
    </div>
  `;
}

function renderExecutionItem(task) {
  const nodes = store.get('nodes') || [];
  const node = nodes.find(n => n.id === task.node_id);
  
  const statusConfig = {
    pending: { icon: '⏳', class: 'status-pending', label: 'Pending' },
    dispatched: { icon: '🚀', class: 'status-dispatched', label: 'Dispatched' },
    executing: { icon: '⚡', class: 'status-executing', label: 'Executing' },
    completed: { icon: '✅', class: 'status-completed', label: 'Completed' },
    failed: { icon: '❌', class: 'status-failed', label: 'Failed' }
  };
  
  const status = statusConfig[task.status] || statusConfig.pending;
  
  return `
    <a href="#/execution/${task.id}" class="execution-item ${status.class}">
      <div class="execution-status-icon">${status.icon}</div>
      <div class="execution-content">
        <div class="execution-header">
          <span class="execution-intent">${escapeHtml(task.intent.substring(0, 60))}${task.intent.length > 60 ? '...' : ''}</span>
          <span class="execution-time">${formatTime(task.created_at)}</span>
        </div>
        <div class="execution-meta">
          <span class="badge badge-${getStatusBadgeClass(task.status)}">${status.label}</span>
          ${node ? `<span class="execution-node">on ${escapeHtml(node.name)}</span>` : ''}
          ${task.priority !== 'normal' ? `<span class="priority-badge priority-${task.priority}">${task.priority}</span>` : ''}
        </div>
      </div>
      <div class="execution-arrow">→</div>
    </a>
  `;
}

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

function formatTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  // Less than 1 hour
  if (diff < 3600000) {
    const mins = Math.floor(diff / 60000);
    return mins < 1 ? 'Just now' : `${mins}m ago`;
  }
  
  // Less than 24 hours
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}h ago`;
  }
  
  return date.toLocaleDateString();
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

window.refreshExecutionPage = async function() {
  await store.syncNodes();
  window.navigate('/execution');
};
