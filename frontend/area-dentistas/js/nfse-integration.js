// ==================== INTEGRAÇÃO NFSE - BACKEND ====================

// URL do backend (JÁ CONFIGURADO!)
const BACKEND_URL = 'https://dentist-backend-v2-production.up.railway.app'; // Produção

// ===== CANCELAR NOTA AUTOMATICAMENTE =====
async function cancelarNotaAutomatica(numeroNota, motivoCancelamento) {
    try {
        console.log(`🗑️ Cancelando nota ${numeroNota}...`);
        
        const user = getCurrentUser();
        if (!user || !user.id) {
            alert('⚠️ Sessão expirada! Por favor, faça login novamente.');
            window.location.href = 'login.html';
            return;
        }
        const credenciais = JSON.parse(localStorage.getItem(`nfse_credenciais_${user.id}`) || '{}');
        
        if (!credenciais.usuario || !credenciais.senha) {
            alert('⚠️ Configure suas credenciais primeiro!');
            mostrarModalCredenciais();
            return;
        }
        
        if (!credenciais.inscricao_municipal) {
            alert('⚠️ Configure sua Inscrição Municipal nas credenciais!');
            mostrarModalCredenciais();
            return;
        }
        
        // Mostrar loading
        mostrarLoading('Cancelando nota na prefeitura...');
        
        // Montar dados para cancelamento
        const dadosCancelamento = {
            numero_nota: numeroNota,
            motivo_cancelamento: motivoCancelamento || 'Cancelamento solicitado pelo prestador',
            usuario_prefeitura: credenciais.usuario,
            senha_prefeitura: credenciais.senha,
            inscricao_municipal: credenciais.inscricao_municipal
        };
        
        // Enviar para o backend
        const response = await fetch(`${BACKEND_URL}/api/nfse/cancelar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosCancelamento)
        });
        
        const resultado = await response.json();
        
        // Esconder loading
        esconderLoading();
        
        if (resultado.success) {
            // Sucesso!
            alert(`✅ NOTA CANCELADA COM SUCESSO!\n\n` +
                  `Número: ${numeroNota}\n` +
                  `Data: ${new Date(resultado.data_cancelamento).toLocaleString('pt-BR')}\n\n` +
                  `A nota foi cancelada no sistema da prefeitura.`);
            
            // Atualizar status da nota no histórico
            atualizarStatusNota(numeroNota, 'cancelada');
            
            // Recarregar lista
            carregarNotas();
            
        } else {
            // Erro
            alert(`❌ ERRO AO CANCELAR NOTA\n\n${resultado.erro}\n\n` +
                  `Possíveis causas:\n` +
                  `• Nota já está cancelada\n` +
                  `• Prazo para cancelamento expirou\n` +
                  `• Credenciais incorretas\n` +
                  `• Nota não encontrada`);
        }
        
    } catch (error) {
        esconderLoading();
        console.error('Erro:', error);
        alert(`❌ ERRO DE CONEXÃO\n\n` +
              `Não foi possível conectar ao servidor.\n\n` +
              `Verifique sua conexão com internet.`);
    }
}

// ===== MODAL DE CANCELAMENTO =====
function mostrarModalCancelamento(numeroNota) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <h3>🗑️ Cancelar Nota Fiscal</h3>
            <p style="margin-bottom: 1.5rem; color: var(--text-light);">
                Você está prestes a cancelar a nota <strong>${numeroNota}</strong>.
                Esta ação não pode ser desfeita!
            </p>
            
            <div class="form-group">
                <label>Motivo do Cancelamento *</label>
                <textarea id="modal_motivo" rows="3" placeholder="Ex: Erro na emissão, dados incorretos, duplicidade..." required></textarea>
                <small style="color: var(--text-light);">Mínimo 15 caracteres</small>
            </div>
            
            <div style="background: #fee2e2; border: 1px solid #ef4444; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem;">
                <p style="margin: 0; font-size: 0.875rem; color: #991b1b;">
                    ⚠️ <strong>Atenção:</strong> O cancelamento é definitivo e será registrado na prefeitura.
                </p>
            </div>
            
            <div style="display: flex; gap: 1rem;">
                <button class="btn btn-secondary" onclick="fecharModalCancelamento()">Voltar</button>
                <button class="btn" style="background: var(--danger); color: white;" onclick="confirmarCancelamento('${numeroNota}')">Cancelar Nota</button>
            </div>
        </div>
    `;
    
    modal.id = 'modal-cancelamento';
    document.body.appendChild(modal);
}

function fecharModalCancelamento() {
    const modal = document.getElementById('modal-cancelamento');
    if (modal) modal.remove();
}

function confirmarCancelamento(numeroNota) {
    const motivo = document.getElementById('modal_motivo').value.trim();
    
    if (!motivo || motivo.length < 15) {
        alert('⚠️ Digite um motivo com pelo menos 15 caracteres');
        return;
    }
    
    fecharModalCancelamento();
    cancelarNotaAutomatica(numeroNota, motivo);
}

// ===== ATUALIZAR STATUS DA NOTA =====
function atualizarStatusNota(numeroNota, novoStatus) {
    const user = getCurrentUser();
    if (!user || !user.id) return;
    const key = `notas_${user.id}`;
    const notas = JSON.parse(localStorage.getItem(key) || '[]');
    
    const notaIndex = notas.findIndex(n => n.numero === numeroNota);
    
    if (notaIndex !== -1) {
        notas[notaIndex].status = novoStatus;
        notas[notaIndex].data_cancelamento = new Date().toISOString();
        localStorage.setItem(key, JSON.stringify(notas));
    }
}

// ===== FORMATAR VALOR PARA PADRÃO BRASILEIRO =====
function formatarValorBR(valor) {
    // Converte número para formato brasileiro (vírgula como decimal)
    return parseFloat(valor).toFixed(2).replace('.', ',');
}

// ===== EMITIR NOTA AUTOMATICAMENTE =====
async function emitirNotaAutomatica() {
    try {
        // Verificar usuário logado
        const user = getCurrentUser();
        if (!user || !user.id) {
            alert('⚠️ Sessão expirada! Por favor, faça login novamente.');
            window.location.href = 'login.html';
            return;
        }
        
        // Coletar dados do formulário
        const checkboxes = document.querySelectorAll('input[name="procedimento"]:checked');
        const procedimentos = Array.from(checkboxes).map(cb => cb.value);
        const elemento = document.getElementById('elemento')?.value || '';
        const valor = parseFloat(document.getElementById('valor').value);
        const data = document.getElementById('dataServico').value;
        const descricao = document.getElementById('descricao').value;
        
        // NOVO: Capturar modo teste
        const modoTeste = document.getElementById('modo-teste')?.checked || false;
        
        // Validações
        if (procedimentos.length === 0 || !valor || !data || !descricao) {
            alert('⚠️ Preencha todos os campos obrigatórios');
            return;
        }
        
        // Buscar credenciais salvas
        const credenciais = JSON.parse(localStorage.getItem(`nfse_credenciais_${user.id}`) || '{}');
        
        if (!credenciais.usuario || !credenciais.senha) {
            // Se não tem credenciais, solicitar
            mostrarModalCredenciais();
            return;
        }
        
        // Buscar dados do prestador
        const cnpj = credenciais.cnpj || '';
        const inscricao_municipal = credenciais.inscricao_municipal || '';
        
        if (!cnpj || !inscricao_municipal) {
            alert('⚠️ Configure seus dados fiscais primeiro!\n\nAcesse: Configurações → Dados Fiscais');
            return;
        }
        
        // Mostrar loading apropriado
        if (modoTeste) {
            mostrarLoading('🧪 Validando XML em modo de teste...');
        } else {
            mostrarLoading('Emitindo nota fiscal na prefeitura...');
        }
        
        // Montar dados para enviar ao backend
        const dadosNota = {
            // NOVO: Incluir modo teste
            modo_teste: modoTeste,
            
            // Credenciais da prefeitura
            usuario_prefeitura: credenciais.usuario,
            senha_prefeitura: credenciais.senha,
            
            // Dados do prestador
            cnpj: cnpj,
            inscricao_municipal: inscricao_municipal,
            razao_social: user.clinic,
            
            // Dados do serviço (valores em formato BR)
            descricao: descricao,
            valor_servicos: formatarValorBR(valor), // NOVO: Formato BR
            codigo_servico: obterCodigoServico(procedimentos[0]),
            aliquota_iss: formatarValorBR(3.5), // NOVO: Formato BR
            
            // Dados do tomador (paciente)
            tomador: {
                cpf_cnpj: '00000000000', // Será implementado
                razao_social: 'Consumidor Final',
                nome: 'Consumidor Final'
            }
        };
        
        // Enviar para o backend
        const response = await fetch(`${BACKEND_URL}/api/nfse/emitir`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosNota)
        });
        
        const resultado = await response.json();
        
        // Esconder loading
        esconderLoading();
        
        if (resultado.success) {
            // NOVO: Mensagem diferente para modo teste
            if (modoTeste) {
                alert(`🧪 VALIDAÇÃO CONCLUÍDA COM SUCESSO!\n\n` +
                      `✅ O XML está correto e válido\n` +
                      `✅ A nota seria emitida normalmente\n\n` +
                      `💡 Desmarque "Modo Teste" para emitir a nota real`);
            } else {
                // Sucesso normal!
                alert(`✅ NOTA EMITIDA COM SUCESSO!\n\n` +
                      `Número: ${resultado.numero_nota}\n` +
                      `Código Verificação: ${resultado.codigo_verificacao}\n` +
                      `Data: ${new Date(resultado.data_emissao).toLocaleString('pt-BR')}`);
                
                // Salvar nota no histórico
                salvarNotaEmitida({
                    numero: resultado.numero_nota,
                    codigo_verificacao: resultado.codigo_verificacao,
                    data: resultado.data_emissao,
                    valor: valor,
                    descricao: descricao,
                    xml: resultado.xml_completo,
                    status: 'ativa'
                });
                
                // Limpar formulário
                const checkboxes = document.querySelectorAll('input[name="procedimento"]');
                checkboxes.forEach(cb => cb.checked = false);
                document.getElementById('elemento').value = '';
                document.getElementById('valor').value = '';
                document.getElementById('descricao').value = '';
                document.getElementById('dataServico').value = '';
                
                // Recarregar lista
                carregarNotas();
            }
            
        } else {
            // Erro
            alert(`❌ ERRO AO EMITIR NOTA\n\n${resultado.erro}\n\n` +
                  `Verifique:\n` +
                  `• Suas credenciais estão corretas?\n` +
                  `• Liberou WebService na prefeitura?\n` +
                  `• Todos os dados estão preenchidos?`);
        }
        
    } catch (error) {
        esconderLoading();
        console.error('Erro:', error);
        alert(`❌ ERRO DE CONEXÃO\n\n` +
              `Não foi possível conectar ao servidor.\n\n` +
              `Verifique:\n` +
              `• Sua conexão com internet\n` +
              `• Backend está rodando?\n` +
              `• URL do backend está correta?`);
    }
}

