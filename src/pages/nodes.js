/**
 * Nodes Page - Real Node Management
 */

import { realStore } from '../lib/store-real.js';
import { createPairingToken, getNodes } from '../lib/store.js';
import { API_BASE_URL } from '../lib/api-config.js';

export function renderNodes() {
  const state = realStore.get();
  const nodes = state.nodes || [];
  const hasNodes = nodes.length > 0;
  const workspace = state.currentWorkspace;
  
  return `
    <div class="nodes-page">
      <header class="page-header">
        <div class="container">
          <h1>Nodes</h1>
          <p class="text-muted">Manage your compute nodes. API keys stay on these nodes.</p>
        </div>
      </header>
      
      <main class="container">
        ${hasNodes ? renderNodesList(nodes) : renderEmptyState()}
      </main>
      
      ${renderAddNodeModal(workspace)}
    </div>
  `;
}

function renderNodesList(nodes) {
  return `
    <div class="nodes-toolbar">
      <button onclick="showAddNodeModal()" class="btn btn-primary">
        <span>+</span> Add Node
      </button>
      <button onclick="refreshNodes()" class="btn btn-secondary">
        🔄 Refresh
      </button>
    </div>
    
    <div class="nodes-list">
      ${nodes.map(node => renderNodeCard(node)).join('')}
    </div>
  `;
}

