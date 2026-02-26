/**
 * Providers Page - Per-node Provider Configuration
 */

import { store } from '../lib/store.js';

const providerTypes = {
  openai: { name: 'OpenAI', icon: '🤖' },
  anthropic: { name: 'Anthropic', icon: '🧠' },
  google: { name: 'Google AI', icon: '🔍' },
  local: { name: 'Local Model', icon: '🏠' },
  custom: { name: 'Custom API', icon: '⚙️' }
};

export function renderProviders() {
  const nodes = store.getConnectedNodes();
  const hasNodes = nodes.length > 0;
  
  if (!hasNodes) {
    return renderNoNodesState();
  }
  
  return `
    <div class="providers-page">
      <header class="page-header">
        <div class="container">
          <h1>Providers</h1>
          <p class="text-muted">Configure LLM providers per node. Keys stay on nodes.</p>
        </div>
      </header>
      
      <main class="container">
        ${nodes.map(node => renderNodeProviders(node)).join('')}
        
        <div class="providers-fallback card">
          <h3>Fallback Order</h3>
          <p class="text-muted">When primary provider fails, try these in order</p>
          ${renderFallbackOrder()}
        </div>
      </main>
      
      ${renderProviderConfigModal()}
    </div>
  `;
}

function renderNoNodesState() {
  return `
    <div class="providers-page">
      <header class="page-header">
        <div class="container">
          <h1>Providers</h1>
        </div>
      </header>
      
      <main class="container">
        <div class="blocked-state card">
          <div class="blocked-icon">🔒</div>
          <h2>Connect a Node to Continue</h2>
          <p>Providers run on your machine. Connect a node first.</p>
          <button onclick="showProvidersGatingModal()" class="btn btn-primary">How to Connect a Node</button>
        </div>
      </main>
      
      ${renderProvidersGatingModal()}
    </div>
  `;
}

function renderProvidersGatingModal() {
  return `
    <div id="providers-gating-modal" class="modal hidden">
      <div class="modal-overlay" onclick="hideProvidersGatingModal()"></div>
      <div class="modal-content">
        <h2>Connect a Node to Continue</h2>
        <p class="text-muted">Providers run on your machine. Connect a node first.</p>
        
        <div class="instruction-section">
          <h4>Quick Start:</h4>
          <ol>
            <li>Go to the Nodes page to generate a pairing token</li>
            <li>Run the connector on your machine</li>
            <li>Return here to configure providers</li>
          </ol>
        </div>
        
        <div class="modal-actions">
          <a href="#/nodes" class="btn btn-primary">Go to Nodes</a>
          <button onclick="hideProvidersGatingModal()" class="btn btn-secondary">Close</button>
        </div>
      </div>
    </div>
  `;
}

window.showProvidersGatingModal = function() {
  document.getElementById('providers-gating-modal')?.classList.remove('hidden');
};

window.hideProvidersGatingModal = function() {
  document.getElementById('providers-gating-modal')?.classList.add('hidden');
};

export function renderNodeProviders(node) {
  const providers = store.get('providers').filter(p => p.nodeId === node.id);
  
  return `
    <div class="node-providers card">
      <div class="node-providers-header">
        <div>
          <h3>${node.name}</h3>
          <span class="badge ${node.status === 'connected' ? 'badge-success' : 'badge-error'}">${node.status}</span>
        </div>
        <button onclick="showProviderConfigModal('${node.id}')" class="btn btn-primary btn-small">
          + Add Provider
        </button>
      </div>
      
      ${providers.length === 0 ? `
        <div class="empty-state-small">
          <p class="text-muted">No providers configured for this node</p>
        </div>
      ` : `
        <div class="providers-list">
          ${providers.map(p => renderProviderRow(p, node)).join('')}
        </div>
      `}
    </div>
  `;
}

