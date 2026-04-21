// ==================== PRONTUÁRIO DIGITAL ====================
// Versão 2.0 - Com busca e filtro de pacientes

let pacienteSelecionado = null;
let statusDenteAtivo = 'saudavel';
let listaPacientesGlobal = [];

// ==================== INIT ====================
window.addEventListener('DOMContentLoaded', async function() {
    await carregarListaPacientes();
    gerarOdontograma();
});

// ==================== CARREGAR PACIENTES DO BACKEND ====================
async function carregarListaPacientes() {
    try {
        let pacientes = [];
        
        // Tentar buscar do backend via API
        if (typeof API !== 'undefined') {
            pacientes = await API.getPacientes();
            console.log('[Prontuário] Pacientes carregados do backend:', pacientes.length);
        } else {
            // Fallback: buscar do localStorage
            pacientes = obterPacientesLocal();
            console.log('[Prontuário] Pacientes carregados do localStorage:', pacientes.length);
        }
        
        // Ordenar por nome
        pacientes.sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));
        
        listaPacientesGlobal = pacientes;
        console.log('[Prontuário] Lista global atualizada:', listaPacientesGlobal.length);
        
    } catch (error) {
        console.error('[Prontuário] Erro ao carregar pacientes:', error);
        
        // Fallback: tentar localStorage
        listaPacientesGlobal = obterPacientesLocal();
    }
}

// Obter pacientes do localStorage (backup)
function obterPacientesLocal() {
    const user = getCurrentUser();
    const key = user && user.id ? 'pacientes_' + user.id : 'pacientes_default';
    try {
        return JSON.parse(localStorage.getItem(key) || '[]');
    } catch(e) {
        return [];
    }
}

// ==================== BUSCA E FILTRO DE PACIENTES ====================

// Filtrar pacientes enquanto digita
function filtrarPacientes() {
    const input = document.getElementById('buscaPaciente');
    const termo = (input.value || '').toLowerCase().trim();
    const dropdown = document.getElementById('listaPacientesDropdown');
    
    if (!termo) {
        renderizarDropdownPacientes(listaPacientesGlobal.slice(0, 20)); // Mostrar primeiros 20
        return;
    }
    
    // Filtrar por nome, CPF ou telefone
    const filtrados = listaPacientesGlobal.filter(p => {
        const nome = (p.nome || '').toLowerCase();
        const cpf = (p.cpf || '').replace(/\D/g, '');
        const telefone = (p.telefone || p.celular || '').replace(/\D/g, '');
        const termoLimpo = termo.replace(/\D/g, '');
        
        return nome.includes(termo) || 
               cpf.includes(termoLimpo) || 
               telefone.includes(termoLimpo);
    });
    
    renderizarDropdownPacientes(filtrados.slice(0, 20));
}

// Mostrar lista de pacientes ao focar no input
function mostrarListaPacientes() {
    const dropdown = document.getElementById('listaPacientesDropdown');
    const input = document.getElementById('buscaPaciente');
    
    if (!input.value.trim()) {
        renderizarDropdownPacientes(listaPacientesGlobal.slice(0, 20));
    } else {
        filtrarPacientes();
    }
    
    dropdown.classList.add('show');
}

// Renderizar dropdown com pacientes
function renderizarDropdownPacientes(pacientes) {
    const dropdown = document.getElementById('listaPacientesDropdown');
    
    if (!pacientes || pacientes.length === 0) {
        dropdown.innerHTML = '<div class="dropdown-empty">Nenhum paciente encontrado</div>';
        dropdown.classList.add('show');
        return;
    }
    
    let html = '';
    pacientes.forEach(p => {
        const telefone = p.telefone || p.celular || '';
        const cpf = p.cpf || '';
        
        html += '<div class="dropdown-item" onclick="selecionarPaciente(\'' + p.id + '\')">' +
            '<div class="dropdown-item-nome">' + (p.nome || 'Sem nome') + '</div>' +
            '<div class="dropdown-item-info">' +
                (cpf ? 'CPF: ' + cpf : '') + 
                (telefone ? (cpf ? ' | ' : '') + 'Tel: ' + telefone : '') +
            '</div>' +
        '</div>';
    });
    
    dropdown.innerHTML = html;
    dropdown.classList.add('show');
}

