(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))n(a);new MutationObserver(a=>{for(const o of a)if(o.type==="childList")for(const r of o.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&n(r)}).observe(document,{childList:!0,subtree:!0});function s(a){const o={};return a.integrity&&(o.integrity=a.integrity),a.referrerPolicy&&(o.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?o.credentials="include":a.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function n(a){if(a.ep)return;a.ep=!0;const o=s(a);fetch(a.href,o)}})();const b={auth:{isAuthenticated:!1,user:null,token:null},setup:{workspace:{completed:!1,data:{orgName:"",timezone:"UTC",notifications:{email:!0,webhook:!1}}},nodes:{completed:!1,data:{nodes:[]}},storage:{completed:!1,data:{allowedFolders:[],defaultOutputFolder:"./outputs",maxFileSize:100*1024*1024}},providers:{completed:!1,data:{providers:[],fallbackOrder:[]}},routing:{completed:!1,data:{rules:[],defaultRiskThreshold:"medium"}},healthChecks:{completed:!1,data:{lastCheck:null,results:{}}}},nodes:[],providers:[],tasks:[],routingRules:[],ui:{loading:{},errors:{},toasts:[]}};function c(e,t){const s={...e};for(const n in t)t[n]&&typeof t[n]=="object"&&!Array.isArray(t[n])?s[n]=c(s[n]||{},t[n]):s[n]=t[n];return s}class P{constructor(){this.state=c({},b),this.listeners=new Set,this.loadFromCache()}subscribe(t){return this.listeners.add(t),()=>this.listeners.delete(t)}notify(t){this.listeners.forEach(s=>s(this.state,t))}get(t=null){if(!t)return c({},this.state);const s=t.split(".");let n=this.state;for(const a of s){if(n==null)return;n=n[a]}return c({},n)}set(t,s){const n=t.split("."),a=c({},this.state);let o=a;for(let r=0;r<n.length-1;r++)o[n[r]]=c({},o[n[r]]),o=o[n[r]];o[n[n.length-1]]=s,this.state=a,this.persistToCache(),this.notify(t)}update(t,s){const n=this.get(t),a=typeof s=="function"?s(n):{...n,...s};this.set(t,a)}loadFromCache(){try{const t=localStorage.getItem("kdashx3-store");if(t){const s=JSON.parse(t);this.state=c(b,s)}}catch(t){console.warn("Failed to load from cache:",t)}}persistToCache(){try{localStorage.setItem("kdashx3-store",JSON.stringify(this.state))}catch(t){console.warn("Failed to persist to cache:",t)}}reset(){this.state=c({},b),this.persistToCache(),this.notify("reset")}getSetupProgress(){const t=["workspace","nodes","storage","providers","routing","healthChecks"],s=t.filter(n=>this.state.setup[n].completed).length;return{completed:s,total:t.length,percentage:Math.round(s/t.length*100),modules:t.map(n=>({name:n,completed:this.state.setup[n].completed,label:this.getModuleLabel(n)}))}}getModuleLabel(t){return{workspace:"Workspace",nodes:"Nodes",storage:"Storage & Permissions",providers:"Providers",routing:"Routing Defaults",healthChecks:"Health Checks"}[t]||t}isSetupComplete(){return this.getSetupProgress().percentage===100}hasConnectedNodes(){return this.state.nodes.some(t=>t.status==="connected")}getConnectedNodes(){return this.state.nodes.filter(t=>t.status==="connected")}hasWorkingProvider(){return this.state.providers.some(t=>t.status==="configured")}getWorkingProviders(){return this.state.providers.filter(t=>t.status==="configured")}canExecuteTasks(){return this.hasConnectedNodes()}canExecuteLLMTasks(){return this.hasConnectedNodes()&&this.hasWorkingProvider()}getBlocks(){const t=[];return this.hasConnectedNodes()||t.push({id:"NODE_REQUIRED",message:"Connect at least one node to execute tasks",cta:{text:"Add Node",href:"#/nodes"}}),this.hasWorkingProvider()||t.push({id:"PROVIDER_REQUIRED",message:"Configure at least one provider to use AI features",cta:{text:"Configure Providers",href:"#/providers"}}),t}}const i=new P;function R(){return i.get("auth").isAuthenticated?(window.navigate("/dashboard"),""):`
    <div class="login-page">
      <div class="login-container">
        <div class="login-header">
          <div class="login-logo">K</div>
          <h1>KDashX3</h1>
          <p class="login-subtitle">Mission Control</p>
        </div>
        
        <div class="login-card card">
          <h2>Welcome</h2>
          <p class="text-muted">Sign in to manage your AI agents</p>
          
          <div class="login-form">
            <div class="form-group">
              <label class="form-label">Email</label>
              <input 
                type="email" 
                id="login-email" 
                class="form-input" 
                placeholder="you@example.com"
                value="demo@example.com"
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">Password</label>
              <input 
                type="password" 
                id="login-password" 
                class="form-input" 
                placeholder="••••••••"
                value="password"
              />
            </div>
            
            <div id="login-error" class="login-error hidden"></div>
            
            <button onclick="handleLogin()" class="btn btn-primary btn-full" id="login-btn">
              Sign In
            </button>
          </div>
          
          <div class="login-divider">
            <span>or</span>
          </div>
          
          <div class="login-social">
            <button onclick="handleSocialLogin('google')" class="btn btn-secondary btn-full">
              Continue with Google
            </button>
            <button onclick="handleSocialLogin('github')" class="btn btn-secondary btn-full">
              Continue with GitHub
            </button>
          </div>
        </div>
        
        <div class="login-footer">
          <p class="text-muted text-center">
            Your API keys stay on your nodes. We never store them.
          </p>
        </div>
      </div>
    </div>
  `}window.handleLogin=async function(){const e=document.getElementById("login-email").value,t=document.getElementById("login-password").value,s=document.getElementById("login-error"),n=document.getElementById("login-btn");if(!e||!t){s.textContent="Please enter email and password",s.classList.remove("hidden");return}n.disabled=!0,n.textContent="Signing in...";try{await new Promise(o=>setTimeout(o,1e3)),i.set("auth",{isAuthenticated:!0,user:{id:"user-"+Date.now(),email:e,name:e.split("@")[0]},token:"mock-jwt-"+Date.now()});const a=i.isSetupComplete();window.navigate(a?"/dashboard":"/setup")}catch(a){s.textContent=a.message||"Sign in failed. Please try again.",s.classList.remove("hidden"),n.disabled=!1,n.textContent="Sign In"}};window.handleSocialLogin=async function(e){const t=event.target;t.disabled=!0,t.textContent=`Connecting to ${e}...`;try{await new Promise(n=>setTimeout(n,1500)),i.set("auth",{isAuthenticated:!0,user:{id:"user-"+Date.now(),email:`user@${e}.com`,name:`${e} User`},token:"mock-jwt-"+Date.now()});const s=i.isSetupComplete();window.navigate(s?"/dashboard":"/setup")}catch{t.disabled=!1,t.textContent=`Continue with ${e.charAt(0).toUpperCase()+e.slice(1)}`,alert(`Failed to sign in with ${e}`)}};const S={workspace:{icon:"🏢",title:"Workspace",description:"Organization name and preferences",route:"#/setup/workspace"},nodes:{icon:"🖥️",title:"Nodes",description:"Add and connect compute nodes",route:"#/nodes"},storage:{icon:"💾",title:"Storage & Permissions",description:"Configure allowed folders and write-fence",route:"#/setup/storage"},providers:{icon:"🔌",title:"Providers",description:"Configure LLM providers on nodes",route:"#/providers"},routing:{icon:"📡",title:"Routing Defaults",description:"Set routing rules and preferences",route:"#/routing"},healthChecks:{icon:"✅",title:"Health Checks",description:"Verify system readiness",route:"#/setup/health"}};function x(){const e=i.getSetupProgress();return`
    <div class="setup-page">
      <header class="page-header">
        <div class="container">
          <h1>Setup Center</h1>
          <p class="text-muted">Complete these steps to get your Mission Control ready</p>
        </div>
      </header>
      
      <main class="container">
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
        
        <!-- Module Cards -->
        <div class="modules-list">
          ${e.modules.map(t=>T(t)).join("")}
        </div>
        
        <!-- Quick Actions -->
        <div class="setup-actions card">
          <h3>Quick Actions</h3>
          <div class="action-buttons">
            <a href="#/nodes" class="btn btn-secondary">
              <span>+</span> Add Node
            </a>
            <a href="#/providers" class="btn btn-secondary">
              <span>⚙️</span> Configure Providers
            </a>
            <a href="#/settings" class="btn btn-secondary">
              <span>⚡</span> Advanced Settings
            </a>
          </div>
        </div>
      </main>
    </div>
  `}function T(e){const t=S[e.name],s=e.completed;return`
    <div class="module-card ${s?"completed":"pending"}">
      <div class="module-icon">${t.icon}</div>
      <div class="module-info">
        <div class="module-name">${t.title}</div>
        <div class="module-description">${t.description}</div>
        <div class="module-status">
          ${s?'<span class="badge badge-success">✓ Complete</span>':'<span class="badge badge-warning">○ Pending</span>'}
        </div>
      </div>
      <div class="module-action">
        ${s?'<span class="status-check">✓</span>':`<a href="${t.route}" class="btn btn-primary btn-small">${_(e.name)}</a>`}
      </div>
    </div>
  `}function _(e){return{workspace:"Create",nodes:"Add Node",storage:"Configure",providers:"Setup",routing:"Configure",healthChecks:"Run Checks"}[e]||"Start"}window.saveWorkspace=function(){const e=document.getElementById("org-name").value,t=document.getElementById("timezone").value,s=document.getElementById("notify-email").checked,n=document.getElementById("notify-webhook").checked;if(!e.trim()){alert("Please enter an organization name");return}i.set("setup.workspace.data",{orgName:e.trim(),timezone:t,notifications:{email:s,webhook:n}}),i.set("setup.workspace.completed",!0),window.navigate("/setup")};function C(){const e=i.get("tasks"),t=i.get("nodes"),s=i.getSetupProgress(),n=e.slice(0,5),a=e.filter(d=>d.status==="executing").length,o=e.filter(d=>d.status==="completed").length,r=e.filter(d=>d.status==="failed").length;return`
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
              <span class="stat-value">${o}</span>
              <span class="stat-label">Completed</span>
            </div>
          </div>
          
          <div class="stat-card card">
            <div class="stat-icon">❌</div>
            <div class="stat-content">
              <span class="stat-value">${r}</span>
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
          
          ${n.length===0?`
            <div class="empty-state-small">
              <p class="text-muted">No tasks yet. Create your first task to get started.</p>
              <a href="#/tasks/new" class="btn btn-primary btn-small">Create Task</a>
            </div>
          `:`
            <div class="tasks-list">
              ${n.map(d=>`
                <a href="#/tasks/${d.id}" class="task-row">
                  <span class="task-intent">${d.intent.substring(0,50)}${d.intent.length>50?"...":""}</span>
                  <span class="badge ${B(d.status)}">${d.status}</span>
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
  `}function B(e){return{pending:"badge-warning",routing:"badge-info",assigned:"badge-info",executing:"badge-info",completed:"badge-success",failed:"badge-error"}[e]||"badge-info"}function D(){const e=i.get("nodes");return`
    <div class="nodes-page">
      <header class="page-header">
        <div class="container">
          <h1>Nodes</h1>
          <p class="text-muted">Manage your compute nodes. API keys stay on these nodes.</p>
        </div>
      </header>
      
      <main class="container">
        ${e.length>0?L(e):q()}
      </main>
      
      ${O()}
      ${F()}
    </div>
  `}function L(e){return`
    <div class="nodes-toolbar">
      <button onclick="showAddNodeModal()" class="btn btn-primary">
        <span>+</span> Add Node
      </button>
    </div>
    
    <div class="nodes-list">
      ${e.map(t=>M(t)).join("")}
    </div>
  `}function M(e){var n;const t={connected:"badge-success",disconnected:"badge-error",pending:"badge-warning",error:"badge-error"};return`
    <div class="node-card card">
      <div class="node-header">
        <div class="node-info">
          <span class="node-type-icon">${{vm:"☁️",local:"💻",server:"🖥️"}[e.type]||"🖥️"}</span>
          <div>
            <h3 class="node-name">${e.name}</h3>
            <span class="badge ${t[e.status]||"badge-warning"}">${e.status}</span>
          </div>
        </div>
        <div class="node-actions">
          ${e.status!=="connected"?`
            <button onclick="connectNode('${e.id}')" class="btn btn-small btn-primary">Connect</button>
          `:""}
          <button onclick="testNode('${e.id}')" class="btn btn-small btn-secondary">Test</button>
          <button onclick="deleteNode('${e.id}')" class="btn btn-small btn-danger">Delete</button>
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
          <span class="detail-label">Last Seen</span>
          <span class="detail-value">${e.lastHeartbeat?new Date(e.lastHeartbeat).toLocaleString():"Never"}</span>
        </div>
        ${(n=e.capabilities)!=null&&n.length?`
          <div class="node-detail">
            <span class="detail-label">Capabilities</span>
            <div class="capabilities-list">
              ${e.capabilities.map(a=>`<span class="capability-tag">${a}</span>`).join("")}
            </div>
          </div>
        `:""}
      </div>
    </div>
  `}function q(){return`
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
  `}function O(){return`
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
  `}function F(){return`
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
  `}window.showAddNodeModal=function(){document.getElementById("add-node-modal").classList.remove("hidden")};window.hideAddNodeModal=function(){document.getElementById("add-node-modal").classList.add("hidden")};window.showPairingModal=function(e){window.__pairingNodeId=e;const t=generatePairingToken();document.getElementById("pairing-token").textContent=t,document.getElementById("pairing-modal").classList.remove("hidden")};window.hidePairingModal=function(){document.getElementById("pairing-modal").classList.add("hidden")};window.generatePairingToken=function(){return Math.random().toString(36).substring(2,8).toUpperCase()};window.copyPairingToken=function(){const e=document.getElementById("pairing-token").textContent;navigator.clipboard.writeText(e).then(()=>{alert("Token copied to clipboard")})};window.addNode=function(){const e=document.getElementById("node-name").value,t=document.getElementById("node-type").value,s=document.getElementById("node-os").value;if(!e.trim()){alert("Please enter a node name");return}const n=[];document.getElementById("cap-docker").checked&&n.push("docker"),document.getElementById("cap-gpu").checked&&n.push("gpu"),document.getElementById("cap-python").checked&&n.push("python"),document.getElementById("cap-nodejs").checked&&n.push("nodejs");const a={id:"node-"+Date.now(),name:e.trim(),type:t,os:s,status:"pending",lastHeartbeat:null,capabilities:n,allowedFolders:[],defaultOutputFolder:"./outputs"},o=i.get("nodes");o.push(a),i.set("nodes",o),i.set("setup.nodes.completed",!1),hideAddNodeModal(),window.navigate("/nodes"),setTimeout(()=>showPairingModal(a.id),100)};window.connectNode=function(e){showPairingModal(e)};window.simulateNodeConnected=function(){const e=window.__pairingNodeId;if(!e)return;const t=i.get("nodes"),s=t.find(n=>n.id===e);s&&(s.status="connected",s.lastHeartbeat=new Date().toISOString(),i.set("nodes",t),t.some(a=>a.status==="connected")&&i.set("setup.nodes.completed",!0)),hidePairingModal(),window.navigate("/nodes")};window.testNode=function(e){const s=i.get("nodes").find(n=>n.id===e);s&&alert(`Testing node "${s.name}"...
Status: ${s.status}
Last heartbeat: ${s.lastHeartbeat?new Date(s.lastHeartbeat).toLocaleString():"Never"}`)};window.deleteNode=function(e){if(!confirm("Are you sure you want to delete this node?"))return;const t=i.get("nodes").filter(n=>n.id!==e);i.set("nodes",t);const s=t.some(n=>n.status==="connected");i.set("setup.nodes.completed",s),window.navigate("/nodes")};const v={openai:{name:"OpenAI",icon:"🤖"},anthropic:{name:"Anthropic",icon:"🧠"},google:{name:"Google AI",icon:"🔍"},local:{name:"Local Model",icon:"🏠"},custom:{name:"Custom API",icon:"⚙️"}};function U(){const e=i.getConnectedNodes();return e.length>0?`
    <div class="providers-page">
      <header class="page-header">
        <div class="container">
          <h1>Providers</h1>
          <p class="text-muted">Configure LLM providers per node. Keys stay on nodes.</p>
        </div>
      </header>
      
      <main class="container">
        ${e.map(s=>W(s)).join("")}
        
        <div class="providers-fallback card">
          <h3>Fallback Order</h3>
          <p class="text-muted">When primary provider fails, try these in order</p>
          ${K()}
        </div>
      </main>
      
      ${Q()}
    </div>
  `:H()}function H(){return`
    <div class="providers-page">
      <header class="page-header">
        <div class="container">
          <h1>Providers</h1>
        </div>
      </header>
      
      <main class="container">
        <div class="blocked-state card">
          <div class="blocked-icon">🔒</div>
          <h2>No Nodes Connected</h2>
          <p>You need to add and connect at least one node before configuring providers.</p>
          <a href="#/nodes" class="btn btn-primary">Add Node First</a>
        </div>
      </main>
    </div>
  `}function W(e){const t=i.get("providers").filter(s=>s.nodeId===e.id);return`
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
          ${t.map(s=>j(s)).join("")}
        </div>
      `}
    </div>
  `}function j(e,t){const s=v[e.type]||{name:e.type,icon:"❓"},n={not_configured:{class:"badge-warning",text:"Not Configured"},configured:{class:"badge-success",text:"Configured"},failing:{class:"badge-error",text:"Failing"},testing:{class:"badge-info",text:"Testing..."}},a=n[e.status]||n.not_configured;return`
    <div class="provider-row">
      <div class="provider-info">
        <span class="provider-icon">${s.icon}</span>
        <div>
          <div class="provider-name">${s.name}</div>
          <div class="provider-meta">
            <span class="badge ${a.class}">${a.text}</span>
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
  `}function K(){const e=i.get("providers").filter(t=>t.status==="configured");return e.length===0?'<p class="text-muted">No configured providers available for fallback</p>':`
    <div class="fallback-list">
      ${e.map((t,s)=>{const n=i.get("nodes").find(o=>o.id===t.nodeId),a=v[t.type]||{name:t.type};return`
          <div class="fallback-item">
            <span class="fallback-rank">${s+1}</span>
            <span class="fallback-name">${a.name}</span>
            <span class="fallback-node">on ${(n==null?void 0:n.name)||"Unknown"}</span>
            <div class="fallback-actions">
              ${s>0?`<button onclick="moveProviderUp('${t.id}')" class="btn btn-small">↑</button>`:""}
              ${s<e.length-1?`<button onclick="moveProviderDown('${t.id}')" class="btn btn-small">↓</button>`:""}
            </div>
          </div>
        `}).join("")}
    </div>
  `}function Q(){return`
    <div id="provider-config-modal" class="modal hidden">
      <div class="modal-overlay" onclick="hideProviderConfigModal()"></div>
      <div class="modal-content">
        <h2>Configure Provider</h2>
        <input type="hidden" id="provider-node-id" />
        <input type="hidden" id="provider-id" />
        
        <div class="form-group">
          <label class="form-label">Provider Type</label>
          <select id="provider-type" class="form-select" onchange="onProviderTypeChange()">
            ${Object.entries(v).map(([e,t])=>`<option value="${e}">${t.icon} ${t.name}</option>`).join("")}
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
  `}window.showProviderConfigModal=function(e,t=null){if(document.getElementById("provider-node-id").value=e,document.getElementById("provider-id").value=t||"",t){const s=i.get("providers").find(n=>n.id===t);s&&(document.getElementById("provider-type").value=s.type,document.getElementById("provider-name").value=s.name||"",document.getElementById("provider-endpoint").value=s.endpointUrl||"",document.getElementById("provider-priority").value=s.priority||1)}else document.getElementById("provider-type").value="openai",document.getElementById("provider-name").value="",document.getElementById("provider-endpoint").value="",document.getElementById("provider-priority").value="1";document.getElementById("provider-config-modal").classList.remove("hidden")};window.hideProviderConfigModal=function(){document.getElementById("provider-config-modal").classList.add("hidden")};window.onProviderTypeChange=function(){const e=document.getElementById("provider-type").value,t=document.getElementById("provider-name");if(!t.value){const s=v[e];t.value=s?`My ${s.name}`:""}};window.saveProvider=function(){const e=document.getElementById("provider-node-id").value,t=document.getElementById("provider-id").value,s=document.getElementById("provider-type").value,n=document.getElementById("provider-name").value,a=document.getElementById("provider-endpoint").value,o=parseInt(document.getElementById("provider-priority").value)||1;if(!n.trim()){alert("Please enter a display name");return}const r=i.get("providers");if(t){const d=r.findIndex(l=>l.id===t);d!==-1&&(r[d]={...r[d],type:s,name:n.trim(),endpointUrl:a.trim(),priority:o})}else r.push({id:"provider-"+Date.now(),nodeId:e,type:s,name:n.trim(),endpointUrl:a.trim(),priority:o,status:"not_configured",lastTested:null});i.set("providers",r),hideProviderConfigModal(),window.navigate("/providers")};window.testProvider=async function(e){const t=i.get("providers"),s=t.find(o=>o.id===e);if(!s)return;s.status="testing",i.set("providers",t),window.navigate("/providers"),await new Promise(o=>setTimeout(o,2e3));const n=Math.random()>.3;s.status=n?"configured":"failing",s.lastTested=new Date().toISOString(),i.set("providers",t);const a=t.some(o=>o.status==="configured");i.set("setup.providers.completed",a),window.navigate("/providers")};window.editProvider=function(e){const t=i.get("providers").find(s=>s.id===e);t&&showProviderConfigModal(t.nodeId,e)};window.deleteProvider=function(e){if(!confirm("Delete this provider configuration?"))return;const t=i.get("providers").filter(n=>n.id!==e);i.set("providers",t);const s=t.some(n=>n.status==="configured");i.set("setup.providers.completed",s),window.navigate("/providers")};window.moveProviderUp=function(e){const t=i.get("providers"),s=t.findIndex(n=>n.id===e);s>0&&([t[s],t[s-1]]=[t[s-1],t[s]],i.set("providers",t),window.navigate("/providers"))};window.moveProviderDown=function(e){const t=i.get("providers"),s=t.findIndex(n=>n.id===e);s<t.length-1&&([t[s],t[s+1]]=[t[s+1],t[s]],i.set("providers",t),window.navigate("/providers"))};const V={type:"object",required:["selected_node_id","required_capabilities","provider_preference","fallback_order","output_location","risk_level","approval_required","estimated_tokens","estimated_cost"],properties:{selected_node_id:{type:"string"},required_capabilities:{type:"array",items:{type:"string"}},provider_preference:{type:"string",enum:["openai","anthropic","google","local","auto"]},fallback_order:{type:"array",items:{type:"string"}},output_location:{type:"object",required:["type","path"],properties:{type:{type:"string",enum:["node_local","dashboard_temp"]},path:{type:"string"}}},risk_level:{type:"string",enum:["low","medium","high","critical"]},approval_required:{type:"boolean"},estimated_tokens:{type:"number",minimum:0},estimated_cost:{type:"number",minimum:0}}};function k(e,t){const s=[];if(t.type&&typeof e!==t.type&&(t.type==="array"&&!Array.isArray(e)?s.push(`Expected array, got ${typeof e}`):t.type==="number"&&typeof e!="number"?s.push(`Expected number, got ${typeof e}`):t.type==="boolean"&&typeof e!="boolean"?s.push(`Expected boolean, got ${typeof e}`):t.type==="object"&&(typeof e!="object"||Array.isArray(e))?s.push(`Expected object, got ${Array.isArray(e)?"array":typeof e}`):["array","number","boolean","object"].includes(t.type)||s.push(`Expected ${t.type}, got ${typeof e}`)),t.required&&typeof e=="object"&&!Array.isArray(e))for(const n of t.required)n in e||s.push(`Missing required field: ${n}`);if(t.enum&&!t.enum.includes(e)&&s.push(`Value must be one of: ${t.enum.join(", ")}`),t.type==="number"&&typeof e=="number"&&t.minimum!==void 0&&e<t.minimum&&s.push(`Value must be >= ${t.minimum}`),t.type==="array"&&Array.isArray(e)&&t.items&&e.forEach((n,a)=>{const o=k(n,t.items);o.valid||s.push(`Item ${a}: ${o.errors.join(", ")}`)}),t.properties&&typeof e=="object"&&!Array.isArray(e)){for(const[n,a]of Object.entries(t.properties))if(n in e){const o=k(e[n],a);o.valid||s.push(`${n}: ${o.errors.join(", ")}`)}}return{valid:s.length===0,errors:s}}async function N(e){console.log("[RoutingBrain] Routing task:",e.intent),await new Promise(f=>setTimeout(f,800));const{intent:t,context:s,constraints:n}=e,a=(s==null?void 0:s.available_nodes)||[],o=(s==null?void 0:s.configured_providers)||[];if(!t||typeof t!="string")throw new Error("Invalid input: intent is required and must be a string");if(!Array.isArray(a))throw new Error("Invalid input: available_nodes must be an array");if(a.length===0)throw new Error("No available nodes for routing");const r=z(t),d=a.filter(f=>Z(f,r));if(d.length===0)throw new Error(`No nodes found with required capabilities: ${r.join(", ")}`);const l=d[0],u=G(t),y=ee(o,u),m=Y(t,n),I={type:"node_local",path:`${l.workspace_path||"./outputs"}/task-${Date.now()}`},w=X(t),A=J(w,u),$={selected_node_id:l.id,required_capabilities:r,provider_preference:u,fallback_order:y.length>0?y:["default"],output_location:I,risk_level:m,approval_required:m==="critical"||m==="high",estimated_tokens:w,estimated_cost:A},h=k($,V);if(!h.valid)throw console.error("[RoutingBrain] Invalid response schema:",h.errors),new Error(`Routing Brain returned invalid data: ${h.errors.join(", ")}`);return $}function z(e){const t=[],s=e.toLowerCase();return/\b(docker|container|containerize|dockerize|kubernetes|k8s)\b/.test(s)&&t.push("docker"),/\b(gpu|cuda|nvidia|amd|rocm|ml|machine learning|deep learning|ai model|training)\b/.test(s)&&t.push("gpu"),/\b(python|pip|requirements\.txt|setup\.py|pyproject\.toml|django|flask|fastapi)\b/.test(s)&&t.push("python"),/\b(node|nodejs|npm|yarn|package\.json|express|react|vue|angular)\b/.test(s)&&t.push("nodejs"),/\b(golang|go\.mod|go module)\b/.test(s)&&t.push("go"),/\b(rust|cargo|\.rs)\b/.test(s)&&t.push("rust"),/\b(database|postgres|mysql|mongodb|redis|sqlite|sql)\b/.test(s)&&t.push("database"),/\b(server|web server|nginx|apache|http|api|rest|graphql)\b/.test(s)&&t.push("web-server"),/\b(deploy|deployment|production|release|publish|ci\/cd|pipeline)\b/.test(s)&&t.push("deployment"),t.length>0?t:["general"]}function G(e){const t=e.toLowerCase();return/\b(openai|gpt-?4|gpt-?3|chatgpt)\b/.test(t)?"openai":/\b(anthropic|claude)\b/.test(t)?"anthropic":/\b(google|gemini|bard|palm)\b/.test(t)?"google":/\b(local|ollama|llama|self-hosted|on-premise)\b/.test(t)?"local":"auto"}function Y(e,t){const s=e.toLowerCase();return["delete","remove","drop","destroy","purge","production","live","main"].some(r=>s.includes(r))?"critical":["deploy","push","commit","merge","modify","change","update","migrate"].some(r=>s.includes(r))?"high":["create","add","install","build","generate","setup"].some(r=>s.includes(r))?"medium":(t==null?void 0:t.priority)==="critical"?"critical":(t==null?void 0:t.priority)==="high"?"high":"low"}function X(e){const t=Math.ceil(e.length/4);return Math.max(500,t+1e3)}function J(e,t){const s={openai:.03,anthropic:.008,google:.005,local:0,auto:.02},n=s[t]||s.auto;return e/1e3*n}function Z(e,t){return!t||t.length===0?!0:!e.capabilities||!Array.isArray(e.capabilities)?!1:t.includes("general")?!0:t.every(s=>e.capabilities.includes(s))}function ee(e,t){if(!e||e.length===0)return[];const s=e.filter(a=>a.status==="configured");if(s.length===0)return[];const n=[...s].sort((a,o)=>(a.priority||99)-(o.priority||99));if(t&&t!=="auto"){const a=n.filter(r=>r.type===t),o=n.filter(r=>r.type!==t);return[...a,...o].map(r=>r.id)}return n.map(a=>a.id)}function te(){const e=i.get("tasks"),t=i.hasConnectedNodes();return`
    <div class="tasks-page">
      <header class="page-header">
        <div class="container">
          <h1>Tasks</h1>
          <p class="text-muted">View and manage your tasks</p>
        </div>
      </header>
      
      <main class="container">
        ${se(t)}
        ${ne(e,t)}
      </main>
    </div>
  `}function se(e){return`
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
    </div>
  `}function ne(e,t){return t?e.length===0?`
      <div class="empty-state card">
        <div class="empty-icon">📋</div>
        <h2 class="empty-title">No Tasks Yet</h2>
        <p class="empty-description">Create your first task to get started with AI-powered automation.</p>
        <a href="#/tasks/new" class="btn btn-primary">Create First Task</a>
      </div>
    `:`
    <div class="tasks-list">
      ${e.map(s=>ae(s)).join("")}
    </div>
  `:`
      <div class="blocked-state card">
        <div class="blocked-icon">🔒</div>
        <h2>Tasks Blocked</h2>
        <p>You need at least one connected node to create and run tasks.</p>
        <a href="#/nodes" class="btn btn-primary">Add Node</a>
      </div>
    `}function ae(e){const t={pending:{class:"badge-warning",text:"Pending"},routing:{class:"badge-info",text:"Routing"},assigned:{class:"badge-info",text:"Assigned"},executing:{class:"badge-info",text:"Executing"},completed:{class:"badge-success",text:"Completed"},failed:{class:"badge-error",text:"Failed"},retrying:{class:"badge-warning",text:"Retrying"}},s=t[e.status]||t.pending,n=i.get("nodes").find(a=>a.id===e.assignedNodeId);return`
    <div class="task-card card">
      <div class="task-header">
        <div class="task-info">
          <h3 class="task-intent">${e.intent}</h3>
          <div class="task-meta">
            <span class="badge ${s.class}">${s.text}</span>
            ${n?`<span class="task-node">on ${n.name}</span>`:""}
            <span class="task-time">${new Date(e.createdAt).toLocaleString()}</span>
          </div>
        </div>
        <div class="task-actions">
          <a href="#/tasks/${e.id}" class="btn btn-small btn-secondary">View</a>
          ${e.status==="failed"?`
            <button onclick="retryTask('${e.id}')" class="btn btn-small btn-primary">Retry</button>
          `:""}
        </div>
      </div>
      
      ${e.error?`
        <div class="task-error">
          <span class="error-icon">⚠️</span>
          <span>${e.error}</span>
        </div>
      `:""}
      
      ${e.result?`
        <div class="task-result-preview">
          <span class="result-label">Result:</span>
          <span class="result-output">${e.result.output.substring(0,100)}${e.result.output.length>100?"...":""}</span>
        </div>
      `:""}
    </div>
  `}function ie(){const e=i.hasConnectedNodes(),t=i.hasWorkingProvider(),s=localStorage.getItem("kdashx2-new-task-intent")||"";return e?`
    <div class="new-task-page">
      <header class="page-header">
        <div class="container">
          <a href="#/tasks" class="back-link">← Back to Tasks</a>
          <h1>Create New Task</h1>
        </div>
      </header>
      
      <main class="container">
        <div class="task-form card">
          ${t?"":`
            <div class="warning-banner">
              <span class="warning-icon">⚠️</span>
              <span>No working providers configured. AI features may be limited.</span>
              <a href="#/providers" class="btn btn-small btn-secondary">Configure</a>
            </div>
          `}
          
          <div class="form-group">
            <label class="form-label">What do you want to do?</label>
            <textarea 
              id="task-intent" 
              class="form-textarea" 
              placeholder="Describe your task in detail... e.g., Deploy a Python Flask app to Docker"
              rows="4"
            >${s}</textarea>
            <p class="form-hint">Be specific about what you want to accomplish</p>
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
            <button onclick="createTask()" class="btn btn-primary" id="create-task-btn">
              Create Task
            </button>
            <a href="#/tasks" class="btn btn-secondary">Cancel</a>
          </div>
        </div>
        
        <div id="routing-preview" class="routing-preview hidden">
          <!-- Routing preview rendered here -->
        </div>
      </main>
    </div>
  `:oe("NODE_REQUIRED")}function oe(e){var n,a;const s=i.getBlocks().find(o=>o.id===e);return`
    <div class="blocked-page">
      <div class="blocked-content">
        <div class="lock-icon">🔒</div>
        <h1>Cannot Create Task</h1>
        <p class="block-message">${(s==null?void 0:s.message)||"Setup required"}</p>
        <a href="${((n=s==null?void 0:s.cta)==null?void 0:n.href)||"#/setup"}" class="btn btn-primary">${((a=s==null?void 0:s.cta)==null?void 0:a.text)||"Go to Setup"}</a>
      </div>
    </div>
  `}function re(e){var o,r;const s=i.get("tasks").find(d=>d.id===e);if(!s)return`
      <div class="error-page">
        <h1>Task Not Found</h1>
        <p>The task you're looking for doesn't exist.</p>
        <a href="#/tasks" class="btn btn-primary">Back to Tasks</a>
      </div>
    `;const n=i.get("nodes").find(d=>d.id===s.assignedNodeId),a=i.get("providers").find(d=>d.id===s.selectedProviderId);return`
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
            
            ${s.routingDecision?de(s.routingDecision):""}
            
            ${s.result?le(s.result):""}
            
            ${s.error?ce(s.error):""}
          </div>
          
          <div class="task-detail-sidebar">
            <div class="task-meta-card card">
              <h3>Details</h3>
              <div class="meta-list">
                <div class="meta-item">
                  <span class="meta-label">Status</span>
                  <span class="badge ${ue(s.status)}">${s.status}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Created</span>
                  <span class="meta-value">${new Date(s.createdAt).toLocaleString()}</span>
                </div>
                ${s.startedAt?`
                  <div class="meta-item">
                    <span class="meta-label">Started</span>
                    <span class="meta-value">${new Date(s.startedAt).toLocaleString()}</span>
                  </div>
                `:""}
                ${s.completedAt?`
                  <div class="meta-item">
                    <span class="meta-label">Completed</span>
                    <span class="meta-value">${new Date(s.completedAt).toLocaleString()}</span>
                  </div>
                `:""}
                ${n?`
                  <div class="meta-item">
                    <span class="meta-label">Node</span>
                    <span class="meta-value">${n.name}</span>
                  </div>
                `:""}
                ${a?`
                  <div class="meta-item">
                    <span class="meta-label">Provider</span>
                    <span class="meta-value">${a.name}</span>
                  </div>
                `:""}
              </div>
            </div>
            
            ${(r=(o=s.result)==null?void 0:o.artifacts)!=null&&r.length?`
              <div class="task-artifacts card">
                <h3>Artifacts</h3>
                <ul class="artifacts-list">
                  ${s.result.artifacts.map(d=>`
                    <li class="artifact-item">
                      <span class="artifact-path">${d}</span>
                    </li>
                  `).join("")}
                </ul>
              </div>
            `:""}
            
            <div class="task-actions-card card">
              <h3>Actions</h3>
              <div class="action-buttons">
                ${s.status==="failed"?`
                  <button onclick="retryTask('${s.id}')" class="btn btn-primary btn-full">Retry Task</button>
                `:""}
                <button onclick="deleteTask('${s.id}')" class="btn btn-danger btn-full">Delete Task</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `}function de(e){return`
    <div class="routing-decision-card card">
      <h3>Routing Decision</h3>
      <div class="decision-details">
        <div class="decision-item">
          <span class="decision-label">Selected Node</span>
          <span class="decision-value">${e.selected_node_id}</span>
        </div>
        <div class="decision-item">
          <span class="decision-label">Capabilities</span>
          <span class="decision-value">${e.required_capabilities.join(", ")}</span>
        </div>
        <div class="decision-item">
          <span class="decision-label">Provider</span>
          <span class="decision-value">${e.provider_preference}</span>
        </div>
        <div class="decision-item">
          <span class="decision-label">Risk Level</span>
          <span class="badge ${e.risk_level==="critical"?"badge-error":e.risk_level==="high"?"badge-warning":"badge-success"}">${e.risk_level}</span>
        </div>
        <div class="decision-item">
          <span class="decision-label">Approval Required</span>
          <span class="decision-value">${e.approval_required?"Yes":"No"}</span>
        </div>
      </div>
    </div>
  `}function le(e){var t;return`
    <div class="task-result-card card">
      <h3>Result</h3>
      <div class="result-output">
        <pre>${e.output}</pre>
      </div>
      <div class="result-stats">
        <span>Tokens: ${((t=e.token_usage)==null?void 0:t.toLocaleString())||"N/A"}</span>
        <span>Cost: ${e.cost?"$"+e.cost.toFixed(4):"N/A"}</span>
      </div>
    </div>
  `}function ce(e){return`
    <div class="task-error-card card">
      <h3>Error</h3>
      <div class="error-message">
        <pre>${e}</pre>
      </div>
    </div>
  `}function ue(e){return{pending:"badge-warning",routing:"badge-info",assigned:"badge-info",executing:"badge-info",completed:"badge-success",failed:"badge-error",retrying:"badge-warning"}[e]||"badge-info"}window.createTask=async function(){const e=document.getElementById("task-intent").value,t=document.getElementById("task-priority").value,s=document.getElementById("task-error"),n=document.getElementById("create-task-btn");if(!e.trim()){s.textContent="Please describe what you want to do",s.classList.remove("hidden");return}n.disabled=!0,n.textContent="Creating...";try{const a=i.getConnectedNodes(),o=i.getWorkingProviders(),r=await N({intent:e,context:{available_nodes:a,configured_providers:o},constraints:{priority:t}});if(!r.selected_node_id)throw new Error("No suitable node found for this task");const d={id:"task-"+Date.now(),intent:e.trim(),status:"pending",priority:t,assignedNodeId:r.selected_node_id,selectedProviderId:r.fallback_order[0],routingDecision:r,createdAt:new Date().toISOString(),startedAt:null,completedAt:null,result:null,error:null},l=i.get("tasks");l.unshift(d),i.set("tasks",l),localStorage.removeItem("kdashx2-new-task-intent"),simulateTaskExecution(d.id),window.navigate(`/tasks/${d.id}`)}catch(a){s.textContent=a.message||"Failed to create task",s.classList.remove("hidden"),n.disabled=!1,n.textContent="Create Task"}};window.simulateTaskExecution=async function(e){const t=i.get("tasks"),s=t.find(a=>a.id===e);if(!s)return;s.status="routing",i.set("tasks",t),await new Promise(a=>setTimeout(a,1e3)),s.status="executing",s.startedAt=new Date().toISOString(),i.set("tasks",t),await new Promise(a=>setTimeout(a,3e3)),Math.random()>.2?(s.status="completed",s.result={output:`Successfully completed task: ${s.intent}

Executed on node: ${s.assignedNodeId}
Provider used: ${s.selectedProviderId||"default"}`,artifacts:[`${s.routingDecision.output_location.path}/output.log`,`${s.routingDecision.output_location.path}/result.json`],token_usage:Math.floor(Math.random()*5e3)+1e3,cost:Math.random()*.1}):(s.status="failed",s.error="Simulated failure: Provider timeout after 30s"),s.completedAt=new Date().toISOString(),i.set("tasks",t)};window.retryTask=async function(e){const t=i.get("tasks"),s=t.find(n=>n.id===e);s&&(s.status="retrying",s.error=null,s.result=null,i.set("tasks",t),simulateTaskExecution(e),window.navigate(`/tasks/${e}`))};window.deleteTask=function(e){if(!confirm("Delete this task? This cannot be undone."))return;const t=i.get("tasks").filter(s=>s.id!==e);i.set("tasks",t),window.navigate("/tasks")};function pe(){const e=i.get("routingRules"),t=i.hasConnectedNodes();return`
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
            ${ge(t)}
            ${ve(e)}
          </div>
          
          <div class="routing-sidebar">
            ${me()}
          </div>
        </div>
      </main>
    </div>
  `}function ge(e){return`
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
  `}function ve(e){return`
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
  `}function me(){const e=i.get("setup.routing.data");return`
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
  `}window.simulateRouting=async function(){const e=document.getElementById("routing-intent").value,t=document.getElementById("routing-priority").value,s=document.getElementById("routing-result");if(!e.trim()){alert("Please enter a task intent");return}s.innerHTML='<div class="routing-loading"><div class="spinner"></div><p>Analyzing intent...</p></div>',s.classList.remove("hidden");try{const n=i.getConnectedNodes(),a=i.getWorkingProviders(),o=await N({intent:e,context:{available_nodes:n,configured_providers:a},constraints:{priority:t}});if(!o.selected_node_id||!o.risk_level)throw new Error("Invalid routing decision: missing required fields");const r=n.find(d=>d.id===o.selected_node_id);s.innerHTML=`
      <div class="routing-decision">
        <h3>Routing Decision</h3>
        
        <div class="decision-section">
          <h4>Selected Node</h4>
          <div class="decision-value">
            <span class="node-badge">${(r==null?void 0:r.name)||"Unknown"}</span>
            <span class="badge ${o.risk_level==="critical"?"badge-error":o.risk_level==="high"?"badge-warning":"badge-success"}">${o.risk_level} risk</span>
          </div>
        </div>
        
        <div class="decision-section">
          <h4>Required Capabilities</h4>
          <div class="capabilities-list">
            ${o.required_capabilities.map(d=>`<span class="capability-tag">${d}</span>`).join("")}
          </div>
        </div>
        
        <div class="decision-section">
          <h4>Provider Preference</h4>
          <div class="decision-value">${o.provider_preference}</div>
        </div>
        
        <div class="decision-section">
          <h4>Fallback Order</h4>
          <ol class="fallback-list">
            ${o.fallback_order.map(d=>{const l=a.find(u=>u.id===d);return`<li>${(l==null?void 0:l.name)||d}</li>`}).join("")}
          </ol>
        </div>
        
        <div class="decision-section">
          <h4>Output Location</h4>
          <code class="output-path">${o.output_location.path}</code>
        </div>
        
        <div class="decision-section">
          <h4>Approval Required</h4>
          <div class="decision-value">
            ${o.approval_required?'<span class="badge badge-warning">Yes - Requires approval</span>':'<span class="badge badge-success">No - Auto-approved</span>'}
          </div>
        </div>
        
        <div class="decision-section">
          <h4>Estimated Cost</h4>
          <div class="decision-value">
            ~${o.estimated_tokens.toLocaleString()} tokens
            (${o.estimated_cost===0?"Free":"$"+o.estimated_cost.toFixed(4)})
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
    `}};window.hideRoutingResult=function(){document.getElementById("routing-result").classList.add("hidden")};window.createTaskFromRouting=function(e){const t=decodeURIComponent(e);localStorage.setItem("kdashx2-new-task-intent",t),window.navigate("/tasks/new")};window.addRoutingRule=function(){const e=prompt("Enter keyword to match:");if(!e)return;const t=prompt("Enter target action:");if(!t)return;const s=i.get("routingRules");s.push({keyword:e.toLowerCase(),target:t,priority:100}),i.set("routingRules",s),window.navigate("/routing")};window.deleteRoutingRule=function(e){if(!confirm("Delete this rule?"))return;const t=i.get("routingRules");t.splice(e,1),i.set("routingRules",t),window.navigate("/routing")};window.updateRiskThreshold=function(){const e=document.getElementById("risk-threshold").value;i.set("setup.routing.data.defaultRiskThreshold",e)};window.updateFallbackEnabled=function(){const e=document.getElementById("fallback-enabled").checked;i.set("setup.routing.data.fallbackEnabled",e)};const he={workspace:"🏢",nodes:"🖥️",storage:"💾",providers:"🔌",routing:"📡",healthChecks:"✅"},fe={workspace:"#/setup/workspace",nodes:"#/nodes",storage:"#/setup/storage",providers:"#/providers",routing:"#/routing",healthChecks:"#/setup/health"};function be(){var s,n;const e=i.getSetupProgress(),t=i.get("auth");return`
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
              ${e.modules.map(a=>ke(a)).join("")}
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
  `}function ke(e){const t=he[e.name],s=fe[e.name],n=e.completed;return`
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

Are you sure?`)){if(!confirm('Final confirmation: Type "RESET" to confirm')&&prompt('Type "RESET" to confirm complete data reset:')!=="RESET"){alert("Reset cancelled");return}i.reset(),alert("All data has been reset"),window.navigate("/setup")}};const g={"/":{render:C,requiresAuth:!0,blockedBy:["NODE_REQUIRED"]},"/login":{render:R,requiresAuth:!1,redirectIfAuthed:"/dashboard"},"/setup":{render:x,requiresAuth:!0},"/dashboard":{render:C,requiresAuth:!0,blockedBy:["NODE_REQUIRED"]},"/nodes":{render:D,requiresAuth:!0},"/providers":{render:U,requiresAuth:!0,blockedBy:["NODE_REQUIRED"]},"/tasks":{render:te,requiresAuth:!0,blockedBy:["NODE_REQUIRED"]},"/tasks/new":{render:ie,requiresAuth:!0,blockedBy:["NODE_REQUIRED","PROVIDER_REQUIRED"]},"/tasks/:id":{render:e=>re(e),requiresAuth:!0,blockedBy:["NODE_REQUIRED"],dynamic:!0},"/routing":{render:pe,requiresAuth:!0,blockedBy:["NODE_REQUIRED"]},"/settings":{render:be,requiresAuth:!0},"/billing":{render:()=>"<h1>Billing</h1><p>Coming soon.</p>",requiresAuth:!0},"/locked":{render:we,requiresAuth:!0}};function ye(e){const t=g[e]||g["/dashboard"],s=i.get("auth"),n=i.getBlocks();if(t.requiresAuth&&!s.isAuthenticated)return{allowed:!1,redirect:"/login"};if(!t.requiresAuth&&s.isAuthenticated&&t.redirectIfAuthed)return{allowed:!1,redirect:t.redirectIfAuthed};if(t.blockedBy)for(const a of t.blockedBy){const o=n.find(r=>r.id===a);if(o)return{allowed:!1,blockedBy:o}}return{allowed:!0}}function we(){const t=i.getBlocks()[0]||{message:"Setup required",cta:{text:"Go to Setup",href:"#/setup"}};return`
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
  `}async function p(e,t=!1){t||window.history.pushState({},"",e);const s=ye(e);if(!s.allowed){if(s.redirect){p(s.redirect,!0);return}if(s.blockedBy){window.__currentBlock=s.blockedBy,E("/locked");return}}await E(e)}async function E(e){const t=document.getElementById("app"),s=g[e]||g["/dashboard"];t.innerHTML='<div class="loading-screen"><div class="spinner"></div><p>Loading...</p></div>';try{if(i.get("auth").isAuthenticated&&!i.isSetupComplete()&&e!=="/setup"&&e!=="/login"){const a=await s.render();t.innerHTML=$e()+a}else{const a=await s.render();t.innerHTML=a}Ce()}catch(n){console.error("Render error:",n),t.innerHTML=`
      <div class="error-screen">
        <h1>Error Loading Page</h1>
        <p>${n.message||"Something went wrong"}</p>
        <button onclick="navigate('/dashboard')" class="btn btn-primary">Go Home</button>
      </div>
    `}}function $e(){const e=i.getSetupProgress();return`
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
  `}function Ce(){document.querySelectorAll('a[href^="#"]').forEach(e=>{e.addEventListener("click",t=>{const s=e.getAttribute("href");s.startsWith("#")&&(t.preventDefault(),p(s.replace("#","")))})})}window.addEventListener("popstate",()=>{p(window.location.pathname.replace("/KDashX3","")||"/",!0)});document.addEventListener("DOMContentLoaded",()=>{const e=window.location.pathname.replace("/KDashX3","")||"/";p(e,!0)});window.navigate=p;window.store=i;
