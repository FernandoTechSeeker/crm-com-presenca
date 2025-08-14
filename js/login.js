document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.login-form');
  const emailInput = document.getElementById('email');
  const senhaInput = document.getElementById('senha');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = (emailInput.value || '').trim();
    const senha = (senhaInput.value || '').trim();

    // Validação simples
    if (!email || !senha) {
      alert('Preencha e-mail e senha.');
      return;
    }

    // TODO: trocar por chamada real de API
    // Exemplo de mock de sucesso:
    const loginOk = true; // substitua pela verificação real

    if (!loginOk) {
      alert('Credenciais inválidas.');
      return;
    }

    // Salva sessão (ajuste quando tiver token real)
    localStorage.setItem('token', 'token-falso-exemplo');
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userName', email.split('@')[0]);

    // Redireciona usando caminho relativo (funciona no GitHub Pages)
    window.location.href = 'index.html';
  });
});