// ===== MODAL DE CREDENCIAIS =====
function mostrarModalCredenciais() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <h3>🔐 Configurar Credenciais da Prefeitura</h3>
            <p style="margin-bottom: 1.5rem; color: var(--text-light);">
                Insira suas credenciais de acesso ao portal da prefeitura de Pomerode.
            </p>
            
            <div class="form-group">
                <label>CNPJ</label>
                <input type="text" id="modal_cnpj" placeholder="12.345.678/0001-90">
            </div>
            
            <div class="form-group">
                <label>Inscrição Municipal</label>
                <input type="text" id="modal_im" placeholder="12345">
            </div>
            
            <div class="form-group">
                <label>Usuário da Prefeitura (CNPJ)</label>
                <input type="text" id="modal_usuario" placeholder="12345678000190">
            </div>
            
            <div class="form-group">
                <label>Senha da Prefeitura</label>
                <input type="password" id="modal_senha" placeholder="Sua senha">
            </div>
            
            <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem;">
                <p style="margin: 0; font-size: 0.875rem;">
                    ⚠️ <strong>Importante:</strong> Use as mesmas credenciais do portal
                    <a href="https://nfse-pomerode.atende.net" target="_blank">nfse-pomerode.atende.net</a>
                </p>
            </div>
            
            <div style="display: flex; gap: 1rem;">
                <button class="btn btn-secondary" onclick="fecharModalCredenciais()">Cancelar</button>
                <button class="btn btn-primary" onclick="salvarCredenciais()">Salvar e Continuar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Carregar dados salvos se existirem
    const user = getCurrentUser();
    if (!user || !user.id) return;
    const credenciais = JSON.parse(localStorage.getItem(`nfse_credenciais_${user.id}`) || '{}');
    
    if (credenciais.cnpj) document.getElementById('modal_cnpj').value = credenciais.cnpj;
    if (credenciais.inscricao_municipal) document.getElementById('modal_im').value = credenciais.inscricao_municipal;
    if (credenciais.usuario) document.getElementById('modal_usuario').value = credenciais.usuario;
}

