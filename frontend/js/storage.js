/* ==========================================
   STORAGE.JS - Gerenciamento de LocalStorage
   Sistema: Equiparação Hospitalar
   ========================================== */

// ==================== CONSTANTES ====================
const STORAGE_KEYS = {
    LEADS: 'equiparacao_maria_leads',
    TEMP_DATA: 'equiparacao_maria_temp',
    ADMIN_SESSION: 'equiparacao_maria_admin',
    SETTINGS: 'equiparacao_maria_settings'
};

// ==================== FUNÇÕES DE ARMAZENAMENTO BÁSICO ====================

/**
 * Salva dados no localStorage
 * @param {string} key - Chave
 * @param {any} data - Dados a salvar
 * @returns {boolean} - true se sucesso
 */
function saveData(key, data) {
    try {
        const jsonData = JSON.stringify(data);
        localStorage.setItem(key, jsonData);
        return true;
    } catch (error) {
        console.error('Erro ao salvar dados:', error);
        return false;
    }
}

/**
 * Recupera dados do localStorage
 * @param {string} key - Chave
 * @returns {any} - Dados recuperados ou null
 */
function getData(key) {
    try {
        const jsonData = localStorage.getItem(key);
        if (!jsonData) return null;
        return JSON.parse(jsonData);
    } catch (error) {
        console.error('Erro ao recuperar dados:', error);
        return null;
    }
}

/**
 * Remove dados do localStorage
 * @param {string} key - Chave
 * @returns {boolean} - true se sucesso
 */
function removeData(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Erro ao remover dados:', error);
        return false;
    }
}

/**
 * Limpa todos os dados do sistema
 * @returns {boolean} - true se sucesso
 */
function clearAllData() {
    try {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        return true;
    } catch (error) {
        console.error('Erro ao limpar dados:', error);
        return false;
    }
}

// ==================== GERENCIAMENTO DE LEADS ====================

/**
 * Salva novo lead
 * @param {object} leadData - Dados do lead
 * @returns {object} - Lead salvo com ID e timestamp
 */
function saveLead(leadData) {
    try {
        // Busca leads existentes
        const leads = getAllLeads();
        
        // Cria novo lead com ID e timestamp
        const newLead = {
            id: generateUUID(),
            timestamp: new Date().toISOString(),
            ...leadData
        };
        
        // Adiciona à lista
        leads.push(newLead);
        
        // Salva
        saveData(STORAGE_KEYS.LEADS, leads);
        
        return newLead;
    } catch (error) {
        console.error('Erro ao salvar lead:', error);
        return null;
    }
}

/**
 * Retorna todos os leads
 * @returns {Array} - Array de leads (ordenado por data, mais recente primeiro)
 */
function getAllLeads() {
    const leads = getData(STORAGE_KEYS.LEADS) || [];
    
    // Ordena por data (mais recente primeiro)
    return leads.sort((a, b) => {
        return new Date(b.timestamp) - new Date(a.timestamp);
    });
}

/**
 * Busca lead por ID
 * @param {string} id - ID do lead
 * @returns {object|null} - Lead encontrado ou null
 */
function getLeadById(id) {
    const leads = getAllLeads();
    return leads.find(lead => lead.id === id) || null;
}

/**
 * Atualiza lead existente
 * @param {string} id - ID do lead
 * @param {object} updates - Dados a atualizar
 * @returns {object|null} - Lead atualizado ou null
 */
