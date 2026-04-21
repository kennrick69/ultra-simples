// ==============================================================================
// PLANO DE TRATAMENTO - DENTAL ULTRA
// Sistema com busca de paciente com autocomplete
// ==============================================================================

let etapasCount = 0;
let pacienteSelecionado = null;
let pacientesCache = [];

// ==============================================================================
// INICIALIZAÇÃO
// ==============================================================================
window.addEventListener('DOMContentLoaded', function() {
    carregarPacientesCache();
    setupBuscaPaciente();
    addEtapa(); // Adiciona primeira etapa
    
    // Form de pagamento
    document.getElementById('formaPagamento').addEventListener('change', function() {
        const parcelado = this.value === 'parcelado';
        document.getElementById('parcelasGroup').style.display = parcelado ? 'block' : 'none';
        document.getElementById('valorParcelaGroup').style.display = parcelado ? 'block' : 'none';
        calculateTotal();
    });
    
    document.getElementById('numParcelas').addEventListener('input', calculateTotal);
});

// ==============================================================================
// CARREGAR PACIENTES DO CACHE
// ==============================================================================
function carregarPacientesCache() {
    const user = getCurrentUser();
    if (!user) {
        console.error('Usuário não logado');
        return;
    }
    
    const key = `pacientes_${user.id}`;
    pacientesCache = JSON.parse(localStorage.getItem(key) || '[]');
    
    console.log('Pacientes carregados:', pacientesCache.length);
}

// ==============================================================================
// SETUP BUSCA DE PACIENTE COM AUTOCOMPLETE
// ==============================================================================
function setupBuscaPaciente() {
    const inputBusca = document.getElementById('buscaPaciente');
    const resultados = document.getElementById('buscaResultados');
    
    if (!inputBusca) return;
    
    // Buscar conforme digita
    inputBusca.addEventListener('input', function() {
        const termo = this.value.trim().toLowerCase();
        
        if (termo.length < 2) {
            resultados.classList.remove('show');
            document.getElementById('naoEncontrou').style.display = 'none';
            return;
        }
        
        buscarPacientes(termo);
    });
    
    // Fechar ao clicar fora
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.busca-input-wrapper')) {
            resultados.classList.remove('show');
        }
    });
    
    // Focar mostra resultados se tiver texto
    inputBusca.addEventListener('focus', function() {
        if (this.value.trim().length >= 2) {
            buscarPacientes(this.value.trim().toLowerCase());
        }
    });
}

// ==============================================================================
// BUSCAR PACIENTES
// ==============================================================================
function buscarPacientes(termo) {
    const resultados = document.getElementById('buscaResultados');
    const naoEncontrou = document.getElementById('naoEncontrou');
    
    // Filtrar pacientes
    const encontrados = pacientesCache.filter(function(p) {
        const nomeMatch = p.nome && p.nome.toLowerCase().includes(termo);
        const cpfMatch = p.cpf && p.cpf.replace(/\D/g, '').includes(termo.replace(/\D/g, ''));
        const telMatch = p.telefone && p.telefone.replace(/\D/g, '').includes(termo.replace(/\D/g, ''));
        const celMatch = p.celular && p.celular.replace(/\D/g, '').includes(termo.replace(/\D/g, ''));
        return nomeMatch || cpfMatch || telMatch || celMatch;
    });
    
    if (encontrados.length === 0) {
        resultados.innerHTML = '<div class="busca-empty">Nenhum paciente encontrado</div>';
        resultados.classList.add('show');
        naoEncontrou.style.display = 'block';
        return;
    }
    
    naoEncontrou.style.display = 'none';
    
    // Renderizar resultados
    let html = '';
    encontrados.slice(0, 8).forEach(function(p) {
        html += `<div class="busca-item" onclick="selecionarPaciente('${p.id}')">
            <div class="busca-item-nome">${p.nome}</div>
            <div class="busca-item-cpf">CPF: ${p.cpf || 'Não informado'} | Tel: ${p.telefone || p.celular || 'Não informado'}</div>
        </div>`;
    });
    
    resultados.innerHTML = html;
    resultados.classList.add('show');
}

