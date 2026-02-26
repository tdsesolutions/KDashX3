/**
 * Settings Page - Embedded Configuration Tabs
 * 
 * Nodes, Providers, Routing embedded as tabs
 * Storage and Account as additional tabs
 */

import { store } from '../lib/store.js';
import { renderNodesList, renderEmptyState as renderNodesEmpty, renderAddNodeModal } from './nodes.js';
import { renderNodeProviders, renderFallbackOrder, renderProviderConfigModal } from './providers.js';
import { renderRoutingSimulator, renderRoutingRules, renderRoutingSettings } from './routing.js';

// Track active tab
let activeSettingsTab = 'nodes';

export function renderSettings() {
  const auth = store.get('auth');
  const nodes = store.get('nodes') || [];
  
  // Get URL hash to determine active tab
  const hash = window.location.hash;
  if (hash.includes('tab=')) {
    const tabMatch = hash.match(/tab=(\w+)/);
    if (tabMatch) {
      activeSettingsTab = tabMatch[1];
    }
  }
  
  return `
    <div class="settings-page">
      <header class="page-header">
        <div class="container">
          <h1>Settings</h1>
          <p class="text-muted">Configure your Mission Control instance</p>
        </div>
      </header>
      
      <main class="container">
        <div class="settings-embedded-layout">
          <!-- Left Sidebar Tabs -->
          <div class="settings-tabs-sidebar">
            <nav class="settings-tabs">
              <button 
                onclick="switchSettingsTab('nodes')" 
                class="settings-tab ${activeSettingsTab === 'nodes' ? 'active' : ''}"
              >
                <span class="tab-icon">🖥️</span>
                <span class="tab-label">Nodes</span>
                ${nodes.length > 0 ? `<span class="tab-badge">${nodes.length}</span>` : ''}
              </button>
              
              <button 
                onclick="switchSettingsTab('providers')" 
                class="settings-tab ${activeSettingsTab === 'providers' ? 'active' : ''}"
              >
                <span class="tab-icon">🔌</span>
                <span class="tab-label">Providers</span>
              </button>
              
              <button 
                onclick="switchSettingsTab('routing')" 
                class="settings-tab ${activeSettingsTab === 'routing' ? 'active' : ''}"
              >
                <span class="tab-icon">📡</span>
                <span class="tab-label">Routing</span>
              </button>
              
              <button 
                onclick="switchSettingsTab('storage')" 
                class="settings-tab ${activeSettingsTab === 'storage' ? 'active' : ''}"
              >
                <span class="tab-icon">💾</span>
                <span class="tab-label">Storage</span>
              </button>
              
              <div class="tab-divider"></div>
              
              <button 
                onclick="switchSettingsTab('account')" 
                class="settings-tab ${activeSettingsTab === 'account' ? 'active' : ''}"
              >
                <span class="tab-icon">👤</span>
                <span class="tab-label">Account</span>
              </button>
              
              <button onclick="handleLogout()" class="settings-tab tab-logout">
                <span class="tab-icon">🚪</span>
                <span class="tab-label">Logout</span>
              </button>
            </nav>
          </div>
          
          <!-- Right Content Area -->
          <div class="settings-content-area">
            ${renderActiveSettingsTab()}
          </div>
        </div>
      </main>
    </div>
  `;
}

function renderActiveSettingsTab() {
  switch (activeSettingsTab) {
    case 'nodes':
      return renderEmbeddedNodes();
    case 'providers':
      return renderEmbeddedProviders();
    case 'routing':
      return renderEmbeddedRouting();
    case 'storage':
      return renderEmbeddedStorage();
    case 'account':
      return renderEmbeddedAccount();
    default:
      return renderEmbeddedNodes();
  }
}

function renderEmbeddedNodes() {
  const nodes = store.get('nodes') || [];
  const hasNodes = nodes.length > 0;
  const hasOnlineNodes = store.hasConnectedNodes();
  
  return `
    <div class="embedded-panel">
      <div class="embedded-header">
        <div>
          <h2>Nodes</h2>
          <p class="text-muted">Manage your compute nodes. API keys stay on these nodes.</p>
        </div>
        <button onclick="showAddNodeModal()" class="btn btn-primary">
          <span>+</span> Add Node
        </button>
      </div>
      
      ${!hasNodes ? `
        <div class="embedded-empty">
          ${renderNodesEmpty()}
        </div>
      ` : `
        <div class="embedded-content">
          <div class="nodes-toolbar">
            <button onclick="refreshEmbeddedNodes()" class="btn btn-secondary">
              🔄 Refresh
            </button>
          </div>
          ${renderNodesList(nodes)}
        </div>
      `}
      
      ${renderAddNodeModal()}
    </div>
  `;
}