function updateLead(id, updates) {
    try {
        const leads = getAllLeads();
        const index = leads.findIndex(lead => lead.id === id);
        
        if (index === -1) {
            console.error('Lead não encontrado');
            return null;
        }
        
        // Atualiza lead
        leads[index] = {
            ...leads[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        
        // Salva
        saveData(STORAGE_KEYS.LEADS, leads);
        
        return leads[index];
    } catch (error) {
        console.error('Erro ao atualizar lead:', error);
        return null;
    }
}

/**
 * Remove lead
 * @param {string} id - ID do lead
 * @returns {boolean} - true se sucesso
 */
function deleteLead(id) {
    try {
        const leads = getAllLeads();
        const filtered = leads.filter(lead => lead.id !== id);
        
        if (filtered.length === leads.length) {
            console.error('Lead não encontrado');
            return false;
        }
        
        saveData(STORAGE_KEYS.LEADS, filtered);
        return true;
    } catch (error) {
        console.error('Erro ao deletar lead:', error);
        return false;
    }
}

/**
 * Filtra leads por critérios
 * @param {object} filters - Filtros a aplicar
 * @returns {Array} - Leads filtrados
 */
function filterLeads(filters = {}) {
    let leads = getAllLeads();
    
    // Filtro por score
    if (filters.minScore !== undefined) {
        leads = leads.filter(lead => (lead.score || 0) >= filters.minScore);
    }
    if (filters.maxScore !== undefined) {
        leads = leads.filter(lead => (lead.score || 0) <= filters.maxScore);
    }
    
    // Filtro por viabilidade
    if (filters.viability) {
        leads = leads.filter(lead => lead.viability === filters.viability);
    }
    
    // Filtro por origem
    if (filters.origin) {
        leads = leads.filter(lead => lead.origin === filters.origin);
    }
    
    // Filtro por data
    if (filters.startDate) {
        const start = new Date(filters.startDate);
        leads = leads.filter(lead => new Date(lead.timestamp) >= start);
    }
    if (filters.endDate) {
        const end = new Date(filters.endDate);
        leads = leads.filter(lead => new Date(lead.timestamp) <= end);
    }
    
    // Filtro por regime tributário
    if (filters.regime) {
        leads = leads.filter(lead => lead.regimeTributario === filters.regime);
    }
    
    // Filtro por especialidade
    if (filters.especialidade) {
        leads = leads.filter(lead => lead.especialidade === filters.especialidade);
    }
    
    // Busca por texto (nome, email, clínica)
    if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        leads = leads.filter(lead => {
            const nome = (lead.nome || '').toLowerCase();
            const email = (lead.email || '').toLowerCase();
            const clinica = (lead.nomeClinica || lead.clinica || '').toLowerCase();
            
            return nome.includes(searchLower) ||
                   email.includes(searchLower) ||
                   clinica.includes(searchLower);
        });
    }
    
    return leads;
}

/**
 * Ordena leads
 * @param {Array} leads - Array de leads
 * @param {string} sortBy - Campo para ordenar
 * @param {string} direction - 'asc' ou 'desc'
 * @returns {Array} - Leads ordenados
 */
function sortLeads(leads, sortBy = 'timestamp', direction = 'desc') {
    const sorted = [...leads];
    
    sorted.sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];
        
        // Converte datas
        if (sortBy === 'timestamp' || sortBy === 'data') {
            aValue = new Date(aValue).getTime();
            bValue = new Date(bValue).getTime();
        }
        
        // Converte números
        if (sortBy === 'score' || sortBy === 'faturamentoAnual') {
            aValue = Number(aValue) || 0;
            bValue = Number(bValue) || 0;
        }
        
        // Compara strings
        if (typeof aValue === 'string' && typeof bValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }
        
        if (direction === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });
    
    return sorted;
}

/**
 * Exporta leads para CSV
 * @param {Array} leads - Leads a exportar (opcional, usa todos se não informado)
 * @returns {string} - String CSV
 */