// ==============================================================================
// SELECIONAR PACIENTE
// ==============================================================================
function selecionarPaciente(id) {
    const paciente = pacientesCache.find(p => p.id === id);
    
    if (!paciente) {
        console.error('Paciente não encontrado:', id);
        return;
    }
    
    pacienteSelecionado = paciente;
    
    // Preencher campos ocultos
    document.getElementById('pacienteId').value = paciente.id;
    document.getElementById('pacienteNome').value = paciente.nome || '';
    document.getElementById('pacienteCPF').value = paciente.cpf || '';
    document.getElementById('pacienteTelefone').value = paciente.telefone || paciente.celular || '';
    
    // Atualizar UI de paciente selecionado
    document.getElementById('pacSelNome').textContent = paciente.nome;
    document.getElementById('pacSelCPF').textContent = paciente.cpf || 'Não informado';
    document.getElementById('pacSelTel').textContent = paciente.telefone || paciente.celular || 'Não informado';
    document.getElementById('pacSelEmail').textContent = paciente.email || 'Não informado';
    document.getElementById('pacSelCidade').textContent = 
        (paciente.cidade ? paciente.cidade + (paciente.estado ? '/' + paciente.estado : '') : 'Não informado');
    
    // Mostrar card de selecionado, esconder busca
    document.getElementById('pacienteSelecionado').style.display = 'flex';
    document.querySelector('.busca-row').style.display = 'none';
    document.querySelector('.busca-instrucao').style.display = 'none';
    document.getElementById('buscaResultados').classList.remove('show');
    document.getElementById('naoEncontrou').style.display = 'none';
    document.getElementById('buscaPaciente').value = '';
}

// ==============================================================================
// TROCAR PACIENTE
// ==============================================================================
function trocarPaciente() {
    pacienteSelecionado = null;
    
    // Limpar campos ocultos
    document.getElementById('pacienteId').value = '';
    document.getElementById('pacienteNome').value = '';
    document.getElementById('pacienteCPF').value = '';
    document.getElementById('pacienteTelefone').value = '';
    
    // Esconder card, mostrar busca
    document.getElementById('pacienteSelecionado').style.display = 'none';
    document.querySelector('.busca-row').style.display = 'flex';
    document.querySelector('.busca-instrucao').style.display = 'block';
    
    // Focar no campo de busca
    document.getElementById('buscaPaciente').focus();
}

// ==============================================================================
// MODAL: CADASTRAR NOVO PACIENTE
// ==============================================================================
function abrirModalPaciente() {
    document.getElementById('formNovoPaciente').reset();
    document.getElementById('modalNovoPaciente').style.display = 'flex';
    document.getElementById('novoPacNome').focus();
    
    // Setup máscaras
    setupMascarasModal();
}

function fecharModalPaciente() {
    document.getElementById('modalNovoPaciente').style.display = 'none';
}

function setupMascarasModal() {
    // CPF
    const cpfInput = document.getElementById('novoPacCPF');
    if (cpfInput) {
        cpfInput.addEventListener('input', function(e) {
            let v = e.target.value.replace(/\D/g, '');
            v = v.replace(/(\d{3})(\d)/, '$1.$2');
            v = v.replace(/(\d{3})(\d)/, '$1.$2');
            v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            e.target.value = v;
        });
    }
    
    // Telefone
    const telInput = document.getElementById('novoPacTelefone');
    if (telInput) {
        telInput.addEventListener('input', function(e) {
            let v = e.target.value.replace(/\D/g, '');
            v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
            v = v.replace(/(\d{5})(\d)/, '$1-$2');
            e.target.value = v;
        });
    }
}

function salvarNovoPaciente() {
    const nome = document.getElementById('novoPacNome').value.trim();
    const cpf = document.getElementById('novoPacCPF').value.trim();
    const telefone = document.getElementById('novoPacTelefone').value.trim();
    const email = document.getElementById('novoPacEmail').value.trim();
    const nascimento = document.getElementById('novoPacNascimento').value;
    
    // Validação
    if (!nome) {
        mostrarAviso('Informe o nome do paciente');
        document.getElementById('novoPacNome').focus();
        return;
    }
    
    if (!cpf) {
        mostrarAviso('Informe o CPF do paciente');
        document.getElementById('novoPacCPF').focus();
        return;
    }
    
    if (!telefone) {
        mostrarAviso('Informe o telefone do paciente');
        document.getElementById('novoPacTelefone').focus();
        return;
    }
    
    const user = getCurrentUser();
    const key = `pacientes_${user.id}`;
    
    // Verifica se CPF já existe
    const cpfLimpo = cpf.replace(/\D/g, '');
    const existente = pacientesCache.find(p => p.cpf && p.cpf.replace(/\D/g, '') === cpfLimpo);
    
    if (existente) {
        mostrarAviso('Já existe um paciente com este CPF!\n\nSelecionando automaticamente...');
        selecionarPaciente(existente.id);
        fecharModalPaciente();
        return;
    }
    
    // Cria novo paciente
    const novoPaciente = {
        id: 'pac_' + Date.now(),
        nome: nome,
        cpf: cpf,
        telefone: telefone,
        email: email,
        dataNascimento: nascimento,
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
        tratamentos: [],
        consultas: [],
        orcamentos: [],
        anamnese: null,
        documentos: [],
        observacoes: ''
    };
    
    // Salvar no localStorage
    pacientesCache.push(novoPaciente);
    localStorage.setItem(key, JSON.stringify(pacientesCache));
    
    // Selecionar o novo paciente
    selecionarPaciente(novoPaciente.id);
    
    fecharModalPaciente();
    mostrarSucesso('Paciente cadastrado com sucesso!');
}

