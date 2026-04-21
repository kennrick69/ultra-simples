/* ==========================================
   CALCULATIONS.JS - Lógica de Cálculos Tributários
   Sistema: Equiparação Hospitalar
   ========================================== */

// ==================== CONSTANTES DE ALÍQUOTAS ====================

const ALIQUOTAS = {
    // Lucro Presumido com Equiparação Hospitalar
    LUCRO_PRESUMIDO: {
        ELEGIVEL: {
            IRPJ_BASE: 0.08,        // Base de cálculo 8%
            CSLL_BASE: 0.12,        // Base de cálculo 12%
            IRPJ_ALIQUOTA: 0.15,    // 15% sobre a base
            CSLL_ALIQUOTA: 0.09,    // 9% sobre a base
            PIS: 0.0065,            // 0,65%
            COFINS: 0.03            // 3%
        },
        NAO_ELEGIVEL: {
            IRPJ_BASE: 0.32,        // Base de cálculo 32%
            CSLL_BASE: 0.32,        // Base de cálculo 32%
            IRPJ_ALIQUOTA: 0.15,    // 15% sobre a base
            CSLL_ALIQUOTA: 0.09,    // 9% sobre a base
            PIS: 0.0065,            // 0,65%
            COFINS: 0.03            // 3%
        }
    },
    
    // ISS varia por município
    ISS: {
        MIN: 0.02,      // 2%
        MAX: 0.05,      // 5%
        DEFAULT: 0.03   // 3% (média)
    }
};

// Tabela Simples Nacional - Anexo V (Serviços)
const TABELA_SIMPLES_ANEXO_V = [
    { ate: 180000, aliquota: 0.155, deducao: 0, fatorR: { alto: 0.155, baixo: 0.155 } },
    { ate: 360000, aliquota: 0.18, deducao: 4500, fatorR: { alto: 0.18, baixo: 0.18 } },
    { ate: 720000, aliquota: 0.195, deducao: 9360, fatorR: { alto: 0.195, baixo: 0.19 } },
    { ate: 1800000, aliquota: 0.205, deducao: 17640, fatorR: { alto: 0.205, baixo: 0.20 } },
    { ate: 3600000, aliquota: 0.23, deducao: 62100, fatorR: { alto: 0.23, baixo: 0.235 } },
    { ate: 4800000, aliquota: 0.305, deducao: 540000, fatorR: { alto: 0.305, baixo: 0.32 } }
];

// Tabela Simples Nacional - Anexo III (Serviços com folha significativa)
const TABELA_SIMPLES_ANEXO_III = [
    { ate: 180000, aliquota: 0.06, deducao: 0 },
    { ate: 360000, aliquota: 0.112, deducao: 9360 },
    { ate: 720000, aliquota: 0.135, deducao: 17640 },
    { ate: 1800000, aliquota: 0.16, deducao: 35640 },
    { ate: 3600000, aliquota: 0.21, deducao: 125640 },
    { ate: 4800000, aliquota: 0.33, deducao: 648000 }
];

// ==================== CÁLCULO SIMPLES NACIONAL ====================

/**
 * Calcula Fator R (Folha / Receita)
 * @param {number} folhaPagamento - Folha de pagamento anual
 * @param {number} receitaBruta - Receita bruta anual
 * @returns {number} - Fator R (0 a 1)
 */
function calcularFatorR(folhaPagamento, receitaBruta) {
    if (!receitaBruta || receitaBruta === 0) return 0;
    return folhaPagamento / receitaBruta;
}

/**
 * Determina qual anexo do Simples Nacional usar
 * @param {number} fatorR - Fator R calculado
 * @returns {string} - 'III' ou 'V'
 */
function determinarAnexo(fatorR) {
    // Se Fator R >= 28%, usa Anexo III (mais vantajoso)
    // Se Fator R < 28%, usa Anexo V
    return fatorR >= 0.28 ? 'III' : 'V';
}

