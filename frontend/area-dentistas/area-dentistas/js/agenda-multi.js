// =====================================================
// DENTAL ULTRA - AGENDA MULTI-DENTISTA
// Com integração completa ao Backend PostgreSQL
// Versão: 8.0 - 28/01/2026
// =====================================================

// ==================== CONFIGURAÇÃO ====================
const API_BASE = typeof API_URL !== 'undefined' ? API_URL : 'https://dentist-backend-v2-production.up.railway.app';

// ==================== VARIÁVEIS GLOBAIS ====================
let dataSelecionada = new Date();
let mesAtual = new Date();
let dentistaAtivo = 1; // Coluna 1 ou 2
let colunaParaSelecionarDentista = 1;
let duracaoBuscaSelecionada = 60;
let duracaoAgendamentoSelecionada = 30;
let agendamentoEditando = null;
let pacientesLista = [];
let periodoSelecionado = 'qualquer';

// Dentistas das colunas (IDs do banco)
let colunaDentistas = {
    1: null, // { id, nome, cro, especialidade, icone, intervalo_minutos, hora_entrada, hora_saida, almoco_inicio, almoco_fim }
    2: null
};

// Coluna sendo configurada
let colunaConfigurando = null;

// Info de horário sendo desbloqueado
let horarioDesbloqueando = null;

// Cache de agendamentos carregados
let agendamentosCache = {};

// Lista de dentistas cadastrados (do banco)
let dentistasCadastrados = [];

// Fila de encaixe
let filaEncaixe = [];

// ==================== INICIALIZAÇÃO ====================
document.addEventListener('DOMContentLoaded', async function() {
    carregarDadosUsuario();
    
    // Configurar evento de upload de foto do dentista
    const inputFoto = document.getElementById('inputFotoDentista');
    if (inputFoto) {
        inputFoto.addEventListener('change', function() {
            previewFotoDentista(this);
        });
    }
    
    // Carregar dados do backend
    await carregarDentistasBackend();
    await carregarPacientes();
    await carregarFilaEncaixeBackend();
    
    // Restaurar seleção de colunas do localStorage
    restaurarSelecaoColunas();
    
    // Renderizar interface
    renderizarCalendario();
    await renderizarHorarios(1);
    await renderizarHorarios(2);
    atualizarBadgeFila();
    atualizarSelectDentistas();
    
    // Definir data de busca como hoje
    document.getElementById('buscaDataInicio').value = formatarDataInput(new Date());
});

// ==================== API HELPERS ====================
function getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

async function apiGet(endpoint) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`Erro GET ${endpoint}:`, error);
        return null;
    }
}

async function apiPost(endpoint, data) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.erro || `HTTP ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Erro POST ${endpoint}:`, error);
        throw error;
    }
}

async function apiPut(endpoint, data) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`Erro PUT ${endpoint}:`, error);
        throw error;
    }
}

async function apiDelete(endpoint) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return true;
    } catch (error) {
        console.error(`Erro DELETE ${endpoint}:`, error);
        throw error;
    }
}

async function apiPatch(endpoint, data) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`Erro PATCH ${endpoint}:`, error);
        throw error;
    }
}

// ==================== DADOS DO USUÁRIO ====================
function carregarDadosUsuario() {
    const user = getCurrentDentista();
    if (user) {
        document.getElementById('userName').textContent = user.nome || 'Usuário';
        document.getElementById('userCRO').textContent = 'CRO: ' + (user.cro || '-----');
    }
}

function getCurrentDentista() {
    try {
        const data = localStorage.getItem('current_dentista');
        return data ? JSON.parse(data) : null;
    } catch(e) {
        return null;
    }
}

function logout() {
    if (confirm('Deseja realmente sair?')) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('current_dentista');
        window.location.href = 'login.html';
    }
}

// ==================== CARREGAR PACIENTES ====================
async function carregarPacientes() {
    try {
        const data = await apiGet('/api/pacientes');
        // Backend retorna { success: true, pacientes: [...] }
        if (data && data.pacientes) {
            pacientesLista = data.pacientes;
        } else if (Array.isArray(data)) {
            pacientesLista = data;
        } else {
            pacientesLista = [];
        }
        console.log('Pacientes carregados:', pacientesLista.length);
    } catch(e) {
        console.error('Erro ao carregar pacientes:', e);
        pacientesLista = [];
    }
}

// ==================== DENTISTAS - BACKEND ====================
async function carregarDentistasBackend() {
    try {
        const data = await apiGet('/api/dentistas');
        dentistasCadastrados = Array.isArray(data) ? data : [];
        console.log('Dentistas carregados:', dentistasCadastrados.length);
    } catch(e) {
        console.error('Erro ao carregar dentistas:', e);
        dentistasCadastrados = [];
    }
}

function restaurarSelecaoColunas() {
    // Restaurar IDs das colunas do localStorage
    const saved = localStorage.getItem('agenda_colunas_dentistas');
    if (saved) {
        const ids = JSON.parse(saved);
        
        // Coluna 1
        if (ids[1]) {
            const d1 = dentistasCadastrados.find(d => d.id === ids[1]);
            if (d1) colunaDentistas[1] = d1;
        }
        
        // Coluna 2
        if (ids[2]) {
            const d2 = dentistasCadastrados.find(d => d.id === ids[2]);
            if (d2) colunaDentistas[2] = d2;
        }
    }
    
    atualizarDentistaUI(1);
    atualizarDentistaUI(2);
}

function salvarSelecaoColunas() {
    const ids = {
        1: colunaDentistas[1] ? colunaDentistas[1].id : null,
        2: colunaDentistas[2] ? colunaDentistas[2].id : null
    };
    localStorage.setItem('agenda_colunas_dentistas', JSON.stringify(ids));
}

function atualizarDentistaUI(coluna) {
    const d = colunaDentistas[coluna];
    const icon = document.getElementById('dentista' + coluna + 'Icon');
    const nome = document.getElementById('dentista' + coluna + 'Nome');
    const status = document.getElementById('dentista' + coluna + 'Status');
    const intervaloEl = document.getElementById('dentista' + coluna + 'Intervalo');
    const expedienteEl = document.getElementById('dentista' + coluna + 'Expediente');
    const btnSelecionar = document.getElementById('btnSelecionar' + coluna);
    const configBar = document.getElementById('dentista' + coluna + 'ConfigBar');
    
    if (d) {
        // Se tem foto, mostrar foto; senão mostrar ícone
        if (d.foto) {
            icon.innerHTML = `<img src="${d.foto}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; cursor: pointer;" onclick="event.stopPropagation(); abrirEditarProfissional(${coluna})" title="Clique para editar foto">`;
        } else {
            icon.innerHTML = '';
            icon.textContent = d.icone || '🦷';
            icon.style.cursor = 'pointer';
            icon.onclick = function(e) { e.stopPropagation(); abrirEditarProfissional(coluna); };
            icon.title = 'Clique para editar';
        }
        nome.textContent = d.nome;
        status.textContent = d.especialidade || 'Clínico Geral';
        
        // Atualizar barra de configuração
        const intervalo = d.intervalo_minutos || 30;
        const entrada = d.hora_entrada || '08:00';
        const saida = d.hora_saida || '18:00';
        
        if (intervaloEl) intervaloEl.textContent = `⏱️ ${intervalo}min`;
        if (expedienteEl) expedienteEl.textContent = `🕐 ${entrada}-${saida}`;
        
        // Mudar texto do botão e mostrar config bar
        if (btnSelecionar) btnSelecionar.textContent = 'Trocar';
        if (configBar) configBar.style.display = 'flex';
    } else {
        icon.innerHTML = '';
        icon.textContent = '🦷';
        icon.style.cursor = 'default';
        icon.onclick = null;
        icon.title = '';
        nome.textContent = 'Selecionar Profissional';
        status.textContent = 'Clique para escolher';
        
        if (intervaloEl) intervaloEl.textContent = '⏱️ --';
        if (expedienteEl) expedienteEl.textContent = '🕐 --:-- - --:--';
        
        // Mudar texto do botão e esconder config bar
        if (btnSelecionar) btnSelecionar.textContent = 'Escolher';
        if (configBar) configBar.style.display = 'none';
    }
}

function selecionarDentista(coluna) {
    dentistaAtivo = coluna;
    
    document.getElementById('dentista1Col').classList.toggle('ativo', coluna === 1);
    document.getElementById('dentista1Col').classList.toggle('inativo', coluna !== 1);
    document.getElementById('dentista2Col').classList.toggle('ativo', coluna === 2);
    document.getElementById('dentista2Col').classList.toggle('inativo', coluna !== 2);
}

function abrirSelecionarDentista(coluna) {
    colunaParaSelecionarDentista = coluna;
    renderizarListaDentistas();
    document.getElementById('modalSelecionarDentista').classList.add('open');
}

function fecharModalDentista() {
    document.getElementById('modalSelecionarDentista').classList.remove('open');
}

function renderizarListaDentistas() {
    const lista = document.getElementById('listaDentistasModal');
    
    if (dentistasCadastrados.length === 0) {
        lista.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">Nenhum dentista cadastrado</div>';
        return;
    }
    
    let html = '';
    dentistasCadastrados.forEach(d => {
        // Mostrar foto ou ícone
        const fotoHtml = d.foto 
            ? `<img src="${d.foto}" class="dentista-foto-lista" alt="${d.nome}">`
            : `<span style="font-size: 24px;">${d.icone || '🦷'}</span>`;
        
        html += `<div class="dropdown-dentista-item">
            <div class="dentista-info-modal" onclick="atribuirDentista(${d.id})" style="display: flex; align-items: center; gap: 12px; flex: 1; cursor: pointer;">
                ${fotoHtml}
                <div>
                    <div style="font-weight: 600;">${d.nome}</div>
                    <div style="font-size: 12px; color: #666;">${d.especialidade || 'Clínico Geral'} ${d.cro ? '• CRO: ' + d.cro : ''}</div>
                </div>
            </div>
            <button class="btn-excluir-dentista" onclick="event.stopPropagation(); abrirModalExclusao(${d.id}, '${d.nome.replace(/'/g, "\\'")}')">
                🗑️
            </button>
        </div>`;
    });
    
    lista.innerHTML = html;
}

async function atribuirDentista(dentistaId) {
    const d = dentistasCadastrados.find(x => x.id === dentistaId);
    
    if (d) {
        colunaDentistas[colunaParaSelecionarDentista] = d;
        salvarSelecaoColunas();
        atualizarDentistaUI(colunaParaSelecionarDentista);
        await renderizarHorarios(colunaParaSelecionarDentista);
        atualizarSelectDentistas();
    }
    
    fecharModalDentista();
}

