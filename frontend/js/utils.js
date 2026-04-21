/* ==========================================
   UTILS.JS - Funções Utilitárias
   Sistema: Equiparação Hospitalar
   ========================================== */

// ==================== FORMATAÇÃO ====================

/**
 * Formata número como moeda BRL
 * @param {number} value - Valor a ser formatado
 * @returns {string} - Valor formatado (ex: "R$ 1.234,56")
 */
function formatCurrency(value) {
    if (value === null || value === undefined || isNaN(value)) {
        return 'R$ 0,00';
    }
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

/**
 * Formata número como porcentagem
 * @param {number} value - Valor a ser formatado (ex: 0.15 para 15%)
 * @param {number} decimals - Casas decimais (padrão: 1)
 * @returns {string} - Valor formatado (ex: "15,0%")
 */
function formatPercentage(value, decimals = 1) {
    if (value === null || value === undefined || isNaN(value)) {
        return '0%';
    }
    return new Intl.NumberFormat('pt-BR', {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(value);
}

/**
 * Formata data no formato pt-BR
 * @param {Date|string} date - Data a ser formatada
 * @param {boolean} includeTime - Incluir hora (padrão: false)
 * @returns {string} - Data formatada (ex: "24/01/2025" ou "24/01/2025 15:30")
 */
function formatDate(date, includeTime = false) {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
        return '';
    }
    
    const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    };
    
    if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
    }
    
    return new Intl.DateTimeFormat('pt-BR', options).format(dateObj);
}

/**
 * Formata telefone brasileiro
 * @param {string} phone - Telefone sem formatação
 * @returns {string} - Telefone formatado (ex: "(11) 99999-9999")
 */
function formatPhone(phone) {
    if (!phone) return '';
    
    // Remove tudo que não é número
    const numbers = phone.replace(/\D/g, '');
    
    // Celular com DDD
    if (numbers.length === 11) {
        return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    
    // Fixo com DDD
    if (numbers.length === 10) {
        return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    
    return phone;
}

/**
 * Remove caracteres especiais e espaços de input
 * @param {string} input - String a ser sanitizada
 * @returns {string} - String limpa
 */
function sanitizeInput(input) {
    if (!input) return '';
    return input.trim().replace(/[<>]/g, '');
}

/**
 * Formata número removendo formatação para cálculo
 * @param {string} value - Valor formatado (ex: "1.234,56")
 * @returns {number} - Número limpo
 */
function parseFormattedNumber(value) {
    if (!value) return 0;
    
    // Remove R$, pontos e substitui vírgula por ponto
    const cleaned = value
        .replace(/R\$\s*/g, '')
        .replace(/\./g, '')
        .replace(',', '.');
    
    return parseFloat(cleaned) || 0;
}

/**
 * Formata número para exibição pt-BR
 * @param {number} value - Número a ser formatado
 * @param {number} decimals - Casas decimais (padrão: 2)
 * @returns {string} - Número formatado
 */
function formatNumber(value, decimals = 2) {
    if (value === null || value === undefined || isNaN(value)) {
        return '0';
    }
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(value);
}

// ==================== VALIDAÇÃO ====================

/**
 * Valida email
 * @param {string} email - Email a ser validado
 * @returns {boolean} - true se válido
 */
function validateEmail(email) {
    if (!email) return false;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Valida telefone brasileiro
 * @param {string} phone - Telefone a ser validado
 * @returns {boolean} - true se válido
 */
function validatePhone(phone) {
    if (!phone) return false;
    const numbers = phone.replace(/\D/g, '');
    return numbers.length === 10 || numbers.length === 11;
}

/**
 * Valida CNPJ
 * @param {string} cnpj - CNPJ a ser validado
 * @returns {boolean} - true se válido
 */
function validateCNPJ(cnpj) {
    if (!cnpj) return false;
    
    cnpj = cnpj.replace(/\D/g, '');
    
    if (cnpj.length !== 14) return false;
    
    // Elimina CNPJs invalidos conhecidos
    if (/^(\d)\1+$/.test(cnpj)) return false;
    
    // Valida DVs
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }
    
    let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(0)) return false;
    
    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }
    
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(1)) return false;
    
    return true;
}

