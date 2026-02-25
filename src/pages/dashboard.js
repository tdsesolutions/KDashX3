/**
 * Dashboard Page - UI Parity with kdashx-dashboard-live
 */

import { store } from '../lib/store.js';

export function renderDashboard() {
  const tasks = store.get('tasks') || [];
  const nodes = store.get('nodes') || [];
  const hasOnlineNodes = store.hasConnectedNodes();
  const hasPairedNodes = nodes.length > 0;
  
  const onlineNodeCount = nodes.filter(n => n.online && n.status === 'connected').length;
  const activeTaskCount = tasks.filter(t => t.status === 'dispatched' || t.status === 'executing').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  
  // Check blocks for gating
  const blocks = store.getBlocks();
  const nodeBlock = blocks.find(b => b.id === 'NODE_REQUIRED' || b.id === 'NODE_OFFLINE');
  
  return `
    <div class="dashboard-page">
      <header class="page-header">
        <div class="container">
          <h1>Mission Control</h1>
          <p class="text-muted">Command center for your AI agent operations</p>
        </div>
      </header>
      
      <main class="container">
        <!-- Status Cards Row -->
        <div class="dashboard-stats-row">
          <div class="dashboard-stat-card ${hasOnlineNodes ? 'status-online' : 'status-offline'}">
            <div class="stat-header">
              <span class="stat-label">System</span>
              <span class="stat-status">${hasOnlineNodes ? 'Online' : hasPairedNodes ? 'Node Paired' : 'Setup Required'}</span>
            </div>
            <div class="stat-value-large">${hasOnlineNodes ? '●' : '○'}</div>
          </div>
          
          <div class="dashboard-stat-card">
            <div class="stat-header">
              <span class="stat-label">Nodes</span>
              <span class="stat-status">${onlineNodeCount} Online</span>
            </div>
            <div class="stat-value-large">${onlineNodeCount}/${nodes.length}</div>
          </div>
          
          <div class="dashboard-stat-card">
            <div class="stat-header">
              <span class="stat-label">Active Tasks</span>
              <span class="stat-status">${activeTaskCount} Running</span>
            </div>
            <div class="stat-value-large">${activeTaskCount}</div>
          </div>
          
          <div class="dashboard-stat-card">
            <div class="stat-header">
              <span class="stat-label">Completed</span>
              <span class="stat-status">${completedCount} Done</span>
            </div>
            <div class="stat-value-large">${completedCount}</div>
          </div>
        </div>
        
        <!-- Primary CTA Section -->
        ${renderPrimaryCTA(hasOnlineNodes, hasPairedNodes, nodeBlock)}
        
        <!-- Multi-Agent Orchestration Panel -->
        <div class="orchestration-panel card">
          <h2>Multi-Agent Orchestration</h2>
          <div class="workflow-steps">
            <a href="#/intent" class="workflow-step ${hasOnlineNodes ? '' : 'step-disabled'}">
              <div class="step-number">1</div>
              <div class="step-content">
                <h4>Intent Analysis</h4>
                <p>Describe your task and requirements</p>
              </div>
              <div class="step-arrow">→</div>
            </a>
            
            <div class="workflow-step ${hasOnlineNodes ? '' : 'step-disabled'}">
              <div class="step-number">2</div>
              <div class="step-content">
                <h4>Skill Matching</h4>
                <p>Matches against available node capabilities</p>
              </div>
              <div class="step-arrow">→</div>
            </div>
            
            <div class="workflow-step ${hasOnlineNodes ? '' : 'step-disabled'}">
              <div class="step-number">3</div>
              <div class="step-content">
                <h4>Dispatch & Execution</h4>
                <p>Routes to your connected nodes</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Recent Activity & Quick Links -->
        <div class="dashboard-grid">
          <!-- Active Tasks -->
          <div class="dashboard-card card">
            <div class="card-header">
              <h3>Active Tasks</h3>
              <a href="#/execution" class="btn btn-small btn-secondary">View All</a>
            </div>
            ${renderActiveTasks(tasks)}
          </div>
          
          <!-- Quick Navigation -->
          <div class="dashboard-card card">
            <div class="card-header">
              <h3>Quick Links</h3>
            </div>
            <div class="quick-links-list">
              <a href="#/intent" class="quick-link ${hasOnlineNodes ? '' : 'link-disabled'}">
                <span class="link-icon">📝</span>
                <span class="link-text">Create Intent</span>
              </a>
              <a href="#/execution" class="quick-link">
                <span class="link-icon">⚡</span>
                <span class="link-text">View Execution</span>
              </a>
              <a href="#/nodes" class="quick-link">
                <span class="link-icon">🖥️</span>
                <span class="link-text">Manage Nodes</span>
              </a>
              <a href="#/settings" class="quick-link">
                <span class="link-icon">⚙️</span>
                <span class="link-text">Settings</span>
              </a>
            </div>
          </div>
        </div>
        
        ${nodeBlock ? renderNodeStatusBanner(nodeBlock, hasPairedNodes) : ''}
      </main>
    </div>
  `;
}