// ==================== CADASTRAR NOVO DENTISTA ====================
function abrirCadastrarDentista() {
    fecharModalDentista();
    document.getElementById('novoDentistaNome').value = '';
    document.getElementById('novoDentistaCRO').value = '';
    document.getElementById('novoDentistaEspec').value = '';
    document.querySelectorAll('.avatar-option').forEach(el => el.classList.remove('selected'));
    document.querySelector('.avatar-option').classList.add('selected');
    
    // Limpar foto
    document.getElementById('novoDentistaFotoBase64').value = '';
    document.getElementById('fotoPreview').innerHTML = '<span class="foto-preview-icon">📷</span>';
    document.getElementById('fotoPreview').classList.remove('has-image');
    document.getElementById('btnRemoverFoto').style.display = 'none';
    
    document.getElementById('modalCadastrarDentista').classList.add('open');
}

function fecharModalCadastrarDentista() {
    document.getElementById('modalCadastrarDentista').classList.remove('open');
}

function selecionarAvatar(el) {
    document.querySelectorAll('.avatar-option').forEach(x => x.classList.remove('selected'));
    el.classList.add('selected');
    
    // Se selecionar um avatar, limpar a foto
    document.getElementById('novoDentistaFotoBase64').value = '';
    document.getElementById('fotoPreview').innerHTML = '<span class="foto-preview-icon">📷</span>';
    document.getElementById('fotoPreview').classList.remove('has-image');
    document.getElementById('btnRemoverFoto').style.display = 'none';
}

// ==================== UPLOAD DE FOTO DO DENTISTA ====================
function previewFotoDentista(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        
        // Verificar tamanho (máx 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('⚠️ A foto deve ter no máximo 2MB!');
            return;
        }
        
        // Verificar tipo
        if (!file.type.startsWith('image/')) {
            alert('⚠️ Selecione uma imagem válida (JPG ou PNG)!');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            // Redimensionar e recortar circular
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const size = 200; // Tamanho fixo
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext('2d');
                
                // Calcular crop para ficar quadrado centralizado
                let sx, sy, sSize;
                if (img.width > img.height) {
                    sSize = img.height;
                    sx = (img.width - sSize) / 2;
                    sy = 0;
                } else {
                    sSize = img.width;
                    sx = 0;
                    sy = (img.height - sSize) / 2;
                }
                
                // Desenhar recortado
                ctx.drawImage(img, sx, sy, sSize, sSize, 0, 0, size, size);
                
                // Converter para base64 comprimido
                const base64 = canvas.toDataURL('image/jpeg', 0.8);
                
                // Salvar no campo hidden
                document.getElementById('novoDentistaFotoBase64').value = base64;
                
                // Mostrar preview
                document.getElementById('fotoPreview').innerHTML = `<img src="${base64}" alt="Preview">`;
                document.getElementById('fotoPreview').classList.add('has-image');
                document.getElementById('btnRemoverFoto').style.display = 'inline-block';
                
                // Desmarcar avatars
                document.querySelectorAll('.avatar-option').forEach(x => x.classList.remove('selected'));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function removerFotoDentista() {
    document.getElementById('novoDentistaFotoBase64').value = '';
    document.getElementById('fotoPreview').innerHTML = '<span class="foto-preview-icon">📷</span>';
    document.getElementById('fotoPreview').classList.remove('has-image');
    document.getElementById('btnRemoverFoto').style.display = 'none';
    document.getElementById('inputFotoDentista').value = '';
    
    // Selecionar primeiro avatar
    document.querySelectorAll('.avatar-option').forEach(x => x.classList.remove('selected'));
    document.querySelector('.avatar-option').classList.add('selected');
}

// ==================== EXCLUSÃO DE DENTISTA COM SENHA ====================
let dentistaParaExcluir = null;

function abrirModalExclusao(dentistaId, dentistaNome) {
    dentistaParaExcluir = dentistaId;
    document.getElementById('nomeExcluirDentista').textContent = dentistaNome;
    document.getElementById('senhaExclusao').value = '';
    document.getElementById('modalConfirmarExclusao').classList.add('open');
}

function fecharModalExclusao() {
    document.getElementById('modalConfirmarExclusao').classList.remove('open');
    dentistaParaExcluir = null;
}

async function confirmarExclusaoDentista() {
    const senha = document.getElementById('senhaExclusao').value;
    
    if (!senha) {
        alert('⚠️ Digite a senha para confirmar!');
        return;
    }
    
    // Verificar senha (usa a mesma do login armazenada ou valida no backend)
    try {
        // Chamar API para excluir (o backend verifica a senha)
        await apiDelete(`/api/dentistas/${dentistaParaExcluir}?senha=${encodeURIComponent(senha)}`);
        
        // Remover da lista local
        dentistasCadastrados = dentistasCadastrados.filter(d => d.id !== dentistaParaExcluir);
        
        // Se estava em alguma coluna, limpar
        if (colunaDentistas[1] && colunaDentistas[1].id === dentistaParaExcluir) {
            colunaDentistas[1] = null;
            atualizarDentistaUI(1);
        }
        if (colunaDentistas[2] && colunaDentistas[2].id === dentistaParaExcluir) {
            colunaDentistas[2] = null;
            atualizarDentistaUI(2);
        }
        salvarSelecaoColunas();
        
        // Atualizar listas
        renderizarListaDentistas();
        atualizarSelectDentistas();
        await renderizarHorarios(1);
        await renderizarHorarios(2);
        
        fecharModalExclusao();
        alert('✅ Dentista excluído com sucesso!');
        
    } catch (error) {
        if (error.message.includes('401') || error.message.includes('403')) {
            alert('❌ Senha incorreta!');
        } else {
            alert('❌ Erro ao excluir: ' + error.message);
        }
    }
}

async function salvarNovoDentista() {
    const nome = document.getElementById('novoDentistaNome').value.trim();
    const cro = document.getElementById('novoDentistaCRO').value.trim();
    const espec = document.getElementById('novoDentistaEspec').value;
    const iconEl = document.querySelector('.avatar-option.selected');
    const icone = iconEl ? iconEl.dataset.icon : '🦷';
    const foto = document.getElementById('novoDentistaFotoBase64').value;
    
    if (!nome) {
        alert('⚠️ Digite o nome do dentista!');
        return;
    }
    
    try {
        // Salvar no backend
        const novoDentista = await apiPost('/api/dentistas', {
            nome: nome,
            cro: cro || null,
            especialidade: espec || 'Clínico Geral',
            icone: foto ? null : icone, // Se tem foto, não precisa de ícone
            foto: foto || null
        });
        
        // Adicionar à lista local
        dentistasCadastrados.push(novoDentista);
        
        // Atribuir à coluna atual
        colunaDentistas[colunaParaSelecionarDentista] = novoDentista;
        salvarSelecaoColunas();
        atualizarDentistaUI(colunaParaSelecionarDentista);
        await renderizarHorarios(colunaParaSelecionarDentista);
        atualizarSelectDentistas();
        
        fecharModalCadastrarDentista();
        alert('✅ Dentista cadastrado com sucesso!');
        
    } catch (error) {
        alert('❌ Erro ao cadastrar dentista: ' + error.message);
    }
}

// ==================== CALENDÁRIO ====================
function renderizarCalendario() {
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                   'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    
    document.getElementById('monthTitle').textContent = meses[mesAtual.getMonth()] + ' ' + mesAtual.getFullYear();
    
    const container = document.getElementById('calDays');
    container.innerHTML = '';
    
    const primeiroDia = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1);
    const ultimoDia = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0);
    
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    // Dias do mês anterior
    for (let i = 0; i < primeiroDia.getDay(); i++) {
        const d = new Date(primeiroDia);
        d.setDate(d.getDate() - (primeiroDia.getDay() - i));
        const div = document.createElement('div');
        div.className = 'cal-day other';
        div.textContent = d.getDate();
        container.appendChild(div);
    }
    
    // Dias do mês atual
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
        const data = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), dia);
        const div = document.createElement('div');
        div.className = 'cal-day';
        div.textContent = dia;
        
        if (data.getTime() === hoje.getTime()) {
            div.classList.add('today');
        }
        
        if (data.toDateString() === dataSelecionada.toDateString()) {
            div.classList.add('selected');
        }
        
        div.onclick = () => selecionarData(data);
        container.appendChild(div);
    }
    
    // Dias do próximo mês
    const diasRestantes = 42 - container.children.length;
    for (let i = 1; i <= diasRestantes; i++) {
        const div = document.createElement('div');
        div.className = 'cal-day other';
        div.textContent = i;
        container.appendChild(div);
    }
}

function changeMonth(delta) {
    mesAtual.setMonth(mesAtual.getMonth() + delta);
    renderizarCalendario();
}

async function goToday() {
    mesAtual = new Date();
    dataSelecionada = new Date();
    renderizarCalendario();
    await renderizarHorarios(1);
    await renderizarHorarios(2);
}

async function selecionarData(data) {
    dataSelecionada = data;
    renderizarCalendario();
    await renderizarHorarios(1);
    await renderizarHorarios(2);
}

// ==================== HORÁRIOS - BACKEND ====================
async function carregarAgendamentosDia(dentistaId, dataStr) {
    if (!dentistaId) return [];
    
    const cacheKey = `${dentistaId}_${dataStr}`;
    
    try {
        const response = await apiGet(`/api/agendamentos?profissional_id=${dentistaId}&data=${dataStr}`);
        // Backend retorna { success: true, agendamentos: [...] }
        let agendamentos = [];
        if (response && response.agendamentos) {
            agendamentos = response.agendamentos;
        } else if (Array.isArray(response)) {
            agendamentos = response;
        }
        agendamentosCache[cacheKey] = agendamentos;
        return agendamentos;
    } catch (e) {
        console.error('Erro ao carregar agendamentos:', e);
        return agendamentosCache[cacheKey] || [];
    }
}

// ==================== CONFIGURAÇÃO DO DENTISTA ====================
function abrirConfigDentista(coluna) {
    const d = colunaDentistas[coluna];
    if (!d) {
        alert('⚠️ Selecione um dentista primeiro!');
        return;
    }
    
    colunaConfigurando = coluna;
    
    // Preencher nome
    document.getElementById('configDentistaNome').textContent = d.nome;
    
    // Preencher intervalo
    const intervalo = d.intervalo_minutos || 30;
    document.querySelectorAll('#configIntervalo .config-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.valor) === intervalo);
    });
    
    // Preencher horários
    document.getElementById('configHoraEntrada').value = d.hora_entrada || '08:00';
    document.getElementById('configHoraSaida').value = d.hora_saida || '18:00';
    document.getElementById('configAlmocoInicio').value = d.almoco_inicio || '12:00';
    document.getElementById('configAlmocoFim').value = d.almoco_fim || '13:00';
    
    document.getElementById('modalConfigDentista').classList.add('open');
}