// ==============================================================================
// ETAPAS DO TRATAMENTO
// ==============================================================================
function addEtapa() {
    etapasCount++;
    
    const container = document.getElementById('etapasContainer');
    const etapaDiv = document.createElement('div');
    etapaDiv.className = 'etapa-card';
    etapaDiv.id = `etapa-${etapasCount}`;
    
    etapaDiv.innerHTML = `
        <div class="etapa-header">
            <div class="etapa-number">${etapasCount}</div>
            ${etapasCount > 1 ? `<button type="button" class="btn-remove-etapa" onclick="removeEtapa(${etapasCount})">Remover</button>` : ''}
        </div>
        
        <div class="form-grid">
            <div class="form-group">
                <label>Procedimento *</label>
                <input type="text" class="etapa-procedimento" required placeholder="Ex: Implante dentário">
            </div>
            
            <div class="form-group">
                <label>Elemento(s)</label>
                <input type="text" class="etapa-elemento" placeholder="Ex: 46, 47">
            </div>
            
            <div class="form-group">
                <label>Valor (R$) *</label>
                <input type="number" class="etapa-valor" required placeholder="0.00" step="0.01" onchange="calculateTotal()">
            </div>
            
            <div class="form-group">
                <label>Previsão de Início</label>
                <input type="date" class="etapa-data">
            </div>
        </div>
        
        <div class="form-group" style="margin-top: 1rem;">
            <label>Observações da Etapa</label>
            <textarea class="etapa-obs" rows="2" placeholder="Detalhes adicionais..."></textarea>
        </div>
    `;
    
    container.appendChild(etapaDiv);
}

function removeEtapa(id) {
    const etapa = document.getElementById(`etapa-${id}`);
    if (etapa) {
        etapa.remove();
        calculateTotal();
        renumberEtapas();
    }
}

function renumberEtapas() {
    const etapas = document.querySelectorAll('.etapa-card');
    etapas.forEach((etapa, index) => {
        etapa.querySelector('.etapa-number').textContent = index + 1;
    });
}

// ==============================================================================
// CALCULAR TOTAL
// ==============================================================================
function calculateTotal() {
    const valores = document.querySelectorAll('.etapa-valor');
    let total = 0;
    
    valores.forEach(input => {
        total += parseFloat(input.value) || 0;
    });
    
    document.getElementById('valorTotal').value = formatCurrency(total);
    
    // Calcula parcela
    if (document.getElementById('formaPagamento').value === 'parcelado') {
        const numParcelas = parseInt(document.getElementById('numParcelas').value) || 1;
        const valorParcela = total / numParcelas;
        document.getElementById('valorParcela').value = formatCurrency(valorParcela);
    }
}

// ==============================================================================
// SALVAR PLANO (COM VINCULAÇÃO AO PACIENTE)
// ==============================================================================
async function savePlano() {
    // Verificar se tem paciente selecionado
    if (!pacienteSelecionado) {
        mostrarAviso('Selecione um paciente antes de salvar o plano');
        document.getElementById('buscaPaciente').focus();
        return;
    }
    
    const plano = collectPlanoData();
    if (!plano) return;
    
    const user = getCurrentUser();
    
    // ID único do plano
    plano.id = 'trat_' + Date.now();
    plano.userId = user.id;
    plano.createdAt = new Date().toISOString();
    plano.status = 'em_andamento';
    plano.pacienteId = pacienteSelecionado.id;
    
    // Vincular ao paciente
    vincularPlanoAoPaciente(pacienteSelecionado.id, plano);
    
    // Salva também na lista geral de tratamentos (para relatórios)
    const keyTratamentos = `tratamentos_${user.id}`;
    const tratamentos = JSON.parse(localStorage.getItem(keyTratamentos) || '[]');
    tratamentos.push(plano);
    localStorage.setItem(keyTratamentos, JSON.stringify(tratamentos));
    
    // Marca tarefa do onboarding
    if (typeof OnboardingSystem !== 'undefined') {
        OnboardingSystem.completeTask('orcamento');
    }
    
    await mostrarSucesso('Plano de Tratamento salvo com sucesso!\n\nO plano está vinculado ao prontuário de ' + pacienteSelecionado.nome);
    
    // Pergunta se quer criar outro
    const criarOutro = await mostrarConfirmacao(
        'Deseja criar outro plano de tratamento?',
        'Novo Plano',
        'Sim, Criar Outro',
        'Não, Voltar ao Dashboard'
    );
    
    if (criarOutro) {
        window.location.reload();
    } else {
        window.location.href = 'dashboard.html';
    }
}