// Selecionar paciente da lista
function selecionarPaciente(id) {
    const paciente = listaPacientesGlobal.find(p => p.id == id);
    
    if (!paciente) {
        console.error('Paciente não encontrado:', id);
        return;
    }
    
    // Atualizar campo hidden e input
    document.getElementById('pacienteSelect').value = id;
    document.getElementById('buscaPaciente').value = paciente.nome;
    
    // Esconder dropdown
    document.getElementById('listaPacientesDropdown').classList.remove('show');
    
    // Mostrar info do paciente selecionado
    const infoDiv = document.getElementById('pacienteSelecionadoInfo');
    infoDiv.innerHTML = '<div>' +
            '<span class="nome">✅ ' + paciente.nome + '</span>' +
            '<span style="color: var(--text-light); margin-left: 10px;">' +
                (paciente.telefone || paciente.celular || '') +
            '</span>' +
        '</div>' +
        '<button class="btn-trocar" onclick="limparSelecaoPaciente()">Trocar</button>';
    infoDiv.style.display = 'flex';
    
    // Carregar prontuário
    carregarProntuario();
}

// Limpar seleção de paciente
function limparSelecaoPaciente() {
    document.getElementById('pacienteSelect').value = '';
    document.getElementById('buscaPaciente').value = '';
    document.getElementById('pacienteSelecionadoInfo').style.display = 'none';
    document.getElementById('prontuarioContainer').style.display = 'none';
    document.getElementById('buscaPaciente').focus();
}

// Fechar dropdown ao clicar fora
document.addEventListener('click', function(e) {
    const container = document.querySelector('.busca-paciente-container');
    const dropdown = document.getElementById('listaPacientesDropdown');
    
    if (container && dropdown && !container.contains(e.target)) {
        dropdown.classList.remove('show');
    }
});

// ==================== CARREGAR PRONTUÁRIO ====================
function carregarProntuario() {
    const pacienteId = document.getElementById('pacienteSelect').value;
    
    if (!pacienteId) {
        document.getElementById('prontuarioContainer').style.display = 'none';
        return;
    }
    
    pacienteSelecionado = pacienteId;
    document.getElementById('prontuarioContainer').style.display = 'block';
    
    // Carregar dados de cada aba
    carregarAnamnese();
    carregarOdontogramaData();
    carregarFotos();
    carregarEvolucoes();
}

// ==================== TABS ====================
function switchTab(tabName) {
    // Remove active de todos
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Ativa o selecionado
    if (event && event.target) {
        event.target.classList.add('active');
    }
    document.getElementById('tab-' + tabName).classList.add('active');
}

// ==================== ANAMNESE ====================
function carregarAnamnese() {
    if (!pacienteSelecionado) return;
    
    const key = 'prontuario_anamnese_' + pacienteSelecionado;
    const anamnese = JSON.parse(localStorage.getItem(key) || '{}');
    
    if (document.getElementById('queixaPrincipal')) {
        document.getElementById('queixaPrincipal').value = anamnese.queixaPrincipal || '';
    }
    if (document.getElementById('diabetes')) {
        document.getElementById('diabetes').checked = anamnese.diabetes || false;
    }
    if (document.getElementById('hipertensao')) {
        document.getElementById('hipertensao').checked = anamnese.hipertensao || false;
    }
    if (document.getElementById('cardiopatia')) {
        document.getElementById('cardiopatia').checked = anamnese.cardiopatia || false;
    }
    if (document.getElementById('alergia')) {
        document.getElementById('alergia').checked = anamnese.alergia || false;
    }
    if (document.getElementById('medicamentos')) {
        document.getElementById('medicamentos').value = anamnese.medicamentos || '';
    }
    if (document.getElementById('observacoesGerais')) {
        document.getElementById('observacoesGerais').value = anamnese.observacoesGerais || '';
    }
}

function salvarAnamnese() {
    if (!pacienteSelecionado) {
        alert('Selecione um paciente primeiro!');
        return;
    }
    
    const anamnese = {
        queixaPrincipal: document.getElementById('queixaPrincipal')?.value || '',
        diabetes: document.getElementById('diabetes')?.checked || false,
        hipertensao: document.getElementById('hipertensao')?.checked || false,
        cardiopatia: document.getElementById('cardiopatia')?.checked || false,
        alergia: document.getElementById('alergia')?.checked || false,
        medicamentos: document.getElementById('medicamentos')?.value || '',
        observacoesGerais: document.getElementById('observacoesGerais')?.value || '',
        dataAtualizacao: new Date().toISOString()
    };
    
    const key = 'prontuario_anamnese_' + pacienteSelecionado;
    localStorage.setItem(key, JSON.stringify(anamnese));
    
    alert('✅ Anamnese salva com sucesso!');
}

