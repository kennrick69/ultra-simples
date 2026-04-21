// ==============================================================================
// CONFIGURAÇÃO DA API - DENTAL ULTRA
// ==============================================================================
// IMPORTANTE: Altere a URL abaixo para apontar para seu backend no Railway
// ==============================================================================

var API_CONFIG = {
    // URL do backend - ALTERE AQUI para sua URL do Railway
    // Exemplo: 'https://dental-ultra-api-production.up.railway.app'
    baseUrl: 'https://dentist-backend-v2-production.up.railway.app',
    
    // Timeout para requisições (ms)
    timeout: 30000,
    
    // Versão da API
    version: '4.0'
};

// Variável global para compatibilidade (usado pelo confirmar.html)
var API_BASE_URL = API_CONFIG.baseUrl;

// Função para obter a URL da API
function getApiUrl() {
    // Verifica se há uma URL customizada no localStorage (para desenvolvimento)
    var customUrl = localStorage.getItem('api_url');
    if (customUrl) {
        return customUrl;
    }
    return API_CONFIG.baseUrl;
}

// Função para definir URL customizada (útil para desenvolvimento)
function setApiUrl(url) {
    localStorage.setItem('api_url', url);
    console.log('API URL definida para:', url);
}

// Função para resetar para URL padrão
function resetApiUrl() {
    localStorage.removeItem('api_url');
    console.log('API URL resetada para:', API_CONFIG.baseUrl);
}

// Log da configuração atual
console.log('🦷 Dental Ultra - API Config');
console.log('   URL:', getApiUrl());
console.log('   Versão:', API_CONFIG.version);
