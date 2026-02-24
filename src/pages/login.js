/**
 * Login Page - Real Authentication
 */

import { store } from '../lib/store.js';

export function renderLogin() {
  return `
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
  `;
}

window.showTab = function(tab) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.login-panel').forEach(panel => panel.classList.remove('active'));
  document.querySelectorAll('.login-panel').forEach(panel => panel.classList.add('hidden'));
  
  document.getElementById(`tab-${tab}`).classList.add('active');
  const panel = document.getElementById(`${tab}-panel`);
  panel.classList.remove('hidden');
  panel.classList.add('active');
};

window.handleLogin = async function() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const errorEl = document.getElementById('login-error');
  const btn = document.getElementById('login-btn');
  
  if (!email || !password) {
    errorEl.textContent = 'Please enter email and password';
    errorEl.classList.remove('hidden');
    return;
  }
  
  btn.disabled = true;
  btn.textContent = 'Signing in...';
  
  try {
    await store.login(email, password);
    window.navigate('/setup');
  } catch (err) {
    errorEl.textContent = err.message || 'Login failed';
    errorEl.classList.remove('hidden');
    btn.disabled = false;
    btn.textContent = 'Sign In';
  }
};

window.handleRegister = async function() {
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const errorEl = document.getElementById('register-error');
  const btn = document.getElementById('register-btn');
  
  if (!email || !password) {
    errorEl.textContent = 'Please enter email and password';
    errorEl.classList.remove('hidden');
    return;
  }
  
  if (password.length < 6) {
    errorEl.textContent = 'Password must be at least 6 characters';
    errorEl.classList.remove('hidden');
    return;
  }
  
  btn.disabled = true;
  btn.textContent = 'Creating account...';
  
  try {
    await store.register(email, password);
    window.navigate('/setup');
  } catch (err) {
    errorEl.textContent = err.message || 'Registration failed';
    errorEl.classList.remove('hidden');
    btn.disabled = false;
    btn.textContent = 'Create Account';
  }
};