function renderProviderRow(provider, node) {
  const typeInfo = providerTypes[provider.type] || { name: provider.type, icon: '❓' };
  const statusBadges = {
    not_configured: { class: 'badge-warning', text: 'Not Configured' },
    configured: { class: 'badge-success', text: 'Configured' },
    failing: { class: 'badge-error', text: 'Failing' },
    testing: { class: 'badge-info', text: 'Testing...' }
  };
  const badge = statusBadges[provider.status] || statusBadges.not_configured;
  
  return `
    <div class="provider-row">
      <div class="provider-info">
        <span class="provider-icon">${typeInfo.icon}</span>
        <div>
          <div class="provider-name">${typeInfo.name}</div>
          <div class="provider-meta">
            <span class="badge ${badge.class}">${badge.text}</span>
            ${provider.endpointUrl ? `<span class="endpoint">${provider.endpointUrl}</span>` : ''}
          </div>
        </div>
      </div>
      
      <div class="provider-actions">
        <button onclick="testProvider('${provider.id}')" class="btn btn-small btn-secondary" ${provider.status === 'testing' ? 'disabled' : ''}>
          ${provider.status === 'testing' ? 'Testing...' : 'Test'}
        </button>
        <button onclick="editProvider('${provider.id}')" class="btn btn-small btn-secondary">Edit</button>
        <button onclick="deleteProvider('${provider.id}')" class="btn btn-small btn-danger">Delete</button>
      </div>
    </div>
  `;
}

