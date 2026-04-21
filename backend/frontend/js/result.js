/* ==========================================
   RESULT.JS - Lógica da Página de Resultado
   Sistema: Equiparação Hospitalar - DENTISTAS
   ========================================== */

// ==================== ESTADO ====================

let resultState = {
    source: null,
    score: 0,
    level: null,
    leadData: null
};

// ==================== INICIALIZAÇÃO ====================

/**
 * Inicializa página de resultado
 */
function initResult() {
    console.log('📊 Iniciando Página de Resultado');
    
    // Carrega parâmetros da URL
    loadUrlParams();
    
    // Carrega último lead
    loadLastLead();
    
    // Renderiza resultado
    renderResult();
}

/**
 * Carrega parâmetros da URL
 */
function loadUrlParams() {
    const params = new URLSearchParams(window.location.search);
    
    resultState.source = params.get('source');
    resultState.score = parseInt(params.get('score')) || 0;
    resultState.level = params.get('level') || 'MÉDIA';
    
    console.log('📍 Parâmetros:', resultState);
}

/**
 * Carrega último lead salvo
 */
function loadLastLead() {
    const leads = getAllLeads();
    if (leads && leads.length > 0) {
        resultState.leadData = leads[0]; // Mais recente
        console.log('✅ Lead carregado:', resultState.leadData);
    }
}

// ==================== RENDERIZAÇÃO ====================

/**
 * Renderiza resultado completo
 */
function renderResult() {
    // Score Hero
    renderScoreHero();
    
    // Se vier da calculadora, mostra comparação completa
    if (resultState.source === 'calculator' && resultState.leadData) {
        renderComparison();
        renderSavingsHighlight();
    }
    
    // Próximos passos
    renderNextSteps();
    
    // CTA
    renderCTA();
}

/**
 * Renderiza hero do score
 */
function renderScoreHero() {
    const container = document.getElementById('score-hero');
    if (!container) return;
    
    const { score, level } = resultState;
    
    // Define cor baseado no nível
    const colors = {
        'ALTÍSSIMA': '#10b981',
        'ALTA': '#059669',
        'MÉDIA': '#f59e0b',
        'BAIXA': '#f97316',
        'NÃO VIÁVEL': '#ef4444',
        'BLOQUEADO': '#ef4444'
    };
    
    const color = colors[level] || '#6b7280';
    
    // Define mensagem
    const messages = {
        'ALTÍSSIMA': 'Excelente! Sua clínica tem altíssimo potencial de economia!',
        'ALTA': 'Muito bom! Vale muito a pena fazer a transição!',
        'MÉDIA': 'Há potencial de economia, mas requer análise detalhada.',
        'BAIXA': 'A viabilidade parece baixa, mas vale confirmar os detalhes.',
        'NÃO VIÁVEL': 'Com base nos dados, a equiparação pode não valer a pena no momento.',
        'BLOQUEADO': 'Existem pendências que impedem a equiparação no momento.'
    };
    
    const message = messages[level] || 'Análise concluída!';
    
    container.innerHTML = `
        <div class="score-badge">
            Resultado da Análise
        </div>
        
        <div class="score-main">
            <div class="score-number" style="color: ${color};">${score}</div>
            <div class="score-level">${level}</div>
            <div class="score-description">${message}</div>
        </div>
    `;
}

/**
 * Renderiza comparação de regimes
 */