function fecharConfigDentista() {
    document.getElementById('modalConfigDentista').classList.remove('open');
    colunaConfigurando = null;
}

function selecionarIntervalo(valor) {
    document.querySelectorAll('#configIntervalo .config-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.valor) === valor);
    });
}

async function salvarConfigDentista() {
    if (!colunaConfigurando) return;
    
    const d = colunaDentistas[colunaConfigurando];
    if (!d) return;
    
    // Pegar valores
    const intervaloBtn = document.querySelector('#configIntervalo .config-btn.active');
    const intervalo = intervaloBtn ? parseInt(intervaloBtn.dataset.valor) : 30;
    const horaEntrada = document.getElementById('configHoraEntrada').value;
    const horaSaida = document.getElementById('configHoraSaida').value;
    const almocoInicio = document.getElementById('configAlmocoInicio').value;
    const almocoFim = document.getElementById('configAlmocoFim').value;
    
    try {
        // Salvar no backend
        const response = await apiPatch(`/api/dentistas/${d.id}/config`, {
            intervalo_minutos: intervalo,
            hora_entrada: horaEntrada,
            hora_saida: horaSaida,
            almoco_inicio: almocoInicio,
            almoco_fim: almocoFim
        });
        
        // Atualizar objeto local
        d.intervalo_minutos = intervalo;
        d.hora_entrada = horaEntrada;
        d.hora_saida = horaSaida;
        d.almoco_inicio = almocoInicio;
        d.almoco_fim = almocoFim;
        
        // Atualizar UI
        atualizarDentistaUI(colunaConfigurando);
        
        // Re-renderizar horários
        await renderizarHorarios(colunaConfigurando);
        
        fecharConfigDentista();
        
        alert('✅ Configurações salvas com sucesso!');
    } catch (e) {
        console.error('Erro ao salvar configurações:', e);
        alert('❌ Erro ao salvar configurações');
    }
}

// Função auxiliar para API PATCH
async function apiPatch(url, data) {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(API_BASE + url, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Erro na requisição');
    return response.json();
}

// ==================== EDITAR PROFISSIONAL (FOTO/EMOJI) ====================
let colunaEditandoProfissional = null;

const EMOJIS_DENTISTA = ['🦷', '👨‍⚕️', '👩‍⚕️', '😷', '🏥', '💉', '🩺', '⭐', '💎', '🌟', '👤', '👥', '🎯', '💪', '🦴', '😁', '🦋', '🌈'];

function abrirEditarProfissional(coluna) {
    const d = colunaDentistas[coluna];
    if (!d) return;
    
    colunaEditandoProfissional = coluna;
    
    // Preencher dados atuais
    document.getElementById('editProfNome').textContent = d.nome;
    document.getElementById('editProfEspecialidade').textContent = d.especialidade || 'Clínico Geral';
    
    // Mostrar foto ou emoji atual
    const previewEl = document.getElementById('editProfPreview');
    if (d.foto) {
        previewEl.innerHTML = `<img src="${d.foto}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover;">`;
    } else {
        previewEl.innerHTML = `<span style="font-size: 48px;">${d.icone || '🦷'}</span>`;
    }
    
    // Renderizar emojis disponíveis
    const emojisContainer = document.getElementById('editProfEmojis');
    emojisContainer.innerHTML = EMOJIS_DENTISTA.map(emoji => 
        `<button class="emoji-btn ${d.icone === emoji ? 'selected' : ''}" onclick="selecionarEmojiProfissional('${emoji}')">${emoji}</button>`
    ).join('');
    
    // Limpar input de foto
    document.getElementById('editProfFotoInput').value = '';
    
    document.getElementById('modalEditarProfissional').classList.add('open');
}

function fecharEditarProfissional() {
    document.getElementById('modalEditarProfissional').classList.remove('open');
    colunaEditandoProfissional = null;
}

function selecionarEmojiProfissional(emoji) {
    // Atualizar seleção visual
    document.querySelectorAll('#editProfEmojis .emoji-btn').forEach(btn => {
        btn.classList.toggle('selected', btn.textContent === emoji);
    });
    
    // Atualizar preview
    document.getElementById('editProfPreview').innerHTML = `<span style="font-size: 48px;">${emoji}</span>`;
    
    // Limpar foto se selecionou emoji
    document.getElementById('editProfFotoInput').value = '';
}

function previewFotoEditProfissional(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('editProfPreview').innerHTML = 
                `<img src="${e.target.result}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover;">`;
            
            // Desmarcar emojis
            document.querySelectorAll('#editProfEmojis .emoji-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
        };
        reader.readAsDataURL(input.files[0]);
    }
}

async function salvarEditarProfissional() {
    if (!colunaEditandoProfissional) return;
    
    const d = colunaDentistas[colunaEditandoProfissional];
    if (!d) return;
    
    // Verificar se tem foto nova
    const fotoInput = document.getElementById('editProfFotoInput');
    let novaFoto = null;
    let novoIcone = null;
    
    if (fotoInput.files && fotoInput.files[0]) {
        // Converter foto para base64
        novaFoto = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(fotoInput.files[0]);
        });
    } else {
        // Pegar emoji selecionado
        const emojiSelecionado = document.querySelector('#editProfEmojis .emoji-btn.selected');
        if (emojiSelecionado) {
            novoIcone = emojiSelecionado.textContent;
        }
    }
    
    try {
        // Atualizar no backend
        await apiPut(`/api/dentistas/${d.id}`, {
            nome: d.nome,
            foto: novaFoto || (novoIcone ? null : d.foto),
            icone: novoIcone || (novaFoto ? null : d.icone)
        });
        
        // Atualizar objeto local
        if (novaFoto) {
            d.foto = novaFoto;
            d.icone = null;
        } else if (novoIcone) {
            d.icone = novoIcone;
            d.foto = null;
        }
        
        // Atualizar lista de dentistas
        const idx = dentistasCadastrados.findIndex(x => x.id === d.id);
        if (idx >= 0) {
            dentistasCadastrados[idx] = { ...dentistasCadastrados[idx], foto: d.foto, icone: d.icone };
        }
        
        // Atualizar UI
        atualizarDentistaUI(colunaEditandoProfissional);
        
        fecharEditarProfissional();
        alert('✅ Profissional atualizado!');
    } catch (e) {
        console.error('Erro ao atualizar profissional:', e);
        alert('❌ Erro ao atualizar');
    }
}

// ==================== DESBLOQUEAR HORÁRIO ====================
function abrirDesbloquearHorario(coluna, hora, tipo) {
    horarioDesbloqueando = { coluna, hora, tipo };
    
    document.getElementById('desbloquearHora').textContent = hora;
    
    if (tipo === 'almoco') {
        document.getElementById('desbloquearInfo').textContent = 'Este horário está marcado como horário de almoço.';
        document.getElementById('desbloquearTipo').textContent = '🍽️ Horário de Almoço';
    } else {
        document.getElementById('desbloquearInfo').textContent = 'Este horário está fora do expediente normal.';
        document.getElementById('desbloquearTipo').textContent = '⏰ Fora do Expediente';
    }
    
    document.getElementById('modalDesbloquear').classList.add('open');
}

function fecharModalDesbloquear() {
    document.getElementById('modalDesbloquear').classList.remove('open');
    horarioDesbloqueando = null;
}

function confirmarDesbloquear() {
    if (!horarioDesbloqueando) return;
    
    const { coluna, hora } = horarioDesbloqueando;
    fecharModalDesbloquear();
    
    // Abrir modal de novo agendamento
    novoAgendamento(coluna, hora);
}

