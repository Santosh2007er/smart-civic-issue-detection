/**
 * Smart Civic Issue Detection - Main Global Scripts
 * Team: DYNAMIC TRIO | Rajalakshmi Institute of Technology
 */

const API_BASE = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
  ? `${window.location.origin}/api`
  : 'http://localhost:5000/api';

// Toast Notification Manager
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = 'fa-info-circle';
  if (type === 'success') icon = 'fa-check-circle';
  if (type === 'error') icon = 'fa-exclamation-triangle';
  if (type === 'warning') icon = 'fa-bell';

  toast.innerHTML = `
    <i class="fas ${icon}" style="font-size: 1.15rem;"></i>
    <div style="flex:1;">${message}</div>
    <button onclick="this.parentElement.remove()" style="background:none;border:none;cursor:pointer;color:#94a3b8;">&times;</button>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 4500);
}

// Global Auth State Management
function checkAuthState() {
  const token = localStorage.getItem('smart_civic_token');
  const userJson = localStorage.getItem('smart_civic_user');
  const authNav = document.getElementById('nav-auth-container');

  if (!authNav) return;

  if (token && userJson) {
    try {
      const user = JSON.parse(userJson);
      const isAdmin = user.role === 'admin' || user.role === 'officer';
      authNav.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="text-align: right; line-height: 1.2;">
            <div style="font-weight: 600; font-size: 0.88rem; color: var(--text-main);">${user.fullName || user.full_name}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: capitalize;">${user.role}</div>
          </div>
          ${isAdmin ? `<a href="dashboard.html" class="btn btn-sm btn-primary"><i class="fas fa-chart-line"></i> Admin Panel</a>` : ''}
          <button onclick="logoutUser()" class="btn btn-sm btn-outline"><i class="fas fa-sign-out-alt"></i> Logout</button>
        </div>
      `;
    } catch (e) {
      console.error(e);
    }
  } else {
    authNav.innerHTML = `
      <a href="login.html" class="btn btn-sm btn-outline"><i class="fas fa-sign-in-alt"></i> Login</a>
      <a href="register.html" class="btn btn-sm btn-primary"><i class="fas fa-user-plus"></i> Register</a>
    `;
  }
}

function logoutUser() {
  localStorage.removeItem('smart_civic_token');
  localStorage.removeItem('smart_civic_user');
  showToast('Logged out successfully.', 'info');
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 700);
}

// Toggle Mobile Navbar Menu
function setupMobileMenu() {
  const btn = document.querySelector('.btn-mobile-menu');
  const navLinks = document.querySelector('.nav-links');
  if (btn && navLinks) {
    btn.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
  }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  checkAuthState();
  setupMobileMenu();
});
