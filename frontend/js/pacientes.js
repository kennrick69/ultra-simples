// ==================== GERENCIAMENTO DE PACIENTES ====================
// Versão 2.0 - Integração com Backend PostgreSQL

// ===== CARREGAMENTO INICIAL =====
document.addEventListener('DOMContentLoaded', async () => {
    await carregarPacientes();
    atualizarEstatisticas();
    carregarDadosUsuario();
});

// ===== CARREGAR DADOS DO USUÁRIO =====
function carregarDadosUsuario() {
    const user = getCurrentUser();
    if (user) {
        const nameEl = document.getElementById('userName');
        const croEl = document.getElementById('userCRO');
        if (nameEl) nameEl.textContent = user.name || user.nome || 'Dentista';
        if (croEl) croEl.textContent = `CRO: ${user.cro || 'N/A'}`;
    }
}

// ===== OBTER USUÁRIO ATUAL =====
function getCurrentUser() {
    try {
        const userStr = localStorage.getItem('current_dentista') || 
                       localStorage.getItem('currentUser') || 
                       localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    } catch(e) {
        return null;
    }
}

// ===== LOGOUT =====
async function logout() {
    const confirmado = await mostrarConfirmacao(
        'Deseja realmente sair do sistema?',
        'Sair',
        'Sim, Sair',
        'Cancelar'
    );
    
    if (confirmado) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('current_dentista');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    }
}

// ===== BUSCAR PACIENTES =====
async function buscarPacientes() {
    const termo = document.getElementById('searchInput').value.toLowerCase().trim();
    const pacientes = await obterPacientes();
    
    if (!termo) {
        renderizarPacientes(pacientes);
        return;
    }
    
    const resultados = pacientes.filter(p => {
        return (
            p.nome.toLowerCase().includes(termo) ||
            p.cpf.replace(/\D/g, '').includes(termo.replace(/\D/g, '')) ||
            p.telefone.replace(/\D/g, '').includes(termo.replace(/\D/g, ''))
        );
    });
    
    renderizarPacientes(resultados);
}

// ===== LIMPAR BUSCA =====
function limparBusca() {
    document.getElementById('searchInput').value = '';
    buscarPacientes();
}

// ===== FILTRAR PACIENTES =====
let filtroAtual = 'todos';

function filtrarPor(tipo) {
    filtroAtual = tipo;
    
    // Atualizar botões ativos
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    let pacientes = obterPacientes();
    
    switch(tipo) {
        case 'recentes':
            // Últimos 30 dias
            const trintaDiasAtras = new Date();
            trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
            pacientes = pacientes.filter(p => {
                const dataCadastro = new Date(p.dataCadastro);
                return dataCadastro >= trintaDiasAtras;
            });
            break;
        case 'cpf':
            // Ordem alfabética
            pacientes.sort((a, b) => a.nome.localeCompare(b.nome));
            break;
        default:
            // Mais recentes primeiro
            pacientes.sort((a, b) => new Date(b.dataCadastro) - new Date(a.dataCadastro));
    }
    
    renderizarPacientes(pacientes);
}

// ===== OBTER TODOS OS PACIENTES (DO BACKEND) =====
async function obterPacientes() {
    try {
        // Tentar buscar do backend
        if (typeof API !== 'undefined') {
            const pacientes = await API.getPacientes();
            console.log('[Pacientes] Carregados do backend:', pacientes.length);
            // Salvar cópia local como backup
            salvarPacientesLocal(pacientes);
            return pacientes;
        }
    } catch (error) {
        console.warn('[Pacientes] Erro ao buscar do backend, usando local:', error.message);
    }
    
    // Fallback: buscar do localStorage
    return obterPacientesLocal();
}

