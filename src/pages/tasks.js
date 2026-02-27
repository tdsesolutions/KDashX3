/**
 * Tasks Page - Real Task Management
 *
 * ARCHITECTURE NOTES:
 * - Backend = Brain + Router (decides WHERE to run)
 * - Providers (Claw) = Planner ONLY (decides WHAT to do)
 * - Nodes = Executors (actually RUN tasks)
 * - Execution ALWAYS goes through assigned node when available
 * - Providers do NOT execute tasks directly when nodes exist
 */

import { store } from '../lib/store.js';
import { createTask, createTaskWithAssignment, getTasks, getTaskEvents, dispatchTask } from '../lib/api.js';

export function renderTasks() {
  const state = store.get();
  const tasks = state.tasks || [];
  const hasNodes = store.hasConnectedNodes();
  const connectedNodes = store.getConnectedNodes();
  const providers = store.get('providers') || [];
  const connectedProviders = providers.filter(p => p.status === 'configured');

  // WORKSPACE DEBUG (for validation)
  const workspaceDebug = state.workspace ? `
    <div class="workspace-debug" style="background: #f3f4f6; padding: 0.75rem; border-radius: 4px; margin-bottom: 1rem; font-family: monospace; font-size: 0.75rem;">
      <strong>Workspace Debug:</strong>
      <span>ID: ${state.workspace.id?.slice(0, 8)}...</span> |
      <span>Nodes: ${connectedNodes.length} connected</span> |
      <span>Providers: ${connectedProviders.length} configured</span>
    </div>
  ` : '';

  return `
    <div class="tasks-page">
      <header class="page-page">
        <div class="container">
          <h1>Tasks</h1>
          <p class="text-muted">View and manage your tasks</p>
        </div>
      </header>

      <main class="container">
        ${workspaceDebug}
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
    created: { class: 'badge-info', text: 'Created' },
    planning: { class: 'badge-info', text: 'Planning' },
    planned: { class: 'badge-info', text: 'Planned' },
    awaiting_approval: { class: 'badge-warning', text: 'Awaiting Approval' },
    approved: { class: 'badge-info', text: 'Approved' },
    dispatched: { class: 'badge-info', text: 'Dispatched' },
    running: { class: 'badge-info', text: 'Running' },
    completed: { class: 'badge-success', text: 'Completed' },
    failed: { class: 'badge-error', text: 'Failed' },
    rejected: { class: 'badge-error', text: 'Rejected' },
    blocked_no_node: { class: 'badge-warning', text: 'Blocked: No Node' },
    blocked_no_provider: { class: 'badge-warning', text: 'Blocked: No Provider' }
  };

  const badge = statusBadges[task.status] || { class: 'badge-info', text: task.status };
  const nodes = store.get().nodes || [];
  const node = nodes.find(n => n.id === task.node_id);

  // Determine execution location display
  let executionLocation = '';
  if (task.status === 'blocked_no_node') {
    executionLocation = '<span class="task-node" style="color: #b91c1c;">⚠️ No node connected</span>';
  } else if (task.status === 'blocked_no_provider') {
    executionLocation = '<span class="task-node" style="color: #b91c1c;">⚠️ No provider</span>';
  } else if (node) {
    executionLocation = `<span class="task-node">on ${node.name}</span>`;
  } else if (task.node_id) {
    executionLocation = `<span class="task-node">node: ${task.node_id.slice(0, 8)}...</span>`;
  } else {
    executionLocation = '<span class="task-node text-muted">unassigned</span>';
  }

  return `
    <div class="task-card card">
      <div class="task-header">
        <div class="task-info">
          <h3 class="task-intent">${task.intent}</h3>
          <div class="task-meta">
            <span class="badge ${badge.class}">${badge.text}</span>
            ${executionLocation}
            <span class="task-time">${new Date(task.created_at).toLocaleString()}</span>
          </div>
        </div>
        <div class="task-actions">
          <a href="#/tasks/${task.id}" class="btn btn-small btn-secondary">View</a>
          ${(task.status === 'pending' || task.status === 'planned') && !task.node_id && !task.status.startsWith('blocked') ? `
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
            <!-- EXECUTION PATH PANEL -->
            <div class="task-meta-card card">
              <h3>Execution Path</h3>
              <div class="meta-list">
                <!-- Where it executes -->
                <div class="meta-item">
                  <span class="meta-label">Assigned Node</span>
                  <span class="meta-value">
                    ${node ? node.name : (task.node_id ? task.node_id.slice(0, 8) + '...' : '<span class="text-muted">unassigned</span>')}
                    ${task.assignment_reason ? `<small class="text-muted">(${task.assignment_reason})</small>` : ''}
                  </span>
                </div>

                <!-- Block reason if blocked -->
                ${task.status === 'blocked_no_node' ? `
                  <div class="meta-item" style="background: #fee2e2; padding: 0.5rem; border-radius: 4px;">
                    <span class="meta-label" style="color: #b91c1c;">⚠️ Blocked</span>
                    <span class="meta-value" style="color: #7f1d1d; font-size: 0.875rem;">
                      No connected node available.<br>
                      <a href="#/nodes" style="color: #b91c1c; text-decoration: underline;">Connect a node in Settings → Nodes</a>
                    </span>
                  </div>
                ` : ''}

                ${task.status === 'blocked_no_provider' ? `
                  <div class="meta-item" style="background: #fee2e2; padding: 0.5rem; border-radius: 4px;">
                    <span class="meta-label" style="color: #b91c1c;">⚠️ Blocked</span>
                    <span class="meta-value" style="color: #7f1d1d; font-size: 0.875rem;">
                      No provider available for planning.
                    </span>
                  </div>
                ` : ''}

                <!-- Planner -->
                <div class="meta-item">
                  <span class="meta-label">Planner Provider</span>
                  <span class="meta-value">${task.planner_provider || '<span class="text-muted">not planned yet</span>'}</span>
                </div>

                ${task.fallback_used ? `
                  <div class="meta-item">
                    <span class="meta-label">Fallback Used</span>
                    <span class="meta-value">Yes</span>
                  </div>
                ` : ''}

                <!-- Execution settings -->
                <div class="meta-item">
                  <span class="meta-label">Execution Mode</span>
                  <span class="meta-value">${task.execution_mode || 'risk_based'}</span>
                </div>

                ${task.priority ? `
                  <div class="meta-item">
                    <span class="meta-label">Priority</span>
                    <span class="meta-value">${task.priority}</span>
                  </div>
                ` : ''}

                ${task.risk_level ? `
                  <div class="meta-item">
                    <span class="meta-label">Risk Level</span>
                    <span class="meta-value">
                      <span class="badge badge-${task.risk_level === 'high' ? 'error' : task.risk_level === 'medium' ? 'warning' : 'success'}">${task.risk_level}</span>
                    </span>
                  </div>
                ` : ''}

                <!-- Execution status -->
                ${task.dispatch_time ? `
                  <div class="meta-item">
                    <span class="meta-label">Dispatched</span>
                    <span class="meta-value">${new Date(task.dispatch_time).toLocaleString()}</span>
                  </div>
                ` : ''}

                <div class="meta-item">
                  <span class="meta-label">Executor Status</span>
                  <span class="meta-value">${task.executor_status || '<span class="text-muted">idle</span>'}</span>
                </div>

                <!-- Storage -->
                <div class="meta-item">
                  <span class="meta-label">Storage Mode</span>
                  <span class="meta-value">${task.storage_mode || 'node_local'}</span>
                </div>

                <div class="meta-item">
                  <span class="meta-label">Storage Path</span>
                  <span class="meta-value" style="font-family: monospace; font-size: 0.75rem; word-break: break-all;">
                    ${task.storage_path || '<span class="text-muted">Path will appear after dispatch</span>'}
                  </span>
                </div>
              </div>
            </div>

            <!-- TASK DETAILS PANEL -->
            <div class="task-meta-card card" style="margin-top: 1rem;">
              <h3>Details</h3>
              <div class="meta-list">
                <div class="meta-item">
                  <span class="meta-label">Status</span>
                  <span class="badge badge-${task.status === 'completed' ? 'success' : task.status === 'failed' ? 'error' : task.status === 'blocked_no_node' || task.status === 'blocked_no_provider' ? 'warning' : 'info'}">${task.status}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Created</span>
                  <span class="meta-value">${new Date(task.created_at).toLocaleString()}</span>
                </div>
                ${task.plan_version > 1 ? `
                  <div class="meta-item">
                    <span class="meta-label">Plan Version</span>
                    <span class="meta-value">v${task.plan_version}</span>
                  </div>
                ` : ''}
              </div>
            </div>

            ${task.status === 'awaiting_approval' ? `
              <div class="task-actions-card card" style="margin-top: 1rem;">
                <h3>Approval Required</h3>
                <p class="text-muted" style="margin-bottom: 1rem;">This task requires approval before execution.</p>
                <button onclick="approveTask('${task.id}')" class="btn btn-primary btn-full" style="margin-bottom: 0.5rem;">
                  Approve
                </button>
                <button onclick="rejectTask('${task.id}')" class="btn btn-danger btn-full">
                  Reject
                </button>
              </div>
            ` : ''}

            ${(task.status === 'pending' || task.status === 'planned') && !task.node_id && task.status !== 'blocked_no_node' && task.status !== 'blocked_no_provider' ? `
              <div class="task-actions-card card" style="margin-top: 1rem;">
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

  // DETERMINISTIC NODE ASSIGNMENT
  // If nodes exist, assign to first healthy node automatically
  const connectedNodes = store.getConnectedNodes();
  const allNodes = store.get('nodes') || [];
  let assignedNodeId = null;

  if (connectedNodes.length === 1) {
    // Exactly one node - auto-assign
    assignedNodeId = connectedNodes[0].id;
  } else if (connectedNodes.length > 1) {
    // Multiple nodes - default to first healthy node
    assignedNodeId = connectedNodes[0].id;
  } else if (allNodes.length === 0) {
    // No nodes at all - show error
    errorEl.textContent = 'No active node available. Add a node first.';
    errorEl.classList.remove('hidden');
    return;
  }
  // If nodes exist but none connected, task creates unassigned (user can dispatch later)

  btn.disabled = true;
  btn.textContent = 'Creating...';

  try {
    // Create task with deterministic node assignment
    const taskData = {
      workspace_id: workspace.id,
      intent: intent.trim(),
      priority,
      node_id: assignedNodeId,
      routing_decision: assignedNodeId ? {
        selected_node_id: assignedNodeId,
        assignment_reason: connectedNodes.length === 1 ? 'single_node_auto' : 'first_healthy_default'
      } : null
    };

    await createTaskWithAssignment(taskData);
    store.syncTasks();
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

// Task approval/rejection
window.approveTask = async function(taskId) {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('kdashx3-token')}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to approve task');
    }

    alert('Task approved successfully');
    store.syncTasks();
    window.navigate(`/tasks/${taskId}`);
  } catch (err) {
    alert('Failed to approve task: ' + err.message);
  }
};

window.rejectTask = async function(taskId) {
  const reason = prompt('Enter rejection reason (optional):');
  if (reason === null) return; // Cancelled

  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('kdashx3-token')}`
      },
      body: JSON.stringify({ reason: reason || 'Rejected by user' })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to reject task');
    }

    alert('Task rejected');
    store.syncTasks();
    window.navigate('/tasks');
  } catch (err) {
    alert('Failed to reject task: ' + err.message);
  }
};
