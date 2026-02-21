/**
 * Tasks Page - Task List, Creation, and Detail
 */

import { store } from '../lib/store.js';
import { routeTask } from '../llm/routingBrain.js';

export function renderTasks() {
  const tasks = store.get('tasks');
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
    routing: { class: 'badge-info', text: 'Routing' },
    assigned: { class: 'badge-info', text: 'Assigned' },
    executing: { class: 'badge-info', text: 'Executing' },
    completed: { class: 'badge-success', text: 'Completed' },
    failed: { class: 'badge-error', text: 'Failed' },
    retrying: { class: 'badge-warning', text: 'Retrying' }
  };
  
  const badge = statusBadges[task.status] || statusBadges.pending;
  const node = store.get('nodes').find(n => n.id === task.assignedNodeId);
  
  return `
    <div class="task-card card">
      <div class="task-header">
        <div class="task-info">
          <h3 class="task-intent">${task.intent}</h3>
          <div class="task-meta">
            <span class="badge ${badge.class}">${badge.text}</span>
            ${node ? `<span class="task-node">on ${node.name}</span>` : ''}
            <span class="task-time">${new Date(task.createdAt).toLocaleString()}</span>
          </div>
        </div>
        <div class="task-actions">
          <a href="#/tasks/${task.id}" class="btn btn-small btn-secondary">View</a>
          ${task.status === 'failed' ? `
            <button onclick="retryTask('${task.id}')" class="btn btn-small btn-primary">Retry</button>
          ` : ''}
        </div>
      </div>
      
      ${task.error ? `
        <div class="task-error">
          <span class="error-icon">⚠️</span>
          <span>${task.error}</span>
        </div>
      ` : ''}
      
      ${task.result ? `
        <div class="task-result-preview">
          <span class="result-label">Result:</span>
          <span class="result-output">${task.result.output.substring(0, 100)}${task.result.output.length > 100 ? '...' : ''}</span>
        </div>
      ` : ''}
    </div>
  `;
}

