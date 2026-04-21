/* ==========================================
   QUIZ.JS - Lógica do Quiz de Qualificação
   Sistema: Equiparação Hospitalar
   ========================================== */

// ==================== PERGUNTAS DO QUIZ ====================

const QUIZ_QUESTIONS = [
    {
        id: 'regime',
        question: 'Qual é o regime tributário atual da sua clínica?',
        type: 'single',
        options: [
            { value: 'simples', text: 'Simples Nacional', description: 'Regime simplificado de tributação' },
            { value: 'presumido', text: 'Lucro Presumido', description: 'Já pode ter direito à equiparação!' },
            { value: 'real', text: 'Lucro Real', description: 'Necessita análise específica' },
            { value: 'nao_sei', text: 'Não sei', description: 'Pergunte ao seu contador' }
        ],
        educationalAlerts: {
            simples: { type: 'info', message: 'Se você está no Simples, precisará mudar para Lucro Presumido para aproveitar a equiparação. O benefício vale apenas daqui pra frente, sem recuperação de valores passados.' },
            presumido: { type: 'success', message: 'Ótimo! Você já está no regime correto. Se for elegível, pode aplicar a redução agora E recuperar os últimos 5 anos!' },
            real: { type: 'warning', message: 'No Lucro Real, o benefício existe mas é mais complexo. Recomendamos análise detalhada com um especialista.' },
            nao_sei: { type: 'warning', message: 'É importante saber seu regime tributário. Consulte seu contador antes de prosseguir com a análise.' }
        }
    },
    {
        id: 'especialidade',
        question: 'Qual é a especialidade principal da clínica?',
        type: 'single',
        options: [
            { value: 'implantodontia', text: 'Implantodontia', description: 'Alta elegibilidade' },
            { value: 'ortodontia', text: 'Ortodontia', description: 'Média elegibilidade' },
            { value: 'endodontia', text: 'Endodontia', description: 'Média elegibilidade' },
            { value: 'periodontia', text: 'Periodontia', description: 'Alta elegibilidade' },
            { value: 'cirurgia', text: 'Cirurgia Bucomaxilofacial', description: 'Alta elegibilidade' },
            { value: 'protese', text: 'Prótese Dentária', description: 'Média elegibilidade' },
            { value: 'estetica', text: 'Odontologia Estética', description: 'Baixa elegibilidade' },
            { value: 'clinica_geral', text: 'Clínica Geral', description: 'Baixa elegibilidade' },
            { value: 'outras', text: 'Outras especialidades', description: 'Necessita avaliação' }
        ],
        educationalAlerts: {
            implantodontia: { type: 'success', message: 'Implantodontia tem alta elegibilidade! Procedimentos de implantes são considerados serviços complexos elegíveis.' },
            ortodontia: { type: 'info', message: 'Ortodontia tem média elegibilidade. Depende da complexidade dos tratamentos realizados.' },
            endodontia: { type: 'info', message: 'Endodontias complexas podem ser elegíveis. Tratamentos de canal simples geralmente não são.' },
            periodontia: { type: 'success', message: 'Periodontias cirúrgicas têm alta elegibilidade! Cirurgias gengivais e enxertos são considerados elegíveis.' },
            cirurgia: { type: 'success', message: 'Cirurgia bucomaxilofacial tem altíssima elegibilidade! Todos os procedimentos cirúrgicos são considerados serviços hospitalares.' },
            protese: { type: 'info', message: 'Próteses sobre implantes têm boa elegibilidade. Próteses convencionais geralmente não são elegíveis.' },
            estetica: { type: 'warning', message: 'Procedimentos estéticos geralmente NÃO são elegíveis. Apenas procedimentos com indicação clínica/funcional.' },
            clinica_geral: { type: 'warning', message: 'Clínica geral tem baixa elegibilidade. Apenas consultas e procedimentos simples geralmente não são elegíveis.' },
            outras: { type: 'info', message: 'Cada especialidade precisa ser avaliada caso a caso. O importante é realizar procedimentos complexos que caracterizem serviços hospitalares.' }
        }
    },
    {
        id: 'faturamento',
        question: 'Qual é o faturamento bruto ANUAL da clínica?',
        type: 'single',
        options: [
            { value: '0-100k', text: 'Até R$ 100 mil/ano', description: 'Economia pode ser pequena' },
            { value: '100k-200k', text: 'R$ 100 mil a R$ 200 mil/ano', description: 'Vale avaliar' },
            { value: '200k-500k', text: 'R$ 200 mil a R$ 500 mil/ano', description: 'Boa economia esperada' },
            { value: '500k-1m', text: 'R$ 500 mil a R$ 1 milhão/ano', description: 'Economia significativa' },
            { value: '1m+', text: 'Acima de R$ 1 milhão/ano', description: 'Economia muito grande' }
        ],
        educationalAlerts: {
            '0-100k': { type: 'warning', message: 'Com faturamento baixo, a economia pode não compensar os custos de transição. Nossa calculadora vai mostrar se vale a pena.' },
            '100k-200k': { type: 'info', message: 'Nessa faixa, vale fazer os cálculos. Pode haver economia, mas precisa analisar os custos de implementação.' },
            '200k-500k': { type: 'success', message: 'Excelente faixa de faturamento! A economia tributária tende a ser significativa e compensa os custos.' },
            '500k-1m': { type: 'success', message: 'Com esse faturamento, a economia pode chegar a dezenas de milhares por ano. Recomendamos fortemente a análise!' },
            '1m+': { type: 'success', message: 'Alto faturamento! A economia pode ultrapassar R$ 100 mil/ano. Definitivamente vale a pena analisar!' }
        }
    },
    {
        id: 'procedimentos',
        question: 'Que tipo de procedimentos a clínica realiza?',
        type: 'single',
        options: [
            { value: 'cirurgicos', text: 'Principalmente Cirúrgicos', description: 'Alta elegibilidade' },
            { value: 'mistos', text: 'Cirúrgicos + Consultas', description: 'Elegibilidade parcial' },
            { value: 'consultas', text: 'Principalmente Consultas', description: 'Baixa elegibilidade' },
            { value: 'exames', text: 'Exames Diagnósticos', description: 'Depende do tipo' }
        ],
        educationalAlerts: {
            cirurgicos: { type: 'success', message: 'Perfeito! Procedimentos cirúrgicos são o core da equiparação hospitalar. Alta chance de elegibilidade!' },
            mistos: { type: 'info', message: 'Você pode separar as receitas! Aplica a redução apenas nos procedimentos elegíveis e tributa normalmente as consultas.' },
            consultas: { type: 'warning', message: 'Consultas odontológicas simples NÃO são elegíveis para equiparação. Apenas se houver procedimentos complexos associados.' },
            exames: { type: 'info', message: 'Exames complexos (endoscopia, cateterismo, etc) podem ser elegíveis. Exames simples geralmente não são.' }
        }
    },
    {
        id: 'estrutura',
        question: 'A clínica possui estrutura própria ou opera em estrutura de terceiros?',
        type: 'single',
        options: [
            { value: 'propria', text: 'Estrutura Própria', description: 'Equipamentos e instalações próprias' },
            { value: 'terceiros', text: 'Estrutura de Terceiros', description: 'Opera em hospitais/clínicas parceiras' },
            { value: 'mista', text: 'Mista (Própria + Terceiros)', description: 'Combina as duas estruturas' }
        ],
        educationalAlerts: {
            propria: { type: 'success', message: 'Estrutura própria facilita a comprovação. Lembre-se: não precisa ter leitos de internação!' },
            terceiros: { type: 'info', message: 'Sem problemas! O STJ confirmou que pode usar estrutura de terceiros. O que importa é realizar serviços hospitalares.' },
            mista: { type: 'success', message: 'Perfeito! Você pode aplicar a redução em todas as receitas de procedimentos hospitalares, independente de onde foram realizados.' }
        }
    },
    {
        id: 'alvara',
        question: 'A clínica possui alvará sanitário da ANVISA/Vigilância Sanitária?',
        type: 'single',
        options: [
            { value: 'sim', text: 'Sim, possui alvará', description: 'Requisito atendido' },
            { value: 'nao', text: 'Não possui', description: 'Necessário para equiparação' },
            { value: 'nao_sei', text: 'Não sei', description: 'Verifique com responsável' }
        ],
        educationalAlerts: {
            sim: { type: 'success', message: 'Ótimo! O alvará sanitário é um dos requisitos para comprovar que você presta serviços na área de saúde.' },
            nao: { type: 'danger', message: 'IMPORTANTE: O alvará sanitário é essencial para a equiparação. Você precisará obtê-lo antes de requerer o benefício.' },
            nao_sei: { type: 'warning', message: 'Verifique urgentemente! Todo estabelecimento de saúde precisa de alvará da ANVISA/Vigilância. É requisito obrigatório.' }
        }
    },
    {
        id: 'interesse',
        question: 'Qual é seu principal objetivo?',
        type: 'single',
        options: [
            { value: 'reduzir_impostos', text: 'Reduzir Impostos Atuais', description: 'Pagar menos a partir de agora' },
            { value: 'recuperar', text: 'Recuperar Impostos Passados', description: 'Restituição dos últimos 5 anos' },
            { value: 'ambos', text: 'Reduzir + Recuperar', description: 'Melhor das opções' },
            { value: 'avaliar', text: 'Apenas Avaliar', description: 'Quero ver se compensa' }
        ],
        educationalAlerts: {
            reduzir_impostos: { type: 'info', message: 'Se você já está no Lucro Presumido, além de reduzir daqui pra frente, você pode recuperar os últimos 5 anos!' },
            recuperar: { type: 'success', message: 'A recuperação só é possível se você JÁ estava no Lucro Presumido. Pode chegar a centenas de milhares de reais!' },
            ambos: { type: 'success', message: 'Perfeito! É exatamente isso que a equiparação oferece: redução imediata + recuperação dos últimos 5 anos (se já estava no Lucro Presumido).' },
            avaliar: { type: 'info', message: 'Excelente decisão! Nossa análise completa vai mostrar EXATAMENTE quanto você pode economizar, sem compromisso.' }
        }
    }
];