export function renderFallbackOrder() {
  const providers = store.get('providers').filter(p => p.status === 'configured');
  
  if (providers.length === 0) {
    return '<p class="text-muted">No configured providers available for fallback</p>';
  }
  
  return `
    <div class="fallback-list">
      ${providers.map((p, index) => {
        const node = store.get('nodes').find(n => n.id === p.nodeId);
        const typeInfo = providerTypes[p.type] || { name: p.type };
        return `
          <div class="fallback-item">
            <span class="fallback-rank">${index + 1}</span>
            <span class="fallback-name">${typeInfo.name}</span>
            <span class="fallback-node">on ${node?.name || 'Unknown'}</span>
            <div class="fallback-actions">
              ${index > 0 ? `<button onclick="moveProviderUp('${p.id}')" class="btn btn-small">↑</button>` : ''}
              ${index < providers.length - 1 ? `<button onclick="moveProviderDown('${p.id}')" class="btn btn-small">↓</button>` : ''}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

export function renderProviderConfigModal() {
  return `
    <div id="provider-config-modal" class="modal hidden">
      <div class="modal-overlay" onclick="hideProviderConfigModal()"></div>
      <div class="modal-content">
        <h2>Configure Provider</h2>
        <input type="hidden" id="provider-node-id" />
        <input type="hidden" id="provider-id" />
        
        <div class="form-group">
          <label class="form-label">Provider Type</label>
          <select id="provider-type" class="form-select" onchange="onProviderTypeChange()">
            ${Object.entries(providerTypes).map(([key, info]) => 
              `<option value="${key}">${info.icon} ${info.name}</option>`
            ).join('')}
          </select>
        </div>
        
        <div class="form-group">
          <label class="form-label">Display Name</label>
          <input type="text" id="provider-name" class="form-input" placeholder="My OpenAI" />
        </div>
        
        <div class="form-group" id="endpoint-group">
          <label class="form-label">Endpoint URL (optional)</label>
          <input type="url" id="provider-endpoint" class="form-input" placeholder="https://api.openai.com/v1" />
          <p class="form-hint">Leave empty for default endpoint</p>
        </div>
        
        <div class="form-group">
          <label class="form-label">Priority</label>
          <input type="number" id="provider-priority" class="form-input" value="1" min="1" max="10" />
          <p class="form-hint">Lower number = higher priority</p>
        </div>
        
        <div class="alert alert-info">
          <strong>Note:</strong> API keys are stored on the node, not in this dashboard.
          You'll configure the key on the node after saving.
        </div>
        
        <div class="modal-actions">
          <button onclick="saveProvider()" class="btn btn-primary">Save Provider</button>
          <button onclick="hideProviderConfigModal()" class="btn btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
  `;
}

// Modal functions
window.showProviderConfigModal = function(nodeId, providerId = null) {
  document.getElementById('provider-node-id').value = nodeId;
  document.getElementById('provider-id').value = providerId || '';
  
  if (providerId) {
    // Edit mode
    const provider = store.get('providers').find(p => p.id === providerId);
    if (provider) {
      document.getElementById('provider-type').value = provider.type;
      document.getElementById('provider-name').value = provider.name || '';
      document.getElementById('provider-endpoint').value = provider.endpointUrl || '';
      document.getElementById('provider-priority').value = provider.priority || 1;
    }
  } else {
    // Add mode
    document.getElementById('provider-type').value = 'openai';
    document.getElementById('provider-name').value = '';
    document.getElementById('provider-endpoint').value = '';
    document.getElementById('provider-priority').value = '1';
  }
  
  document.getElementById('provider-config-modal').classList.remove('hidden');
};

window.hideProviderConfigModal = function() {
  document.getElementById('provider-config-modal').classList.add('hidden');
};

window.onProviderTypeChange = function() {
  const type = document.getElementById('provider-type').value;
  const nameInput = document.getElementById('provider-name');
  
  if (!nameInput.value) {
    const typeInfo = providerTypes[type];
    nameInput.value = typeInfo ? `My ${typeInfo.name}` : '';
  }
};

// Provider actions
window.saveProvider = function() {
  const nodeId = document.getElementById('provider-node-id').value;
  const providerId = document.getElementById('provider-id').value;
  const type = document.getElementById('provider-type').value;
  const name = document.getElementById('provider-name').value;
  const endpointUrl = document.getElementById('provider-endpoint').value;
  const priority = parseInt(document.getElementById('provider-priority').value) || 1;
  
  if (!name.trim()) {
    alert('Please enter a display name');
    return;
  }
  
  const providers = store.get('providers');
  
  if (providerId) {
    // Update existing
    const idx = providers.findIndex(p => p.id === providerId);
    if (idx !== -1) {
      providers[idx] = {
        ...providers[idx],
        type,
        name: name.trim(),
        endpointUrl: endpointUrl.trim(),
        priority
      };
    }
  } else {
    // Add new
    providers.push({
      id: 'provider-' + Date.now(),
      nodeId,
      type,
      name: name.trim(),
      endpointUrl: endpointUrl.trim(),
      priority,
      status: 'not_configured',
      lastTested: null
    });
  }
  
  store.set('providers', providers);
  hideProviderConfigModal();
  window.navigate('/providers');
};

window.testProvider = async function(providerId) {
  const providers = store.get('providers');
  const provider = providers.find(p => p.id === providerId);
  
  if (!provider) return;
  
  // Set testing status
  provider.status = 'testing';
  store.set('providers', providers);
  window.navigate('/providers');
  
  // Simulate test
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Random success/failure for demo
  const success = Math.random() > 0.3;
  provider.status = success ? 'configured' : 'failing';
  provider.lastTested = new Date().toISOString();
  
  store.set('providers', providers);
  
  // Update setup completion
  const hasWorking = providers.some(p => p.status === 'configured');
  store.set('setup.providers.completed', hasWorking);
  
  window.navigate('/providers');
};

window.editProvider = function(providerId) {
  const provider = store.get('providers').find(p => p.id === providerId);
  if (provider) {
    showProviderConfigModal(provider.nodeId, providerId);
  }
};

window.deleteProvider = function(providerId) {
  if (!confirm('Delete this provider configuration?')) return;
  
  const providers = store.get('providers').filter(p => p.id !== providerId);
  store.set('providers', providers);
  
  const hasWorking = providers.some(p => p.status === 'configured');
  store.set('setup.providers.completed', hasWorking);
  
  window.navigate('/providers');
};

window.moveProviderUp = function(providerId) {
  const providers = store.get('providers');
  const idx = providers.findIndex(p => p.id === providerId);
  
  if (idx > 0) {
    [providers[idx], providers[idx - 1]] = [providers[idx - 1], providers[idx]];
    store.set('providers', providers);
    window.navigate('/providers');
  }
};

window.moveProviderDown = function(providerId) {
  const providers = store.get('providers');
  const idx = providers.findIndex(p => p.id === providerId);
  
  if (idx < providers.length - 1) {
    [providers[idx], providers[idx + 1]] = [providers[idx + 1], providers[idx]];
    store.set('providers', providers);
    window.navigate('/providers');
  }
};
