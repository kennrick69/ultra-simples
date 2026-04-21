/* ==========================================
   ADMIN.JS - Painel Administrativo
   Sistema: Equiparação Hospitalar - DENTISTAS
   ========================================== */

// ==================== ESTADO ====================

let adminState = {
    leads: [],
    filteredLeads: [],
    filters: {
        search: '',
        origin: '',
        viability: '',
        startDate: '',
        endDate: ''
    }
};

// ==================== INICIALIZAÇÃO ====================

/**
 * Inicializa admin
 */
function initAdmin() {
    console.log('👨‍💼 Iniciando Painel Admin');
    
    // Verifica autenticação (simplificado)
    if (!isAdminAuthenticated()) {
        const password = prompt('Digite a senha de administrador:');
        if (password !== 'maria2025') { // Senha simples para demo
            alert('Senha incorreta!');
            window.location.href = 'index.html';
            return;
        }
        saveAdminSession(true);
    }
    
    // Carrega leads
    loadLeads();
    
    // Renderiza
    renderStats();
    renderLeadsTable();
    
    // Setup listeners
    setupFilters();
}

/**
 * Carrega todos os leads
 */
function loadLeads() {
    adminState.leads = getAllLeads();
    adminState.filteredLeads = [...adminState.leads];
    console.log('📋 Leads carregados:', adminState.leads.length);
}

// ==================== RENDERIZAÇÃO ====================

/**
 * Renderiza estatísticas
 */
function renderStats() {
    const stats = getLeadsStatistics();
    const container = document.getElementById('stats-container');
    
    if (!container) return;
    
    container.innerHTML = `
        <div class="stat-card-admin">
            <div class="stat-header">
                <div class="stat-icon">📊</div>
            </div>
            <div class="stat-value-admin">${stats.total}</div>
            <div class="stat-label-admin">Total de Leads</div>
        </div>
        
        <div class="stat-card-admin">
            <div class="stat-header">
                <div class="stat-icon">⭐</div>
            </div>
            <div class="stat-value-admin">${stats.scoreMedio.toFixed(0)}</div>
            <div class="stat-label-admin">Score Médio</div>
        </div>
        
        <div class="stat-card-admin">
            <div class="stat-header">
                <div class="stat-icon">✅</div>
            </div>
            <div class="stat-value-admin">${stats.porViabilidade.altissima + stats.porViabilidade.alta}</div>
            <div class="stat-label-admin">Alta Viabilidade</div>
        </div>
        
        <div class="stat-card-admin">
            <div class="stat-header">
                <div class="stat-icon">📅</div>
            </div>
            <div class="stat-value-admin">${stats.ultimaSemana}</div>
            <div class="stat-label-admin">Última Semana</div>
        </div>
    `;
}

/**
 * Renderiza tabela de leads
 */