// ==================== ESTADO DO QUIZ ====================

let quizState = {
    currentQuestion: 0,
    answers: {},
    startTime: new Date()
};

// ==================== INICIALIZAÇÃO ====================

/**
 * Inicializa o quiz
 */
function initQuiz() {
    console.log('🎯 Iniciando Quiz de Qualificação');
    
    // Carrega dados salvos (se houver)
    const tempData = getTempData();
    if (tempData && tempData.quizAnswers) {
        quizState.answers = tempData.quizAnswers;
    }
    
    // Renderiza primeira pergunta
    renderQuestion();
    updateProgress();
}

// ==================== RENDERIZAÇÃO ====================

/**
 * Renderiza pergunta atual
 */
function renderQuestion() {
    const question = QUIZ_QUESTIONS[quizState.currentQuestion];
    const container = document.getElementById('question-container');
    
    if (!container) return;
    
    // Monta HTML
    let html = `
        <div class="question-container question-enter">
            <div class="question-number">
                Pergunta ${quizState.currentQuestion + 1} de ${QUIZ_QUESTIONS.length}
            </div>
            
            <h2 class="question-text">${question.question}</h2>
            
            <div class="options-container">
    `;
    
    // Renderiza opções
    question.options.forEach(option => {
        const isSelected = quizState.answers[question.id] === option.value;
        html += `
            <button 
                class="option-button ${isSelected ? 'selected' : ''}"
                onclick="selectOption('${question.id}', '${option.value}')"
            >
                <div class="option-radio"></div>
                <div>
                    <div class="option-text">${option.text}</div>
                    ${option.description ? `<div class="option-description">${option.description}</div>` : ''}
                </div>
            </button>
        `;
    });
    
    html += `
            </div>
            
            <div id="alert-container"></div>
        </div>
    `;
    
    container.innerHTML = html;
    
    // Se já tem resposta, mostra alerta
    if (quizState.answers[question.id]) {
        showEducationalAlert(question.id, quizState.answers[question.id]);
    }
    
    // Atualiza botões de navegação
    updateNavigationButtons();
}

