import { getWorkspaces, getNodes, getTasks, getMe } from './api-real.js';

class RealStore {
  constructor() {
    this.state = {
      auth: {
        isAuthenticated: !!localStorage.getItem('kdashx3-auth-token'),
        user: null,
        token: localStorage.getItem('kdashx3-auth-token')
      },
      currentWorkspace: null,
      nodes: [],
      tasks: [],
      refreshInterval: null
    };
    this.listeners = new Set();
    this.init();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(l => l(this.state));
  }

  async init() {
    if (this.state.auth.token) {
      try {
        const me = await getMe();
        this.state.auth.user = me.user;
        await this.loadWorkspaces();
        this.startAutoRefresh();
      } catch (err) {
        console.error('Init failed:', err);
        this.logout();
      }
    }
  }

  async loadWorkspaces() {
    try {
      const workspaces = await getWorkspaces();
      if (workspaces.length > 0 && !this.state.currentWorkspace) {
        this.setWorkspace(workspaces[0]);
      }
      return workspaces;
    } catch (err) {
      console.error('Failed to load workspaces:', err);
      return [];
    }
  }

  setWorkspace(workspace) {
    this.state.currentWorkspace = workspace;
    this.loadNodes();
    this.loadTasks();
    this.notify();
  }

  async loadNodes() {
    if (!this.state.currentWorkspace) return;
    try {
      this.state.nodes = await getNodes(this.state.currentWorkspace.id);
      this.notify();
    } catch (err) {
      console.error('Failed to load nodes:', err);
    }
  }

  async loadTasks() {
    if (!this.state.currentWorkspace) return;
    try {
      this.state.tasks = await getTasks(this.state.currentWorkspace.id);
      this.notify();
    } catch (err) {
      console.error('Failed to load tasks:', err);
    }
  }

  startAutoRefresh() {
    // Refresh nodes and tasks every 10 seconds
    this.state.refreshInterval = setInterval(() => {
      if (this.state.currentWorkspace) {
        this.loadNodes();
        this.loadTasks();
      }
    }, 10000);
  }

  stopAutoRefresh() {
    if (this.state.refreshInterval) {
      clearInterval(this.state.refreshInterval);
    }
  }

  setAuth(token, user) {
    this.state.auth = { isAuthenticated: true, token, user };
    localStorage.setItem('kdashx3-auth-token', token);
    this.startAutoRefresh();
    this.notify();
  }

  logout() {
    this.stopAutoRefresh();
    this.state.auth = { isAuthenticated: false, user: null, token: null };
    this.state.currentWorkspace = null;
    this.state.nodes = [];
    this.state.tasks = [];
    localStorage.removeItem('kdashx3-auth-token');
    this.notify();
  }

  get() {
    return this.state;
  }

  hasConnectedNodes() {
    return this.state.nodes.some(n => n.status === 'connected' || n.online);
  }
}

export const realStore = new RealStore();
