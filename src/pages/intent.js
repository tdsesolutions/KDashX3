/**
 * Intent Page - Phase A MVP
 * 
 * User enters intent, gets routing analysis, then executes
 * Flow: Intent → Analyze & Route → Review Plan → Execute
 */

import { store } from '../lib/store.js';
import { routeTask } from '../llm/routingBrain.js';
import { createTask, dispatchTask } from '../lib/api.js';
import { API_BASE_URL } from '../lib/config.js';

export function renderIntent() {
  const hasOnlineNodes = store.hasConnectedNodes();
  const nodes = store.get('nodes') || [];
  const hasPairedNodes = nodes.length > 0;

  // If no nodes at all
  if (!hasPairedNodes) {
    return `
      <div class="intent-page">
        <header class="page-header">
          <div class="container">
            <h1>New Task</h1>
            <p class="text-muted">Create and execute AI-powered tasks</p>
          </div>
        </header>
        <main class="container">
          <div class="blocked-state card">
            <div class="blocked-icon">🔒</div>
            <h2>Add a Node First</h2>
            <p>You need to connect at least one node to create and run tasks.</p>
            <a href="#/nodes" class="btn btn-primary">Add Node</a>
          </div>
        </main>
      </div>
    `;
  }

  // If nodes exist but none online
  if (!hasOnlineNodes) {
    return `
      <div class="intent-page">
        <header class="page-header">
          <div class="container">
            <h1>New Task</h1>
            <p class="text-muted">Create and execute AI-powered tasks</p>
          </div>
        </header>
        <main class="container">
          <div class="blocked-state card">
            <div class="blocked-icon">⏳</div>
            <h2>Node Paired - Start Connector</h2>
            <p>Your node is registered but not online. Start the connector on your node to execute tasks.</p>
            <div class="blocked-actions">
              <a href="#/nodes" class="btn btn-primary">Go to Nodes</a>
              <button onclick="refreshNodeStatus()" class="btn btn-secondary">Refresh Status</button>
            </div>
          </div>
        </main>
      </div>
    `;
  }

  // Main intent form
  return `
    <div class="intent-page">
      <header class="page-header">
        <div class="container">
          <h1>New Task</h1>
          <p class="text-muted">Describe what you want to accomplish</p>
        </div>
      </header>
      
      <main class="container">
        <div class="intent-flow">
          <!-- Step 1: Intent Input -->
          <div id="intent-step-input" class="intent-step card">
            <h2>What do you want to do?</h2>
            <div class="form-group">
              <textarea 
                id="intent-text" 
                class="form-textarea intent-textarea" 
                placeholder="Describe your task in detail... e.g., Create a Python script that fetches weather data from OpenWeatherMap API and sends daily email summaries"
                rows="5"
              ></textarea>
              <p class="form-hint">Be specific about inputs, outputs, and any preferences.</p>
            </div>
            
            <div class="form-group">
              <label class="form-label">Priority</label>
              <select id="intent-priority" class="form-select">
                <option value="low">Low - Background task</option>
                <option value="normal" selected>Normal - Standard priority</option>
                <option value="high">High - Urgent</option>
                <option value="critical">Critical - Immediate attention</option>
              </select>
            </div>
            
            <div id="intent-error" class="alert alert-error hidden"></div>
            
            <div class="intent-actions">
              <button onclick="analyzeAndRoute()" class="btn btn-primary btn-large" id="analyze-btn">
                <span class="btn-icon">🧠</span>
                Analyze & Route
              </button>
              <a href="#/tasks" class="btn btn-secondary">Cancel</a>
            </div>
          </div>
          
          <!-- Step 2: Routing Analysis (hidden initially) -->
          <div id="intent-step-analysis" class="intent-step card hidden">
            <div class="analysis-loading" id="analysis-loading">
              <div class="spinner"></div>
              <h3>Analyzing your intent...</h3>
              <p class="text-muted">Matching against available capabilities and nodes</p>
            </div>
            
            <div id="analysis-result" class="hidden">
              <h2>Execution Plan</h2>
              
              <div class="plan-section">
                <h4>📋 Intent Summary</h4>
                <p id="plan-intent-text" class="plan-intent"></p>
              </div>
              
              <div class="plan-grid">
                <div class="plan-card">
                  <span class="plan-label">Selected Node</span>
                  <span id="plan-node-name" class="plan-value"></span>
                  <span id="plan-node-id" class="plan-detail"></span>
                </div>
                
                <div class="plan-card">
                  <span class="plan-label">Required Capabilities</span>
                  <div id="plan-capabilities" class="plan-tags"></div>
                </div>
                
                <div class="plan-card">
                  <span class="plan-label">Provider Preference</span>
                  <span id="plan-provider" class="plan-value"></span>
                </div>
                
                <div class="plan-card">
                  <span class="plan-label">Risk Level</span>
                  <span id="plan-risk" class="plan-value"></span>
                </div>
              </div>
              
              <div class="plan-section">
                <h4>💰 Cost Estimate</h4>
                <div class="cost-grid">
                  <div class="cost-item">
                    <span class="cost-label">Estimated Tokens</span>
                    <span id="plan-tokens" class="cost-value"></span>
                  </div>
                  <div class="cost-item">
                    <span class="cost-label">Estimated Cost</span>
                    <span id="plan-cost" class="cost-value"></span>
                  </div>
                </div>
              </div>
              
              <div class="plan-section" id="plan-approval-section">
                <div class="alert alert-warning">
                  <strong>⚠️ Approval Required</strong>
                  <p>This task has elevated risk and requires your approval to proceed.</p>
                </div>
              </div>
              
              <div id="execute-error" class="alert alert-error hidden"></div>
              
              <div class="intent-actions">
                <button onclick="executeTask()" class="btn btn-primary btn-large" id="execute-btn">
                  <span class="btn-icon">🚀</span>
                  Execute Task
                </button>
                <button onclick="backToIntent()" class="btn btn-secondary">Back</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `;
}

