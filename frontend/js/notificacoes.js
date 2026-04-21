// ==============================================================================
// SISTEMA DE NOTIFICAÇÕES MODERNAS - DENTAL ULTRA
// Substitui alert() e confirm() por modais bonitos
// ==============================================================================

(function() {
    'use strict';

    // Injetar estilos
    const styles = `
    /* ========== OVERLAY ========== */
    .notif-overlay {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
    }
    .notif-overlay.show {
        opacity: 1;
        visibility: visible;
    }

    /* ========== MODAL BOX ========== */
    .notif-box {
        background: #fff;
        border-radius: 20px;
        width: 100%;
        max-width: 400px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        transform: scale(0.9) translateY(20px);
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        overflow: hidden;
    }
    .notif-overlay.show .notif-box {
        transform: scale(1) translateY(0);
    }

    /* ========== HEADER COM ÍCONE ========== */
    .notif-header {
        padding: 30px 30px 20px;
        text-align: center;
    }
    .notif-icon {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 20px;
        font-size: 40px;
        animation: notifPop 0.5s ease;
    }
    @keyframes notifPop {
        0% { transform: scale(0); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
    }

    /* Tipos de notificação */
    .notif-success .notif-icon {
        background: linear-gradient(135deg, #dcfce7, #bbf7d0);
        color: #16a34a;
    }
    .notif-error .notif-icon {
        background: linear-gradient(135deg, #fee2e2, #fecaca);
        color: #dc2626;
    }
    .notif-warning .notif-icon {
        background: linear-gradient(135deg, #fef3c7, #fde68a);
        color: #d97706;
    }
    .notif-info .notif-icon {
        background: linear-gradient(135deg, #dbeafe, #bfdbfe);
        color: #2563eb;
    }
    .notif-confirm .notif-icon {
        background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
        color: #4f46e5;
    }

    /* ========== TÍTULO ========== */
    .notif-title {
        font-size: 22px;
        font-weight: 700;
        color: #1f2937;
        margin: 0;
    }

    /* ========== CORPO ========== */
    .notif-body {
        padding: 0 30px 25px;
        text-align: center;
    }
    .notif-message {
        color: #6b7280;
        font-size: 15px;
        line-height: 1.6;
        margin: 0;
        white-space: pre-line;
    }

    /* ========== FOOTER / BOTÕES ========== */
    .notif-footer {
        padding: 20px 30px;
        background: #f9fafb;
        border-top: 1px solid #f3f4f6;
        display: flex;
        gap: 12px;
        justify-content: center;
    }
    .notif-btn {
        padding: 12px 28px;
        border-radius: 10px;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        border: none;
        transition: all 0.2s;
        min-width: 120px;
    }
    .notif-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    .notif-btn:active {
        transform: translateY(0);
    }

    /* Botão primário por tipo */
    .notif-success .notif-btn-primary {
        background: linear-gradient(135deg, #22c55e, #16a34a);
        color: #fff;
    }
    .notif-error .notif-btn-primary {
        background: linear-gradient(135deg, #ef4444, #dc2626);
        color: #fff;
    }
    .notif-warning .notif-btn-primary {
        background: linear-gradient(135deg, #f59e0b, #d97706);
        color: #fff;
    }
    .notif-info .notif-btn-primary {
        background: linear-gradient(135deg, #3b82f6, #2563eb);
        color: #fff;
    }
    .notif-confirm .notif-btn-primary {
        background: linear-gradient(135deg, #22c55e, #16a34a);
        color: #fff;
    }

    /* Botão secundário */
    .notif-btn-secondary {
        background: #fff;
        color: #6b7280;
        border: 2px solid #e5e7eb;
    }
    .notif-btn-secondary:hover {
        background: #f9fafb;
        border-color: #d1d5db;
    }

    /* Botão de cancelar (vermelho) */
    .notif-btn-cancel {
        background: #fff;
        color: #ef4444;
        border: 2px solid #fecaca;
    }
    .notif-btn-cancel:hover {
        background: #fef2f2;
        border-color: #fca5a5;
    }

    /* ========== TOAST (notificação pequena) ========== */
    .notif-toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 99998;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    .notif-toast {
        background: #fff;
        border-radius: 12px;
        padding: 16px 20px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 300px;
        max-width: 400px;
        transform: translateX(120%);
        transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        border-left: 4px solid;
    }
    .notif-toast.show {
        transform: translateX(0);
    }
    .notif-toast-success { border-left-color: #22c55e; }
    .notif-toast-error { border-left-color: #ef4444; }
    .notif-toast-warning { border-left-color: #f59e0b; }
    .notif-toast-info { border-left-color: #3b82f6; }

    .notif-toast-icon {
        font-size: 24px;
        flex-shrink: 0;
    }
    .notif-toast-success .notif-toast-icon { color: #22c55e; }
    .notif-toast-error .notif-toast-icon { color: #ef4444; }
    .notif-toast-warning .notif-toast-icon { color: #f59e0b; }
    .notif-toast-info .notif-toast-icon { color: #3b82f6; }

    .notif-toast-content {
        flex: 1;
    }
    .notif-toast-title {
        font-weight: 600;
        color: #1f2937;
        font-size: 14px;
        margin-bottom: 2px;
    }
    .notif-toast-message {
        color: #6b7280;
        font-size: 13px;
    }
    .notif-toast-close {
        background: none;
        border: none;
        color: #9ca3af;
        cursor: pointer;
        font-size: 20px;
        padding: 0;
        line-height: 1;
    }
    .notif-toast-close:hover {
        color: #6b7280;
    }

    /* ========== RESPONSIVO ========== */
    @media (max-width: 480px) {
        .notif-box {
            max-width: 100%;
            margin: 10px;
            border-radius: 16px;
        }
        .notif-header {
            padding: 25px 20px 15px;
        }
        .notif-icon {
            width: 70px;
            height: 70px;
            font-size: 35px;
        }
        .notif-title {
            font-size: 20px;
        }
        .notif-body {
            padding: 0 20px 20px;
        }
        .notif-footer {
            padding: 15px 20px;
            flex-direction: column;
        }
        .notif-btn {
            width: 100%;
        }
        .notif-toast-container {
            left: 10px;
            right: 10px;
        }
        .notif-toast {
            min-width: auto;
        }
    }
    `;

    // Criar e injetar estilos
    const styleEl = document.createElement('style');
    styleEl.textContent = styles;
    
    // Função para inicializar quando DOM estiver pronto
    function initNotificacoes() {
        if (document.head) {
            document.head.appendChild(styleEl);
        }
        
        // Criar container de toasts
        if (document.body) {
            const toastContainer = document.createElement('div');
            toastContainer.className = 'notif-toast-container';
            document.body.appendChild(toastContainer);
        }
    }
    
    // Verificar se DOM já está pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNotificacoes);
    } else {
        initNotificacoes();
    }

    // Ícones por tipo
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ',
        confirm: '?'
    };

    const titles = {
        success: 'Sucesso!',
        error: 'Erro!',
        warning: 'Atenção!',
        info: 'Informação',
        confirm: 'Confirmação'
    };

    // ========== FUNÇÃO PRINCIPAL DO MODAL ==========
    function showNotification(options) {
        return new Promise((resolve) => {
            const {
                type = 'info',
                title = titles[type],
                message = '',
                confirmText = 'OK',
                cancelText = 'Cancelar',
                showCancel = false
            } = options;

            // Criar overlay
            const overlay = document.createElement('div');
            overlay.className = `notif-overlay notif-${type}`;

            overlay.innerHTML = `
                <div class="notif-box">
                    <div class="notif-header">
                        <div class="notif-icon">${icons[type]}</div>
                        <h2 class="notif-title">${title}</h2>
                    </div>
                    <div class="notif-body">
                        <p class="notif-message">${message}</p>
                    </div>
                    <div class="notif-footer">
                        ${showCancel ? `<button class="notif-btn notif-btn-cancel" data-action="cancel">${cancelText}</button>` : ''}
                        <button class="notif-btn notif-btn-primary" data-action="confirm">${confirmText}</button>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);

            // Mostrar com animação
            requestAnimationFrame(() => {
                overlay.classList.add('show');
            });

            // Handler de clique
            function handleClick(e) {
                const action = e.target.dataset.action;
                if (action) {
                    closeNotification(overlay, action === 'confirm', resolve);
                }
            }

            // Handler de ESC
            function handleKeydown(e) {
                if (e.key === 'Escape') {
                    closeNotification(overlay, false, resolve);
                } else if (e.key === 'Enter') {
                    closeNotification(overlay, true, resolve);
                }
            }

            overlay.addEventListener('click', handleClick);
            document.addEventListener('keydown', handleKeydown);

            // Guardar referência para limpar
            overlay._cleanup = () => {
                overlay.removeEventListener('click', handleClick);
                document.removeEventListener('keydown', handleKeydown);
            };

            // Focar no botão primário
            setTimeout(() => {
                const primaryBtn = overlay.querySelector('.notif-btn-primary');
                if (primaryBtn) primaryBtn.focus();
            }, 100);
        });
    }

    // Fechar notificação
    function closeNotification(overlay, result, resolve) {
        overlay.classList.remove('show');
        overlay._cleanup();
        
        setTimeout(() => {
            overlay.remove();
            resolve(result);
        }, 300);
    }

    // ========== FUNÇÕES PÚBLICAS ==========

    // Sucesso
    window.mostrarSucesso = function(message, title) {
        return showNotification({
            type: 'success',
            title: title || 'Sucesso!',
            message: message,
            confirmText: 'OK'
        });
    };

    // Erro
    window.mostrarErro = function(message, title) {
        return showNotification({
            type: 'error',
            title: title || 'Erro!',
            message: message,
            confirmText: 'OK'
        });
    };

    // Aviso
    window.mostrarAviso = function(message, title) {
        return showNotification({
            type: 'warning',
            title: title || 'Atenção!',
            message: message,
            confirmText: 'Entendi'
        });
    };

    // Info
    window.mostrarInfo = function(message, title) {
        return showNotification({
            type: 'info',
            title: title || 'Informação',
            message: message,
            confirmText: 'OK'
        });
    };

    // Confirmação (retorna Promise com true/false)
    window.mostrarConfirmacao = function(message, title, confirmText, cancelText) {
        return showNotification({
            type: 'confirm',
            title: title || 'Confirmação',
            message: message,
            confirmText: confirmText || 'Sim',
            cancelText: cancelText || 'Não',
            showCancel: true
        });
    };

    // ========== TOAST (notificação pequena no canto) ==========
    window.mostrarToast = function(message, type = 'success', duration = 4000) {
        const toastIcons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        const toastTitles = {
            success: 'Sucesso',
            error: 'Erro',
            warning: 'Atenção',
            info: 'Info'
        };

        const toast = document.createElement('div');
        toast.className = `notif-toast notif-toast-${type}`;
        toast.innerHTML = `
            <span class="notif-toast-icon">${toastIcons[type]}</span>
            <div class="notif-toast-content">
                <div class="notif-toast-title">${toastTitles[type]}</div>
                <div class="notif-toast-message">${message}</div>
            </div>
            <button class="notif-toast-close">×</button>
        `;

        toastContainer.appendChild(toast);

        // Mostrar
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Fechar ao clicar no X
        toast.querySelector('.notif-toast-close').addEventListener('click', () => {
            closeToast(toast);
        });

        // Auto-fechar
        if (duration > 0) {
            setTimeout(() => closeToast(toast), duration);
        }
    };

    function closeToast(toast) {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }

    // ========== SUBSTITUIR ALERT E CONFIRM NATIVOS ==========
    // Guardar originais
    const originalAlert = window.alert;
    const originalConfirm = window.confirm;

    // Substituir alert
    window.alert = function(message) {
        // Detectar tipo pela mensagem
        if (message.includes('✅') || message.toLowerCase().includes('sucesso')) {
            message = message.replace('✅', '').trim();
            mostrarSucesso(message);
        } else if (message.includes('❌') || message.toLowerCase().includes('erro')) {
            message = message.replace('❌', '').trim();
            mostrarErro(message);
        } else if (message.includes('⚠️') || message.toLowerCase().includes('atenção')) {
            message = message.replace('⚠️', '').trim();
            mostrarAviso(message);
        } else {
            mostrarInfo(message);
        }
    };

    // Substituir confirm (NOTA: agora é assíncrono!)
    // Para manter compatibilidade, ainda funciona mas retorna sempre true
    // Use mostrarConfirmacao() para comportamento correto com Promise
    window.confirm = function(message) {
        // Mostrar modal mas retornar true para não quebrar código existente
        mostrarConfirmacao(message);
        return true; // Comportamento de fallback
    };

    // Função para usar confirm corretamente (assíncrono)
    window.confirmar = async function(message, title) {
        return await mostrarConfirmacao(message, title);
    };

    console.log('✅ Sistema de notificações modernas carregado');

})();