function fecharModalCredenciais() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) modal.remove();
}

function salvarCredenciais() {
    const cnpj = document.getElementById('modal_cnpj').value;
    const im = document.getElementById('modal_im').value;
    const usuario = document.getElementById('modal_usuario').value;
    const senha = document.getElementById('modal_senha').value;
    
    if (!cnpj || !im || !usuario || !senha) {
        alert('⚠️ Preencha todos os campos!');
        return;
    }
    
    const user = getCurrentUser();
    if (!user || !user.id) {
        alert('⚠️ Sessão expirada! Por favor, faça login novamente.');
        window.location.href = 'login.html';
        return;
    }
    const credenciais = {
        cnpj,
        inscricao_municipal: im,
        usuario,
        senha
    };
    
    localStorage.setItem(`nfse_credenciais_${user.id}`, JSON.stringify(credenciais));
    
    alert('✅ Credenciais salvas com sucesso!\n\nAgora você pode emitir notas automaticamente.');
    
    fecharModalCredenciais();
    
    // Tentar emitir novamente
    emitirNotaAutomatica();
}

// ===== OBTER CÓDIGO DO SERVIÇO =====
function obterCodigoServico(procedimento) {
    const codigos = {
        'implante': '04.02',
        'protese': '04.02',
        'exame': '04.03',
        'radiografia': '04.03',
        'anestesia': '04.06',
        'cirurgia': '04.14',
        'endodontia': '04.10',
        'periodontia': '04.12'
    };
    
    const proc = procedimento.toLowerCase();
    
    for (const [key, value] of Object.entries(codigos)) {
        if (proc.includes(key)) {
            return value;
        }
    }
    
    return '04.02'; // Padrão
}

// ===== LOADING =====
function mostrarLoading(mensagem) {
    const loading = document.createElement('div');
    loading.id = 'loading-overlay';
    loading.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    `;
    
    loading.innerHTML = `
        <div style="background: white; padding: 2rem; border-radius: 1rem; text-align: center;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">⏳</div>
            <p style="font-size: 1.2rem; margin: 0;">${mensagem}</p>
        </div>
    `;
    
    document.body.appendChild(loading);
}

function esconderLoading() {
    const loading = document.getElementById('loading-overlay');
    if (loading) loading.remove();
}

// ===== CANCELAR NOTA =====
async function cancelarNotaAutomatica(numeroNota) {
    try {
        // Verificar usuário logado
        const user = getCurrentUser();
        if (!user || !user.id) {
            alert('⚠️ Sessão expirada! Por favor, faça login novamente.');
            window.location.href = 'login.html';
            return;
        }
        
        // Confirmar cancelamento
        if (!confirm('⚠️ CONFIRMA O CANCELAMENTO?\n\nEsta ação não pode ser desfeita!')) {
            return;
        }
        
        // Pedir motivo
        const motivo = prompt('Digite o motivo do cancelamento:\n\n(Ex: Erro na emissão, Nota duplicada, etc.)');
        
        if (!motivo || motivo.trim() === '') {
            alert('⚠️ Motivo é obrigatório para cancelar');
            return;
        }
        
        // Buscar credenciais salvas
        const credenciais = JSON.parse(localStorage.getItem(`nfse_credenciais_${user.id}`) || '{}');
        
        if (!credenciais.usuario || !credenciais.senha || !credenciais.inscricao_municipal) {
            alert('⚠️ Configure suas credenciais primeiro!\n\nAcesse: Configurações → Dados Fiscais');
            return;
        }
        
        // Mostrar loading
        mostrarLoading('Cancelando nota fiscal na prefeitura...');
        
        // Montar dados para cancelamento
        const dadosCancelamento = {
            numero_nota: numeroNota,
            motivo_cancelamento: motivo,
            usuario_prefeitura: credenciais.usuario,
            senha_prefeitura: credenciais.senha,
            inscricao_municipal: credenciais.inscricao_municipal
        };
        
        // Enviar para o backend
        const response = await fetch(`${BACKEND_URL}/api/nfse/cancelar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosCancelamento)
        });
        
        const resultado = await response.json();
        
        // Esconder loading
        esconderLoading();
        
        if (resultado.success) {
            // Sucesso!
            alert(`✅ NOTA CANCELADA COM SUCESSO!\n\n` +
                  `Número: ${numeroNota}\n` +
                  `Data: ${new Date(resultado.data_cancelamento).toLocaleString('pt-BR')}\n` +
                  `Motivo: ${motivo}`);
            
            // Atualizar status da nota no localStorage
            atualizarStatusNotaCancelada(numeroNota, motivo);
            
            // Recarregar lista
            carregarNotas();
            
        } else {
            // Erro
            alert(`❌ ERRO AO CANCELAR NOTA\n\n${resultado.erro}\n\n` +
                  `Verifique:\n` +
                  `• A nota existe?\n` +
                  `• Suas credenciais estão corretas?\n` +
                  `• A nota já foi cancelada antes?`);
        }
        
    } catch (error) {
        esconderLoading();
        console.error('Erro:', error);
        alert(`❌ ERRO DE CONEXÃO\n\n` +
              `Não foi possível conectar ao servidor.\n\n` +
              `Verifique:\n` +
              `• Sua conexão com internet\n` +
              `• Backend está rodando?`);
    }
}

