/**
 * KDashX3 Main Entry Point
 * 
 * Sets up the SPA router with route guards and renders the application
 */

import { store } from './lib/store.js';
import { renderLogin } from './pages/login.js';
import { renderSetup } from './pages/setup.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderNodes } from './pages/nodes.js';
import { renderProviders } from './pages/providers.js';
import { renderTasks, renderNewTask, renderTaskDetail } from './pages/tasks.js';
import { renderRouting } from './pages/routing.js';
import { renderSettings } from './pages/settings.js';
import './styles.css';

// Route definitions with metadata
const routes = {
  '/': { 
    render: renderDashboard, 
    requiresAuth: true,
    blockedBy: ['NODE_REQUIRED'] 
  },
  '/login': { 
    render: renderLogin, 
    requiresAuth: false,
    redirectIfAuthed: '/dashboard'
  },
  '/setup': { 
    render: renderSetup, 
    requiresAuth: true 
  },
  '/dashboard': { 
    render: renderDashboard, 
    requiresAuth: true,
    blockedBy: ['NODE_REQUIRED']
  },
  '/nodes': { 
    render: renderNodes, 
    requiresAuth: true 
  },
  '/providers': { 
    render: renderProviders, 
    requiresAuth: true,
    blockedBy: ['NODE_REQUIRED']
  },
  '/tasks': { 
    render: renderTasks, 
    requiresAuth: true,
    blockedBy: ['NODE_REQUIRED']
  },
  '/tasks/new': { 
    render: renderNewTask, 
    requiresAuth: true,
    blockedBy: ['NODE_REQUIRED', 'PROVIDER_REQUIRED']
  },
  '/tasks/:id': { 
    render: (id) => renderTaskDetail(id), 
    requiresAuth: true,
    blockedBy: ['NODE_REQUIRED'],
    dynamic: true
  },
  '/routing': { 
    render: renderRouting, 
    requiresAuth: true,
    blockedBy: ['NODE_REQUIRED']
  },
  '/settings': { 
    render: renderSettings, 
    requiresAuth: true 
  },
  '/billing': { 
    render: () => '<h1>Billing</h1><p>Coming soon.</p>', 
    requiresAuth: true 
  },
  '/locked': { 
    render: renderLocked, 
    requiresAuth: true 
  }
};

// Route guard check
function checkRouteAccess(path) {
  const route = routes[path] || routes['/dashboard'];
  const auth = store.get('auth');
  const blocks = store.getBlocks();
  
  // Check auth
  if (route.requiresAuth && !auth.isAuthenticated) {
    return { allowed: false, redirect: '/login' };
  }
  
  // Redirect if already authed
  if (!route.requiresAuth && auth.isAuthenticated && route.redirectIfAuthed) {
    return { allowed: false, redirect: route.redirectIfAuthed };
  }
  
  // Check blocks
  if (route.blockedBy) {
    for (const blockId of route.blockedBy) {
      const block = blocks.find(b => b.id === blockId);
      if (block) {
        return { allowed: false, blockedBy: block };
      }
    }
  }
  
  return { allowed: true };
}

// Render locked page
function renderLocked() {
  const blocks = store.getBlocks();
  const block = blocks[0] || { message: 'Setup required', cta: { text: 'Go to Setup', href: '#/setup' } };
  
  return `
    <div class="locked-page">
      <div class="locked-content">
        <div class="lock-icon">🔒</div>
        <h1>Action Blocked</h1>
        <p class="block-message">${block.message}</p>
        <div class="block-actions">
          <a href="${block.cta.href}" class="btn btn-primary">${block.cta.text}</a>
          <a href="#/setup" class="btn btn-secondary">Setup Center</a>
        </div>
      </div>
    </div>
  `;
}

// Navigate to a route
export async function navigate(path, skipHistory = false) {
  // Update URL
  if (!skipHistory) {
    window.history.pushState({}, '', path);
  }
  
  // Check access
  const access = checkRouteAccess(path);
  
  if (!access.allowed) {
    if (access.redirect) {
      navigate(access.redirect, true);
      return;
    }
    if (access.blockedBy) {
      // Store block info and show locked page
      window.__currentBlock = access.blockedBy;
      renderRoute('/locked');
      return;
    }
  }
  
  await renderRoute(path);
}

// Render a specific route
async function renderRoute(path) {
  const app = document.getElementById('app');
  const route = routes[path] || routes['/dashboard'];
  
  // Show loading
  app.innerHTML = '<div class="loading-screen"><div class="spinner"></div><p>Loading...</p></div>';
  
  try {
    // Check if setup is needed
    const auth = store.get('auth');
    if (auth.isAuthenticated && !store.isSetupComplete() && path !== '/setup' && path !== '/login') {
      // Show setup banner but still render the page
      const content = await route.render();
      app.innerHTML = renderSetupBanner() + content;
    } else {
      const content = await route.render();
      app.innerHTML = content;
    }
    
    // Attach navigation handlers
    attachNavHandlers();
    
  } catch (err) {
    console.error('Render error:', err);
    app.innerHTML = `
      <div class="error-screen">
        <h1>Error Loading Page</h1>
        <p>${err.message || 'Something went wrong'}</p>
        <button onclick="navigate('/dashboard')" class="btn btn-primary">Go Home</button>
      </div>
    `;
  }
}

// Render setup banner
function renderSetupBanner() {
  const progress = store.getSetupProgress();
  
  return `
    <div class="setup-banner">
      <div class="setup-banner-content">
        <span class="setup-icon">⚙️</span>
        <div class="setup-info">
          <span class="setup-title">Setup in Progress</span>
          <div class="setup-progress-bar">
            <div class="setup-progress-fill" style="width: ${progress.percentage}%"></div>
          </div>
          <span class="setup-percentage">${progress.percentage}%</span>
        </div>
        <a href="#/setup" class="btn btn-small btn-primary">Continue Setup</a>
      </div>
    </div>
  `;
}

// Attach click handlers to navigation links
function attachNavHandlers() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href.startsWith('#')) {
        e.preventDefault();
        navigate(href.replace('#', ''));
      }
    });
  });
}

// Handle browser back/forward
window.addEventListener('popstate', () => {
  navigate(window.location.pathname.replace('/KDashX3', '') || '/', true);
});

// Initial render
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname.replace('/KDashX3', '') || '/';
  navigate(path, true);
});

// Make navigate available globally
window.navigate = navigate;

// Debug helper
window.store = store;