// ==================== ODONTOGRAMA ====================
function gerarOdontograma() {
    // Arcada Superior: 18 a 11, 21 a 28
    const superior = document.getElementById('arcada-superior');
    if (!superior) return;
    
    superior.innerHTML = '';
    
    for (let i = 18; i >= 11; i--) {
        superior.appendChild(criarDente(i));
    }
    for (let i = 21; i <= 28; i++) {
        superior.appendChild(criarDente(i));
    }
    
    // Arcada Inferior: 48 a 41, 31 a 38
    const inferior = document.getElementById('arcada-inferior');
    if (!inferior) return;
    
    inferior.innerHTML = '';
    
    for (let i = 48; i >= 41; i--) {
        inferior.appendChild(criarDente(i));
    }
    for (let i = 31; i <= 38; i++) {
        inferior.appendChild(criarDente(i));
    }
}

function criarDente(numero) {
    const dente = document.createElement('div');
    dente.className = 'dente saudavel';
    dente.dataset.numero = numero;
    dente.innerHTML = '<div class="dente-numero">' + numero + '</div><div class="dente-status">OK</div>';
    dente.onclick = function() { marcarDente(numero); };
    return dente;
}

function setStatusDente(status) {
    statusDenteAtivo = status;
}

function marcarDente(numero) {
    const dente = document.querySelector('.dente[data-numero="' + numero + '"]');
    if (!dente) return;
    
    // Remove todas as classes de status
    dente.classList.remove('saudavel', 'carie', 'obturado', 'extraido', 'implante');
    
    // Adiciona nova classe
    dente.classList.add(statusDenteAtivo);
    
    // Atualiza texto
    const statusTextos = {
        'saudavel': 'OK',
        'carie': 'Cárie',
        'obturado': 'Obt.',
        'extraido': 'Ext.',
        'implante': 'Impl.'
    };
    
    const statusEl = dente.querySelector('.dente-status');
    if (statusEl) {
        statusEl.textContent = statusTextos[statusDenteAtivo] || 'OK';
    }
}

function carregarOdontogramaData() {
    if (!pacienteSelecionado) return;
    
    const key = 'prontuario_odontograma_' + pacienteSelecionado;
    const odontograma = JSON.parse(localStorage.getItem(key) || '{}');
    
    // Aplicar status salvos
    Object.keys(odontograma).forEach(function(numero) {
        const dente = document.querySelector('.dente[data-numero="' + numero + '"]');
        if (dente) {
            const status = odontograma[numero];
            dente.classList.remove('saudavel', 'carie', 'obturado', 'extraido', 'implante');
            dente.classList.add(status);
            
            const statusTextos = {
                'saudavel': 'OK',
                'carie': 'Cárie',
                'obturado': 'Obt.',
                'extraido': 'Ext.',
                'implante': 'Impl.'
            };
            
            const statusEl = dente.querySelector('.dente-status');
            if (statusEl) {
                statusEl.textContent = statusTextos[status] || 'OK';
            }
        }
    });
}

function salvarOdontograma() {
    if (!pacienteSelecionado) {
        alert('Selecione um paciente primeiro!');
        return;
    }
    
    const odontograma = {};
    
    document.querySelectorAll('.dente').forEach(function(dente) {
        const numero = dente.dataset.numero;
        let status = 'saudavel';
        
        if (dente.classList.contains('carie')) status = 'carie';
        else if (dente.classList.contains('obturado')) status = 'obturado';
        else if (dente.classList.contains('extraido')) status = 'extraido';
        else if (dente.classList.contains('implante')) status = 'implante';
        
        odontograma[numero] = status;
    });
    
    const key = 'prontuario_odontograma_' + pacienteSelecionado;
    localStorage.setItem(key, JSON.stringify(odontograma));
    
    alert('✅ Odontograma salvo com sucesso!');
}

// ==================== FOTOS ====================
function carregarFotos() {
    if (!pacienteSelecionado) return;
    
    const key = 'prontuario_fotos_' + pacienteSelecionado;
    const fotos = JSON.parse(localStorage.getItem(key) || '[]');
    
    const grid = document.getElementById('fotosGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    if (fotos.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 2rem;">Nenhuma foto adicionada ainda</p>';
        return;
    }
    
    fotos.forEach(function(foto, index) {
        const card = document.createElement('div');
        card.className = 'foto-card';
        card.innerHTML = '<img src="' + foto.data + '" alt="Foto clínica">' +
            '<button class="foto-delete" onclick="deletarFoto(' + index + ')">×</button>' +
            '<div class="foto-card-info">' +
            '<p><strong>' + (foto.tipo || 'Foto') + '</strong></p>' +
            '<p style="color: var(--text-light); font-size: 0.75rem;">' + new Date(foto.data_upload).toLocaleDateString('pt-BR') + '</p>' +
            '</div>';
        grid.appendChild(card);
    });
}