function renderNodeCard(node) {
  const statusColors = {
    connected: 'badge-success',
    disconnected: 'badge-error',
    pending: 'badge-warning',
    offline: 'badge-error'
  };
  
  const typeIcons = {
    vm: '☁️',
    local: '💻',
    server: '🖥️'
  };
  
  const isOnline = node.status === 'connected' || node.online;
  
  return `
    <div class="node-card card">
      <div class="node-header">
        <div class="node-info">
          <span class="node-type-icon">${typeIcons[node.type] || '🖥️'}</span>
          <div>
            <h3 class="node-name">${node.name}</h3>
            <span class="badge ${statusColors[node.status] || 'badge-warning'}">${node.status}</span>
            ${isOnline ? '<span class="badge badge-success">● Online</span>' : '<span class="badge badge-error">○ Offline</span>'}
          </div>
        </div>
        <div class="node-actions">
          <button onclick="testNode('${node.id}')" class="btn btn-small btn-secondary">Test</button>
          <button onclick="deleteNode('${node.id}')" class="btn btn-small btn-danger">Delete</button>
        </div>
      </div>
      
      <div class="node-details">
        <div class="node-detail">
          <span class="detail-label">OS</span>
          <span class="detail-value">${node.os || 'Unknown'}</span>
        </div>
        <div class="node-detail">
          <span class="detail-label">ID</span>
          <span class="detail-value node-id">${node.id}</span>
        </div>
        <div class="node-detail">
          <span class="detail-label">Last Seen</span>
          <span class="detail-value">${node.last_heartbeat ? new Date(node.last_heartbeat).toLocaleString() : 'Never'}</span>
        </div>
        ${node.capabilities?.length ? `
          <div class="node-detail">
            <span class="detail-label">Capabilities</span>
            <div class="capabilities-list">
              ${node.capabilities.map(c => `<span class="capability-tag">${c}</span>`).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

function renderEmptyState() {
  return `
    <div class="empty-state card">
      <div class="empty-icon">🖥️</div>
      <h2 class="empty-title">No Nodes Connected</h2>
      <p class="empty-description">
        Add your first node to start executing tasks. Nodes are where your API keys live.
      </p>
      <button onclick="showAddNodeModal()" class="btn btn-primary">
        Add Your First Node
      </button>
    </div>
  `;
}

function renderAddNodeModal(workspace) {
  return `
    <div id="add-node-modal" class="modal hidden">
      <div class="modal-overlay" onclick="hideAddNodeModal()"></div>
      <div class="modal-content">
        <h2>Add New Node</h2>
        
        <div class="form-group">
          <label class="form-label">Node Name</label>
          <input type="text" id="node-name" class="form-input" placeholder="My Node" />
        </div>
        
        <div class="form-group">
          <label class="form-label">Node Type</label>
          <select id="node-type" class="form-select">
            <option value="local">Local Machine</option>
            <option value="vm">Cloud VM</option>
            <option value="server">Dedicated Server</option>
          </select>
        </div>
        
        <div class="form-group">
          <label class="form-label">Operating System</label>
          <select id="node-os" class="form-select">
            <option value="linux">Linux</option>
            <option value="macos">macOS</option>
            <option value="windows">Windows</option>
          </select>
        </div>
        
        <div class="form-group">
          <label class="form-label">Capabilities</label>
          <div class="checkbox-group">
            <label class="checkbox-label"><input type="checkbox" id="cap-docker" value="docker" /> Docker</label>
            <label class="checkbox-label"><input type="checkbox" id="cap-gpu" value="gpu" /> GPU</label>
            <label class="checkbox-label"><input type="checkbox" id="cap-python" value="python" checked /> Python</label>
            <label class="checkbox-label"><input type="checkbox" id="cap-nodejs" value="nodejs" /> Node.js</label>
          </div>
        </div>
        
        <div id="pairing-section" class="hidden">
          <div class="alert alert-info">
            <strong>Pairing Token Created!</strong>
            <p>Run this command on your node:</p>
            <code class="command-block" id="pairing-command"></code>
            <button onclick="copyPairingCommand()" class="btn btn-small btn-secondary">Copy</button>
          </div>
        </div>
        
        <div class="modal-actions">
          <button onclick="createPairing()" class="btn btn-primary" id="create-pairing-btn">
            Create Pairing Token
          </button>
          <button onclick="hideAddNodeModal()" class="btn btn-secondary">Close</button>
        </div>
      </div>
    </div>
  `;
}

// Modal functions
window.showAddNodeModal = function() {
  document.getElementById('add-node-modal').classList.remove('hidden');
  document.getElementById('pairing-section').classList.add('hidden');
  document.getElementById('create-pairing-btn').textContent = 'Create Pairing Token';
  document.getElementById('create-pairing-btn').disabled = false;
};

window.hideAddNodeModal = function() {
  document.getElementById('add-node-modal').classList.add('hidden');
};

window.createPairing = async function() {
  const workspace = realStore.get().currentWorkspace;
  if (!workspace) {
    alert('No workspace selected');
    return;
  }
  
  const name = document.getElementById('node-name').value || 'New Node';
  const type = document.getElementById('node-type').value;
  const os = document.getElementById('node-os').value;
  
  const capabilities = [];
  if (document.getElementById('cap-docker').checked) capabilities.push('docker');
  if (document.getElementById('cap-gpu').checked) capabilities.push('gpu');
  if (document.getElementById('cap-python').checked) capabilities.push('python');
  if (document.getElementById('cap-nodejs').checked) capabilities.push('nodejs');
  
  const btn = document.getElementById('create-pairing-btn');
  btn.disabled = true;
  btn.textContent = 'Creating...';
  
  try {
    const result = await createPairingToken(workspace.id);
    
    const command = `mc-node --api "${API_BASE_URL}" --token "${result.token}" --name "${name}" --type "${type}" --capabilities "${capabilities.join(',')}"`;
    
    document.getElementById('pairing-command').textContent = command;
    document.getElementById('pairing-section').classList.remove('hidden');
    btn.textContent = 'Token Created';
    
  } catch (err) {
    alert('Failed to create pairing token: ' + err.message);
    btn.disabled = false;
    btn.textContent = 'Create Pairing Token';
  }
};

window.copyPairingCommand = function() {
  const command = document.getElementById('pairing-command').textContent;
  navigator.clipboard.writeText(command).then(() => {
    alert('Command copied to clipboard');
  });
};

window.refreshNodes = function() {
  realStore.loadNodes();
  window.navigate('/nodes');
};

window.testNode = function(nodeId) {
  const node = realStore.get().nodes.find(n => n.id === nodeId);
  if (!node) return;
  
  alert(`Node: ${node.name}\nStatus: ${node.status}\nOnline: ${node.online ? 'Yes' : 'No'}\nLast heartbeat: ${node.last_heartbeat ? new Date(node.last_heartbeat).toLocaleString() : 'Never'}`);
};

window.deleteNode = async function(nodeId) {
  if (!confirm('Delete this node?')) return;
  
  // TODO: Implement delete API call
  alert('Node deletion not yet implemented in backend');
};

// Auto-refresh on page load
window.addEventListener('load', () => {
  if (window.location.hash === '#/nodes') {
    realStore.loadNodes();
  }
});
