/* ==========================================
   CALCULATOR.JS - Lógica da Calculadora
   Sistema: Equiparação Hospitalar - DENTISTAS
   ========================================== */

// ==================== ESPECIALIDADES ODONTOLÓGICAS ====================

const ESPECIALIDADES_ODONTOLOGIA = [
    { value: 'implantodontia', label: 'Implantodontia', elegibilidade: 'alta' },
    { value: 'ortodontia', label: 'Ortodontia', elegibilidade: 'media' },
    { value: 'endodontia', label: 'Endodontia', elegibilidade: 'media' },
    { value: 'periodontia', label: 'Periodontia', elegibilidade: 'alta' },
    { value: 'cirurgia', label: 'Cirurgia Bucomaxilofacial', elegibilidade: 'alta' },
    { value: 'protese', label: 'Prótese Dentária', elegibilidade: 'media' },
    { value: 'estetica', label: 'Odontologia Estética', elegibilidade: 'baixa' },
    { value: 'clinica_geral', label: 'Clínica Geral', elegibilidade: 'baixa' },
    { value: 'odontopediatria', label: 'Odontopediatria', elegibilidade: 'baixa' },
    { value: 'outros', label: 'Outras Especialidades', elegibilidade: 'media' }
];

// ==================== ESTADO DA CALCULADORA ====================

let calculatorState = {
    currentStep: 0,
    totalSteps: 5,
    formData: {},
    validation: {},
    startTime: new Date()
};

// ==================== INICIALIZAÇÃO ====================

/**
 * Inicializa a calculadora
 */
function initCalculator() {
    console.log('🧮 Iniciando Calculadora Equiparação Hospitalar - DENTISTAS');
    
    // Carrega dados do quiz (se vier de lá)
    loadQuizData();
    
    // Renderiza step 1
    renderStep(1);
    updateStepsIndicator();
    
    // Configura navegação
    setupNavigation();
    
    // Popula selects
    populateSpecialtySelect();
}

/**
 * Carrega dados do quiz se existir
 */
function loadQuizData() {
    const urlParams = new URLSearchParams(window.location.search);
    const source = urlParams.get('source');
    
    if (source === 'quiz') {
        const tempData = getTempData();
        if (tempData && tempData.quizAnswers) {
            // Mapeia respostas do quiz para o formulário
            calculatorState.formData.regime = tempData.quizAnswers.regime;
            calculatorState.formData.especialidade = tempData.quizAnswers.especialidade;
            
            console.log('✅ Dados do quiz carregados:', tempData.quizAnswers);
        }
    }
}

// ==================== RENDER STEPS ====================

/**
 * Renderiza step atual
 * @param {number} stepNumber - Número do step (1-5)
 */
