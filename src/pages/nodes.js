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

  // Trigger health check on render
  setTimeout(checkApiHealth, 0);

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
        <!-- API Health Banner -->
        <div id="api-health-banner" class="api-health-banner hidden" style="background: #fee2e2; border: 1px solid #ef4444; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span style="font-size: 1.25rem;">⚠️</span>
            <div style="flex: 1;">
              <strong style="color: #b91c1c;">Can't reach Mission Control API.</strong>
              <p style="margin: 0.25rem 0 0 0; color: #7f1d1d; font-size: 0.875rem;">
                Try hard refresh: Cmd+Option+R (Mac) / Ctrl+Shift+R (Windows).<br>
                If it still fails, check your network.
              </p>
            </div>
          </div>
        </div>
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
                <code>curl -o connector.js https://mc.tdsesolutions.com/connector.js</code>
              </li>
              <li>
                <strong>Run the connector with your token:</strong>
                <code>node connector.js --api https://mc.tdsesolutions.com --token [YOUR_TOKEN] --name "My Node"</code>
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

export function renderNodesList(nodes) {
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
  
  // ACCURATE ONLINE STATUS: Check heartbeat within 90 seconds
  const HEARTBEAT_THRESHOLD = 90 * 1000; // 90 seconds
  const lastHeartbeat = node.last_heartbeat ? new Date(node.last_heartbeat).getTime() : 0;
  const timeSinceHeartbeat = Date.now() - lastHeartbeat;
  const hasRecentHeartbeat = lastHeartbeat > 0 && timeSinceHeartbeat < HEARTBEAT_THRESHOLD;
  
  // ONLINE: Node reports online=true AND has recent heartbeat
  const isOnline = node.online === true && hasRecentHeartbeat;
  const isStale = node.online === true && !hasRecentHeartbeat; // Was online but heartbeat stale
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
              : (isStale
                  ? '<span class="badge badge-warning">○ Stale (reconnect needed)</span>'
                  : (isPaired
                      ? '<span class="badge badge-warning">○ Paired (start connector)</span>'
                      : '<span class="badge badge-error">○ Disconnected</span>'))
            }
          </div>
        </div>
        <div class="node-actions">
          <button onclick="testNode('${node.id}')" class="btn btn-small btn-secondary">Test</button>
          ${!isOnline ? `<button onclick="showReconnectModal('${node.id}')" class="btn btn-small btn-primary">Reconnect</button>` : ''}
          ${isOnline ? `<button onclick="disconnectNodeById('${node.id}')" class="btn btn-small" style="background: #f59e0b; color: white;">Disconnect</button>` : ''}
          <button onclick="deleteNodeById('${node.id}')" class="btn btn-small btn-danger">Remove</button>
        </div>
      </div>

      ${isStale ? `
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 0.75rem; margin: 0.75rem 0; border-radius: 4px;">
          <strong>⚠️ Node appears offline</strong>
          <p style="margin: 0.25rem 0 0 0; font-size: 0.875rem;">Last heartbeat was ${Math.round(timeSinceHeartbeat / 1000)}s ago. Click "Reconnect" to restore connection.</p>
        </div>
      ` : ''}

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
          <span class="detail-value">${isOnline ? 'Connected and reporting' : (isStale ? 'Connection stale - reconnect required' : (isPaired ? 'Registered, waiting for connector' : 'Not connected'))}</span>
        </div>
        <div class="node-detail">
          <span class="detail-label">Last Heartbeat</span>
          <span class="detail-value">${node.last_heartbeat ? new Date(node.last_heartbeat).toLocaleString() + ` (${Math.round(timeSinceHeartbeat / 1000)}s ago)` : 'Not reported yet'}</span>
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

export function renderEmptyState() {
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

export function renderAddNodeModal() {
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
  // Health check
  await checkApiHealth();
  if (!apiHealthStatus.healthy) {
    alert("Can't reach Mission Control API.\n\nTry hard refresh: Cmd+Option+R (Mac) / Ctrl+Shift+R (Windows).\nIf it still fails, check your network.");
    return;
  }

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
  // Health check
  await checkApiHealth();
  if (!apiHealthStatus.healthy) {
    alert("Can't reach Mission Control API.\n\nTry hard refresh: Cmd+Option+R (Mac) / Ctrl+Shift+R (Windows).\nIf it still fails, check your network.");
    return;
  }

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
  // Health check
  await checkApiHealth();
  if (!apiHealthStatus.healthy) {
    alert("Can't reach Mission Control API.\n\nTry hard refresh: Cmd+Option+R (Mac) / Ctrl+Shift+R (Windows).\nIf it still fails, check your network.");
    return;
  }

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

// API Health Check
let apiHealthStatus = { healthy: true, checked: false };

window.checkApiHealth = async function() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, { method: 'GET', mode: 'cors' });
    apiHealthStatus = { healthy: response.ok, checked: true };
  } catch (err) {
    apiHealthStatus = { healthy: false, checked: true };
  }
  updateHealthBanner();
};