async function renderizarHorarios(coluna) {
    const container = document.getElementById('dentista' + coluna + 'Horarios');
    const dataStr = formatarDataKey(dataSelecionada);
    const dataBadge = document.getElementById('dentista' + coluna + 'Data');
    
    dataBadge.textContent = formatarDataExibicao(dataSelecionada);
    
    const dentista = colunaDentistas[coluna];
    
    if (!dentista) {
        container.innerHTML = '<div style="padding: 40px; text-align: center; color: #999;">Selecione um dentista</div>';
        return;
    }
    
    // Configurações do dentista
    const intervalo = dentista.intervalo_minutos || 30;
    const horaEntrada = dentista.hora_entrada || '08:00';
    const horaSaida = dentista.hora_saida || '18:00';
    const almocoInicio = dentista.almoco_inicio || '12:00';
    const almocoFim = dentista.almoco_fim || '13:00';
    
    // Converter para minutos para comparação
    const [entH, entM] = horaEntrada.split(':').map(Number);
    const [saiH, saiM] = horaSaida.split(':').map(Number);
    const [almIniH, almIniM] = almocoInicio.split(':').map(Number);
    const [almFimH, almFimM] = almocoFim.split(':').map(Number);
    
    const entradaMin = entH * 60 + entM;
    const saidaMin = saiH * 60 + saiM;
    const almocoIniMin = almIniH * 60 + almIniM;
    const almocoFimMin = almFimH * 60 + almFimM;
    
    // Carregar agendamentos do backend
    const agendamentosDia = await carregarAgendamentosDia(dentista.id, dataStr);
    
    // Gerar horários de 06:00 às 22:00 com intervalo do dentista
    const horarios = [];
    for (let h = 6; h < 22; h++) {
        for (let m = 0; m < 60; m += intervalo) {
            if (h * 60 + m < 22 * 60) { // Não ultrapassar 22:00
                horarios.push(String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0'));
            }
        }
    }
    
    // Marcar horários ocupados
    let horariosOcupados = new Set();
    let agendamentosPorHora = {};
    
    agendamentosDia.forEach(ag => {
        const horaStr = ag.hora.substring(0, 5); // Pegar só HH:MM
        agendamentosPorHora[horaStr] = ag;
        
        const duracao = ag.duracao || intervalo;
        const [h, m] = horaStr.split(':').map(Number);
        let minutos = h * 60 + m;
        
        for (let i = 0; i < duracao; i += intervalo) {
            const hh = Math.floor(minutos / 60);
            const mm = minutos % 60;
            horariosOcupados.add(String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0'));
            minutos += intervalo;
        }
    });
    
    let html = '';
    horarios.forEach(hora => {
        const [h, m] = hora.split(':').map(Number);
        const horaMin = h * 60 + m;
        
        const agendamento = agendamentosPorHora[hora];
        
        // Verificar tipo de horário
        const isAntesExpediente = horaMin < entradaMin;
        const isDepoisExpediente = horaMin >= saidaMin;
        const isAlmoco = horaMin >= almocoIniMin && horaMin < almocoFimMin;
        const isForaExpediente = isAntesExpediente || isDepoisExpediente;
        
        if (agendamento) {
            // Tem agendamento - mostrar normalmente
            const durMin = agendamento.duracao || intervalo;
            const status = agendamento.status || 'agendado';
            const statusClass = (status === 'confirmado') ? 'confirmado' : (status === 'cancelado' ? 'cancelado' : '');
            const statusIcon = (status === 'confirmado') ? '✓ ' : (status === 'cancelado' ? '✕ ' : '');
            
            html += `<div class="slot busy ${agendamento.encaixe ? 'encaixe' : ''} ${statusClass}" onclick="editarAgendamento(${coluna}, ${agendamento.id})">
                <div class="slot-time">${hora}</div>
                <div class="slot-info">
                    <div class="slot-name">${statusIcon}${agendamento.paciente_nome || 'Paciente'}</div>
                    <div class="slot-proc">${agendamento.procedimento || ''}</div>
                </div>
                <div class="slot-dur">${durMin}min</div>
            </div>`;
        } else if (horariosOcupados.has(hora)) {
            // Continuação de um agendamento
            html += `<div class="slot blocked">
                <div class="slot-time">${hora}</div>
                <div class="slot-info">
                    <span class="slot-empty">• Em atendimento</span>
                </div>
            </div>`;
        } else if (isAlmoco) {
            // Horário de almoço - clicável para desbloquear
            html += `<div class="slot almoco" onclick="abrirDesbloquearHorario(${coluna}, '${hora}', 'almoco')">
                <div class="slot-time">${hora}</div>
                <div class="slot-info">
                    <span class="slot-empty">🍽️ Almoço</span>
                </div>
            </div>`;
        } else if (isForaExpediente) {
            // Fora do expediente - clicável para desbloquear
            html += `<div class="slot fora-expediente" onclick="abrirDesbloquearHorario(${coluna}, '${hora}', 'fora')">
                <div class="slot-time">${hora}</div>
                <div class="slot-info">
                    <span class="slot-empty">⏰ Fora do expediente</span>
                </div>
            </div>`;
        } else {
            // Disponível
            html += `<div class="slot" onclick="novoAgendamento(${coluna}, '${hora}')">
                <div class="slot-time">${hora}</div>
                <div class="slot-info">
                    <span class="slot-empty">Disponível - Clique para agendar</span>
                </div>
            </div>`;
        }
    });
    
    container.innerHTML = html;
}

// ==================== AGENDAMENTO ====================
function novoAgendamento(coluna, hora) {
    const dentista = colunaDentistas[coluna];
    
    if (!dentista) {
        alert('⚠️ Selecione um dentista primeiro!');
        abrirSelecionarDentista(coluna);
        return;
    }
    
    agendamentoEditando = null;
    dentistaAtivo = coluna;
    
    // Atualizar modal
    document.getElementById('modalAgendamentoTitulo').textContent = 'Novo Agendamento';
    document.getElementById('modalAgendamentoData').textContent = formatarDataExibicaoLonga(dataSelecionada);
    document.getElementById('modalAgendamentoHora').textContent = hora;
    document.getElementById('modalAgendamentoDentista').textContent = dentista.nome;
    
    // Esconder barra de status (só aparece ao editar)
    document.getElementById('agendamentoStatusBar').style.display = 'none';
    
    // Limpar campos
    document.getElementById('agendamentoPacienteBusca').value = '';
    document.getElementById('agendamentoPacienteId').value = '';
    document.getElementById('agendamentoPacienteSelecionado').classList.remove('show');
    document.getElementById('agendamentoProcedimento').value = '';
    document.getElementById('agendamentoObs').value = '';
    document.getElementById('btnExcluirAgendamento').style.display = 'none';
    
    // Resetar duração
    document.querySelectorAll('#modalAgendamento .interval-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.dur === '30');
    });
    duracaoAgendamentoSelecionada = 30;
    
    document.getElementById('modalAgendamento').classList.add('open');
}

async function editarAgendamento(coluna, agendamentoId) {
    const dentista = colunaDentistas[coluna];
    if (!dentista) return;
    
    try {
        const ag = await apiGet(`/api/agendamentos/${agendamentoId}`);
        if (!ag) return;
        
        agendamentoEditando = { 
            id: agendamentoId, 
            coluna,
            codigoConfirmacao: ag.codigoConfirmacao,
            status: ag.status,
            pacienteTelefone: ag.paciente_telefone
        };
        dentistaAtivo = coluna;
        
        // Atualizar modal
        document.getElementById('modalAgendamentoTitulo').textContent = 'Editar Agendamento';
        document.getElementById('modalAgendamentoData').textContent = formatarDataExibicaoLonga(dataSelecionada);
        document.getElementById('modalAgendamentoHora').textContent = ag.hora ? ag.hora.substring(0, 5) : '--:--';
        document.getElementById('modalAgendamentoDentista').textContent = dentista.nome;
        
        // Mostrar barra de status
        const statusBar = document.getElementById('agendamentoStatusBar');
        const statusBadge = document.getElementById('agendamentoStatusBadge');
        const codigoEl = document.getElementById('agendamentoCodigoConfirmacao');
        
        statusBar.style.display = 'flex';
        
        // Definir badge de status
        const status = ag.status || 'agendado';
        statusBadge.className = 'status-badge';
        if (status === 'confirmado') {
            statusBadge.classList.add('confirmado');
            statusBadge.textContent = '✓ Confirmado';
        } else if (status === 'cancelado') {
            statusBadge.classList.add('cancelado');
            statusBadge.textContent = '✕ Cancelado';
        } else {
            statusBadge.classList.add('aguardando');
            statusBadge.textContent = '⏳ Aguardando';
        }
        
        // Mostrar código de confirmação
        if (ag.codigoConfirmacao) {
            codigoEl.textContent = 'Código: ' + ag.codigoConfirmacao;
            codigoEl.style.display = 'inline-block';
        } else {
            codigoEl.style.display = 'none';
        }
        
        // Preencher campos
        document.getElementById('agendamentoPacienteBusca').value = '';
        document.getElementById('agendamentoPacienteId').value = ag.paciente_id || ag.pacienteId || '';
        document.getElementById('agendamentoPacienteNome').textContent = ag.paciente_nome || '-';
        document.getElementById('agendamentoPacienteTel').textContent = ag.paciente_telefone || '-';
        document.getElementById('agendamentoPacienteSelecionado').classList.add('show');
        document.getElementById('agendamentoProcedimento').value = ag.procedimento || '';
        document.getElementById('agendamentoObs').value = ag.observacoes || '';
        document.getElementById('btnExcluirAgendamento').style.display = 'block';
        
        // Selecionar duração
        duracaoAgendamentoSelecionada = ag.duracao || 30;
        document.querySelectorAll('#modalAgendamento .interval-btn').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.dur) === duracaoAgendamentoSelecionada);
        });
        
        document.getElementById('modalAgendamento').classList.add('open');
        
    } catch (error) {
        console.error('Erro ao carregar agendamento:', error);
    }
}

function fecharModalAgendamento() {
    document.getElementById('modalAgendamento').classList.remove('open');
}

// Enviar confirmação via WhatsApp
function enviarConfirmacaoWhatsApp() {
    if (!agendamentoEditando || !agendamentoEditando.codigoConfirmacao) {
        alert('⚠️ Código de confirmação não disponível');
        return;
    }
    
    const telefone = agendamentoEditando.pacienteTelefone || document.getElementById('agendamentoPacienteTel').textContent;
    
    if (!telefone || telefone === '-') {
        alert('⚠️ Paciente não possui telefone cadastrado');
        return;
    }
    
    // Limpar telefone (remover caracteres não numéricos)
    let telLimpo = telefone.replace(/\D/g, '');
    
    // Adicionar código do país se não tiver
    if (telLimpo.length === 11 || telLimpo.length === 10) {
        telLimpo = '55' + telLimpo;
    }
    
    // Pegar configurações da clínica
    const config = JSON.parse(localStorage.getItem('configClinica') || '{}');
    const clinica = config.nome || config.nome_clinica || 'nossa clínica';
    const assinatura = config.assinatura || 'Atenciosamente,\nEquipe ' + clinica;
    
    const codigo = agendamentoEditando.codigoConfirmacao;
    const paciente = document.getElementById('agendamentoPacienteNome').textContent;
    const data = document.getElementById('modalAgendamentoData').textContent;
    const hora = document.getElementById('modalAgendamentoHora').textContent;
    const dentista = document.getElementById('modalAgendamentoDentista').textContent;
    
    // URL base do sistema
    const baseUrl = window.location.origin + '/area-dentistas/confirmar.html';
    
    // Links de confirmação
    const linkConfirmar = baseUrl + '?c=' + codigo;
    const linkCancelar = baseUrl + '?x=' + codigo;
    
    // Montar mensagem SEM emojis
    const mensagem = 'Olá ' + paciente + '!\n\n' +
        'Você tem uma consulta agendada na *' + clinica + '*:\n\n' +
        '*Data:* ' + data + '\n' +
        '*Horário:* ' + hora + '\n' +
        '*Profissional:* ' + dentista + '\n\n' +
        'Por favor, confirme sua presença:\n\n' +
        '*Confirmar:* ' + linkConfirmar + '\n\n' +
        '*Cancelar:* ' + linkCancelar + '\n\n' +
        assinatura;

    // Abrir WhatsApp
    const urlWhatsApp = 'https://wa.me/' + telLimpo + '?text=' + encodeURIComponent(mensagem);
    window.open(urlWhatsApp, '_blank');
}

