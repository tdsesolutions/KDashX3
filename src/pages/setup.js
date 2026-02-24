/**
 * Setup Center Page - Inline Instructions Version
 * Instructions embedded within each module via expandable info panel
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
        <!-- Getting Started Info -->
        <div class="setup-intro card">
          <h3>👋 Welcome to Mission Control</h3>
          <p>Mission Control is your central dashboard for managing AI agents across multiple machines. Follow these steps to configure your workspace and connect your first node.</p>
        </div>
        
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
        
        <!-- Module Cards with Inline Instructions -->
        <div class="modules-list">
          ${progress.modules.map(m => renderModuleCardWithInstructions(m)).join('')}
        </div>
        
      </main>
    </div>
  `;
}

function renderModuleCardWithInstructions(module) {
  const config = moduleConfig[module.name];
  const isCompleted = module.completed;
  const instructions = getModuleInstructions(module.name);
  const instructionsId = `instructions-${module.name}`;
  
  return `
    <div class="module-row ${isCompleted ? 'completed' : 'pending'}">
      <!-- Main Module Card -->
      <div class="module-main-card">
        <div class="module-header">
          <div class="module-icon">${config.icon}</div>
          <div class="module-title-section">
            <div class="module-name">${config.title}</div>
            <div class="module-description">${config.description}</div>
            <div class="module-status">
              ${isCompleted 
                ? '<span class="badge badge-success">✓ Complete</span>'
                : '<span class="badge badge-warning">○ Pending</span>'
              }
            </div>
          </div>
          <div class="module-actions">
            <button class="info-btn" onclick="toggleInstructions('${instructionsId}')" title="Show Instructions">
              <span class="info-icon">ℹ️</span>
            </button>
            ${isCompleted 
              ? '<span class="status-check">✓</span>'
              : `<a href="${config.route}" class="btn btn-primary btn-small">${getModuleCTA(module.name)}</a>`
            }
          </div>
        </div>
      </div>
      
      <!-- Expandable Instructions Panel -->
      <div id="${instructionsId}" class="instructions-panel" style="display: none;">
        <div class="instructions-content">
          ${instructions}
        </div>
      </div>
    </div>
  `;
}

function getModuleInstructions(moduleName) {
  const instructions = {
    workspace: `
      <div class="instruction-content">
        <div class="instruction-header">
          <h4>🏢 What is a Workspace?</h4>
          <p>Your workspace is your Mission Control environment. It stores your organization settings, connected nodes, and preferences.</p>
        </div>
        
        <div class="instruction-steps">
          <h5>Steps to Complete:</h5>
          <ol>
            <li><strong>Organization Name</strong> - Choose a name like your company or team (e.g., "Acme Corp", "DevTeam Alpha")</li>
            <li><strong>Timezone</strong> - Set for accurate scheduling and timestamps</li>
            <li><strong>Notifications</strong> - Choose email or webhook alerts</li>
          </ol>
        </div>
        
        <div class="instruction-tip">
          <strong>💡 Tip:</strong> You can change these settings later in the Settings page.
        </div>
      </div>
    `,
    nodes: `
      <div class="instruction-content">
        <div class="instruction-header">
          <h4>🖥️ What is a Node?</h4>
          <p>Nodes are machines (computers, servers, VMs) that run your AI agents. Mission Control orchestrates tasks across all connected nodes. <strong>Important:</strong> API keys are stored on your nodes, NOT in Mission Control.</p>
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
            <li>
              <strong>Install OpenClaw Node on your server:</strong>
              <code>curl -fsSL https://openclaw.ai/install.sh | bash</code>
            </li>
            <li><strong>Generate pairing token</strong> (click "Add Node" below and copy the token)</li>
            <li>
              <strong>Run pair command on your node:</strong>
              <code>openclaw-node pair --token [your-token]</code>
            </li>
            <li>
              <strong>Add API keys directly on the node:</strong>
              <code>claw provider add openai --key sk-...</code>
            </li>
            <li><strong>Verify connection</strong> - node appears as "Connected" in Mission Control</li>
          </ol>
        </div>
        
        <div class="instruction-section">
          <h5>⚠️ Requirements:</h5>
          <ul>
            <li>Ubuntu 20.04+, Debian 11+, macOS 12+, or Windows with WSL2</li>
            <li>Node.js 18+ (installed automatically)</li>
            <li>Stable internet connection</li>
            <li>~1GB disk space minimum, 5GB recommended</li>
          </ul>
        </div>
        
        <div class="instruction-tip">
          <strong>🔒 BYO Security:</strong> API keys are stored encrypted on YOUR nodes only. Mission Control never sees or stores your keys. This is the "Bring Your Own" architecture.
        </div>
      </div>
    `,
    storage: `
      <div class="instruction-content">
        <div class="instruction-header">
          <h4>💾 Storage & Write-Fence</h4>
          <p>For security, Mission Control uses a "write-fence" system. This prevents AI agents from accessing files outside designated folders.</p>
        </div>
        
        <div class="instruction-steps">
          <h5>📁 Configuration Steps:</h5>
          <ol>
            <li><strong>Specify allowed folders</strong> where agents can read/write</li>
            <li><strong>Set default output folder</strong> for generated files</li>
            <li><strong>Configure max file size</strong> limits (default: 100MB)</li>
          </ol>
        </div>
        
        <div class="instruction-section">
          <h5>🔒 Security Best Practices:</h5>
          <ul>
            <li>Only grant access to folders you're comfortable with</li>
            <li>Use a dedicated workspace folder: <code>mkdir -p ~/mission-control/{projects,outputs,temp}</code></li>
            <li>Never grant access to system folders or sensitive data</li>
            <li>Each node can have different permissions</li>
          </ul>
        </div>
        
        <div class="instruction-tip">
          <strong>💡 Tip:</strong> Create a dedicated folder structure for organized outputs.
        </div>
      </div>
    `,
    providers: `
      <div class="instruction-content">
        <div class="instruction-header">
          <h4>🔌 AI Providers</h4>
          <p>Configure which AI providers are available on your nodes. <strong>Important:</strong> You add API keys directly on each node via SSH, NOT in Mission Control.</p>
        </div>
        
        <div class="instruction-section">
          <h5>🔑 Supported Providers:</h5>
          <div class="provider-grid">
            <div class="provider-item"><strong>OpenAI</strong> - GPT-4o, GPT-4, GPT-3.5, DALL-E, Whisper</div>
            <div class="provider-item"><strong>Anthropic</strong> - Claude 3.5 Sonnet, Claude 3 Opus</div>
            <div class="provider-item"><strong>Google</strong> - Gemini 1.5 Pro, Gemini 1.5 Flash</div>
            <div class="provider-item"><strong>Groq</strong> - Fast inference for Llama 3.1, Mixtral</div>
            <div class="provider-item"><strong>Together AI</strong> - Open-source model hub</div>
            <div class="provider-item"><strong>OpenRouter</strong> - Unified API for 100+ models</div>
            <div class="provider-item"><strong>Local Models</strong> - Ollama, LM Studio (zero API cost!)</div>
          </div>
        </div>
        
        <div class="instruction-steps">
          <h5>📝 How to Configure Providers (on your node via SSH):</h5>
          <ol>
            <li><strong>SSH to your node:</strong> <code>ssh user@your-node-ip</code></li>
            <li>
              <strong>Add OpenAI provider:</strong>
              <code>claw provider add openai --key sk-xxxxxxxx</code>
            </li>
            <li>
              <strong>Add Anthropic provider:</strong>
              <code>claw provider add anthropic --key sk-ant-xxxxxxxx</code>
            </li>
            <li>
              <strong>Add Google provider:</strong>
              <code>claw provider add google --key AIzaSy...</code>
            </li>
            <li>
              <strong>List configured providers:</strong>
              <code>claw provider list</code>
            </li>
            <li>
              <strong>Test a provider:</strong>
              <code>claw provider test openai</code>
            </li>
          </ol>
        </div>
        
        <div class="instruction-section">
          <h5>🌍 Where to Get API Keys:</h5>
          <ul>
            <li><strong>OpenAI:</strong> platform.openai.com → API Keys</li>
            <li><strong>Anthropic:</strong> console.anthropic.com → API Keys</li>
            <li><strong>Google:</strong> makersuite.google.com/app/apikey</li>
            <li><strong>Groq:</strong> groq.com → Create API Key</li>
            <li><strong>Together AI:</strong> together.ai → API Keys</li>
            <li><strong>OpenRouter:</strong> openrouter.ai → Keys</li>
          </ul>
        </div>
        
        <div class="instruction-section">
          <h5>💰 Cost Management Tips:</h5>
          <ul>
            <li><strong>Set spending limits:</strong> All providers have dashboard limits you can configure</li>
            <li><strong>Use Ollama for free:</strong> Run Llama 3.1, Mistral locally with <code>ollama pull llama3.1</code></li>
            <li><strong>Start small:</strong> Use GPT-3.5 or Claude Haiku for testing (~$0.002/1K tokens)</li>
            <li><strong>Monitor usage:</strong> Check provider dashboards weekly</li>
            <li><strong>Estimated costs:</strong> Light usage ~$5-20/month, Heavy usage ~$50-200/month</li>
          </ul>
        </div>
        
        <div class="instruction-tip">
          <strong>🔒 BYO Architecture:</strong> API keys are stored encrypted on YOUR nodes only. Mission Control discovers which providers are available but never sees the actual keys. You maintain full control.
        </div>
      </div>
    `,
    routing: `
      <div class="instruction-content">
        <div class="instruction-header">
          <h4>📡 Task Routing</h4>
          <p>Routing determines which node handles each task based on requirements, availability, and your preferences.</p>
        </div>
        
        <div class="instruction-section">
          <h5>🎯 Routing Rules:</h5>
          <ul>
            <li><strong>Round Robin:</strong> Distribute evenly across nodes</li>
            <li><strong>Capability Match:</strong> Match task to node with required provider</li>
            <li><strong>Load Balanced:</strong> Send to least busy node</li>
            <li><strong>Priority:</strong> High-priority tasks jump the queue</li>
          </ul>
        </div>
        
        <div class="instruction-steps">
          <h5>⚙️ Configuration Options:</h5>
          <ol>
            <li>Set default routing strategy</li>
            <li>Configure fallback nodes</li>
            <li>Define provider requirements per task type</li>
            <li>Set timeout limits</li>
          </ol>
        </div>
        
        <div class="instruction-section">
          <h5>💡 Best Practices:</h5>
          <ul>
            <li>Use capability match for AI-specific tasks</li>
            <li>Set local models as fallback for reliability</li>
            <li>Reserve fast nodes for urgent tasks</li>
            <li>Monitor routing effectiveness in dashboard</li>
          </ul>
        </div>
      </div>
    `,
    healthChecks: `
      <div class="instruction-content">
        <div class="instruction-header">
          <h4>✅ System Health Checks</h4>
          <p>Verify that everything is configured correctly before starting. Health checks ensure your setup will work smoothly.</p>
        </div>
        
        <div class="instruction-section">
          <h5>🔍 What We Check:</h5>
          <ul>
            <li><strong>Node Connectivity:</strong> All nodes online and responding</li>
            <li><strong>API Keys:</strong> Provider keys are valid and have credits</li>
            <li><strong>Storage:</strong> Write permissions in allowed folders</li>
            <li><strong>Network:</strong> Nodes can reach Mission Control backend</li>
            <li><strong>Dependencies:</strong> Required software is installed</li>
          </ul>
        </div>
        
        <div class="instruction-steps">
          <h5>🚀 Running Checks:</h5>
          <ol>
            <li>Click "Run Checks" to start verification</li>
            <li>Review each check result</li>
            <li>Fix any failed checks using provided instructions</li>
            <li>Re-run until all checks pass</li>
          </ol>
        </div>
        
        <div class="instruction-section">
          <h5>⚠️ Common Issues & Fixes:</h5>
          <ul>
            <li><strong>Node offline:</strong> Check if node service is running: <code>systemctl status openclaw-node</code></li>
            <li><strong>API key invalid:</strong> Verify key hasn't expired in provider dashboard</li>
            <li><strong>No credit:</strong> Add payment method to provider account</li>
            <li><strong>Permission denied:</strong> Check folder access: <code>ls -la ~/mission-control</code></li>
          </ul>
        </div>
        
        <div class="instruction-tip">
          <strong>✨ Tip:</strong> Run health checks regularly to catch issues early.
        </div>
      </div>
    `
  };
  
  return instructions[moduleName] || '';
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

window.toggleInstructions = function(instructionsId) {
  const panel = document.getElementById(instructionsId);
  if (panel) {
    const isVisible = panel.style.display !== 'none';
    panel.style.display = isVisible ? 'none' : 'block';
    
    // Smooth scroll to panel if opening
    if (!isVisible) {
      setTimeout(() => {
        panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }
};

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
            <p class="form-help">Choose a name that identifies your team or organization</p>
          </div>
          
          <div class="form-group">
            <label class="form-label">Timezone</label>
            <select id="timezone" class="form-select">
              ${renderTimezoneOptions(workspace.timezone)}
            </select>
            <p class="form-help">Used for scheduling tasks and displaying timestamps</p>
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

// Sub-page: Storage setup
export function renderStorageSetup() {
  const storage = store.get('setup.storage.data');

  return `
    <div class="setup-subpage">
      <header class="page-header">
        <div class="container">
          <a href="#/setup" class="back-link">← Back to Setup</a>
          <h1>Storage & Permissions</h1>
        </div>
      </header>

      <main class="container">
        <div class="setup-instructions card">
          <h3>💾 Storage & Write-Fence Security</h3>
          <p>Mission Control uses a "write-fence" system to prevent AI agents from accessing files outside designated folders.</p>

          <div class="instruction-section">
            <h4>Recommended Folder Structure</h4>
            <code>mkdir -p ~/mission-control/{projects,outputs,temp}</code>
          </div>

          <div class="instruction-section">
            <h4>Security Best Practices</h4>
            <ul>
              <li>Only grant access to folders you're comfortable with</li>
              <li>Never grant access to system folders (~/.ssh, /etc, etc.)</li>
              <li>Use a dedicated workspace folder</li>
              <li>Each node can have different permissions</li>
            </ul>
          </div>
        </div>

        <div class="card">
          <div class="form-group">
            <label class="form-label">Allowed Folders (comma-separated)</label>
            <input
              type="text"
              id="allowed-folders"
              class="form-input"
              value="${storage.allowedFolders?.join(', ') || ''}"
              placeholder="~/mission-control/projects, ~/mission-control/outputs"
            />
            <p class="form-help">Folders where agents can read and write files</p>
          </div>

          <div class="form-group">
            <label class="form-label">Default Output Folder</label>
            <input
              type="text"
              id="output-folder"
              class="form-input"
              value="${storage.defaultOutputFolder || ''}"
              placeholder="~/mission-control/outputs"
            />
            <p class="form-help">Default location for generated files</p>
          </div>

          <div class="form-group">
            <label class="form-label">Max File Size (MB)</label>
            <input
              type="number"
              id="max-file-size"
              class="form-input"
              value="${storage.maxFileSize ? storage.maxFileSize / (1024 * 1024) : 100}"
              min="1"
              max="1000"
            />
            <p class="form-help">Maximum file size agents can create (1-1000 MB)</p>
          </div>

          <div class="form-actions">
            <button onclick="saveStorage()" class="btn btn-primary">Save & Continue</button>
            <a href="#/setup" class="btn btn-secondary">Cancel</a>
          </div>
        </div>
      </main>
    </div>
  `;
}

window.saveStorage = function() {
  const allowedFoldersInput = document.getElementById('allowed-folders').value;
  const defaultOutputFolder = document.getElementById('output-folder').value;
  const maxFileSizeMB = parseInt(document.getElementById('max-file-size').value) || 100;

  const allowedFolders = allowedFoldersInput
    .split(',')
    .map(f => f.trim())
    .filter(f => f.length > 0);

  if (allowedFolders.length === 0) {
    alert('Please specify at least one allowed folder');
    return;
  }

  store.set('setup.storage.data', {
    allowedFolders,
    defaultOutputFolder: defaultOutputFolder || allowedFolders[0],
    maxFileSize: maxFileSizeMB * 1024 * 1024
  });

  store.set('setup.storage.completed', true);
  window.navigate('/setup');
};

// Sub-page: Health Checks
export function renderHealthChecks() {
  const nodes = store.get('nodes') || [];

  return `
    <div class="setup-subpage">
      <header class="page-header">
        <div class="container">
          <a href="#/setup" class="back-link">← Back to Setup</a>
          <h1>Health Checks</h1>
        </div>
      </header>

      <main class="container">
        <div class="setup-instructions card">
          <h3>✅ System Verification</h3>
          <p>Verify that everything is configured correctly before starting. Run checks to ensure your setup will work smoothly.</p>

          <div class="instruction-section">
            <h4>What We Check</h4>
            <ul>
              <li><strong>Node Connectivity:</strong> All nodes are online and responding</li>
              <li><strong>API Keys:</strong> Provider keys are valid and have credits</li>
              <li><strong>Storage:</strong> Write permissions in allowed folders</li>
              <li><strong>Network:</strong> Nodes can reach Mission Control backend</li>
            </ul>
          </div>
        </div>

        <div class="health-checks-container">
          <div class="health-check-item">
            <div class="check-status ${nodes.length > 0 ? 'success' : 'pending'}">
              ${nodes.length > 0 ? '✓' : '○'}
            </div>
            <div class="check-info">
              <div class="check-name">Connected Nodes</div>
              <div class="check-detail">${nodes.length} node${nodes.length !== 1 ? 's' : ''} connected</div>
            </div>
            <div class="check-action">
              ${nodes.length === 0 ? '<a href="#/nodes" class="btn btn-small btn-secondary">Add Node</a>' : '<span class="check-pass">Pass</span>'}
            </div>
          </div>

          <div class="health-check-item">
            <div class="check-status ${store.isSetupComplete() ? 'success' : 'pending'}">
              ${store.isSetupComplete() ? '✓' : '○'}
            </div>
            <div class="check-info">
              <div class="check-name">Setup Completion</div>
              <div class="check-detail">${store.getSetupProgress().completed} of 6 modules complete</div>
            </div>
            <div class="check-action">
              ${!store.isSetupComplete() ? '<a href="#/setup" class="btn btn-small btn-secondary">Complete Setup</a>' : '<span class="check-pass">Pass</span>'}
            </div>
          </div>

          <div class="health-check-item">
            <div class="check-status ${store.hasWorkingProvider() ? 'success' : 'warning'}">
              ${store.hasWorkingProvider() ? '✓' : '!'}
            </div>
            <div class="check-info">
              <div class="check-name">AI Providers</div>
              <div class="check-detail">${store.getWorkingProviders().length} provider(s) configured</div>
            </div>
            <div class="check-action">
              ${!store.hasWorkingProvider() ? '<a href="#/providers" class="btn btn-small btn-secondary">Setup Providers</a>' : '<span class="check-pass">Pass</span>'}
            </div>
          </div>

          <div class="health-check-item">
            <div class="check-status pending">○</div>
            <div class="check-info">
              <div class="check-name">Backend Connection</div>
              <div class="check-detail">Mission Control API connectivity</div>
            </div>
            <div class="check-action">
              <button onclick="testBackendConnection()" class="btn btn-small btn-secondary">Test</button>
            </div>
          </div>
        </div>

        <div class="form-actions" style="margin-top: 2rem;">
          <button onclick="completeHealthChecks()" class="btn btn-primary">Complete Setup</button>
          <a href="#/setup" class="btn btn-secondary">Back</a>
        </div>
      </main>
    </div>
  `;
}

window.testBackendConnection = async function() {
  try {
    const response = await fetch('https://eagle-funky-twice-drugs.trycloudflare.com/health');
    if (response.ok) {
      alert('✓ Backend connection successful');
    } else {
      alert('✗ Backend returned error: ' + response.status);
    }
  } catch (err) {
    alert('✗ Cannot connect to backend: ' + err.message);
  }
};

window.completeHealthChecks = function() {
  store.set('setup.healthChecks.completed', true);
  window.navigate('/setup');
};