// ===== ATUALIZAR STATUS DA NOTA CANCELADA =====
function atualizarStatusNotaCancelada(numeroNota, motivo) {
    const user = getCurrentUser();
    if (!user || !user.id) return;
    const key = `notas_${user.id}`;
    const notas = JSON.parse(localStorage.getItem(key) || '[]');
    
    const notaIndex = notas.findIndex(n => n.numero === numeroNota || n.numero_nota === numeroNota);
    
    if (notaIndex !== -1) {
        notas[notaIndex].status = 'cancelada';
        notas[notaIndex].motivo_cancelamento = motivo;
        notas[notaIndex].data_cancelamento = new Date().toISOString();
        localStorage.setItem(key, JSON.stringify(notas));
    }
}

// ===== SALVAR NOTA EMITIDA =====
function salvarNotaEmitida(nota) {
    const user = getCurrentUser();
    if (!user || !user.id) return;
    const key = `notas_${user.id}`;
    const notas = JSON.parse(localStorage.getItem(key) || '[]');
    
    notas.push({
        ...nota,
        id: Date.now(),
        emitida_automaticamente: true,
        status: 'ativa'  // Status inicial
    });
    
    localStorage.setItem(key, JSON.stringify(notas));
}

// ===== BUSCA E SELEÇÃO DE PACIENTES =====

let pacienteSelecionadoAtual = null;
let pacientesListaCache = [];
let alertaValidacaoVisivel = false; // Flag para bloquear busca durante alerta de validação

// Função para editar paciente (abre modal de edição)
async function editarPaciente(pacienteId) {
    // Resetar flag de alerta e esconder o aviso
    alertaValidacaoVisivel = false;
    var resultadosDiv = document.getElementById('resultadosBusca');
    if (resultadosDiv) {
        resultadosDiv.style.display = 'none';
        resultadosDiv.innerHTML = '';
    }
    // Buscar dados completos do paciente no servidor
    var res = await apiCall('/api/pacientes/' + pacienteId);
    if (!res || !res.success || !res.paciente) {
        alert('Erro ao carregar dados do paciente');
        return;
    }
    
    var paciente = res.paciente;
    
    // Verificar se ModalPaciente está disponível
    if (typeof ModalPaciente !== 'undefined' && ModalPaciente.abrirEdicao) {
        ModalPaciente.abrirEdicao(paciente, function(pacienteAtualizado) {
            // Após salvar, limpar busca e mostrar mensagem
            document.getElementById('resultadosBusca').innerHTML = 
                '<div style="padding: 20px; text-align: center; background: #d1fae5; border-radius: 8px;">' +
                    '<div style="font-size: 24px; margin-bottom: 10px;">✅</div>' +
                    '<div style="color: #065f46; font-weight: 600;">Cadastro atualizado!</div>' +
                    '<div style="color: #047857; font-size: 14px; margin-top: 8px;">Busque o paciente novamente para continuar.</div>' +
                '</div>';
            document.getElementById('buscaPaciente').value = '';
            
            // Atualizar cache local
            var idx = pacientesListaCache.findIndex(function(p) { return p.id === pacienteId; });
            if (idx >= 0) {
                pacientesListaCache[idx] = pacienteAtualizado;
            }
        });
    } else {
        // Fallback: abrir página de pacientes
        window.open('pacientes.html?editar=' + pacienteId, '_blank');
    }
}

// Carregar pacientes no cache
async function carregarPacientesCache() {
    try {
        const res = await apiCall('/api/pacientes');
        if (res && res.success) {
            pacientesListaCache = res.pacientes || [];
        }
    } catch (e) {
        // Fallback para localStorage se API falhar
        if (window.pacientesFunctions) {
            pacientesListaCache = window.pacientesFunctions.obterPacientes() || [];
        }
    }
}