function exportLeadsToCSV(leads = null) {
    const leadsToExport = leads || getAllLeads();
    
    if (leadsToExport.length === 0) {
        return '';
    }
    
    // Headers
    const headers = [
        'Data',
        'ID',
        'Origem',
        'Nome',
        'Email',
        'Telefone',
        'Clínica',
        'Município',
        'Especialidade',
        'Regime Tributário',
        'Faturamento Anual',
        'Score',
        'Viabilidade',
        'Economia Anual',
        'Recuperação 5 Anos',
        'Status'
    ];
    
    // Rows
    const rows = leadsToExport.map(lead => {
        return [
            formatDate(lead.timestamp, true),
            lead.id,
            lead.origin || 'N/A',
            lead.nome || lead.nomeResponsavel || 'N/A',
            lead.email || 'N/A',
            lead.telefone || 'N/A',
            lead.nomeClinica || lead.clinica || 'N/A',
            lead.municipio || 'N/A',
            lead.especialidade || 'N/A',
            lead.regimeTributario || 'N/A',
            lead.faturamentoAnual || 'N/A',
            lead.score || '0',
            lead.viability || lead.elegibilidade || 'N/A',
            lead.economiaAnual ? formatCurrency(lead.economiaAnual) : 'N/A',
            lead.recuperacao5Anos ? formatCurrency(lead.recuperacao5Anos) : 'N/A',
            lead.status || 'Novo'
        ].map(value => {
            // Escapa aspas e adiciona aspas se contém vírgula
            const escaped = String(value).replace(/"/g, '""');
            return escaped.includes(',') ? `"${escaped}"` : escaped;
        });
    });
    
    // Monta CSV
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');
    
    return csvContent;
}

/**
 * Calcula estatísticas dos leads
 * @returns {object} - Objeto com estatísticas
 */
function getLeadsStatistics() {
    const leads = getAllLeads();
    
    const stats = {
        total: leads.length,
        porOrigem: {
            quiz: 0,
            calculadora: 0,
            outro: 0
        },
        porViabilidade: {
            altissima: 0,
            alta: 0,
            media: 0,
            baixa: 0,
            naoViavel: 0
        },
        scoresMedio: 0,
        comDocumentos: 0,
        ultimaSemana: 0,
        ultimoMes: 0
    };
    
    const now = new Date();
    const umaSemanaAtras = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const umMesAtras = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    let scoreTotal = 0;
    
    leads.forEach(lead => {
        // Origem
        if (lead.origin === 'quiz') stats.porOrigem.quiz++;
        else if (lead.origin === 'calculadora') stats.porOrigem.calculadora++;
        else stats.porOrigem.outro++;
        
        // Viabilidade
        const viability = (lead.viability || lead.elegibilidade || '').toLowerCase();
        if (viability.includes('altíssima')) stats.porViabilidade.altissima++;
        else if (viability.includes('alta')) stats.porViabilidade.alta++;
        else if (viability.includes('média') || viability.includes('media')) stats.porViabilidade.media++;
        else if (viability.includes('baixa')) stats.porViabilidade.baixa++;
        else if (viability.includes('não') || viability.includes('nao')) stats.porViabilidade.naoViavel++;
        
        // Score
        if (lead.score) scoreTotal += lead.score;
        
        // Documentos
        if (lead.documentos && Object.keys(lead.documentos).length > 0) {
            stats.comDocumentos++;
        }
        
        // Data
        const leadDate = new Date(lead.timestamp);
        if (leadDate >= umaSemanaAtras) stats.ultimaSemana++;
        if (leadDate >= umMesAtras) stats.ultimoMes++;
    });
    
    stats.scoreMedio = leads.length > 0 ? Math.round(scoreTotal / leads.length) : 0;
    
    return stats;
}

// ==================== DADOS TEMPORÁRIOS ====================

/**
 * Salva dados temporários (formulário em andamento)
 * @param {object} data - Dados temporários
 * @returns {boolean} - true se sucesso
 */
function saveTempData(data) {
    return saveData(STORAGE_KEYS.TEMP_DATA, {
        ...data,
        savedAt: new Date().toISOString()
    });
}

/**
 * Recupera dados temporários
 * @returns {object|null} - Dados ou null
 */
function getTempData() {
    const tempData = getData(STORAGE_KEYS.TEMP_DATA);
    
    if (!tempData) return null;
    
    // Verifica se os dados não expiraram (1 hora)
    const savedAt = new Date(tempData.savedAt);
    const now = new Date();
    const diffHours = (now - savedAt) / 1000 / 60 / 60;
    
    if (diffHours > 1) {
        clearTempData();
        return null;
    }
    
    return tempData;
}

/**
 * Limpa dados temporários
 * @returns {boolean} - true se sucesso
 */
function clearTempData() {
    return removeData(STORAGE_KEYS.TEMP_DATA);
}

// ==================== SESSÃO ADMIN ====================

/**
 * Salva sessão do admin
 * @param {boolean} isAuthenticated - Se está autenticado
 * @returns {boolean} - true se sucesso
 */
function saveAdminSession(isAuthenticated) {
    return saveData(STORAGE_KEYS.ADMIN_SESSION, {
        authenticated: isAuthenticated,
        timestamp: new Date().toISOString()
    });
}

/**
 * Verifica se admin está autenticado
 * @returns {boolean} - true se autenticado
 */
function isAdminAuthenticated() {
    const session = getData(STORAGE_KEYS.ADMIN_SESSION);
    
    if (!session || !session.authenticated) {
        return false;
    }
    
    // Verifica se sessão não expirou (24 horas)
    const timestamp = new Date(session.timestamp);
    const now = new Date();
    const diffHours = (now - timestamp) / 1000 / 60 / 60;
    
    if (diffHours > 24) {
        clearAdminSession();
        return false;
    }
    
    return true;
}

/**
 * Limpa sessão do admin
 * @returns {boolean} - true se sucesso
 */
function clearAdminSession() {
    return removeData(STORAGE_KEYS.ADMIN_SESSION);
}

// ==================== CONFIGURAÇÕES ====================

/**
 * Salva configurações do sistema
 * @param {object} settings - Configurações
 * @returns {boolean} - true se sucesso
 */
function saveSettings(settings) {
    const current = getSettings();
    return saveData(STORAGE_KEYS.SETTINGS, {
        ...current,
        ...settings,
        updatedAt: new Date().toISOString()
    });
}

/**
 * Recupera configurações
 * @returns {object} - Configurações
 */
function getSettings() {
    return getData(STORAGE_KEYS.SETTINGS) || {
        theme: 'light',
        notifications: true,
        autoSave: true
    };
}

// ==================== UTILITÁRIOS ====================

/**
 * Verifica espaço disponível no localStorage
 * @returns {object} - Informações de uso
 */
function getStorageInfo() {
    let totalSize = 0;
    
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            totalSize += localStorage[key].length + key.length;
        }
    }
    
    // localStorage geralmente tem 5-10MB de limite
    const maxSize = 5 * 1024 * 1024; // 5MB em bytes
    const usedPercentage = (totalSize / maxSize) * 100;
    
    return {
        used: totalSize,
        usedFormatted: formatFileSize(totalSize),
        max: maxSize,
        maxFormatted: formatFileSize(maxSize),
        percentage: Math.round(usedPercentage),
        available: maxSize - totalSize,
        availableFormatted: formatFileSize(maxSize - totalSize)
    };
}

/**
 * Exporta todos os dados do sistema
 * @returns {object} - Objeto com todos os dados
 */
function exportAllData() {
    return {
        leads: getAllLeads(),
        tempData: getTempData(),
        settings: getSettings(),
        exportedAt: new Date().toISOString(),
        version: '1.0'
    };
}

/**
 * Importa dados para o sistema
 * @param {object} data - Dados a importar
 * @returns {boolean} - true se sucesso
 */
function importData(data) {
    try {
        if (data.leads) {
            saveData(STORAGE_KEYS.LEADS, data.leads);
        }
        if (data.settings) {
            saveSettings(data.settings);
        }
        return true;
    } catch (error) {
        console.error('Erro ao importar dados:', error);
        return false;
    }
}

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        STORAGE_KEYS,
        saveData, getData, removeData, clearAllData,
        saveLead, getAllLeads, getLeadById, updateLead, deleteLead,
        filterLeads, sortLeads, exportLeadsToCSV, getLeadsStatistics,
        saveTempData, getTempData, clearTempData,
        saveAdminSession, isAdminAuthenticated, clearAdminSession,
        saveSettings, getSettings,
        getStorageInfo, exportAllData, importData
    };
}
