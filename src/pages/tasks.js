/**
 * Tasks Page - Real Task Management
 */

import { store } from '../lib/store.js';
import { createTask, getTasks, getTaskEvents, dispatchTask } from '../lib/api.js';

export function renderTasks() {
  const state = store.get();
  const tasks = state.tasks || [];
  const hasNodes = store.hasConnectedNodes();
  
  return `
    <div class="tasks-page">
      <header class="page-header">
        <div class="container">
          <h1>Tasks</h1>
          <p class="text-muted">View and manage your tasks</p>
        </div>
      </header>
      
      <main class="container">
        ${renderTasksToolbar(hasNodes)}
        ${renderTasksList(tasks, hasNodes)}
      </main>
    </div>
  `;
}

function renderTasksToolbar(hasNodes) {
  return `
    <div class="tasks-toolbar">
      <a href="#/tasks/new" class="btn btn-primary ${!hasNodes ? 'disabled' : ''}">
        + New Task
      </a>
      ${!hasNodes ? `
        <span class="toolbar-notice">
          <span class="notice-icon">⚠️</span>
          Add a node to create tasks
        </span>
      ` : ''}
      <button onclick="refreshTasks()" class="btn btn-secondary">
        🔄 Refresh
      </button>
    </div>
  `;
}

function renderTasksList(tasks, hasNodes) {
  if (!hasNodes) {
    return `
      <div class="blocked-state card">
        <div class="blocked-icon">🔒</div>
        <h2>Tasks Blocked</h2>
        <p>You need at least one connected node to create and run tasks.</p>
        <a href="#/nodes" class="btn btn-primary">Add Node</a>
      </div>
    `;
  }
  
  if (tasks.length === 0) {
    return `
      <div class="empty-state card">
        <div class="empty-icon">📋</div>
        <h2 class="empty-title">No Tasks Yet</h2>
        <p class="empty-description">Create your first task to get started with AI-powered automation.</p>
        <a href="#/tasks/new" class="btn btn-primary">Create First Task</a>
      </div>
    `;
  }
  
  return `
    <div class="tasks-list">
      ${tasks.map(task => renderTaskCard(task)).join('')}
    </div>
  `;
}

function renderTaskCard(task) {
  const statusBadges = {
    pending: { class: 'badge-warning', text: 'Pending' },
    assigned: { class: 'badge-info', text: 'Assigned' },
    executing: { class: 'badge-info', text: 'Executing' },
    completed: { class: 'badge-success', text: 'Completed' },
    failed: { class: 'badge-error', text: 'Failed' },
    cancelled: { class: 'badge-error', text: 'Cancelled' }
  };
  
  const badge = statusBadges[task.status] || statusBadges.pending;
  const nodes = store.get().nodes || [];
  const node = nodes.find(n => n.id === task.node_id);
  
  return `
    <div class="task-card card">
      <div class="task-header">
        <div class="task-info">
          <h3 class="task-intent">${task.intent}</h3>
          <div class="task-meta">
            <span class="badge ${badge.class}">${badge.text}</span>
            ${node ? `<span class="task-node">on ${node.name}</span>` : ''}
            <span class="task-time">${new Date(task.created_at).toLocaleString()}</span>
          </div>
        </div>
        <div class="task-actions">
          <a href="#/tasks/${task.id}" class="btn btn-small btn-secondary">View</a>
          ${task.status === 'pending' ? `
            <button onclick="dispatchTaskToNode('${task.id}')" class="btn btn-small btn-primary">Dispatch</button>
          ` : ''}
        </div>
      </div>
      
      ${task.error ? `
        <div class="task-error">
          <span class="error-icon">⚠️</span>
          <span>${task.error}</span>
        </div>
      ` : ''}
    </div>
  `;
}

// New Task Page
export function renderNewTask() {
  const hasNodes = store.hasConnectedNodes();
  
  if (!hasNodes) {
    return `
      <div class="blocked-page">
        <div class="blocked-content">
          <div class="lock-icon">🔒</div>
          <h1>Cannot Create Task</h1>
          <p>No connected nodes available.</p>
          <a href="#/nodes" class="btn btn-primary">Add Node</a>
        </div>
      </div>
    `;
  }
  
  return `
    <div class="new-task-page">
      <header class="page-header">
        <div class="container">
          <a href="#/tasks" class="back-link">← Back to Tasks</a>
          <h1>Create New Task</h1>
        </div>
      </header>
      
      <main class="container">
        <div class="task-form card">
          <div class="form-group">
            <label class="form-label">What do you want to do?</label>
            <textarea 
              id="task-intent" 
              class="form-textarea" 
              placeholder="Describe your task in detail... e.g., Deploy a Python Flask app to Docker"
              rows="4"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label class="form-label">Priority</label>
            <select id="task-priority" class="form-select">
              <option value="low">Low - Background task</option>
              <option value="normal" selected>Normal - Standard priority</option>
              <option value="high">High - Urgent</option>
              <option value="critical">Critical - Immediate attention</option>
            </select>
          </div>
          
          <div id="task-error" class="form-error hidden"></div>
          
          <div class="form-actions">
            <button onclick="submitTask()" class="btn btn-primary" id="create-task-btn">
              Create Task
            </button>
            <a href="#/tasks" class="btn btn-secondary">Cancel</a>
          </div>
        </div>
      </main>
    </div>
  `;
}

