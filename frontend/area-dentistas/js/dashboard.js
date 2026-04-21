// ===== DASHBOARD LOGIC =====

// Cache de dados
var agendamentosCache = [];
var pacientesCache = [];
var confirmacoesPendentes = [];
var confirmacoesEnviadas = JSON.parse(localStorage.getItem('confirmacoesEnviadas') || '{}');

// ===== STORAGE HELPERS =====
function getPacientes() {
    const user = getCurrentUser();
    if (!user) return [];
    
    const key = `pacientes_${user.id}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

function getTratamentos() {
    const user = getCurrentUser();
    if (!user) return [];
    
    const key = `tratamentos_${user.id}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

function getNotasFiscais() {
    const user = getCurrentUser();
    if (!user) return [];
    
    const key = `notas_${user.id}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

// ===== CALCULATE STATS =====
function calculateStats() {
    const pacientes = getPacientes();
    const tratamentos = getTratamentos();
    const notas = getNotasFiscais();
    
    // Total pacientes
    document.getElementById('totalPacientes').textContent = pacientes.length;
    
    // Tratamentos em andamento
    const tratamentosAtivos = tratamentos.filter(t => t.status === 'em_andamento');
    document.getElementById('totalTratamentos').textContent = tratamentosAtivos.length;
    
    // Faturamento do mês atual
    const mesAtual = new Date().getMonth();
    const anoAtual = new Date().getFullYear();
    
    const notasMes = notas.filter(n => {
        const notaDate = new Date(n.data);
        return notaDate.getMonth() === mesAtual && notaDate.getFullYear() === anoAtual;
    });
    
    const faturamentoMes = notasMes.reduce((total, nota) => total + nota.valor, 0);
    document.getElementById('faturamentoMes').textContent = formatCurrency(faturamentoMes);
    
    // Notas emitidas no mês
    document.getElementById('notasMes').textContent = notasMes.length;
}

// ===== CONFIRMAÇÕES PENDENTES =====

// Carregar dados do servidor
async function carregarDadosConfirmacoes() {
    try {
        // Carregar agendamentos
        var resAg = await apiCall('/api/agendamentos');
        if (resAg && resAg.success) {
            agendamentosCache = resAg.agendamentos || [];
        }
        
        // Carregar pacientes
        var resPac = await apiCall('/api/pacientes');
        if (resPac && resPac.success) {
            pacientesCache = resPac.pacientes || [];
        }
        
        // Filtrar confirmações pendentes
        filtrarConfirmacoes();
    } catch (err) {
        console.error('Erro ao carregar dados:', err);
    }
}

// Filtrar confirmações por antecedência
function filtrarConfirmacoes() {
    var horasAntecedencia = parseInt(document.getElementById('filtroAntecedencia').value) || 48;
    var agora = new Date();
    var limite = new Date(agora.getTime() + (horasAntecedencia * 60 * 60 * 1000));
    
    // Filtrar agendamentos que:
    // 1. Estão dentro do período
    // 2. Status não é 'confirmado' nem 'cancelado' nem 'atendido'
    confirmacoesPendentes = agendamentosCache.filter(function(a) {
        var dataAgendamento = new Date(a.data + 'T' + (a.horario || '00:00'));
        var dentroLimite = dataAgendamento > agora && dataAgendamento <= limite;
        var statusPendente = !['confirmado', 'cancelado', 'atendido', 'faltou'].includes(a.status);
        return dentroLimite && statusPendente;
    });
    
    // Ordenar por data/hora
    confirmacoesPendentes.sort(function(a, b) {
        var dataA = new Date(a.data + 'T' + (a.horario || '00:00'));
        var dataB = new Date(b.data + 'T' + (b.horario || '00:00'));
        return dataA - dataB;
    });
    
    renderizarConfirmacoes();
}

// Renderizar lista de confirmações
function renderizarConfirmacoes() {
    var container = document.getElementById('confirmacoesPendentes');
    var lista = document.getElementById('confirmacoesList');
    var vazio = document.getElementById('confirmacoesEmpty');
    var badge = document.getElementById('confirmacoesBadge');
    
    if (!container) return;
    
    // Atualizar badge
    badge.textContent = confirmacoesPendentes.length;
    
    if (confirmacoesPendentes.length === 0) {
        container.style.display = 'block';
        lista.style.display = 'none';
        vazio.style.display = 'block';
        return;
    }
    
    container.style.display = 'block';
    lista.style.display = 'flex';
    vazio.style.display = 'none';
    
    var html = confirmacoesPendentes.map(function(ag, index) {
        var paciente = pacientesCache.find(function(p) { return p.id === ag.pacienteId; });
        var nome = ag.pacienteNome || (paciente ? paciente.nome : 'Paciente');
        var celular = paciente ? paciente.celular : null;
        var iniciais = nome.split(' ').map(function(n) { return n[0]; }).slice(0, 2).join('').toUpperCase();
        
        // Calcular tempo restante
        var dataAg = new Date(ag.data + 'T' + (ag.horario || '00:00'));
        var agora = new Date();
        var diffHoras = Math.round((dataAg - agora) / (1000 * 60 * 60));
        var tempoTexto = diffHoras <= 24 ? diffHoras + 'h' : Math.round(diffHoras/24) + 'd';
        var urgente = diffHoras <= 24;
        
        // Verificar se já foi enviado
        var chaveEnviado = ag.id + '_' + ag.data;
        var jaEnviado = confirmacoesEnviadas[chaveEnviado];
        
        // Formatar data
        var dataFormatada = formatarDataCurta(ag.data);
        var horario = ag.horario ? ag.horario.substring(0, 5) : '';
        
        return '<div class="confirmacao-item ' + (jaEnviado ? 'enviado' : '') + '" data-index="' + index + '">' +
            '<div class="confirmacao-info">' +
                '<div class="confirmacao-avatar">' + iniciais + '</div>' +
                '<div class="confirmacao-dados">' +
                    '<h4>' + nome + '</h4>' +
                    '<p>' + dataFormatada + ' as ' + horario + ' - ' + (ag.procedimento || 'Consulta') + '</p>' +
                '</div>' +
                '<span class="confirmacao-tempo ' + (urgente ? 'urgente' : '') + '">' + tempoTexto + '</span>' +
            '</div>' +
            '<div class="confirmacao-acoes">' +
                '<button class="btn-enviar-whatsapp ' + (jaEnviado ? 'enviado' : '') + '" onclick="enviarConfirmacaoIndividual(' + index + ')" ' + (!celular ? 'disabled title="Sem celular"' : '') + '>' +
                    (jaEnviado ? '✓ Enviado' : 'Enviar') +
                '</button>' +
                '<button class="btn-marcar-enviado" onclick="marcarComoEnviado(' + index + ')" title="Marcar como enviado">✓</button>' +
            '</div>' +
        '</div>';
    }).join('');
    
    lista.innerHTML = html;
}

// Formatar data curta
function formatarDataCurta(dataStr) {
    var data = new Date(dataStr + 'T00:00:00');
    var hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    var amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);
    
    if (data.getTime() === hoje.getTime()) return 'Hoje';
    if (data.getTime() === amanha.getTime()) return 'Amanha';
    
    var dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
    return dias[data.getDay()] + ', ' + data.getDate() + '/' + (data.getMonth() + 1);
}

// Enviar confirmação individual
function enviarConfirmacaoIndividual(index) {
    var ag = confirmacoesPendentes[index];
    if (!ag) return;
    
    var paciente = pacientesCache.find(function(p) { return p.id === ag.pacienteId; });
    
    if (!paciente || !paciente.celular) {
        if (typeof mostrarAviso === 'function') {
            mostrarAviso('Paciente nao possui celular cadastrado!');
        }
        return;
    }
    
    // Preparar dados para WhatsApp
    var clinica = {};
    if (typeof WhatsAppIntegration !== 'undefined') {
        clinica = WhatsAppIntegration.getClinicaData();
    }
    
    var agendamentoParaEnvio = {
        data: ag.data,
        horario: ag.horario,
        horaInicio: ag.horario,
        procedimento: ag.procedimento,
        codigoConfirmacao: ag.codigoConfirmacao,
        dentista: clinica.dentista
    };
    
    // Enviar
    if (typeof WhatsAppIntegration !== 'undefined') {
        WhatsAppIntegration.enviarConfirmacao(paciente, agendamentoParaEnvio, clinica);
    }
    
    // Marcar como enviado
    marcarComoEnviado(index);
}

// Marcar como enviado
function marcarComoEnviado(index) {
    var ag = confirmacoesPendentes[index];
    if (!ag) return;
    
    var chave = ag.id + '_' + ag.data;
    confirmacoesEnviadas[chave] = new Date().toISOString();
    localStorage.setItem('confirmacoesEnviadas', JSON.stringify(confirmacoesEnviadas));
    
    renderizarConfirmacoes();
}

// Enviar TODAS as confirmações (abre várias abas)
function enviarTodasConfirmacoes() {
    var naoEnviadas = confirmacoesPendentes.filter(function(ag, index) {
        var chave = ag.id + '_' + ag.data;
        if (confirmacoesEnviadas[chave]) return false;
        
        var paciente = pacientesCache.find(function(p) { return p.id === ag.pacienteId; });
        return paciente && paciente.celular;
    });
    
    if (naoEnviadas.length === 0) {
        if (typeof mostrarAviso === 'function') {
            mostrarAviso('Nenhuma confirmacao pendente para enviar!');
        }
        return;
    }
    
    // Aviso sobre múltiplas abas
    var msg = 'Serao abertas ' + naoEnviadas.length + ' abas do WhatsApp.\n\n';
    msg += 'Voce precisara clicar ENVIAR em cada uma.\n\n';
    msg += 'Deseja continuar?';
    
    if (!confirm(msg)) return;
    
    // Abrir cada uma com intervalo de 500ms para não travar
    var clinica = {};
    if (typeof WhatsAppIntegration !== 'undefined') {
        clinica = WhatsAppIntegration.getClinicaData();
    }
    
    naoEnviadas.forEach(function(ag, i) {
        setTimeout(function() {
            var paciente = pacientesCache.find(function(p) { return p.id === ag.pacienteId; });
            if (!paciente || !paciente.celular) return;
            
            var agendamentoParaEnvio = {
                data: ag.data,
                horario: ag.horario,
                horaInicio: ag.horario,
                procedimento: ag.procedimento,
                codigoConfirmacao: ag.codigoConfirmacao,
                dentista: clinica.dentista
            };
            
            if (typeof WhatsAppIntegration !== 'undefined') {
                WhatsAppIntegration.enviarConfirmacao(paciente, agendamentoParaEnvio, clinica);
            }
            
            // Marcar como enviado
            var chave = ag.id + '_' + ag.data;
            confirmacoesEnviadas[chave] = new Date().toISOString();
        }, i * 500); // 500ms entre cada
    });
    
    // Salvar e atualizar após todos
    setTimeout(function() {
        localStorage.setItem('confirmacoesEnviadas', JSON.stringify(confirmacoesEnviadas));
        renderizarConfirmacoes();
        if (typeof mostrarSucesso === 'function') {
            mostrarSucesso('Abas abertas! Clique ENVIAR em cada uma.');
        }
    }, naoEnviadas.length * 500 + 500);
}

// ===== LOAD RECENT ACTIVITY =====
function loadRecentActivity() {
    const tratamentos = getTratamentos();
    const notas = getNotasFiscais();
    
    // Combina atividades
    const activities = [
        ...tratamentos.slice(-5).map(t => ({
            type: 'tratamento',
            title: `Novo tratamento: ${t.procedimento}`,
            time: t.dataInicio,
            icon: '📋'
        })),
        ...notas.slice(-5).map(n => ({
            type: 'nota',
            title: `Nota fiscal emitida - ${n.descricao}`,
            time: n.data,
            icon: '📄'
        }))
    ];
    
    // Ordena por data
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    
    const activityList = document.getElementById('activityList');
    
    if (activities.length === 0) {
        activityList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📭</div>
                <p>Nenhuma atividade recente</p>
                <p class="empty-hint">Comece criando um plano de tratamento ou cadastrando um paciente</p>
            </div>
        `;
        return;
    }
    
    activityList.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon">${activity.icon}</div>
            <div class="activity-details">
                <div class="activity-title">${activity.title}</div>
                <div class="activity-time">${formatDate(activity.time)}</div>
            </div>
        </div>
    `).join('');
}

// ===== UTILS =====
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Hoje';
    if (days === 1) return 'Ontem';
    if (days < 7) return `${days} dias atrás`;
    
    return date.toLocaleDateString('pt-BR');
}

// ===== INIT =====
window.addEventListener('DOMContentLoaded', function() {
    calculateStats();
    loadRecentActivity();
    
    // Carregar confirmações pendentes
    carregarDadosConfirmacoes();
});
