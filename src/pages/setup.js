/**
 * Setup Center Page
 * Shows 6 modules with progress and allows resuming setup
 */

import { store } from '../lib/store.js';

const moduleConfig = {
  workspace: {
    icon: '🏢',
    title: 'Workspace',
    description: 'Organization name and preferences',
    route: '#/setup/workspace'
  },
  nodes: {
    icon: '🖥️',
    title: 'Nodes',
    description: 'Add and connect compute nodes',
    route: '#/nodes'
  },
  storage: {
    icon: '💾',
    title: 'Storage & Permissions',
    description: 'Configure allowed folders and write-fence',
    route: '#/setup/storage'
  },
  providers: {
    icon: '🔌',
    title: 'Providers',
    description: 'Configure LLM providers on nodes',
    route: '#/providers'
  },
  routing: {
    icon: '📡',
    title: 'Routing Defaults',
    description: 'Set routing rules and preferences',
    route: '#/routing'
  },
  healthChecks: {
    icon: '✅',
    title: 'Health Checks',
    description: 'Verify system readiness',
    route: '#/setup/health'
  }
};

export function renderSetup() {
  const progress = store.getSetupProgress();
  
  return `
    <div class="setup-page">
      <header class="page-header">
        <div class="container">
          <h1>Setup Center</h1>
          <p class="text-muted">Complete these steps to get your Mission Control ready</p>
        </div>
      </header>
      
      <main class="container">
        <!-- Progress Overview -->
        <div class="setup-progress-card card">
          <div class="setup-progress-header">
            <div>
              <h2>Setup Progress</h2>
              <p class="text-muted">${progress.completed} of ${progress.total} modules completed</p>
            </div>
            <div class="setup-progress-percentage">
              <span class="progress-number">${progress.percentage}%</span>
            </div>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress.percentage}%"></div>
          </div>
          ${progress.percentage === 100 ? `
            <div class="setup-complete-banner">
              <span class="complete-icon">🎉</span>
              <span>Setup complete! You can now use Mission Control.</span>
              <a href="#/dashboard" class="btn btn-primary btn-small">Go to Dashboard</a>
            </div>
          ` : ''}
        </div>
        
        <!-- Module Cards -->
        <div class="modules-list">
          ${progress.modules.map(m => renderModuleCard(m)).join('')}
        </div>
        
        <!-- Quick Actions -->
        <div class="setup-actions card">
          <h3>Quick Actions</h3>
          <div class="action-buttons">
            <a href="#/nodes" class="btn btn-secondary">
              <span>+</span> Add Node
            </a>
            <a href="#/providers" class="btn btn-secondary">
              <span>⚙️</span> Configure Providers
            </a>
            <a href="#/settings" class="btn btn-secondary">
              <span>⚡</span> Advanced Settings
            </a>
          </div>
        </div>
      </main>
    </div>
  `;
}

function renderModuleCard(module) {
  const config = moduleConfig[module.name];
  const isCompleted = module.completed;
  
  return `
    <div class="module-card ${isCompleted ? 'completed' : 'pending'}">
      <div class="module-icon">${config.icon}</div>
      <div class="module-info">
        <div class="module-name">${config.title}</div>
        <div class="module-description">${config.description}</div>
        <div class="module-status">
          ${isCompleted 
            ? '<span class="badge badge-success">✓ Complete</span>'
            : '<span class="badge badge-warning">○ Pending</span>'
          }
        </div>
      </div>
      <div class="module-action">
        ${isCompleted 
          ? '<span class="status-check">✓</span>'
          : `<a href="${config.route}" class="btn btn-primary btn-small">${getModuleCTA(module.name)}</a>`
        }
      </div>
    </div>
  `;
}

function getModuleCTA(moduleName) {
  const ctas = {
    workspace: 'Create',
    nodes: 'Add Node',
    storage: 'Configure',
    providers: 'Setup',
    routing: 'Configure',
    healthChecks: 'Run Checks'
  };
  return ctas[moduleName] || 'Start';
}

// Sub-page: Workspace setup
export function renderWorkspaceSetup() {
  const workspace = store.get('setup.workspace.data');
  
  return `
    <div class="setup-subpage">
      <header class="page-header">
        <div class="container">
          <a href="#/setup" class="back-link">← Back to Setup</a>
          <h1>Create Workspace</h1>
        </div>
      </header>
      
      <main class="container">
        <div class="card">
          <div class="form-group">
            <label class="form-label">Organization Name</label>
            <input 
              type="text" 
              id="org-name" 
              class="form-input" 
              value="${workspace.orgName || ''}"
              placeholder="My Organization"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">Timezone</label>
            <select id="timezone" class="form-select">
              ${renderTimezoneOptions(workspace.timezone)}
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">Notifications</label>
            <div class="checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" id="notify-email" ${workspace.notifications?.email ? 'checked' : ''} />
                Email notifications
              </label>
              <label class="checkbox-label">
                <input type="checkbox" id="notify-webhook" ${workspace.notifications?.webhook ? 'checked' : ''} />
                Webhook notifications
              </label>
            </div>
          </div>
          
          <div class="form-actions">
            <button onclick="saveWorkspace()" class="btn btn-primary">Save & Continue</button>
            <a href="#/setup" class="btn btn-secondary">Cancel</a>
          </div>
        </div>
      </main>
    </div>
  `;
}

function renderTimezoneOptions(selected) {
  const timezones = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Europe/Paris', label: 'Paris (CET)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' }
  ];
  
  return timezones.map(tz => 
    `<option value="${tz.value}" ${tz.value === selected ? 'selected' : ''}>${tz.label}</option>`
  ).join('');
}

window.saveWorkspace = function() {
  const orgName = document.getElementById('org-name').value;
  const timezone = document.getElementById('timezone').value;
  const emailNotifications = document.getElementById('notify-email').checked;
  const webhookNotifications = document.getElementById('notify-webhook').checked;
  
  if (!orgName.trim()) {
    alert('Please enter an organization name');
    return;
  }
  
  store.set('setup.workspace.data', {
    orgName: orgName.trim(),
    timezone,
    notifications: {
      email: emailNotifications,
      webhook: webhookNotifications
    }
  });
  
  store.set('setup.workspace.completed', true);
  window.navigate('/setup');
};