// ===== OBTER PACIENTES DO LOCALSTORAGE (BACKUP) =====
function obterPacientesLocal() {
    const user = getCurrentUser();
    if (!user || !user.id) return [];
    const key = `pacientes_${user.id}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
}

// ===== SALVAR PACIENTES NO LOCALSTORAGE (BACKUP) =====
function salvarPacientesLocal(pacientes) {
    const user = getCurrentUser();
    if (!user || !user.id) return;
    const key = `pacientes_${user.id}`;
    localStorage.setItem(key, JSON.stringify(pacientes));
}

// ===== SALVAR PACIENTES (DEPRECATED - usar API) =====
function salvarPacientes(pacientes) {
    salvarPacientesLocal(pacientes);
}

// ===== CARREGAR E RENDERIZAR PACIENTES =====
async function carregarPacientes() {
    const pacientes = await obterPacientes();
    renderizarPacientes(pacientes);
}

// ===== RENDERIZAR LISTA DE PACIENTES =====
function renderizarPacientes(pacientes) {
    const container = document.getElementById('listaPacientes');
    
    if (!pacientes || pacientes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">👥</div>
                <p>Nenhum paciente encontrado</p>
                <button class="btn btn-primary" onclick="novoPaciente()">
                    Cadastrar Primeiro Paciente
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = pacientes.map(p => `
        <div class="patient-card" onclick="editarPaciente('${p.id}')">
            <div class="patient-header">
                <div>
                    <div class="patient-name">${p.nome}</div>
                    <div class="patient-cpf">CPF: ${formatarCPF(p.cpf)}</div>
                </div>
                <div class="patient-actions" onclick="event.stopPropagation()">
                    <button class="btn btn-sm" onclick="editarPaciente('${p.id}')" title="Editar">
                        ✏️
                    </button>
                    <button class="btn btn-sm" style="background: var(--danger);" onclick="excluirPaciente('${p.id}')" title="Excluir">
                        🗑️
                    </button>
                </div>
            </div>
            
            <div class="patient-info">
                <div class="info-item">
                    <div class="info-icon">📞</div>
                    <div>
                        <div class="info-label">Telefone</div>
                        <div class="info-value">${formatarTelefone(p.telefone)}</div>
                    </div>
                </div>
                
                ${p.email ? `
                <div class="info-item">
                    <div class="info-icon">📧</div>
                    <div>
                        <div class="info-label">Email</div>
                        <div class="info-value">${p.email}</div>
                    </div>
                </div>
                ` : ''}
                
                ${p.cidade ? `
                <div class="info-item">
                    <div class="info-icon">📍</div>
                    <div>
                        <div class="info-label">Cidade</div>
                        <div class="info-value">${p.cidade}/${p.estado || ''}</div>
                    </div>
                </div>
                ` : ''}
                
                ${p.nascimento ? `
                <div class="info-item">
                    <div class="info-icon">🎂</div>
                    <div>
                        <div class="info-label">Idade</div>
                        <div class="info-value">${calcularIdade(p.nascimento)} anos</div>
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// ===== ATUALIZAR ESTATÍSTICAS =====
function atualizarEstatisticas() {
    const pacientes = obterPacientes();
    
    // Total de pacientes
    document.getElementById('totalPacientes').textContent = pacientes.length;
    
    // Cadastros recentes (últimos 30 dias)
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
    const recentes = pacientes.filter(p => {
        const dataCadastro = new Date(p.dataCadastro);
        return dataCadastro >= trintaDiasAtras;
    });
    document.getElementById('cadastrosRecentes').textContent = recentes.length;
    
    // Ativos este mês (com atendimento nos últimos 30 dias)
    // Por enquanto, vamos usar recentes
    document.getElementById('pacientesAtivos').textContent = recentes.length;
}

// ===== NOVO PACIENTE =====
function novoPaciente() {
    // Limpar formulário
    document.getElementById('formPaciente').reset();
    document.getElementById('pacId').value = '';
    document.getElementById('modalTitulo').textContent = 'Novo Paciente';
    
    // Abrir modal
    document.getElementById('modalPaciente').style.display = 'flex';
}

// ===== EDITAR PACIENTE =====
function editarPaciente(id) {
    const pacientes = obterPacientes();
    const paciente = pacientes.find(p => p.id === id);
    
    if (!paciente) {
        alert('Paciente não encontrado!');
        return;
    }
    
    // Preencher formulário
    document.getElementById('pacId').value = paciente.id;
    document.getElementById('pacNome').value = paciente.nome;
    document.getElementById('pacCPF').value = paciente.cpf;
    document.getElementById('pacNascimento').value = paciente.nascimento || '';
    document.getElementById('pacTelefone').value = paciente.telefone;
    document.getElementById('pacEmail').value = paciente.email || '';
    document.getElementById('pacCEP').value = paciente.cep || '';
    document.getElementById('pacCidade').value = paciente.cidade || '';
    document.getElementById('pacEndereco').value = paciente.endereco || '';
    document.getElementById('pacNumero').value = paciente.numero || '';
    document.getElementById('pacComplemento').value = paciente.complemento || '';
    document.getElementById('pacBairro').value = paciente.bairro || '';
    document.getElementById('pacEstado').value = paciente.estado || '';
    document.getElementById('pacResponsavel').value = paciente.responsavel || '';
    document.getElementById('pacObservacoes').value = paciente.observacoes || '';
    
    // Atualizar título
    document.getElementById('modalTitulo').textContent = 'Editar Paciente';
    
    // Abrir modal
    document.getElementById('modalPaciente').style.display = 'flex';
}

// ===== SALVAR PACIENTE (COM API) =====
async function salvarPaciente(event) {
    event.preventDefault();
    
    const id = document.getElementById('pacId').value;
    const isNovo = !id;
    
    const paciente = {
        id: id || gerarId(),
        nome: document.getElementById('pacNome').value.trim(),
        cpf: document.getElementById('pacCPF').value.trim(),
        nascimento: document.getElementById('pacNascimento').value,
        telefone: document.getElementById('pacTelefone').value.trim(),
        email: document.getElementById('pacEmail').value.trim(),
        cep: document.getElementById('pacCEP').value.trim(),
        cidade: document.getElementById('pacCidade').value.trim(),
        endereco: document.getElementById('pacEndereco').value.trim(),
        numero: document.getElementById('pacNumero').value.trim(),
        complemento: document.getElementById('pacComplemento').value.trim(),
        bairro: document.getElementById('pacBairro').value.trim(),
        estado: document.getElementById('pacEstado').value,
        responsavel: document.getElementById('pacResponsavel').value.trim(),
        observacoes: document.getElementById('pacObservacoes').value.trim(),
        dataCadastro: new Date().toISOString()
    };
    
    // Validar CPF
    if (!validarCPF(paciente.cpf)) {
        alert('⚠️ CPF inválido! Verifique o número digitado.');
        return;
    }
    
    try {
        // Tentar salvar no backend
        if (typeof API !== 'undefined') {
            if (isNovo) {
                await API.criarPaciente(paciente);
            } else {
                await API.atualizarPaciente(id, paciente);
            }
            console.log('[Pacientes] Salvo no backend com sucesso');
        } else {
            // Fallback: salvar localmente
            const pacientes = obterPacientesLocal();
            const index = pacientes.findIndex(p => p.id === paciente.id);
            
            if (index !== -1) {
                paciente.dataCadastro = pacientes[index].dataCadastro;
                pacientes[index] = paciente;
            } else {
                pacientes.push(paciente);
            }
            
            salvarPacientesLocal(pacientes);
        }
        
        // Fechar modal e atualizar lista
        fecharModal();
        await carregarPacientes();
        atualizarEstatisticas();
        
        alert(`✅ Paciente ${isNovo ? 'cadastrado' : 'atualizado'} com sucesso!`);
        
    } catch (error) {
        console.error('[Pacientes] Erro ao salvar:', error);
        alert('❌ Erro ao salvar paciente: ' + error.message);
    }
}

// ===== EXCLUIR PACIENTE (COM API) =====
async function excluirPaciente(id) {
    const confirmado = await mostrarConfirmacao(
        'Deseja realmente excluir este paciente?\n\nEsta ação não pode ser desfeita!',
        'Excluir Paciente',
        'Sim, Excluir',
        'Cancelar'
    );
    
    if (!confirmado) return;
    
    try {
        // Tentar excluir do backend
        if (typeof API !== 'undefined') {
            await API.excluirPaciente(id);
            console.log('[Pacientes] Excluído do backend com sucesso');
        } else {
            // Fallback: excluir localmente
            const pacientes = obterPacientesLocal();
            const filtrados = pacientes.filter(p => p.id !== id);
            salvarPacientesLocal(filtrados);
        }
        
        await carregarPacientes();
        atualizarEstatisticas();
        
        mostrarSucesso('Paciente excluído com sucesso!');
        
    } catch (error) {
        console.error('[Pacientes] Erro ao excluir:', error);
        alert('❌ Erro ao excluir paciente: ' + error.message);
    }
}

// ===== FECHAR MODAL =====
function fecharModal() {
    document.getElementById('modalPaciente').style.display = 'none';
}

// ===== BUSCAR CEP =====
async function buscarCEP() {
    const cep = document.getElementById('pacCEP').value.replace(/\D/g, '');
    
    if (cep.length !== 8) {
        return;
    }
    
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const dados = await response.json();
        
        if (dados.erro) {
            alert('CEP não encontrado!');
            return;
        }
        
        // Preencher campos
        document.getElementById('pacEndereco').value = dados.logradouro;
        document.getElementById('pacBairro').value = dados.bairro;
        document.getElementById('pacCidade').value = dados.localidade;
        document.getElementById('pacEstado').value = dados.uf;
        
        // Focar no número
        document.getElementById('pacNumero').focus();
        
    } catch (error) {
        console.error('Erro ao buscar CEP:', error);
    }
}

// ===== FUNÇÕES AUXILIARES =====

function gerarId() {
    return 'pac_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function formatarCPF(cpf) {
    const nums = cpf.replace(/\D/g, '');
    if (nums.length !== 11) return cpf;
    return nums.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function formatarTelefone(tel) {
    const nums = tel.replace(/\D/g, '');
    if (nums.length === 11) {
        return nums.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (nums.length === 10) {
        return nums.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return tel;
}

function calcularIdade(nascimento) {
    if (!nascimento) return '';
    const hoje = new Date();
    const dataNasc = new Date(nascimento);
    let idade = hoje.getFullYear() - dataNasc.getFullYear();
    const mes = hoje.getMonth() - dataNasc.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < dataNasc.getDate())) {
        idade--;
    }
    return idade;
}

function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    
    if (cpf.length !== 11) return false;
    if (/^(\d)\1+$/.test(cpf)) return false; // Todos dígitos iguais
    
    // Validação do primeiro dígito
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    let digito1 = resto >= 10 ? 0 : resto;
    
    if (digito1 !== parseInt(cpf.charAt(9))) return false;
    
    // Validação do segundo dígito
    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    let digito2 = resto >= 10 ? 0 : resto;
    
    return digito2 === parseInt(cpf.charAt(10));
}

// ===== AUTO-FORMATAÇÃO DE CAMPOS =====
document.addEventListener('DOMContentLoaded', () => {
    // CPF
    const cpfInput = document.getElementById('pacCPF');
    if (cpfInput) {
        cpfInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.substr(0, 11);
            
            if (value.length > 9) {
                value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
            } else if (value.length > 6) {
                value = value.replace(/(\d{3})(\d{3})(\d{3})/, '$1.$2.$3');
            } else if (value.length > 3) {
                value = value.replace(/(\d{3})(\d{3})/, '$1.$2');
            }
            
            e.target.value = value;
        });
    }
    
    // Telefone
    const telInput = document.getElementById('pacTelefone');
    if (telInput) {
        telInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.substr(0, 11);
            
            if (value.length > 10) {
                value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
            } else if (value.length > 6) {
                value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
            } else if (value.length > 2) {
                value = value.replace(/(\d{2})(\d{0,5})/, '($1) $2');
            }
            
            e.target.value = value;
        });
    }
    
    // CEP
    const cepInput = document.getElementById('pacCEP');
    if (cepInput) {
        cepInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 8) value = value.substr(0, 8);
            
            if (value.length > 5) {
                value = value.replace(/(\d{5})(\d{3})/, '$1-$2');
            }
            
            e.target.value = value;
        });
    }
});

// ===== EXPORTAR FUNÇÕES PARA USO EXTERNO =====
// (Para uso em nota-fiscal.html)
window.pacientesFunctions = {
    obterPacientes,
    buscarPacientePorId: (id) => obterPacientes().find(p => p.id === id),
    buscarPacientePorCPF: (cpf) => obterPacientes().find(p => p.cpf.replace(/\D/g, '') === cpf.replace(/\D/g, '')),
    formatarCPF,
    formatarTelefone
};