// Store routing decision temporarily during flow
let currentRoutingDecision = null;

window.analyzeAndRoute = async function() {
  const intentEl = document.getElementById('intent-text');
  const priorityEl = document.getElementById('intent-priority');
  const errorEl = document.getElementById('intent-error');
  const analyzeBtn = document.getElementById('analyze-btn');
  
  const intent = intentEl.value.trim();
  const priority = priorityEl.value;
  
  if (!intent) {
    errorEl.textContent = 'Please describe what you want to do';
    errorEl.classList.remove('hidden');
    return;
  }
  
  // Clear error
  errorEl.classList.add('hidden');
  
  // Get available nodes (online only)
  const nodes = store.get('nodes') || [];
  const onlineNodes = nodes.filter(n => n.online && n.status === 'connected');
  
  if (onlineNodes.length === 0) {
    errorEl.textContent = 'No online nodes available. Start your connector first.';
    errorEl.classList.remove('hidden');
    return;
  }
  
  // Show analysis step
  document.getElementById('intent-step-input').classList.add('hidden');
  document.getElementById('intent-step-analysis').classList.remove('hidden');
  document.getElementById('analysis-loading').classList.remove('hidden');
  document.getElementById('analysis-result').classList.add('hidden');
  
  try {
    // Call routing brain (stub with local capability matching)
    const routingInput = {
      intent,
      priority,
      context: {
        available_nodes: onlineNodes,
        configured_providers: [] // MVP: no provider config yet
      },
      constraints: {}
    };
    
    const routingDecision = await routeTask(routingInput);
    
    // Store for execution
    currentRoutingDecision = {
      ...routingDecision,
      intent,
      priority,
      analyzed_at: new Date().toISOString()
    };
    
    // Get selected node details
    const selectedNode = onlineNodes.find(n => n.id === routingDecision.selected_node_id);
    
    // Populate result
    document.getElementById('plan-intent-text').textContent = intent;
    document.getElementById('plan-node-name').textContent = selectedNode?.name || 'Unknown Node';
    document.getElementById('plan-node-id').textContent = routingDecision.selected_node_id;
    
    const capsContainer = document.getElementById('plan-capabilities');
    capsContainer.innerHTML = routingDecision.required_capabilities
      .map(c => `<span class="capability-tag">${c}</span>`)
      .join('');
    
    document.getElementById('plan-provider').textContent = routingDecision.provider_preference;
    document.getElementById('plan-risk').textContent = routingDecision.risk_level;
    document.getElementById('plan-tokens').textContent = routingDecision.estimated_tokens.toLocaleString();
    document.getElementById('plan-cost').textContent = `$${routingDecision.estimated_cost.toFixed(4)}`;
    
    // Show approval warning if needed
    const approvalSection = document.getElementById('plan-approval-section');
    if (routingDecision.approval_required) {
      approvalSection.classList.remove('hidden');
    } else {
      approvalSection.classList.add('hidden');
    }
    
    // Show result
    document.getElementById('analysis-loading').classList.add('hidden');
    document.getElementById('analysis-result').classList.remove('hidden');
    
  } catch (err) {
    document.getElementById('analysis-loading').classList.add('hidden');
    document.getElementById('intent-step-input').classList.remove('hidden');
    document.getElementById('intent-step-analysis').classList.add('hidden');
    errorEl.textContent = 'Routing failed: ' + err.message;
    errorEl.classList.remove('hidden');
  }
};

window.backToIntent = function() {
  document.getElementById('intent-step-input').classList.remove('hidden');
  document.getElementById('intent-step-analysis').classList.add('hidden');
  currentRoutingDecision = null;
};

window.executeTask = async function() {
  const executeBtn = document.getElementById('execute-btn');
  const errorEl = document.getElementById('execute-error');
  
  if (!currentRoutingDecision) {
    errorEl.textContent = 'No routing decision available. Please analyze again.';
    errorEl.classList.remove('hidden');
    return;
  }
  
  executeBtn.disabled = true;
  executeBtn.textContent = 'Creating Task...';
  errorEl.classList.add('hidden');
  
  try {
    // Step 1: Create task with routing decision
    const task = await createTask(
      currentRoutingDecision.intent,
      currentRoutingDecision.priority,
      currentRoutingDecision
    );
    
    // Step 2: Store routing decision
    // Note: Backend doesn't have endpoint to update routing_decision field directly
    // We'll store it in local state for now, and the dispatch will use it
    
    // Step 3: Dispatch to selected node
    await dispatchTask(task.id, currentRoutingDecision.selected_node_id);
    
    // Step 4: Navigate to execution page
    window.navigate(`/execution/${task.id}`);
    
  } catch (err) {
    executeBtn.disabled = false;
    executeBtn.innerHTML = '<span class="btn-icon">🚀</span> Execute Task';
    errorEl.textContent = 'Execution failed: ' + err.message;
    errorEl.classList.remove('hidden');
  }
};

window.refreshNodeStatus = async function() {
  await store.syncNodes();
  window.navigate('/intent');
};