function selecionarDuracaoAgendamento(btn) {
    document.querySelectorAll('#modalAgendamento .interval-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    duracaoAgendamentoSelecionada = parseInt(btn.dataset.dur);
}

async function salvarAgendamento() {
    const pacienteId = document.getElementById('agendamentoPacienteId').value;
    const pacienteNome = document.getElementById('agendamentoPacienteNome').textContent;
    const pacienteTel = document.getElementById('agendamentoPacienteTel').textContent;
    const procedimento = document.getElementById('agendamentoProcedimento').value;
    const obs = document.getElementById('agendamentoObs').value;
    const hora = document.getElementById('modalAgendamentoHora').textContent;
    
    const dentista = colunaDentistas[dentistaAtivo];
    
    if (!dentista) {
        alert('⚠️ Selecione um dentista!');
        return;
    }
    
    if (!pacienteId && pacienteNome === '-') {
        alert('⚠️ Selecione um paciente!');
        return;
    }
    
    if (!procedimento) {
        alert('⚠️ Selecione um procedimento!');
        return;
    }
    
    const dataStr = formatarDataKey(dataSelecionada);
    
    try {
        if (agendamentoEditando) {
            // Atualizar
            await apiPut(`/api/agendamentos/${agendamentoEditando.id}`, {
                paciente_id: pacienteId || null,
                paciente_nome: pacienteNome !== '-' ? pacienteNome : null,
                paciente_telefone: pacienteTel !== '-' ? pacienteTel : null,
                procedimento: procedimento,
                duracao: duracaoAgendamentoSelecionada,
                observacoes: obs
            });
        } else {
            // Criar novo
            await apiPost('/api/agendamentos', {
                profissional_id: dentista.id,
                pacienteId: pacienteId || null,
                pacienteNome: pacienteNome !== '-' ? pacienteNome : null,
                paciente_telefone: pacienteTel !== '-' ? pacienteTel : null,
                data: dataStr,
                horario: hora,
                duracao: duracaoAgendamentoSelecionada,
                procedimento: procedimento,
                observacoes: obs,
                encaixe: false
            });
        }
        
        // Limpar cache e recarregar
        agendamentosCache = {};
        await renderizarHorarios(1);
        await renderizarHorarios(2);
        renderizarCalendario();
        fecharModalAgendamento();
        
        alert('✅ Agendamento salvo com sucesso!');
        
    } catch (error) {
        alert('❌ Erro ao salvar: ' + error.message);
    }
}

async function excluirAgendamento() {
    if (!agendamentoEditando) return;
    
    if (!confirm('Deseja excluir este agendamento?')) return;
    
    try {
        await apiDelete(`/api/agendamentos/${agendamentoEditando.id}`);
        
        agendamentosCache = {};
        await renderizarHorarios(1);
        await renderizarHorarios(2);
        renderizarCalendario();
        fecharModalAgendamento();
        
        alert('✅ Agendamento excluído!');
        
    } catch (error) {
        alert('❌ Erro ao excluir: ' + error.message);
    }
}

// ==================== BUSCA DE PACIENTE NO AGENDAMENTO ====================
function buscarPacienteAgendamento() {
    const termo = document.getElementById('agendamentoPacienteBusca').value.toLowerCase().trim();
    const input = document.getElementById('agendamentoPacienteBusca');
    
    // Usar dropdown global no body para evitar problema de overflow do modal
    let container = document.getElementById('dropdownPacientesGlobal');
    if (!container) {
        container = document.createElement('div');
        container.id = 'dropdownPacientesGlobal';
        document.body.appendChild(container);
    }
    
    if (!termo) {
        container.style.display = 'none';
        return;
    }
    
    // Filtro igual ao pacientes.html (funciona!)
    const filtrados = pacientesLista.filter(function(p) {
        return (p.nome && p.nome.toLowerCase().includes(termo)) ||
               (p.cpf && p.cpf.includes(termo)) ||
               (p.telefone && p.telefone.includes(termo)) ||
               (p.celular && p.celular.includes(termo));
    }).slice(0, 10);
    
    if (filtrados.length === 0) {
        container.innerHTML = '<div style="padding: 15px; color: #999;">Nenhum paciente encontrado</div>';
    } else {
        container.innerHTML = filtrados.map(function(p) {
            return '<div onclick="selecionarPacienteAgendamento(\'' + p.id + '\', \'' + (p.nome || '').replace(/'/g, "\\'") + '\', \'' + (p.telefone || p.celular || '') + '\')" style="padding: 12px 15px; cursor: pointer; border-bottom: 1px solid #eee;" onmouseover="this.style.background=\'#e8f5e9\'" onmouseout="this.style.background=\'#fff\'">' +
                '<strong style="color: #333;">' + p.nome + '</strong>' +
                '<div style="font-size: 12px; color: #666; margin-top: 2px;">' + (p.telefone || p.celular || 'Sem telefone') + '</div>' +
            '</div>';
        }).join('');
    }
    
    // Posicionar dropdown abaixo do input
    const rect = input.getBoundingClientRect();
    container.style.cssText = 'display: block; position: fixed; top: ' + (rect.bottom + 2) + 'px; left: ' + rect.left + 'px; width: ' + rect.width + 'px; max-height: 250px; overflow-y: auto; background: #fff; border: 2px solid #2d7a5f; border-radius: 0 0 10px 10px; box-shadow: 0 8px 25px rgba(0,0,0,0.3); z-index: 999999;';
}

function mostrarResultadosPaciente() {
    const termo = document.getElementById('agendamentoPacienteBusca').value;
    if (termo) {
        buscarPacienteAgendamento();
    }
}

function selecionarPacienteAgendamento(id, nome, tel) {
    document.getElementById('agendamentoPacienteId').value = id;
    document.getElementById('agendamentoPacienteNome').textContent = nome;
    document.getElementById('agendamentoPacienteTel').textContent = tel || '-';
    document.getElementById('agendamentoPacienteSelecionado').classList.add('show');
    document.getElementById('agendamentoPacienteBusca').value = '';
    // Esconder dropdown global
    var dropdown = document.getElementById('dropdownPacientesGlobal');
    if (dropdown) dropdown.style.display = 'none';
}

function trocarPacienteAgendamento() {
    document.getElementById('agendamentoPacienteId').value = '';
    document.getElementById('agendamentoPacienteSelecionado').classList.remove('show');
    document.getElementById('agendamentoPacienteBusca').focus();
}

function abrirNovoPaciente() {
    // Usar o modal de paciente reutilizável
    if (typeof ModalPaciente !== 'undefined' && ModalPaciente.abrir) {
        ModalPaciente.abrir(function(novoPaciente) {
            // Callback quando salvar - preencher na busca
            if (novoPaciente && novoPaciente.id) {
                // Usar os mesmos IDs da função selecionarPacienteAgendamento
                document.getElementById('agendamentoPacienteId').value = novoPaciente.id;
                document.getElementById('agendamentoPacienteNome').textContent = novoPaciente.nome;
                document.getElementById('agendamentoPacienteTel').textContent = novoPaciente.celular || novoPaciente.telefone || '-';
                document.getElementById('agendamentoPacienteSelecionado').classList.add('show');
                document.getElementById('agendamentoPacienteBusca').value = '';
                // Esconder dropdown global
                var dropdown = document.getElementById('dropdownPacientesGlobal');
                if (dropdown) dropdown.style.display = 'none';
                // Recarregar lista de pacientes
                carregarPacientes();
            }
        });
    } else {
        alert('⚠️ Módulo de cadastro de paciente não carregado. Recarregue a página.');
        console.error('ModalPaciente não encontrado:', typeof ModalPaciente);
    }
}

// ==================== ENCONTRAR HORÁRIO ====================
function abrirEncontrarHorario() {
    document.getElementById('resultadoBusca').style.display = 'none';
    document.getElementById('modalEncontrarHorario').classList.add('open');
}

function fecharEncontrarHorario() {
    document.getElementById('modalEncontrarHorario').classList.remove('open');
}

function selecionarDuracao(btn) {
    document.querySelectorAll('.duracao-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    duracaoBuscaSelecionada = parseInt(btn.dataset.dur);
}

function selecionarPeriodo(btn) {
    document.querySelectorAll('.periodo-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    periodoSelecionado = btn.dataset.periodo;
    
    const customDiv = document.getElementById('periodoCustom');
    if (periodoSelecionado === 'custom') {
        customDiv.classList.add('show');
    } else {
        customDiv.classList.remove('show');
    }
}

function obterFiltroHorario() {
    switch (periodoSelecionado) {
        case 'manha':
            return { inicio: 7, fim: 12 };
        case 'tarde':
            return { inicio: 12, fim: 18 };
        case 'noite':
            return { inicio: 18, fim: 21 };
        case 'custom':
            const inicioStr = document.getElementById('periodoInicio').value || '07:00';
            const fimStr = document.getElementById('periodoFim').value || '19:00';
            return { 
                inicio: parseInt(inicioStr.split(':')[0]), 
                fim: parseInt(fimStr.split(':')[0]) 
            };
        default:
            return { inicio: 7, fim: 19 };
    }
}

function atualizarSelectDentistas() {
    const select = document.getElementById('buscaDentista');
    select.innerHTML = '<option value="">Qualquer um</option>';
    
    dentistasCadastrados.forEach(d => {
        select.innerHTML += `<option value="${d.id}">${d.nome}</option>`;
    });
}

async function buscarHorarioLivre() {
    const dataInicio = document.getElementById('buscaDataInicio').value;
    const dentistaFiltro = document.getElementById('buscaDentista').value;
    const duracao = duracaoBuscaSelecionada;
    
    if (!dataInicio) {
        alert('⚠️ Selecione a data de início!');
        return;
    }
    
    // Buscar agendamentos do backend para os dentistas
    const dentistasParaBuscar = dentistaFiltro 
        ? dentistasCadastrados.filter(d => d.id === parseInt(dentistaFiltro))
        : dentistasCadastrados;
    
    if (dentistasParaBuscar.length === 0) {
        alert('⚠️ Nenhum dentista cadastrado!');
        return;
    }
    
    const resultados = [];
    const dataAtual = new Date(dataInicio + 'T00:00:00');
    const maxDias = 30;
    
    for (let dia = 0; dia < maxDias && resultados.length < 5; dia++) {
        const data = new Date(dataAtual);
        data.setDate(data.getDate() + dia);
        
        // Pular domingos
        if (data.getDay() === 0) continue;
        
        const dataStr = formatarDataKey(data);
        
        for (const dentista of dentistasParaBuscar) {
            if (resultados.length >= 5) break;
            
            const agendamentos = await carregarAgendamentosDia(dentista.id, dataStr);
            const horarioLivre = encontrarHorarioLivreNoDia(agendamentos, duracao);
            
            if (horarioLivre) {
                resultados.push({
                    data: data,
                    dataStr: dataStr,
                    hora: horarioLivre,
                    dentista: dentista
                });
            }
        }
    }
    
    exibirResultadosBusca(resultados);
}

function encontrarHorarioLivreNoDia(agendamentos, duracaoNecessaria) {
    const filtro = obterFiltroHorario();
    
    // Criar mapa de horários ocupados
    const ocupados = new Set();
    agendamentos.forEach(ag => {
        const dur = ag.duracao || 30;
        const horaStr = ag.hora.substring(0, 5);
        const [h, m] = horaStr.split(':').map(Number);
        let minutos = h * 60 + m;
        
        for (let i = 0; i < dur; i += 15) {
            ocupados.add(minutos);
            minutos += 15;
        }
    });
    
    // Procurar sequência de horários livres dentro do filtro
    for (let h = filtro.inicio; h < filtro.fim; h++) {
        for (let m = 0; m < 60; m += 15) {
            let minutosInicio = h * 60 + m;
            let livre = true;
            
            for (let i = 0; i < duracaoNecessaria; i += 15) {
                const minutosSlot = minutosInicio + i;
                const horaSlot = Math.floor(minutosSlot / 60);
                
                if (ocupados.has(minutosSlot) || horaSlot >= filtro.fim || horaSlot < filtro.inicio) {
                    livre = false;
                    break;
                }
            }
            
            if (livre) {
                return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
            }
        }
    }
    
    return null;
}

function exibirResultadosBusca(resultados) {
    const container = document.getElementById('resultadoBusca');
    
    if (resultados.length === 0) {
        container.innerHTML = '<div class="resultado-busca" style="background: #ffebee; border-color: #f44336;"><h4 style="color: #c62828;">😕 Nenhum horário encontrado</h4><p>Não há horários livres com a duração solicitada nos próximos 30 dias.</p></div>';
        container.style.display = 'block';
        return;
    }
    
    let html = '<div class="resultado-busca"><h4>✅ Horários Encontrados</h4>';
    
    resultados.forEach(r => {
        html += `<div class="resultado-item" onclick="agendarResultado(${r.dentista.id}, '${r.dataStr}', '${r.hora}')">
            <div>
                <div class="resultado-data">${formatarDataExibicao(r.data)}</div>
                <div class="resultado-dentista">${r.dentista.icone || '🦷'} ${r.dentista.nome}</div>
            </div>
            <div class="resultado-hora">${r.hora}</div>
        </div>`;
    });
    
    html += '</div>';
    container.innerHTML = html;
    container.style.display = 'block';
}

async function agendarResultado(dentistaId, dataStr, hora) {
    fecharEncontrarHorario();
    
    // Encontrar dentista e atribuir a uma coluna
    const dentista = dentistasCadastrados.find(d => d.id === dentistaId);
    if (!dentista) return;
    
    // Verificar se já está em alguma coluna, senão colocar na coluna 1
    let coluna = 1;
    if (colunaDentistas[1] && colunaDentistas[1].id === dentistaId) {
        coluna = 1;
    } else if (colunaDentistas[2] && colunaDentistas[2].id === dentistaId) {
        coluna = 2;
    } else {
        colunaDentistas[1] = dentista;
        salvarSelecaoColunas();
        atualizarDentistaUI(1);
    }
    
    // Selecionar a data
    const [ano, mes, dia] = dataStr.split('-').map(Number);
    dataSelecionada = new Date(ano, mes - 1, dia);
    mesAtual = new Date(ano, mes - 1, 1);
    
    renderizarCalendario();
    await renderizarHorarios(1);
    await renderizarHorarios(2);
    
    // Abrir modal de agendamento
    setTimeout(() => {
        novoAgendamento(coluna, hora);
    }, 200);
}

// ==================== FILA DE ENCAIXE - BACKEND ====================
async function carregarFilaEncaixeBackend() {
    try {
        const data = await apiGet('/api/fila-encaixe');
        filaEncaixe = Array.isArray(data) ? data : [];
    } catch (e) {
        console.error('Erro ao carregar fila:', e);
        filaEncaixe = [];
    }
}

function atualizarBadgeFila() {
    document.getElementById('badgeFilaCount').textContent = filaEncaixe.length;
}

function abrirFilaEncaixe() {
    renderizarFilaEncaixe();
    document.getElementById('modalFilaEncaixe').classList.add('open');
}

function fecharFilaEncaixe() {
    document.getElementById('modalFilaEncaixe').classList.remove('open');
}

function renderizarFilaEncaixe() {
    const container = document.getElementById('filaEncaixeLista');
    
    if (filaEncaixe.length === 0) {
        container.innerHTML = '<div class="fila-vazia"><div class="fila-vazia-icon">✅</div><p>Nenhum paciente na fila de encaixe</p></div>';
        return;
    }
    
    let html = '';
    filaEncaixe.forEach((item) => {
        const tempo = calcularTempoFila(item.created_at);
        
        html += `<div class="fila-item ${item.urgente ? 'urgente' : ''}">
            <div class="fila-item-info">
                <div class="fila-item-nome">
                    ${item.nome}
                    ${item.urgente ? '<span class="badge-urgente">URGENTE</span>' : ''}
                </div>
                <div class="fila-item-tel">📞 ${item.telefone}</div>
                <div class="fila-item-motivo">"${item.motivo || 'Sem motivo informado'}"</div>
                <div class="fila-item-tempo">⏱️ Há ${tempo}</div>
            </div>
            <div class="fila-item-acoes">
                <button class="btn-fila-agendar" onclick="agendarDaFila(${item.id})">📅 Agendar</button>
                <button class="btn-fila-ligar" onclick="ligarParaFila('${item.telefone}')">📞 Ligar</button>
                <button class="btn-fila-remover" onclick="removerDaFila(${item.id})">🗑️</button>
            </div>
        </div>`;
    });
    
    container.innerHTML = html;
}

function calcularTempoFila(timestamp) {
    const agora = Date.now();
    const criado = new Date(timestamp).getTime();
    const diff = agora - criado;
    
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(minutos / 60);
    
    if (horas > 0) {
        return horas + ' hora' + (horas > 1 ? 's' : '');
    } else if (minutos > 0) {
        return minutos + ' minuto' + (minutos > 1 ? 's' : '');
    } else {
        return 'agora';
    }
}

function abrirAdicionarEncaixe() {
    document.getElementById('encaixeNome').value = '';
    document.getElementById('encaixeTelefone').value = '';
    document.getElementById('encaixeMotivo').value = '';
    document.getElementById('encaixeUrgente').checked = false;
    document.getElementById('modalAdicionarEncaixe').classList.add('open');
}

function fecharAdicionarEncaixe() {
    document.getElementById('modalAdicionarEncaixe').classList.remove('open');
}

async function salvarEncaixe() {
    const nome = document.getElementById('encaixeNome').value.trim();
    const telefone = document.getElementById('encaixeTelefone').value.trim();
    const motivo = document.getElementById('encaixeMotivo').value.trim();
    const urgente = document.getElementById('encaixeUrgente').checked;
    
    if (!nome || !telefone || !motivo) {
        alert('⚠️ Preencha todos os campos!');
        return;
    }
    
    try {
        const novoItem = await apiPost('/api/fila-encaixe', {
            nome: nome,
            telefone: telefone,
            motivo: motivo,
            urgente: urgente
        });
        
        filaEncaixe.push(novoItem);
        
        // Reordenar: urgentes primeiro
        filaEncaixe.sort((a, b) => {
            if (a.urgente && !b.urgente) return -1;
            if (!a.urgente && b.urgente) return 1;
            return new Date(a.created_at) - new Date(b.created_at);
        });
        
        atualizarBadgeFila();
        renderizarFilaEncaixe();
        fecharAdicionarEncaixe();
        
        alert('✅ Paciente adicionado à fila de encaixe!');
        
    } catch (error) {
        alert('❌ Erro ao adicionar: ' + error.message);
    }
}

async function removerDaFila(itemId) {
    if (!confirm('Remover este paciente da fila?')) return;
    
    try {
        await apiDelete(`/api/fila-encaixe/${itemId}`);
        
        filaEncaixe = filaEncaixe.filter(x => x.id !== itemId);
        atualizarBadgeFila();
        renderizarFilaEncaixe();
        
    } catch (error) {
        alert('❌ Erro ao remover: ' + error.message);
    }
}

function ligarParaFila(telefone) {
    const tel = telefone.replace(/\D/g, '');
    window.open('tel:' + tel);
}

function agendarDaFila(itemId) {
    const item = filaEncaixe.find(x => x.id === itemId);
    if (!item) return;
    
    fecharFilaEncaixe();
    
    alert('ℹ️ Para agendar "' + item.nome + '", selecione um horário disponível na agenda e preencha os dados.');
}

// ==================== ALERTAS BONITOS ====================
function mostrarAlerta(tipo, titulo, mensagem) {
    const icons = {
        'sucesso': '✅', 'success': '✅',
        'erro': '❌', 'error': '❌',
        'aviso': '⚠️', 'warning': '⚠️',
        'info': 'ℹ️'
    };
    
    document.getElementById('alertaIcon').textContent = icons[tipo] || '✅';
    document.getElementById('alertaTitulo').textContent = titulo || 'Aviso';
    document.getElementById('alertaMensagem').textContent = mensagem || '';
    document.getElementById('alertaOverlay').classList.add('show');
}

function fecharAlerta() {
    document.getElementById('alertaOverlay').classList.remove('show');
}

// Substituir alert nativo
const alertaOriginal = window.alert;
window.alert = function(msg) {
    if (msg.includes('✅') || msg.toLowerCase().includes('sucesso')) {
        mostrarAlerta('sucesso', 'Sucesso!', msg.replace('✅', '').trim());
    } else if (msg.includes('❌') || msg.toLowerCase().includes('erro')) {
        mostrarAlerta('erro', 'Erro', msg.replace('❌', '').trim());
    } else if (msg.includes('⚠️') || msg.toLowerCase().includes('preencha') || msg.toLowerCase().includes('selecione')) {
        mostrarAlerta('aviso', 'Atenção', msg.replace('⚠️', '').trim());
    } else {
        mostrarAlerta('info', 'Aviso', msg.replace('ℹ️', '').trim());
    }
}

// ==================== UTILITÁRIOS ====================
function formatarDataKey(data) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return ano + '-' + mes + '-' + dia;
}

function formatarDataInput(data) {
    return formatarDataKey(data);
}

function formatarDataExibicao(data) {
    return String(data.getDate()).padStart(2, '0') + '/' + 
           String(data.getMonth() + 1).padStart(2, '0') + '/' + 
           data.getFullYear();
}

function formatarDataExibicaoLonga(data) {
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                   'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return data.getDate() + ' de ' + meses[data.getMonth()] + ' de ' + data.getFullYear();
}

// Fechar modais ao clicar fora
document.addEventListener('click', function(e) {
    var dropdown = document.getElementById('dropdownPacientesGlobal');
    var buscaInput = document.getElementById('agendamentoPacienteBusca');
    if (dropdown && buscaInput && !dropdown.contains(e.target) && e.target !== buscaInput) {
        dropdown.style.display = 'none';
    }
});


// ==================== CENTRAL DE NOTIFICAÇÕES ====================
let notifConfirmacoes = [];
let notifAniversarios = [];
let notifRecados = [];
let configClinicaGlobal = null;

// Buscar config da clínica da API (igual ao confirmar.html)
async function buscarConfigClinica() {
    try {
        const response = await apiGet('/api/config-clinica');
        if (response && response.config) {
            configClinicaGlobal = response.config;
            // Salvar no localStorage também
            localStorage.setItem('configClinica', JSON.stringify({
                nome: response.config.nome_clinica,
                dentista: response.config.nome_dentista,
                telefone: response.config.telefone,
                whatsapp: response.config.whatsapp,
                endereco: response.config.endereco,
                assinatura: response.config.assinatura
            }));
        }
    } catch (e) {
        console.log('Erro ao buscar config clínica:', e);
    }
}

// Pegar nome da clínica (da API ou localStorage)
function getNomeClinica() {
    if (configClinicaGlobal && configClinicaGlobal.nome_clinica) {
        return configClinicaGlobal.nome_clinica;
    }
    const config = JSON.parse(localStorage.getItem('configClinica') || '{}');
    return config.nome || config.nome_clinica || 'nossa clínica';
}
let notifAbaAtiva = 'confirmacoes';
let notifPeriodo = parseInt(localStorage.getItem('notif_periodo') || '48');

// Configuração do período
function abrirConfigNotificacoes() {
    document.querySelectorAll('#configPeriodoNotif .config-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.valor) === notifPeriodo);
    });
    document.getElementById('modalConfigNotificacoes').classList.add('open');
}

function fecharConfigNotificacoes() {
    document.getElementById('modalConfigNotificacoes').classList.remove('open');
}

function selecionarPeriodoNotif(horas) {
    document.querySelectorAll('#configPeriodoNotif .config-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.valor) === horas);
    });
}

// Função auxiliar para formatar data de agendamento de forma robusta
function formatarDataAgendamento(dataInput) {
    if (!dataInput) return { dataFmt: '--/--/----', dia: '--' };
    
    try {
        let dataStr = typeof dataInput === 'string' ? dataInput.split('T')[0] : String(dataInput);
        const partes = dataStr.split('-');
        if (partes.length === 3) {
            const diaNum = partes[2].padStart(2, '0');
            const mesNum = partes[1].padStart(2, '0');
            const ano = partes[0];
            const dataObj = new Date(parseInt(ano), parseInt(mesNum) - 1, parseInt(diaNum));
            const diasCurto = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
            return {
                dataFmt: diaNum + '/' + mesNum + '/' + ano,
                dia: diasCurto[dataObj.getDay()] || '--'
            };
        }
    } catch (e) {
        console.error('Erro formatarDataAgendamento:', e);
    }
    return { dataFmt: '--/--/----', dia: '--' };
}

function salvarConfigNotificacoes() {
    const btn = document.querySelector('#configPeriodoNotif .config-btn.active');
    if (btn) {
        notifPeriodo = parseInt(btn.dataset.valor);
        localStorage.setItem('notif_periodo', notifPeriodo);
    }
    fecharConfigNotificacoes();
    carregarTodasNotificacoes();
    alert('✅ Período salvo: ' + notifPeriodo + ' horas');
}

// Abrir/Fechar modal principal
function abrirNotificacoes() {
    document.getElementById('modalNotificacoes').classList.add('open');
    carregarTodasNotificacoes();
}

function fecharNotificacoes() {
    document.getElementById('modalNotificacoes').classList.remove('open');
}

// Trocar abas
function trocarAbaNotif(aba) {
    notifAbaAtiva = aba;
    
    document.querySelectorAll('.notif-tab').forEach(tab => tab.classList.remove('active'));
    document.getElementById('tab' + aba.charAt(0).toUpperCase() + aba.slice(1)).classList.add('active');
    
    document.querySelectorAll('.notif-content').forEach(c => c.classList.remove('active'));
    document.getElementById('content' + aba.charAt(0).toUpperCase() + aba.slice(1)).classList.add('active');
    
    atualizarContadoresNotif();
}

// Carregar todas as notificações
async function carregarTodasNotificacoes() {
    // Primeiro buscar config da clínica
    await buscarConfigClinica();
    
    await Promise.all([
        carregarConfirmacoes(),
        carregarAniversarios(),
        carregarRecados()
    ]);
    atualizarBadgeNotificacoes();
}

// ========== CONFIRMAÇÕES ==========
async function carregarConfirmacoes() {
    try {
        const hoje = new Date();
        const inicio = formatarDataKey(hoje);
        const fim = new Date(hoje);
        fim.setHours(fim.getHours() + notifPeriodo);
        const fimStr = formatarDataKey(fim);
        
        const response = await apiGet(`/api/agendamentos/pendentes?inicio=${inicio}&fim=${fimStr}`);
        notifConfirmacoes = (response && response.agendamentos) ? response.agendamentos : [];
        
        renderizarConfirmacoes();
        document.getElementById('countConfirmacoes').textContent = notifConfirmacoes.length;
        document.getElementById('periodoTexto').textContent = notifPeriodo + ' horas';
        
    } catch (error) {
        console.error('Erro carregar confirmações:', error);
        notifConfirmacoes = [];
        renderizarConfirmacoes();
    }
}

function renderizarConfirmacoes() {
    const container = document.getElementById('listaConfirmacoes');
    const aviso = document.getElementById('avisoSemTelConf');
    
    if (notifConfirmacoes.length === 0) {
        container.innerHTML = '<div class="notif-vazio"><div class="notif-vazio-icon">OK</div><div>Nenhuma confirmacao pendente!</div></div>';
        aviso.style.display = 'none';
        document.getElementById('totalConfirmacoes').textContent = '0';
        return;
    }
    
    let semTel = 0;
    let html = '';
    
    notifConfirmacoes.forEach((ag, i) => {
        const temTel = ag.paciente_telefone && ag.paciente_telefone !== '-';
        if (!temTel) semTel++;
        
        const { dataFmt, dia } = formatarDataAgendamento(ag.data);
        let horaFmt = ag.hora || ag.horario || '--:--';
        if (horaFmt.length > 5) horaFmt = horaFmt.substring(0, 5);
        
        html += `
            <div class="notif-item ${temTel ? '' : 'sem-telefone'}">
                <input type="checkbox" class="notif-check" data-tipo="conf" data-idx="${i}" ${temTel ? 'checked' : 'disabled'} onchange="atualizarContadoresNotif()">
                <div class="notif-info">
                    <div class="notif-nome">${ag.paciente_nome || 'Paciente'}</div>
                    <div class="notif-detalhes">
                        <span>${dataFmt} (${dia})</span>
                        <span>${horaFmt}</span>
                        <span>${ag.procedimento || '-'}</span>
                    </div>
                    <div class="notif-profissional">${ag.profissional_nome || 'Profissional'}</div>
                </div>
                <button class="notif-btn" onclick="enviarNotifIndividual('conf', ${i})" ${temTel ? '' : 'disabled'}><svg viewBox="0 0 24 24" width="22" height="22" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></button>
            </div>`;
    });
    
    container.innerHTML = html;
    document.getElementById('totalConfirmacoes').textContent = notifConfirmacoes.length;
    
    if (semTel > 0) {
        document.getElementById('countSemTelConf').textContent = semTel;
        aviso.style.display = 'block';
    } else {
        aviso.style.display = 'none';
    }
    
    atualizarContadoresNotif();
}

// ========== ANIVERSARIANTES ==========
async function carregarAniversarios() {
    try {
        const response = await apiGet('/api/pacientes/aniversariantes');
        notifAniversarios = (response && response.pacientes) ? response.pacientes : [];
        
        renderizarAniversarios();
        document.getElementById('countAniversarios').textContent = notifAniversarios.length;
        
    } catch (error) {
        console.error('Erro carregar aniversários:', error);
        notifAniversarios = [];
        renderizarAniversarios();
    }
}

function renderizarAniversarios() {
    const container = document.getElementById('listaAniversarios');
    const aviso = document.getElementById('avisoSemTelAniv');
    
    if (notifAniversarios.length === 0) {
        container.innerHTML = '<div class="notif-vazio"><div class="notif-vazio-icon">-</div><div>Nenhum aniversariante hoje!</div></div>';
        aviso.style.display = 'none';
        document.getElementById('totalAniversarios').textContent = '0';
        return;
    }
    
    let semTel = 0;
    let html = '';
    
    notifAniversarios.forEach((p, i) => {
        const temTel = p.celular && p.celular !== '-';
        if (!temTel) semTel++;
        
        const nascimento = new Date(p.data_nascimento + 'T00:00:00');
        const hoje = new Date();
        let idade = hoje.getFullYear() - nascimento.getFullYear();
        
        html += `
            <div class="notif-item aniversario ${temTel ? '' : 'sem-telefone'}">
                <input type="checkbox" class="notif-check" data-tipo="aniv" data-idx="${i}" ${temTel ? 'checked' : 'disabled'} onchange="atualizarContadoresNotif()">
                <div class="notif-info">
                    <div class="notif-nome">${p.nome}</div>
                    <div class="notif-detalhes">
                        <span class="notif-idade">${idade} anos</span>
                        <span>${p.celular || 'Sem telefone'}</span>
                    </div>
                </div>
                <button class="notif-btn" onclick="enviarNotifIndividual('aniv', ${i})" ${temTel ? '' : 'disabled'}><svg viewBox="0 0 24 24" width="22" height="22" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></button>
            </div>`;
    });
    
    container.innerHTML = html;
    document.getElementById('totalAniversarios').textContent = notifAniversarios.length;
    
    if (semTel > 0) {
        document.getElementById('countSemTelAniv').textContent = semTel;
        aviso.style.display = 'block';
    } else {
        aviso.style.display = 'none';
    }
    
    atualizarContadoresNotif();
}

// ========== TEL. RECADOS ==========
async function carregarRecados() {
    try {
        const hoje = new Date();
        const inicio = formatarDataKey(hoje);
        const fim = new Date(hoje);
        fim.setHours(fim.getHours() + notifPeriodo);
        const fimStr = formatarDataKey(fim);
        
        const response = await apiGet(`/api/agendamentos/recados?inicio=${inicio}&fim=${fimStr}`);
        notifRecados = (response && response.agendamentos) ? response.agendamentos : [];
        
        renderizarRecados();
        document.getElementById('countRecados').textContent = notifRecados.length;
        document.getElementById('periodoTextoRecados').textContent = notifPeriodo + 'h';
        
    } catch (error) {
        console.error('Erro carregar recados:', error);
        notifRecados = [];
        renderizarRecados();
    }
}

function renderizarRecados() {
    const container = document.getElementById('listaRecados');
    
    if (notifRecados.length === 0) {
        container.innerHTML = '<div class="notif-vazio"><div class="notif-vazio-icon">-</div><div>Nenhum paciente com tel. de recados!</div></div>';
        document.getElementById('totalRecados').textContent = '0';
        return;
    }
    
    let html = '';
    
    notifRecados.forEach((ag, i) => {
        const { dataFmt, dia } = formatarDataAgendamento(ag.data);
        let horaFmt = ag.hora || ag.horario || '--:--';
        if (horaFmt.length > 5) horaFmt = horaFmt.substring(0, 5);
        
        html += `
            <div class="notif-item">
                <input type="checkbox" class="notif-check" data-tipo="recado" data-idx="${i}" checked onchange="atualizarContadoresNotif()">
                <div class="notif-info">
                    <div class="notif-nome">Aviso para: ${ag.nome_recado || 'Contato'}</div>
                    <div class="notif-detalhes">
                        <span>Paciente: ${ag.paciente_nome}</span>
                        <span>${ag.tel_recados}</span>
                    </div>
                    <div class="notif-detalhes">
                        <span>${dataFmt} (${dia})</span>
                        <span>${horaFmt}</span>
                    </div>
                </div>
                <button class="notif-btn" onclick="enviarNotifIndividual('recado', ${i})"><svg viewBox="0 0 24 24" width="22" height="22" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></button>
            </div>`;
    });
    
    container.innerHTML = html;
    document.getElementById('totalRecados').textContent = notifRecados.length;
    atualizarContadoresNotif();
}

// ========== CONTADORES E SELEÇÃO ==========
function atualizarContadoresNotif() {
    const selConf = document.querySelectorAll('.notif-check[data-tipo="conf"]:checked').length;
    document.getElementById('selConfirmacoes').textContent = selConf;
    
    const selAniv = document.querySelectorAll('.notif-check[data-tipo="aniv"]:checked').length;
    document.getElementById('selAniversarios').textContent = selAniv;
    
    const selRec = document.querySelectorAll('.notif-check[data-tipo="recado"]:checked').length;
    document.getElementById('selRecados').textContent = selRec;
}

function atualizarBadgeNotificacoes() {
    const total = notifConfirmacoes.length + notifAniversarios.length + notifRecados.length;
    const badge = document.getElementById('badgeNotificacoesCount');
    if (badge) badge.textContent = total;
}

function selecionarTodosNotif() {
    const tipo = notifAbaAtiva === 'confirmacoes' ? 'conf' : (notifAbaAtiva === 'aniversarios' ? 'aniv' : 'recado');
    document.querySelectorAll(`.notif-check[data-tipo="${tipo}"]`).forEach(cb => { if (!cb.disabled) cb.checked = true; });
    atualizarContadoresNotif();
}

function limparSelecaoNotif() {
    const tipo = notifAbaAtiva === 'confirmacoes' ? 'conf' : (notifAbaAtiva === 'aniversarios' ? 'aniv' : 'recado');
    document.querySelectorAll(`.notif-check[data-tipo="${tipo}"]`).forEach(cb => cb.checked = false);
    atualizarContadoresNotif();
}

// ========== ENVIO DE MENSAGENS ==========
function enviarNotifIndividual(tipo, idx) {
    if (tipo === 'conf') enviarWhatsAppConfirmacao(notifConfirmacoes[idx]);
    else if (tipo === 'aniv') enviarWhatsAppAniversario(notifAniversarios[idx]);
    else if (tipo === 'recado') enviarWhatsAppRecado(notifRecados[idx]);
}

function enviarNotifSelecionadas() {
    let tipo, lista;
    if (notifAbaAtiva === 'confirmacoes') { tipo = 'conf'; lista = notifConfirmacoes; }
    else if (notifAbaAtiva === 'aniversarios') { tipo = 'aniv'; lista = notifAniversarios; }
    else { tipo = 'recado'; lista = notifRecados; }
    
    const checks = document.querySelectorAll(`.notif-check[data-tipo="${tipo}"]:checked`);
    
    if (checks.length === 0) { alert('⚠️ Selecione pelo menos um item'); return; }
    if (!confirm(`Enviar ${checks.length} mensagem(ns)?\n\nSerão abertas ${checks.length} abas do WhatsApp.`)) return;
    
    let delay = 0;
    checks.forEach(cb => {
        const idx = parseInt(cb.dataset.idx);
        setTimeout(() => {
            if (tipo === 'conf') enviarWhatsAppConfirmacao(lista[idx]);
            else if (tipo === 'aniv') enviarWhatsAppAniversario(lista[idx]);
            else enviarWhatsAppRecado(lista[idx]);
        }, delay);
        delay += 500;
    });
    
    setTimeout(() => alert(`✅ ${checks.length} janela(s) do WhatsApp aberta(s)!`), delay + 500);
}

// WhatsApp - Confirmação
function enviarWhatsAppConfirmacao(ag) {
    let tel = (ag.paciente_telefone || '').replace(/\D/g, '');
    if (tel.length === 10 || tel.length === 11) tel = '55' + tel;
    
    // Pegar nome da clínica da API (igual ao confirmar.html)
    const clinica = getNomeClinica();
    const config = JSON.parse(localStorage.getItem('configClinica') || '{}');
    const assinatura = config.assinatura || 'Atenciosamente,\nEquipe ' + clinica;
    
    const codigo = ag.codigo_confirmacao || 'N/A';
    const baseUrl = window.location.origin + '/area-dentistas/confirmar.html';
    
    // Formatar data de forma robusta
    let dataFmt = 'a confirmar';
    if (ag.data) {
        try {
            let dataStr = typeof ag.data === 'string' ? ag.data.split('T')[0] : ag.data;
            const partes = dataStr.split('-');
            if (partes.length === 3) {
                const dia = partes[2].padStart(2, '0');
                const mes = partes[1].padStart(2, '0');
                const ano = partes[0];
                const dataObj = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
                const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
                dataFmt = dia + '/' + mes + '/' + ano + ' (' + dias[dataObj.getDay()] + ')';
            }
        } catch (e) {
            console.error('Erro ao formatar data:', e);
        }
    }
    
    // Formatar horário (pode vir como "10:00:00" ou "10:00")
    let horaFmt = ag.hora || ag.horario || '--:--';
    if (horaFmt.length > 5) horaFmt = horaFmt.substring(0, 5);
    
    const msg = 'Olá ' + (ag.paciente_nome || 'Paciente') + '!\n\n' +
        'Você tem uma consulta agendada na *' + clinica + '*:\n\n' +
        '*Data:* ' + dataFmt + '\n' +
        '*Horário:* ' + horaFmt + '\n' +
        '*Profissional:* ' + (ag.profissional_nome || 'Profissional') + '\n\n' +
        'Por favor, confirme sua presença:\n\n' +
        '*Confirmar:* ' + baseUrl + '?c=' + codigo + '\n\n' +
        '*Cancelar:* ' + baseUrl + '?x=' + codigo + '\n\n' +
        assinatura;

    window.open('https://wa.me/' + tel + '?text=' + encodeURIComponent(msg), '_blank');
}

// WhatsApp - Aniversário
function enviarWhatsAppAniversario(p) {
    let tel = (p.celular || '').replace(/\D/g, '');
    if (tel.length === 10 || tel.length === 11) tel = '55' + tel;
    
    // Pegar nome da clínica da API (igual ao confirmar.html)
    const clinica = getNomeClinica();
    const config = JSON.parse(localStorage.getItem('configClinica') || '{}');
    const assinatura = config.assinatura || 'Um grande abraço,\nEquipe ' + clinica;
    
    const msg = 'Olá ' + p.nome + '!\n\n' +
        'Hoje é um dia muito especial!\n\n' +
        'A equipe da *' + clinica + '* deseja a você um *Feliz Aniversário!*\n\n' +
        'Que este novo ciclo seja repleto de saúde, sorrisos e muitas realizações!\n\n' +
        assinatura;

    window.open('https://wa.me/' + tel + '?text=' + encodeURIComponent(msg), '_blank');
}

// WhatsApp - Recado
function enviarWhatsAppRecado(ag) {
    let tel = (ag.tel_recados || '').replace(/\D/g, '');
    if (tel.length === 10 || tel.length === 11) tel = '55' + tel;
    
    // Pegar nome da clínica da API (igual ao confirmar.html)
    const clinica = getNomeClinica();
    const config = JSON.parse(localStorage.getItem('configClinica') || '{}');
    const dentista = config.dentista || config.nome_dentista || 'Dentista';
    const assinatura = config.assinatura || 'Atenciosamente,\nEquipe ' + clinica;
    
    // Formatar data de forma robusta
    let dataFmt = 'a confirmar';
    if (ag.data) {
        try {
            let dataStr = typeof ag.data === 'string' ? ag.data.split('T')[0] : ag.data;
            const partes = dataStr.split('-');
            if (partes.length === 3) {
                const dia = partes[2].padStart(2, '0');
                const mes = partes[1].padStart(2, '0');
                const ano = partes[0];
                const dataObj = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
                const dias = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
                dataFmt = dia + '/' + mes + '/' + ano + ' (' + dias[dataObj.getDay()] + ')';
            }
        } catch (e) {
            console.error('Erro ao formatar data:', e);
        }
    }
    
    // Formatar horário
    let horaFmt = ag.hora || ag.horario || '--:--';
    if (horaFmt.length > 5) horaFmt = horaFmt.substring(0, 5);
    
    const msg = 'Olá!\n\n' +
        '*' + ag.paciente_nome + '* tem uma consulta agendada na *' + clinica + '* para:\n\n' +
        '*' + dataFmt + '* às *' + horaFmt + '*\n' +
        'Dr(a). ' + (ag.profissional_nome || dentista) + '\n\n' +
        'Você está cadastrado(a) como contato para recados. Por favor, lembre-o(a) de confirmar a presença!\n\n' +
        assinatura;

    window.open('https://wa.me/' + tel + '?text=' + encodeURIComponent(msg), '_blank');
}

// Carregar ao iniciar
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        carregarTodasNotificacoes();
    }, 2000);
});
