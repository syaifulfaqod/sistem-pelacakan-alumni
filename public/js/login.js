// Login page logic
document.addEventListener('DOMContentLoaded', () => {
  // Check if already logged in
  const token = localStorage.getItem('auth_token');
  const user = JSON.parse(localStorage.getItem('auth_user') || 'null');
  if (token && user) {
    redirectByRole(user.role);
    return;
  }
});

function redirectByRole(role) {
  if (role === 'admin') {
    window.location.href = '/admin-alumni.html';
  } else {
    window.location.href = '/alumni-form.html';
  }
}

function togglePassword() {
  const input = document.getElementById('password');
  const btn = event.target;
  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = '🙈';
  } else {
    input.type = 'password';
    btn.textContent = '👁️';
  }
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => toast.classList.remove('show'), 3000);
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('loginBtn');
  const errorDiv = document.getElementById('loginError');
  
  const identifier = document.getElementById('identifier').value.trim();
  const password = document.getElementById('password').value;

  if (!identifier || !password) {
    errorDiv.textContent = 'Email/NIM dan password wajib diisi';
    errorDiv.classList.add('show');
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<span class="loading-spinner"></span> Memproses...';
  errorDiv.classList.remove('show');

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Login gagal');
    }

    // Save token and user info
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('auth_user', JSON.stringify(data.user));

    showToast(`Selamat datang, ${data.user.nama}!`, 'success');
    
    setTimeout(() => redirectByRole(data.user.role), 800);
  } catch (err) {
    errorDiv.textContent = err.message;
    errorDiv.classList.add('show');
    btn.disabled = false;
    btn.innerHTML = '🔐 Masuk';
  }
});