/**
 * Calcula alíquota efetiva do Simples Nacional
 * @param {number} faturamentoAnual - Faturamento anual
 * @param {string} anexo - 'III' ou 'V'
 * @param {number} fatorR - Fator R (necessário para Anexo V)
 * @returns {object} - Objeto com alíquota e detalhes
 */
function calcularAliquotaSimples(faturamentoAnual, anexo, fatorR = 0) {
    const tabela = anexo === 'III' ? TABELA_SIMPLES_ANEXO_III : TABELA_SIMPLES_ANEXO_V;
    
    // Encontra faixa
    const faixa = tabela.find(f => faturamentoAnual <= f.ate);
    
    if (!faixa) {
        return {
            anexo,
            faixa: 'Acima do limite',
            aliquotaNominal: 0,
            aliquotaEfetiva: 0,
            valorDeduzir: 0
        };
    }
    
    let aliquotaEfetiva;
    
    if (anexo === 'V') {
        // Para Anexo V, considera fator R
        const usarAliquotaAlta = fatorR >= 0.28;
        aliquotaEfetiva = ((faturamentoAnual * faixa.aliquota) - faixa.deducao) / faturamentoAnual;
    } else {
        // Para Anexo III
        aliquotaEfetiva = ((faturamentoAnual * faixa.aliquota) - faixa.deducao) / faturamentoAnual;
    }
    
    return {
        anexo,
        faixa: `Até R$ ${formatCurrency(faixa.ate)}`,
        aliquotaNominal: faixa.aliquota,
        aliquotaEfetiva: Math.max(0, aliquotaEfetiva),
        valorDeduzir: faixa.deducao
    };
}

/**
 * Calcula impostos no Simples Nacional
 * @param {number} faturamentoAnual - Faturamento anual
 * @param {number} folhaPagamento - Folha de pagamento anual
 * @param {string} anexoForcado - Forçar anexo específico (opcional)
 * @returns {object} - Resultado completo do cálculo
 */
function calculateSimplesNacional(faturamentoAnual, folhaPagamento = 0, anexoForcado = null) {
    // Calcula fator R
    const fatorR = calcularFatorR(folhaPagamento, faturamentoAnual);
    
    // Determina anexo
    const anexo = anexoForcado || determinarAnexo(fatorR);
    
    // Calcula alíquota
    const aliquotaInfo = calcularAliquotaSimples(faturamentoAnual, anexo, fatorR);
    
    // Calcula imposto total
    const impostoAnual = faturamentoAnual * aliquotaInfo.aliquotaEfetiva;
    const impostoMensal = impostoAnual / 12;
    
    return {
        faturamentoAnual,
        faturamentoMensal: faturamentoAnual / 12,
        folhaPagamento,
        fatorR: roundToTwo(fatorR),
        fatorRPercentual: roundToTwo(fatorR * 100),
        anexo: aliquotaInfo.anexo,
        faixa: aliquotaInfo.faixa,
        aliquotaNominal: aliquotaInfo.aliquotaNominal,
        aliquotaEfetiva: aliquotaInfo.aliquotaEfetiva,
        aliquotaEfetivaPercentual: roundToTwo(aliquotaInfo.aliquotaEfetiva * 100),
        impostoAnual: roundToTwo(impostoAnual),
        impostoMensal: roundToTwo(impostoMensal)
    };
}

// ==================== CÁLCULO LUCRO PRESUMIDO ====================

/**
 * Calcula impostos no Lucro Presumido com Equiparação
 * @param {number} faturamentoAnual - Faturamento anual total
 * @param {number} percentualElegivel - % de receitas elegíveis (0-1)
 * @param {number} issAliquota - Alíquota ISS do município (padrão: 3%)
 * @returns {object} - Resultado completo do cálculo
 */
