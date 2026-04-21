/* ========================================
   DENTAL ULTRA - UI JAVASCRIPT v1.0
   Sistema de Gestão Odontológica
   ======================================== */

(function() {
  'use strict';

  // ===== TOAST NOTIFICATIONS =====
  function getToastRoot() {
    let root = document.querySelector('.du-toasts');
    if (!root) {
      root = document.createElement('div');
      root.className = 'du-toasts';
      document.body.appendChild(root);
    }
    return root;
  }

  window.DUToast = function(options = {}) {
    const {
      title = 'Dental Ultra',
      message = '',
      type = 'info', // info, success, warning, error
      duration = 4000
    } = options;

    const root = getToastRoot();
    const toast = document.createElement('div');
    toast.className = `du-toast du-toast--${type}`;

    toast.innerHTML = `
      <div class="du-toast__title">${title}</div>
      ${message ? `<div class="du-toast__msg">${message}</div>` : ''}
    `;

    root.appendChild(toast);

    // Auto remove
    const timer = setTimeout(() => {
      toast.style.animation = 'du-toast-out .25s ease forwards';
      setTimeout(() => toast.remove(), 250);
    }, duration);

    // Click to dismiss
    toast.addEventListener('click', () => {
      clearTimeout(timer);
      toast.style.animation = 'du-toast-out .25s ease forwards';
      setTimeout(() => toast.remove(), 250);
    });

    return toast;
  };

  // Add exit animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes du-toast-out {
      to { opacity: 0; transform: translateX(30px); }
    }
  `;
  document.head.appendChild(style);

  // ===== MODAL =====
  window.DUModal = {
    open(id) {
      const modal = document.getElementById(id);
      if (!modal) return;
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    },

    close(id) {
      const modal = document.getElementById(id);
      if (!modal) return;
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    },

    toggle(id) {
      const modal = document.getElementById(id);
      if (!modal) return;
      if (modal.classList.contains('is-open')) {
        this.close(id);
      } else {
        this.open(id);
      }
    }
  };

  // Close on backdrop click
  document.addEventListener('click', (e) => {
    // Close button
    if (e.target.closest('[data-du-close]')) {
      const modal = e.target.closest('.du-modal');
      if (modal?.id) DUModal.close(modal.id);
      return;
    }
    // Backdrop click
    if (e.target.classList.contains('du-modal')) {
      DUModal.close(e.target.id);
    }
  });

  // Close on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.du-modal.is-open').forEach(modal => {
        DUModal.close(modal.id);
      });
    }
  });

  // ===== BUTTON LOADING =====
  window.DUButton = {
    setLoading(btn, isLoading, loadingText = 'Aguarde...') {
      if (!btn) return;
      
      if (isLoading) {
        btn.dataset.originalHtml = btn.innerHTML;
        btn.classList.add('is-loading');
        btn.setAttribute('disabled', 'true');
        btn.innerHTML = `<span class="du-spinner"></span> ${loadingText}`;
      } else {
        btn.classList.remove('is-loading');
        btn.removeAttribute('disabled');
        if (btn.dataset.originalHtml) {
          btn.innerHTML = btn.dataset.originalHtml;
        }
      }
    }
  };

  // ===== THEME TOGGLE =====
  window.DUTheme = {
    get() {
      return document.documentElement.getAttribute('data-theme') || 'light';
    },
    set(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('du-theme', theme);
    },
    toggle() {
      this.set(this.get() === 'dark' ? 'light' : 'dark');
    },
    init() {
      const saved = localStorage.getItem('du-theme');
      if (saved) this.set(saved);
    }
  };

  // Auto-init theme
  DUTheme.init();

  // ===== FORM VALIDATION HELPERS =====
  window.DUForm = {
    setError(field, message) {
      const fieldEl = typeof field === 'string' ? document.querySelector(field) : field;
      if (!fieldEl) return;
      
      const container = fieldEl.closest('.du-field');
      if (container) {
        container.classList.add('is-error');
        const errorEl = container.querySelector('.du-error-msg');
        if (errorEl) errorEl.textContent = message;
      }
    },

    clearError(field) {
      const fieldEl = typeof field === 'string' ? document.querySelector(field) : field;
      if (!fieldEl) return;
      
      const container = fieldEl.closest('.du-field');
      if (container) {
        container.classList.remove('is-error');
      }
    },

    clearAllErrors(form) {
      const formEl = typeof form === 'string' ? document.querySelector(form) : form;
      if (!formEl) return;
      
      formEl.querySelectorAll('.du-field.is-error').forEach(field => {
        field.classList.remove('is-error');
      });
    }
  };

  // ===== UTILITY FUNCTIONS =====
  window.DU = {
    // Format phone number
    formatPhone(value) {
      const numbers = value.replace(/\D/g, '');
      if (numbers.length <= 10) {
        return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
      }
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    },

    // Format CPF
    formatCPF(value) {
      return value.replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    },

    // Format date BR
    formatDate(date) {
      if (!date) return '';
      const d = new Date(date);
      return d.toLocaleDateString('pt-BR');
    },

    // Format currency BR
    formatCurrency(value) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    },

    // Debounce
    debounce(fn, delay = 300) {
      let timer;
      return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
      };
    }
  };

  // Log init
  console.log('✅ Dental Ultra UI Kit v1.0 carregado');
})();
