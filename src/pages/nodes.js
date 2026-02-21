/**
 * Nodes Page - Node Management
 */

import { store } from '../lib/store.js';

export function renderNodes() {
  const nodes = store.get('nodes');
  const hasNodes = nodes.length > 0;
  
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
      
      ${renderAddNodeModal()}
      ${renderPairingModal()}
    </div>
  `;
}

function renderNodesList(nodes) {
  return `
    <div class="nodes-toolbar">
      <button onclick="showAddNodeModal()" class="btn btn-primary">
        <span>+</span> Add Node
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
    error: 'badge-error'
  };
  
  const typeIcons = {
    vm: '☁️',
    local: '💻',
    server: '🖥️'
  };
  
  return `
    <div class="node-card card">
      <div class="node-header">
        <div class="node-info">
          <span class="node-type-icon">${typeIcons[node.type] || '🖥️'}</span>
          <div>
            <h3 class="node-name">${node.name}</h3>
            <span class="badge ${statusColors[node.status] || 'badge-warning'}">${node.status}</span>
          </div>
        </div>
        <div class="node-actions">
          ${node.status !== 'connected' ? `
            <button onclick="connectNode('${node.id}')" class="btn btn-small btn-primary">Connect</button>
          ` : ''}
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
          <span class="detail-value">${node.lastHeartbeat ? new Date(node.lastHeartbeat).toLocaleString() : 'Never'}</span>
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

function renderAddNodeModal() {
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
        
        <div class="modal-actions">
          <button onclick="addNode()" class="btn btn-primary">Add Node</button>
          <button onclick="hideAddNodeModal()" class="btn btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
  `;
}

function renderPairingModal() {
  return `
    <div id="pairing-modal" class="modal hidden">
      <div class="modal-overlay" onclick="hidePairingModal()"></div>
      <div class="modal-content">
        <h2>Connect Node</h2>
        <p class="text-muted">Use this pairing token to authenticate your node</p>
        
        <div class="pairing-token-display">
          <code id="pairing-token" class="pairing-token">------</code>
          <button onclick="copyPairingToken()" class="btn btn-small btn-secondary">Copy</button>
        </div>
        
        <div class="pairing-instructions">
          <h4>Instructions:</h4>
          <ol>
            <li>Install the KDashX3 agent on your node</li>
            <li>Run: <code>kdashx2-agent pair</code></li>
            <li>Enter the pairing token above</li>
          </ol>
        </div>
        
        <div class="modal-actions">
          <button onclick="simulateNodeConnected()" class="btn btn-primary">Simulate Connected</button>
          <button onclick="hidePairingModal()" class="btn btn-secondary">Close</button>
        </div>
      </div>
    </div>
  `;
}

// Modal functions
window.showAddNodeModal = function() {
  document.getElementById('add-node-modal').classList.remove('hidden');
};

window.hideAddNodeModal = function() {
  document.getElementById('add-node-modal').classList.add('hidden');
};

window.showPairingModal = function(nodeId) {
  window.__pairingNodeId = nodeId;
  const token = generatePairingToken();
  document.getElementById('pairing-token').textContent = token;
  document.getElementById('pairing-modal').classList.remove('hidden');
};

window.hidePairingModal = function() {
  document.getElementById('pairing-modal').classList.add('hidden');
};

window.generatePairingToken = function() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

window.copyPairingToken = function() {
  const token = document.getElementById('pairing-token').textContent;
  navigator.clipboard.writeText(token).then(() => {
    alert('Token copied to clipboard');
  });
};

// Node actions
window.addNode = function() {
  const name = document.getElementById('node-name').value;
  const type = document.getElementById('node-type').value;
  const os = document.getElementById('node-os').value;
  
  if (!name.trim()) {
    alert('Please enter a node name');
    return;
  }
  
  // Get capabilities
  const capabilities = [];
  if (document.getElementById('cap-docker').checked) capabilities.push('docker');
  if (document.getElementById('cap-gpu').checked) capabilities.push('gpu');
  if (document.getElementById('cap-python').checked) capabilities.push('python');
  if (document.getElementById('cap-nodejs').checked) capabilities.push('nodejs');
  
  const newNode = {
    id: 'node-' + Date.now(),
    name: name.trim(),
    type,
    os,
    status: 'pending',
    lastHeartbeat: null,
    capabilities,
    allowedFolders: [],
    defaultOutputFolder: './outputs'
  };
  
  const nodes = store.get('nodes');
  nodes.push(newNode);
  store.set('nodes', nodes);
  
  // Mark nodes module as in-progress
  store.set('setup.nodes.completed', false);
  
  hideAddNodeModal();
  window.navigate('/nodes');
  
  // Show pairing modal for the new node
  setTimeout(() => showPairingModal(newNode.id), 100);
};

window.connectNode = function(nodeId) {
  showPairingModal(nodeId);
};

window.simulateNodeConnected = function() {
  const nodeId = window.__pairingNodeId;
  if (!nodeId) return;
  
  const nodes = store.get('nodes');
  const node = nodes.find(n => n.id === nodeId);
  
  if (node) {
    node.status = 'connected';
    node.lastHeartbeat = new Date().toISOString();
    store.set('nodes', nodes);
    
    // Check if we have at least one connected node
    const hasConnected = nodes.some(n => n.status === 'connected');
    if (hasConnected) {
      store.set('setup.nodes.completed', true);
    }
  }
  
  hidePairingModal();
  window.navigate('/nodes');
};

window.testNode = function(nodeId) {
  const nodes = store.get('nodes');
  const node = nodes.find(n => n.id === nodeId);
  
  if (!node) return;
  
  alert(`Testing node "${node.name}"...\nStatus: ${node.status}\nLast heartbeat: ${node.lastHeartbeat ? new Date(node.lastHeartbeat).toLocaleString() : 'Never'}`);
};

window.deleteNode = function(nodeId) {
  if (!confirm('Are you sure you want to delete this node?')) return;
  
  const nodes = store.get('nodes').filter(n => n.id !== nodeId);
  store.set('nodes', nodes);
  
  // Update setup completion
  const hasConnected = nodes.some(n => n.status === 'connected');
  store.set('setup.nodes.completed', hasConnected);
  
  window.navigate('/nodes');
};