// Task Detail Page
export function renderTaskDetail(taskId) {
  const tasks = store.get().tasks || [];
  const task = tasks.find(t => t.id === taskId);
  
  if (!task) {
    return `
      <div class="error-page">
        <h1>Task Not Found</h1>
        <p>The task you're looking for doesn't exist.</p>
        <a href="#/tasks" class="btn btn-primary">Back to Tasks</a>
      </div>
    `;
  }
  
  const nodes = store.get().nodes || [];
  const node = nodes.find(n => n.id === task.node_id);
  
  return `
    <div class="task-detail-page">
      <header class="page-header">
        <div class="container">
          <a href="#/tasks" class="back-link">← Back to Tasks</a>
          <h1>Task Detail</h1>
        </div>
      </header>
      
      <main class="container">
        <div class="task-detail-layout">
          <div class="task-detail-main">
            <div class="task-intent-card card">
              <h3>Intent</h3>
              <p class="intent-text">${task.intent}</p>
            </div>
            
            <div class="task-events card">
              <h3>Events</h3>
              <div id="task-events-list">
                <p class="text-muted">Loading events...</p>
              </div>
              <button onclick="loadTaskEvents('${task.id}')" class="btn btn-small btn-secondary">
                Refresh Events
              </button>
            </div>
          </div>
          
          <div class="task-detail-sidebar">
            <div class="task-meta-card card">
              <h3>Details</h3>
              <div class="meta-list">
                <div class="meta-item">
                  <span class="meta-label">Status</span>
                  <span class="badge badge-${task.status === 'completed' ? 'success' : task.status === 'failed' ? 'error' : 'info'}">${task.status}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Created</span>
                  <span class="meta-value">${new Date(task.created_at).toLocaleString()}</span>
                </div>
                ${node ? `
                  <div class="meta-item">
                    <span class="meta-label">Node</span>
                    <span class="meta-value">${node.name}</span>
                  </div>
                ` : ''}
              </div>
            </div>
            
            ${task.status === 'pending' ? `
              <div class="task-actions-card card">
                <h3>Actions</h3>
                <button onclick="dispatchTaskToNode('${task.id}')" class="btn btn-primary btn-full">
                  Dispatch to Node
                </button>
              </div>
            ` : ''}
          </div>
        </div>
      </main>
    </div>
  `;
}

// Actions
window.submitTask = async function() {
  const intent = document.getElementById('task-intent').value;
  const priority = document.getElementById('task-priority').value;
  const errorEl = document.getElementById('task-error');
  const btn = document.getElementById('create-task-btn');
  
  if (!intent.trim()) {
    errorEl.textContent = 'Please describe what you want to do';
    errorEl.classList.remove('hidden');
    return;
  }
  
  const workspace = store.get().currentWorkspace;
  if (!workspace) {
    errorEl.textContent = 'No workspace selected';
    errorEl.classList.remove('hidden');
    return;
  }
  
  btn.disabled = true;
  btn.textContent = 'Creating...';
  
  try {
    await createTask(workspace.id, intent.trim(), priority);
    store.loadTasks();
    window.navigate('/tasks');
  } catch (err) {
    errorEl.textContent = err.message || 'Failed to create task';
    errorEl.classList.remove('hidden');
    btn.disabled = false;
    btn.textContent = 'Create Task';
  }
};

window.dispatchTaskToNode = async function(taskId) {
  const nodes = store.get().nodes.filter(n => n.status === 'connected' || n.online);
  if (nodes.length === 0) {
    alert('No connected nodes available');
    return;
  }
  
  // For now, dispatch to first available node
  // In production, this would use the routing brain
  const node = nodes[0];
  
  try {
    await dispatchTask(taskId, node.id);
    alert(`Task dispatched to ${node.name}`);
    store.loadTasks();
    window.navigate('/tasks');
  } catch (err) {
    alert('Failed to dispatch task: ' + err.message);
  }
};

window.refreshTasks = function() {
  store.loadTasks();
  window.navigate('/tasks');
};

window.loadTaskEvents = async function(taskId) {
  const container = document.getElementById('task-events-list');
  container.innerHTML = '<p class="text-muted">Loading...</p>';
  
  try {
    const events = await getTaskEvents(taskId);
    if (events.length === 0) {
      container.innerHTML = '<p class="text-muted">No events yet</p>';
    } else {
      container.innerHTML = `
        <div class="events-list">
          ${events.map(e => `
            <div class="event-item">
              <span class="event-type">${e.event_type}</span>
              <span class="event-time">${new Date(e.created_at).toLocaleTimeString()}</span>
              ${e.payload ? `<pre class="event-payload">${JSON.stringify(e.payload, null, 2)}</pre>` : ''}
            </div>
          `).join('')}
        </div>
      `;
    }
  } catch (err) {
    container.innerHTML = `<p class="text-error">Failed to load events: ${err.message}</p>`;
  }
};
