// ==================== API MODULE - DENTAL ULTRA ====================
// Módulo centralizado para comunicação com o backend PostgreSQL
// Versão: 1.0 - Integração completa com backend

const API = {
    // URL do backend
    baseUrl: 'https://dentist-backend-v2-production.up.railway.app',
    
    // ==================== HELPERS ====================
    
    // Obter token de autenticação
    getToken() {
        return localStorage.getItem('auth_token') || localStorage.getItem('token');
    },
    
    // Obter usuário atual
    getCurrentUser() {
        try {
            const data = localStorage.getItem('current_dentista') || localStorage.getItem('user');
            return data ? JSON.parse(data) : null;
        } catch(e) {
            return null;
        }
    },
    
    // Headers padrão para requisições
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        const token = this.getToken();
        if (token) {
            headers['Authorization'] = 'Bearer ' + token;
        }
        return headers;
    },
    
    // Fazer requisição genérica
    async request(endpoint, options = {}) {
        const url = this.baseUrl + endpoint;
        const config = {
            headers: this.getHeaders(),
            ...options
        };
        
        try {
            console.log(`[API] ${options.method || 'GET'} ${endpoint}`);
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                console.error('[API] Erro:', data);
                throw new Error(data.erro || data.message || 'Erro na requisição');
            }
            
            return data;
        } catch (error) {
            console.error('[API] Falha:', error.message);
            throw error;
        }
    },
    
    // ==================== AUTENTICAÇÃO ====================
    
    async login(email, senha) {
        const response = await this.request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, senha })
        });
        
        if (response.token) {
            localStorage.setItem('auth_token', response.token);
            localStorage.setItem('current_dentista', JSON.stringify(response.dentista || response.user));
        }
        
        return response;
    },
    
    async register(dados) {
        return await this.request('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(dados)
        });
    },
    
    logout() {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('current_dentista');
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    },
    
    isAuthenticated() {
        return !!this.getToken();
    },
    
    // ==================== PACIENTES ====================
    
    async getPacientes() {
        try {
            const response = await this.request('/api/pacientes');
            // Pode retornar array direto ou objeto com propriedade
            return Array.isArray(response) ? response : (response.pacientes || response.data || []);
        } catch (error) {
            console.error('[API] Erro ao buscar pacientes:', error);
            // Fallback para localStorage em caso de erro
            return this.getPacientesLocal();
        }
    },
    
    async getPaciente(id) {
        return await this.request('/api/pacientes/' + id);
    },
    
    async criarPaciente(dados) {
        const response = await this.request('/api/pacientes', {
            method: 'POST',
            body: JSON.stringify(dados)
        });
        // Sincronizar com localStorage como backup
        this.syncPacienteLocal(response.paciente || response);
        return response;
    },
    
    async atualizarPaciente(id, dados) {
        const response = await this.request('/api/pacientes/' + id, {
            method: 'PUT',
            body: JSON.stringify(dados)
        });
        this.syncPacienteLocal(response.paciente || response);
        return response;
    },
    
    async excluirPaciente(id) {
        const response = await this.request('/api/pacientes/' + id, {
            method: 'DELETE'
        });
        this.removePacienteLocal(id);
        return response;
    },
    
    // Backup local
    getPacientesLocal() {
        try {
            const user = this.getCurrentUser();
            const key = user ? `pacientes_${user.id}` : 'pacientes_default';
            return JSON.parse(localStorage.getItem(key) || '[]');
        } catch(e) {
            return [];
        }
    },
    
    syncPacienteLocal(paciente) {
        if (!paciente) return;
        const pacientes = this.getPacientesLocal();
        const index = pacientes.findIndex(p => p.id === paciente.id);
        if (index >= 0) {
            pacientes[index] = paciente;
        } else {
            pacientes.push(paciente);
        }
        const user = this.getCurrentUser();
        const key = user ? `pacientes_${user.id}` : 'pacientes_default';
        localStorage.setItem(key, JSON.stringify(pacientes));
    },
    
    removePacienteLocal(id) {
        const pacientes = this.getPacientesLocal().filter(p => p.id !== id);
        const user = this.getCurrentUser();
        const key = user ? `pacientes_${user.id}` : 'pacientes_default';
        localStorage.setItem(key, JSON.stringify(pacientes));
    },
    
    // ==================== AGENDAMENTOS ====================
    
    async getAgendamentos(data = null) {
        let endpoint = '/api/agendamentos';
        if (data) {
            endpoint += '?data=' + data;
        }
        try {
            const response = await this.request(endpoint);
            return Array.isArray(response) ? response : (response.agendamentos || response.data || []);
        } catch (error) {
            console.error('[API] Erro ao buscar agendamentos:', error);
            return [];
        }
    },
    
    async criarAgendamento(dados) {
        return await this.request('/api/agendamentos', {
            method: 'POST',
            body: JSON.stringify(dados)
        });
    },
    
    async atualizarAgendamento(id, dados) {
        return await this.request('/api/agendamentos/' + id, {
            method: 'PUT',
            body: JSON.stringify(dados)
        });
    },
    
    async excluirAgendamento(id) {
        return await this.request('/api/agendamentos/' + id, {
            method: 'DELETE'
        });
    },
    
    // ==================== PRONTUÁRIO ====================
    
    async getProntuario(pacienteId) {
        try {
            return await this.request('/api/prontuarios/' + pacienteId);
        } catch (error) {
            // Fallback local
            return this.getProntuarioLocal(pacienteId);
        }
    },
    
    async salvarProntuario(pacienteId, dados) {
        try {
            return await this.request('/api/prontuarios/' + pacienteId, {
                method: 'PUT',
                body: JSON.stringify(dados)
            });
        } catch (error) {
            // Salvar local como backup
            this.salvarProntuarioLocal(pacienteId, dados);
            throw error;
        }
    },
    
    getProntuarioLocal(pacienteId) {
        return {
            anamnese: JSON.parse(localStorage.getItem('prontuario_anamnese_' + pacienteId) || '{}'),
            odontograma: JSON.parse(localStorage.getItem('prontuario_odontograma_' + pacienteId) || '{}'),
            evolucoes: JSON.parse(localStorage.getItem('prontuario_evolucao_' + pacienteId) || '[]'),
            fotos: JSON.parse(localStorage.getItem('prontuario_fotos_' + pacienteId) || '[]')
        };
    },
    
    salvarProntuarioLocal(pacienteId, dados) {
        if (dados.anamnese) {
            localStorage.setItem('prontuario_anamnese_' + pacienteId, JSON.stringify(dados.anamnese));
        }
        if (dados.odontograma) {
            localStorage.setItem('prontuario_odontograma_' + pacienteId, JSON.stringify(dados.odontograma));
        }
        if (dados.evolucoes) {
            localStorage.setItem('prontuario_evolucao_' + pacienteId, JSON.stringify(dados.evolucoes));
        }
    },
    
    // ==================== FINANCEIRO ====================
    
    async getTransacoes(filtros = {}) {
        let endpoint = '/api/financeiro';
        const params = new URLSearchParams(filtros).toString();
        if (params) endpoint += '?' + params;
        
        try {
            const response = await this.request(endpoint);
            return Array.isArray(response) ? response : (response.transacoes || response.data || []);
        } catch (error) {
            return [];
        }
    },
    
    async criarTransacao(dados) {
        return await this.request('/api/financeiro', {
            method: 'POST',
            body: JSON.stringify(dados)
        });
    },
    
    // ==================== ESTOQUE ====================
    
    async getEstoque() {
        try {
            const response = await this.request('/api/estoque');
            return Array.isArray(response) ? response : (response.itens || response.data || []);
        } catch (error) {
            return [];
        }
    },
    
    async criarItemEstoque(dados) {
        return await this.request('/api/estoque', {
            method: 'POST',
            body: JSON.stringify(dados)
        });
    },
    
    async atualizarItemEstoque(id, dados) {
        return await this.request('/api/estoque/' + id, {
            method: 'PUT',
            body: JSON.stringify(dados)
        });
    },
    
    // ==================== UTILITÁRIOS ====================
    
    // Testar conexão com backend
    async testConnection() {
        try {
            await this.request('/health');
            return { online: true, message: 'Backend conectado!' };
        } catch (error) {
            return { online: false, message: 'Backend offline: ' + error.message };
        }
    },
    
    // Sincronizar dados locais com backend
    async syncAll() {
        console.log('[API] Iniciando sincronização...');
        
        // Sincronizar pacientes locais que não estão no backend
        const pacientesLocais = this.getPacientesLocal();
        const pacientesRemoto = await this.getPacientes();
        
        const idsRemoto = new Set(pacientesRemoto.map(p => p.id));
        
        for (const paciente of pacientesLocais) {
            if (!idsRemoto.has(paciente.id)) {
                try {
                    await this.criarPaciente(paciente);
                    console.log('[API] Paciente sincronizado:', paciente.nome);
                } catch (e) {
                    console.error('[API] Erro ao sincronizar paciente:', paciente.nome);
                }
            }
        }
        
        console.log('[API] Sincronização concluída!');
    }
};

// Expor globalmente
window.API = API;

console.log('🦷 Dental Ultra - API Module carregado');
console.log('   Backend:', API.baseUrl);
console.log('   Autenticado:', API.isAuthenticated() ? 'Sim' : 'Não');
