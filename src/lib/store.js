/**
 * KDashX3 Store - Syncs with Backend API
 */

import * as api from './api.js';

class Store {
  constructor() {
    this.state = this.loadFromCache();
    this.listeners = new Set();
    this.syncInterval = null;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(path) {
    this.listeners.forEach(listener => listener(this.state, path));
  }

  get(path = null) {
    if (!path) return { ...this.state };
    return path.split('.').reduce((obj, key) => obj?.[key], this.state);
  }

  set(path, value) {
    const keys = path.split('.');
    const newState = { ...this.state };
    let target = newState;
    
    for (let i = 0; i < keys.length - 1; i++) {
      target[keys[i]] = { ...target[keys[i]] };
      target = target[keys[i]];
    }
    
    target[keys[keys.length - 1]] = value;
    this.state = newState;
    this.persistToCache();
    this.notify(path);
  }

  loadFromCache() {
    try {
      const cached = localStorage.getItem('kdashx3-store');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      console.warn('Failed to load from cache:', err);
    }
    
    return {
      auth: {
        isAuthenticated: false,
        token: null,
        user: null
      },
      workspace: null,
      nodes: [],
      providers: [],
      tasks: [],
      setup: {
        workspace: { completed: false, data: {} },
        nodes: { completed: false, data: {} },
        storage: { completed: false, data: {} },
        providers: { completed: false, data: {} },
        routing: { completed: false, data: {} },
        healthChecks: { completed: false, data: {} }
      },
      ui: { loading: {}, errors: {} }
    };
  }

  persistToCache() {
    try {
      localStorage.setItem('kdashx3-store', JSON.stringify(this.state));
    } catch (err) {
      console.warn('Failed to persist to cache:', err);
    }
  }

  // Auth actions
  async login(email, password) {
    const response = await api.login(email, password);
    localStorage.setItem('kdashx3-token', response.token);
    this.set('auth', {
      isAuthenticated: true,
      token: response.token,
      user: response.user
    });
    this.set('workspace', response.workspace);
    return response;
  }

  async register(email, password) {
    const response = await api.register(email, password);
    localStorage.setItem('kdashx3-token', response.token);
    this.set('auth', {
      isAuthenticated: true,
      token: response.token,
      user: response.user
    });
    this.set('workspace', response.workspace);
    return response;
  }

  logout() {
    localStorage.removeItem('kdashx3-token');
    localStorage.removeItem('kdashx3-store');
    this.state = this.loadFromCache();
    this.notify('logout');
  }

  // Data sync
  async syncNodes() {
    try {
      const nodes = await api.getNodes();
      this.set('nodes', nodes);
      return nodes;
    } catch (err) {
      console.error('Failed to sync nodes:', err);
      return [];
    }
  }

  async syncTasks() {
    try {
      const tasks = await api.getTasks();
      this.set('tasks', tasks);
      return tasks;
    } catch (err) {
      console.error('Failed to sync tasks:', err);
      return [];
    }
  }

  // Computed getters
  hasNodes() {
    // PAIRED: Node exists in workspace (regardless of online status)
    return this.state.nodes.length > 0;
  }

  hasConnectedNodes() {
    // ONLINE: Node has active session (online flag from backend)
    return this.state.nodes.some(n => n.online && n.status === 'connected');
  }

  getConnectedNodes() {
    return this.state.nodes.filter(n => n.online && n.status === 'connected');
  }

  isSetupComplete() {
    // Check if user has workspace and at least one node
    return this.state.workspace && this.state.nodes.length > 0;
  }

  // Provider checks
  hasWorkingProvider() {
    return this.state.providers && this.state.providers.some(p => p.status === 'configured');
  }

  getWorkingProviders() {
    return this.state.providers ? this.state.providers.filter(p => p.status === 'configured') : [];
  }

  // Get blocking conditions for route guards
  getBlocks() {
    const blocks = [];

    if (!this.hasNodes()) {
      // No nodes at all - need to pair one
      blocks.push({
        id: 'NODE_REQUIRED',
        message: 'Connect at least one node to execute tasks',
        cta: { text: 'Add Node', href: '#/nodes' }
      });
    } else if (!this.hasConnectedNodes()) {
      // Has nodes but none online - need to start connector
      blocks.push({
        id: 'NODE_OFFLINE',
        message: 'Node paired. Start the connector on your node to go online.',
        cta: { text: 'Go to Nodes', href: '#/nodes' }
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

  // Setup progress tracking
  getSetupProgress() {
    const modules = ['workspace', 'nodes', 'storage', 'providers', 'routing', 'healthChecks'];
    const setup = this.state.setup || {};

    // Derive nodes completion from actual node state (has online nodes = complete)
    const nodesCompleted = this.hasConnectedNodes();

    const completed = modules.filter(m => {
      if (m === 'nodes') return nodesCompleted;
      return setup[m]?.completed;
    }).length;

    return {
      completed,
      total: modules.length,
      percentage: Math.round((completed / modules.length) * 100),
      modules: modules.map(m => ({
        name: m,
        completed: m === 'nodes' ? nodesCompleted : (setup[m]?.completed || false),
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
      routing: 'Routing Rules',
      healthChecks: 'Health Checks'
    };
    return labels[module] || module;
  }
}

export const store = new Store();