function renderLeadsTable() {
    const container = document.getElementById('leads-table-body');
    if (!container) return;
    
    const leads = adminState.filteredLeads;
    
    if (leads.length === 0) {
        container.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 3rem;">
                    <div class="empty-state">
                        <div class="empty-icon">📭</div>
                        <div class="empty-title">Nenhum lead encontrado</div>
                        <div class="empty-text">Os leads aparecerão aqui quando alguém preencher o formulário</div>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    
    leads.forEach(lead => {
        const date = new Date(lead.timestamp);
        const dateStr = date.toLocaleDateString('pt-BR');
        const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        
        const viabilityClass = (lead.viability || lead.elegibilidade || 'MÉDIA').toLowerCase().replace('í', 'i').replace('ã', 'a');
        
        html += `
            <tr>
                <td>${dateStr}<br><small style="color: var(--text-tertiary);">${timeStr}</small></td>
                <td>
                    <strong>${sanitizeInput(lead.nome || 'N/A')}</strong><br>
                    <small style="color: var(--text-tertiary);">${sanitizeInput(lead.email || '')}</small>
                </td>
                <td>${sanitizeInput(lead.clinica || 'N/A')}</td>
                <td>
                    <span class="origin-badge">${lead.origin === 'quiz' ? '⚡ Quiz' : '🧮 Calculadora'}</span>
                </td>
                <td>
                    <span class="viability-badge ${viabilityClass}">
                        ${lead.viability || lead.elegibilidade || 'N/A'}
                    </span>
                </td>
                <td><strong>${lead.score || 0}</strong>/100</td>
                <td>
                    <div class="lead-actions">
                        <button class="action-btn" onclick="viewLead('${lead.id}')" title="Ver detalhes">
                            👁️
                        </button>
                        <button class="action-btn delete" onclick="confirmDeleteLead('${lead.id}')" title="Excluir">
                            🗑️
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    container.innerHTML = html;
    
    // Atualiza contador
    const countElement = document.getElementById('leads-count');
    if (countElement) {
        countElement.textContent = leads.length;
    }
}

// ==================== FILTROS ====================

/**
 * Configura filtros
 */
function setupFilters() {
    // Search
    const searchInput = document.getElementById('filter-search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            adminState.filters.search = e.target.value;
            applyFilters();
        }, 300));
    }
    
    // Origin
    const originSelect = document.getElementById('filter-origin');
    if (originSelect) {
        originSelect.addEventListener('change', (e) => {
            adminState.filters.origin = e.target.value;
            applyFilters();
        });
    }
    
    // Viability
    const viabilitySelect = document.getElementById('filter-viability');
    if (viabilitySelect) {
        viabilitySelect.addEventListener('change', (e) => {
            adminState.filters.viability = e.target.value;
            applyFilters();
        });
    }
    
    // Dates
    const startDate = document.getElementById('filter-start-date');
    const endDate = document.getElementById('filter-end-date');
    
    if (startDate) {
        startDate.addEventListener('change', (e) => {
            adminState.filters.startDate = e.target.value;
            applyFilters();
        });
    }
    
    if (endDate) {
        endDate.addEventListener('change', (e) => {
            adminState.filters.endDate = e.target.value;
            applyFilters();
        });
    }
}

/**
 * Aplica filtros
 */
function applyFilters() {
    const { search, origin, viability, startDate, endDate } = adminState.filters;
    
    adminState.filteredLeads = filterLeads({
        search,
        origin,
        viability,
        startDate,
        endDate
    });
    
    renderLeadsTable();
}

/**
 * Limpa filtros
 */
function clearFilters() {
    // Reset inputs
    document.getElementById('filter-search').value = '';
    document.getElementById('filter-origin').value = '';
    document.getElementById('filter-viability').value = '';
    document.getElementById('filter-start-date').value = '';
    document.getElementById('filter-end-date').value = '';
    
    // Reset state
    adminState.filters = {
        search: '',
        origin: '',
        viability: '',
        startDate: '',
        endDate: ''
    };
    
    // Reaplica
    applyFilters();
}

// ==================== AÇÕES ====================

/**
 * Visualiza lead
 */
function viewLead(id) {
    const lead = getLeadById(id);
    if (!lead) {
        alert('Lead não encontrado');
        return;
    }
    
    // Monta modal com informações
    let info = `
=== INFORMAÇÕES DO LEAD ===

📅 Data: ${new Date(lead.timestamp).toLocaleString('pt-BR')}
🔗 Origem: ${lead.origin === 'quiz' ? 'Quiz Rápido' : 'Calculadora Completa'}
⭐ Score: ${lead.score}/100
📊 Viabilidade: ${lead.viability || lead.elegibilidade || 'N/A'}

👤 DADOS PESSOAIS:
Nome: ${lead.nome || 'N/A'}
Email: ${lead.email || 'N/A'}
Telefone: ${lead.telefone || 'N/A'}
Clínica: ${lead.clinica || 'N/A'}

💼 DADOS FINANCEIROS:
`;
    
    if (lead.faturamento_anual) {
        info += `Faturamento Anual: ${formatCurrency(lead.faturamento_anual)}\n`;
        info += `Folha Pagamento: ${formatCurrency(lead.folha_pagamento || 0)}\n`;
        info += `Regime: ${lead.regime || 'N/A'}\n`;
        info += `Especialidade: ${lead.especialidade || 'N/A'}\n`;
    }
    
    alert(info);
}

/**
 * Confirma exclusão de lead
 */
function confirmDeleteLead(id) {
    if (confirm('Tem certeza que deseja excluir este lead?')) {
        deleteLead(id);
        loadLeads();
        renderStats();
        renderLeadsTable();
        showNotification('Lead excluído com sucesso', 'success');
    }
}

/**
 * Exporta leads para CSV
 */
function exportLeads() {
    const csv = exportLeadsToCSV(adminState.filteredLeads);
    downloadFile(csv, 'leads-equiparacao.csv', 'text/csv');
    showNotification('Leads exportados com sucesso!', 'success');
}

/**
 * Logout
 */
function logout() {
    clearAdminSession();
    window.location.href = 'index.html';
}

// ==================== AUTO-INIT ====================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdmin);
} else {
    initAdmin();
}

// Exporta funções
window.viewLead = viewLead;
window.confirmDeleteLead = confirmDeleteLead;
window.exportLeads = exportLeads;
window.clearFilters = clearFilters;
window.logout = logout;
