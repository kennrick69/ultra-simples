/* ==========================================
   APP.JS - Integração Geral do Sistema
   Sistema: Equiparação Hospitalar
   ========================================== */

// ==================== INICIALIZAÇÃO ====================

/**
 * Inicializa o aplicativo
 */
function initApp() {
    console.log('🚀 Iniciando Converse com Maria - Equiparação Hospitalar');
    
    // Carrega configurações
    loadSettings();
    
    // Configura listeners globais
    setupGlobalListeners();
    
    // Configura animações de scroll
    setupScrollAnimations();
    
    // Smooth scroll
    setupSmoothScroll();
    
    // Log de diagnóstico
    logSystemStatus();
}

// ==================== CONFIGURAÇÕES ====================

/**
 * Carrega configurações salvas
 */
function loadSettings() {
    try {
        const settings = getSettings();
        console.log('⚙️ Configurações carregadas:', settings);
    } catch (error) {
        console.error('❌ Erro ao carregar configurações:', error);
    }
}

// ==================== EVENT LISTENERS GLOBAIS ====================

/**
 * Configura listeners globais
 */
function setupGlobalListeners() {
    // Previne submit de forms sem handler
    document.querySelectorAll('form').forEach(form => {
        if (!form.hasAttribute('data-handled')) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                console.warn('⚠️ Form submit interceptado:', form);
            });
        }
    });
    
    // Fecha modals ao clicar fora
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-backdrop')) {
            closeModal(e.target.closest('.modal'));
        }
    });
    
    // ESC fecha modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const openModals = document.querySelectorAll('.modal.is-open');
            openModals.forEach(modal => closeModal(modal));
        }
    });
}

// ==================== ANIMAÇÕES ====================

/**
 * Configura animações no scroll
 */
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observa elementos com classes de animação
    const animatedElements = document.querySelectorAll(
        '.fade-in, .slide-in-left, .slide-in-right'
    );
    
    animatedElements.forEach(el => {
        // Define estado inicial
        el.style.opacity = '0';
        
        if (el.classList.contains('slide-in-left')) {
            el.style.transform = 'translateX(-30px)';
        } else if (el.classList.contains('slide-in-right')) {
            el.style.transform = 'translateX(30px)';
        } else {
            el.style.transform = 'translateY(20px)';
        }
        
        el.style.transition = 'all 0.6s ease-out';
        
        // Observa
        observer.observe(el);
    });
}

/**
 * Configura smooth scroll
 */
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            
            // Ignora # vazio
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (!target) return;
            
            e.preventDefault();
            
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
    });
}

// ==================== UTILITÁRIOS UI ====================

/**
 * Mostra notificação
 * @param {string} message - Mensagem
 * @param {string} type - Tipo: success, warning, danger, info
 * @param {number} duration - Duração em ms (padrão: 5000)
 */
function showNotification(message, type = 'info', duration = 5000) {
    // Remove notificações antigas
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    // Cria notificação
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} notification`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        max-width: 500px;
        animation: slideDown 0.3s ease-out;
    `;
    
    // Ícones por tipo
    const icons = {
        success: '✅',
        warning: '⚠️',
        danger: '❌',
        info: 'ℹ️'
    };
    
    notification.innerHTML = `
        <div class="alert-icon">${icons[type] || icons.info}</div>
        <div class="alert-content">
            <div class="alert-message">${message}</div>
        </div>
        <button class="alert-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove
    if (duration > 0) {
        setTimeout(() => {
            notification.style.animation = 'fadeIn 0.3s ease-out reverse';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }
}

/**
 * Mostra loading overlay
 * @param {string} message - Mensagem (opcional)
 */
function showLoading(message = 'Carregando...') {
    // Remove loading anterior
    hideLoading();
    
    const loading = document.createElement('div');
    loading.id = 'loading-overlay';
    loading.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    `;
    
    loading.innerHTML = `
        <div style="
            background: white;
            padding: 2rem;
            border-radius: 1rem;
            text-align: center;
        ">
            <div class="spinner" style="margin: 0 auto 1rem;"></div>
            <div>${message}</div>
        </div>
    `;
    
    document.body.appendChild(loading);
}

/**
 * Esconde loading overlay
 */
function hideLoading() {
    const loading = document.getElementById('loading-overlay');
    if (loading) {
        loading.remove();
    }
}

/**
 * Abre modal
 * @param {string|HTMLElement} modal - ID ou elemento do modal
 */
