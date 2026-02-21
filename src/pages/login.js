/**
 * Login Page
 */

import { store } from '../lib/store.js';

export function renderLogin() {
  // Check if already authenticated
  const auth = store.get('auth');
  if (auth.isAuthenticated) {
    window.navigate('/dashboard');
    return '';
  }

  return `
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
  `;
}

// Handle login
window.handleLogin = async function() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const errorEl = document.getElementById('login-error');
  const btn = document.getElementById('login-btn');
  
  // Basic validation
  if (!email || !password) {
    errorEl.textContent = 'Please enter email and password';
    errorEl.classList.remove('hidden');
    return;
  }
  
  // Show loading
  btn.disabled = true;
  btn.textContent = 'Signing in...';
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update store
    store.set('auth', {
      isAuthenticated: true,
      user: {
        id: 'user-' + Date.now(),
        email: email,
        name: email.split('@')[0]
      },
      token: 'mock-jwt-' + Date.now()
    });
    
    // Navigate to dashboard or setup
    const isSetupComplete = store.isSetupComplete();
    window.navigate(isSetupComplete ? '/dashboard' : '/setup');
    
  } catch (err) {
    errorEl.textContent = err.message || 'Sign in failed. Please try again.';
    errorEl.classList.remove('hidden');
    btn.disabled = false;
    btn.textContent = 'Sign In';
  }
};

// Handle social login
window.handleSocialLogin = async function(provider) {
  const btn = event.target;
  btn.disabled = true;
  btn.textContent = `Connecting to ${provider}...`;
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    store.set('auth', {
      isAuthenticated: true,
      user: {
        id: 'user-' + Date.now(),
        email: `user@${provider}.com`,
        name: `${provider} User`
      },
      token: 'mock-jwt-' + Date.now()
    });
    
    const isSetupComplete = store.isSetupComplete();
    window.navigate(isSetupComplete ? '/dashboard' : '/setup');
    
  } catch (err) {
    btn.disabled = false;
    btn.textContent = `Continue with ${provider.charAt(0).toUpperCase() + provider.slice(1)}`;
    alert(`Failed to sign in with ${provider}`);
  }
};
