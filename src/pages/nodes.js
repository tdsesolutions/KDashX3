/**
 * Nodes Page - Real Node Management with Backend
 */

import { store } from '../lib/store.js';
import { createPairingToken, disconnectNode, deleteNode } from '../lib/api.js';
import { API_BASE_URL } from '../lib/config.js';

export function renderNodes() {
  const nodes = store.get('nodes') || [];
  const hasNodes = nodes.length > 0;
  
  // Sync nodes on load
  store.syncNodes();
  
  return `
    <div class="nodes-page">
      <header class="page-header">
        <div class="container">
          <h1>Nodes</h1>
          <p class="text-muted">Manage your compute nodes. API keys stay on these nodes.</p>
        </div>
      </header>
      
      <main class="container">
        <div class="nodes-toolbar">
          <button onclick="showAddNodeModal()" class="btn btn-primary">
            <span>+</span> Add Node
          </button>
          <button onclick="refreshNodes()" class="btn btn-secondary">
            🔄 Refresh
          </button>
        </div>
        
        ${hasNodes ? renderNodesList(nodes) : renderEmptyState()}
      </main>
      
      ${renderAddNodeModal()}
    </div>
  `;
}

function renderNodesList(nodes) {
  return `
    <div class="nodes-list">
      ${nodes.map(node => renderNodeCard(node)).join('')}
    </div>
  `;
}

function renderNodeCard(node) {
  const statusColors = {
    connected: 'badge-success',
    disconnected: 'badge-error',
    pending: 'badge-warning'
  };
  
  const typeIcons = {
    vm: '☁️',
    local: '💻',
    server: '🖥️'
  };
  
  const isOnline = node.online || node.status === 'connected';
  
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
          ${isOnline ? `<button onclick="disconnectNodeById('${node.id}')" class="btn btn-small" style="background: #f59e0b; color: white;">Disconnect</button>` : ''}
          <button onclick="deleteNodeById('${node.id}')" class="btn btn-small btn-danger">Remove</button>
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
          <span class="detail-label">Last Heartbeat</span>
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

function renderAddNodeModal() {
  return `
    <div id="add-node-modal" class="modal hidden">
      <div class="modal-overlay" onclick="hideAddNodeModal()"></div>
      <div class="modal-content">
        <h2>Add New Node</h2>
        <p class="text-muted">Create a pairing token to connect a new node.</p>
        
        <div class="form-group">
          <label class="form-label">Node Name</label>
          <input type="text" id="node-name" class="form-input" placeholder="My Node" value="Production VM" />
        </div>
        
        <div class="form-group">
          <label class="form-label">Node Type</label>
          <select id="node-type" class="form-select">
            <option value="vm" selected>Cloud VM</option>
            <option value="local">Local Machine</option>
            <option value="server">Dedicated Server</option>
          </select>
        </div>
        
        <div id="pairing-section" class="hidden">
          <div class="alert alert-info">
            <strong>✓ Pairing Token Created!</strong>
            <p style="margin: 10px 0;"><strong>Step 1:</strong> Download the node connector to your computer/server:</p>
            <pre class="command-block" id="download-command"></pre>
            
            <p style="margin: 10px 0;"><strong>Step 2:</strong> Run the connector with your token:</p>
            <pre class="command-block" id="pairing-command"></pre>
            
            <button onclick="copyPairingCommand()" class="btn btn-small btn-secondary">Copy Step 2 Command</button>
          </div>
          
          <div class="alert alert-warning">
            <strong>⚠️ Important:</strong> The token expires in 10 minutes and can only be used once.
          </div>
          
          <div class="alert alert-info" style="margin-top: 10px;">
            <strong>💡 What is this?</strong> You're running a small program on YOUR computer that connects to Mission Control. It stays running and waits for tasks.
          </div>
        </div>
        
        <div class="modal-actions">
          <button onclick="generatePairingToken()" class="btn btn-primary" id="create-pairing-btn">
            Generate Pairing Token
          </button>
          <button onclick="hideAddNodeModal()" class="btn btn-secondary">Close</button>
        </div>
      </div>
    </div>
  `;
}

// Actions
window.showAddNodeModal = function() {
  document.getElementById('add-node-modal').classList.remove('hidden');
  document.getElementById('pairing-section').classList.add('hidden');
  document.getElementById('create-pairing-btn').classList.remove('hidden');
  document.getElementById('create-pairing-btn').textContent = 'Generate Pairing Token';
  document.getElementById('create-pairing-btn').disabled = false;
};

window.hideAddNodeModal = function() {
  document.getElementById('add-node-modal').classList.add('hidden');
};

window.generatePairingToken = async function() {
  const btn = document.getElementById('create-pairing-btn');
  const name = document.getElementById('node-name').value || 'New Node';
  const type = document.getElementById('node-type').value;

  btn.disabled = true;
  btn.textContent = 'Generating...';

  try {
    const result = await createPairingToken();

    const downloadCmd = `curl -o connector.js ${API_BASE_URL}/connector.js`;
    const runCmd = `node connector.js --api ${API_BASE_URL} --token ${result.token} --name "${name}" --type ${type}`;

    document.getElementById('download-command').textContent = downloadCmd;
    document.getElementById('pairing-command').textContent = runCmd;
    document.getElementById('pairing-section').classList.remove('hidden');
    btn.classList.add('hidden');

  } catch (err) {
    alert('Failed to create pairing token: ' + err.message);
    btn.disabled = false;
    btn.textContent = 'Generate Pairing Token';
  }
};

window.copyPairingCommand = function() {
  const command = document.getElementById('pairing-command').textContent;
  navigator.clipboard.writeText(command).then(() => {
    alert('Command copied! Run this on your node to connect.');
  });
};

window.refreshNodes = async function() {
  await store.syncNodes();
  window.navigate('/nodes');
};

window.testNode = function(nodeId) {
  const node = store.get('nodes').find(n => n.id === nodeId);
  if (!node) return;
  
  alert(`Node: ${node.name}
Status: ${node.status}
Online: ${node.online ? 'Yes' : 'No'}
Last heartbeat: ${node.last_heartbeat ? new Date(node.last_heartbeat).toLocaleString() : 'Never'}`);
};

window.disconnectNodeById = async function(nodeId) {
  if (!confirm('Disconnect this node? It will go offline but can be reconnected later.')) {
    return;
  }
  
  try {
    await disconnectNode(nodeId);
    await store.syncNodes();
    alert('Node disconnected');
    window.navigate('/nodes');
  } catch (err) {
    alert('Failed to disconnect: ' + err.message);
  }
};

window.deleteNodeById = async function(nodeId) {
  if (!confirm('Permanently remove this node? This cannot be undone.')) {
    return;
  }
  
  try {
    await deleteNode(nodeId);
    // Remove from local store
    const nodes = store.get('nodes').filter(n => n.id !== nodeId);
    store.set('nodes', nodes);
    alert('Node removed');
    window.navigate('/nodes');
  } catch (err) {
    alert('Failed to remove: ' + err.message);
  }
};

// Auto-refresh nodes every 10 seconds when on nodes page
setInterval(() => {
  if (window.location.hash === '#/nodes') {
    store.syncNodes();
  }
}, 10000);