/**
 * Valida CPF
 * @param {string} cpf - CPF a ser validado
 * @returns {boolean} - true se válido
 */
function validateCPF(cpf) {
    if (!cpf) return false;
    
    cpf = cpf.replace(/\D/g, '');
    
    if (cpf.length !== 11) return false;
    
    // Elimina CPFs invalidos conhecidos
    if (/^(\d)\1+$/.test(cpf)) return false;
    
    // Valida 1o digito
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    let digito1 = resto === 10 || resto === 11 ? 0 : resto;
    
    if (digito1 !== parseInt(cpf.charAt(9))) return false;
    
    // Valida 2o digito
    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    let digito2 = resto === 10 || resto === 11 ? 0 : resto;
    
    if (digito2 !== parseInt(cpf.charAt(10))) return false;
    
    return true;
}

/**
 * Valida campo obrigatório
 * @param {any} value - Valor a ser validado
 * @returns {boolean} - true se válido
 */
function validateRequired(value) {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
}

// ==================== MATEMÁTICA ====================

/**
 * Calcula porcentagem de um valor
 * @param {number} value - Valor
 * @param {number} total - Total
 * @returns {number} - Porcentagem (0-1)
 */
function calculatePercentage(value, total) {
    if (!total || total === 0) return 0;
    return value / total;
}

/**
 * Soma array de números
 * @param {number[]} array - Array de números
 * @returns {number} - Soma total
 */
function sumArray(array) {
    if (!Array.isArray(array)) return 0;
    return array.reduce((sum, num) => sum + (Number(num) || 0), 0);
}

/**
 * Calcula média de array
 * @param {number[]} array - Array de números
 * @returns {number} - Média
 */
function averageArray(array) {
    if (!Array.isArray(array) || array.length === 0) return 0;
    return sumArray(array) / array.length;
}

/**
 * Arredonda para 2 casas decimais
 * @param {number} number - Número a arredondar
 * @returns {number} - Número arredondado
 */
function roundToTwo(number) {
    return Math.round((number + Number.EPSILON) * 100) / 100;
}

/**
 * Calcula valor com acréscimo percentual
 * @param {number} value - Valor base
 * @param {number} percentage - Porcentagem de acréscimo (ex: 0.15 para 15%)
 * @returns {number} - Valor com acréscimo
 */
function addPercentage(value, percentage) {
    return value * (1 + percentage);
}

/**
 * Calcula valor com desconto percentual
 * @param {number} value - Valor base
 * @param {number} percentage - Porcentagem de desconto (ex: 0.15 para 15%)
 * @returns {number} - Valor com desconto
 */
function subtractPercentage(value, percentage) {
    return value * (1 - percentage);
}

// ==================== MANIPULAÇÃO DE DADOS ====================

/**
 * Clone profundo de objeto
 * @param {object} obj - Objeto a ser clonado
 * @returns {object} - Clone do objeto
 */
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Mescla dois objetos
 * @param {object} obj1 - Objeto base
 * @param {object} obj2 - Objeto com novos valores
 * @returns {object} - Objeto mesclado
 */
function mergeObjects(obj1, obj2) {
    return { ...obj1, ...obj2 };
}

/**
 * Obtém valor aninhado de objeto
 * @param {object} obj - Objeto
 * @param {string} path - Caminho (ex: 'user.address.city')
 * @returns {any} - Valor encontrado ou undefined
 */
function getObjectValue(obj, path) {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
}

/**
 * Define valor aninhado em objeto
 * @param {object} obj - Objeto
 * @param {string} path - Caminho (ex: 'user.address.city')
 * @param {any} value - Valor a definir
 */
function setObjectValue(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
        if (!current[key]) current[key] = {};
        return current[key];
    }, obj);
    target[lastKey] = value;
}

