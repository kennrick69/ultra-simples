// ==============================================================================
// SISTEMA DE ALERTAS BONITOS - DENTAL ULTRA
// Substitui os alert() nativos por modais modernos e centralizados
// ==============================================================================

(function() {
    'use strict';

    // Injetar estilos
    const styles = `
        /* Overlay do Alert */
        .dp-alert-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
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
        .dp-alert-overlay.show {
            opacity: 1;
            visibility: visible;
        }

        /* Box do Alert */
        .dp-alert-box {
            background: #fff;
            border-radius: 20px;
            max-width: 420px;
            width: 100%;
            text-align: center;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
            transform: scale(0.8) translateY(-20px);
            transition: transform 0.3s ease;
            overflow: hidden;
        }
        .dp-alert-overlay.show .dp-alert-box {
            transform: scale(1) translateY(0);
        }

        /* Ícone do Alert */
        .dp-alert-icon {
            width: 80px;
            height: 80px;
            margin: 30px auto 20px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
            animation: dp-bounce 0.6s ease;
        }
        @keyframes dp-bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-15px); }
            60% { transform: translateY(-7px); }
        }

        /* Tipos de ícone */
        .dp-alert-icon.success {
            background: linear-gradient(135deg, #d1fae5, #a7f3d0);
            color: #059669;
        }
        .dp-alert-icon.error {
            background: linear-gradient(135deg, #fee2e2, #fecaca);
            color: #dc2626;
        }
        .dp-alert-icon.warning {
            background: linear-gradient(135deg, #fef3c7, #fde68a);
            color: #d97706;
        }
        .dp-alert-icon.info {
            background: linear-gradient(135deg, #dbeafe, #bfdbfe);
            color: #2563eb;
        }
        .dp-alert-icon.confirm {
            background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
            color: #4f46e5;
        }

        /* Título */
        .dp-alert-title {
            font-size: 22px;
            font-weight: 700;
            color: #1f2937;
            margin: 0 20px 12px;
            line-height: 1.3;
        }

        /* Mensagem */
        .dp-alert-message {
            font-size: 15px;
            color: #6b7280;
            margin: 0 24px 24px;
            line-height: 1.6;
            white-space: pre-line;
        }

        /* Botões */
        .dp-alert-buttons {
            display: flex;
            border-top: 1px solid #e5e7eb;
        }
        .dp-alert-btn {
            flex: 1;
            padding: 16px 20px;
            border: none;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }
        .dp-alert-btn:hover {
            filter: brightness(0.95);
        }
        .dp-alert-btn:active {
            transform: scale(0.98);
        }

        /* Botão primário */
        .dp-alert-btn.primary {
            background: #2d7a5f;
            color: #fff;
        }
        .dp-alert-btn.primary:hover {
            background: #246b50;
        }

        /* Botão secundário */
        .dp-alert-btn.secondary {
            background: #f3f4f6;
            color: #4b5563;
            border-right: 1px solid #e5e7eb;
        }
        .dp-alert-btn.secondary:hover {
            background: #e5e7eb;
        }

        /* Botão de erro */
        .dp-alert-btn.danger {
            background: #dc2626;
            color: #fff;
        }
        .dp-alert-btn.danger:hover {
            background: #b91c1c;
        }

        /* Responsivo */
        @media (max-width: 480px) {
            .dp-alert-box {
                margin: 10px;
                border-radius: 16px;
            }
            .dp-alert-icon {
                width: 64px;
                height: 64px;
                font-size: 32px;
                margin: 24px auto 16px;
            }
            .dp-alert-title {
                font-size: 18px;
            }
            .dp-alert-message {
                font-size: 14px;
            }
            .dp-alert-btn {
                padding: 14px 16px;
                font-size: 15px;
            }
        }

        /* Toast notifications (para mensagens rápidas) */
        .dp-toast-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 99998;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .dp-toast {
            background: #fff;
            border-radius: 12px;
            padding: 16px 20px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
            gap: 12px;
            min-width: 300px;
            max-width: 450px;
            animation: dp-toast-in 0.4s ease;
            border-left: 4px solid #2d7a5f;
        }
        .dp-toast.hiding {
            animation: dp-toast-out 0.3s ease forwards;
        }
        @keyframes dp-toast-in {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes dp-toast-out {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        .dp-toast.success { border-left-color: #059669; }
        .dp-toast.error { border-left-color: #dc2626; }
        .dp-toast.warning { border-left-color: #d97706; }
        .dp-toast.info { border-left-color: #2563eb; }
        .dp-toast-icon {
            font-size: 24px;
            flex-shrink: 0;
        }
        .dp-toast-content {
            flex: 1;
        }
        .dp-toast-title {
            font-weight: 600;
            color: #1f2937;
            font-size: 14px;
        }
        .dp-toast-message {
            color: #6b7280;
            font-size: 13px;
            margin-top: 2px;
        }
        .dp-toast-close {
            background: none;
            border: none;
            font-size: 20px;
            color: #9ca3af;
            cursor: pointer;
            padding: 0;
            line-height: 1;
        }
        .dp-toast-close:hover {
            color: #6b7280;
        }
    `;

    // Adicionar estilos ao documento
    const styleEl = document.createElement('style');
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);

    // Container para toasts
    let toastContainer = null;

    // Ícones por tipo
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ',
        confirm: '?'
    };

    // Títulos padrão por tipo
    const defaultTitles = {
        success: 'Sucesso!',
        error: 'Erro!',
        warning: 'Atenção!',
        info: 'Informação',
        confirm: 'Confirmar'
    };

    // ==============================================================================
    // FUNÇÃO PRINCIPAL DE ALERTA
    // ==============================================================================
    function showAlert(options) {
        return new Promise((resolve) => {
            const {
                type = 'info',
                title = defaultTitles[type],
                message = '',
                confirmText = 'OK',
                cancelText = 'Cancelar',
                showCancel = false,
                dangerConfirm = false
            } = options;

            // Criar overlay
            const overlay = document.createElement('div');
            overlay.className = 'dp-alert-overlay';
            overlay.innerHTML = `
                <div class="dp-alert-box">
                    <div class="dp-alert-icon ${type}">${icons[type]}</div>
                    <h2 class="dp-alert-title">${title}</h2>
                    <p class="dp-alert-message">${message}</p>
                    <div class="dp-alert-buttons">
                        ${showCancel ? `<button class="dp-alert-btn secondary" data-action="cancel">${cancelText}</button>` : ''}
                        <button class="dp-alert-btn ${dangerConfirm ? 'danger' : 'primary'}" data-action="confirm">${confirmText}</button>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);

            // Animar entrada
            requestAnimationFrame(() => {
                overlay.classList.add('show');
            });

            // Handler de clique
            function handleClick(e) {
                const action = e.target.dataset.action;
                if (action) {
                    closeAlert(overlay, action === 'confirm', resolve);
                }
            }

            // Handler de teclas
            function handleKeydown(e) {
                if (e.key === 'Enter') {
                    closeAlert(overlay, true, resolve);
                } else if (e.key === 'Escape' && showCancel) {
                    closeAlert(overlay, false, resolve);
                }
            }

            overlay.addEventListener('click', handleClick);
            document.addEventListener('keydown', handleKeydown);

            // Guardar referência para limpar
            overlay._handlers = { handleClick, handleKeydown };

            // Focar no botão de confirmar
            setTimeout(() => {
                overlay.querySelector('.dp-alert-btn.primary, .dp-alert-btn.danger')?.focus();
            }, 100);
        });
    }

    // Fechar alerta
    function closeAlert(overlay, result, resolve) {
        overlay.classList.remove('show');
        
        // Remover handlers
        if (overlay._handlers) {
            document.removeEventListener('keydown', overlay._handlers.handleKeydown);
        }

        setTimeout(() => {
            overlay.remove();
            resolve(result);
        }, 300);
    }

    // ==============================================================================
    // FUNÇÕES DE ATALHO
    // ==============================================================================

    // Alerta de sucesso
    window.alertSuccess = function(message, title) {
        return showAlert({
            type: 'success',
            title: title || 'Sucesso!',
            message: message
        });
    };

    // Alerta de erro
    window.alertError = function(message, title) {
        return showAlert({
            type: 'error',
            title: title || 'Erro!',
            message: message
        });
    };

    // Alerta de aviso
    window.alertWarning = function(message, title) {
        return showAlert({
            type: 'warning',
            title: title || 'Atenção!',
            message: message
        });
    };

    // Alerta de informação
    window.alertInfo = function(message, title) {
        return showAlert({
            type: 'info',
            title: title || 'Informação',
            message: message
        });
    };

    // Confirmação
    window.alertConfirm = function(message, title, options = {}) {
        return showAlert({
            type: 'confirm',
            title: title || 'Confirmar',
            message: message,
            showCancel: true,
            confirmText: options.confirmText || 'Sim',
            cancelText: options.cancelText || 'Não',
            dangerConfirm: options.danger || false
        });
    };

    // Confirmação de exclusão (vermelho)
    window.alertDelete = function(message, title) {
        return showAlert({
            type: 'error',
            title: title || 'Confirmar Exclusão',
            message: message,
            showCancel: true,
            confirmText: 'Excluir',
            cancelText: 'Cancelar',
            dangerConfirm: true
        });
    };

    // ==============================================================================
    // TOAST NOTIFICATIONS (mensagens rápidas no canto)
    // ==============================================================================
    
    function getToastContainer() {
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'dp-toast-container';
            document.body.appendChild(toastContainer);
        }
        return toastContainer;
    }

    window.showToast = function(message, type = 'success', duration = 4000) {
        const container = getToastContainer();
        
        const toast = document.createElement('div');
        toast.className = `dp-toast ${type}`;
        toast.innerHTML = `
            <span class="dp-toast-icon">${icons[type]}</span>
            <div class="dp-toast-content">
                <div class="dp-toast-title">${defaultTitles[type]}</div>
                <div class="dp-toast-message">${message}</div>
            </div>
            <button class="dp-toast-close" onclick="this.parentElement.remove()">×</button>
        `;

        container.appendChild(toast);

        // Auto-remover
        if (duration > 0) {
            setTimeout(() => {
                toast.classList.add('hiding');
                setTimeout(() => toast.remove(), 300);
            }, duration);
        }

        return toast;
    };

    // ==============================================================================
    // SOBRESCREVER alert() e confirm() NATIVOS
    // ==============================================================================

    // Guardar referências originais
    const originalAlert = window.alert;
    const originalConfirm = window.confirm;

    // Sobrescrever alert()
    window.alert = function(message) {
        // Detectar tipo pela mensagem
        let type = 'info';
        let cleanMessage = message;

        if (message.startsWith('✅') || message.startsWith('Sucesso') || message.toLowerCase().includes('sucesso')) {
            type = 'success';
            cleanMessage = message.replace(/^✅\s*/, '').replace(/^Sucesso!\s*/i, '');
        } else if (message.startsWith('❌') || message.startsWith('Erro') || message.toLowerCase().includes('erro')) {
            type = 'error';
            cleanMessage = message.replace(/^❌\s*/, '').replace(/^Erro!\s*/i, '');
        } else if (message.startsWith('⚠️') || message.startsWith('⚠') || message.startsWith('Atenção') || message.toLowerCase().includes('atenção')) {
            type = 'warning';
            cleanMessage = message.replace(/^⚠️?\s*/, '').replace(/^Atenção!\s*/i, '');
        }

        showAlert({
            type: type,
            message: cleanMessage
        });
    };

    // Sobrescrever confirm()
    window.confirm = function(message) {
        // Como confirm é síncrono e nosso é assíncrono, 
        // vamos usar o original para não quebrar o código existente
        // Mas oferecemos alertConfirm() como alternativa assíncrona
        return originalConfirm(message);
    };

    // Expor função para usar confirm assíncrono
    window.confirmAsync = alertConfirm;

    // ==============================================================================
    // INICIALIZAÇÃO
    // ==============================================================================
    console.log('🎨 Sistema de Alertas Bonitos carregado!');

})();