// Inicializar busca de paciente (chamar no carregamento da página)
function initBuscaPaciente() {
    carregarPacientesCache();
    
    const input = document.getElementById('buscaPaciente');
    if (input) {
        // Ao focar no campo, se já tiver texto, buscar
        input.addEventListener('focus', function() {
            if (this.value.trim().length >= 2) {
                buscarPacienteNota();
            }
        });
    }
}

// Buscar paciente enquanto digita - BUSCA NO SERVIDOR
var buscaPacienteNotaTimeout = null;

function buscarPacienteNota() {
    // Se alerta de validação está visível, não buscar
    if (alertaValidacaoVisivel) {
        return;
    }
    
    const termo = document.getElementById('buscaPaciente').value.trim();
    const resultadosDiv = document.getElementById('resultadosBusca');
    
    if (!termo || termo.length < 2) {
        resultadosDiv.style.display = 'none';
        alertaValidacaoVisivel = false; // Resetar flag
        return;
    }
    
    // Debounce - espera 300ms após parar de digitar
    clearTimeout(buscaPacienteNotaTimeout);
    buscaPacienteNotaTimeout = setTimeout(async function() {
        resultadosDiv.innerHTML = '<div style="padding: 15px; text-align: center; color: #666;">🔍 Buscando...</div>';
        resultadosDiv.style.display = 'block';
        
        // Buscar no servidor
        const res = await apiCall('/api/pacientes?busca=' + encodeURIComponent(termo) + '&limit=20');
        const resultados = (res && res.pacientes) ? res.pacientes : [];
        
        // Salvar resultados no cache para uso posterior
        resultados.forEach(function(p) {
            var idx = pacientesListaCache.findIndex(function(c) { return c.id === p.id; });
            if (idx >= 0) {
                pacientesListaCache[idx] = p; // Atualizar
            } else {
                pacientesListaCache.push(p); // Adicionar
            }
        });
        
        if (resultados.length === 0) {
            resultadosDiv.innerHTML = `
                <div style="padding: 1.5rem; text-align: center; color: #6b7280;">
                    <p style="margin-bottom: 0.5rem;">Nenhum paciente encontrado para "<strong>${termo}</strong>"</p>
                    <button class="btn btn-sm btn-primary" onclick="abrirCadastroRapido()" style="margin-top: 0.75rem;">
                        + Cadastrar Novo Paciente
                    </button>
                </div>
            `;
            return;
        }
        
        // Renderizar resultados
        renderizarResultadosBusca(resultados);
    }, 300);
}