function openModal(modal) {
    const modalEl = typeof modal === 'string' ? document.getElementById(modal) : modal;
    if (modalEl) {
        modalEl.classList.add('is-open');
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Fecha modal
 * @param {string|HTMLElement} modal - ID ou elemento do modal
 */
function closeModal(modal) {
    const modalEl = typeof modal === 'string' ? document.getElementById(modal) : modal;
    if (modalEl) {
        modalEl.classList.remove('is-open');
        document.body.style.overflow = '';
    }
}

/**
 * Valida formulário
 * @param {HTMLFormElement} form - Formulário
 * @returns {boolean} - true se válido
 */
function validateForm(form) {
    let isValid = true;
    
    // Remove erros anteriores
    form.querySelectorAll('.form-error').forEach(e => e.remove());
    form.querySelectorAll('.error').forEach(e => e.classList.remove('error'));
    
    // Valida campos obrigatórios
    form.querySelectorAll('[required]').forEach(field => {
        if (!validateRequired(field.value)) {
            showFieldError(field, 'Este campo é obrigatório');
            isValid = false;
        }
    });
    
    // Valida emails
    form.querySelectorAll('[type="email"]').forEach(field => {
        if (field.value && !validateEmail(field.value)) {
            showFieldError(field, 'Email inválido');
            isValid = false;
        }
    });
    
    // Valida telefones
    form.querySelectorAll('[type="tel"]').forEach(field => {
        if (field.value && !validatePhone(field.value)) {
            showFieldError(field, 'Telefone inválido');
            isValid = false;
        }
    });
    
    return isValid;
}

/**
 * Mostra erro em campo
 * @param {HTMLElement} field - Campo
 * @param {string} message - Mensagem de erro
 */
function showFieldError(field, message) {
    field.classList.add('error');
    
    const error = document.createElement('span');
    error.className = 'form-error';
    error.textContent = message;
    
    field.parentNode.appendChild(error);
}

/**
 * Scroll suave para elemento
 * @param {string|HTMLElement} target - ID ou elemento
 */
function smoothScrollTo(target) {
    const element = typeof target === 'string' ? document.getElementById(target) : target;
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// ==================== DIAGNÓSTICO ====================

/**
 * Log de status do sistema
 */
function logSystemStatus() {
    console.group('📊 Status do Sistema');
    
    // Verifica funções
    console.log('✅ Utilitários (utils.js):', typeof formatCurrency !== 'undefined');
    console.log('✅ Storage (storage.js):', typeof getAllLeads !== 'undefined');
    console.log('✅ Cálculos (calculations.js):', typeof calculateSimplesNacional !== 'undefined');
    
    // Testa cálculo
    if (typeof calculateSimplesNacional !== 'undefined') {
        const teste = calculateSimplesNacional(600000, 150000);
        console.log('🧮 Teste de cálculo:', {
            faturamento: formatCurrency(teste.faturamentoAnual),
            anexo: teste.anexo,
            fatorR: teste.fatorRPercentual + '%',
            imposto: formatCurrency(teste.impostoAnual),
            aliquota: teste.aliquotaEfetivaPercentual + '%'
        });
    }
    
    // Info de armazenamento
    if (typeof getStorageInfo !== 'undefined') {
        const storageInfo = getStorageInfo();
        console.log('💾 Storage:', storageInfo.usedFormatted + ' / ' + storageInfo.maxFormatted);
    }
    
    // Leads
    if (typeof getAllLeads !== 'undefined') {
        const leads = getAllLeads();
        console.log('📋 Leads salvos:', leads.length);
    }
    
    console.groupEnd();
}

// ==================== MOBILE MENU ====================

/**
 * Toggle mobile menu
 */
function toggleMobileMenu() {
    const nav = document.querySelector('.header-nav');
    const btn = document.querySelector('.mobile-menu-btn');
    
    if (nav && btn) {
        nav.classList.toggle('mobile-open');
        btn.textContent = nav.classList.contains('mobile-open') ? '✕' : '☰';
    }
}

// ==================== TRACKING (OPCIONAL) ====================

/**
 * Trackeia evento (integrar com GA, Facebook Pixel, etc)
 * @param {string} eventName - Nome do evento
 * @param {object} data - Dados do evento
 */
function trackEvent(eventName, data = {}) {
    console.log('📈 Evento:', eventName, data);
    
    // TODO: Integrar com Google Analytics
    // if (typeof gtag !== 'undefined') {
    //     gtag('event', eventName, data);
    // }
    
    // TODO: Integrar com Facebook Pixel
    // if (typeof fbq !== 'undefined') {
    //     fbq('track', eventName, data);
    // }
}

// ==================== AUTO-INIT ====================

// Inicializa quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Exporta funções globais
window.showNotification = showNotification;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.openModal = openModal;
window.closeModal = closeModal;
window.validateForm = validateForm;
window.smoothScrollTo = smoothScrollTo;
window.toggleMobileMenu = toggleMobileMenu;
window.trackEvent = trackEvent;

// ==================== ÁREA DO DENTISTA - LOGIN ====================

// URL da API (mesma do area-dentistas/js/auth.js)
function getApiUrl() {
    var customUrl = localStorage.getItem('api_url');
    if (customUrl) return customUrl;
    return 'https://dentist-backend-v2-production.up.railway.app';
}

async function loginDentista(event) {
    event.preventDefault();
    
    const email = document.getElementById('dentistaEmail').value.trim();
    const senha = document.getElementById('dentistaSenha').value;
    
    if (!email || !senha) {
        alert('⚠️ Preencha email e senha');
        return;
    }
    
    // Mostrar loading
    const btn = document.querySelector('#dentistaLoginForm button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = 'Entrando...';
    btn.disabled = true;
    
    try {
        // Login via API (igual ao area-dentistas/login.html)
        const response = await fetch(getApiUrl() + '/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: senha
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.erro || 'Erro no login');
        }
        
        // Salvar token e dados do dentista (mesmo formato do auth.js)
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('current_dentista', JSON.stringify(data.dentista));
        localStorage.setItem('dentista', JSON.stringify(data.dentista));
        
        // Redirecionar para casos protéticos
        window.location.href = 'area-dentistas/casos-proteticos.html';
        
    } catch (error) {
        alert('❌ ' + error.message + '\n\nClique em "Cadastre-se gratuitamente" para criar sua conta.');
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}