function renderStep(stepNumber) {
    // Esconde todos os steps
    document.querySelectorAll('.step-content').forEach(step => {
        step.classList.remove('active');
    });
    
    // Mostra step atual
    const currentStep = document.getElementById(`step-${stepNumber}`);
    if (currentStep) {
        currentStep.classList.add('active');
    }
    
    // Atualiza estado
    calculatorState.currentStep = stepNumber;
    
    // Preenche campos se já tiver dados
    fillFieldsFromState(stepNumber);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Preenche campos com dados salvos
 * @param {number} stepNumber - Número do step
 */
function fillFieldsFromState(stepNumber) {
    const data = calculatorState.formData;
    
    switch(stepNumber) {
        case 1:
            if (data.nome) document.getElementById('nome').value = data.nome;
            if (data.email) document.getElementById('email').value = data.email;
            if (data.telefone) document.getElementById('telefone').value = data.telefone;
            if (data.clinica) document.getElementById('clinica').value = data.clinica;
            break;
            
        case 2:
            if (data.regime) document.getElementById('regime').value = data.regime;
            if (data.especialidade) document.getElementById('especialidade').value = data.especialidade;
            if (data.faturamento_anual) document.getElementById('faturamento_anual').value = data.faturamento_anual;
            if (data.folha_pagamento) document.getElementById('folha_pagamento').value = data.folha_pagamento;
            break;
            
        case 3:
            if (data.procedimentos_tipo) {
                document.getElementById('procedimentos_tipo').value = data.procedimentos_tipo;
            }
            if (data.percentual_eligivel !== undefined) {
                document.getElementById('percentual_eligivel').value = data.percentual_eligivel;
                updateRangeValue('percentual_eligivel', data.percentual_eligivel);
            }
            if (data.iss_aliquota !== undefined) {
                document.getElementById('iss_aliquota').value = data.iss_aliquota;
                updateRangeValue('iss_aliquota', data.iss_aliquota);
            }
            break;
            
        case 4:
            if (data.estrutura) document.getElementById('estrutura').value = data.estrutura;
            if (data.alvara) {
                const alvaraRadio = document.querySelector(`input[name="alvara"][value="${data.alvara}"]`);
                if (alvaraRadio) alvaraRadio.checked = true;
            }
            if (data.contador) {
                const contadorRadio = document.querySelector(`input[name="contador"][value="${data.contador}"]`);
                if (contadorRadio) contadorRadio.checked = true;
            }
            break;
            
        case 5:
            renderSummary();
            break;
    }
}

/**
 * Atualiza indicador de steps
 */
function updateStepsIndicator() {
    for (let i = 1; i <= calculatorState.totalSteps; i++) {
        const stepItem = document.getElementById(`step-indicator-${i}`);
        if (!stepItem) continue;
        
        stepItem.classList.remove('active', 'completed');
        
        if (i < calculatorState.currentStep) {
            stepItem.classList.add('completed');
        } else if (i === calculatorState.currentStep) {
            stepItem.classList.add('active');
        }
    }
}

// ==================== NAVEGAÇÃO ====================

/**
 * Configura botões de navegação
 */
function setupNavigation() {
    // Botão próximo
    const btnNext = document.getElementById('btn-next');
    if (btnNext) {
        btnNext.addEventListener('click', nextStep);
    }
    
    // Botão voltar
    const btnBack = document.getElementById('btn-back');
    if (btnBack) {
        btnBack.addEventListener('click', previousStep);
    }
    
    // Botão calcular
    const btnCalculate = document.getElementById('btn-calculate');
    if (btnCalculate) {
        btnCalculate.addEventListener('click', calculateResults);
    }
}

/**
 * Vai para próximo step
 */
function nextStep() {
    // Valida step atual
    if (!validateCurrentStep()) {
        showNotification('Por favor, preencha todos os campos obrigatórios corretamente', 'warning');
        return;
    }
    
    // Salva dados do step atual
    saveCurrentStepData();
    
    // Vai para próximo step
    if (calculatorState.currentStep < calculatorState.totalSteps) {
        renderStep(calculatorState.currentStep + 1);
        updateStepsIndicator();
    }
}

/**
 * Volta para step anterior
 */
function previousStep() {
    if (calculatorState.currentStep > 1) {
        renderStep(calculatorState.currentStep - 1);
        updateStepsIndicator();
    }
}

// ==================== VALIDAÇÃO ====================

/**
 * Valida step atual
 * @returns {boolean} - true se válido
 */
function validateCurrentStep() {
    const step = calculatorState.currentStep;
    let isValid = true;
    
    // Limpa erros anteriores
    document.querySelectorAll('.field-error').forEach(e => e.remove());
    document.querySelectorAll('.error').forEach(e => e.classList.remove('error'));
    
    switch(step) {
        case 1:
            isValid = validateStep1();
            break;
        case 2:
            isValid = validateStep2();
            break;
        case 3:
            isValid = validateStep3();
            break;
        case 4:
            isValid = validateStep4();
            break;
    }
    
    return isValid;
}

/**
 * Valida Step 1 - Dados Pessoais
 */
function validateStep1() {
    let isValid = true;
    
    // Nome
    const nome = document.getElementById('nome');
    if (!validateRequired(nome.value)) {
        showFieldError(nome, 'Nome é obrigatório');
        isValid = false;
    }
    
    // Email
    const email = document.getElementById('email');
    if (!validateRequired(email.value)) {
        showFieldError(email, 'Email é obrigatório');
        isValid = false;
    } else if (!validateEmail(email.value)) {
        showFieldError(email, 'Email inválido');
        isValid = false;
    }
    
    // Telefone
    const telefone = document.getElementById('telefone');
    if (!validateRequired(telefone.value)) {
        showFieldError(telefone, 'Telefone é obrigatório');
        isValid = false;
    } else if (!validatePhone(telefone.value)) {
        showFieldError(telefone, 'Telefone inválido');
        isValid = false;
    }
    
    // Clínica
    const clinica = document.getElementById('clinica');
    if (!validateRequired(clinica.value)) {
        showFieldError(clinica, 'Nome da clínica é obrigatório');
        isValid = false;
    }
    
    return isValid;
}

/**
 * Valida Step 2 - Dados Financeiros
 */
function validateStep2() {
    let isValid = true;
    
    // Regime
    const regime = document.getElementById('regime');
    if (!validateRequired(regime.value)) {
        showFieldError(regime, 'Regime tributário é obrigatório');
        isValid = false;
    }
    
    // Especialidade
    const especialidade = document.getElementById('especialidade');
    if (!validateRequired(especialidade.value)) {
        showFieldError(especialidade, 'Especialidade é obrigatória');
        isValid = false;
    }
    
    // Faturamento
    const faturamento = document.getElementById('faturamento_anual');
    if (!validateRequired(faturamento.value)) {
        showFieldError(faturamento, 'Faturamento anual é obrigatório');
        isValid = false;
    } else {
        const valor = parseFormattedNumber(faturamento.value);
        if (valor <= 0) {
            showFieldError(faturamento, 'Faturamento deve ser maior que zero');
            isValid = false;
        }
    }
    
    // Folha de pagamento
    const folha = document.getElementById('folha_pagamento');
    if (!validateRequired(folha.value)) {
        showFieldError(folha, 'Folha de pagamento é obrigatória');
        isValid = false;
    } else {
        const valor = parseFormattedNumber(folha.value);
        if (valor < 0) {
            showFieldError(folha, 'Folha de pagamento inválida');
            isValid = false;
        }
    }
    
    return isValid;
}

/**
 * Valida Step 3 - Procedimentos
 */
function validateStep3() {
    let isValid = true;
    
    // Tipo de procedimentos
    const tipo = document.getElementById('procedimentos_tipo');
    if (!validateRequired(tipo.value)) {
        showFieldError(tipo, 'Selecione o tipo de procedimentos');
        isValid = false;
    }
    
    return isValid;
}

/**
 * Valida Step 4 - Organização
 */
function validateStep4() {
    let isValid = true;
    
    // Estrutura
    const estrutura = document.getElementById('estrutura');
    if (!validateRequired(estrutura.value)) {
        showFieldError(estrutura, 'Selecione o tipo de estrutura');
        isValid = false;
    }
    
    // Alvará
    const alvara = document.querySelector('input[name="alvara"]:checked');
    if (!alvara) {
        const alvaraGroup = document.querySelector('.radio-group');
        showFieldError(alvaraGroup, 'Informe se possui alvará');
        isValid = false;
    }
    
    // Contador
    const contador = document.querySelector('input[name="contador"]:checked');
    if (!contador) {
        const contadorGroup = document.querySelectorAll('.radio-group')[1];
        showFieldError(contadorGroup, 'Informe se possui contador');
        isValid = false;
    }
    
    return isValid;
}

/**
 * Mostra erro no campo
 * @param {HTMLElement} field - Campo
 * @param {string} message - Mensagem
 */
function showFieldError(field, message) {
    field.classList.add('error');
    
    const error = document.createElement('span');
    error.className = 'field-error';
    error.textContent = message;
    
    if (field.parentNode.classList.contains('input-wrapper')) {
        field.parentNode.parentNode.appendChild(error);
    } else {
        field.parentNode.appendChild(error);
    }
}

// ==================== SALVAR DADOS ====================

/**
 * Salva dados do step atual
 */
function saveCurrentStepData() {
    const step = calculatorState.currentStep;
    
    switch(step) {
        case 1:
            calculatorState.formData.nome = document.getElementById('nome').value;
            calculatorState.formData.email = document.getElementById('email').value;
            calculatorState.formData.telefone = document.getElementById('telefone').value;
            calculatorState.formData.clinica = document.getElementById('clinica').value;
            break;
            
        case 2:
            calculatorState.formData.regime = document.getElementById('regime').value;
            calculatorState.formData.especialidade = document.getElementById('especialidade').value;
            calculatorState.formData.faturamento_anual = parseFormattedNumber(document.getElementById('faturamento_anual').value);
            calculatorState.formData.folha_pagamento = parseFormattedNumber(document.getElementById('folha_pagamento').value);
            break;
            
        case 3:
            calculatorState.formData.procedimentos_tipo = document.getElementById('procedimentos_tipo').value;
            calculatorState.formData.percentual_eligivel = parseFloat(document.getElementById('percentual_eligivel').value) / 100;
            calculatorState.formData.iss_aliquota = parseFloat(document.getElementById('iss_aliquota').value) / 100;
            break;
            
        case 4:
            calculatorState.formData.estrutura = document.getElementById('estrutura').value;
            
            const alvara = document.querySelector('input[name="alvara"]:checked');
            calculatorState.formData.alvara = alvara ? alvara.value : null;
            
            const contador = document.querySelector('input[name="contador"]:checked');
            calculatorState.formData.contador = contador ? contador.value : null;
            break;
    }
    
    // Salva temporariamente
    saveTempData({
        calculatorData: calculatorState.formData,
        calculatorStep: calculatorState.currentStep
    });
}

// ==================== CÁLCULOS ====================

/**
 * Calcula resultados finais
 */
function calculateResults() {
    showLoading('Calculando economia tributária...');
    
    setTimeout(() => {
        try {
            const data = calculatorState.formData;
            
            // 1. Simples Nacional
            const simples = calculateSimplesNacional(
                data.faturamento_anual,
                data.folha_pagamento
            );
            
            // 2. Lucro Presumido
            const presumido = calculateLucroPresumido(
                data.faturamento_anual,
                data.percentual_eligivel,
                data.iss_aliquota
            );
            
            // 3. Comparação
            const comparison = compareRegimes(
                simples,
                presumido,
                300, // Custo contador Simples (exemplo)
                700  // Custo contador Presumido (exemplo)
            );
            
            // 4. Score de viabilidade
            const viability = calculateViabilityScore(
                comparison,
                data.especialidade,
                {
                    temDocumentos: false,
                    temContador: data.contador === 'sim',
                    temProcessos: data.alvara === 'sim'
                }
            );
            
            // Salva lead
            const lead = {
                origin: 'calculadora',
                timestamp: new Date().toISOString(),
                duration: Math.round((new Date() - calculatorState.startTime) / 1000),
                ...data,
                simples,
                presumido,
                comparison,
                score: viability.score,
                viability: viability.nivel,
                elegibilidade: viability.nivel
            };
            
            saveLead(lead);
            
            hideLoading();
            
            // Redireciona para resultado
            const params = new URLSearchParams({
                source: 'calculator',
                score: viability.score,
                level: viability.nivel
            });
            
            window.location.href = `resultado.html?${params.toString()}`;
            
        } catch (error) {
            hideLoading();
            console.error('Erro ao calcular:', error);
            showNotification('Erro ao calcular resultados. Por favor, tente novamente.', 'danger');
        }
    }, 2000);
}

/**
 * Renderiza sumário final
 */
function renderSummary() {
    const data = calculatorState.formData;
    const container = document.getElementById('summary-content');
    
    if (!container) return;
    
    container.innerHTML = `
        <div class="summary-grid">
            <div class="summary-card">
                <div class="summary-label">Clínica</div>
                <div class="summary-value">${sanitizeInput(data.clinica)}</div>
            </div>
            
            <div class="summary-card">
                <div class="summary-label">Especialidade</div>
                <div class="summary-value">${getSpecialtyLabel(data.especialidade)}</div>
            </div>
            
            <div class="summary-card">
                <div class="summary-label">Regime Atual</div>
                <div class="summary-value">${getRegimeLabel(data.regime)}</div>
            </div>
            
            <div class="summary-card">
                <div class="summary-label">Faturamento Anual</div>
                <div class="summary-value">${formatCurrency(data.faturamento_anual)}</div>
            </div>
            
            <div class="summary-card">
                <div class="summary-label">Folha de Pagamento</div>
                <div class="summary-value">${formatCurrency(data.folha_pagamento)}</div>
                <div class="summary-help">Anual</div>
            </div>
            
            <div class="summary-card">
                <div class="summary-label">Receitas Elegíveis</div>
                <div class="summary-value">${formatPercentage(data.percentual_eligivel)}</div>
                <div class="summary-help">Procedimentos hospitalares</div>
            </div>
        </div>
        
        <div class="info-box success">
            <div class="info-box-title">✅ Pronto para calcular!</div>
            <div class="info-box-text">
                Vamos calcular a economia exata da sua clínica com base nos dados informados.
                O cálculo leva em conta Simples Nacional vs Lucro Presumido com Equiparação Hospitalar.
            </div>
        </div>
    `;
}

// ==================== HELPERS ====================

/**
 * Popula select de especialidades
 */
function populateSpecialtySelect() {
    const select = document.getElementById('especialidade');
    if (!select) return;
    
    ESPECIALIDADES_ODONTOLOGIA.forEach(esp => {
        const option = document.createElement('option');
        option.value = esp.value;
        option.textContent = esp.label;
        select.appendChild(option);
    });
}

/**
 * Retorna label da especialidade
 */
function getSpecialtyLabel(value) {
    const esp = ESPECIALIDADES_ODONTOLOGIA.find(e => e.value === value);
    return esp ? esp.label : value;
}

/**
 * Retorna label do regime
 */
function getRegimeLabel(value) {
    const labels = {
        'simples': 'Simples Nacional',
        'presumido': 'Lucro Presumido',
        'real': 'Lucro Real',
        'nao_sei': 'Não sei'
    };
    return labels[value] || value;
}

/**
 * Atualiza valor do range
 */
function updateRangeValue(id, value) {
    const display = document.getElementById(`${id}-value`);
    if (display) {
        display.textContent = value + '%';
    }
}

/**
 * Formata campo de moeda
 */
function formatCurrencyField(input) {
    let value = input.value.replace(/\D/g, '');
    value = (parseFloat(value) / 100).toFixed(2);
    input.value = formatCurrency(parseFloat(value));
}

/**
 * Formata campo de telefone
 */
function formatPhoneField(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length <= 10) {
        value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
        value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    input.value = value;
}

// ==================== EVENT LISTENERS ====================

// Auto-format moeda
document.addEventListener('input', (e) => {
    if (e.target.id === 'faturamento_anual' || e.target.id === 'folha_pagamento') {
        formatCurrencyField(e.target);
    }
    
    if (e.target.id === 'telefone') {
        formatPhoneField(e.target);
    }
});

// Range sliders
document.addEventListener('input', (e) => {
    if (e.target.classList.contains('range-slider')) {
        updateRangeValue(e.target.id, e.target.value);
    }
});

// ==================== AUTO-INIT ====================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCalculator);
} else {
    initCalculator();
}

// Exporta funções
window.nextStep = nextStep;
window.previousStep = previousStep;
window.calculateResults = calculateResults;