// Renderizar lista de resultados da busca no servidor
function renderizarResultadosBusca(resultados) {
    const resultadosDiv = document.getElementById('resultadosBusca');
    
    // Formatar CPF e telefone
    function formatCPF(cpf) {
        if (!cpf) return 'Não informado';
        const nums = cpf.replace(/\D/g, '');
        if (nums.length === 11) {
            return nums.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        }
        return cpf;
    }
    
    function formatTel(tel) {
        if (!tel) return 'Não informado';
        const nums = tel.replace(/\D/g, '');
        if (nums.length === 11) {
            return nums.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (nums.length === 10) {
            return nums.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
        return tel;
    }
    
    // Verificar elegibilidade para NFS-e
    function verificarElegibilidadeNFSe(p) {
        var faltando = [];
        
        if (!p.menorIdade) {
            // Paciente maior de idade
            if (!p.cpf) faltando.push('CPF');
            if (!p.endereco) faltando.push('Endereço');
            if (!p.numero) faltando.push('Número');
            if (!p.bairro) faltando.push('Bairro');
            if (!p.cidade) faltando.push('Cidade');
            if (!p.estado) faltando.push('UF');
            if (!p.cep) faltando.push('CEP');
        } else {
            // Menor de idade - precisa dados do responsável
            if (!p.responsavelCpf) faltando.push('CPF Responsável');
            if (!p.responsavelNome) faltando.push('Nome Responsável');
            if (!p.endereco) faltando.push('Endereço');
            if (!p.bairro) faltando.push('Bairro');
            if (!p.cidade) faltando.push('Cidade');
            if (!p.cep) faltando.push('CEP');
        }
        
        return faltando;
    }
    
    // Mostrar resultados
    resultadosDiv.innerHTML = resultados.slice(0, 10).map(p => {
        const isMenor = p.menorIdade;
        const faltando = verificarElegibilidadeNFSe(p);
        const elegivel = faltando.length === 0;
        
        // Badges
        const badgeMenor = isMenor ? '<span style="background:#fff3e0;color:#e65100;font-size:10px;padding:2px 6px;border-radius:4px;margin-left:8px;">👶 Menor</span>' : '';
        
        // Status de elegibilidade
        let statusNFSe = '';
        if (elegivel) {
            statusNFSe = '<div style="background:#d1fae5;color:#065f46;padding:4px 8px;border-radius:4px;font-size:11px;margin-top:6px;">✅ Pronto para NFS-e</div>';
        } else {
            statusNFSe = '<div style="background:#fef3c7;color:#92400e;padding:4px 8px;border-radius:4px;font-size:11px;margin-top:6px;">⚠️ Falta: ' + faltando.slice(0,3).join(', ') + (faltando.length > 3 ? '...' : '') + '</div>';
        }
        
        return `
        <div style="padding: 1rem; border-bottom: 1px solid #e5e7eb; cursor: pointer; transition: background 0.2s;" 
             onmouseover="this.style.background='#ecfdf5'" 
             onmouseout="this.style.background='white'"
             onclick="selecionarPacienteNota('${p.id}')">
            <div style="font-weight: 600; color: #1f2937; margin-bottom: 0.25rem; display: flex; align-items: center;">
                ${p.nome}${badgeMenor}
            </div>
            <div style="font-size: 0.875rem; color: #6b7280;">
                CPF: ${formatCPF(p.cpf)} | Tel: ${formatTel(p.celular || p.telefone)}
            </div>
            ${statusNFSe}
        </div>
    `}).join('');
    
    // Adicionar botão de novo paciente no final
    resultadosDiv.innerHTML += `
        <div style="padding: 0.75rem; background: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
            <button class="btn btn-sm" style="background:#2d7a5f;color:#fff;font-size:12px;" onclick="abrirCadastroRapido()">
                + Cadastrar Novo Paciente
            </button>
        </div>
    `;
    
    resultadosDiv.style.display = 'block';
}

// Inicializar ao carregar página
document.addEventListener('DOMContentLoaded', function() {
    initBuscaPaciente();
});

// Selecionar paciente
async function selecionarPacienteNota(pacienteId) {
    // IMPORTANTE: Cancelar qualquer busca pendente
    clearTimeout(buscaPacienteNotaTimeout);
    
    let paciente = null;
    
    // Se recebeu um objeto (do modal de cadastro), usar diretamente
    if (typeof pacienteId === 'object' && pacienteId !== null) {
        paciente = pacienteId;
        pacientesListaCache.push(paciente);
    } else {
        // Buscar no cache primeiro (converter ID para string para comparação)
        var idBusca = String(pacienteId);
        paciente = pacientesListaCache.find(function(p) { return String(p.id) === idBusca; });
        
        // Se não encontrou no cache, buscar no servidor
        if (!paciente) {
            const res = await apiCall('/api/pacientes/' + pacienteId);
            if (res && res.success && res.paciente) {
                paciente = res.paciente;
                pacientesListaCache.push(paciente);
            }
        }
    }
    
    if (!paciente) {
        alert('⚠️ Paciente não encontrado!');
        return;
    }
    
    // ========== VALIDAÇÃO DE DADOS OBRIGATÓRIOS PARA NFS-e ==========
    // Baseado nas exigências da Receita Federal e DMED
    var dadosFaltantes = [];
    
    // DEBUG - remover depois
    console.log('=== VALIDAÇÃO NFS-e ===');
    console.log('Paciente:', paciente);
    console.log('CPF:', paciente.cpf);
    console.log('Endereço:', paciente.endereco);
    console.log('Número:', paciente.numero);
    console.log('Bairro:', paciente.bairro);
    console.log('Cidade:', paciente.cidade);
    console.log('Estado:', paciente.estado);
    console.log('CEP:', paciente.cep);
    
    // Para paciente maior de idade - dados do próprio paciente
    if (!paciente.menorIdade) {
        if (!paciente.cpf) dadosFaltantes.push('CPF');
        if (!paciente.nome) dadosFaltantes.push('Nome completo');
        if (!paciente.endereco) dadosFaltantes.push('Endereço (logradouro)');
        if (!paciente.numero) dadosFaltantes.push('Número');
        if (!paciente.bairro) dadosFaltantes.push('Bairro');
        if (!paciente.cidade) dadosFaltantes.push('Cidade');
        if (!paciente.estado) dadosFaltantes.push('Estado/UF');
        if (!paciente.cep) dadosFaltantes.push('CEP');
    } else {
        // Para MENOR DE IDADE - dados do responsável legal (NFS-e será no CPF do responsável)
        if (!paciente.responsavelCpf) dadosFaltantes.push('CPF do Responsável');
        if (!paciente.responsavelNome) dadosFaltantes.push('Nome do Responsável');
        // Endereço ainda é do paciente/responsável
        if (!paciente.endereco) dadosFaltantes.push('Endereço (logradouro)');
        if (!paciente.numero) dadosFaltantes.push('Número');
        if (!paciente.bairro) dadosFaltantes.push('Bairro');
        if (!paciente.cidade) dadosFaltantes.push('Cidade');
        if (!paciente.estado) dadosFaltantes.push('Estado/UF');
        if (!paciente.cep) dadosFaltantes.push('CEP');
    }
    
    // Se há dados faltantes, bloquear e mostrar alerta
    console.log('Dados faltantes:', dadosFaltantes);
    
    if (dadosFaltantes.length > 0) {
        console.log('ENTRANDO NO BLOCO DE DADOS FALTANTES');
        var msgHtml = '<div style="background: #fef2f2; border: 2px solid #dc2626; border-radius: 12px; padding: 20px; margin-top: 10px;">';
        msgHtml += '<div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">';
        msgHtml += '<span style="font-size: 28px;">🚫</span>';
        msgHtml += '<strong style="color: #991b1b; font-size: 16px;">CADASTRO INCOMPLETO PARA NFS-e</strong>';
        msgHtml += '</div>';
        msgHtml += '<p style="color: #7f1d1d; margin: 0 0 15px 0;">Para emitir nota fiscal, os seguintes dados são <strong>OBRIGATÓRIOS</strong> conforme exigência da Receita Federal:</p>';
        msgHtml += '<ul style="color: #991b1b; margin: 0 0 15px 0; padding-left: 20px;">';
        dadosFaltantes.forEach(function(dado) {
            msgHtml += '<li style="margin: 5px 0;"><strong>' + dado + '</strong></li>';
        });
        msgHtml += '</ul>';
        msgHtml += '<div style="background: #fee2e2; padding: 12px; border-radius: 8px; margin-bottom: 15px;">';
        msgHtml += '<small style="color: #991b1b;">⚠️ <strong>IMPORTANTE:</strong> Sem estes dados, não é possível emitir NFS-e válida e o paciente não poderá usar a nota para dedução no Imposto de Renda.</small>';
        msgHtml += '</div>';
        msgHtml += '<button type="button" class="btn" style="background: #dc2626; color: white; width: 100%;" onclick="editarPaciente(\'' + paciente.id + '\')">✏️ Completar Cadastro do Paciente</button>';
        msgHtml += '</div>';
        
        var resultadosDiv = document.getElementById('resultadosBusca');
        console.log('Elemento resultadosBusca:', resultadosDiv);
        console.log('HTML a inserir:', msgHtml);
        
        if (resultadosDiv) {
            // Bloquear novas buscas enquanto alerta está visível
            alertaValidacaoVisivel = true;
            
            // Desfocar o input para parar de disparar eventos
            document.getElementById('buscaPaciente').blur();
            
            resultadosDiv.innerHTML = msgHtml;
            resultadosDiv.setAttribute('style', 'display: block !important; position: absolute; left: 0; right: 0; top: 100%; z-index: 9999; background: white; border: 2px solid #dc2626; border-radius: 0.5rem; margin-top: 0.25rem; max-height: 400px; overflow-y: auto; box-shadow: 0 10px 40px rgba(0,0,0,0.3);');
            
            // Forçar repaint
            resultadosDiv.offsetHeight;
            
            console.log('ALERTA EXIBIDO COM SUCESSO');
            console.log('Display após set:', window.getComputedStyle(resultadosDiv).display);
        } else {
            console.error('ELEMENTO resultadosBusca NÃO ENCONTRADO!');
            alert('⚠️ Cadastro incompleto para NFS-e!\n\nFaltam: ' + dadosFaltantes.join(', '));
        }
        return; // BLOQUEIA a seleção
    }
    
    pacienteSelecionadoAtual = paciente;
    
    // Preencher dados
    document.getElementById('pacienteId').value = paciente.id;
    document.getElementById('pacienteNomeSel').textContent = paciente.nome;
    
    // Funções de formatação locais
    function formatCPF(cpf) {
        if (!cpf) return 'Não informado';
        const nums = cpf.replace(/\D/g, '');
        if (nums.length === 11) {
            return nums.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        }
        return cpf;
    }
    
    function formatTel(tel) {
        if (!tel) return 'Não informado';
        const nums = tel.replace(/\D/g, '');
        if (nums.length === 11) {
            return nums.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (nums.length === 10) {
            return nums.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
        return tel;
    }
    
    // CPF
    document.getElementById('pacienteCPFSel').textContent = formatCPF(paciente.cpf);
    
    // Telefone
    const telefone = paciente.celular || paciente.telefone;
    document.getElementById('pacienteTelSel').textContent = formatTel(telefone);
    
    // Email (se tiver)
    if (paciente.email) {
        document.getElementById('pacienteEmailDiv').style.display = 'block';
        document.getElementById('pacienteEmailSel').textContent = paciente.email;
    } else {
        document.getElementById('pacienteEmailDiv').style.display = 'none';
    }
    
    // Cidade (se tiver)
    if (paciente.cidade) {
        document.getElementById('pacienteCidadeDiv').style.display = 'block';
        document.getElementById('pacienteCidadeSel').textContent = `${paciente.cidade}/${paciente.estado || 'SC'}`;
    } else {
        document.getElementById('pacienteCidadeDiv').style.display = 'none';
    }
    
    // === SEÇÃO MENOR DE IDADE / RESPONSÁVEL ===
    const responsavelSection = document.getElementById('responsavelSection');
    if (responsavelSection) {
        if (paciente.menorIdade && paciente.responsavelNome) {
            document.getElementById('responsavelNomeSel').textContent = paciente.responsavelNome;
            document.getElementById('responsavelCPFSel').textContent = paciente.responsavelCpf || 'Não informado';
            document.getElementById('responsavelParentescoSel').textContent = paciente.responsavelParentesco || 'Não informado';
            responsavelSection.style.display = 'block';
        } else {
            responsavelSection.style.display = 'none';
        }
    }
    
    // Mostrar card do paciente selecionado
    document.getElementById('pacienteSelecionado').style.display = 'block';
    
    // Esconder busca
    document.getElementById('resultadosBusca').style.display = 'none';
    document.getElementById('buscaPaciente').value = paciente.nome;
    
    // Atualizar descrição se já houver procedimentos selecionados
    const checkboxes = document.querySelectorAll('input[name="procedimento"]:checked');
    if (checkboxes.length > 0 && typeof updateDescricaoMultipla === 'function') {
        updateDescricaoMultipla();
    }
}

// Limpar paciente selecionado
function limparPacienteSelecionado() {
    pacienteSelecionadoAtual = null;
    document.getElementById('pacienteId').value = '';
    document.getElementById('pacienteSelecionado').style.display = 'none';
    
    // Esconder seção de responsável
    const responsavelSection = document.getElementById('responsavelSection');
    if (responsavelSection) {
        responsavelSection.style.display = 'none';
    }
    
    document.getElementById('buscaPaciente').value = '';
    document.getElementById('buscaPaciente').focus();
}

// Abrir cadastro rápido
function abrirCadastroRapido() {
    // Se o modal completo estiver disponível, usar ele (suporta menor de idade)
    if (typeof ModalPaciente !== 'undefined') {
        ModalPaciente.abrir(function(novoPaciente) {
            // Selecionar o paciente recém criado
            selecionarPacienteNota(novoPaciente);
        });
        return;
    }
    
    // Fallback: modal simples (sem suporte a menor de idade)
    const nome = document.getElementById('buscaPaciente').value;
    
    const modal = document.createElement('div');
    modal.id = 'modalCadastroRapido';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <h3>👤 Cadastro Rápido de Paciente</h3>
            <p style="margin-bottom: 1.5rem; color: var(--text-light);">
                Preencha os dados essenciais. Você pode completar depois na área de Pacientes.
            </p>
            
            <form id="formCadastroRapido" onsubmit="salvarPacienteRapido(event)">
                <div class="form-group">
                    <label>Nome Completo *</label>
                    <input type="text" id="rapidoNome" required value="${nome}">
                </div>
                
                <div class="form-grid">
                    <div class="form-group">
                        <label>CPF *</label>
                        <input type="text" id="rapidoCPF" required placeholder="000.000.000-00" maxlength="14">
                    </div>
                    <div class="form-group">
                        <label>Telefone *</label>
                        <input type="tel" id="rapidoTelefone" required placeholder="(00) 00000-0000">
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="rapidoEmail" placeholder="[email protected]">
                </div>
                
                <div class="form-grid">
                    <div class="form-group">
                        <label>Cidade</label>
                        <input type="text" id="rapidoCidade" placeholder="Pomerode">
                    </div>
                    <div class="form-group">
                        <label>Estado</label>
                        <select id="rapidoEstado">
                            <option value="">Selecione...</option>
                            <option value="SC" selected>Santa Catarina</option>
                            <option value="PR">Paraná</option>
                            <option value="RS">Rio Grande do Sul</option>
                            <option value="SP">São Paulo</option>
                        </select>
                    </div>
                </div>
                
                <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 1rem; border-radius: 0.5rem; margin-top: 1rem;">
                    <p style="margin: 0; font-size: 0.875rem; color: #92400e;">
                        💡 <strong>Dica:</strong> Você pode adicionar mais informações (endereço completo, CEP, etc.) 
                        depois na área de Pacientes.
                    </p>
                </div>
            </form>
            
            <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                <button class="btn btn-secondary" onclick="fecharCadastroRapido()">Cancelar</button>
                <button class="btn btn-primary" onclick="document.getElementById('formCadastroRapido').requestSubmit()">
                    💾 Salvar e Usar
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Auto-formatação
    setTimeout(() => {
        const cpfInput = document.getElementById('rapidoCPF');
        cpfInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.substr(0, 11);
            if (value.length > 9) {
                value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
            } else if (value.length > 6) {
                value = value.replace(/(\d{3})(\d{3})(\d{3})/, '$1.$2.$3');
            } else if (value.length > 3) {
                value = value.replace(/(\d{3})(\d{3})/, '$1.$2');
            }
            e.target.value = value;
        });
        
        const telInput = document.getElementById('rapidoTelefone');
        telInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.substr(0, 11);
            if (value.length > 10) {
                value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
            } else if (value.length > 6) {
                value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
            } else if (value.length > 2) {
                value = value.replace(/(\d{2})(\d{0,5})/, '($1) $2');
            }
            e.target.value = value;
        });
        
        document.getElementById('rapidoNome').focus();
    }, 100);
}