// ==============================================================================
// VINCULAR PLANO AO PACIENTE
// ==============================================================================
function vincularPlanoAoPaciente(pacienteId, plano) {
    const user = getCurrentUser();
    const key = `pacientes_${user.id}`;
    
    const pacienteIndex = pacientesCache.findIndex(p => p.id == pacienteId);
    
    if (pacienteIndex !== -1) {
        // Garante que o array de tratamentos existe
        if (!pacientesCache[pacienteIndex].tratamentos) {
            pacientesCache[pacienteIndex].tratamentos = [];
        }
        
        // Adiciona o plano ao paciente
        pacientesCache[pacienteIndex].tratamentos.push({
            id: plano.id,
            diagnostico: plano.diagnostico,
            objetivo: plano.objetivo,
            etapas: plano.etapas,
            valorTotal: plano.valorTotal,
            formaPagamento: plano.formaPagamento,
            numParcelas: plano.numParcelas,
            observacoes: plano.observacoes,
            status: plano.status,
            criadoEm: plano.createdAt
        });
        
        // Atualiza data de modificação
        pacientesCache[pacienteIndex].atualizadoEm = new Date().toISOString();
        
        localStorage.setItem(key, JSON.stringify(pacientesCache));
    }
}

// ==============================================================================
// COLETAR DADOS DO FORMULÁRIO
// ==============================================================================
function collectPlanoData() {
    const diagnostico = document.getElementById('diagnostico').value.trim();
    const objetivo = document.getElementById('objetivo').value.trim();
    const formaPagamento = document.getElementById('formaPagamento').value;
    const numParcelas = document.getElementById('numParcelas').value;
    const observacoes = document.getElementById('observacoes').value.trim();
    
    if (!diagnostico || !objetivo) {
        mostrarAviso('Preencha o diagnóstico e objetivo do tratamento');
        return null;
    }
    
    // Coleta etapas
    const etapas = [];
    const etapasCards = document.querySelectorAll('.etapa-card');
    let hasError = false;
    
    etapasCards.forEach((card, index) => {
        const procedimento = card.querySelector('.etapa-procedimento').value.trim();
        const elemento = card.querySelector('.etapa-elemento').value.trim();
        const valor = parseFloat(card.querySelector('.etapa-valor').value) || 0;
        const data = card.querySelector('.etapa-data').value;
        const obs = card.querySelector('.etapa-obs').value.trim();
        
        if (!procedimento || valor <= 0) {
            mostrarAviso(`Preencha o procedimento e valor da etapa ${index + 1}`);
            hasError = true;
            return;
        }
        
        etapas.push({
            numero: index + 1,
            procedimento,
            elemento,
            valor,
            dataPrevisao: data,
            observacoes: obs,
            status: 'pendente'
        });
    });
    
    if (hasError || etapas.length === 0) return null;
    
    const valorTotal = etapas.reduce((sum, e) => sum + e.valor, 0);
    
    return {
        paciente: {
            id: pacienteSelecionado.id,
            nome: pacienteSelecionado.nome,
            cpf: pacienteSelecionado.cpf,
            telefone: pacienteSelecionado.telefone || pacienteSelecionado.celular
        },
        diagnostico,
        objetivo,
        etapas,
        valorTotal,
        formaPagamento,
        numParcelas: formaPagamento === 'parcelado' ? parseInt(numParcelas) : 1,
        observacoes,
        dataInicio: etapas[0].dataPrevisao || new Date().toISOString().split('T')[0]
    };
}