// ==================== ARQUIVOS ====================

/**
 * Converte arquivo para base64
 * @param {File} file - Arquivo
 * @returns {Promise<string>} - String base64
 */
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * Converte base64 para Blob
 * @param {string} base64 - String base64
 * @param {string} mimeType - Tipo MIME
 * @returns {Blob} - Blob do arquivo
 */
function base64ToBlob(base64, mimeType) {
    const byteString = atob(base64.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    
    return new Blob([ab], { type: mimeType });
}

/**
 * Faz download de arquivo
 * @param {string} data - Dados do arquivo (base64 ou string)
 * @param {string} filename - Nome do arquivo
 * @param {string} mimeType - Tipo MIME
 */
function downloadFile(data, filename, mimeType) {
    let blob;
    
    if (data.startsWith('data:')) {
        blob = base64ToBlob(data, mimeType);
    } else {
        blob = new Blob([data], { type: mimeType });
    }
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Formata tamanho de arquivo
 * @param {number} bytes - Tamanho em bytes
 * @returns {string} - Tamanho formatado (ex: "1.5 MB")
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// ==================== DEBOUNCE/THROTTLE ====================

/**
 * Debounce - executa função após delay sem novas chamadas
 * @param {Function} func - Função a ser executada
 * @param {number} wait - Tempo de espera em ms
 * @returns {Function} - Função com debounce
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle - limita execuções por intervalo de tempo
 * @param {Function} func - Função a ser executada
 * @param {number} limit - Intervalo mínimo em ms
 * @returns {Function} - Função com throttle
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ==================== MISC ====================

/**
 * Gera UUID v4
 * @returns {string} - UUID único
 */
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Promise de delay
 * @param {number} ms - Milissegundos
 * @returns {Promise} - Promise que resolve após delay
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Copia texto para clipboard
 * @param {string} text - Texto a copiar
 * @returns {Promise<boolean>} - true se sucesso
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        // Fallback para navegadores antigos
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        return success;
    }
}

/**
 * Capitaliza primeira letra
 * @param {string} str - String
 * @returns {string} - String capitalizada
 */
function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Trunca string com reticências
 * @param {string} str - String
 * @param {number} length - Comprimento máximo
 * @returns {string} - String truncada
 */
function truncate(str, length) {
    if (!str || str.length <= length) return str;
    return str.substring(0, length) + '...';
}

/**
 * Remove acentos de string
 * @param {string} str - String
 * @returns {string} - String sem acentos
 */
function removeAccents(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Gera slug a partir de string
 * @param {string} str - String
 * @returns {string} - Slug
 */
function slugify(str) {
    return removeAccents(str)
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Verifica se é número
 * @param {any} value - Valor
 * @returns {boolean} - true se número
 */
function isNumber(value) {
    return typeof value === 'number' && !isNaN(value);
}

/**
 * Clamp - limita número entre min e max
 * @param {number} num - Número
 * @param {number} min - Mínimo
 * @param {number} max - Máximo
 * @returns {number} - Número limitado
 */
function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}

/**
 * Randomiza número entre min e max
 * @param {number} min - Mínimo
 * @param {number} max - Máximo
 * @returns {number} - Número aleatório
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Embaralha array
 * @param {Array} array - Array
 * @returns {Array} - Array embaralhado
 */
function shuffle(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatCurrency, formatPercentage, formatDate, formatPhone, sanitizeInput,
        parseFormattedNumber, formatNumber,
        validateEmail, validatePhone, validateCNPJ, validateCPF, validateRequired,
        calculatePercentage, sumArray, averageArray, roundToTwo,
        addPercentage, subtractPercentage,
        deepClone, mergeObjects, getObjectValue, setObjectValue,
        fileToBase64, base64ToBlob, downloadFile, formatFileSize,
        debounce, throttle,
        generateUUID, sleep, copyToClipboard, capitalize, truncate,
        removeAccents, slugify, isNumber, clamp, randomInt, shuffle
    };
}