function updateHealthBanner() {
  const banner = document.getElementById('api-health-banner');
  if (!banner) return;

  if (!apiHealthStatus.healthy) {
    banner.classList.remove('hidden');
    // Disable critical action buttons
    document.querySelectorAll('.nodes-toolbar button, .node-card button').forEach(btn => {
      if (btn.textContent.includes('Remove') ||
          btn.textContent.includes('Disconnect') ||
          btn.textContent.includes('Add Node') ||
          btn.id === 'create-pairing-btn') {
        btn.disabled = true;
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
      }
    });
  } else {
    banner.classList.add('hidden');
    // Re-enable buttons
    document.querySelectorAll('.nodes-toolbar button, .node-card button').forEach(btn => {
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.style.cursor = 'pointer';
    });
  }
}

// Health check before critical actions
window.requireApiHealth = async function(actionFn) {
  await checkApiHealth();
  if (!apiHealthStatus.healthy) {
    alert("Can't reach Mission Control API. Please check your connection and try again.");
    return;
  }
  return actionFn();
};

// RECONNECT MODAL FUNCTIONS
window.showReconnectModal = async function(nodeId) {
  // Get node details
  const nodes = store.get('nodes') || [];
  const node = nodes.find(n => n.id === nodeId);
  
  if (!node) {
    alert('Node not found');
    return;
  }
  
  // Create modal if it doesn't exist
  let modal = document.getElementById('reconnect-node-modal');
  if (!modal) {
    const modalHtml = `
      <div id="reconnect-node-modal" class="modal hidden">
        <div class="modal-overlay" onclick="hideReconnectModal()"></div>
        <div class="modal-content" style="max-width: 700px;">
          <h2>Reconnect this node</h2>
          <p class="text-muted">Run these commands on <strong id="reconnect-node-name"></strong> to restore connection.</p>
          
          <div id="reconnect-loading" style="text-align: center; padding: 2rem;">
            <div class="spinner"></div>
            <p>Generating reconnect token...</p>
          </div>
          
          <div id="reconnect-commands" class="hidden">
            <div class="alert alert-info">
              <strong>Step 1:</strong> Download the connector (if not already present):
              <pre class="command-block" id="reconnect-download-cmd"></pre>
              <button onclick="copyReconnectCommand('download')" class="btn btn-small btn-secondary">Copy</button>
            </div>
            
            <div class="alert alert-info" style="margin-top: 1rem;">
              <strong>Step 2:</strong> Run the connector with your reconnect token:
              <pre class="command-block" id="reconnect-run-cmd"></pre>
              <button onclick="copyReconnectCommand('run')" class="btn btn-small btn-secondary">Copy</button>
            </div>
            
            <div class="alert alert-warning" style="margin-top: 1rem;">
              <strong>⚠️ Important:</strong> Leave this terminal running. The token expires in 10 minutes.
            </div>
          </div>
          
          <div id="reconnect-error" class="alert alert-error hidden" style="margin-top: 1rem;">
            <strong>Error:</strong> <span id="reconnect-error-msg"></span>
          </div>
          
          <div class="modal-actions" style="margin-top: 1.5rem;">
            <button onclick="refreshNodesAfterReconnect()" class="btn btn-primary">🔄 Refresh Status</button>
            <button onclick="hideReconnectModal()" class="btn btn-secondary">Close</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    modal = document.getElementById('reconnect-node-modal');
  }
  
  // Show modal
  modal.classList.remove('hidden');
  document.getElementById('reconnect-node-name').textContent = node.name;
  document.getElementById('reconnect-loading').classList.remove('hidden');
  document.getElementById('reconnect-commands').classList.add('hidden');
  document.getElementById('reconnect-error').classList.add('hidden');
  
  // Generate reconnect token
  try {
    const response = await fetch(`${API_BASE_URL}/pairing-tokens/reconnect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('kdashx3-token')}`
      },
      body: JSON.stringify({ node_id: nodeId })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create reconnect token');
    }
    
    const data = await response.json();
    
    // Store token for copy functions
    window.currentReconnectToken = data.token;
    window.currentNodeName = node.name;
    window.currentNodeType = node.type || 'vm';
    
    // Show commands
    document.getElementById('reconnect-loading').classList.add('hidden');
    document.getElementById('reconnect-commands').classList.remove('hidden');
    
    // Set command text
    const downloadCmd = `curl -fsSL -o connector.js ${API_BASE_URL}/connector.js`;
    const runCmd = `node connector.js --api ${API_BASE_URL} --token ${data.token} --name "${node.name}" --type ${node.type || 'vm'}`;
    
    document.getElementById('reconnect-download-cmd').textContent = downloadCmd;
    document.getElementById('reconnect-run-cmd').textContent = runCmd;
    
  } catch (err) {
    document.getElementById('reconnect-loading').classList.add('hidden');
    document.getElementById('reconnect-error').classList.remove('hidden');
    document.getElementById('reconnect-error-msg').textContent = err.message;
  }
};

window.hideReconnectModal = function() {
  const modal = document.getElementById('reconnect-node-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
  window.currentReconnectToken = null;
};

window.copyReconnectCommand = function(type) {
  let text = '';
  if (type === 'download') {
    text = document.getElementById('reconnect-download-cmd').textContent;
  } else {
    text = document.getElementById('reconnect-run-cmd').textContent;
  }
  
  navigator.clipboard.writeText(text).then(() => {
    alert('Command copied to clipboard!');
  }).catch(() => {
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    alert('Command copied to clipboard!');
  });
};

window.refreshNodesAfterReconnect = async function() {
  await store.syncNodes();
  alert('Node status refreshed');
  window.navigate('/nodes');
};