function calculateLucroPresumido(faturamentoAnual, percentualElegivel, issAliquota = ALIQUOTAS.ISS.DEFAULT) {
    // Divide faturamento
    const receitaElegivel = faturamentoAnual * percentualElegivel;
    const receitaNaoElegivel = faturamentoAnual * (1 - percentualElegivel);
    
    // === RECEITAS ELEGÍVEIS (com equiparação) ===
    const elegivel = {
        receita: receitaElegivel,
        percentual: percentualElegivel,
        
        // IRPJ: 8% base x 15%
        irpjBase: receitaElegivel * ALIQUOTAS.LUCRO_PRESUMIDO.ELEGIVEL.IRPJ_BASE,
        irpj: receitaElegivel * ALIQUOTAS.LUCRO_PRESUMIDO.ELEGIVEL.IRPJ_BASE * ALIQUOTAS.LUCRO_PRESUMIDO.ELEGIVEL.IRPJ_ALIQUOTA,
        irpjAliquota: ALIQUOTAS.LUCRO_PRESUMIDO.ELEGIVEL.IRPJ_BASE * ALIQUOTAS.LUCRO_PRESUMIDO.ELEGIVEL.IRPJ_ALIQUOTA,
        
        // CSLL: 12% base x 9%
        csllBase: receitaElegivel * ALIQUOTAS.LUCRO_PRESUMIDO.ELEGIVEL.CSLL_BASE,
        csll: receitaElegivel * ALIQUOTAS.LUCRO_PRESUMIDO.ELEGIVEL.CSLL_BASE * ALIQUOTAS.LUCRO_PRESUMIDO.ELEGIVEL.CSLL_ALIQUOTA,
        csllAliquota: ALIQUOTAS.LUCRO_PRESUMIDO.ELEGIVEL.CSLL_BASE * ALIQUOTAS.LUCRO_PRESUMIDO.ELEGIVEL.CSLL_ALIQUOTA,
        
        // PIS: 0,65%
        pis: receitaElegivel * ALIQUOTAS.LUCRO_PRESUMIDO.ELEGIVEL.PIS,
        pisAliquota: ALIQUOTAS.LUCRO_PRESUMIDO.ELEGIVEL.PIS,
        
        // COFINS: 3%
        cofins: receitaElegivel * ALIQUOTAS.LUCRO_PRESUMIDO.ELEGIVEL.COFINS,
        cofinsAliquota: ALIQUOTAS.LUCRO_PRESUMIDO.ELEGIVEL.COFINS,
        
        // ISS: variável por município
        iss: receitaElegivel * issAliquota,
        issAliquota: issAliquota
    };
    
    // Total receitas elegíveis
    elegivel.total = elegivel.irpj + elegivel.csll + elegivel.pis + elegivel.cofins + elegivel.iss;
    elegivel.aliquotaTotal = elegivel.total / elegivel.receita;
    
    // === RECEITAS NÃO ELEGÍVEIS (tributação normal) ===
    const naoElegivel = {
        receita: receitaNaoElegivel,
        percentual: 1 - percentualElegivel,
        
        // IRPJ: 32% base x 15%
        irpjBase: receitaNaoElegivel * ALIQUOTAS.LUCRO_PRESUMIDO.NAO_ELEGIVEL.IRPJ_BASE,
        irpj: receitaNaoElegivel * ALIQUOTAS.LUCRO_PRESUMIDO.NAO_ELEGIVEL.IRPJ_BASE * ALIQUOTAS.LUCRO_PRESUMIDO.NAO_ELEGIVEL.IRPJ_ALIQUOTA,
        irpjAliquota: ALIQUOTAS.LUCRO_PRESUMIDO.NAO_ELEGIVEL.IRPJ_BASE * ALIQUOTAS.LUCRO_PRESUMIDO.NAO_ELEGIVEL.IRPJ_ALIQUOTA,
        
        // CSLL: 32% base x 9%
        csllBase: receitaNaoElegivel * ALIQUOTAS.LUCRO_PRESUMIDO.NAO_ELEGIVEL.CSLL_BASE,
        csll: receitaNaoElegivel * ALIQUOTAS.LUCRO_PRESUMIDO.NAO_ELEGIVEL.CSLL_BASE * ALIQUOTAS.LUCRO_PRESUMIDO.NAO_ELEGIVEL.CSLL_ALIQUOTA,
        csllAliquota: ALIQUOTAS.LUCRO_PRESUMIDO.NAO_ELEGIVEL.CSLL_BASE * ALIQUOTAS.LUCRO_PRESUMIDO.NAO_ELEGIVEL.CSLL_ALIQUOTA,
        
        // PIS: 0,65%
        pis: receitaNaoElegivel * ALIQUOTAS.LUCRO_PRESUMIDO.NAO_ELEGIVEL.PIS,
        pisAliquota: ALIQUOTAS.LUCRO_PRESUMIDO.NAO_ELEGIVEL.PIS,
        
        // COFINS: 3%
        cofins: receitaNaoElegivel * ALIQUOTAS.LUCRO_PRESUMIDO.NAO_ELEGIVEL.COFINS,
        cofinsAliquota: ALIQUOTAS.LUCRO_PRESUMIDO.NAO_ELEGIVEL.COFINS,
        
        // ISS: variável por município
        iss: receitaNaoElegivel * issAliquota,
        issAliquota: issAliquota
    };
    
    // Total receitas não elegíveis
    naoElegivel.total = naoElegivel.irpj + naoElegivel.csll + naoElegivel.pis + naoElegivel.cofins + naoElegivel.iss;
    naoElegivel.aliquotaTotal = naoElegivel.receita > 0 ? naoElegivel.total / naoElegivel.receita : 0;
    
    // === TOTAL GERAL ===
    const totalImpostos = elegivel.total + naoElegivel.total;
    const aliquotaMedia = totalImpostos / faturamentoAnual;
    
    return {
        faturamentoAnual,
        faturamentoMensal: faturamentoAnual / 12,
        receitasElegiveis: {
            ...elegivel,
            irpj: roundToTwo(elegivel.irpj),
            csll: roundToTwo(elegivel.csll),
            pis: roundToTwo(elegivel.pis),
            cofins: roundToTwo(elegivel.cofins),
            iss: roundToTwo(elegivel.iss),
            total: roundToTwo(elegivel.total),
            aliquotaTotal: roundToTwo(elegivel.aliquotaTotal)
        },
        receitasNaoElegiveis: {
            ...naoElegivel,
            irpj: roundToTwo(naoElegivel.irpj),
            csll: roundToTwo(naoElegivel.csll),
            pis: roundToTwo(naoElegivel.pis),
            cofins: roundToTwo(naoElegivel.cofins),
            iss: roundToTwo(naoElegivel.iss),
            total: roundToTwo(naoElegivel.total),
            aliquotaTotal: roundToTwo(naoElegivel.aliquotaTotal)
        },
        totalImpostos: roundToTwo(totalImpostos),
        totalMensal: roundToTwo(totalImpostos / 12),
        aliquotaMedia: roundToTwo(aliquotaMedia)
    };
}

