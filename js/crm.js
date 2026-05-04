const STORAGE_KEYS = {
  clients: 'crmClients',
  session: 'crmSession'
};

const seedClients = [
  {
    id: 'cliente-1',
    nome: 'Carla Souza',
    email: 'carla@email.com',
    telefone: '(11) 91234-5678',
    empresa: 'ABC Ltda',
    motivo: 'orcamento',
    status: 'Ativo',
    obs: 'Cliente demonstrou interesse em soluções rápidas. Valoriza agilidade e clareza no atendimento.',
    historico: [
      '05/05/2025 - WhatsApp: Cliente pediu retorno sobre orçamento.',
      '03/05/2025 - Ligação: Explicado funcionamento da plataforma.'
    ],
    createdAt: '2025-05-05T11:45:00.000Z'
  },
  {
    id: 'cliente-2',
    nome: 'João Pereira',
    email: 'joao@email.com',
    telefone: '(21) 99876-4321',
    empresa: 'XPTO S/A',
    motivo: 'acompanhamento',
    status: 'Aguardando retorno',
    obs: 'Cliente aguarda retorno sobre proposta e próximos passos.',
    historico: [
      '06/05/2025 - E-mail: Enviada proposta inicial.',
      '04/05/2025 - Ligação: Levantamento de necessidade.'
    ],
    createdAt: '2025-05-06T14:00:00.000Z'
  }
];

function getSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.session)) || null;
  } catch (error) {
    return null;
  }
}

function setSession(user) {
  localStorage.setItem(STORAGE_KEYS.session, JSON.stringify({
    email: user.email,
    name: user.name || user.email.split('@')[0],
    loggedAt: new Date().toISOString()
  }));
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.session);
}

function requireSession() {
  const session = getSession();
  if (!session) {
    window.location.href = 'login_home.html';
    return null;
  }
  return session;
}

function setupMenuSession() {
  const session = getSession();
  const userInfo = document.getElementById('user-info');
  const logoutBtn = document.getElementById('logoutBtn');

  if (userInfo && session) {
    userInfo.textContent = session.name || session.email;
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', (event) => {
      event.preventDefault();
      clearSession();
      window.location.href = 'login_home.html';
    });
  }
}

function getClients() {
  const stored = localStorage.getItem(STORAGE_KEYS.clients);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.clients, JSON.stringify(seedClients));
    return seedClients;
  }

  try {
    return JSON.parse(stored) || [];
  } catch (error) {
    localStorage.setItem(STORAGE_KEYS.clients, JSON.stringify(seedClients));
    return seedClients;
  }
}

function saveClients(clients) {
  localStorage.setItem(STORAGE_KEYS.clients, JSON.stringify(clients));
}

function getClientById(id) {
  return getClients().find((client) => client.id === id);
}

function upsertClient(clientData) {
  const clients = getClients();

  if (clientData.id) {
    const index = clients.findIndex((client) => client.id === clientData.id);
    if (index !== -1) {
      clients[index] = {
        ...clients[index],
        ...clientData,
        updatedAt: new Date().toISOString()
      };
      saveClients(clients);
      return clients[index];
    }
  }

  const newClient = {
    id: `cliente-${Date.now()}`,
    ...clientData,
    status: clientData.status || 'Ativo',
    historico: ['Cadastro criado na versão demonstrativa do CRM.'],
    createdAt: new Date().toISOString()
  };

  clients.push(newClient);
  saveClients(clients);
  return newClient;
}

function deleteClient(id) {
  const clients = getClients().filter((client) => client.id !== id);
  saveClients(clients);
}

function formatMotivo(value) {
  const labels = {
    orcamento: 'Orçamento',
    duvida: 'Dúvida',
    reclamacao: 'Reclamação',
    acompanhamento: 'Acompanhamento'
  };
  return labels[value] || 'Não informado';
}

function validateClient(data) {
  const errors = [];

  if (!data.nome || data.nome.trim().length < 3) {
    errors.push('Informe um nome com pelo menos 3 caracteres.');
  }

  if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email)) {
    errors.push('Informe um e-mail válido.');
  }

  if (!data.telefone || data.telefone.replace(/\D/g, '').length < 10) {
    errors.push('Informe um telefone válido com DDD.');
  }

  if (!data.motivo) {
    errors.push('Selecione o motivo do contato.');
  }

  return errors;
}

function renderFeedback(message, type = 'success') {
  let feedback = document.querySelector('.form-feedback');
  if (!feedback) {
    feedback = document.createElement('div');
    feedback.className = 'form-feedback';
    const form = document.querySelector('form');
    form?.prepend(feedback);
  }
  feedback.className = `form-feedback ${type}`;
  feedback.innerHTML = message;
}

function setupDashboard() {
  requireSession();
  setupMenuSession();

  const clients = getClients();
  const totalEl = document.querySelector('[data-dashboard="total"]');
  const lastEl = document.querySelector('[data-dashboard="last"]');
  const nextEl = document.querySelector('[data-dashboard="next"]');
  const pendingEl = document.querySelector('[data-dashboard="pending"]');

  const pending = clients.filter((client) => client.status === 'Aguardando retorno');
  const lastClient = clients[clients.length - 1];

  if (totalEl) totalEl.textContent = `${clients.length} clientes cadastrados`;
  if (lastEl) totalEl && (lastEl.textContent = lastClient ? `${lastClient.nome} — ${formatMotivo(lastClient.motivo)}` : 'Nenhum cliente cadastrado');
  if (nextEl) nextEl.textContent = pending[0] ? `${pending[0].nome} — acompanhamento pendente` : 'Nenhum retorno pendente';
  if (pendingEl) pendingEl.textContent = `${pending.length} pendências em acompanhamento`;
}