function renderEmbeddedProviders() {
  const connectedNodes = store.getConnectedNodes();
  const allNodes = store.get('nodes') || [];
  const hasOnlineNodes = store.hasConnectedNodes();

  if (!hasOnlineNodes) {
    return `
      <div class="embedded-panel">
        <div class="embedded-header">
          <h2>Providers</h2>
        </div>
        <div class="embedded-gated">
          <div class="gated-icon">🔌</div>
          <h3>Configure Providers</h3>
          <p>Providers are configured on your connected nodes.</p>
          ${allNodes.length === 0 ? `
            <p class="text-muted">Add a node first to configure providers.</p>
            <button onclick="switchSettingsTab('nodes')" class="btn btn-primary">Go to Nodes</button>
          ` : `
            <p class="text-muted">Node paired, but offline. Start the connector to go online.</p>
            <button onclick="switchSettingsTab('nodes')" class="btn btn-primary">Check Node Status</button>
          `}
        </div>
      </div>
    `;
  }

  return `
    <div class="embedded-panel">
      <div class="embedded-header">
        <div>
          <h2>Providers</h2>
          <p class="text-muted">LLM providers configured on your nodes</p>
        </div>
      </div>
      <div class="embedded-content">
        ${connectedNodes.map(node => renderNodeProviders(node)).join('')}

        <div class="providers-fallback card">
          <h3>Fallback Order</h3>
          <p class="text-muted">When primary provider fails, try these in order</p>
          ${renderFallbackOrder()}
        </div>
      </div>
      ${renderProviderConfigModal()}
    </div>
  `;
}

function renderEmbeddedRouting() {
  const allNodes = store.get('nodes') || [];
  const hasOnlineNodes = store.hasConnectedNodes();
  const rules = store.get('routingRules') || [];

  if (!hasOnlineNodes) {
    return `
      <div class="embedded-panel">
        <div class="embedded-header">
          <h2>Routing</h2>
        </div>
        <div class="embedded-gated">
          <div class="gated-icon">📡</div>
          <h3>Routing Configuration</h3>
          <p>Routing rules are applied when dispatching tasks to your nodes.</p>
          ${allNodes.length === 0 ? `
            <p class="text-muted">Add a node first to configure routing.</p>
            <button onclick="switchSettingsTab('nodes')" class="btn btn-primary">Go to Nodes</button>
          ` : `
            <p class="text-muted">Node paired, but offline. Start the connector to go online.</p>
            <button onclick="switchSettingsTab('nodes')" class="btn btn-primary">Check Node Status</button>
          `}
        </div>
      </div>
    `;
  }

  return `
    <div class="embedded-panel">
      <div class="embedded-header">
        <div>
          <h2>Routing</h2>
          <p class="text-muted">Task routing rules and preferences</p>
        </div>
      </div>
      <div class="embedded-content">
        <div class="routing-layout">
          <div class="routing-main">
            ${renderRoutingSimulator(hasOnlineNodes)}
            ${renderRoutingRules(rules)}
          </div>
          <div class="routing-sidebar">
            ${renderRoutingSettings()}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderEmbeddedStorage() {
  return `
    <div class="embedded-panel">
      <div class="embedded-header">
        <h2>Storage & Permissions</h2>
        <p class="text-muted">Configure allowed folders and write-fence</p>
      </div>
      <div class="embedded-content">
        <div class="coming-soon">
          <div class="coming-soon-icon">💾</div>
          <h3>Storage Configuration</h3>
          <p>Storage settings are managed per-node.</p>
          <a href="#/setup/storage" class="btn btn-primary">Configure in Setup</a>
        </div>
      </div>
    </div>
  `;
}

function renderEmbeddedAccount() {
  const auth = store.get('auth');
  
  return `
    <div class="embedded-panel">
      <div class="embedded-header">
        <h2>Account</h2>
        <p class="text-muted">Your account information</p>
      </div>
      <div class="embedded-content">
        <div class="account-info">
          <div class="account-field">
            <label>Email</label>
            <div class="account-value">${auth.user?.email || 'N/A'}</div>
          </div>
          <div class="account-field">
            <label>Workspace</label>
            <div class="account-value">${store.get('workspace')?.name || 'Default'}</div>
          </div>
          <div class="account-actions">
            <button onclick="handleLogout()" class="btn btn-danger">Logout</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Tab switching
window.switchSettingsTab = function(tab) {
  activeSettingsTab = tab;
  window.location.hash = `#/settings?tab=${tab}`;
  // Re-render
  const app = document.getElementById('app');
  const content = renderSettings();
  const header = document.querySelector('.global-header')?.outerHTML || '';
  app.innerHTML = header + content;
  attachNavHandlers();
};

window.refreshEmbeddedNodes = async function() {
  await store.syncNodes();
  switchSettingsTab('nodes');
};

// Node functions are already on window from nodes.js
// Just ensure they're available for the embedded view