// New Task Page
export function renderNewTask() {
  const hasNodes = store.hasConnectedNodes();
  const hasProviders = store.hasWorkingProvider();
  const savedIntent = localStorage.getItem('kdashx2-new-task-intent') || '';
  
  if (!hasNodes) {
    return renderBlockedState('NODE_REQUIRED');
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
          ${!hasProviders ? `
            <div class="warning-banner">
              <span class="warning-icon">⚠️</span>
              <span>No working providers configured. AI features may be limited.</span>
              <a href="#/providers" class="btn btn-small btn-secondary">Configure</a>
            </div>
          ` : ''}
          
          <div class="form-group">
            <label class="form-label">What do you want to do?</label>
            <textarea 
              id="task-intent" 
              class="form-textarea" 
              placeholder="Describe your task in detail... e.g., Deploy a Python Flask app to Docker"
              rows="4"
            >${savedIntent}</textarea>
            <p class="form-hint">Be specific about what you want to accomplish</p>
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
            <button onclick="createTask()" class="btn btn-primary" id="create-task-btn">
              Create Task
            </button>
            <a href="#/tasks" class="btn btn-secondary">Cancel</a>
          </div>
        </div>
        
        <div id="routing-preview" class="routing-preview hidden">
          <!-- Routing preview rendered here -->
        </div>
      </main>
    </div>
  `;
}

function renderBlockedState(blockId) {
  const blocks = store.getBlocks();
  const block = blocks.find(b => b.id === blockId);
  
  return `
    <div class="blocked-page">
      <div class="blocked-content">
        <div class="lock-icon">🔒</div>
        <h1>Cannot Create Task</h1>
        <p class="block-message">${block?.message || 'Setup required'}</p>
        <a href="${block?.cta?.href || '#/setup'}" class="btn btn-primary">${block?.cta?.text || 'Go to Setup'}</a>
      </div>
    </div>
  `;
}

// Task Detail Page
export function renderTaskDetail(taskId) {
  const tasks = store.get('tasks');
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
  
  const node = store.get('nodes').find(n => n.id === task.assignedNodeId);
  const provider = store.get('providers').find(p => p.id === task.selectedProviderId);
  
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
            
            ${task.routingDecision ? renderRoutingDecision(task.routingDecision) : ''}
            
            ${task.result ? renderTaskResult(task.result) : ''}
            
            ${task.error ? renderTaskError(task.error) : ''}
          </div>
          
          <div class="task-detail-sidebar">
            <div class="task-meta-card card">
              <h3>Details</h3>
              <div class="meta-list">
                <div class="meta-item">
                  <span class="meta-label">Status</span>
                  <span class="badge ${getStatusBadgeClass(task.status)}">${task.status}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Created</span>
                  <span class="meta-value">${new Date(task.createdAt).toLocaleString()}</span>
                </div>
                ${task.startedAt ? `
                  <div class="meta-item">
                    <span class="meta-label">Started</span>
                    <span class="meta-value">${new Date(task.startedAt).toLocaleString()}</span>
                  </div>
                ` : ''}
                ${task.completedAt ? `
                  <div class="meta-item">
                    <span class="meta-label">Completed</span>
                    <span class="meta-value">${new Date(task.completedAt).toLocaleString()}</span>
                  </div>
                ` : ''}
                ${node ? `
                  <div class="meta-item">
                    <span class="meta-label">Node</span>
                    <span class="meta-value">${node.name}</span>
                  </div>
                ` : ''}
                ${provider ? `
                  <div class="meta-item">
                    <span class="meta-label">Provider</span>
                    <span class="meta-value">${provider.name}</span>
                  </div>
                ` : ''}
              </div>
            </div>
            
            ${task.result?.artifacts?.length ? `
              <div class="task-artifacts card">
                <h3>Artifacts</h3>
                <ul class="artifacts-list">
                  ${task.result.artifacts.map(a => `
                    <li class="artifact-item">
                      <span class="artifact-path">${a}</span>
                    </li>
                  `).join('')}
                </ul>
              </div>
            ` : ''}
            
            <div class="task-actions-card card">
              <h3>Actions</h3>
              <div class="action-buttons">
                ${task.status === 'failed' ? `
                  <button onclick="retryTask('${task.id}')" class="btn btn-primary btn-full">Retry Task</button>
                ` : ''}
                <button onclick="deleteTask('${task.id}')" class="btn btn-danger btn-full">Delete Task</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `;
}

function renderRoutingDecision(decision) {
  return `
    <div class="routing-decision-card card">
      <h3>Routing Decision</h3>
      <div class="decision-details">
        <div class="decision-item">
          <span class="decision-label">Selected Node</span>
          <span class="decision-value">${decision.selected_node_id}</span>
        </div>
        <div class="decision-item">
          <span class="decision-label">Capabilities</span>
          <span class="decision-value">${decision.required_capabilities.join(', ')}</span>
        </div>
        <div class="decision-item">
          <span class="decision-label">Provider</span>
          <span class="decision-value">${decision.provider_preference}</span>
        </div>
        <div class="decision-item">
          <span class="decision-label">Risk Level</span>
          <span class="badge ${decision.risk_level === 'critical' ? 'badge-error' : decision.risk_level === 'high' ? 'badge-warning' : 'badge-success'}">${decision.risk_level}</span>
        </div>
        <div class="decision-item">
          <span class="decision-label">Approval Required</span>
          <span class="decision-value">${decision.approval_required ? 'Yes' : 'No'}</span>
        </div>
      </div>
    </div>
  `;
}

function renderTaskResult(result) {
  return `
    <div class="task-result-card card">
      <h3>Result</h3>
      <div class="result-output">
        <pre>${result.output}</pre>
      </div>
      <div class="result-stats">
        <span>Tokens: ${result.token_usage?.toLocaleString() || 'N/A'}</span>
        <span>Cost: ${result.cost ? '$' + result.cost.toFixed(4) : 'N/A'}</span>
      </div>
    </div>
  `;
}

function renderTaskError(error) {
  return `
    <div class="task-error-card card">
      <h3>Error</h3>
      <div class="error-message">
        <pre>${error}</pre>
      </div>
    </div>
  `;
}

function getStatusBadgeClass(status) {
  const classes = {
    pending: 'badge-warning',
    routing: 'badge-info',
    assigned: 'badge-info',
    executing: 'badge-info',
    completed: 'badge-success',
    failed: 'badge-error',
    retrying: 'badge-warning'
  };
  return classes[status] || 'badge-info';
}

// Actions
window.createTask = async function() {
  const intent = document.getElementById('task-intent').value;
  const priority = document.getElementById('task-priority').value;
  const errorEl = document.getElementById('task-error');
  const btn = document.getElementById('create-task-btn');
  
  if (!intent.trim()) {
    errorEl.textContent = 'Please describe what you want to do';
    errorEl.classList.remove('hidden');
    return;
  }
  
  btn.disabled = true;
  btn.textContent = 'Creating...';
  
  try {
    // Get routing decision
    const nodes = store.getConnectedNodes();
    const providers = store.getWorkingProviders();
    
    const routingDecision = await routeTask({
      intent,
      context: {
        available_nodes: nodes,
        configured_providers: providers
      },
      constraints: { priority }
    });
    
    // Validate routing decision
    if (!routingDecision.selected_node_id) {
      throw new Error('No suitable node found for this task');
    }
    
    // Create task
    const task = {
      id: 'task-' + Date.now(),
      intent: intent.trim(),
      status: 'pending',
      priority,
      assignedNodeId: routingDecision.selected_node_id,
      selectedProviderId: routingDecision.fallback_order[0],
      routingDecision,
      createdAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
      result: null,
      error: null
    };
    
    const tasks = store.get('tasks');
    tasks.unshift(task);
    store.set('tasks', tasks);
    
    // Clear saved intent
    localStorage.removeItem('kdashx2-new-task-intent');
    
    // Simulate task progression
    simulateTaskExecution(task.id);
    
    // Navigate to task detail
    window.navigate(`/tasks/${task.id}`);
    
  } catch (err) {
    errorEl.textContent = err.message || 'Failed to create task';
    errorEl.classList.remove('hidden');
    btn.disabled = false;
    btn.textContent = 'Create Task';
  }
};

window.simulateTaskExecution = async function(taskId) {
  const tasks = store.get('tasks');
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;
  
  // Update to routing
  task.status = 'routing';
  store.set('tasks', tasks);
  
  await new Promise(r => setTimeout(r, 1000));
  
  // Update to executing
  task.status = 'executing';
  task.startedAt = new Date().toISOString();
  store.set('tasks', tasks);
  
  await new Promise(r => setTimeout(r, 3000));
  
  // Complete or fail randomly
  const success = Math.random() > 0.2;
  
  if (success) {
    task.status = 'completed';
    task.result = {
      output: `Successfully completed task: ${task.intent}\n\nExecuted on node: ${task.assignedNodeId}\nProvider used: ${task.selectedProviderId || 'default'}`,
      artifacts: [
        `${task.routingDecision.output_location.path}/output.log`,
        `${task.routingDecision.output_location.path}/result.json`
      ],
      token_usage: Math.floor(Math.random() * 5000) + 1000,
      cost: Math.random() * 0.1
    };
  } else {
    task.status = 'failed';
    task.error = 'Simulated failure: Provider timeout after 30s';
  }
  
  task.completedAt = new Date().toISOString();
  store.set('tasks', tasks);
};

window.retryTask = async function(taskId) {
  const tasks = store.get('tasks');
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;
  
  task.status = 'retrying';
  task.error = null;
  task.result = null;
  store.set('tasks', tasks);
  
  simulateTaskExecution(taskId);
  window.navigate(`/tasks/${taskId}`);
};

window.deleteTask = function(taskId) {
  if (!confirm('Delete this task? This cannot be undone.')) return;
  
  const tasks = store.get('tasks').filter(t => t.id !== taskId);
  store.set('tasks', tasks);
  window.navigate('/tasks');
};