// ==================== COMPARAÇÃO ====================

/**
 * Compara regimes tributários
 * @param {object} simplesData - Dados do Simples Nacional
 * @param {object} presumidoData - Dados do Lucro Presumido
 * @param {number} custoContadorSimples - Custo mensal do contador no Simples
 * @param {number} custoContadorPresumido - Custo mensal do contador no Presumido
 * @returns {object} - Comparação completa
 */
function compareRegimes(simplesData, presumidoData, custoContadorSimples = 0, custoContadorPresumido = 0) {
    // Custos anuais de contabilidade
    const custoContabilSimples = custoContadorSimples * 12;
    const custoContabilPresumido = custoContadorPresumido * 12;
    
    // Totais com contador
    const totalSimplesComContador = simplesData.impostoAnual + custoContabilSimples;
    const totalPresumidoComContador = presumidoData.totalImpostos + custoContabilPresumido;
    
    // Economia
    const economiaAnual = totalSimplesComContador - totalPresumidoComContador;
    const economiaMensal = economiaAnual / 12;
    const economiaPercentual = economiaAnual / totalSimplesComContador;
    
    // Recuperação 5 anos (só se já estava no Lucro Presumido)
    const recuperacao5Anos = economiaAnual * 5;
    
    return {
        atual: {
            regime: 'Simples Nacional',
            anexo: simplesData.anexo,
            faturamentoAnual: simplesData.faturamentoAnual,
            aliquotaEfetiva: simplesData.aliquotaEfetiva,
            impostoAnual: simplesData.impostoAnual,
            impostoMensal: simplesData.impostoMensal,
            custoContador: custoContabilSimples,
            custoContadorMensal: custoContadorSimples,
            totalAnual: totalSimplesComContador,
            totalMensal: totalSimplesComContador / 12
        },
        proposto: {
            regime: 'Lucro Presumido + Equiparação',
            faturamentoAnual: presumidoData.faturamentoAnual,
            percentualElegivel: presumidoData.receitasElegiveis.percentual,
            aliquotaMedia: presumidoData.aliquotaMedia,
            impostoAnual: presumidoData.totalImpostos,
            impostoMensal: presumidoData.totalMensal,
            custoContador: custoContabilPresumido,
            custoContadorMensal: custoContadorPresumido,
            totalAnual: totalPresumidoComContador,
            totalMensal: totalPresumidoComContador / 12,
            detalhamento: {
                elegiveis: presumidoData.receitasElegiveis,
                naoElegiveis: presumidoData.receitasNaoElegiveis
            }
        },
        economia: {
            mensal: roundToTwo(economiaMensal),
            anual: roundToTwo(economiaAnual),
            percentual: roundToTwo(economiaPercentual),
            percentualFormatado: formatPercentage(economiaPercentual, 1)
        },
        recuperacao5Anos: roundToTwo(recuperacao5Anos),
        recomendacao: economiaAnual > 0 ? 'Lucro Presumido' : 'Simples Nacional'
    };
}

