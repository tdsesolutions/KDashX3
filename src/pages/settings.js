/**
 * Settings Page - Configuration and Module Links
 */

import { store } from '../lib/store.js';

const moduleIcons = {
  workspace: '🏢',
  nodes: '🖥️',
  storage: '💾',
  providers: '🔌',
  routing: '📡',
  healthChecks: '✅'
};

const moduleRoutes = {
  workspace: '#/setup/workspace',
  nodes: '#/nodes',
  storage: '#/setup/storage',
  providers: '#/providers',
  routing: '#/routing',
  healthChecks: '#/setup/health'
};

export function renderSettings() {
  const progress = store.getSetupProgress();
  const auth = store.get('auth');
  
  return `
    <div class="settings-page">
      <header class="page-header">
        <div class="container">
          <h1>Settings</h1>
          <p class="text-muted">Configure your Mission Control instance</p>
        </div>
      </header>
      
      <main class="container">
        <div class="settings-layout">
          <!-- Setup Modules -->
          <div class="settings-section card">
            <h2>Setup Modules</h2>
            <p class="text-muted">Return to any setup step to make changes</p>
            
            <div class="settings-modules">
              ${progress.modules.map(m => renderModuleLink(m)).join('')}
            </div>
            
            ${progress.percentage < 100 ? `
              <a href="#/setup" class="btn btn-primary btn-full">
                Continue Setup (${progress.percentage}%)
              </a>
            ` : ''}
          </div>
          
          <!-- Configuration Pages -->
          <div class="settings-section card">
            <h2>Configuration</h2>
            <div class="config-links">
              <a href="#/nodes" class="config-link">
                <span class="config-icon">🖥️</span>
                <div class="config-info">
                  <span class="config-name">Nodes</span>
                  <span class="config-desc">Manage compute nodes</span>
                </div>
                <span class="config-arrow">→</span>
              </a>
              
              <a href="#/providers" class="config-link">
                <span class="config-icon">🔌</span>
                <div class="config-info">
                  <span class="config-name">Providers</span>
                  <span class="config-desc">Configure LLM providers</span>
                </div>
                <span class="config-arrow">→</span>
              </a>
              
              <a href="#/routing" class="config-link">
                <span class="config-icon">📡</span>
                <div class="config-info">
                  <span class="config-name">Routing</span>
                  <span class="config-desc">Routing rules and testing</span>
                </div>
                <span class="config-arrow">→</span>
              </a>
              
              <a href="#/tasks" class="config-link">
                <span class="config-icon">📋</span>
                <div class="config-info">
                  <span class="config-name">Tasks</span>
                  <span class="config-desc">View task history</span>
                </div>
                <span class="config-arrow">→</span>
              </a>
            </div>
          </div>
          
          <!-- Account -->
          <div class="settings-section card">
            <h2>Account</h2>
            <div class="account-info">
              <div class="account-field">
                <span class="field-label">Email</span>
                <span class="field-value">${auth.user?.email || 'Not set'}</span>
              </div>
              <div class="account-field">
                <span class="field-label">Name</span>
                <span class="field-value">${auth.user?.name || 'Not set'}</span>
              </div>
            </div>
            <div class="account-actions">
              <button onclick="logout()" class="btn btn-secondary">Sign Out</button>
            </div>
          </div>
          
          <!-- Danger Zone -->
          <div class="settings-section card danger-zone">
            <h2>Danger Zone</h2>
            <div class="danger-item">
              <div class="danger-info">
                <h4>Reset All Data</h4>
                <p>Clear all settings, nodes, and tasks. Cannot be undone.</p>
              </div>
              <button onclick="resetAllData()" class="btn btn-danger">Reset</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  `;
}

function renderModuleLink(module) {
  const icon = moduleIcons[module.name];
  const route = moduleRoutes[module.name];
  const isCompleted = module.completed;
  
  return `
    <a href="${route}" class="module-link ${isCompleted ? 'completed' : 'pending'}">
      <span class="module-icon">${icon}</span>
      <div class="module-info">
        <span class="module-name">${module.label}</span>
        <span class="module-status">
          ${isCompleted 
            ? '<span class="badge badge-success">✓ Complete</span>'
            : '<span class="badge badge-warning">○ Pending</span>'
          }
        </span>
      </div>
      <span class="module-arrow">→</span>
    </a>
  `;
}

// Actions
window.logout = function() {
  if (confirm('Sign out of Mission Control?')) {
    store.set('auth', {
      isAuthenticated: false,
      user: null,
      token: null
    });
    window.navigate('/login');
  }
};

window.resetAllData = function() {
  if (!confirm('WARNING: This will delete ALL data including nodes, tasks, and settings.\n\nThis cannot be undone.\n\nAre you sure?')) return;
  
  if (!confirm('Final confirmation: Type "RESET" to confirm')) {
    const confirmation = prompt('Type "RESET" to confirm complete data reset:');
    if (confirmation !== 'RESET') {
      alert('Reset cancelled');
      return;
    }
  }
  
  store.reset();
  alert('All data has been reset');
  window.navigate('/setup');
};