function adicionarFoto() {
    if (!pacienteSelecionado) {
        alert('Selecione um paciente primeiro!');
        return;
    }
    
    const input = document.getElementById('fotoInput');
    const files = input.files;
    
    if (files.length === 0) return;
    
    const key = 'prontuario_fotos_' + pacienteSelecionado;
    const fotos = JSON.parse(localStorage.getItem(key) || '[]');
    
    let processadas = 0;
    
    Array.from(files).forEach(function(file) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            fotos.push({
                data: e.target.result,
                tipo: 'Foto Clínica',
                data_upload: new Date().toISOString()
            });
            
            processadas++;
            
            if (processadas === files.length) {
                localStorage.setItem(key, JSON.stringify(fotos));
                carregarFotos();
                alert('✅ ' + files.length + ' foto(s) adicionada(s) com sucesso!');
            }
        };
        
        reader.readAsDataURL(file);
    });
    
    input.value = '';
}

function deletarFoto(index) {
    if (!confirm('Deseja realmente excluir esta foto?')) return;
    
    const key = 'prontuario_fotos_' + pacienteSelecionado;
    const fotos = JSON.parse(localStorage.getItem(key) || '[]');
    
    fotos.splice(index, 1);
    localStorage.setItem(key, JSON.stringify(fotos));
    carregarFotos();
}

// ==================== EVOLUÇÃO ====================
function carregarEvolucoes() {
    if (!pacienteSelecionado) return;
    
    const key = 'prontuario_evolucao_' + pacienteSelecionado;
    const evolucoes = JSON.parse(localStorage.getItem(key) || '[]');
    
    const list = document.getElementById('evolucaoList');
    if (!list) return;
    
    list.innerHTML = '';
    
    if (evolucoes.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 2rem;">Nenhuma evolução registrada ainda</p>';
        return;
    }
    
    // Mostrar mais recentes primeiro
    const evolucoesOrdenadas = [...evolucoes].reverse();
    
    evolucoesOrdenadas.forEach(function(ev, index) {
        const realIndex = evolucoes.length - 1 - index;
        const item = document.createElement('div');
        item.className = 'evolucao-item';
        item.innerHTML = '<div class="evolucao-header">' +
            '<span class="evolucao-data">' + new Date(ev.data).toLocaleString('pt-BR') + '</span>' +
            '<button class="btn btn-sm" style="background: var(--danger);" onclick="deletarEvolucao(' + realIndex + ')">Excluir</button>' +
            '</div>' +
            '<div class="evolucao-texto">' + (ev.texto || '').replace(/\n/g, '<br>') + '</div>';
        list.appendChild(item);
    });
}

function adicionarEvolucao() {
    if (!pacienteSelecionado) {
        alert('Selecione um paciente primeiro!');
        return;
    }
    
    const textarea = document.getElementById('evolucaoTexto');
    const texto = textarea ? textarea.value.trim() : '';
    
    if (!texto) {
        alert('⚠️ Digite o texto da evolução');
        return;
    }
    
    const key = 'prontuario_evolucao_' + pacienteSelecionado;
    const evolucoes = JSON.parse(localStorage.getItem(key) || '[]');
    
    evolucoes.push({
        data: new Date().toISOString(),
        texto: texto
    });
    
    localStorage.setItem(key, JSON.stringify(evolucoes));
    
    if (textarea) textarea.value = '';
    carregarEvolucoes();
    
    alert('✅ Evolução adicionada com sucesso!');
}

function deletarEvolucao(index) {
    if (!confirm('Deseja realmente excluir esta evolução?')) return;
    
    const key = 'prontuario_evolucao_' + pacienteSelecionado;
    const evolucoes = JSON.parse(localStorage.getItem(key) || '[]');
    
    evolucoes.splice(index, 1);
    localStorage.setItem(key, JSON.stringify(evolucoes));
    carregarEvolucoes();
}

// ==================== HELPER: getCurrentUser ====================
function getCurrentUser() {
    try {
        const userData = localStorage.getItem('current_dentista') || 
                        localStorage.getItem('user') || 
                        localStorage.getItem('currentUser') ||
                        localStorage.getItem('dentista');
        if (userData) {
            return JSON.parse(userData);
        }
    } catch(e) {
        console.error('Erro ao obter usuário:', e);
    }
    return { id: 'default' };
}
