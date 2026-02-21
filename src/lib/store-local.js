/**
 * KDashX3 Store - Single Source of Truth
 * 
 * In-memory state management with localStorage as cache only.
 * All app logic uses this store, not localStorage directly.
 */

// Initial state
const initialState = {
  // Auth
  auth: {
    isAuthenticated: false,
    user: null,
    token: null
  },
  
  // Setup progress
  setup: {
    workspace: {
      completed: false,
      data: {
        orgName: '',
        timezone: 'UTC',
        notifications: { email: true, webhook: false }
      }
    },
    nodes: {
      completed: false,
      data: {
        nodes: [] // Array of node objects
      }
    },
    storage: {
      completed: false,
      data: {
        allowedFolders: [],
        defaultOutputFolder: './outputs',
        maxFileSize: 100 * 1024 * 1024 // 100MB
      }
    },
    providers: {
      completed: false,
      data: {
        providers: [], // Array of provider configs
        fallbackOrder: []
      }
    },
    routing: {
      completed: false,
      data: {
        rules: [],
        defaultRiskThreshold: 'medium'
      }
    },
    healthChecks: {
      completed: false,
      data: {
        lastCheck: null,
        results: {}
      }
    }
  },
  
  // Entities
  nodes: [],
  providers: [],
  tasks: [],
  routingRules: [],
  
  // UI state
  ui: {
    loading: {},
    errors: {},
    toasts: []
  }
};

// Deep merge helper
function deepMerge(target, source) {
  const result = { ...target };
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

class Store {
  constructor() {
    this.state = deepMerge({}, initialState);
    this.listeners = new Set();
    this.loadFromCache();
  }
  
  // Subscribe to state changes
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  // Notify listeners
  notify(path) {
    this.listeners.forEach(listener => listener(this.state, path));
  }
  
  // Get state (clone to prevent mutations)
  get(path = null) {
    if (!path) return deepMerge({}, this.state);
    
    const keys = path.split('.');
    let value = this.state;
    for (const key of keys) {
      if (value === undefined || value === null) return undefined;
      value = value[key];
    }
    return deepMerge({}, value);
  }
  
  // Set state (immutable update)
  set(path, value) {
    const keys = path.split('.');
    const newState = deepMerge({}, this.state);
    let target = newState;
    
    for (let i = 0; i < keys.length - 1; i++) {
      target[keys[i]] = deepMerge({}, target[keys[i]]);
      target = target[keys[i]];
    }
    
    target[keys[keys.length - 1]] = value;
    this.state = newState;
    
    this.persistToCache();
    this.notify(path);
  }
  
  // Update nested state
  update(path, updater) {
    const current = this.get(path);
    const updated = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
    this.set(path, updated);
  }
  
  // Load from localStorage (cache only)
  loadFromCache() {
    try {
      const cached = localStorage.getItem('kdashx3-store');
      if (cached) {
        const parsed = JSON.parse(cached);
        this.state = deepMerge(initialState, parsed);
      }
    } catch (err) {
      console.warn('Failed to load from cache:', err);
    }
  }
  
  // Persist to localStorage (cache only)
  persistToCache() {
    try {
      localStorage.setItem('kdashx3-store', JSON.stringify(this.state));
    } catch (err) {
      console.warn('Failed to persist to cache:', err);
    }
  }
  
  // Reset state
  reset() {
    this.state = deepMerge({}, initialState);
    this.persistToCache();
    this.notify('reset');
  }
  
  // === Computed Getters ===
  
  getSetupProgress() {
    const modules = ['workspace', 'nodes', 'storage', 'providers', 'routing', 'healthChecks'];
    const completed = modules.filter(m => this.state.setup[m].completed).length;
    return {
      completed,
      total: modules.length,
      percentage: Math.round((completed / modules.length) * 100),
      modules: modules.map(m => ({
        name: m,
        completed: this.state.setup[m].completed,
        label: this.getModuleLabel(m)
      }))
    };
  }
  
  getModuleLabel(module) {
    const labels = {
      workspace: 'Workspace',
      nodes: 'Nodes',
      storage: 'Storage & Permissions',
      providers: 'Providers',
      routing: 'Routing Defaults',
      healthChecks: 'Health Checks'
    };
    return labels[module] || module;
  }
  
  isSetupComplete() {
    const progress = this.getSetupProgress();
    return progress.percentage === 100;
  }
  
  hasConnectedNodes() {
    return this.state.nodes.some(n => n.status === 'connected');
  }
  
  getConnectedNodes() {
    return this.state.nodes.filter(n => n.status === 'connected');
  }
  
  hasWorkingProvider() {
    return this.state.providers.some(p => p.status === 'configured');
  }
  
  getWorkingProviders() {
    return this.state.providers.filter(p => p.status === 'configured');
  }
  
  canExecuteTasks() {
    return this.hasConnectedNodes();
  }
  
  canExecuteLLMTasks() {
    return this.hasConnectedNodes() && this.hasWorkingProvider();
  }
  
  getBlocks() {
    const blocks = [];
    
    if (!this.hasConnectedNodes()) {
      blocks.push({
        id: 'NODE_REQUIRED',
        message: 'Connect at least one node to execute tasks',
        cta: { text: 'Add Node', href: '#/nodes' }
      });
    }
    
    if (!this.hasWorkingProvider()) {
      blocks.push({
        id: 'PROVIDER_REQUIRED',
        message: 'Configure at least one provider to use AI features',
        cta: { text: 'Configure Providers', href: '#/providers' }
      });
    }
    
    return blocks;
  }
}

// Export singleton
export const store = new Store();

// Export for testing
export { Store };