// ==================== CUSTOS DE TRANSIÇÃO ====================

/**
 * Calcula custos estimados de transição
 * @param {number} faturamento - Faturamento anual
 * @returns {object} - Custos estimados
 */
function calculateTransitionCosts(faturamento) {
    // Custos baseados em médias de mercado
    
    // Adequação contábil: varia com tamanho da empresa
    let adequacaoContabil = 2500;
    if (faturamento > 1000000) adequacaoContabil = 5000;
    if (faturamento > 2000000) adequacaoContabil = 7500;
    
    // Honorários equiparação hospitalar
    const honorariosEquiparacao = 5000;
    
    // Assessoria jurídica (se necessário processo)
    const assessoriaJuridica = 3000;
    
    const total = adequacaoContabil + honorariosEquiparacao + assessoriaJuridica;
    
    return {
        adequacaoContabil: roundToTwo(adequacaoContabil),
        honorariosEquiparacao: roundToTwo(honorariosEquiparacao),
        assessoriaJuridica: roundToTwo(assessoriaJuridica),
        total: roundToTwo(total)
    };
}

// ==================== VIABILIDADE E SCORE ====================

/**
 * Calcula score de viabilidade (0-100)
 * @param {object} comparison - Comparação de regimes
 * @param {string} especialidade - Especialidade médica
 * @param {object} organizacao - Dados de organização
 * @returns {object} - Score e análise
 */
