/**
 * Dashboard Page - Main Command Center
 */

import { store } from '../lib/store.js';

export function renderDashboard() {
  const tasks = store.get('tasks');
  const nodes = store.get('nodes');
  const progress = store.getSetupProgress();
  const isSetupComplete = store.isSetupComplete();
  
  const recentTasks = tasks.slice(0, 5);
  const executingCount = tasks.filter(t => t.status === 'executing').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const failedCount = tasks.filter(t => t.status === 'failed').length;
  
  // Show gating message if setup incomplete
  if (!isSetupComplete) {
    return renderGatedDashboard(progress);
  }
  
  return `
    <div class="dashboard-page">
      <header class="page-header">
        <div class="container">
          <h1>Mission Control</h1>
          <p class="text-muted">Overview of your AI agent operations</p>
        </div>
      </header>
      
      <main class="container">
        <!-- Stats Grid -->
        <div class="stats-grid">
          <div class="stat-card card">
            <div class="stat-icon">🖥️</div>
            <div class="stat-content">
              <span class="stat-value">${nodes.filter(n => n.status === 'connected').length}/${nodes.length}</span>
              <span class="stat-label">Nodes Online</span>
            </div>
          </div>
          
          <div class="stat-card card">
            <div class="stat-icon">⚡</div>
            <div class="stat-content">
              <span class="stat-value">${executingCount}</span>
              <span class="stat-label">Executing</span>
            </div>
          </div>
          
          <div class="stat-card card">
            <div class="stat-icon">✅</div>
            <div class="stat-content">
              <span class="stat-value">${completedCount}</span>
              <span class="stat-label">Completed</span>
            </div>
          </div>
          
          <div class="stat-card card">
            <div class="stat-icon">❌</div>
            <div class="stat-content">
              <span class="stat-value">${failedCount}</span>
              <span class="stat-label">Failed</span>
            </div>
          </div>
        </div>
        
        <!-- Quick Actions -->
        <div class="quick-actions card">
          <h2>Quick Actions</h2>
          <div class="action-grid">
            <a href="#/tasks/new" class="action-item">
              <span class="action-icon">➕</span>
              <span class="action-label">New Task</span>
            </a>
            <a href="#/nodes" class="action-item">
              <span class="action-icon">🖥️</span>
              <span class="action-label">Add Node</span>
            </a>
            <a href="#/providers" class="action-item">
              <span class="action-icon">🔌</span>
              <span class="action-label">Configure Providers</span>
            </a>
            <a href="#/routing" class="action-item">
              <span class="action-icon">📡</span>
              <span class="action-label">Test Routing</span>
            </a>
          </div>
        </div>
        
        <!-- Setup Progress (if incomplete) -->
        ${progress.percentage < 100 ? `
          <div class="dashboard-setup card">
            <div class="setup-header">
              <h2>Setup Progress</h2>
              <span class="setup-percent">${progress.percentage}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${progress.percentage}%"></div>
            </div>
            <p class="text-muted">Complete setup to unlock all features</p>
            <a href="#/setup" class="btn btn-primary">Continue Setup</a>
          </div>
        ` : ''}
        
        <!-- Recent Tasks -->
        <div class="recent-tasks card">
          <div class="section-header">
            <h2>Recent Tasks</h2>
            <a href="#/tasks" class="btn btn-small btn-secondary">View All</a>
          </div>
          
          ${recentTasks.length === 0 ? `
            <div class="empty-state-small">
              <p class="text-muted">No tasks yet. Create your first task to get started.</p>
              <a href="#/tasks/new" class="btn btn-primary btn-small">Create Task</a>
            </div>
          ` : `
            <div class="tasks-list">
              ${recentTasks.map(task => `
                <a href="#/tasks/${task.id}" class="task-row">
                  <span class="task-intent">${task.intent.substring(0, 50)}${task.intent.length > 50 ? '...' : ''}</span>
                  <span class="badge ${getStatusBadgeClass(task.status)}">${task.status}</span>
                </a>
              `).join('')}
            </div>
          `}
        </div>
        
        <!-- System Status -->
        <div class="system-status card">
          <h2>System Status</h2>
          <div class="status-list">
            <div class="status-item">
              <span class="status-label">Dashboard</span>
              <span class="badge badge-success">Online</span>
            </div>
            <div class="status-item">
              <span class="status-label">Node Connection</span>
              <span class="badge ${nodes.some(n => n.status === 'connected') ? 'badge-success' : 'badge-error'}">
                ${nodes.some(n => n.status === 'connected') ? 'Active' : 'No Nodes'}
              </span>
            </div>
            <div class="status-item">
              <span class="status-label">Providers</span>
              <span class="badge ${store.hasWorkingProvider() ? 'badge-success' : 'badge-warning'}">
                ${store.hasWorkingProvider() ? 'Configured' : 'Not Configured'}
              </span>
            </div>
          </div>
        </div>
      </main>
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
    failed: 'badge-error'
  };
  return classes[status] || 'badge-info';
}

// Gated view shown when setup is incomplete
function renderGatedDashboard(progress) {
  return `
    <div class="dashboard-page">
      <header class="page-header">
        <div class="container">
          <h1>Mission Control</h1>
          <p class="text-muted">Overview of your AI agent operations</p>
        </div>
      </header>
      
      <main class="container">
        <!-- Setup Warning Banner -->
        <div class="setup-warning-banner">
          <span class="setup-warning-icon">⚠️</span>
          <div class="setup-warning-content">
            <div class="setup-warning-title">Setup Required</div>
            <p class="setup-warning-text">Complete setup to start using Mission Control. ${progress.completed} of ${progress.total} modules finished.</p>
          </div>
          <div class="setup-warning-actions">
            <a href="#/setup" class="btn btn-primary">Continue Setup</a>
          </div>
        </div>
        
        <!-- Gated Content -->
        <div class="gated-section">
          <div class="gated-icon">🚀</div>
          <h2 class="gated-title">Dashboard Ready After Setup</h2>
          <p class="gated-message">
            Your Mission Control dashboard will display real-time statistics, task status, and node health once you complete the setup process.
          </p>
          <div class="gated-actions">
            <a href="#/setup" class="btn btn-primary">Complete Setup</a>
            <a href="#/setup/workspace" class="btn btn-secondary">Start with Workspace</a>
          </div>
        </div>
      </main>
    </div>
  `;
}
