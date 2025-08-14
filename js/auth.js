function redirectToLogin() {
  // Caminho relativo para funcionar no GitHub Pages
  window.location.href = 'login_home.html';
}

function getToken() {
  return localStorage.getItem('token');
}

function getUserInfo() {
  let name = localStorage.getItem('userName');
  let email = localStorage.getItem('userEmail');

  if (!name && !email) {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        name = parsed.name || '';
        email = parsed.email || '';
      } catch (e) {
        // Ignora erro de parse
      }
    }
  }

  return { name, email };
}

function requireAuth() {
  const token = getToken();
  if (!token) {
    redirectToLogin();
    return false;
  }

  const { name, email } = getUserInfo();
  const userInfoEl = document.getElementById('user-info');
  if (userInfoEl) {
    userInfoEl.textContent = name || email || '';
  }

  return true;
}

function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('userName');
  localStorage.removeItem('userEmail');
}

function logout() {
  clearSession();
  redirectToLogin();
}

async function apiFetch(url, options = {}) {
  const token = getToken();
  const opts = { ...options };
  opts.headers = { ...(options.headers || {}) };
  
  if (token) {
    opts.headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, opts);
  if (response.status === 401) {
    logout();
  }
  return response;
}

document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth()) return;

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  }
});

window.apiFetch = apiFetch;