/**
 * Atualiza barra de progresso
 */
function updateProgress() {
    const percentage = ((quizState.currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100;
    
    // Atualiza texto
    const progressText = document.getElementById('progress-text');
    if (progressText) {
        progressText.textContent = `Pergunta ${quizState.currentQuestion + 1} de ${QUIZ_QUESTIONS.length}`;
    }
    
    // Atualiza porcentagem
    const progressPercentage = document.getElementById('progress-percentage');
    if (progressPercentage) {
        progressPercentage.textContent = Math.round(percentage) + '%';
    }
    
    // Atualiza barra
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
        progressBar.style.width = percentage + '%';
    }
}

/**
 * Atualiza botões de navegação
 */
function updateNavigationButtons() {
    const btnBack = document.getElementById('btn-back');
    const btnNext = document.getElementById('btn-next');
    
    // Botão voltar
    if (btnBack) {
        btnBack.disabled = quizState.currentQuestion === 0;
        btnBack.style.display = quizState.currentQuestion === 0 ? 'none' : 'block';
    }
    
    // Botão próximo/concluir
    if (btnNext) {
        const currentQuestion = QUIZ_QUESTIONS[quizState.currentQuestion];
        const hasAnswer = quizState.answers[currentQuestion.id] !== undefined;
        
        btnNext.disabled = !hasAnswer;
        
        // Muda texto se for última pergunta
        const isLastQuestion = quizState.currentQuestion === QUIZ_QUESTIONS.length - 1;
        btnNext.innerHTML = isLastQuestion ? '🎉 Ver Resultado' : 'Próxima →';
    }
}

// ==================== INTERAÇÕES ====================

/**
 * Seleciona uma opção
 * @param {string} questionId - ID da pergunta
 * @param {string} value - Valor da opção
 */
function selectOption(questionId, value) {
    // Salva resposta
    quizState.answers[questionId] = value;
    
    // Salva temporariamente
    saveTempData({
        quizAnswers: quizState.answers,
        quizProgress: quizState.currentQuestion
    });
    
    // Atualiza visual
    renderQuestion();
    
    // Mostra alerta educativo
    showEducationalAlert(questionId, value);
    
    // Atualiza botões
    updateNavigationButtons();
    
    // Track evento
    if (typeof trackEvent !== 'undefined') {
        trackEvent('quiz_answer', {
            question: questionId,
            answer: value
        });
    }
}

/**
 * Mostra alerta educativo
 * @param {string} questionId - ID da pergunta
 * @param {string} value - Valor selecionado
 */
function showEducationalAlert(questionId, value) {
    const question = QUIZ_QUESTIONS.find(q => q.id === questionId);
    if (!question || !question.educationalAlerts) return;
    
    const alert = question.educationalAlerts[value];
    if (!alert) return;
    
    const container = document.getElementById('alert-container');
    if (!container) return;
    
    // Ícones por tipo
    const icons = {
        success: '✅',
        warning: '⚠️',
        danger: '❌',
        info: 'ℹ️'
    };
    
    container.innerHTML = `
        <div class="quiz-alert ${alert.type}">
            <div style="display: flex; align-items: start; gap: 0.75rem;">
                <div class="alert-icon">${icons[alert.type]}</div>
                <div>
                    <div class="alert-message">${alert.message}</div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Vai para próxima pergunta
 */
function nextQuestion() {
    if (quizState.currentQuestion < QUIZ_QUESTIONS.length - 1) {
        quizState.currentQuestion++;
        renderQuestion();
        updateProgress();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        // Última pergunta - finaliza quiz
        finishQuiz();
    }
}

/**
 * Volta para pergunta anterior
 */
function previousQuestion() {
    if (quizState.currentQuestion > 0) {
        quizState.currentQuestion--;
        renderQuestion();
        updateProgress();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// ==================== FINALIZAÇÃO ====================

/**
 * Finaliza o quiz e calcula resultado
 */
function finishQuiz() {
    // Mostra loading
    showLoading('Calculando seu resultado...');
    
    // Simula processamento
    setTimeout(() => {
        hideLoading();
        
        // Calcula score
        const score = calculateQuickScore(quizState.answers);
        
        // Salva lead
        const lead = {
            origin: 'quiz',
            timestamp: new Date().toISOString(),
            duration: Math.round((new Date() - quizState.startTime) / 1000), // segundos
            answers: quizState.answers,
            score: score.points,
            viability: score.level,
            elegibilidade: score.level
        };
        
        saveLead(lead);
        
        // Limpa dados temporários
        clearTempData();
        
        // Track evento
        if (typeof trackEvent !== 'undefined') {
            trackEvent('quiz_completed', {
                score: score.points,
                viability: score.level
            });
        }
        
        // Redireciona baseado no score
        redirectBasedOnScore(score);
        
    }, 1500);
}

/**
 * Calcula score rápido baseado nas respostas
 * @param {object} answers - Respostas do quiz
 * @returns {object} - { points, level, recommendation }
 */
function calculateQuickScore(answers) {
    let points = 0;
    let blockers = [];
    
    // 1. REGIME TRIBUTÁRIO (25 pontos)
    if (answers.regime === 'presumido') {
        points += 25;
    } else if (answers.regime === 'simples') {
        points += 15;
    } else if (answers.regime === 'real') {
        points += 10;
    } else {
        blockers.push('Regime tributário desconhecido');
    }
    
    // 2. ESPECIALIDADE (25 pontos)
    const highEligibility = ['implantodontia', 'cirurgia', 'periodontia'];
    const mediumEligibility = ['ortodontia', 'endodontia', 'protese'];
    
    if (highEligibility.includes(answers.especialidade)) {
        points += 25;
    } else if (mediumEligibility.includes(answers.especialidade)) {
        points += 15;
    } else {
        points += 5;
    }
    
    // 3. FATURAMENTO (20 pontos)
    if (answers.faturamento === '1m+') {
        points += 20;
    } else if (answers.faturamento === '500k-1m') {
        points += 18;
    } else if (answers.faturamento === '200k-500k') {
        points += 15;
    } else if (answers.faturamento === '100k-200k') {
        points += 10;
    } else {
        points += 5;
    }
    
    // 4. PROCEDIMENTOS (15 pontos)
    if (answers.procedimentos === 'cirurgicos') {
        points += 15;
    } else if (answers.procedimentos === 'mistos') {
        points += 12;
    } else if (answers.procedimentos === 'exames') {
        points += 8;
    } else {
        points += 3;
    }
    
    // 5. ALVARÁ (15 pontos)
    if (answers.alvara === 'sim') {
        points += 15;
    } else if (answers.alvara === 'nao') {
        points += 0;
        blockers.push('Sem alvará sanitário');
    } else {
        points += 5;
    }
    
    // Classifica
    let level, recommendation;
    
    if (blockers.length > 0) {
        level = 'BLOQUEADO';
        recommendation = 'Existem pendências que impedem a equiparação no momento: ' + blockers.join(', ');
    } else if (points >= 80) {
        level = 'ALTÍSSIMA';
        recommendation = 'Excelente! Sua clínica tem altíssima chance de se beneficiar. Faça a análise completa!';
    } else if (points >= 60) {
        level = 'ALTA';
        recommendation = 'Muito bom! Vale muito a pena fazer a análise completa para ver a economia exata.';
    } else if (points >= 40) {
        level = 'MÉDIA';
        recommendation = 'Há potencial, mas precisa de análise detalhada. Recomendamos a calculadora completa.';
    } else {
        level = 'BAIXA';
        recommendation = 'A elegibilidade parece baixa, mas vale confirmar com a calculadora completa.';
    }
    
    return {
        points: Math.round(points),
        level,
        recommendation,
        blockers
    };
}

/**
 * Redireciona baseado no score
 * @param {object} score - Score calculado
 */
function redirectBasedOnScore(score) {
    // Monta URL com parâmetros
    const params = new URLSearchParams({
        source: 'quiz',
        score: score.points,
        level: score.level
    });
    
    // Decide destino
    if (score.level === 'BLOQUEADO' || score.points < 30) {
        // Score muito baixo ou bloqueado
        window.location.href = `resultado.html?${params.toString()}&action=review`;
    } else if (score.points >= 60) {
        // Score alto - vai direto pra calculadora
        if (confirm(`🎉 Parabéns! Seu score é ${score.points}/100 (${score.level})!\n\n${score.recommendation}\n\nQuer fazer a análise COMPLETA agora?`)) {
            window.location.href = `calculadora.html?${params.toString()}`;
        } else {
            window.location.href = `resultado.html?${params.toString()}`;
        }
    } else {
        // Score médio - mostra resultado
        window.location.href = `resultado.html?${params.toString()}`;
    }
}

// ==================== AUTO-INIT ====================

// Inicializa quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initQuiz);
} else {
    initQuiz();
}

// Exporta funções para uso global
window.selectOption = selectOption;
window.nextQuestion = nextQuestion;
window.previousQuestion = previousQuestion;
window.calculateQuickScore = calculateQuickScore;