function renderComparison() {
    const container = document.getElementById('comparison-container');
    if (!container || !resultState.leadData) return;
    
    const { simples, presumido, comparison } = resultState.leadData;
    
    container.innerHTML = `
        <h2 style="font-size: 2rem; font-weight: bold; text-align: center; margin-bottom: 2rem;">
            Comparação de Regimes
        </h2>
        
        <div class="comparison-grid">
            <!-- REGIME ATUAL -->
            <div class="regime-card current">
                <div class="regime-header">
                    <div class="regime-title">Regime Atual</div>
                    <span class="regime-badge current-badge">Atual</span>
                </div>
                
                <div class="regime-value">${formatCurrency(comparison.atual.total)}</div>
                <div class="regime-label">Total de impostos + contador (anual)</div>
                
                <div class="regime-details">
                    <div class="detail-row">
                        <span class="detail-label">Regime:</span>
                        <span class="detail-value">${comparison.atual.regime}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Alíquota Efetiva:</span>
                        <span class="detail-value">${formatPercentage(comparison.atual.aliquota)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Impostos:</span>
                        <span class="detail-value">${formatCurrency(comparison.atual.impostos)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Contador:</span>
                        <span class="detail-value">${formatCurrency(comparison.atual.contador)}</span>
                    </div>
                </div>
            </div>
            
            <!-- REGIME PROPOSTO -->
            <div class="regime-card recommended">
                <div class="regime-header">
                    <div class="regime-title">Com Equiparação</div>
                    <span class="regime-badge recommended-badge">Recomendado</span>
                </div>
                
                <div class="regime-value">${formatCurrency(comparison.proposto.total)}</div>
                <div class="regime-label">Total de impostos + contador (anual)</div>
                
                <div class="regime-details">
                    <div class="detail-row">
                        <span class="detail-label">Regime:</span>
                        <span class="detail-value">${comparison.proposto.regime}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Alíquota Efetiva:</span>
                        <span class="detail-value">${formatPercentage(comparison.proposto.aliquota)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Receitas Elegíveis:</span>
                        <span class="detail-value">${formatPercentage(comparison.proposto.percentualElegivel)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Impostos:</span>
                        <span class="detail-value">${formatCurrency(comparison.proposto.impostos)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Contador:</span>
                        <span class="detail-value">${formatCurrency(comparison.proposto.contador)}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Renderiza destaque de economia
 */
function renderSavingsHighlight() {
    const container = document.getElementById('savings-highlight');
    if (!container || !resultState.leadData) return;
    
    const { comparison } = resultState.leadData;
    
    container.innerHTML = `
        <div class="savings-icon">💰</div>
        
        <div class="savings-amount">${formatCurrency(comparison.economia.anual)}</div>
        <div class="savings-period">Economia Anual Estimada</div>
        
        <p style="font-size: 1.125rem; opacity: 0.95; max-width: 600px; margin: 0 auto 2rem;">
            Isso representa uma redução de <strong>${formatPercentage(comparison.economia.percentual)}</strong> nos seus impostos!
        </p>
        
        <div class="savings-breakdown">
            <div class="savings-item">
                <div class="savings-item-value">${formatCurrency(comparison.economia.mensal)}</div>
                <div class="savings-item-label">Por Mês</div>
            </div>
            
            <div class="savings-item">
                <div class="savings-item-value">${formatCurrency(comparison.recuperacao5Anos)}</div>
                <div class="savings-item-label">Recuperação 5 Anos</div>
            </div>
            
            <div class="savings-item">
                <div class="savings-item-value">${formatPercentage(comparison.economia.percentual)}</div>
                <div class="savings-item-label">Redução de Impostos</div>
            </div>
        </div>
    `;
}

/**
 * Renderiza próximos passos
 */
function renderNextSteps() {
    const container = document.getElementById('next-steps');
    if (!container) return;
    
    const { level, leadData } = resultState;
    
    // Define próximos passos baseado no nível
    let steps = [];
    
    if (level === 'ALTÍSSIMA' || level === 'ALTA') {
        steps = [
            {
                title: 'Entre em Contato Conosco',
                description: 'Fale com nossos especialistas para validar os cálculos e iniciar o processo.'
            },
            {
                title: 'Análise Documental',
                description: 'Verificamos se sua clínica atende todos os requisitos legais da equiparação.'
            },
            {
                title: 'Implementação',
                description: 'Adequamos a contabilidade e, se necessário, entramos com processo judicial.'
            },
            {
                title: 'Economia Garantida',
                description: 'Você começa a pagar menos impostos e pode recuperar valores dos últimos 5 anos!'
            }
        ];
    } else if (level === 'MÉDIA') {
        steps = [
            {
                title: 'Consulte um Especialista',
                description: 'Recomendamos uma análise mais detalhada com um advogado tributarista.'
            },
            {
                title: 'Organize a Documentação',
                description: 'Reúna contratos, notas fiscais, declarações e alvarás da clínica.'
            },
            {
                title: 'Avalie Cenários',
                description: 'Considere crescimento futuro e mudanças nos procedimentos realizados.'
            }
        ];
    } else {
        steps = [
            {
                title: 'Resolva Pendências',
                description: 'Se faltou alvará ou documentação, providencie antes de prosseguir.'
            },
            {
                title: 'Reavalie no Futuro',
                description: 'Se o faturamento crescer ou você mudar o mix de procedimentos, refaça a análise.'
            },
            {
                title: 'Consulte seu Contador',
                description: 'Pode haver outras oportunidades de otimização tributária para sua clínica.'
            }
        ];
    }
    
    let stepsHTML = '';
    steps.forEach((step, index) => {
        stepsHTML += `
            <div class="step-item-result">
                <div class="step-number-result">${index + 1}</div>
                <div class="step-content-result">
                    <div class="step-title-result">${step.title}</div>
                    <div class="step-description-result">${step.description}</div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = `
        <h2 class="next-steps-title">Próximos Passos</h2>
        <div class="steps-list">
            ${stepsHTML}
        </div>
    `;
}

/**
 * Renderiza CTA
 */
function renderCTA() {
    const container = document.getElementById('result-cta');
    if (!container) return;
    
    const { level } = resultState;
    
    let ctaText = '';
    let ctaButtons = '';
    
    if (level === 'ALTÍSSIMA' || level === 'ALTA') {
        ctaText = 'Quer dar o próximo passo e começar a economizar?';
        ctaButtons = `
            <a href="mailto:contato@conversecommaria.com?subject=Interesse em Equiparação Hospitalar" class="btn btn-lg" style="background: white; color: var(--accent-dark);">
                📧 Falar com Especialista
            </a>
            <button class="btn btn-lg" style="background: rgba(255,255,255,0.2); border: 2px solid white; color: white;" onclick="window.print()">
                📄 Imprimir Relatório
            </button>
        `;
    } else {
        ctaText = 'Tem dúvidas? Entre em contato conosco!';
        ctaButtons = `
            <a href="mailto:contato@conversecommaria.com?subject=Dúvida sobre Equiparação Hospitalar" class="btn btn-lg" style="background: white; color: var(--accent-dark);">
                📧 Enviar Dúvida
            </a>
            <a href="index.html" class="btn btn-lg" style="background: rgba(255,255,255,0.2); border: 2px solid white; color: white;">
                ← Voltar ao Início
            </a>
        `;
    }
    
    container.innerHTML = `
        <h2 class="cta-title">E Agora?</h2>
        <p class="cta-text">${ctaText}</p>
        <div class="cta-buttons">
            ${ctaButtons}
        </div>
    `;
}

// ==================== AUTO-INIT ====================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initResult);
} else {
    initResult();
}