function calculateViabilityScore(comparison, especialidade, organizacao = {}) {
    let score = 0;
    const detalhes = [];
    
    // === 1. ECONOMIA PERCENTUAL (30 pontos) ===
    const economiaPercent = Math.abs(comparison.economia.percentual);
    
    if (economiaPercent >= 0.40) {
        score += 30;
        detalhes.push({ criterio: 'Economia', pontos: 30, observacao: 'Excelente economia (>40%)' });
    } else if (economiaPercent >= 0.30) {
        score += 25;
        detalhes.push({ criterio: 'Economia', pontos: 25, observacao: 'Ótima economia (30-40%)' });
    } else if (economiaPercent >= 0.20) {
        score += 20;
        detalhes.push({ criterio: 'Economia', pontos: 20, observacao: 'Boa economia (20-30%)' });
    } else if (economiaPercent >= 0.10) {
        score += 15;
        detalhes.push({ criterio: 'Economia', pontos: 15, observacao: 'Economia moderada (10-20%)' });
    } else {
        score += 5;
        detalhes.push({ criterio: 'Economia', pontos: 5, observacao: 'Economia pequena (<10%)' });
    }
    
    // === 2. ESPECIALIDADE (20 pontos) ===
    const elegibilidadeAlta = ['anestesiologia', 'cirurgia plástica', 'cirurgia', 'oftalmologia', 'ortopedia'];
    const elegibilidadeMedia = ['dermatologia', 'cardiologia', 'gastroenterologia', 'urologia', 'ginecologia'];
    
    const especialidadeLower = (especialidade || '').toLowerCase();
    
    if (elegibilidadeAlta.some(e => especialidadeLower.includes(e))) {
        score += 20;
        detalhes.push({ criterio: 'Especialidade', pontos: 20, observacao: 'Alta elegibilidade' });
    } else if (elegibilidadeMedia.some(e => especialidadeLower.includes(e))) {
        score += 15;
        detalhes.push({ criterio: 'Especialidade', pontos: 15, observacao: 'Média elegibilidade' });
    } else {
        score += 10;
        detalhes.push({ criterio: 'Especialidade', pontos: 10, observacao: 'Necessita análise detalhada' });
    }
    
    // === 3. FATURAMENTO (15 pontos) ===
    const faturamento = comparison.atual.faturamentoAnual;
    
    if (faturamento > 500000) {
        score += 15;
        detalhes.push({ criterio: 'Faturamento', pontos: 15, observacao: 'Alto faturamento (>R$ 500k)' });
    } else if (faturamento > 200000) {
        score += 12;
        detalhes.push({ criterio: 'Faturamento', pontos: 12, observacao: 'Bom faturamento (R$ 200-500k)' });
    } else if (faturamento > 100000) {
        score += 8;
        detalhes.push({ criterio: 'Faturamento', pontos: 8, observacao: 'Faturamento adequado (R$ 100-200k)' });
    } else {
        score += 5;
        detalhes.push({ criterio: 'Faturamento', pontos: 5, observacao: 'Faturamento baixo (<R$ 100k)' });
    }
    
    // === 4. ORGANIZAÇÃO (15 pontos) ===
    const temDocumentos = organizacao.temDocumentos || false;
    const temContador = organizacao.temContador || false;
    const temProcessos = organizacao.temProcessos || false;
    
    let pontosOrganizacao = 0;
    if (temDocumentos) pontosOrganizacao += 5;
    if (temContador) pontosOrganizacao += 5;
    if (temProcessos) pontosOrganizacao += 5;
    
    score += pontosOrganizacao;
    detalhes.push({ criterio: 'Organização', pontos: pontosOrganizacao, observacao: `${pontosOrganizacao}/15 pontos` });
    
    // === 5. ROI / PAYBACK (20 pontos) ===
    const custos = calculateTransitionCosts(faturamento);
    const paybackMeses = custos.total / (comparison.economia.mensal || 1);
    
    if (paybackMeses <= 6) {
        score += 20;
        detalhes.push({ criterio: 'Payback', pontos: 20, observacao: 'Retorno rápido (<6 meses)' });
    } else if (paybackMeses <= 12) {
        score += 15;
        detalhes.push({ criterio: 'Payback', pontos: 15, observacao: 'Bom retorno (6-12 meses)' });
    } else if (paybackMeses <= 24) {
        score += 10;
        detalhes.push({ criterio: 'Payback', pontos: 10, observacao: 'Retorno médio (12-24 meses)' });
    } else {
        score += 5;
        detalhes.push({ criterio: 'Payback', pontos: 5, observacao: 'Retorno demorado (>24 meses)' });
    }
    
    // === CLASSIFICAÇÃO ===
    let nivel, recomendacao, cor;
    
    if (score >= 80) {
        nivel = 'ALTÍSSIMA';
        recomendacao = 'FAÇA! A mudança é altamente recomendada. Economia significativa com retorno rápido.';
        cor = 'green';
    } else if (score >= 60) {
        nivel = 'ALTA';
        recomendacao = 'Recomendado. A mudança trará benefícios significativos. Vale muito a pena!';
        cor = 'green';
    } else if (score >= 40) {
        nivel = 'MÉDIA';
        recomendacao = 'Avaliar custos. A mudança pode valer a pena, mas precisa analisar bem os custos de transição e complexidade adicional.';
        cor = 'yellow';
    } else if (score >= 20) {
        nivel = 'BAIXA';
        recomendacao = 'Aguardar. Pode ser melhor esperar a clínica crescer um pouco mais antes de fazer a mudança.';
        cor = 'orange';
    } else {
        nivel = 'NÃO VIÁVEL';
        recomendacao = 'Não recomendado no momento. Manter no Simples Nacional. Reavaliar quando a clínica crescer.';
        cor = 'red';
    }
    
    return {
        score: Math.round(score),
        nivel,
        recomendacao,
        cor,
        detalhes,
        paybackMeses: Math.round(paybackMeses),
        economiaAnual: comparison.economia.anual,
        percentualEconomia: comparison.economia.percentual
    };
}