// Fechar cadastro rápido
function fecharCadastroRapido() {
    const modal = document.getElementById('modalCadastroRapido');
    if (modal) modal.remove();
}

// Salvar paciente rápido
function salvarPacienteRapido(event) {
    event.preventDefault();
    
    const paciente = {
        id: 'pac_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        nome: document.getElementById('rapidoNome').value.trim(),
        cpf: document.getElementById('rapidoCPF').value.trim(),
        telefone: document.getElementById('rapidoTelefone').value.trim(),
        email: document.getElementById('rapidoEmail').value.trim(),
        cidade: document.getElementById('rapidoCidade').value.trim(),
        estado: document.getElementById('rapidoEstado').value,
        dataCadastro: new Date().toISOString(),
        cadastroRapido: true
    };
    
    // Validar CPF
    const cpfLimpo = paciente.cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) {
        alert('⚠️ CPF inválido! Digite os 11 dígitos.');
        return;
    }
    
    // Verificar se já existe
    if (window.pacientesFunctions) {
        const existente = window.pacientesFunctions.buscarPacientePorCPF(paciente.cpf);
        if (existente) {
            alert('⚠️ Já existe um paciente cadastrado com este CPF!');
            return;
        }
    }
    
    // Salvar no localStorage
    const user = getCurrentUser();
    if (!user || !user.id) {
        alert('⚠️ Sessão expirada! Por favor, faça login novamente.');
        window.location.href = 'login.html';
        return;
    }
    const key = `pacientes_${user.id}`;
    const pacientes = JSON.parse(localStorage.getItem(key) || '[]');
    pacientes.push(paciente);
    localStorage.setItem(key, JSON.stringify(pacientes));
    
    // Atualizar cache também
    pacientesListaCache.push(paciente);
    
    // Selecionar automaticamente
    selecionarPacienteNota(paciente.id);
    
    // Fechar modal
    fecharCadastroRapido();
    
    alert('✅ Paciente cadastrado com sucesso!\n\nVocê pode completar os dados depois na área de Pacientes.');
}

// Fechar resultados ao clicar fora
document.addEventListener('click', (e) => {
    // NÃO fechar se alerta de validação está visível
    if (alertaValidacaoVisivel) {
        return;
    }
    
    const busca = document.getElementById('buscaPaciente');
    const resultados = document.getElementById('resultadosBusca');
    
    if (busca && resultados && !busca.contains(e.target) && !resultados.contains(e.target)) {
        resultados.style.display = 'none';
    }
});
