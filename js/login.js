// Handle login form submission

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.login-form');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('senha').value.trim();

    if (!email || !password) {
      alert('Por favor, preencha e-mail e senha.');
      return;
    }

    // In a real app you'd authenticate here.
    // Redirect to home page after pseudo-login
    window.location.href = 'index.html';
  });
});