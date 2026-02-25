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
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <h1>Nodes</h1>
            <button onclick="showNodeInfoModal()" class="btn btn-small btn-secondary" title="What is a Node?" style="padding: 0.25rem 0.5rem; font-size: 0.875rem;">
              ℹ️
            </button>
          </div>
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
      ${renderNodeInfoModal()}
    </div>
  `;
}

function renderNodeInfoModal() {
  return `
    <div id="node-info-modal" class="modal hidden">
      <div class="modal-overlay" onclick="hideNodeInfoModal()"></div>
      <div class="modal-content" style="max-width: 700px; max-height: 80vh; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h2>What is a Node?</h2>
          <button onclick="hideNodeInfoModal()" class="btn btn-small btn-secondary">✕</button>
        </div>

        <div class="instruction-content">
          <div class="instruction-header">
            <h4>🖥️ What is a Node?</h4>
            <p>Nodes are machines (computers, servers, VMs) that run your AI agents. KDashX3 orchestrates tasks across all your connected nodes. <strong>Important:</strong> API keys are stored encrypted on YOUR nodes—never in KDashX3 or the backend.</p>
          </div>

          <div class="instruction-section">
            <h5>🏆 Recommended Setup (Most Effective):</h5>
            <div class="recommendation-box">
              <strong>1. Primary Production Node - VPS (Best)</strong>
              <ul>
                <li><strong>Provider:</strong> DigitalOcean, AWS Lightsail, or Hetzner</li>
                <li><strong>Specs:</strong> 2GB RAM, 1 vCPU minimum (4GB RAM recommended)</li>
                <li><strong>Cost:</strong> ~$6-12/month</li>
                <li><strong>Why:</strong> Runs 24/7, reliable internet, consistent performance</li>
              </ul>

              <strong>2. Development/Testing Node - Local Machine</strong>
              <ul>
                <li>Your laptop/desktop for testing workflows</li>
                <li>Good for development, not for production tasks</li>
              </ul>

              <strong>3. Lightweight Option - Raspberry Pi 4</strong>
              <ul>
                <li>4GB RAM model minimum</li>
                <li>Good for always-on home automation tasks</li>
                <li>Limited for heavy AI workloads</li>
              </ul>
            </div>
          </div>

          <div class="instruction-steps">
            <h5>🚀 How to Add a Node:</h5>
            <ol>
              <li><strong>Click "Add Node" below</strong> to generate a pairing token for your workspace</li>
              <li>
                <strong>On your server/computer,</strong> download the node connector:
                <code>curl -o connector.js https://instance-2026clawbot-vm0210-142930.tail0f5b68.ts.net/connector.js</code>
              </li>
              <li>
                <strong>Run the connector with your token:</strong>
                <code>node connector.js --api https://instance-2026clawbot-vm0210-142930.tail0f5b68.ts.net --token [YOUR_TOKEN] --name "My Node"</code>
              </li>
              <li>
                <strong>Add API keys on your node:</strong>
                <code>export OPENAI_API_KEY=sk-...</code> or create ~/.claw/providers/openai.json
              </li>
              <li><strong>Done!</strong> Node appears as "Connected" in your KDashX3 Dashboard</li>
            </ol>
          </div>

          <div class="instruction-section">
            <h5>💡 What is connector.js?</h5>
            <p>The connector.js is a small Node.js program that runs on YOUR machine and connects to the KDashX3 backend (control plane). It maintains a secure WebSocket connection, receives task assignments, and executes them on your node. Your API keys never leave your machine.</p>
          </div>

          <div class="instruction-section">
            <h5>⚠️ Requirements:</h5>
            <ul>
              <li>Ubuntu 20.04+, Debian 11+, macOS 12+, or Windows with WSL2</li>
              <li>Node.js 18+</li>
              <li>Stable internet connection</li>
              <li>~1GB disk space minimum, 5GB recommended</li>
            </ul>
          </div>

          <div class="instruction-tip">
            <strong>🔒 BYO Security:</strong> API keys are stored encrypted on YOUR nodes only. KDashX3 never sees or stores your provider keys. Each user's nodes are isolated by workspace—your nodes are only visible to you.
          </div>
        </div>

        <div class="modal-actions" style="margin-top: 1.5rem;">
          <button onclick="hideNodeInfoModal()" class="btn btn-secondary">Close</button>
        </div>
      </div>
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
  // Normalize capabilities to always be an array
  const capabilities = Array.isArray(node.capabilities) 
    ? node.capabilities 
    : (typeof node.capabilities === 'string' 
        ? [node.capabilities] 
        : []);
  
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
  
  // ONLINE: Only true if backend reports active WebSocket (node.online)
  // PAIRED: Node exists in DB with status (regardless of online state)
  const isOnline = node.online === true;
  const isPaired = node.status === 'connected' || node.status === 'paired';

  return `
    <div class="node-card card">
      <div class="node-header">
        <div class="node-info">
          <span class="node-type-icon">${typeIcons[node.type] || '🖥️'}</span>
          <div>
            <h3 class="node-name">${node.name}</h3>
            ${isOnline
              ? '<span class="badge badge-success">● Online</span>'
              : (isPaired
                  ? '<span class="badge badge-warning">○ Paired (start connector)</span>'
                  : '<span class="badge badge-error">○ Disconnected</span>')
            }
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
          <span class="detail-label">Status</span>
          <span class="detail-value">${isOnline ? 'Connected and reporting' : (isPaired ? 'Registered, waiting for connector' : 'Not connected')}</span>
        </div>
        <div class="node-detail">
          <span class="detail-label">Last Heartbeat</span>
          <span class="detail-value">${node.last_heartbeat ? new Date(node.last_heartbeat).toLocaleString() : 'Not reported yet'}</span>
        </div>
        ${capabilities.length ? `
          <div class="node-detail">
            <span class="detail-label">Capabilities</span>
            <div class="capabilities-list">
              ${capabilities.map(c => `<span class="capability-tag">${c}</span>`).join('')}
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
      <h2 class="empty-title">No Nodes Yet</h2>
      <p class="empty-description">
        Add your first node to start executing tasks. Nodes are where your API keys live—encrypted on your machines, never in KDashX3.
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

// Node Info Modal Functions
window.showNodeInfoModal = function() {
  const modal = document.getElementById('node-info-modal');
  if (modal) {
    modal.classList.remove('hidden');
  }
};

window.hideNodeInfoModal = function() {
  const modal = document.getElementById('node-info-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
};

// Auto-refresh nodes every 10 seconds when on nodes page
setInterval(() => {
  if (window.location.hash === '#/nodes') {
    store.syncNodes();
  }
}, 10000);
