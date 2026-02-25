/**
 * Routing Page - Routing Rules and Brain Simulation
 */

import { store } from '../lib/store.js';
import { routeTask } from '../llm/routingBrain.js';

export function renderRouting() {
  const rules = store.get('routingRules');
  const hasNodes = store.hasConnectedNodes();

  if (!hasNodes) {
    return renderNoNodesState();
  }

  return `
    <div class="routing-page">
      <header class="page-header">
        <div class="container">
          <h1>Routing</h1>
          <p class="text-muted">Configure routing rules and test the routing brain</p>
        </div>
      </header>

      <main class="container">
        <div class="routing-layout">
          <div class="routing-main">
            ${renderRoutingSimulator(hasNodes)}
            ${renderRoutingRules(rules)}
          </div>

          <div class="routing-sidebar">
            ${renderRoutingSettings()}
          </div>
        </div>
      </main>
    </div>
  `;
}

function renderNoNodesState() {
  return `
    <div class="routing-page">
      <header class="page-header">
        <div class="container">
          <h1>Routing</h1>
        </div>
      </header>

      <main class="container">
        <div class="blocked-state card">
          <div class="blocked-icon">🔒</div>
          <h2>Connect a Node to Continue</h2>
          <p>Routing requires at least one connected node to function.</p>
          <button onclick="showRoutingGatingModal()" class="btn btn-primary">How to Connect a Node</button>
        </div>
      </main>

      ${renderRoutingGatingModal()}
    </div>
  `;
}

function renderRoutingGatingModal() {
  return `
    <div id="routing-gating-modal" class="modal hidden">
      <div class="modal-overlay" onclick="hideRoutingGatingModal()"></div>
      <div class="modal-content">
        <h2>Connect a Node to Continue</h2>
        <p class="text-muted">Routing requires at least one connected node to function.</p>

        <div class="instruction-section">
          <h4>Quick Start:</h4>
          <ol>
            <li>Go to the Nodes page to generate a pairing token</li>
            <li>Run the connector on your machine</li>
            <li>Return here to configure routing</li>
          </ol>
        </div>

        <div class="modal-actions">
          <a href="#/nodes" class="btn btn-primary">Go to Nodes</a>
          <button onclick="hideRoutingGatingModal()" class="btn btn-secondary">Close</button>
        </div>
      </div>
    </div>
  `;
}

window.showRoutingGatingModal = function() {
  document.getElementById('routing-gating-modal')?.classList.remove('hidden');
};

window.hideRoutingGatingModal = function() {
  document.getElementById('routing-gating-modal')?.classList.add('hidden');
};

function renderRoutingSimulator(hasNodes) {
  return `
    <div class="routing-simulator card">
      <h2>Test Routing Brain</h2>
      <p class="text-muted">Enter a task intent to see how the routing brain would handle it</p>
      
      ${!hasNodes ? `
        <div class="blocked-notice">
          <span class="blocked-icon">⚠️</span>
          <span>Connect a node to test routing</span>
          <a href="#/nodes" class="btn btn-small btn-primary">Add Node</a>
        </div>
      ` : ''}
      
      <div class="simulator-form">
        <div class="form-group">
          <label class="form-label">Task Intent</label>
          <textarea 
            id="routing-intent" 
            class="form-textarea" 
            placeholder="e.g., Deploy a Python web app with Docker"
            ${!hasNodes ? 'disabled' : ''}
          ></textarea>
        </div>
        
        <div class="form-group">
          <label class="form-label">Priority</label>
          <select id="routing-priority" class="form-select" ${!hasNodes ? 'disabled' : ''}>
            <option value="low">Low</option>
            <option value="normal" selected>Normal</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        
        <button onclick="simulateRouting()" class="btn btn-primary" ${!hasNodes ? 'disabled' : ''}>
          Simulate Routing
        </button>
      </div>
      
      <div id="routing-result" class="routing-result hidden">
        <!-- Results rendered here -->
      </div>
    </div>
  `;
}

