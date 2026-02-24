(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))n(a);new MutationObserver(a=>{for(const i of a)if(i.type==="childList")for(const r of i.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&n(r)}).observe(document,{childList:!0,subtree:!0});function s(a){const i={};return a.integrity&&(i.integrity=a.integrity),a.referrerPolicy&&(i.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?i.credentials="include":a.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(a){if(a.ep)return;a.ep=!0;const i=s(a);fetch(a.href,i)}})();const E="https://eagle-funky-twice-drugs.trycloudflare.com";function I(){return localStorage.getItem("kdashx3-token")}async function c(t,e={}){const s=`${E}${t}`,n=I(),a={"Content-Type":"application/json",...e.headers};n&&(a.Authorization=`Bearer ${n}`);const i=await fetch(s,{...e,headers:a});if(!i.ok){const r=await i.json().catch(()=>({error:"Unknown error"}));throw new Error(r.error||`HTTP ${i.status}`)}return i.json()}async function R(t,e){return c("/auth/register",{method:"POST",body:JSON.stringify({email:t,password:e})})}async function A(t,e){return c("/auth/login",{method:"POST",body:JSON.stringify({email:t,password:e})})}async function P(){return c("/pairing-tokens",{method:"POST"})}async function S(){return c("/nodes")}async function x(){return c("/tasks")}async function L(t,e="normal"){return c("/tasks",{method:"POST",body:JSON.stringify({intent:t,priority:e})})}async function B(t,e){return c(`/tasks/${t}/dispatch`,{method:"POST",body:JSON.stringify({node_id:e})})}async function _(t){return c(`/tasks/${t}/events`)}class D{constructor(){this.state=this.loadFromCache(),this.listeners=new Set,this.syncInterval=null}subscribe(e){return this.listeners.add(e),()=>this.listeners.delete(e)}notify(e){this.listeners.forEach(s=>s(this.state,e))}get(e=null){return e?e.split(".").reduce((s,n)=>s==null?void 0:s[n],this.state):{...this.state}}set(e,s){const n=e.split("."),a={...this.state};let i=a;for(let r=0;r<n.length-1;r++)i[n[r]]={...i[n[r]]},i=i[n[r]];i[n[n.length-1]]=s,this.state=a,this.persistToCache(),this.notify(e)}loadFromCache(){try{const e=localStorage.getItem("kdashx3-store");if(e)return JSON.parse(e)}catch(e){console.warn("Failed to load from cache:",e)}return{auth:{isAuthenticated:!1,token:null,user:null},workspace:null,nodes:[],providers:[],tasks:[],setup:{workspace:{completed:!1,data:{}},nodes:{completed:!1,data:{}},storage:{completed:!1,data:{}},providers:{completed:!1,data:{}},routing:{completed:!1,data:{}},healthChecks:{completed:!1,data:{}}},ui:{loading:{},errors:{}}}}persistToCache(){try{localStorage.setItem("kdashx3-store",JSON.stringify(this.state))}catch(e){console.warn("Failed to persist to cache:",e)}}async login(e,s){const n=await A(e,s);return localStorage.setItem("kdashx3-token",n.token),this.set("auth",{isAuthenticated:!0,token:n.token,user:n.user}),this.set("workspace",n.workspace),n}async register(e,s){const n=await R(e,s);return localStorage.setItem("kdashx3-token",n.token),this.set("auth",{isAuthenticated:!0,token:n.token,user:n.user}),this.set("workspace",n.workspace),n}logout(){localStorage.removeItem("kdashx3-token"),localStorage.removeItem("kdashx3-store"),this.state=this.loadFromCache(),this.notify("logout")}async syncNodes(){try{const e=await S();return this.set("nodes",e),e}catch(e){return console.error("Failed to sync nodes:",e),[]}}async syncTasks(){try{const e=await x();return this.set("tasks",e),e}catch(e){return console.error("Failed to sync tasks:",e),[]}}hasConnectedNodes(){return this.state.nodes.some(e=>e.online&&e.status==="connected")}getConnectedNodes(){return this.state.nodes.filter(e=>e.online&&e.status==="connected")}isSetupComplete(){return this.state.workspace&&this.state.nodes.length>0}hasWorkingProvider(){return this.state.providers&&this.state.providers.some(e=>e.status==="configured")}getWorkingProviders(){return this.state.providers?this.state.providers.filter(e=>e.status==="configured"):[]}getBlocks(){const e=[];return this.hasConnectedNodes()||e.push({id:"NODE_REQUIRED",message:"Connect at least one node to execute tasks",cta:{text:"Add Node",href:"#/nodes"}}),this.hasWorkingProvider()||e.push({id:"PROVIDER_REQUIRED",message:"Configure at least one provider to use AI features",cta:{text:"Configure Providers",href:"#/providers"}}),e}getSetupProgress(){const e=["workspace","nodes","storage","providers","routing","healthChecks"],s=this.state.setup||{},n=e.filter(a=>{var i;return(i=s[a])==null?void 0:i.completed}).length;return{completed:n,total:e.length,percentage:Math.round(n/e.length*100),modules:e.map(a=>{var i;return{name:a,completed:((i=s[a])==null?void 0:i.completed)||!1,label:this.getModuleLabel(a)}})}}getModuleLabel(e){return{workspace:"Workspace",nodes:"Nodes",storage:"Storage & Permissions",providers:"Providers",routing:"Routing Rules",healthChecks:"Health Checks"}[e]||e}}const o=new D;function M(){return`
    <div class="login-page">
      <div class="login-container card">
        <div class="login-header">
          <h1>KDashX3</h1>
          <p class="text-muted">Mission Control</p>
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
  `}window.showTab=function(t){document.querySelectorAll(".tab-btn").forEach(s=>s.classList.remove("active")),document.querySelectorAll(".login-panel").forEach(s=>s.classList.remove("active")),document.querySelectorAll(".login-panel").forEach(s=>s.classList.add("hidden")),document.getElementById(`tab-${t}`).classList.add("active");const e=document.getElementById(`${t}-panel`);e.classList.remove("hidden"),e.classList.add("active")};window.handleLogin=async function(){const t=document.getElementById("login-email").value,e=document.getElementById("login-password").value,s=document.getElementById("login-error"),n=document.getElementById("login-btn");if(!t||!e){s.textContent="Please enter email and password",s.classList.remove("hidden");return}n.disabled=!0,n.textContent="Signing in...";try{await o.login(t,e),window.navigate("/setup")}catch(a){s.textContent=a.message||"Login failed",s.classList.remove("hidden"),n.disabled=!1,n.textContent="Sign In"}};window.handleRegister=async function(){const t=document.getElementById("register-email").value,e=document.getElementById("register-password").value,s=document.getElementById("register-error"),n=document.getElementById("register-btn");if(!t||!e){s.textContent="Please enter email and password",s.classList.remove("hidden");return}if(e.length<6){s.textContent="Password must be at least 6 characters",s.classList.remove("hidden");return}n.disabled=!0,n.textContent="Creating account...";try{await o.register(t,e),window.navigate("/setup")}catch(a){s.textContent=a.message||"Registration failed",s.classList.remove("hidden"),n.disabled=!1,n.textContent="Create Account"}};const O={workspace:{icon:"🏢",title:"Workspace",description:"Organization name and preferences",route:"#/setup/workspace"},nodes:{icon:"🖥️",title:"Nodes",description:"Add and connect compute nodes",route:"#/nodes"},storage:{icon:"💾",title:"Storage & Permissions",description:"Configure allowed folders and write-fence",route:"#/setup/storage"},providers:{icon:"🔌",title:"Providers",description:"Configure LLM providers on nodes",route:"#/providers"},routing:{icon:"📡",title:"Routing Defaults",description:"Set routing rules and preferences",route:"#/routing"},healthChecks:{icon:"✅",title:"Health Checks",description:"Verify system readiness",route:"#/setup/health"}};function q(){const t=o.getSetupProgress();return`
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
              <p class="text-muted">${t.completed} of ${t.total} modules completed</p>
            </div>
            <div class="setup-progress-percentage">
              <span class="progress-number">${t.percentage}%</span>
            </div>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${t.percentage}%"></div>
          </div>
          ${t.percentage===100?`
            <div class="setup-complete-banner">
              <span class="complete-icon">🎉</span>
              <span>Setup complete! You can now use Mission Control.</span>
              <a href="#/dashboard" class="btn btn-primary btn-small">Go to Dashboard</a>
            </div>
          `:""}
        </div>
        
        <!-- Module Cards -->
        <div class="modules-list">
          ${t.modules.map(e=>F(e)).join("")}
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
  `}function F(t){const e=O[t.name],s=t.completed;return`
    <div class="module-card ${s?"completed":"pending"}">
      <div class="module-icon">${e.icon}</div>
      <div class="module-info">
        <div class="module-name">${e.title}</div>
        <div class="module-description">${e.description}</div>
        <div class="module-status">
          ${s?'<span class="badge badge-success">✓ Complete</span>':'<span class="badge badge-warning">○ Pending</span>'}
        </div>
      </div>
      <div class="module-action">
        ${s?'<span class="status-check">✓</span>':`<a href="${e.route}" class="btn btn-primary btn-small">${U(t.name)}</a>`}
      </div>
    </div>
  `}function U(t){return{workspace:"Create",nodes:"Add Node",storage:"Configure",providers:"Setup",routing:"Configure",healthChecks:"Run Checks"}[t]||"Start"}window.saveWorkspace=function(){const t=document.getElementById("org-name").value,e=document.getElementById("timezone").value,s=document.getElementById("notify-email").checked,n=document.getElementById("notify-webhook").checked;if(!t.trim()){alert("Please enter an organization name");return}o.set("setup.workspace.data",{orgName:t.trim(),timezone:e,notifications:{email:s,webhook:n}}),o.set("setup.workspace.completed",!0),window.navigate("/setup")};function $(){const t=o.get("tasks"),e=o.get("nodes"),s=o.getSetupProgress(),n=t.slice(0,5),a=t.filter(d=>d.status==="executing").length,i=t.filter(d=>d.status==="completed").length,r=t.filter(d=>d.status==="failed").length;return`
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
              <span class="stat-value">${e.filter(d=>d.status==="connected").length}/${e.length}</span>
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
              <span class="stat-value">${i}</span>
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
                  <span class="badge ${H(d.status)}">${d.status}</span>
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
              <span class="badge ${e.some(d=>d.status==="connected")?"badge-success":"badge-error"}">
                ${e.some(d=>d.status==="connected")?"Active":"No Nodes"}
              </span>
            </div>
            <div class="status-item">
              <span class="status-label">Providers</span>
              <span class="badge ${o.hasWorkingProvider()?"badge-success":"badge-warning"}">
                ${o.hasWorkingProvider()?"Configured":"Not Configured"}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  `}function H(t){return{pending:"badge-warning",routing:"badge-info",assigned:"badge-info",executing:"badge-info",completed:"badge-success",failed:"badge-error"}[t]||"badge-info"}function W(){const t=o.get("nodes")||[],e=t.length>0;return o.syncNodes(),`
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
        
        ${e?K(t):V()}
      </main>
      
      ${j()}
    </div>
  `}function K(t){return`
    <div class="nodes-list">
      ${t.map(e=>Q(e)).join("")}
    </div>
  `}function Q(t){var a;const e={connected:"badge-success",disconnected:"badge-error",pending:"badge-warning"},s={vm:"☁️",local:"💻",server:"🖥️"},n=t.online||t.status==="connected";return`
    <div class="node-card card">
      <div class="node-header">
        <div class="node-info">
          <span class="node-type-icon">${s[t.type]||"🖥️"}</span>
          <div>
            <h3 class="node-name">${t.name}</h3>
            <span class="badge ${e[t.status]||"badge-warning"}">${t.status}</span>
            ${n?'<span class="badge badge-success">● Online</span>':'<span class="badge badge-error">○ Offline</span>'}
          </div>
        </div>
        <div class="node-actions">
          <button onclick="testNode('${t.id}')" class="btn btn-small btn-secondary">Test</button>
        </div>
      </div>
      
      <div class="node-details">
        <div class="node-detail">
          <span class="detail-label">OS</span>
          <span class="detail-value">${t.os||"Unknown"}</span>
        </div>
        <div class="node-detail">
          <span class="detail-label">ID</span>
          <span class="detail-value node-id">${t.id}</span>
        </div>
        <div class="node-detail">
          <span class="detail-label">Last Heartbeat</span>
          <span class="detail-value">${t.last_heartbeat?new Date(t.last_heartbeat).toLocaleString():"Never"}</span>
        </div>
        ${(a=t.capabilities)!=null&&a.length?`
          <div class="node-detail">
            <span class="detail-label">Capabilities</span>
            <div class="capabilities-list">
              ${t.capabilities.map(i=>`<span class="capability-tag">${i}</span>`).join("")}
            </div>
          </div>
        `:""}
      </div>
    </div>
  `}function V(){return`
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
  `}function j(){return`
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
            <strong>Pairing Token Created!</strong>
            <p>Run this command on your node:</p>
            <pre class="command-block" id="pairing-command"></pre>
            <button onclick="copyPairingCommand()" class="btn btn-small btn-secondary">Copy Command</button>
          </div>
          
          <div class="alert alert-warning">
            <strong>Important:</strong> The token expires in 10 minutes and can only be used once.
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
  `}window.showAddNodeModal=function(){document.getElementById("add-node-modal").classList.remove("hidden"),document.getElementById("pairing-section").classList.add("hidden"),document.getElementById("create-pairing-btn").classList.remove("hidden"),document.getElementById("create-pairing-btn").textContent="Generate Pairing Token",document.getElementById("create-pairing-btn").disabled=!1};window.hideAddNodeModal=function(){document.getElementById("add-node-modal").classList.add("hidden")};window.generatePairingToken=async function(){const t=document.getElementById("create-pairing-btn"),e=document.getElementById("node-name").value||"New Node",s=document.getElementById("node-type").value;t.disabled=!0,t.textContent="Generating...";try{const n=await P(),a=`mc-node connect --api ${E} --token ${n.token} --name "${e}" --type ${s}`;document.getElementById("pairing-command").textContent=a,document.getElementById("pairing-section").classList.remove("hidden"),t.classList.add("hidden")}catch(n){alert("Failed to create pairing token: "+n.message),t.disabled=!1,t.textContent="Generate Pairing Token"}};window.copyPairingCommand=function(){const t=document.getElementById("pairing-command").textContent;navigator.clipboard.writeText(t).then(()=>{alert("Command copied! Run this on your node to connect.")})};window.refreshNodes=async function(){await o.syncNodes(),window.navigate("/nodes")};window.testNode=function(t){const e=o.get("nodes").find(s=>s.id===t);e&&alert(`Node: ${e.name}
Status: ${e.status}
Online: ${e.online?"Yes":"No"}
Last heartbeat: ${e.last_heartbeat?new Date(e.last_heartbeat).toLocaleString():"Never"}`)};setInterval(()=>{window.location.hash==="#/nodes"&&o.syncNodes()},1e4);const v={openai:{name:"OpenAI",icon:"🤖"},anthropic:{name:"Anthropic",icon:"🧠"},google:{name:"Google AI",icon:"🔍"},local:{name:"Local Model",icon:"🏠"},custom:{name:"Custom API",icon:"⚙️"}};function z(){const t=o.getConnectedNodes();return t.length>0?`
    <div class="providers-page">
      <header class="page-header">
        <div class="container">
          <h1>Providers</h1>
          <p class="text-muted">Configure LLM providers per node. Keys stay on nodes.</p>
        </div>
      </header>
      
      <main class="container">
        ${t.map(s=>Y(s)).join("")}
        
        <div class="providers-fallback card">
          <h3>Fallback Order</h3>
          <p class="text-muted">When primary provider fails, try these in order</p>
          ${X()}
        </div>
      </main>
      
      ${Z()}
    </div>
  `:G()}function G(){return`
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
  `}function Y(t){const e=o.get("providers").filter(s=>s.nodeId===t.id);return`
    <div class="node-providers card">
      <div class="node-providers-header">
        <div>
          <h3>${t.name}</h3>
          <span class="badge ${t.status==="connected"?"badge-success":"badge-error"}">${t.status}</span>
        </div>
        <button onclick="showProviderConfigModal('${t.id}')" class="btn btn-primary btn-small">
          + Add Provider
        </button>
      </div>
      
      ${e.length===0?`
        <div class="empty-state-small">
          <p class="text-muted">No providers configured for this node</p>
        </div>
      `:`
        <div class="providers-list">
          ${e.map(s=>J(s)).join("")}
        </div>
      `}
    </div>
  `}function J(t,e){const s=v[t.type]||{name:t.type,icon:"❓"},n={not_configured:{class:"badge-warning",text:"Not Configured"},configured:{class:"badge-success",text:"Configured"},failing:{class:"badge-error",text:"Failing"},testing:{class:"badge-info",text:"Testing..."}},a=n[t.status]||n.not_configured;return`
    <div class="provider-row">
      <div class="provider-info">
        <span class="provider-icon">${s.icon}</span>
        <div>
          <div class="provider-name">${s.name}</div>
          <div class="provider-meta">
            <span class="badge ${a.class}">${a.text}</span>
            ${t.endpointUrl?`<span class="endpoint">${t.endpointUrl}</span>`:""}
          </div>
        </div>
      </div>
      
      <div class="provider-actions">
        <button onclick="testProvider('${t.id}')" class="btn btn-small btn-secondary" ${t.status==="testing"?"disabled":""}>
          ${t.status==="testing"?"Testing...":"Test"}
        </button>
        <button onclick="editProvider('${t.id}')" class="btn btn-small btn-secondary">Edit</button>
        <button onclick="deleteProvider('${t.id}')" class="btn btn-small btn-danger">Delete</button>
      </div>
    </div>
  `}function X(){const t=o.get("providers").filter(e=>e.status==="configured");return t.length===0?'<p class="text-muted">No configured providers available for fallback</p>':`
    <div class="fallback-list">
      ${t.map((e,s)=>{const n=o.get("nodes").find(i=>i.id===e.nodeId),a=v[e.type]||{name:e.type};return`
          <div class="fallback-item">
            <span class="fallback-rank">${s+1}</span>
            <span class="fallback-name">${a.name}</span>
            <span class="fallback-node">on ${(n==null?void 0:n.name)||"Unknown"}</span>
            <div class="fallback-actions">
              ${s>0?`<button onclick="moveProviderUp('${e.id}')" class="btn btn-small">↑</button>`:""}
              ${s<t.length-1?`<button onclick="moveProviderDown('${e.id}')" class="btn btn-small">↓</button>`:""}
            </div>
          </div>
        `}).join("")}
    </div>
  `}function Z(){return`
    <div id="provider-config-modal" class="modal hidden">
      <div class="modal-overlay" onclick="hideProviderConfigModal()"></div>
      <div class="modal-content">
        <h2>Configure Provider</h2>
        <input type="hidden" id="provider-node-id" />
        <input type="hidden" id="provider-id" />
        
        <div class="form-group">
          <label class="form-label">Provider Type</label>
          <select id="provider-type" class="form-select" onchange="onProviderTypeChange()">
            ${Object.entries(v).map(([t,e])=>`<option value="${t}">${e.icon} ${e.name}</option>`).join("")}
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
  `}window.showProviderConfigModal=function(t,e=null){if(document.getElementById("provider-node-id").value=t,document.getElementById("provider-id").value=e||"",e){const s=o.get("providers").find(n=>n.id===e);s&&(document.getElementById("provider-type").value=s.type,document.getElementById("provider-name").value=s.name||"",document.getElementById("provider-endpoint").value=s.endpointUrl||"",document.getElementById("provider-priority").value=s.priority||1)}else document.getElementById("provider-type").value="openai",document.getElementById("provider-name").value="",document.getElementById("provider-endpoint").value="",document.getElementById("provider-priority").value="1";document.getElementById("provider-config-modal").classList.remove("hidden")};window.hideProviderConfigModal=function(){document.getElementById("provider-config-modal").classList.add("hidden")};window.onProviderTypeChange=function(){const t=document.getElementById("provider-type").value,e=document.getElementById("provider-name");if(!e.value){const s=v[t];e.value=s?`My ${s.name}`:""}};window.saveProvider=function(){const t=document.getElementById("provider-node-id").value,e=document.getElementById("provider-id").value,s=document.getElementById("provider-type").value,n=document.getElementById("provider-name").value,a=document.getElementById("provider-endpoint").value,i=parseInt(document.getElementById("provider-priority").value)||1;if(!n.trim()){alert("Please enter a display name");return}const r=o.get("providers");if(e){const d=r.findIndex(l=>l.id===e);d!==-1&&(r[d]={...r[d],type:s,name:n.trim(),endpointUrl:a.trim(),priority:i})}else r.push({id:"provider-"+Date.now(),nodeId:t,type:s,name:n.trim(),endpointUrl:a.trim(),priority:i,status:"not_configured",lastTested:null});o.set("providers",r),hideProviderConfigModal(),window.navigate("/providers")};window.testProvider=async function(t){const e=o.get("providers"),s=e.find(i=>i.id===t);if(!s)return;s.status="testing",o.set("providers",e),window.navigate("/providers"),await new Promise(i=>setTimeout(i,2e3));const n=Math.random()>.3;s.status=n?"configured":"failing",s.lastTested=new Date().toISOString(),o.set("providers",e);const a=e.some(i=>i.status==="configured");o.set("setup.providers.completed",a),window.navigate("/providers")};window.editProvider=function(t){const e=o.get("providers").find(s=>s.id===t);e&&showProviderConfigModal(e.nodeId,t)};window.deleteProvider=function(t){if(!confirm("Delete this provider configuration?"))return;const e=o.get("providers").filter(n=>n.id!==t);o.set("providers",e);const s=e.some(n=>n.status==="configured");o.set("setup.providers.completed",s),window.navigate("/providers")};window.moveProviderUp=function(t){const e=o.get("providers"),s=e.findIndex(n=>n.id===t);s>0&&([e[s],e[s-1]]=[e[s-1],e[s]],o.set("providers",e),window.navigate("/providers"))};window.moveProviderDown=function(t){const e=o.get("providers"),s=e.findIndex(n=>n.id===t);s<e.length-1&&([e[s],e[s+1]]=[e[s+1],e[s]],o.set("providers",e),window.navigate("/providers"))};function ee(){const e=o.get().tasks||[],s=o.hasConnectedNodes();return`
    <div class="tasks-page">
      <header class="page-header">
        <div class="container">
          <h1>Tasks</h1>
          <p class="text-muted">View and manage your tasks</p>
        </div>
      </header>
      
      <main class="container">
        ${te(s)}
        ${se(e,s)}
      </main>
    </div>
  `}function te(t){return`
    <div class="tasks-toolbar">
      <a href="#/tasks/new" class="btn btn-primary ${t?"":"disabled"}">
        + New Task
      </a>
      ${t?"":`
        <span class="toolbar-notice">
          <span class="notice-icon">⚠️</span>
          Add a node to create tasks
        </span>
      `}
      <button onclick="refreshTasks()" class="btn btn-secondary">
        🔄 Refresh
      </button>
    </div>
  `}function se(t,e){return e?t.length===0?`
      <div class="empty-state card">
        <div class="empty-icon">📋</div>
        <h2 class="empty-title">No Tasks Yet</h2>
        <p class="empty-description">Create your first task to get started with AI-powered automation.</p>
        <a href="#/tasks/new" class="btn btn-primary">Create First Task</a>
      </div>
    `:`
    <div class="tasks-list">
      ${t.map(s=>ne(s)).join("")}
    </div>
  `:`
      <div class="blocked-state card">
        <div class="blocked-icon">🔒</div>
        <h2>Tasks Blocked</h2>
        <p>You need at least one connected node to create and run tasks.</p>
        <a href="#/nodes" class="btn btn-primary">Add Node</a>
      </div>
    `}function ne(t){const e={pending:{class:"badge-warning",text:"Pending"},assigned:{class:"badge-info",text:"Assigned"},executing:{class:"badge-info",text:"Executing"},completed:{class:"badge-success",text:"Completed"},failed:{class:"badge-error",text:"Failed"},cancelled:{class:"badge-error",text:"Cancelled"}},s=e[t.status]||e.pending,a=(o.get().nodes||[]).find(i=>i.id===t.node_id);return`
    <div class="task-card card">
      <div class="task-header">
        <div class="task-info">
          <h3 class="task-intent">${t.intent}</h3>
          <div class="task-meta">
            <span class="badge ${s.class}">${s.text}</span>
            ${a?`<span class="task-node">on ${a.name}</span>`:""}
            <span class="task-time">${new Date(t.created_at).toLocaleString()}</span>
          </div>
        </div>
        <div class="task-actions">
          <a href="#/tasks/${t.id}" class="btn btn-small btn-secondary">View</a>
          ${t.status==="pending"?`
            <button onclick="dispatchTaskToNode('${t.id}')" class="btn btn-small btn-primary">Dispatch</button>
          `:""}
        </div>
      </div>
      
      ${t.error?`
        <div class="task-error">
          <span class="error-icon">⚠️</span>
          <span>${t.error}</span>
        </div>
      `:""}
    </div>
  `}function ae(){return o.hasConnectedNodes()?`
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
    `}function ie(t){const s=(o.get().tasks||[]).find(i=>i.id===t);if(!s)return`
      <div class="error-page">
        <h1>Task Not Found</h1>
        <p>The task you're looking for doesn't exist.</p>
        <a href="#/tasks" class="btn btn-primary">Back to Tasks</a>
      </div>
    `;const a=(o.get().nodes||[]).find(i=>i.id===s.node_id);return`
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
                ${a?`
                  <div class="meta-item">
                    <span class="meta-label">Node</span>
                    <span class="meta-value">${a.name}</span>
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
  `}window.submitTask=async function(){const t=document.getElementById("task-intent").value,e=document.getElementById("task-priority").value,s=document.getElementById("task-error"),n=document.getElementById("create-task-btn");if(!t.trim()){s.textContent="Please describe what you want to do",s.classList.remove("hidden");return}const a=o.get().currentWorkspace;if(!a){s.textContent="No workspace selected",s.classList.remove("hidden");return}n.disabled=!0,n.textContent="Creating...";try{await L(a.id,t.trim(),e),o.loadTasks(),window.navigate("/tasks")}catch(i){s.textContent=i.message||"Failed to create task",s.classList.remove("hidden"),n.disabled=!1,n.textContent="Create Task"}};window.dispatchTaskToNode=async function(t){const e=o.get().nodes.filter(n=>n.status==="connected"||n.online);if(e.length===0){alert("No connected nodes available");return}const s=e[0];try{await B(t,s.id),alert(`Task dispatched to ${s.name}`),o.loadTasks(),window.navigate("/tasks")}catch(n){alert("Failed to dispatch task: "+n.message)}};window.refreshTasks=function(){o.loadTasks(),window.navigate("/tasks")};window.loadTaskEvents=async function(t){const e=document.getElementById("task-events-list");e.innerHTML='<p class="text-muted">Loading...</p>';try{const s=await _(t);s.length===0?e.innerHTML='<p class="text-muted">No events yet</p>':e.innerHTML=`
        <div class="events-list">
          ${s.map(n=>`
            <div class="event-item">
              <span class="event-type">${n.event_type}</span>
              <span class="event-time">${new Date(n.created_at).toLocaleTimeString()}</span>
              ${n.payload?`<pre class="event-payload">${JSON.stringify(n.payload,null,2)}</pre>`:""}
            </div>
          `).join("")}
        </div>
      `}catch(s){e.innerHTML=`<p class="text-error">Failed to load events: ${s.message}</p>`}};const oe={type:"object",required:["selected_node_id","required_capabilities","provider_preference","fallback_order","output_location","risk_level","approval_required","estimated_tokens","estimated_cost"],properties:{selected_node_id:{type:"string"},required_capabilities:{type:"array",items:{type:"string"}},provider_preference:{type:"string",enum:["openai","anthropic","google","local","auto"]},fallback_order:{type:"array",items:{type:"string"}},output_location:{type:"object",required:["type","path"],properties:{type:{type:"string",enum:["node_local","dashboard_temp"]},path:{type:"string"}}},risk_level:{type:"string",enum:["low","medium","high","critical"]},approval_required:{type:"boolean"},estimated_tokens:{type:"number",minimum:0},estimated_cost:{type:"number",minimum:0}}};function b(t,e){const s=[];if(e.type&&typeof t!==e.type&&(e.type==="array"&&!Array.isArray(t)?s.push(`Expected array, got ${typeof t}`):e.type==="number"&&typeof t!="number"?s.push(`Expected number, got ${typeof t}`):e.type==="boolean"&&typeof t!="boolean"?s.push(`Expected boolean, got ${typeof t}`):e.type==="object"&&(typeof t!="object"||Array.isArray(t))?s.push(`Expected object, got ${Array.isArray(t)?"array":typeof t}`):["array","number","boolean","object"].includes(e.type)||s.push(`Expected ${e.type}, got ${typeof t}`)),e.required&&typeof t=="object"&&!Array.isArray(t))for(const n of e.required)n in t||s.push(`Missing required field: ${n}`);if(e.enum&&!e.enum.includes(t)&&s.push(`Value must be one of: ${e.enum.join(", ")}`),e.type==="number"&&typeof t=="number"&&e.minimum!==void 0&&t<e.minimum&&s.push(`Value must be >= ${e.minimum}`),e.type==="array"&&Array.isArray(t)&&e.items&&t.forEach((n,a)=>{const i=b(n,e.items);i.valid||s.push(`Item ${a}: ${i.errors.join(", ")}`)}),e.properties&&typeof t=="object"&&!Array.isArray(t)){for(const[n,a]of Object.entries(e.properties))if(n in t){const i=b(t[n],a);i.valid||s.push(`${n}: ${i.errors.join(", ")}`)}}return{valid:s.length===0,errors:s}}async function re(t){console.log("[RoutingBrain] Routing task:",t.intent),await new Promise(f=>setTimeout(f,800));const{intent:e,context:s,constraints:n}=t,a=(s==null?void 0:s.available_nodes)||[],i=(s==null?void 0:s.configured_providers)||[];if(!e||typeof e!="string")throw new Error("Invalid input: intent is required and must be a string");if(!Array.isArray(a))throw new Error("Invalid input: available_nodes must be an array");if(a.length===0)throw new Error("No available nodes for routing");const r=de(e),d=a.filter(f=>ge(f,r));if(d.length===0)throw new Error(`No nodes found with required capabilities: ${r.join(", ")}`);const l=d[0],u=le(e),y=ve(i,u),m=ce(e,n),T={type:"node_local",path:`${l.workspace_path||"./outputs"}/task-${Date.now()}`},k=ue(e),N=pe(k,u),w={selected_node_id:l.id,required_capabilities:r,provider_preference:u,fallback_order:y.length>0?y:["default"],output_location:T,risk_level:m,approval_required:m==="critical"||m==="high",estimated_tokens:k,estimated_cost:N},h=b(w,oe);if(!h.valid)throw console.error("[RoutingBrain] Invalid response schema:",h.errors),new Error(`Routing Brain returned invalid data: ${h.errors.join(", ")}`);return w}function de(t){const e=[],s=t.toLowerCase();return/\b(docker|container|containerize|dockerize|kubernetes|k8s)\b/.test(s)&&e.push("docker"),/\b(gpu|cuda|nvidia|amd|rocm|ml|machine learning|deep learning|ai model|training)\b/.test(s)&&e.push("gpu"),/\b(python|pip|requirements\.txt|setup\.py|pyproject\.toml|django|flask|fastapi)\b/.test(s)&&e.push("python"),/\b(node|nodejs|npm|yarn|package\.json|express|react|vue|angular)\b/.test(s)&&e.push("nodejs"),/\b(golang|go\.mod|go module)\b/.test(s)&&e.push("go"),/\b(rust|cargo|\.rs)\b/.test(s)&&e.push("rust"),/\b(database|postgres|mysql|mongodb|redis|sqlite|sql)\b/.test(s)&&e.push("database"),/\b(server|web server|nginx|apache|http|api|rest|graphql)\b/.test(s)&&e.push("web-server"),/\b(deploy|deployment|production|release|publish|ci\/cd|pipeline)\b/.test(s)&&e.push("deployment"),e.length>0?e:["general"]}function le(t){const e=t.toLowerCase();return/\b(openai|gpt-?4|gpt-?3|chatgpt)\b/.test(e)?"openai":/\b(anthropic|claude)\b/.test(e)?"anthropic":/\b(google|gemini|bard|palm)\b/.test(e)?"google":/\b(local|ollama|llama|self-hosted|on-premise)\b/.test(e)?"local":"auto"}function ce(t,e){const s=t.toLowerCase();return["delete","remove","drop","destroy","purge","production","live","main"].some(r=>s.includes(r))?"critical":["deploy","push","commit","merge","modify","change","update","migrate"].some(r=>s.includes(r))?"high":["create","add","install","build","generate","setup"].some(r=>s.includes(r))?"medium":(e==null?void 0:e.priority)==="critical"?"critical":(e==null?void 0:e.priority)==="high"?"high":"low"}function ue(t){const e=Math.ceil(t.length/4);return Math.max(500,e+1e3)}function pe(t,e){const s={openai:.03,anthropic:.008,google:.005,local:0,auto:.02},n=s[e]||s.auto;return t/1e3*n}function ge(t,e){return!e||e.length===0?!0:!t.capabilities||!Array.isArray(t.capabilities)?!1:e.includes("general")?!0:e.every(s=>t.capabilities.includes(s))}function ve(t,e){if(!t||t.length===0)return[];const s=t.filter(a=>a.status==="configured");if(s.length===0)return[];const n=[...s].sort((a,i)=>(a.priority||99)-(i.priority||99));if(e&&e!=="auto"){const a=n.filter(r=>r.type===e),i=n.filter(r=>r.type!==e);return[...a,...i].map(r=>r.id)}return n.map(a=>a.id)}function me(){const t=o.get("routingRules"),e=o.hasConnectedNodes();return`
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
            ${he(e)}
            ${fe(t)}
          </div>
          
          <div class="routing-sidebar">
            ${be()}
          </div>
        </div>
      </main>
    </div>
  `}function he(t){return`
    <div class="routing-simulator card">
      <h2>Test Routing Brain</h2>
      <p class="text-muted">Enter a task intent to see how the routing brain would handle it</p>
      
      ${t?"":`
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
            ${t?"":"disabled"}
          ></textarea>
        </div>
        
        <div class="form-group">
          <label class="form-label">Priority</label>
          <select id="routing-priority" class="form-select" ${t?"":"disabled"}>
            <option value="low">Low</option>
            <option value="normal" selected>Normal</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        
        <button onclick="simulateRouting()" class="btn btn-primary" ${t?"":"disabled"}>
          Simulate Routing
        </button>
      </div>
      
      <div id="routing-result" class="routing-result hidden">
        <!-- Results rendered here -->
      </div>
    </div>
  `}function fe(t){return`
    <div class="routing-rules card">
      <div class="rules-header">
        <h2>Routing Rules</h2>
        <button onclick="addRoutingRule()" class="btn btn-small btn-primary">+ Add Rule</button>
      </div>
      
      ${t.length===0?`
        <div class="empty-state-small">
          <p class="text-muted">No custom routing rules. Default routing applies.</p>
        </div>
      `:`
        <div class="rules-list">
          ${t.map((e,s)=>`
            <div class="rule-item">
              <div class="rule-pattern">
                <span class="rule-keyword">${e.keyword}</span>
                <span class="rule-arrow">→</span>
                <span class="rule-target">${e.target}</span>
              </div>
              <div class="rule-actions">
                <button onclick="deleteRoutingRule(${s})" class="btn btn-small btn-danger">Delete</button>
              </div>
            </div>
          `).join("")}
        </div>
      `}
    </div>
  `}function be(){const t=o.get("setup.routing.data");return`
    <div class="routing-settings card">
      <h3>Routing Settings</h3>
      
      <div class="form-group">
        <label class="form-label">Default Risk Threshold</label>
        <select id="risk-threshold" class="form-select" onchange="updateRiskThreshold()">
          <option value="low" ${t.defaultRiskThreshold==="low"?"selected":""}>Low - Allow most actions</option>
          <option value="medium" ${t.defaultRiskThreshold==="medium"?"selected":""}>Medium - Moderate caution</option>
          <option value="high" ${t.defaultRiskThreshold==="high"?"selected":""}>High - Strict approval</option>
          <option value="critical" ${t.defaultRiskThreshold==="critical"?"selected":""}>Critical - Require approval</option>
        </select>
      </div>
      
      <div class="form-group">
        <label class="checkbox-label">
          <input type="checkbox" id="fallback-enabled" ${t.fallbackEnabled!==!1?"checked":""} onchange="updateFallbackEnabled()" />
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
  `}window.simulateRouting=async function(){const t=document.getElementById("routing-intent").value,e=document.getElementById("routing-priority").value,s=document.getElementById("routing-result");if(!t.trim()){alert("Please enter a task intent");return}s.innerHTML='<div class="routing-loading"><div class="spinner"></div><p>Analyzing intent...</p></div>',s.classList.remove("hidden");try{const n=o.getConnectedNodes(),a=o.getWorkingProviders(),i=await re({intent:t,context:{available_nodes:n,configured_providers:a},constraints:{priority:e}});if(!i.selected_node_id||!i.risk_level)throw new Error("Invalid routing decision: missing required fields");const r=n.find(d=>d.id===i.selected_node_id);s.innerHTML=`
      <div class="routing-decision">
        <h3>Routing Decision</h3>
        
        <div class="decision-section">
          <h4>Selected Node</h4>
          <div class="decision-value">
            <span class="node-badge">${(r==null?void 0:r.name)||"Unknown"}</span>
            <span class="badge ${i.risk_level==="critical"?"badge-error":i.risk_level==="high"?"badge-warning":"badge-success"}">${i.risk_level} risk</span>
          </div>
        </div>
        
        <div class="decision-section">
          <h4>Required Capabilities</h4>
          <div class="capabilities-list">
            ${i.required_capabilities.map(d=>`<span class="capability-tag">${d}</span>`).join("")}
          </div>
        </div>
        
        <div class="decision-section">
          <h4>Provider Preference</h4>
          <div class="decision-value">${i.provider_preference}</div>
        </div>
        
        <div class="decision-section">
          <h4>Fallback Order</h4>
          <ol class="fallback-list">
            ${i.fallback_order.map(d=>{const l=a.find(u=>u.id===d);return`<li>${(l==null?void 0:l.name)||d}</li>`}).join("")}
          </ol>
        </div>
        
        <div class="decision-section">
          <h4>Output Location</h4>
          <code class="output-path">${i.output_location.path}</code>
        </div>
        
        <div class="decision-section">
          <h4>Approval Required</h4>
          <div class="decision-value">
            ${i.approval_required?'<span class="badge badge-warning">Yes - Requires approval</span>':'<span class="badge badge-success">No - Auto-approved</span>'}
          </div>
        </div>
        
        <div class="decision-section">
          <h4>Estimated Cost</h4>
          <div class="decision-value">
            ~${i.estimated_tokens.toLocaleString()} tokens
            (${i.estimated_cost===0?"Free":"$"+i.estimated_cost.toFixed(4)})
          </div>
        </div>
        
        <div class="decision-actions">
          <button onclick="createTaskFromRouting('${encodeURIComponent(t)}')" class="btn btn-primary">
            Create Task with This Routing
          </button>
          <button onclick="hideRoutingResult()" class="btn btn-secondary">
            Dismiss
          </button>
        </div>
      </div>
    `,o.set("setup.routing.completed",!0)}catch(n){s.innerHTML=`
      <div class="routing-error">
        <span class="error-icon">❌</span>
        <h4>Routing Failed</h4>
        <p>${n.message}</p>
        <button onclick="simulateRouting()" class="btn btn-secondary">Retry</button>
      </div>
    `}};window.hideRoutingResult=function(){document.getElementById("routing-result").classList.add("hidden")};window.createTaskFromRouting=function(t){const e=decodeURIComponent(t);localStorage.setItem("kdashx2-new-task-intent",e),window.navigate("/tasks/new")};window.addRoutingRule=function(){const t=prompt("Enter keyword to match:");if(!t)return;const e=prompt("Enter target action:");if(!e)return;const s=o.get("routingRules");s.push({keyword:t.toLowerCase(),target:e,priority:100}),o.set("routingRules",s),window.navigate("/routing")};window.deleteRoutingRule=function(t){if(!confirm("Delete this rule?"))return;const e=o.get("routingRules");e.splice(t,1),o.set("routingRules",e),window.navigate("/routing")};window.updateRiskThreshold=function(){const t=document.getElementById("risk-threshold").value;o.set("setup.routing.data.defaultRiskThreshold",t)};window.updateFallbackEnabled=function(){const t=document.getElementById("fallback-enabled").checked;o.set("setup.routing.data.fallbackEnabled",t)};const ye={workspace:"🏢",nodes:"🖥️",storage:"💾",providers:"🔌",routing:"📡",healthChecks:"✅"},ke={workspace:"#/setup/workspace",nodes:"#/nodes",storage:"#/setup/storage",providers:"#/providers",routing:"#/routing",healthChecks:"#/setup/health"};function we(){var s,n;const t=o.getSetupProgress(),e=o.get("auth");return`
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
              ${t.modules.map(a=>$e(a)).join("")}
            </div>
            
            ${t.percentage<100?`
              <a href="#/setup" class="btn btn-primary btn-full">
                Continue Setup (${t.percentage}%)
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
                <span class="field-value">${((s=e.user)==null?void 0:s.email)||"Not set"}</span>
              </div>
              <div class="account-field">
                <span class="field-label">Name</span>
                <span class="field-value">${((n=e.user)==null?void 0:n.name)||"Not set"}</span>
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
  `}function $e(t){const e=ye[t.name],s=ke[t.name],n=t.completed;return`
    <a href="${s}" class="module-link ${n?"completed":"pending"}">
      <span class="module-icon">${e}</span>
      <div class="module-info">
        <span class="module-name">${t.label}</span>
        <span class="module-status">
          ${n?'<span class="badge badge-success">✓ Complete</span>':'<span class="badge badge-warning">○ Pending</span>'}
        </span>
      </div>
      <span class="module-arrow">→</span>
    </a>
  `}window.logout=function(){confirm("Sign out of Mission Control?")&&(o.set("auth",{isAuthenticated:!1,user:null,token:null}),window.navigate("/login"))};window.resetAllData=function(){if(confirm(`WARNING: This will delete ALL data including nodes, tasks, and settings.

This cannot be undone.

Are you sure?`)){if(!confirm('Final confirmation: Type "RESET" to confirm')&&prompt('Type "RESET" to confirm complete data reset:')!=="RESET"){alert("Reset cancelled");return}o.reset(),alert("All data has been reset"),window.navigate("/setup")}};const g={"/":{render:$,requiresAuth:!0},"/login":{render:M,requiresAuth:!1,redirectIfAuthed:"/dashboard"},"/setup":{render:q,requiresAuth:!0},"/dashboard":{render:$,requiresAuth:!0,blockedBy:["NODE_REQUIRED"]},"/nodes":{render:W,requiresAuth:!0},"/providers":{render:z,requiresAuth:!0,blockedBy:["NODE_REQUIRED"]},"/tasks":{render:ee,requiresAuth:!0,blockedBy:["NODE_REQUIRED"]},"/tasks/new":{render:ae,requiresAuth:!0,blockedBy:["NODE_REQUIRED","PROVIDER_REQUIRED"]},"/tasks/:id":{render:t=>ie(t),requiresAuth:!0,blockedBy:["NODE_REQUIRED"],dynamic:!0},"/routing":{render:me,requiresAuth:!0,blockedBy:["NODE_REQUIRED"]},"/settings":{render:we,requiresAuth:!0},"/billing":{render:()=>"<h1>Billing</h1><p>Coming soon.</p>",requiresAuth:!0},"/locked":{render:Ee,requiresAuth:!0}};function Ce(t){const e=g[t]||g["/dashboard"],s=o.get("auth"),n=o.getBlocks();if(e.requiresAuth&&!s.isAuthenticated)return{allowed:!1,redirect:"/login"};if(!e.requiresAuth&&s.isAuthenticated&&e.redirectIfAuthed)return{allowed:!1,redirect:e.redirectIfAuthed};if(e.requiresAuth&&!o.isSetupComplete()&&t!=="/setup")return{allowed:!1,redirect:"/setup"};if(e.blockedBy&&o.isSetupComplete())for(const a of e.blockedBy){const i=n.find(r=>r.id===a);if(i)return{allowed:!1,blockedBy:i}}return{allowed:!0}}function Ee(){const e=o.getBlocks()[0]||{message:"Setup required",cta:{text:"Go to Setup",href:"#/setup"}};return`
    <div class="locked-page">
      <div class="locked-content">
        <div class="lock-icon">🔒</div>
        <h1>Action Blocked</h1>
        <p class="block-message">${e.message}</p>
        <div class="block-actions">
          <a href="${e.cta.href}" class="btn btn-primary">${e.cta.text}</a>
          <a href="#/setup" class="btn btn-secondary">Setup Center</a>
        </div>
      </div>
    </div>
  `}async function p(t,e=!1){e||window.history.pushState({},"",t);const s=Ce(t);if(!s.allowed){if(s.redirect){p(s.redirect,!0);return}if(s.blockedBy){window.__currentBlock=s.blockedBy,C("/locked");return}}await C(t)}async function C(t){const e=document.getElementById("app"),s=g[t]||g["/dashboard"];e.innerHTML='<div class="loading-screen"><div class="spinner"></div><p>Loading...</p></div>';try{if(o.get("auth").isAuthenticated&&!o.isSetupComplete()&&t!=="/setup"&&t!=="/login"){const a=await s.render();e.innerHTML=Te()+a}else{const a=await s.render();e.innerHTML=a}Ne()}catch(n){console.error("Render error:",n),e.innerHTML=`
      <div class="error-screen">
        <h1>Error Loading Page</h1>
        <p>${n.message||"Something went wrong"}</p>
        <button onclick="navigate('/dashboard')" class="btn btn-primary">Go Home</button>
      </div>
    `}}function Te(){const t=o.getSetupProgress();return`
    <div class="setup-banner">
      <div class="setup-banner-content">
        <span class="setup-icon">⚙️</span>
        <div class="setup-info">
          <span class="setup-title">Setup in Progress</span>
          <div class="setup-progress-bar">
            <div class="setup-progress-fill" style="width: ${t.percentage}%"></div>
          </div>
          <span class="setup-percentage">${t.percentage}%</span>
        </div>
        <a href="#/setup" class="btn btn-small btn-primary">Continue Setup</a>
      </div>
    </div>
  `}function Ne(){document.querySelectorAll('a[href^="#"]').forEach(t=>{t.addEventListener("click",e=>{const s=t.getAttribute("href");s.startsWith("#")&&(e.preventDefault(),p(s.replace("#","")))})})}window.addEventListener("popstate",()=>{p(window.location.pathname.replace("/KDashX3","")||"/",!0)});document.addEventListener("DOMContentLoaded",()=>{const t=window.location.pathname.replace("/KDashX3","")||"/";p(t,!0)});window.navigate=p;window.store=o;