function setupClientForm() {
  requireSession();
  setupMenuSession();

  const form = document.querySelector('[data-client-form]');
  if (!form) return;

  const params = new URLSearchParams(window.location.search);
  const editId = params.get('id');
  const editingClient = editId ? getClientById(editId) : null;

  if (editingClient) {
    document.querySelector('[data-form-title]').textContent = 'Editar Cliente';
    form.nome.value = editingClient.nome || '';
    form.email.value = editingClient.email || '';
    form.telefone.value = editingClient.telefone || '';
    form.empresa.value = editingClient.empresa || '';
    form.motivo.value = editingClient.motivo || '';
    form.status.value = editingClient.status || 'Ativo';
    form.obs.value = editingClient.obs || '';
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const data = {
      id: editId,
      nome: form.nome.value.trim(),
      email: form.email.value.trim(),
      telefone: form.telefone.value.trim(),
      empresa: form.empresa.value.trim(),
      motivo: form.motivo.value,
      status: form.status.value,
      obs: form.obs.value.trim()
    };

    const errors = validateClient(data);
    if (errors.length) {
      renderFeedback(errors.map((error) => `<p>${error}</p>`).join(''), 'error');
      return;
    }

    const saved = upsertClient(data);
    renderFeedback('Cliente salvo com sucesso. Redirecionando para a lista...', 'success');

    setTimeout(() => {
      window.location.href = `lista_clientes.html?highlight=${saved.id}`;
    }, 700);
  });
}

function setupClientList() {
  requireSession();
  setupMenuSession();

  const tbody = document.querySelector('[data-client-list]');
  const searchInput = document.getElementById('busca');
  const statusFilter = document.getElementById('filtro-status');
  if (!tbody) return;

  function render() {
    const search = (searchInput?.value || '').toLowerCase();
    const status = statusFilter?.value || '';
    const clients = getClients().filter((client) => {
      const matchesSearch = [client.nome, client.email, client.telefone, client.empresa]
        .join(' ')
        .toLowerCase()
        .includes(search);
      const matchesStatus = !status || client.status === status;
      return matchesSearch && matchesStatus;
    });

    if (!clients.length) {
      tbody.innerHTML = '<tr><td colspan="6">Nenhum cliente encontrado.</td></tr>';
      return;
    }

    tbody.innerHTML = clients.map((client) => `
      <tr>
        <td>${client.nome}</td>
        <td>${client.email}</td>
        <td>${client.telefone}</td>
        <td>${client.empresa || '-'}</td>
        <td><span class="status ${client.status === 'Ativo' ? 'ativo' : 'pendente'}">${client.status}</span></td>
        <td class="table-actions">
          <a href="detalhe_cliente.html?id=${client.id}"><i class="bi bi-eye"></i> Ver</a>
          <a href="cadastrar-cliente.html?id=${client.id}"><i class="bi bi-pencil"></i> Editar</a>
          <button type="button" data-delete="${client.id}"><i class="bi bi-trash"></i> Excluir</button>
        </td>
      </tr>
    `).join('');
  }

  tbody.addEventListener('click', (event) => {
    const deleteButton = event.target.closest('[data-delete]');
    if (!deleteButton) return;

    const id = deleteButton.dataset.delete;
    const client = getClientById(id);
    if (client && confirm(`Excluir ${client.nome}?`)) {
      deleteClient(id);
      render();
    }
  });

  searchInput?.addEventListener('input', render);
  statusFilter?.addEventListener('change', render);
  render();
}

function setupClientDetail() {
  requireSession();
  setupMenuSession();

  const detail = document.querySelector('[data-client-detail]');
  if (!detail) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const client = getClientById(id);

  if (!client) {
    detail.innerHTML = '<p>Cliente não encontrado.</p><a class="voltar" href="lista_clientes.html">Voltar para lista</a>';
    return;
  }

  detail.innerHTML = `
    <section class="dados-pessoais">
      <h2><i class="bi bi-person-vcard"></i> Dados Pessoais</h2>
      <p><strong>Nome:</strong> ${client.nome}</p>
      <p><strong>E-mail:</strong> ${client.email}</p>
      <p><strong>Telefone:</strong> ${client.telefone}</p>
      <p><strong>Empresa:</strong> ${client.empresa || '-'}</p>
      <p><strong>Motivo:</strong> ${formatMotivo(client.motivo)}</p>
      <p><strong>Status:</strong> ${client.status}</p>
    </section>

    <section class="historico">
      <h2><i class="bi bi-clock-history"></i> Histórico de Interações</h2>
      <ul>${(client.historico || []).map((item) => `<li>${item}</li>`).join('')}</ul>
    </section>

    <section class="observacoes">
      <h2><i class="bi bi-stickies"></i> Observações</h2>
      <p>${client.obs || 'Nenhuma observação registrada.'}</p>
    </section>

    <div class="detail-actions">
      <a class="voltar" href="lista_clientes.html"><i class="bi bi-arrow-left"></i> Voltar para lista</a>
      <a class="voltar" href="cadastrar-cliente.html?id=${client.id}"><i class="bi bi-pencil"></i> Editar cliente</a>
    </div>
  `;
}

window.crm = {
  setSession,
  clearSession,
  requireSession,
  setupDashboard,
  setupClientForm,
  setupClientList,
  setupClientDetail
};
