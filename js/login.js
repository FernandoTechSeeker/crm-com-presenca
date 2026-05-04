document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.login-form');
  const emailInput = document.getElementById('email');
  const senhaInput = document.getElementById('senha');

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const email = (emailInput.value || '').trim();
    const senha = (senhaInput.value || '').trim();

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      alert('Informe um e-mail válido para acessar a demonstração.');
      return;
    }

    if (!senha || senha.length < 4) {
      alert('Informe uma senha com pelo menos 4 caracteres.');
      return;
    }

    window.crm.setSession({ email });
    window.location.href = 'index.html';
  });
});