function renderPrimaryCTA(hasOnlineNodes, hasPairedNodes, nodeBlock) {
  // If no nodes at all
  if (!hasPairedNodes) {
    return `
      <div class="primary-cta card cta-gated">
        <div class="cta-content">
          <h2>Get Started with Mission Control</h2>
          <p>Connect your first node to start executing AI-powered tasks on your own infrastructure.</p>
          <a href="#/nodes" class="btn btn-primary btn-large">
            <span>+</span> Add Your First Node
          </a>
        </div>
      </div>
    `;
  }
  
  // If nodes paired but offline
  if (!hasOnlineNodes) {
    return `
      <div class="primary-cta card cta-paired-offline">
        <div class="cta-content">
          <h2>Node Paired, But Offline</h2>
          <p>Start the connector on your node to go online and begin executing tasks.</p>
          <div class="cta-actions">
            <a href="#/nodes" class="btn btn-primary btn-large">Go to Nodes</a>
            <button onclick="refreshDashboardNodes()" class="btn btn-secondary btn-large">Refresh Status</button>
          </div>
        </div>
      </div>
    `;
  }
  
  // Online - show create intent CTA
  return `
    <div class="primary-cta card cta-active">
      <div class="cta-content">
        <h2>Create a New Task</h2>
        <p>Describe what you want to accomplish and we'll route it to your available nodes.</p>
        <a href="#/intent" class="btn btn-primary btn-large">
          <span>📝</span> Create Intent
        </a>
      </div>
    </div>
  `;
}

function renderActiveTasks(tasks) {
  const activeTasks = tasks
    .filter(t => t.status === 'pending' || t.status === 'dispatched' || t.status === 'executing')
    .slice(0, 5);
  
  if (activeTasks.length === 0) {
    return `
      <div class="empty-state-small">
        <p class="text-muted">No active tasks</p>
        <a href="#/intent" class="btn btn-primary btn-small">Create Intent</a>
      </div>
    `;
  }
  
  return `
    <div class="task-list-compact">
      ${activeTasks.map(task => `
        <a href="#/execution/${task.id}" class="task-item-compact">
          <div class="task-info">
            <span class="task-intent">${task.intent.substring(0, 40)}${task.intent.length > 40 ? '...' : ''}</span>
            <span class="task-meta">${new Date(task.created_at).toLocaleDateString()}</span>
          </div>
          <span class="badge ${getStatusBadgeClass(task.status)}">${formatStatus(task.status)}</span>
        </a>
      `).join('')}
    </div>
  `;
}

function renderNodeStatusBanner(block, hasPairedNodes) {
  if (block.id === 'NODE_OFFLINE' && hasPairedNodes) {
    return `
      <div class="node-status-banner card banner-offline">
        <div class="banner-content">
          <span class="banner-icon">⏳</span>
          <div class="banner-text">
            <strong>Node paired, but offline.</strong>
            <span>Start the connector on your node to go online.</span>
          </div>
        </div>
        <div class="banner-actions">
          <a href="#/nodes" class="btn btn-primary">Go to Nodes</a>
          <button onclick="refreshDashboardNodes()" class="btn btn-secondary">Refresh Status</button>
        </div>
      </div>
    `;
  }
  
  return '';
}

function getStatusBadgeClass(status) {
  const classes = {
    pending: 'badge-warning',
    dispatched: 'badge-info',
    executing: 'badge-info',
    completed: 'badge-success',
    failed: 'badge-error'
  };
  return classes[status] || 'badge-warning';
}

function formatStatus(status) {
  const labels = {
    pending: 'Pending',
    dispatched: 'Dispatched',
    executing: 'Running',
    completed: 'Done',
    failed: 'Failed'
  };
  return labels[status] || status;
}

// Refresh action
window.refreshDashboardNodes = async function() {
  await store.syncNodes();
  window.navigate('/dashboard');
};