// ==================== PAYBACK E ROI ====================

/**
 * Calcula tempo de retorno do investimento
 * @param {number} investimento - Valor do investimento
 * @param {number} economiaMensal - Economia mensal
 * @returns {number} - Meses para retorno
 */
function calculatePayback(investimento, economiaMensal) {
    if (!economiaMensal || economiaMensal <= 0) return Infinity;
    return Math.ceil(investimento / economiaMensal);
}

/**
 * Calcula ROI percentual
 * @param {number} investimento - Valor do investimento
 * @param {number} economiaAnual - Economia anual
 * @returns {number} - ROI em percentual
 */
function calculateROI(investimento, economiaAnual) {
    if (!investimento || investimento === 0) return 0;
    return ((economiaAnual - investimento) / investimento);
}

// ==================== SIMULADOR DE CENÁRIOS ====================

/**
 * Simula mudanças nos cálculos
 * @param {object} baseData - Dados base
 * @param {object} changes - Mudanças a aplicar
 * @returns {object} - Novo comparativo
 */
function simulateScenario(baseData, changes = {}) {
    // Aplica mudanças aos dados base
    const newData = {
        faturamentoAnual: baseData.faturamentoAnual * (1 + (changes.crescimentoFaturamento || 0)),
        folhaPagamento: (baseData.folhaPagamento || 0) + (changes.aumentoFolha || 0),
        percentualElegivel: changes.percentualElegivel !== undefined ? changes.percentualElegivel : baseData.percentualElegivel,
        custoContadorSimples: changes.custoContadorSimples || baseData.custoContadorSimples || 0,
        custoContadorPresumido: changes.custoContadorPresumido || baseData.custoContadorPresumido || 0
    };
    
    // Recalcula tudo
    const simplesData = calculateSimplesNacional(newData.faturamentoAnual, newData.folhaPagamento);
    const presumidoData = calculateLucroPresumido(newData.faturamentoAnual, newData.percentualElegivel);
    const comparison = compareRegimes(simplesData, presumidoData, newData.custoContadorSimples, newData.custoContadorPresumido);
    
    return {
        cenario: changes,
        simplesData,
        presumidoData,
        comparison
    };
}

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ALIQUOTAS,
        TABELA_SIMPLES_ANEXO_V,
        TABELA_SIMPLES_ANEXO_III,
        calcularFatorR,
        determinarAnexo,
        calcularAliquotaSimples,
        calculateSimplesNacional,
        calculateLucroPresumido,
        compareRegimes,
        calculateTransitionCosts,
        calculateViabilityScore,
        calculatePayback,
        calculateROI,
        simulateScenario
    };
}
