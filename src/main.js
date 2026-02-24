/**
 * KDashX3 Main Entry Point
 * 
 * Sets up the SPA router with route guards and renders the application
 */

import { store } from './lib/store.js';
import { renderLogin } from './pages/login.js';
import { renderSetup, renderWorkspaceSetup, renderStorageSetup, renderHealthChecks } from './pages/setup.js';
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
    requiresAuth: true
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
  '/setup/workspace': { 
    render: renderWorkspaceSetup, 
    requiresAuth: true 
  },
  '/setup/storage': { 
    render: renderStorageSetup, 
    requiresAuth: true 
  },
  '/setup/health': { 
    render: renderHealthChecks, 
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

// Global Header Component
function renderGlobalHeader(currentPath) {
  const auth = store.get('auth');
  if (!auth.isAuthenticated) return '';
  
  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/nodes', label: 'Nodes' },
    { path: '/providers', label: 'Providers' },
    { path: '/routing', label: 'Routing' },
    { path: '/settings', label: 'Settings' }
  ];
  
  const navLinks = navItems.map(item => {
    const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');
    return `<a href="#${item.path}" class="${isActive ? 'active' : ''}">${item.label}</a>`;
  }).join('');
  
  return `
    <header class="global-header">
      <div class="container">
        <div class="header-brand">
          <img src="assets/brand/KDashX3.png" alt="KDashX3" class="header-logo">
          <span class="header-title">KDashX3</span>
        </div>
        <nav class="header-nav">
          ${navLinks}
        </nav>
        <div class="header-user">
          <div class="user-menu">
            <button class="user-menu-btn" onclick="toggleUserMenu()">
              <span>👤</span>
              <span>${auth.user?.email?.split('@')[0] || 'User'}</span>
              <span>▼</span>
            </button>
            <div id="user-dropdown" class="user-dropdown hidden">
              <button onclick="handleLogout()">🚪 Logout</button>
            </div>
          </div>
        </div>
      </div>
    </header>
  `;
}

// Toggle user menu dropdown
window.toggleUserMenu = function() {
  const dropdown = document.getElementById('user-dropdown');
  if (dropdown) {
    dropdown.classList.toggle('hidden');
  }
};

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  const userMenu = document.querySelector('.user-menu');
  const dropdown = document.getElementById('user-dropdown');
  if (userMenu && dropdown && !userMenu.contains(e.target)) {
    dropdown.classList.add('hidden');
  }
});

// Logout handler
window.handleLogout = function() {
  store.logout();
  window.location.hash = '/login';
  navigate('/login', true);
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

  // If setup is not complete, redirect to setup (except for setup pages)
  if (route.requiresAuth && !store.isSetupComplete() && !path.startsWith('/setup')) {
    return { allowed: false, redirect: '/setup' };
  }

  // Check blocks (only after setup is complete)
  if (route.blockedBy && store.isSetupComplete()) {
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

// Navigate to a route (Hash-based for GitHub Pages)
export async function navigate(path, skipHistory = false) {
  // Ensure path starts with /
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  
  // Update URL using hash (for GitHub Pages SPA support)
  if (!skipHistory) {
    window.location.hash = path;
  }
  
  // Check access
  const access = checkRouteAccess(path);
  
  if (!access.allowed) {
    if (access.redirect) {
      // Update URL to reflect the redirect
      window.location.hash = access.redirect;
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
  const auth = store.get('auth');
  
  // Show loading with logo
  app.innerHTML = `
    <div class="loading-screen">
      <img src="assets/brand/KDashX3.png" alt="KDashX3" class="loading-logo">
      <div class="spinner"></div>
      <p>Loading...</p>
    </div>
  `;
  
  // Small delay to show loading animation
  await new Promise(resolve => setTimeout(resolve, 300));
  
  try {
    // Check if setup is needed (allow /setup and all /setup/* sub-routes)
    const isSetupRoute = path === '/setup' || path.startsWith('/setup/');
    const isLoginPage = path === '/login';
    
    // Render global header for authenticated pages
    const globalHeader = !isLoginPage ? renderGlobalHeader(path) : '';
    
    if (auth.isAuthenticated && !store.isSetupComplete() && !isSetupRoute && !isLoginPage) {
      // Show setup banner but still render the page
      const content = await route.render();
      app.innerHTML = globalHeader + renderSetupBanner() + content;
    } else {
      const content = await route.render();
      app.innerHTML = globalHeader + content;
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
  document.querySelectorAll('a[href^="#/"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href.startsWith('#/')) {
        e.preventDefault();
        navigate(href.slice(1)); // Remove the # and navigate
      }
    });
  });
}

// Handle hash changes (for GitHub Pages SPA)
window.addEventListener('hashchange', () => {
  const path = window.location.hash.slice(1) || '/';
  navigate(path, true);
});

// Initial render - read from hash
document.addEventListener('DOMContentLoaded', () => {
  // Read path from hash, fallback to /
  const path = window.location.hash.slice(1) || '/';
  navigate(path, true);
});

// Make navigate available globally
window.navigate = navigate;

// Debug helper
window.store = store;
