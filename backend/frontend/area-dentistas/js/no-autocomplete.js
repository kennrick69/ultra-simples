// ==============================================================================
// DISABLE BROWSER AUTOCOMPLETE - DENTAL ULTRA
// Desabilita o autocomplete nativo do navegador em todo o site
// ==============================================================================

(function() {
    'use strict';

    // Função para desabilitar autocomplete em um elemento
    function disableAutocomplete(element) {
        if (!element) return;
        
        // Atributos que desabilitam autocomplete
        element.setAttribute('autocomplete', 'off');
        element.setAttribute('autocorrect', 'off');
        element.setAttribute('autocapitalize', 'off');
        element.setAttribute('spellcheck', 'false');
        
        // Chrome ignora "off", então usamos valores inválidos/específicos
        const name = element.name || element.id || '';
        
        // Para campos de busca/pesquisa
        if (name.toLowerCase().includes('busca') || 
            name.toLowerCase().includes('search') ||
            name.toLowerCase().includes('pesquisa') ||
            name.toLowerCase().includes('paciente')) {
            element.setAttribute('autocomplete', 'nope');
        }
        
        // Para campos de email
        if (element.type === 'email') {
            element.setAttribute('autocomplete', 'new-email');
        }
        
        // Para campos de telefone
        if (element.type === 'tel') {
            element.setAttribute('autocomplete', 'new-phone');
        }
        
        // Para campos de senha
        if (element.type === 'password') {
            element.setAttribute('autocomplete', 'new-password');
        }
        
        // Para campos de texto genéricos
        if (element.type === 'text') {
            element.setAttribute('autocomplete', 'nope');
        }
        
        // Atributo especial para Chrome
        element.setAttribute('data-form-type', 'other');
        element.setAttribute('data-lpignore', 'true'); // LastPass
        element.setAttribute('data-1p-ignore', 'true'); // 1Password
    }

    // Função para desabilitar em formulários
    function disableFormAutocomplete(form) {
        if (!form) return;
        
        form.setAttribute('autocomplete', 'off');
        form.setAttribute('data-form-type', 'other');
        
        // Adiciona campo honeypot invisível para confundir o Chrome
        if (!form.querySelector('.chrome-autocomplete-trap')) {
            const trap = document.createElement('input');
            trap.type = 'text';
            trap.name = 'chrome_trap_' + Math.random().toString(36).substr(2, 9);
            trap.className = 'chrome-autocomplete-trap';
            trap.tabIndex = -1;
            trap.autocomplete = 'off';
            trap.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;';
            form.insertBefore(trap, form.firstChild);
        }
    }

    // Aplica em todos os elementos existentes
    function applyToAll() {
        // Forms
        document.querySelectorAll('form').forEach(disableFormAutocomplete);
        
        // Inputs
        document.querySelectorAll('input').forEach(disableAutocomplete);
        
        // Selects
        document.querySelectorAll('select').forEach(disableAutocomplete);
        
        // Textareas
        document.querySelectorAll('textarea').forEach(disableAutocomplete);
    }

    // Observer para elementos adicionados dinamicamente
    function setupObserver() {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        if (node.tagName === 'INPUT' || node.tagName === 'SELECT' || node.tagName === 'TEXTAREA') {
                            disableAutocomplete(node);
                        }
                        if (node.tagName === 'FORM') {
                            disableFormAutocomplete(node);
                        }
                        // Também verifica filhos
                        if (node.querySelectorAll) {
                            node.querySelectorAll('input, select, textarea').forEach(disableAutocomplete);
                            node.querySelectorAll('form').forEach(disableFormAutocomplete);
                        }
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Previne autocomplete no focus (backup)
    function preventOnFocus() {
        document.addEventListener('focus', function(e) {
            const target = e.target;
            if (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA') {
                disableAutocomplete(target);
            }
        }, true);
    }

    // Bloqueia evento de autocomplete do Chrome
    function blockChromeAutofill() {
        // Chrome dispara 'animationstart' quando faz autofill
        document.addEventListener('animationstart', function(e) {
            if (e.animationName === 'onAutoFillStart') {
                e.target.classList.add('autofilled');
            }
        }, true);

        // Previne preenchimento automático em campos específicos
        document.addEventListener('input', function(e) {
            const target = e.target;
            // Se o campo foi preenchido automaticamente e não deveria
            if (target.classList.contains('no-autofill') && target.value && !target.dataset.userTyped) {
                // Limpa após um pequeno delay
                setTimeout(function() {
                    if (!target.dataset.userTyped) {
                        target.value = '';
                    }
                }, 50);
            }
            target.dataset.userTyped = 'true';
        }, true);
    }

    // Inicialização
    function init() {
        // Aplica imediatamente
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                applyToAll();
                setupObserver();
                preventOnFocus();
                blockChromeAutofill();
            });
        } else {
            applyToAll();
            setupObserver();
            preventOnFocus();
            blockChromeAutofill();
        }

        // Reaplica após um delay (para elementos carregados depois)
        setTimeout(applyToAll, 500);
        setTimeout(applyToAll, 1500);
    }

    // Adiciona CSS para esconder autocomplete do Chrome
    function addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Esconde dropdown de autocomplete do Chrome */
            input:-webkit-autofill,
            input:-webkit-autofill:hover,
            input:-webkit-autofill:focus,
            input:-webkit-autofill:active {
                -webkit-box-shadow: 0 0 0 30px white inset !important;
                box-shadow: 0 0 0 30px white inset !important;
            }
            
            /* Remove fundo amarelo do autofill */
            input:-webkit-autofill {
                -webkit-text-fill-color: inherit !important;
                transition: background-color 5000s ease-in-out 0s;
            }
            
            /* Trap field */
            .chrome-autocomplete-trap {
                position: absolute !important;
                left: -9999px !important;
                width: 1px !important;
                height: 1px !important;
                opacity: 0 !important;
                pointer-events: none !important;
            }
            
            /* Detecta autofill via animação */
            @keyframes onAutoFillStart { from {} to {} }
            input:-webkit-autofill { animation-name: onAutoFillStart; }
        `;
        document.head.appendChild(style);
    }

    // Executa
    addStyles();
    init();

    // Expõe função para uso manual se necessário
    window.disableAutocomplete = disableAutocomplete;
    window.reapplyNoAutocomplete = applyToAll;

})();
