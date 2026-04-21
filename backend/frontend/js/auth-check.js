// ==============================================================================
// VERIFICAÇÃO DE AUTENTICAÇÃO - DENTAL ULTRA v4.0
// ==============================================================================
// Este arquivo deve ser incluído em todas as páginas protegidas
// ==============================================================================

(function() {
    // Verifica se há token
    var token = localStorage.getItem('auth_token');
    
    if (!token) {
        // Sem token, redireciona para login
        window.location.href = 'login.html';
        return;
    }
    
    // Obtém URL da API
    function getApiUrl() {
        var customUrl = localStorage.getItem('api_url');
        if (customUrl) return customUrl;
        return 'https://dentist-backend-v2-production.up.railway.app';
    }
    
    // Verifica se o token é válido
    fetch(getApiUrl() + '/api/auth/verify', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
    })
    .then(function(response) {
        if (!response.ok) {
            throw new Error('Token inválido');
        }
        return response.json();
    })
    .then(function(data) {
        if (data.success && data.dentista) {
            // Atualiza dados do dentista no localStorage
            localStorage.setItem('current_dentista', JSON.stringify(data.dentista));
        }
    })
    .catch(function(error) {
        console.error('Erro na verificação de auth:', error);
        // Token inválido, limpa e redireciona
        localStorage.removeItem('auth_token');
        localStorage.removeItem('current_dentista');
        window.location.href = 'login.html';
    });
})();

// ==============================================================================
// FUNÇÕES GLOBAIS
// ==============================================================================

function getToken() {
    return localStorage.getItem('auth_token');
}

function getCurrentDentista() {
    var data = localStorage.getItem('current_dentista');
    if (data) {
        try {
            return JSON.parse(data);
        } catch (e) {
            return null;
        }
    }
    return null;
}

function getApiUrl() {
    var customUrl = localStorage.getItem('api_url');
    if (customUrl) return customUrl;
    return 'https://dentist-backend-v2-production.up.railway.app';
}

function logout() {
    if (confirm('Deseja realmente sair?')) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('current_dentista');
        localStorage.removeItem('dentista');
        window.location.href = 'login.html';
    }
}

// Preenche dados do usuário na sidebar
function preencherDadosUsuarioSidebar() {
    // Tenta pegar de current_dentista (usado na maioria das páginas)
    var dentista = getCurrentDentista();
    
    // Fallback para 'dentista' (usado em casos-proteticos)
    if (!dentista) {
        var dentistaStr = localStorage.getItem('dentista');
        if (dentistaStr) {
            try {
                dentista = JSON.parse(dentistaStr);
            } catch(e) {}
        }
    }
    
    if (dentista) {
        var userNameEl = document.getElementById('userName');
        var userCROEl = document.getElementById('userCRO');
        
        if (userNameEl) {
            userNameEl.textContent = dentista.nome || dentista.name || 'Usuário';
        }
        if (userCROEl) {
            userCROEl.textContent = dentista.cro ? 'CRO: ' + dentista.cro : '';
        }
    }
}

// Executa ao carregar a página
document.addEventListener('DOMContentLoaded', preencherDadosUsuarioSidebar);

// Função para fazer requisições à API
async function apiCall(endpoint, method, body) {
    var opts = {
        method: method || 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getToken()
        }
    };
    
    if (body) {
        opts.body = JSON.stringify(body);
    }
    
    try {
        var res = await fetch(getApiUrl() + endpoint, opts);
        var data = await res.json();
        
        if (res.status === 401 || res.status === 403) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('current_dentista');
            window.location.href = 'login.html';
            return null;
        }
        
        return data;
    } catch (e) {
        console.error('Erro API:', e);
        return { success: false, erro: 'Erro de conexão com servidor' };
    }
}
