/**
 * Authentication Module: Login & Registration
 * Supports JWT Token Generation, Verification, & 1-Click Evaluation Accounts
 */

// Handle Login Form Submission
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const submitBtn = document.getElementById('btn-login-submit');

  if (!email || !password) {
    showToast('Please enter both email and password.', 'error');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (data.success) {
      localStorage.setItem('smart_civic_token', data.token);
      localStorage.setItem('smart_civic_user', JSON.stringify(data.user));
      showToast(`Welcome back, ${data.user.fullName}!`, 'success');

      setTimeout(() => {
        if (data.user.role === 'admin' || data.user.role === 'officer') {
          window.location.href = 'dashboard.html';
        } else {
          window.location.href = 'report.html';
        }
      }, 900);
    } else {
      showToast(data.message || 'Login failed. Please verify credentials.', 'error');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In to Account';
    }
  } catch (err) {
    console.error(err);
    showToast('Network error connecting to backend server.', 'error');
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In to Account';
  }
}

// Handle Registration Form Submission
async function handleRegister(e) {
  e.preventDefault();
  const fullName = document.getElementById('reg-fullname').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const phone = document.getElementById('reg-phone').value.trim();
  const password = document.getElementById('reg-password').value;
  const role = document.getElementById('reg-role') ? document.getElementById('reg-role').value : 'citizen';
  const submitBtn = document.getElementById('btn-reg-submit');

  if (!fullName || !email || !password) {
    showToast('Please fill all mandatory fields.', 'error');
    return;
  }

  if (password.length < 6) {
    showToast('Password must be at least 6 characters long.', 'warning');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';

  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, phone, password, role })
    });

    const data = await res.json();

    if (data.success) {
      localStorage.setItem('smart_civic_token', data.token);
      localStorage.setItem('smart_civic_user', JSON.stringify(data.user));
      showToast('Account registered successfully! Redirecting...', 'success');

      setTimeout(() => {
        if (data.user.role === 'admin' || data.user.role === 'officer') {
          window.location.href = 'dashboard.html';
        } else {
          window.location.href = 'report.html';
        }
      }, 900);
    } else {
      showToast(data.message || 'Registration failed.', 'error');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Complete Citizen Registration';
    }
  } catch (err) {
    console.error(err);
    showToast('Network error connecting to server.', 'error');
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Complete Citizen Registration';
  }
}

// 1-Click Demo Account Quick Fill Helper for Evaluators
function fillDemoAccount(role) {
  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');

  if (!emailInput || !passwordInput) return;

  if (role === 'admin') {
    emailInput.value = 'admin@smartcivic.gov.in';
    passwordInput.value = 'admin123';
    showToast('Admin demo credentials populated.', 'info');
  } else {
    emailInput.value = 'nisanthan@ritchennai.edu.in';
    passwordInput.value = 'admin123';
    showToast('Citizen demo credentials populated.', 'info');
  }
}