// ==============================================================================
// PREVIEW
// ==============================================================================
function previewPlano() {
    if (!pacienteSelecionado) {
        mostrarAviso('Selecione um paciente antes de visualizar');
        return;
    }
    
    const plano = collectPlanoData();
    if (!plano) return;
    
    const user = getCurrentUser();
    const html = generatePlanoHTML(plano, user);
    
    document.getElementById('previewContent').innerHTML = html;
    document.getElementById('previewModal').style.display = 'flex';
}

function closePreview() {
    document.getElementById('previewModal').style.display = 'none';
}

function generatePlanoHTML(plano, user) {
    return `
        <div class="preview-document">
            <div class="preview-header">
                <h1 class="preview-title">PLANO DE TRATAMENTO ODONTOLÓGICO</h1>
                <p><strong>${user.clinic || 'Clínica Odontológica'}</strong></p>
                <p>${user.name} - CRO: ${user.cro}</p>
                <p>Nº do Plano: PT-${Date.now()}</p>
                <p>Data: ${new Date().toLocaleDateString('pt-BR')}</p>
            </div>
            
            <div class="preview-section">
                <h3>DADOS DO PACIENTE</h3>
                <p><strong>Nome:</strong> ${plano.paciente.nome}</p>
                <p><strong>CPF:</strong> ${plano.paciente.cpf || 'Não informado'}</p>
                <p><strong>Telefone:</strong> ${plano.paciente.telefone || 'Não informado'}</p>
            </div>
            
            <div class="preview-section">
                <h3>DIAGNÓSTICO</h3>
                <p>${plano.diagnostico}</p>
            </div>
            
            <div class="preview-section">
                <h3>OBJETIVO DO TRATAMENTO</h3>
                <p>${plano.objetivo}</p>
            </div>
            
            <div class="preview-section">
                <h3>ETAPAS DO TRATAMENTO</h3>
                <table class="preview-table">
                    <thead>
                        <tr>
                            <th>Etapa</th>
                            <th>Procedimento</th>
                            <th>Elemento(s)</th>
                            <th>Previsão</th>
                            <th>Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${plano.etapas.map(e => `
                            <tr>
                                <td>${e.numero}</td>
                                <td>${e.procedimento}</td>
                                <td>${e.elemento || '-'}</td>
                                <td>${e.dataPrevisao ? new Date(e.dataPrevisao).toLocaleDateString('pt-BR') : '-'}</td>
                                <td>${formatCurrency(e.valor)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr>
                            <th colspan="4" style="text-align: right;">VALOR TOTAL:</th>
                            <th>${formatCurrency(plano.valorTotal)}</th>
                        </tr>
                    </tfoot>
                </table>
            </div>
            
            <div class="preview-section">
                <h3>FORMA DE PAGAMENTO</h3>
                <p>${plano.formaPagamento === 'vista' ? 'À Vista' : `Parcelado em ${plano.numParcelas}x de ${formatCurrency(plano.valorTotal / plano.numParcelas)}`}</p>
            </div>
            
            ${plano.observacoes ? `
                <div class="preview-section">
                    <h3>OBSERVAÇÕES</h3>
                    <p>${plano.observacoes}</p>
                </div>
            ` : ''}
            
            <div class="preview-signatures">
                <div class="signature-line">
                    <hr>
                    <p><strong>${user.name}</strong></p>
                    <p>Cirurgião-Dentista</p>
                    <p>CRO: ${user.cro}</p>
                </div>
                <div class="signature-line">
                    <hr>
                    <p><strong>${plano.paciente.nome}</strong></p>
                    <p>Paciente</p>
                    <p>CPF: ${plano.paciente.cpf || 'Não informado'}</p>
                </div>
            </div>
        </div>
    `;
}

// ==============================================================================
// DOWNLOAD PDF
// ==============================================================================
function downloadPlano() {
    if (!pacienteSelecionado) {
        mostrarAviso('Selecione um paciente antes de gerar PDF');
        return;
    }
    
    const plano = collectPlanoData();
    if (!plano) return;
    
    const user = getCurrentUser();
    
    try {
        gerarPDFPlanoTratamento(plano, user);
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        mostrarErro('Erro ao gerar PDF. Por favor, tente novamente.');
    }
}

// ==============================================================================
// UTILITÁRIOS
// ==============================================================================
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

// Fechar modais com ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        fecharModalPaciente();
        closePreview();
    }
});

// Fechar modais ao clicar fora
document.addEventListener('click', function(e) {
    if (e.target.id === 'modalNovoPaciente') {
        fecharModalPaciente();
    }
    if (e.target.id === 'previewModal') {
        closePreview();
    }
});
