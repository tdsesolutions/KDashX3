(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))n(o);new MutationObserver(o=>{for(const a of o)if(a.type==="childList")for(const r of a.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&n(r)}).observe(document,{childList:!0,subtree:!0});function s(o){const a={};return o.integrity&&(a.integrity=o.integrity),o.referrerPolicy&&(a.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?a.credentials="include":o.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function n(o){if(o.ep)return;o.ep=!0;const a=s(o);fetch(o.href,a)}})();const x="https://instance-2026clawbot-vm0210-142930.tail0f5b68.ts.net";function F(){return localStorage.getItem("kdashx3-token")}async function u(e,t={}){const s=`${x}${e}`,n=F(),o={"Content-Type":"application/json",...t.headers};n&&(o.Authorization=`Bearer ${n}`);const a=await fetch(s,{...t,headers:o});if(!a.ok){const r=await a.json().catch(()=>({error:"Unknown error"}));throw new Error(r.error||`HTTP ${a.status}`)}return a.json()}async function q(e,t){return u("/auth/register",{method:"POST",body:JSON.stringify({email:e,password:t})})}async function U(e,t){return u("/auth/login",{method:"POST",body:JSON.stringify({email:e,password:t})})}async function G(){return u("/pairing-tokens",{method:"POST"})}async function H(){return u("/nodes")}async function j(){return u("/tasks")}async function M(e,t="normal"){return u("/tasks",{method:"POST",body:JSON.stringify({intent:e,priority:t})})}async function D(e,t){return u(`/tasks/${e}/dispatch`,{method:"POST",body:JSON.stringify({node_id:t})})}async function O(e){return u(`/tasks/${e}/events`)}async function K(e){return u(`/nodes/${e}/disconnect`,{method:"POST"})}async function z(e){return u(`/nodes/${e}`,{method:"DELETE"})}class Y{constructor(){this.state=this.loadFromCache(),this.listeners=new Set,this.syncInterval=null}subscribe(t){return this.listeners.add(t),()=>this.listeners.delete(t)}notify(t){this.listeners.forEach(s=>s(this.state,t))}get(t=null){return t?t.split(".").reduce((s,n)=>s==null?void 0:s[n],this.state):{...this.state}}set(t,s){const n=t.split("."),o={...this.state};let a=o;for(let r=0;r<n.length-1;r++)a[n[r]]={...a[n[r]]},a=a[n[r]];a[n[n.length-1]]=s,this.state=o,this.persistToCache(),this.notify(t)}loadFromCache(){try{const t=localStorage.getItem("kdashx3-store");if(t)return JSON.parse(t)}catch(t){console.warn("Failed to load from cache:",t)}return{auth:{isAuthenticated:!1,token:null,user:null},workspace:null,nodes:[],providers:[],tasks:[],setup:{workspace:{completed:!1,data:{}},nodes:{completed:!1,data:{}},storage:{completed:!1,data:{}},providers:{completed:!1,data:{}},routing:{completed:!1,data:{}},healthChecks:{completed:!1,data:{}}},ui:{loading:{},errors:{}}}}persistToCache(){try{localStorage.setItem("kdashx3-store",JSON.stringify(this.state))}catch(t){console.warn("Failed to persist to cache:",t)}}async login(t,s){const n=await U(t,s);return localStorage.setItem("kdashx3-token",n.token),this.set("auth",{isAuthenticated:!0,token:n.token,user:n.user}),this.set("workspace",n.workspace),n}async register(t,s){const n=await q(t,s);return localStorage.setItem("kdashx3-token",n.token),this.set("auth",{isAuthenticated:!0,token:n.token,user:n.user}),this.set("workspace",n.workspace),n}logout(){localStorage.removeItem("kdashx3-token"),localStorage.removeItem("kdashx3-store"),this.state=this.loadFromCache(),this.notify("logout")}async syncNodes(){try{const t=await H();return this.set("nodes",t),t}catch(t){return console.error("Failed to sync nodes:",t),[]}}async syncTasks(){try{const t=await j();return this.set("tasks",t),t}catch(t){return console.error("Failed to sync tasks:",t),[]}}hasNodes(){return this.state.nodes.length>0}hasConnectedNodes(){return this.state.nodes.some(t=>t.online&&t.status==="connected")}getConnectedNodes(){return this.state.nodes.filter(t=>t.online&&t.status==="connected")}isSetupComplete(){return this.state.workspace&&this.state.nodes.length>0}hasWorkingProvider(){return this.state.providers&&this.state.providers.some(t=>t.status==="configured")}getWorkingProviders(){return this.state.providers?this.state.providers.filter(t=>t.status==="configured"):[]}getBlocks(){const t=[];return this.hasNodes()?this.hasConnectedNodes()||t.push({id:"NODE_OFFLINE",message:"Node paired. Start the connector on your node to go online.",cta:{text:"Go to Nodes",href:"#/nodes"}}):t.push({id:"NODE_REQUIRED",message:"Connect at least one node to execute tasks",cta:{text:"Add Node",href:"#/nodes"}}),this.hasWorkingProvider()||t.push({id:"PROVIDER_REQUIRED",message:"Configure at least one provider to use AI features",cta:{text:"Configure Providers",href:"#/providers"}}),t}getSetupProgress(){const t=["workspace","nodes","storage","providers","routing","healthChecks"],s=this.state.setup||{},n=this.hasConnectedNodes(),o=t.filter(a=>{var r;return a==="nodes"?n:(r=s[a])==null?void 0:r.completed}).length;return{completed:o,total:t.length,percentage:Math.round(o/t.length*100),modules:t.map(a=>{var r;return{name:a,completed:a==="nodes"?n:((r=s[a])==null?void 0:r.completed)||!1,label:this.getModuleLabel(a)}})}}getModuleLabel(t){return{workspace:"Workspace",nodes:"Nodes",storage:"Storage & Permissions",providers:"Providers",routing:"Routing Rules",healthChecks:"Health Checks"}[t]||t}}const i=new Y;function V(){return`
    <div class="login-page">
      <div class="login-container card">
        <div class="login-brand">
          <img src="assets/brand/KDashX3.png" alt="KDashX3" class="login-logo">
          <div class="login-header-text">
            <h1>KDashX3</h1>
            <p>Mission Control</p>
          </div>
        </div>
        
        <div class="login-tabs">
          <button class="tab-btn active" onclick="showTab('signin')" id="tab-signin">Sign In</button>
          <button class="tab-btn" onclick="showTab('signup')" id="tab-signup">Sign Up</button>
        </div>
        
        <!-- Sign In Form -->
        <div id="signin-panel" class="login-panel active">
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" id="login-email" class="form-input" placeholder="you@example.com" />
          </div>
          
          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" id="login-password" class="form-input" placeholder="••••••••" />
          </div>
          
          <div id="login-error" class="form-error hidden"></div>
          
          <button onclick="handleLogin()" class="btn btn-primary btn-full" id="login-btn">
            Sign In
          </button>
        </div>
        
        <!-- Sign Up Form -->
        <div id="signup-panel" class="login-panel hidden">
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" id="register-email" class="form-input" placeholder="you@example.com" />
          </div>
          
          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" id="register-password" class="form-input" placeholder="••••••••" />
          </div>
          
          <div id="register-error" class="form-error hidden"></div>
          
          <button onclick="handleRegister()" class="btn btn-primary btn-full" id="register-btn">
            Create Account
          </button>
        </div>
        
        <div class="login-info">
          <p class="powered-by">
            powered by TDS E Solutions
          </p>
        </div>
      </div>
    </div>
  `}window.showTab=function(e){document.querySelectorAll(".tab-btn").forEach(s=>s.classList.remove("active")),document.querySelectorAll(".login-panel").forEach(s=>s.classList.remove("active")),document.querySelectorAll(".login-panel").forEach(s=>s.classList.add("hidden")),document.getElementById(`tab-${e}`).classList.add("active");const t=document.getElementById(`${e}-panel`);t.classList.remove("hidden"),t.classList.add("active")};window.handleLogin=async function(){const e=document.getElementById("login-email").value,t=document.getElementById("login-password").value,s=document.getElementById("login-error"),n=document.getElementById("login-btn");if(!e||!t){s.textContent="Please enter email and password",s.classList.remove("hidden");return}n.disabled=!0,n.textContent="Signing in...";try{await i.login(e,t),window.navigate("/dashboard")}catch(o){s.textContent=o.message||"Login failed",s.classList.remove("hidden"),n.disabled=!1,n.textContent="Sign In"}};window.handleRegister=async function(){const e=document.getElementById("register-email").value,t=document.getElementById("register-password").value,s=document.getElementById("register-error"),n=document.getElementById("register-btn");if(!e||!t){s.textContent="Please enter email and password",s.classList.remove("hidden");return}if(t.length<6){s.textContent="Password must be at least 6 characters",s.classList.remove("hidden");return}n.disabled=!0,n.textContent="Creating account...";try{await i.register(e,t),window.navigate("/dashboard")}catch(o){s.textContent=o.message||"Registration failed",s.classList.remove("hidden"),n.disabled=!1,n.textContent="Create Account"}};const X={workspace:{icon:"🏢",title:"Workspace",description:"Organization name and preferences",route:"#/setup/workspace"},nodes:{icon:"🖥️",title:"Nodes",description:"Add and connect compute nodes",route:"#/nodes"},storage:{icon:"💾",title:"Storage & Permissions",description:"Configure allowed folders and write-fence",route:"#/setup/storage"},providers:{icon:"🔌",title:"Providers",description:"Configure LLM providers on nodes",route:"#/providers"},routing:{icon:"📡",title:"Routing Defaults",description:"Set routing rules and preferences",route:"#/routing"},healthChecks:{icon:"✅",title:"Health Checks",description:"Verify system readiness",route:"#/setup/health"}};function Q(){const e=i.getSetupProgress(),t=i.get("nodes")||[],s=t.length>0,n=t.some(a=>a.online&&a.status==="connected"),o=e.modules.map(a=>a.name==="nodes"?{...a,completed:n,hasNodes:s,isOnline:n}:a);return`
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
              <p class="text-muted">${e.completed} of ${e.total} modules completed</p>
            </div>
            <div class="setup-progress-percentage">
              <span class="progress-number">${e.percentage}%</span>
            </div>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${e.percentage}%"></div>
          </div>
          ${e.percentage===100?`
            <div class="setup-complete-banner">
              <span class="complete-icon">🎉</span>
              <span>Setup complete! You can now use Mission Control.</span>
              <a href="#/dashboard" class="btn btn-primary btn-small">Go to Dashboard</a>
            </div>
          `:""}
        </div>
        
        <!-- Module Cards with Inline Instructions -->
        <div class="modules-list">
          ${o.map(a=>Z(a)).join("")}
        </div>

      </main>

      ${J()}
    </div>
  `}function J(){return`
    <div id="setup-node-info-modal" class="modal hidden">
      <div class="modal-overlay" onclick="hideSetupNodeInfoModal()"></div>
      <div class="modal-content" style="max-width: 700px; max-height: 80vh; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h2>What is a Node?</h2>
          <button onclick="hideSetupNodeInfoModal()" class="btn btn-small btn-secondary">✕</button>
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
              <li><strong>Click "Add Node"</strong> to generate a pairing token for your workspace</li>
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
          <button onclick="hideSetupNodeInfoModal(); goToNodesAndAdd();" class="btn btn-primary">Add Node Now</button>
          <button onclick="hideSetupNodeInfoModal()" class="btn btn-secondary">Close</button>
        </div>
      </div>
    </div>
  `}function Z(e){const t=X[e.name],s=e.completed,n=ee(e.name),o=`instructions-${e.name}`;let a;return e.name==="nodes"?e.isOnline?a='<span class="badge badge-success">✓ Complete</span>':e.hasNodes?a='<span class="badge badge-warning">○ Paired (waiting for heartbeat)</span>':a='<span class="badge badge-warning">○ Pending</span>':a=s?'<span class="badge badge-success">✓ Complete</span>':'<span class="badge badge-warning">○ Pending</span>',`
    <div class="module-row ${s?"completed":"pending"}">
      <!-- Main Module Card -->
      <div class="module-main-card">
        <div class="module-header">
          <div class="module-icon">${t.icon}</div>
          <div class="module-title-section">
            <div class="module-name">${t.title}</div>
            <div class="module-description">${t.description}</div>
            <div class="module-status">
              ${a}
            </div>
          </div>
          <div class="module-actions">
            ${e.name==="nodes"?`
              <button class="info-btn" onclick="showSetupNodeInfoModal()" title="What is a Node?">
                <span class="info-icon">ℹ️</span>
              </button>
            `:e.name!=="routing"&&e.name!=="providers"?`
              <button class="info-btn" onclick="toggleInstructions('${o}')" title="Show Instructions">
                <span class="info-icon">ℹ️</span>
              </button>
            `:""}
            ${s?'<span class="status-check">✓</span>':e.name==="nodes"?`<button onclick="goToNodesAndAdd()" class="btn btn-primary btn-small">${N(e.name)}</button>`:e.name==="routing"||e.name==="providers"?`<button onclick="showInstructionsForModule('${e.name}')" class="btn btn-primary btn-small">${N(e.name)}</button>`:`<a href="${t.route}" class="btn btn-primary btn-small">${N(e.name)}</a>`}
          </div>
        </div>
      </div>
      
      <!-- Expandable Instructions Panel (not for nodes - uses modal instead) -->
      ${e.name!=="nodes"?`
      <div id="${o}" class="instructions-panel" style="display: none;">
        <div class="instructions-content">
          ${n}
        </div>
      </div>
      `:""}
    </div>
  `}function ee(e){return{workspace:`
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
    `,nodes:`
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
    `,storage:`
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
    `,providers:`
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
    `,routing:`
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
    `,healthChecks:`
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
    `}[e]||""}function N(e){return{workspace:"Create",nodes:"Add Node",storage:"Configure",providers:"Setup",routing:"Configure",healthChecks:"Run Checks"}[e]||"Start"}window.toggleInstructions=function(e){const t=document.getElementById(e);if(t){const s=t.style.display!=="none";t.style.display=s?"none":"block",s||setTimeout(()=>{t.scrollIntoView({behavior:"smooth",block:"nearest"})},100)}};window.showInstructionsForModule=function(e){const t=`instructions-${e}`,s=document.getElementById(t);s&&(s.style.display="block",setTimeout(()=>{s.scrollIntoView({behavior:"smooth",block:"center"})},100))};function te(){var t,s;const e=i.get("setup.workspace.data")||{orgName:"",timezone:"UTC",notifications:{email:!0,webhook:!1}};return`
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
              value="${e.orgName||""}"
              placeholder="My Organization"
            />
            <p class="form-help">Choose a name that identifies your team or organization</p>
          </div>
          
          <div class="form-group">
            <label class="form-label">Timezone</label>
            <select id="timezone" class="form-select">
              ${se(e.timezone)}
            </select>
            <p class="form-help">Used for scheduling tasks and displaying timestamps</p>
          </div>
          
          <div class="form-group">
            <label class="form-label">Notifications</label>
            <div class="checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" id="notify-email" ${(t=e.notifications)!=null&&t.email?"checked":""} />
                Email notifications
              </label>
              <label class="checkbox-label">
                <input type="checkbox" id="notify-webhook" ${(s=e.notifications)!=null&&s.webhook?"checked":""} />
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
  `}function se(e){return[{value:"UTC",label:"UTC (Coordinated Universal Time)"},{value:"America/New_York",label:"Eastern Time (ET)"},{value:"America/Chicago",label:"Central Time (CT)"},{value:"America/Denver",label:"Mountain Time (MT)"},{value:"America/Los_Angeles",label:"Pacific Time (PT)"},{value:"Europe/London",label:"London (GMT)"},{value:"Europe/Paris",label:"Paris (CET)"},{value:"Asia/Tokyo",label:"Tokyo (JST)"}].map(s=>`<option value="${s.value}" ${s.value===e?"selected":""}>${s.label}</option>`).join("")}window.saveWorkspace=function(){const e=document.getElementById("org-name").value,t=document.getElementById("timezone").value,s=document.getElementById("notify-email").checked,n=document.getElementById("notify-webhook").checked;if(!e.trim()){alert("Please enter an organization name");return}i.set("setup.workspace.data",{orgName:e.trim(),timezone:t,notifications:{email:s,webhook:n}}),i.set("setup.workspace.completed",!0),window.navigate("/setup")};function ne(){var t;const e=i.get("setup.storage.data")||{allowedFolders:[],defaultOutputFolder:"",maxFileSize:104857600};return`
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
              value="${((t=e.allowedFolders)==null?void 0:t.join(", "))||""}"
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
              value="${e.defaultOutputFolder||""}"
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
              value="${e.maxFileSize?e.maxFileSize/(1024*1024):100}"
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
  `}window.saveStorage=function(){const e=document.getElementById("allowed-folders").value,t=document.getElementById("output-folder").value,s=parseInt(document.getElementById("max-file-size").value)||100,n=e.split(",").map(o=>o.trim()).filter(o=>o.length>0);if(n.length===0){alert("Please specify at least one allowed folder");return}i.set("setup.storage.data",{allowedFolders:n,defaultOutputFolder:t||n[0],maxFileSize:s*1024*1024}),i.set("setup.storage.completed",!0),window.navigate("/setup")};function ae(){const e=i.get("nodes")||[];return`
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
            <div class="check-status ${e.length>0?"success":"pending"}">
              ${e.length>0?"✓":"○"}
            </div>
            <div class="check-info">
              <div class="check-name">Connected Nodes</div>
              <div class="check-detail">${e.length} node${e.length!==1?"s":""} connected</div>
            </div>
            <div class="check-action">
              ${e.length===0?'<a href="#/nodes" class="btn btn-small btn-secondary">Add Node</a>':'<span class="check-pass">Pass</span>'}
            </div>
          </div>

          <div class="health-check-item">
            <div class="check-status ${i.isSetupComplete()?"success":"pending"}">
              ${i.isSetupComplete()?"✓":"○"}
            </div>
            <div class="check-info">
              <div class="check-name">Setup Completion</div>
              <div class="check-detail">${i.getSetupProgress().completed} of 6 modules complete</div>
            </div>
            <div class="check-action">
              ${i.isSetupComplete()?'<span class="check-pass">Pass</span>':'<a href="#/setup" class="btn btn-small btn-secondary">Complete Setup</a>'}
            </div>
          </div>

          <div class="health-check-item">
            <div class="check-status ${i.hasWorkingProvider()?"success":"warning"}">
              ${i.hasWorkingProvider()?"✓":"!"}
            </div>
            <div class="check-info">
              <div class="check-name">AI Providers</div>
              <div class="check-detail">${i.getWorkingProviders().length} provider(s) configured</div>
            </div>
            <div class="check-action">
              ${i.hasWorkingProvider()?'<span class="check-pass">Pass</span>':'<a href="#/providers" class="btn btn-small btn-secondary">Setup Providers</a>'}
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
  `}window.testBackendConnection=async function(){try{const e=await fetch("https://instance-2026clawbot-vm0210-142930.tail0f5b68.ts.net/health");e.ok?alert("✓ Backend connection successful"):alert("✗ Backend returned error: "+e.status)}catch(e){alert("✗ Cannot connect to backend: "+e.message)}};window.completeHealthChecks=function(){i.set("setup.healthChecks.completed",!0),window.navigate("/setup")};window.goToNodesAndAdd=function(){window.navigate("/nodes"),setTimeout(()=>{window.showAddNodeModal&&window.showAddNodeModal()},100)};window.showSetupNodeInfoModal=function(){const e=document.getElementById("setup-node-info-modal");e&&e.classList.remove("hidden")};window.hideSetupNodeInfoModal=function(){const e=document.getElementById("setup-node-info-modal");e&&e.classList.add("hidden")};function P(){const e=i.get("tasks"),t=i.get("nodes"),s=i.getSetupProgress(),n=i.isSetupComplete(),o=e.slice(0,5),a=e.filter(d=>d.status==="executing").length,r=e.filter(d=>d.status==="completed").length,l=e.filter(d=>d.status==="failed").length;return n?`
    <div class="dashboard-page">
      <header class="page-header">
        <div class="container">
          <h1>Mission Control</h1>
          <p class="text-muted">Overview of your AI agent operations</p>
        </div>
      </header>
      
      <main class="container">
        <!-- Stats Grid -->
        <div class="stats-grid">
          <div class="stat-card card">
            <div class="stat-icon">🖥️</div>
            <div class="stat-content">
              <span class="stat-value">${t.filter(d=>d.status==="connected").length}/${t.length}</span>
              <span class="stat-label">Nodes Online</span>
            </div>
          </div>
          
          <div class="stat-card card">
            <div class="stat-icon">⚡</div>
            <div class="stat-content">
              <span class="stat-value">${a}</span>
              <span class="stat-label">Executing</span>
            </div>
          </div>
          
          <div class="stat-card card">
            <div class="stat-icon">✅</div>
            <div class="stat-content">
              <span class="stat-value">${r}</span>
              <span class="stat-label">Completed</span>
            </div>
          </div>
          
          <div class="stat-card card">
            <div class="stat-icon">❌</div>
            <div class="stat-content">
              <span class="stat-value">${l}</span>
              <span class="stat-label">Failed</span>
            </div>
          </div>
        </div>
        
        <!-- Quick Actions -->
        <div class="quick-actions card">
          <h2>Quick Actions</h2>
          <div class="action-grid">
            <a href="#/tasks/new" class="action-item">
              <span class="action-icon">➕</span>
              <span class="action-label">New Task</span>
            </a>
            <a href="#/nodes" class="action-item">
              <span class="action-icon">🖥️</span>
              <span class="action-label">Add Node</span>
            </a>
            <a href="#/providers" class="action-item">
              <span class="action-icon">🔌</span>
              <span class="action-label">Configure Providers</span>
            </a>
            <a href="#/routing" class="action-item">
              <span class="action-icon">📡</span>
              <span class="action-label">Test Routing</span>
            </a>
          </div>
        </div>
        
        <!-- Setup Progress (if incomplete) -->
        ${s.percentage<100?`
          <div class="dashboard-setup card">
            <div class="setup-header">
              <h2>Setup Progress</h2>
              <span class="setup-percent">${s.percentage}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${s.percentage}%"></div>
            </div>
            <p class="text-muted">Complete setup to unlock all features</p>
            <a href="#/setup" class="btn btn-primary">Continue Setup</a>
          </div>
        `:""}
        
        <!-- Recent Tasks -->
        <div class="recent-tasks card">
          <div class="section-header">
            <h2>Recent Tasks</h2>
            <a href="#/tasks" class="btn btn-small btn-secondary">View All</a>
          </div>
          
          ${o.length===0?`
            <div class="empty-state-small">
              <p class="text-muted">No tasks yet. Create your first task to get started.</p>
              <a href="#/tasks/new" class="btn btn-primary btn-small">Create Task</a>
            </div>
          `:`
            <div class="tasks-list">
              ${o.map(d=>`
                <a href="#/tasks/${d.id}" class="task-row">
                  <span class="task-intent">${d.intent.substring(0,50)}${d.intent.length>50?"...":""}</span>
                  <span class="badge ${oe(d.status)}">${d.status}</span>
                </a>
              `).join("")}
            </div>
          `}
        </div>
        
        <!-- System Status -->
        <div class="system-status card">
          <h2>System Status</h2>
          <div class="status-list">
            <div class="status-item">
              <span class="status-label">Dashboard</span>
              <span class="badge badge-success">Online</span>
            </div>
            <div class="status-item">
              <span class="status-label">Node Connection</span>
              <span class="badge ${t.some(d=>d.status==="connected")?"badge-success":"badge-error"}">
                ${t.some(d=>d.status==="connected")?"Active":"No Nodes"}
              </span>
            </div>
            <div class="status-item">
              <span class="status-label">Providers</span>
              <span class="badge ${i.hasWorkingProvider()?"badge-success":"badge-warning"}">
                ${i.hasWorkingProvider()?"Configured":"Not Configured"}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  `:ie(s)}function oe(e){return{pending:"badge-warning",routing:"badge-info",assigned:"badge-info",executing:"badge-info",completed:"badge-success",failed:"badge-error"}[e]||"badge-info"}function ie(e){return`
    <div class="dashboard-page">
      <header class="page-header">
        <div class="container">
          <h1>Mission Control</h1>
          <p class="text-muted">Overview of your AI agent operations</p>
        </div>
      </header>
      
      <main class="container">
        <!-- Setup Warning Banner -->
        <div class="setup-warning-banner">
          <span class="setup-warning-icon">⚠️</span>
          <div class="setup-warning-content">
            <div class="setup-warning-title">Setup Required</div>
            <p class="setup-warning-text">Complete setup to start using Mission Control. ${e.completed} of ${e.total} modules finished.</p>
          </div>
          <div class="setup-warning-actions">
            <a href="#/setup" class="btn btn-primary">Continue Setup</a>
          </div>
        </div>
        
        <!-- Gated Content -->
        <div class="gated-section">
          <div class="gated-icon">🚀</div>
          <h2 class="gated-title">Dashboard Ready After Setup</h2>
          <p class="gated-message">
            Your Mission Control dashboard will display real-time statistics, task status, and node health once you complete the setup process.
          </p>
          <div class="gated-actions">
            <a href="#/setup" class="btn btn-primary">Complete Setup</a>
            <a href="#/setup/workspace" class="btn btn-secondary">Start with Workspace</a>
          </div>
        </div>
      </main>
    </div>
  `}function re(){const e=i.get("nodes")||[],t=e.length>0;return i.syncNodes(),`
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
        
        ${t?le(e):ue()}
      </main>
      
      ${pe()}
      ${de()}
    </div>
  `}function de(){return`
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
  `}function le(e){return`
    <div class="nodes-list">
      ${e.map(t=>ce(t)).join("")}
    </div>
  `}function ce(e){const t=Array.isArray(e.capabilities)?e.capabilities:typeof e.capabilities=="string"?[e.capabilities]:[],s={vm:"☁️",local:"💻",server:"🖥️"},n=e.online===!0,o=e.status==="connected"||e.status==="paired";return`
    <div class="node-card card">
      <div class="node-header">
        <div class="node-info">
          <span class="node-type-icon">${s[e.type]||"🖥️"}</span>
          <div>
            <h3 class="node-name">${e.name}</h3>
            ${n?'<span class="badge badge-success">● Online</span>':o?'<span class="badge badge-warning">○ Paired (start connector)</span>':'<span class="badge badge-error">○ Disconnected</span>'}
          </div>
        </div>
        <div class="node-actions">
          <button onclick="testNode('${e.id}')" class="btn btn-small btn-secondary">Test</button>
          ${n?`<button onclick="disconnectNodeById('${e.id}')" class="btn btn-small" style="background: #f59e0b; color: white;">Disconnect</button>`:""}
          <button onclick="deleteNodeById('${e.id}')" class="btn btn-small btn-danger">Remove</button>
        </div>
      </div>

      <div class="node-details">
        <div class="node-detail">
          <span class="detail-label">OS</span>
          <span class="detail-value">${e.os||"Unknown"}</span>
        </div>
        <div class="node-detail">
          <span class="detail-label">ID</span>
          <span class="detail-value node-id">${e.id}</span>
        </div>
        <div class="node-detail">
          <span class="detail-label">Status</span>
          <span class="detail-value">${n?"Connected and reporting":o?"Registered, waiting for connector":"Not connected"}</span>
        </div>
        <div class="node-detail">
          <span class="detail-label">Last Heartbeat</span>
          <span class="detail-value">${e.last_heartbeat?new Date(e.last_heartbeat).toLocaleString():"Not reported yet"}</span>
        </div>
        ${t.length?`
          <div class="node-detail">
            <span class="detail-label">Capabilities</span>
            <div class="capabilities-list">
              ${t.map(a=>`<span class="capability-tag">${a}</span>`).join("")}
            </div>
          </div>
        `:""}
      </div>
    </div>
  `}function ue(){return`
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
  `}function pe(){return`
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
  `}window.showAddNodeModal=function(){document.getElementById("add-node-modal").classList.remove("hidden"),document.getElementById("pairing-section").classList.add("hidden"),document.getElementById("create-pairing-btn").classList.remove("hidden"),document.getElementById("create-pairing-btn").textContent="Generate Pairing Token",document.getElementById("create-pairing-btn").disabled=!1};window.hideAddNodeModal=function(){document.getElementById("add-node-modal").classList.add("hidden")};window.generatePairingToken=async function(){const e=document.getElementById("create-pairing-btn"),t=document.getElementById("node-name").value||"New Node",s=document.getElementById("node-type").value;e.disabled=!0,e.textContent="Generating...";try{const n=await G(),o=`curl -o connector.js ${x}/connector.js`,a=`node connector.js --api ${x} --token ${n.token} --name "${t}" --type ${s}`;document.getElementById("download-command").textContent=o,document.getElementById("pairing-command").textContent=a,document.getElementById("pairing-section").classList.remove("hidden"),e.classList.add("hidden")}catch(n){alert("Failed to create pairing token: "+n.message),e.disabled=!1,e.textContent="Generate Pairing Token"}};window.copyPairingCommand=function(){const e=document.getElementById("pairing-command").textContent;navigator.clipboard.writeText(e).then(()=>{alert("Command copied! Run this on your node to connect.")})};window.refreshNodes=async function(){await i.syncNodes(),window.navigate("/nodes")};window.testNode=function(e){const t=i.get("nodes").find(s=>s.id===e);t&&alert(`Node: ${t.name}
Status: ${t.status}
Online: ${t.online?"Yes":"No"}
Last heartbeat: ${t.last_heartbeat?new Date(t.last_heartbeat).toLocaleString():"Never"}`)};window.disconnectNodeById=async function(e){if(confirm("Disconnect this node? It will go offline but can be reconnected later."))try{await K(e),await i.syncNodes(),alert("Node disconnected"),window.navigate("/nodes")}catch(t){alert("Failed to disconnect: "+t.message)}};window.deleteNodeById=async function(e){if(confirm("Permanently remove this node? This cannot be undone."))try{await z(e);const t=i.get("nodes").filter(s=>s.id!==e);i.set("nodes",t),alert("Node removed"),window.navigate("/nodes")}catch(t){alert("Failed to remove: "+t.message)}};window.showNodeInfoModal=function(){const e=document.getElementById("node-info-modal");e&&e.classList.remove("hidden")};window.hideNodeInfoModal=function(){const e=document.getElementById("node-info-modal");e&&e.classList.add("hidden")};setInterval(()=>{window.location.hash==="#/nodes"&&i.syncNodes()},1e4);const C={openai:{name:"OpenAI",icon:"🤖"},anthropic:{name:"Anthropic",icon:"🧠"},google:{name:"Google AI",icon:"🔍"},local:{name:"Local Model",icon:"🏠"},custom:{name:"Custom API",icon:"⚙️"}};function ve(){const e=i.getConnectedNodes();return e.length>0?`
    <div class="providers-page">
      <header class="page-header">
        <div class="container">
          <h1>Providers</h1>
          <p class="text-muted">Configure LLM providers per node. Keys stay on nodes.</p>
        </div>
      </header>
      
      <main class="container">
        ${e.map(s=>he(s)).join("")}
        
        <div class="providers-fallback card">
          <h3>Fallback Order</h3>
          <p class="text-muted">When primary provider fails, try these in order</p>
          ${be()}
        </div>
      </main>
      
      ${ye()}
    </div>
  `:ge()}function ge(){return`
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
      
      ${me()}
    </div>
  `}function me(){return`
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
  `}window.showProvidersGatingModal=function(){var e;(e=document.getElementById("providers-gating-modal"))==null||e.classList.remove("hidden")};window.hideProvidersGatingModal=function(){var e;(e=document.getElementById("providers-gating-modal"))==null||e.classList.add("hidden")};function he(e){const t=i.get("providers").filter(s=>s.nodeId===e.id);return`
    <div class="node-providers card">
      <div class="node-providers-header">
        <div>
          <h3>${e.name}</h3>
          <span class="badge ${e.status==="connected"?"badge-success":"badge-error"}">${e.status}</span>
        </div>
        <button onclick="showProviderConfigModal('${e.id}')" class="btn btn-primary btn-small">
          + Add Provider
        </button>
      </div>
      
      ${t.length===0?`
        <div class="empty-state-small">
          <p class="text-muted">No providers configured for this node</p>
        </div>
      `:`
        <div class="providers-list">
          ${t.map(s=>fe(s)).join("")}
        </div>
      `}
    </div>
  `}function fe(e,t){const s=C[e.type]||{name:e.type,icon:"❓"},n={not_configured:{class:"badge-warning",text:"Not Configured"},configured:{class:"badge-success",text:"Configured"},failing:{class:"badge-error",text:"Failing"},testing:{class:"badge-info",text:"Testing..."}},o=n[e.status]||n.not_configured;return`
    <div class="provider-row">
      <div class="provider-info">
        <span class="provider-icon">${s.icon}</span>
        <div>
          <div class="provider-name">${s.name}</div>
          <div class="provider-meta">
            <span class="badge ${o.class}">${o.text}</span>
            ${e.endpointUrl?`<span class="endpoint">${e.endpointUrl}</span>`:""}
          </div>
        </div>
      </div>
      
      <div class="provider-actions">
        <button onclick="testProvider('${e.id}')" class="btn btn-small btn-secondary" ${e.status==="testing"?"disabled":""}>
          ${e.status==="testing"?"Testing...":"Test"}
        </button>
        <button onclick="editProvider('${e.id}')" class="btn btn-small btn-secondary">Edit</button>
        <button onclick="deleteProvider('${e.id}')" class="btn btn-small btn-danger">Delete</button>
      </div>
    </div>
  `}function be(){const e=i.get("providers").filter(t=>t.status==="configured");return e.length===0?'<p class="text-muted">No configured providers available for fallback</p>':`
    <div class="fallback-list">
      ${e.map((t,s)=>{const n=i.get("nodes").find(a=>a.id===t.nodeId),o=C[t.type]||{name:t.type};return`
          <div class="fallback-item">
            <span class="fallback-rank">${s+1}</span>
            <span class="fallback-name">${o.name}</span>
            <span class="fallback-node">on ${(n==null?void 0:n.name)||"Unknown"}</span>
            <div class="fallback-actions">
              ${s>0?`<button onclick="moveProviderUp('${t.id}')" class="btn btn-small">↑</button>`:""}
              ${s<e.length-1?`<button onclick="moveProviderDown('${t.id}')" class="btn btn-small">↓</button>`:""}
            </div>
          </div>
        `}).join("")}
    </div>
  `}function ye(){return`
    <div id="provider-config-modal" class="modal hidden">
      <div class="modal-overlay" onclick="hideProviderConfigModal()"></div>
      <div class="modal-content">
        <h2>Configure Provider</h2>
        <input type="hidden" id="provider-node-id" />
        <input type="hidden" id="provider-id" />
        
        <div class="form-group">
          <label class="form-label">Provider Type</label>
          <select id="provider-type" class="form-select" onchange="onProviderTypeChange()">
            ${Object.entries(C).map(([e,t])=>`<option value="${e}">${t.icon} ${t.name}</option>`).join("")}
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
  `}window.showProviderConfigModal=function(e,t=null){if(document.getElementById("provider-node-id").value=e,document.getElementById("provider-id").value=t||"",t){const s=i.get("providers").find(n=>n.id===t);s&&(document.getElementById("provider-type").value=s.type,document.getElementById("provider-name").value=s.name||"",document.getElementById("provider-endpoint").value=s.endpointUrl||"",document.getElementById("provider-priority").value=s.priority||1)}else document.getElementById("provider-type").value="openai",document.getElementById("provider-name").value="",document.getElementById("provider-endpoint").value="",document.getElementById("provider-priority").value="1";document.getElementById("provider-config-modal").classList.remove("hidden")};window.hideProviderConfigModal=function(){document.getElementById("provider-config-modal").classList.add("hidden")};window.onProviderTypeChange=function(){const e=document.getElementById("provider-type").value,t=document.getElementById("provider-name");if(!t.value){const s=C[e];t.value=s?`My ${s.name}`:""}};window.saveProvider=function(){const e=document.getElementById("provider-node-id").value,t=document.getElementById("provider-id").value,s=document.getElementById("provider-type").value,n=document.getElementById("provider-name").value,o=document.getElementById("provider-endpoint").value,a=parseInt(document.getElementById("provider-priority").value)||1;if(!n.trim()){alert("Please enter a display name");return}const r=i.get("providers");if(t){const l=r.findIndex(d=>d.id===t);l!==-1&&(r[l]={...r[l],type:s,name:n.trim(),endpointUrl:o.trim(),priority:a})}else r.push({id:"provider-"+Date.now(),nodeId:e,type:s,name:n.trim(),endpointUrl:o.trim(),priority:a,status:"not_configured",lastTested:null});i.set("providers",r),hideProviderConfigModal(),window.navigate("/providers")};window.testProvider=async function(e){const t=i.get("providers"),s=t.find(a=>a.id===e);if(!s)return;s.status="testing",i.set("providers",t),window.navigate("/providers"),await new Promise(a=>setTimeout(a,2e3));const n=Math.random()>.3;s.status=n?"configured":"failing",s.lastTested=new Date().toISOString(),i.set("providers",t);const o=t.some(a=>a.status==="configured");i.set("setup.providers.completed",o),window.navigate("/providers")};window.editProvider=function(e){const t=i.get("providers").find(s=>s.id===e);t&&showProviderConfigModal(t.nodeId,e)};window.deleteProvider=function(e){if(!confirm("Delete this provider configuration?"))return;const t=i.get("providers").filter(n=>n.id!==e);i.set("providers",t);const s=t.some(n=>n.status==="configured");i.set("setup.providers.completed",s),window.navigate("/providers")};window.moveProviderUp=function(e){const t=i.get("providers"),s=t.findIndex(n=>n.id===e);s>0&&([t[s],t[s-1]]=[t[s-1],t[s]],i.set("providers",t),window.navigate("/providers"))};window.moveProviderDown=function(e){const t=i.get("providers"),s=t.findIndex(n=>n.id===e);s<t.length-1&&([t[s],t[s+1]]=[t[s+1],t[s]],i.set("providers",t),window.navigate("/providers"))};function ke(){const t=i.get().tasks||[],s=i.hasConnectedNodes();return`
    <div class="tasks-page">
      <header class="page-header">
        <div class="container">
          <h1>Tasks</h1>
          <p class="text-muted">View and manage your tasks</p>
        </div>
      </header>
      
      <main class="container">
        ${we(s)}
        ${Ce(t,s)}
      </main>
    </div>
  `}function we(e){return`
    <div class="tasks-toolbar">
      <a href="#/tasks/new" class="btn btn-primary ${e?"":"disabled"}">
        + New Task
      </a>
      ${e?"":`
        <span class="toolbar-notice">
          <span class="notice-icon">⚠️</span>
          Add a node to create tasks
        </span>
      `}
      <button onclick="refreshTasks()" class="btn btn-secondary">
        🔄 Refresh
      </button>
    </div>
  `}function Ce(e,t){return t?e.length===0?`
      <div class="empty-state card">
        <div class="empty-icon">📋</div>
        <h2 class="empty-title">No Tasks Yet</h2>
        <p class="empty-description">Create your first task to get started with AI-powered automation.</p>
        <a href="#/tasks/new" class="btn btn-primary">Create First Task</a>
      </div>
    `:`
    <div class="tasks-list">
      ${e.map(s=>Ie(s)).join("")}
    </div>
  `:`
      <div class="blocked-state card">
        <div class="blocked-icon">🔒</div>
        <h2>Tasks Blocked</h2>
        <p>You need at least one connected node to create and run tasks.</p>
        <a href="#/nodes" class="btn btn-primary">Add Node</a>
      </div>
    `}function Ie(e){const t={pending:{class:"badge-warning",text:"Pending"},assigned:{class:"badge-info",text:"Assigned"},executing:{class:"badge-info",text:"Executing"},completed:{class:"badge-success",text:"Completed"},failed:{class:"badge-error",text:"Failed"},cancelled:{class:"badge-error",text:"Cancelled"}},s=t[e.status]||t.pending,o=(i.get().nodes||[]).find(a=>a.id===e.node_id);return`
    <div class="task-card card">
      <div class="task-header">
        <div class="task-info">
          <h3 class="task-intent">${e.intent}</h3>
          <div class="task-meta">
            <span class="badge ${s.class}">${s.text}</span>
            ${o?`<span class="task-node">on ${o.name}</span>`:""}
            <span class="task-time">${new Date(e.created_at).toLocaleString()}</span>
          </div>
        </div>
        <div class="task-actions">
          <a href="#/tasks/${e.id}" class="btn btn-small btn-secondary">View</a>
          ${e.status==="pending"?`
            <button onclick="dispatchTaskToNode('${e.id}')" class="btn btn-small btn-primary">Dispatch</button>
          `:""}
        </div>
      </div>
      
      ${e.error?`
        <div class="task-error">
          <span class="error-icon">⚠️</span>
          <span>${e.error}</span>
        </div>
      `:""}
    </div>
  `}function $e(){return i.hasConnectedNodes()?`
    <div class="new-task-page">
      <header class="page-header">
        <div class="container">
          <a href="#/tasks" class="back-link">← Back to Tasks</a>
          <h1>Create New Task</h1>
        </div>
      </header>
      
      <main class="container">
        <div class="task-form card">
          <div class="form-group">
            <label class="form-label">What do you want to do?</label>
            <textarea 
              id="task-intent" 
              class="form-textarea" 
              placeholder="Describe your task in detail... e.g., Deploy a Python Flask app to Docker"
              rows="4"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label class="form-label">Priority</label>
            <select id="task-priority" class="form-select">
              <option value="low">Low - Background task</option>
              <option value="normal" selected>Normal - Standard priority</option>
              <option value="high">High - Urgent</option>
              <option value="critical">Critical - Immediate attention</option>
            </select>
          </div>
          
          <div id="task-error" class="form-error hidden"></div>
          
          <div class="form-actions">
            <button onclick="submitTask()" class="btn btn-primary" id="create-task-btn">
              Create Task
            </button>
            <a href="#/tasks" class="btn btn-secondary">Cancel</a>
          </div>
        </div>
      </main>
    </div>
  `:`
      <div class="blocked-page">
        <div class="blocked-content">
          <div class="lock-icon">🔒</div>
          <h1>Cannot Create Task</h1>
          <p>No connected nodes available.</p>
          <a href="#/nodes" class="btn btn-primary">Add Node</a>
        </div>
      </div>
    `}function Ne(e){const s=(i.get().tasks||[]).find(a=>a.id===e);if(!s)return`
      <div class="error-page">
        <h1>Task Not Found</h1>
        <p>The task you're looking for doesn't exist.</p>
        <a href="#/tasks" class="btn btn-primary">Back to Tasks</a>
      </div>
    `;const o=(i.get().nodes||[]).find(a=>a.id===s.node_id);return`
    <div class="task-detail-page">
      <header class="page-header">
        <div class="container">
          <a href="#/tasks" class="back-link">← Back to Tasks</a>
          <h1>Task Detail</h1>
        </div>
      </header>
      
      <main class="container">
        <div class="task-detail-layout">
          <div class="task-detail-main">
            <div class="task-intent-card card">
              <h3>Intent</h3>
              <p class="intent-text">${s.intent}</p>
            </div>
            
            <div class="task-events card">
              <h3>Events</h3>
              <div id="task-events-list">
                <p class="text-muted">Loading events...</p>
              </div>
              <button onclick="loadTaskEvents('${s.id}')" class="btn btn-small btn-secondary">
                Refresh Events
              </button>
            </div>
          </div>
          
          <div class="task-detail-sidebar">
            <div class="task-meta-card card">
              <h3>Details</h3>
              <div class="meta-list">
                <div class="meta-item">
                  <span class="meta-label">Status</span>
                  <span class="badge badge-${s.status==="completed"?"success":s.status==="failed"?"error":"info"}">${s.status}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Created</span>
                  <span class="meta-value">${new Date(s.created_at).toLocaleString()}</span>
                </div>
                ${o?`
                  <div class="meta-item">
                    <span class="meta-label">Node</span>
                    <span class="meta-value">${o.name}</span>
                  </div>
                `:""}
              </div>
            </div>
            
            ${s.status==="pending"?`
              <div class="task-actions-card card">
                <h3>Actions</h3>
                <button onclick="dispatchTaskToNode('${s.id}')" class="btn btn-primary btn-full">
                  Dispatch to Node
                </button>
              </div>
            `:""}
          </div>
        </div>
      </main>
    </div>
  `}window.submitTask=async function(){const e=document.getElementById("task-intent").value,t=document.getElementById("task-priority").value,s=document.getElementById("task-error"),n=document.getElementById("create-task-btn");if(!e.trim()){s.textContent="Please describe what you want to do",s.classList.remove("hidden");return}const o=i.get().currentWorkspace;if(!o){s.textContent="No workspace selected",s.classList.remove("hidden");return}n.disabled=!0,n.textContent="Creating...";try{await M(o.id,e.trim(),t),i.loadTasks(),window.navigate("/tasks")}catch(a){s.textContent=a.message||"Failed to create task",s.classList.remove("hidden"),n.disabled=!1,n.textContent="Create Task"}};window.dispatchTaskToNode=async function(e){const t=i.get().nodes.filter(n=>n.status==="connected"||n.online);if(t.length===0){alert("No connected nodes available");return}const s=t[0];try{await D(e,s.id),alert(`Task dispatched to ${s.name}`),i.loadTasks(),window.navigate("/tasks")}catch(n){alert("Failed to dispatch task: "+n.message)}};window.refreshTasks=function(){i.loadTasks(),window.navigate("/tasks")};window.loadTaskEvents=async function(e){const t=document.getElementById("task-events-list");t.innerHTML='<p class="text-muted">Loading...</p>';try{const s=await O(e);s.length===0?t.innerHTML='<p class="text-muted">No events yet</p>':t.innerHTML=`
        <div class="events-list">
          ${s.map(n=>`
            <div class="event-item">
              <span class="event-type">${n.event_type}</span>
              <span class="event-time">${new Date(n.created_at).toLocaleTimeString()}</span>
              ${n.payload?`<pre class="event-payload">${JSON.stringify(n.payload,null,2)}</pre>`:""}
            </div>
          `).join("")}
        </div>
      `}catch(s){t.innerHTML=`<p class="text-error">Failed to load events: ${s.message}</p>`}};const xe={type:"object",required:["selected_node_id","required_capabilities","provider_preference","fallback_order","output_location","risk_level","approval_required","estimated_tokens","estimated_cost"],properties:{selected_node_id:{type:"string"},required_capabilities:{type:"array",items:{type:"string"}},provider_preference:{type:"string",enum:["openai","anthropic","google","local","auto"]},fallback_order:{type:"array",items:{type:"string"}},output_location:{type:"object",required:["type","path"],properties:{type:{type:"string",enum:["node_local","dashboard_temp"]},path:{type:"string"}}},risk_level:{type:"string",enum:["low","medium","high","critical"]},approval_required:{type:"boolean"},estimated_tokens:{type:"number",minimum:0},estimated_cost:{type:"number",minimum:0}}};function S(e,t){const s=[];if(t.type&&typeof e!==t.type&&(t.type==="array"&&!Array.isArray(e)?s.push(`Expected array, got ${typeof e}`):t.type==="number"&&typeof e!="number"?s.push(`Expected number, got ${typeof e}`):t.type==="boolean"&&typeof e!="boolean"?s.push(`Expected boolean, got ${typeof e}`):t.type==="object"&&(typeof e!="object"||Array.isArray(e))?s.push(`Expected object, got ${Array.isArray(e)?"array":typeof e}`):["array","number","boolean","object"].includes(t.type)||s.push(`Expected ${t.type}, got ${typeof e}`)),t.required&&typeof e=="object"&&!Array.isArray(e))for(const n of t.required)n in e||s.push(`Missing required field: ${n}`);if(t.enum&&!t.enum.includes(e)&&s.push(`Value must be one of: ${t.enum.join(", ")}`),t.type==="number"&&typeof e=="number"&&t.minimum!==void 0&&e<t.minimum&&s.push(`Value must be >= ${t.minimum}`),t.type==="array"&&Array.isArray(e)&&t.items&&e.forEach((n,o)=>{const a=S(n,t.items);a.valid||s.push(`Item ${o}: ${a.errors.join(", ")}`)}),t.properties&&typeof e=="object"&&!Array.isArray(e)){for(const[n,o]of Object.entries(t.properties))if(n in e){const a=S(e[n],o);a.valid||s.push(`${n}: ${a.errors.join(", ")}`)}}return{valid:s.length===0,errors:s}}async function _(e){console.log("[RoutingBrain] Routing task:",e.intent),await new Promise($=>setTimeout($,800));const{intent:t,context:s,constraints:n}=e,o=(s==null?void 0:s.available_nodes)||[],a=(s==null?void 0:s.configured_providers)||[];if(!t||typeof t!="string")throw new Error("Invalid input: intent is required and must be a string");if(!Array.isArray(o))throw new Error("Invalid input: available_nodes must be an array");if(o.length===0)throw new Error("No available nodes for routing");const r=Se(t),l=o.filter($=>Re($,r));if(l.length===0)throw new Error(`No nodes found with required capabilities: ${r.join(", ")}`);const d=l[0],c=Ee(t),g=Be(a,c),p=Ae(t,n),y={type:"node_local",path:`${d.workspace_path||"./outputs"}/task-${Date.now()}`},E=Pe(t),W=Te(E,c),A={selected_node_id:d.id,required_capabilities:r,provider_preference:c,fallback_order:g.length>0?g:["default"],output_location:y,risk_level:p,approval_required:p==="critical"||p==="high",estimated_tokens:E,estimated_cost:W},I=S(A,xe);if(!I.valid)throw console.error("[RoutingBrain] Invalid response schema:",I.errors),new Error(`Routing Brain returned invalid data: ${I.errors.join(", ")}`);return A}function Se(e){const t=[],s=e.toLowerCase();return/\b(docker|container|containerize|dockerize|kubernetes|k8s)\b/.test(s)&&t.push("docker"),/\b(gpu|cuda|nvidia|amd|rocm|ml|machine learning|deep learning|ai model|training)\b/.test(s)&&t.push("gpu"),/\b(python|pip|requirements\.txt|setup\.py|pyproject\.toml|django|flask|fastapi)\b/.test(s)&&t.push("python"),/\b(node|nodejs|npm|yarn|package\.json|express|react|vue|angular)\b/.test(s)&&t.push("nodejs"),/\b(golang|go\.mod|go module)\b/.test(s)&&t.push("go"),/\b(rust|cargo|\.rs)\b/.test(s)&&t.push("rust"),/\b(database|postgres|mysql|mongodb|redis|sqlite|sql)\b/.test(s)&&t.push("database"),/\b(server|web server|nginx|apache|http|api|rest|graphql)\b/.test(s)&&t.push("web-server"),/\b(deploy|deployment|production|release|publish|ci\/cd|pipeline)\b/.test(s)&&t.push("deployment"),t.length>0?t:["general"]}function Ee(e){const t=e.toLowerCase();return/\b(openai|gpt-?4|gpt-?3|chatgpt)\b/.test(t)?"openai":/\b(anthropic|claude)\b/.test(t)?"anthropic":/\b(google|gemini|bard|palm)\b/.test(t)?"google":/\b(local|ollama|llama|self-hosted|on-premise)\b/.test(t)?"local":"auto"}function Ae(e,t){const s=e.toLowerCase();return["delete","remove","drop","destroy","purge","production","live","main"].some(r=>s.includes(r))?"critical":["deploy","push","commit","merge","modify","change","update","migrate"].some(r=>s.includes(r))?"high":["create","add","install","build","generate","setup"].some(r=>s.includes(r))?"medium":(t==null?void 0:t.priority)==="critical"?"critical":(t==null?void 0:t.priority)==="high"?"high":"low"}function Pe(e){const t=Math.ceil(e.length/4);return Math.max(500,t+1e3)}function Te(e,t){const s={openai:.03,anthropic:.008,google:.005,local:0,auto:.02},n=s[t]||s.auto;return e/1e3*n}function Re(e,t){return!t||t.length===0?!0:!e.capabilities||!Array.isArray(e.capabilities)?!1:t.includes("general")?!0:t.every(s=>e.capabilities.includes(s))}function Be(e,t){if(!e||e.length===0)return[];const s=e.filter(o=>o.status==="configured");if(s.length===0)return[];const n=[...s].sort((o,a)=>(o.priority||99)-(a.priority||99));if(t&&t!=="auto"){const o=n.filter(r=>r.type===t),a=n.filter(r=>r.type!==t);return[...o,...a].map(r=>r.id)}return n.map(o=>o.id)}function Le(){const e=i.hasConnectedNodes();return(i.get("nodes")||[]).length>0?e?`
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
  `:`
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
    `:`
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
    `}let m=null;window.analyzeAndRoute=async function(){const e=document.getElementById("intent-text"),t=document.getElementById("intent-priority"),s=document.getElementById("intent-error");document.getElementById("analyze-btn");const n=e.value.trim(),o=t.value;if(!n){s.textContent="Please describe what you want to do",s.classList.remove("hidden");return}s.classList.add("hidden");const r=(i.get("nodes")||[]).filter(l=>l.online&&l.status==="connected");if(r.length===0){s.textContent="No online nodes available. Start your connector first.",s.classList.remove("hidden");return}document.getElementById("intent-step-input").classList.add("hidden"),document.getElementById("intent-step-analysis").classList.remove("hidden"),document.getElementById("analysis-loading").classList.remove("hidden"),document.getElementById("analysis-result").classList.add("hidden");try{const d=await _({intent:n,priority:o,context:{available_nodes:r,configured_providers:[]},constraints:{}});m={...d,intent:n,priority:o,analyzed_at:new Date().toISOString()};const c=r.find(y=>y.id===d.selected_node_id);document.getElementById("plan-intent-text").textContent=n,document.getElementById("plan-node-name").textContent=(c==null?void 0:c.name)||"Unknown Node",document.getElementById("plan-node-id").textContent=d.selected_node_id;const g=document.getElementById("plan-capabilities");g.innerHTML=d.required_capabilities.map(y=>`<span class="capability-tag">${y}</span>`).join(""),document.getElementById("plan-provider").textContent=d.provider_preference,document.getElementById("plan-risk").textContent=d.risk_level,document.getElementById("plan-tokens").textContent=d.estimated_tokens.toLocaleString(),document.getElementById("plan-cost").textContent=`$${d.estimated_cost.toFixed(4)}`;const p=document.getElementById("plan-approval-section");d.approval_required?p.classList.remove("hidden"):p.classList.add("hidden"),document.getElementById("analysis-loading").classList.add("hidden"),document.getElementById("analysis-result").classList.remove("hidden")}catch(l){document.getElementById("analysis-loading").classList.add("hidden"),document.getElementById("intent-step-input").classList.remove("hidden"),document.getElementById("intent-step-analysis").classList.add("hidden"),s.textContent="Routing failed: "+l.message,s.classList.remove("hidden")}};window.backToIntent=function(){document.getElementById("intent-step-input").classList.remove("hidden"),document.getElementById("intent-step-analysis").classList.add("hidden"),m=null};window.executeTask=async function(){const e=document.getElementById("execute-btn"),t=document.getElementById("execute-error");if(!m){t.textContent="No routing decision available. Please analyze again.",t.classList.remove("hidden");return}e.disabled=!0,e.textContent="Creating Task...",t.classList.add("hidden");try{const s=await M(m.intent,m.priority);await D(s.id,m.selected_node_id),window.navigate(`/execution/${s.id}`)}catch(s){e.disabled=!1,e.innerHTML='<span class="btn-icon">🚀</span> Execute Task',t.textContent="Execution failed: "+s.message,t.classList.remove("hidden")}};window.refreshNodeStatus=async function(){await i.syncNodes(),window.navigate("/intent")};let f=null,v=null;function Me(e){v=e;const s=(i.get("tasks")||[]).find(l=>l.id===e);if(!s)return`
      <div class="execution-page">
        <header class="page-header">
          <div class="container">
            <a href="#/tasks" class="back-link">← Back to Tasks</a>
            <h1>Execution</h1>
          </div>
        </header>
        <main class="container">
          <div class="loading-state card">
            <div class="spinner"></div>
            <p>Loading task...</p>
          </div>
        </main>
      </div>
    `;const o=(i.get("nodes")||[]).find(l=>l.id===s.node_id),a=s.status==="completed"||s.status==="failed",r=s.status==="dispatched"||s.status==="executing";return`
    <div class="execution-page">
      <header class="page-header">
        <div class="container">
          <a href="#/tasks" class="back-link">← Back to Tasks</a>
          <h1>Execution</h1>
          <div class="execution-status-header">
            <span class="badge badge-${De(s.status)}">${T(s.status)}</span>
            ${r?'<span class="live-indicator">● Live</span>':""}
          </div>
        </div>
      </header>
      
      <main class="container">
        <div class="execution-layout">
          <!-- Main: Intent & Logs -->
          <div class="execution-main">
            <!-- Intent Card -->
            <div class="execution-card card">
              <h3>Intent</h3>
              <p class="execution-intent">${s.intent}</p>
              <div class="execution-meta">
                <span class="meta-item">
                  <span class="meta-label">Priority:</span>
                  <span class="meta-value">${s.priority}</span>
                </span>
                <span class="meta-item">
                  <span class="meta-label">Created:</span>
                  <span class="meta-value">${new Date(s.created_at).toLocaleString()}</span>
                </span>
              </div>
            </div>
            
            <!-- Live Logs -->
            <div class="execution-card card">
              <div class="logs-header">
                <h3>Live Logs</h3>
                <div class="logs-actions">
                  <button onclick="refreshExecutionLogs()" class="btn btn-small btn-secondary">
                    🔄 Refresh
                  </button>
                  <button onclick="toggleAutoScroll()" class="btn btn-small btn-secondary" id="autoscroll-btn">
                    Auto-scroll: ON
                  </button>
                </div>
              </div>
              <div id="execution-logs" class="execution-logs">
                <div class="logs-placeholder">
                  ${r?'<div class="spinner-small"></div> Waiting for logs...':"No logs available"}
                </div>
              </div>
            </div>
            
            <!-- Result (shown when complete) -->
            ${s.result?`
              <div class="execution-card card result-success">
                <h3>✅ Result</h3>
                <pre class="result-content">${Oe(s.result)}</pre>
              </div>
            `:""}
            
            ${s.error?`
              <div class="execution-card card result-error">
                <h3>❌ Error</h3>
                <pre class="error-content">${s.error}</pre>
              </div>
            `:""}
          </div>
          
          <!-- Sidebar: Details -->
          <div class="execution-sidebar">
            <div class="execution-card card">
              <h3>Task Details</h3>
              <div class="detail-list">
                <div class="detail-item">
                  <span class="detail-label">Task ID</span>
                  <span class="detail-value mono">${s.id.slice(0,8)}...</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Status</span>
                  <span class="detail-value">${T(s.status)}</span>
                </div>
                ${o?`
                  <div class="detail-item">
                    <span class="detail-label">Node</span>
                    <span class="detail-value">${o.name}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Node ID</span>
                    <span class="detail-value mono">${o.id.slice(0,8)}...</span>
                  </div>
                `:""}
                ${s.started_at?`
                  <div class="detail-item">
                    <span class="detail-label">Started</span>
                    <span class="detail-value">${new Date(s.started_at).toLocaleTimeString()}</span>
                  </div>
                `:""}
                ${s.completed_at?`
                  <div class="detail-item">
                    <span class="detail-label">Completed</span>
                    <span class="detail-value">${new Date(s.completed_at).toLocaleTimeString()}</span>
                  </div>
                `:""}
              </div>
            </div>
            
            <!-- Actions -->
            <div class="execution-card card">
              <h3>Actions</h3>
              <div class="action-list">
                <a href="#/intent" class="btn btn-primary btn-full">New Task</a>
                ${a?`
                  <button onclick="rerunTask('${s.id}')" class="btn btn-secondary btn-full">
                    Re-run Task
                  </button>
                `:""}
              </div>
            </div>
            
            <!-- Polling Status -->
            <div class="execution-card card polling-status">
              <span class="polling-indicator" id="polling-indicator">●</span>
              <span class="polling-text">Live updates</span>
              <span class="polling-interval">(2s)</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  `}function De(e){return{pending:"warning",dispatched:"info",executing:"info",completed:"success",failed:"error"}[e]||"warning"}function T(e){return{pending:"Pending",dispatched:"Dispatched",executing:"Executing",completed:"Completed",failed:"Failed"}[e]||e}function Oe(e){if(typeof e=="string")return e;try{return JSON.stringify(e,null,2)}catch{return String(e)}}let w=!0;window.startExecutionPolling=function(e){f&&clearInterval(f),v=e;let t=2e3;loadExecutionLogs(e),f=setInterval(async()=>{if(!v)return;const n=(i.get("tasks")||[]).find(o=>o.id===v);n||await i.syncTasks(),await loadExecutionLogs(v),n&&(n.status==="completed"||n.status==="failed")&&(t=5e3)},t)};window.stopExecutionPolling=function(){f&&(clearInterval(f),f=null),v=null};window.loadExecutionLogs=async function(e){const t=document.getElementById("execution-logs");if(t)try{const s=await O(e);if(s.length===0){const a=(i.get("tasks")||[]).find(l=>l.id===e),r=a&&(a.status==="dispatched"||a.status==="executing");t.innerHTML=`
        <div class="logs-placeholder">
          ${r?'<div class="spinner-small"></div> Waiting for node to report logs...':"No logs available for this task"}
        </div>
      `;return}const n=s.map(o=>{var l,d;const a=new Date(o.created_at).toLocaleTimeString();let r="";switch(o.event_type){case"created":r='<span class="log-type">📋</span> Task created';break;case"dispatched":r=`<span class="log-type">🚀</span> Dispatched to ${(o.payload||{}).node_name||"node"}`;break;case"log":const g=((l=o.payload)==null?void 0:l.line)||"";r=`<span class="log-type">📝</span> <pre class="log-line">${R(g)}</pre>`;break;case"completed":r='<span class="log-type">✅</span> Task completed successfully';break;case"failed":const p=((d=o.payload)==null?void 0:d.error)||"Unknown error";r=`<span class="log-type">❌</span> Task failed: ${R(p)}`;break;default:r=`<span class="log-type">📌</span> ${o.event_type}`}return`
        <div class="log-entry">
          <span class="log-time">${a}</span>
          <span class="log-content">${r}</span>
        </div>
      `}).join("");t.innerHTML=`<div class="logs-list">${n}</div>`,w&&(t.scrollTop=t.scrollHeight)}catch(s){console.error("Failed to load logs:",s),t.innerHTML=`<div class="logs-error">Failed to load logs: ${s.message}</div>`}};window.refreshExecutionLogs=function(){v&&loadExecutionLogs(v)};window.toggleAutoScroll=function(){w=!w;const e=document.getElementById("autoscroll-btn");e&&(e.textContent=`Auto-scroll: ${w?"ON":"OFF"}`)};window.rerunTask=function(e){const s=(i.get("tasks")||[]).find(n=>n.id===e);s&&(sessionStorage.setItem("rerun-intent",s.intent),window.navigate("/intent"))};function R(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}function _e(e){startExecutionPolling(e)}function We(){stopExecutionPolling()}function Fe(){const e=i.get("routingRules"),t=i.hasConnectedNodes();return t?`
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
            ${Ge(t)}
            ${He(e)}
          </div>

          <div class="routing-sidebar">
            ${je()}
          </div>
        </div>
      </main>
    </div>
  `:qe()}function qe(){return`
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

      ${Ue()}
    </div>
  `}function Ue(){return`
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
  `}window.showRoutingGatingModal=function(){var e;(e=document.getElementById("routing-gating-modal"))==null||e.classList.remove("hidden")};window.hideRoutingGatingModal=function(){var e;(e=document.getElementById("routing-gating-modal"))==null||e.classList.add("hidden")};function Ge(e){return`
    <div class="routing-simulator card">
      <h2>Test Routing Brain</h2>
      <p class="text-muted">Enter a task intent to see how the routing brain would handle it</p>
      
      ${e?"":`
        <div class="blocked-notice">
          <span class="blocked-icon">⚠️</span>
          <span>Connect a node to test routing</span>
          <a href="#/nodes" class="btn btn-small btn-primary">Add Node</a>
        </div>
      `}
      
      <div class="simulator-form">
        <div class="form-group">
          <label class="form-label">Task Intent</label>
          <textarea 
            id="routing-intent" 
            class="form-textarea" 
            placeholder="e.g., Deploy a Python web app with Docker"
            ${e?"":"disabled"}
          ></textarea>
        </div>
        
        <div class="form-group">
          <label class="form-label">Priority</label>
          <select id="routing-priority" class="form-select" ${e?"":"disabled"}>
            <option value="low">Low</option>
            <option value="normal" selected>Normal</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        
        <button onclick="simulateRouting()" class="btn btn-primary" ${e?"":"disabled"}>
          Simulate Routing
        </button>
      </div>
      
      <div id="routing-result" class="routing-result hidden">
        <!-- Results rendered here -->
      </div>
    </div>
  `}function He(e){return`
    <div class="routing-rules card">
      <div class="rules-header">
        <h2>Routing Rules</h2>
        <button onclick="addRoutingRule()" class="btn btn-small btn-primary">+ Add Rule</button>
      </div>
      
      ${e.length===0?`
        <div class="empty-state-small">
          <p class="text-muted">No custom routing rules. Default routing applies.</p>
        </div>
      `:`
        <div class="rules-list">
          ${e.map((t,s)=>`
            <div class="rule-item">
              <div class="rule-pattern">
                <span class="rule-keyword">${t.keyword}</span>
                <span class="rule-arrow">→</span>
                <span class="rule-target">${t.target}</span>
              </div>
              <div class="rule-actions">
                <button onclick="deleteRoutingRule(${s})" class="btn btn-small btn-danger">Delete</button>
              </div>
            </div>
          `).join("")}
        </div>
      `}
    </div>
  `}function je(){const e=i.get("setup.routing.data");return`
    <div class="routing-settings card">
      <h3>Routing Settings</h3>
      
      <div class="form-group">
        <label class="form-label">Default Risk Threshold</label>
        <select id="risk-threshold" class="form-select" onchange="updateRiskThreshold()">
          <option value="low" ${e.defaultRiskThreshold==="low"?"selected":""}>Low - Allow most actions</option>
          <option value="medium" ${e.defaultRiskThreshold==="medium"?"selected":""}>Medium - Moderate caution</option>
          <option value="high" ${e.defaultRiskThreshold==="high"?"selected":""}>High - Strict approval</option>
          <option value="critical" ${e.defaultRiskThreshold==="critical"?"selected":""}>Critical - Require approval</option>
        </select>
      </div>
      
      <div class="form-group">
        <label class="checkbox-label">
          <input type="checkbox" id="fallback-enabled" ${e.fallbackEnabled!==!1?"checked":""} onchange="updateFallbackEnabled()" />
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
  `}window.simulateRouting=async function(){const e=document.getElementById("routing-intent").value,t=document.getElementById("routing-priority").value,s=document.getElementById("routing-result");if(!e.trim()){alert("Please enter a task intent");return}s.innerHTML='<div class="routing-loading"><div class="spinner"></div><p>Analyzing intent...</p></div>',s.classList.remove("hidden");try{const n=i.getConnectedNodes(),o=i.getWorkingProviders(),a=await _({intent:e,context:{available_nodes:n,configured_providers:o},constraints:{priority:t}});if(!a.selected_node_id||!a.risk_level)throw new Error("Invalid routing decision: missing required fields");const r=n.find(l=>l.id===a.selected_node_id);s.innerHTML=`
      <div class="routing-decision">
        <h3>Routing Decision</h3>
        
        <div class="decision-section">
          <h4>Selected Node</h4>
          <div class="decision-value">
            <span class="node-badge">${(r==null?void 0:r.name)||"Unknown"}</span>
            <span class="badge ${a.risk_level==="critical"?"badge-error":a.risk_level==="high"?"badge-warning":"badge-success"}">${a.risk_level} risk</span>
          </div>
        </div>
        
        <div class="decision-section">
          <h4>Required Capabilities</h4>
          <div class="capabilities-list">
            ${a.required_capabilities.map(l=>`<span class="capability-tag">${l}</span>`).join("")}
          </div>
        </div>
        
        <div class="decision-section">
          <h4>Provider Preference</h4>
          <div class="decision-value">${a.provider_preference}</div>
        </div>
        
        <div class="decision-section">
          <h4>Fallback Order</h4>
          <ol class="fallback-list">
            ${a.fallback_order.map(l=>{const d=o.find(c=>c.id===l);return`<li>${(d==null?void 0:d.name)||l}</li>`}).join("")}
          </ol>
        </div>
        
        <div class="decision-section">
          <h4>Output Location</h4>
          <code class="output-path">${a.output_location.path}</code>
        </div>
        
        <div class="decision-section">
          <h4>Approval Required</h4>
          <div class="decision-value">
            ${a.approval_required?'<span class="badge badge-warning">Yes - Requires approval</span>':'<span class="badge badge-success">No - Auto-approved</span>'}
          </div>
        </div>
        
        <div class="decision-section">
          <h4>Estimated Cost</h4>
          <div class="decision-value">
            ~${a.estimated_tokens.toLocaleString()} tokens
            (${a.estimated_cost===0?"Free":"$"+a.estimated_cost.toFixed(4)})
          </div>
        </div>
        
        <div class="decision-actions">
          <button onclick="createTaskFromRouting('${encodeURIComponent(e)}')" class="btn btn-primary">
            Create Task with This Routing
          </button>
          <button onclick="hideRoutingResult()" class="btn btn-secondary">
            Dismiss
          </button>
        </div>
      </div>
    `,i.set("setup.routing.completed",!0)}catch(n){s.innerHTML=`
      <div class="routing-error">
        <span class="error-icon">❌</span>
        <h4>Routing Failed</h4>
        <p>${n.message}</p>
        <button onclick="simulateRouting()" class="btn btn-secondary">Retry</button>
      </div>
    `}};window.hideRoutingResult=function(){document.getElementById("routing-result").classList.add("hidden")};window.createTaskFromRouting=function(e){const t=decodeURIComponent(e);localStorage.setItem("kdashx2-new-task-intent",t),window.navigate("/tasks/new")};window.addRoutingRule=function(){const e=prompt("Enter keyword to match:");if(!e)return;const t=prompt("Enter target action:");if(!t)return;const s=i.get("routingRules");s.push({keyword:e.toLowerCase(),target:t,priority:100}),i.set("routingRules",s),window.navigate("/routing")};window.deleteRoutingRule=function(e){if(!confirm("Delete this rule?"))return;const t=i.get("routingRules");t.splice(e,1),i.set("routingRules",t),window.navigate("/routing")};window.updateRiskThreshold=function(){const e=document.getElementById("risk-threshold").value;i.set("setup.routing.data.defaultRiskThreshold",e)};window.updateFallbackEnabled=function(){const e=document.getElementById("fallback-enabled").checked;i.set("setup.routing.data.fallbackEnabled",e)};const Ke={workspace:"🏢",nodes:"🖥️",storage:"💾",providers:"🔌",routing:"📡",healthChecks:"✅"},ze={workspace:"#/setup/workspace",nodes:"#/nodes",storage:"#/setup/storage",providers:"#/providers",routing:"#/routing",healthChecks:"#/setup/health"};function Ye(){var s,n;const e=i.getSetupProgress(),t=i.get("auth");return`
    <div class="settings-page">
      <header class="page-header">
        <div class="container">
          <h1>Settings</h1>
          <p class="text-muted">Configure your Mission Control instance</p>
        </div>
      </header>
      
      <main class="container">
        <div class="settings-layout">
          <!-- Setup Modules -->
          <div class="settings-section card">
            <h2>Setup Modules</h2>
            <p class="text-muted">Return to any setup step to make changes</p>
            
            <div class="settings-modules">
              ${e.modules.map(o=>Ve(o)).join("")}
            </div>
            
            ${e.percentage<100?`
              <a href="#/setup" class="btn btn-primary btn-full">
                Continue Setup (${e.percentage}%)
              </a>
            `:""}
          </div>
          
          <!-- Configuration Pages -->
          <div class="settings-section card">
            <h2>Configuration</h2>
            <div class="config-links">
              <a href="#/nodes" class="config-link">
                <span class="config-icon">🖥️</span>
                <div class="config-info">
                  <span class="config-name">Nodes</span>
                  <span class="config-desc">Manage compute nodes</span>
                </div>
                <span class="config-arrow">→</span>
              </a>
              
              <a href="#/providers" class="config-link">
                <span class="config-icon">🔌</span>
                <div class="config-info">
                  <span class="config-name">Providers</span>
                  <span class="config-desc">Configure LLM providers</span>
                </div>
                <span class="config-arrow">→</span>
              </a>
              
              <a href="#/routing" class="config-link">
                <span class="config-icon">📡</span>
                <div class="config-info">
                  <span class="config-name">Routing</span>
                  <span class="config-desc">Routing rules and testing</span>
                </div>
                <span class="config-arrow">→</span>
              </a>
              
              <a href="#/tasks" class="config-link">
                <span class="config-icon">📋</span>
                <div class="config-info">
                  <span class="config-name">Tasks</span>
                  <span class="config-desc">View task history</span>
                </div>
                <span class="config-arrow">→</span>
              </a>
            </div>
          </div>
          
          <!-- Account -->
          <div class="settings-section card">
            <h2>Account</h2>
            <div class="account-info">
              <div class="account-field">
                <span class="field-label">Email</span>
                <span class="field-value">${((s=t.user)==null?void 0:s.email)||"Not set"}</span>
              </div>
              <div class="account-field">
                <span class="field-label">Name</span>
                <span class="field-value">${((n=t.user)==null?void 0:n.name)||"Not set"}</span>
              </div>
            </div>
            <div class="account-actions">
              <button onclick="logout()" class="btn btn-secondary">Sign Out</button>
            </div>
          </div>
          
          <!-- Danger Zone -->
          <div class="settings-section card danger-zone">
            <h2>Danger Zone</h2>
            <div class="danger-item">
              <div class="danger-info">
                <h4>Reset All Data</h4>
                <p>Clear all settings, nodes, and tasks. Cannot be undone.</p>
              </div>
              <button onclick="resetAllData()" class="btn btn-danger">Reset</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  `}function Ve(e){const t=Ke[e.name],s=ze[e.name],n=e.completed;return`
    <a href="${s}" class="module-link ${n?"completed":"pending"}">
      <span class="module-icon">${t}</span>
      <div class="module-info">
        <span class="module-name">${e.label}</span>
        <span class="module-status">
          ${n?'<span class="badge badge-success">✓ Complete</span>':'<span class="badge badge-warning">○ Pending</span>'}
        </span>
      </div>
      <span class="module-arrow">→</span>
    </a>
  `}window.logout=function(){confirm("Sign out of Mission Control?")&&(i.set("auth",{isAuthenticated:!1,user:null,token:null}),window.navigate("/login"))};window.resetAllData=function(){if(confirm(`WARNING: This will delete ALL data including nodes, tasks, and settings.

This cannot be undone.

Are you sure?`)){if(!confirm('Final confirmation: Type "RESET" to confirm')&&prompt('Type "RESET" to confirm complete data reset:')!=="RESET"){alert("Reset cancelled");return}i.reset(),alert("All data has been reset"),window.navigate("/setup")}};let k=null,B=null;const h={"/":{render:P,requiresAuth:!0},"/login":{render:V,requiresAuth:!1,redirectIfAuthed:"/dashboard"},"/setup":{render:Q,requiresAuth:!0},"/setup/workspace":{render:te,requiresAuth:!0},"/setup/storage":{render:ne,requiresAuth:!0},"/setup/health":{render:ae,requiresAuth:!0},"/dashboard":{render:P,requiresAuth:!0,blockedBy:["NODE_REQUIRED"]},"/nodes":{render:re,requiresAuth:!0},"/providers":{render:ve,requiresAuth:!0,blockedBy:["NODE_REQUIRED"]},"/tasks":{render:ke,requiresAuth:!0,blockedBy:["NODE_REQUIRED"]},"/tasks/new":{render:$e,requiresAuth:!0,blockedBy:["NODE_REQUIRED","PROVIDER_REQUIRED"]},"/tasks/:id":{render:e=>Ne(e),requiresAuth:!0,blockedBy:["NODE_REQUIRED"],dynamic:!0},"/intent":{render:Le,requiresAuth:!0},"/execution/:id":{render:e=>Me(e),requiresAuth:!0,dynamic:!0,onMount:_e,onUnmount:We},"/routing":{render:Fe,requiresAuth:!0,blockedBy:["NODE_REQUIRED"]},"/settings":{render:Ye,requiresAuth:!0},"/billing":{render:()=>"<h1>Billing</h1><p>Coming soon.</p>",requiresAuth:!0},"/locked":{render:Je,requiresAuth:!0}};function Xe(e){var o,a;const t=i.get("auth");return t.isAuthenticated?`
    <header class="global-header">
      <div class="container">
        <div class="header-brand">
          <img src="assets/brand/KDashX3.png" alt="KDashX3" class="header-logo">
          <span class="header-title">KDashX3</span>
        </div>
        <nav class="header-nav">
          ${[{path:"/dashboard",label:"Dashboard"},{path:"/intent",label:"New Task"},{path:"/nodes",label:"Nodes"},{path:"/providers",label:"Providers"},{path:"/routing",label:"Routing"},{path:"/settings",label:"Settings"}].map(r=>{const l=e===r.path||e.startsWith(r.path+"/");return`<a href="#${r.path}" class="${l?"active":""}">${r.label}</a>`}).join("")}
        </nav>
        <div class="header-user">
          <div class="user-menu">
            <button class="user-menu-btn" onclick="toggleUserMenu()">
              <span>👤</span>
              <span>${((a=(o=t.user)==null?void 0:o.email)==null?void 0:a.split("@")[0])||"User"}</span>
              <span>▼</span>
            </button>
            <div id="user-dropdown" class="user-dropdown hidden">
              <button onclick="handleLogout()">🚪 Logout</button>
            </div>
          </div>
        </div>
      </div>
    </header>
  `:""}window.toggleUserMenu=function(){const e=document.getElementById("user-dropdown");e&&e.classList.toggle("hidden")};document.addEventListener("click",e=>{const t=document.querySelector(".user-menu"),s=document.getElementById("user-dropdown");t&&s&&!t.contains(e.target)&&s.classList.add("hidden")});window.handleLogout=function(){i.logout(),window.location.hash="/login",b("/login",!0)};function Qe(e){const t=h[e]||h["/dashboard"],s=i.get("auth"),n=i.getBlocks();if(t.requiresAuth&&!s.isAuthenticated)return{allowed:!1,redirect:"/login"};if(!t.requiresAuth&&s.isAuthenticated&&t.redirectIfAuthed)return{allowed:!1,redirect:t.redirectIfAuthed};if(t.blockedBy)for(const o of t.blockedBy){const a=n.find(r=>r.id===o);if(a)return{allowed:!1,blockedBy:a}}return{allowed:!0}}function Je(){const t=i.getBlocks()[0]||{message:"Setup required",cta:{text:"Go to Setup",href:"#/setup"}};return`
    <div class="locked-page">
      <div class="locked-content">
        <div class="lock-icon">🔒</div>
        <h1>Action Blocked</h1>
        <p class="block-message">${t.message}</p>
        <div class="block-actions">
          <a href="${t.cta.href}" class="btn btn-primary">${t.cta.text}</a>
          <a href="#/setup" class="btn btn-secondary">Setup Center</a>
        </div>
      </div>
    </div>
  `}async function b(e,t=!1){e.startsWith("/")||(e="/"+e),t||(window.location.hash=e);const s=Qe(e);if(!s.allowed){if(s.redirect){window.location.hash=s.redirect,b(s.redirect,!0);return}if(s.blockedBy){window.__currentBlock=s.blockedBy,L("/locked");return}}await L(e)}function Ze(e){if(h[e])return{route:h[e],params:null};for(const[t,s]of Object.entries(h))if(s.dynamic){const n=t.replace(/:\w+/g,"([^/]+)"),o=new RegExp(`^${n}$`),a=e.match(o);if(a)return{route:s,params:a[1]}}return{route:h["/dashboard"],params:null}}async function L(e){const t=document.getElementById("app"),s=i.get("auth");t.innerHTML=`
    <div class="loading-screen">
      <img src="assets/brand/KDashX3.png" alt="KDashX3" class="loading-logo">
      <div class="spinner"></div>
      <p>Loading...</p>
    </div>
  `,await new Promise(n=>setTimeout(n,300));try{k&&k.onUnmount&&k.onUnmount(B);const{route:n,params:o}=Ze(e);k=n,B=o;const a=e==="/setup"||e.startsWith("/setup/"),r=e==="/login",l=r?"":Xe(e);let d;o&&n.render.length>0?d=await n.render(o):d=await n.render(),s.isAuthenticated&&!i.isSetupComplete()&&!a&&!r?t.innerHTML=l+et()+d:t.innerHTML=l+d,tt(),n.onMount&&n.onMount(o)}catch(n){console.error("Render error:",n),t.innerHTML=`
      <div class="error-screen">
        <h1>Error Loading Page</h1>
        <p>${n.message||"Something went wrong"}</p>
        <button onclick="navigate('/dashboard')" class="btn btn-primary">Go Home</button>
      </div>
    `}}function et(){const e=i.getSetupProgress();return`
    <div class="setup-banner">
      <div class="setup-banner-content">
        <span class="setup-icon">⚙️</span>
        <div class="setup-info">
          <span class="setup-title">Setup in Progress</span>
          <div class="setup-progress-bar">
            <div class="setup-progress-fill" style="width: ${e.percentage}%"></div>
          </div>
          <span class="setup-percentage">${e.percentage}%</span>
        </div>
        <a href="#/setup" class="btn btn-small btn-primary">Continue Setup</a>
      </div>
    </div>
  `}function tt(){document.querySelectorAll('a[href^="#/"]').forEach(e=>{e.addEventListener("click",t=>{const s=e.getAttribute("href");s.startsWith("#/")&&(t.preventDefault(),b(s.slice(1)))})})}window.addEventListener("hashchange",()=>{const e=window.location.hash.slice(1)||"/";b(e,!0)});document.addEventListener("DOMContentLoaded",()=>{const e=window.location.hash.slice(1)||"/";b(e,!0)});window.navigate=b;window.store=i;