function renderRoutingRules(rules) {
  return `
    <div class="routing-rules card">
      <div class="rules-header">
        <h2>Routing Rules</h2>
        <button onclick="addRoutingRule()" class="btn btn-small btn-primary">+ Add Rule</button>
      </div>
      
      ${rules.length === 0 ? `
        <div class="empty-state-small">
          <p class="text-muted">No custom routing rules. Default routing applies.</p>
        </div>
      ` : `
        <div class="rules-list">
          ${rules.map((rule, idx) => `
            <div class="rule-item">
              <div class="rule-pattern">
                <span class="rule-keyword">${rule.keyword}</span>
                <span class="rule-arrow">→</span>
                <span class="rule-target">${rule.target}</span>
              </div>
              <div class="rule-actions">
                <button onclick="deleteRoutingRule(${idx})" class="btn btn-small btn-danger">Delete</button>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;
}

function renderRoutingSettings() {
  const config = store.get('setup.routing.data');
  
  return `
    <div class="routing-settings card">
      <h3>Routing Settings</h3>
      
      <div class="form-group">
        <label class="form-label">Default Risk Threshold</label>
        <select id="risk-threshold" class="form-select" onchange="updateRiskThreshold()">
          <option value="low" ${config.defaultRiskThreshold === 'low' ? 'selected' : ''}>Low - Allow most actions</option>
          <option value="medium" ${config.defaultRiskThreshold === 'medium' ? 'selected' : ''}>Medium - Moderate caution</option>
          <option value="high" ${config.defaultRiskThreshold === 'high' ? 'selected' : ''}>High - Strict approval</option>
          <option value="critical" ${config.defaultRiskThreshold === 'critical' ? 'selected' : ''}>Critical - Require approval</option>
        </select>
      </div>
      
      <div class="form-group">
        <label class="checkbox-label">
          <input type="checkbox" id="fallback-enabled" ${config.fallbackEnabled !== false ? 'checked' : ''} onchange="updateFallbackEnabled()" />
          Enable provider fallback
        </label>
        <p class="form-hint">Try alternative providers if primary fails</p>
      </div>
      
      <div class="routing-info">
        <h4>How Routing Works</h4>
        <ol>
          <li>User submits task intent</li>
          <li>Routing Brain analyzes requirements</li>
          <li>Selects node with matching capabilities</li>
          <li>Chooses provider based on availability</li>
          <li>Calculates risk and approval needs</li>
        </ol>
      </div>
    </div>
  `;
}

// Actions
window.simulateRouting = async function() {
  const intent = document.getElementById('routing-intent').value;
  const priority = document.getElementById('routing-priority').value;
  const resultEl = document.getElementById('routing-result');
  
  if (!intent.trim()) {
    alert('Please enter a task intent');
    return;
  }
  
  // Show loading
  resultEl.innerHTML = '<div class="routing-loading"><div class="spinner"></div><p>Analyzing intent...</p></div>';
  resultEl.classList.remove('hidden');
  
  try {
    // Get context
    const nodes = store.getConnectedNodes();
    const providers = store.getWorkingProviders();
    
    // Call routing brain
    const decision = await routeTask({
      intent,
      context: {
        available_nodes: nodes,
        configured_providers: providers
      },
      constraints: { priority }
    });
    
    // Validate decision has required fields
    if (!decision.selected_node_id || !decision.risk_level) {
      throw new Error('Invalid routing decision: missing required fields');
    }
    
    // Find selected node details
    const selectedNode = nodes.find(n => n.id === decision.selected_node_id);
    
    // Render result
    resultEl.innerHTML = `
      <div class="routing-decision">
        <h3>Routing Decision</h3>
        
        <div class="decision-section">
          <h4>Selected Node</h4>
          <div class="decision-value">
            <span class="node-badge">${selectedNode?.name || 'Unknown'}</span>
            <span class="badge ${decision.risk_level === 'critical' ? 'badge-error' : decision.risk_level === 'high' ? 'badge-warning' : 'badge-success'}">${decision.risk_level} risk</span>
          </div>
        </div>
        
        <div class="decision-section">
          <h4>Required Capabilities</h4>
          <div class="capabilities-list">
            ${decision.required_capabilities.map(c => `<span class="capability-tag">${c}</span>`).join('')}
          </div>
        </div>
        
        <div class="decision-section">
          <h4>Provider Preference</h4>
          <div class="decision-value">${decision.provider_preference}</div>
        </div>
        
        <div class="decision-section">
          <h4>Fallback Order</h4>
          <ol class="fallback-list">
            ${decision.fallback_order.map(id => {
              const provider = providers.find(p => p.id === id);
              return `<li>${provider?.name || id}</li>`;
            }).join('')}
          </ol>
        </div>
        
        <div class="decision-section">
          <h4>Output Location</h4>
          <code class="output-path">${decision.output_location.path}</code>
        </div>
        
        <div class="decision-section">
          <h4>Approval Required</h4>
          <div class="decision-value">
            ${decision.approval_required 
              ? '<span class="badge badge-warning">Yes - Requires approval</span>'
              : '<span class="badge badge-success">No - Auto-approved</span>'
            }
          </div>
        </div>
        
        <div class="decision-section">
          <h4>Estimated Cost</h4>
          <div class="decision-value">
            ~${decision.estimated_tokens.toLocaleString()} tokens
            (${decision.estimated_cost === 0 ? 'Free' : '$' + decision.estimated_cost.toFixed(4)})
          </div>
        </div>
        
        <div class="decision-actions">
          <button onclick="createTaskFromRouting('${encodeURIComponent(intent)}')" class="btn btn-primary">
            Create Task with This Routing
          </button>
          <button onclick="hideRoutingResult()" class="btn btn-secondary">
            Dismiss
          </button>
        </div>
      </div>
    `;
    
    // Mark routing as configured
    store.set('setup.routing.completed', true);
    
  } catch (err) {
    resultEl.innerHTML = `
      <div class="routing-error">
        <span class="error-icon">❌</span>
        <h4>Routing Failed</h4>
        <p>${err.message}</p>
        <button onclick="simulateRouting()" class="btn btn-secondary">Retry</button>
      </div>
    `;
  }
};

window.hideRoutingResult = function() {
  document.getElementById('routing-result').classList.add('hidden');
};

window.createTaskFromRouting = function(encodedIntent) {
  const intent = decodeURIComponent(encodedIntent);
  // Store intent for new task page
  localStorage.setItem('kdashx2-new-task-intent', intent);
  window.navigate('/tasks/new');
};

window.addRoutingRule = function() {
  const keyword = prompt('Enter keyword to match:');
  if (!keyword) return;
  
  const target = prompt('Enter target action:');
  if (!target) return;
  
  const rules = store.get('routingRules');
  rules.push({ keyword: keyword.toLowerCase(), target, priority: 100 });
  store.set('routingRules', rules);
  
  window.navigate('/routing');
};

window.deleteRoutingRule = function(index) {
  if (!confirm('Delete this rule?')) return;
  
  const rules = store.get('routingRules');
  rules.splice(index, 1);
  store.set('routingRules', rules);
  
  window.navigate('/routing');
};

window.updateRiskThreshold = function() {
  const threshold = document.getElementById('risk-threshold').value;
  store.set('setup.routing.data.defaultRiskThreshold', threshold);
};

window.updateFallbackEnabled = function() {
  const enabled = document.getElementById('fallback-enabled').checked;
  store.set('setup.routing.data.fallbackEnabled', enabled);
};
