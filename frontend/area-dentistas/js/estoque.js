// ==============================================================================
// SISTEMA DE ESTOQUE - DENTAL ULTRA
// Gerenciamento completo de produtos e materiais da clínica
// ==============================================================================

var EstoqueSystem = {
    produtos: [],
    historico: [],
    tipoEntradaSelecionado: null,
    produtoRetiradaId: null,

    // Inicializar
    init: function() {
        this.loadUserInfo();
        this.carregarDados();
        this.carregarProfissionais();
        this.renderizarProdutos();
        this.renderizarHistorico();
        this.atualizarEstatisticas();
    },

    // Carregar informações do usuário
    loadUserInfo: function() {
        var user = this.getCurrentUser();
        if (user) {
            document.getElementById('userName').textContent = user.name || 'Usuário';
            document.getElementById('userCRO').textContent = 'CRO: ' + (user.cro || '-----');
        }
    },

    // Obter usuário atual
    getCurrentUser: function() {
        var userStr = localStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    },

    // Carregar dados do localStorage
    carregarDados: function() {
        var user = this.getCurrentUser();
        if (!user) return;

        this.produtos = JSON.parse(localStorage.getItem('estoque_produtos_' + user.id) || '[]');
        this.historico = JSON.parse(localStorage.getItem('estoque_historico_' + user.id) || '[]');
    },

    // Salvar dados no localStorage
    salvarDados: function() {
        var user = this.getCurrentUser();
        if (!user) return;

        localStorage.setItem('estoque_produtos_' + user.id, JSON.stringify(this.produtos));
        localStorage.setItem('estoque_historico_' + user.id, JSON.stringify(this.historico));
    },

    // Carregar profissionais para o select de retirada
    carregarProfissionais: function() {
        var user = this.getCurrentUser();
        var select = document.getElementById('profissionalRetirada');
        
        // Limpar options
        select.innerHTML = '<option value="">Selecione...</option>';
        
        // Adicionar usuário atual
        if (user && user.name) {
            var opt = document.createElement('option');
            opt.value = user.name;
            opt.textContent = user.name;
            select.appendChild(opt);
        }

        // Carregar outros profissionais cadastrados (se houver)
        var profissionais = JSON.parse(localStorage.getItem('profissionais_' + (user ? user.id : '')) || '[]');
        profissionais.forEach(function(p) {
            var opt = document.createElement('option');
            opt.value = p.nome;
            opt.textContent = p.nome;
            select.appendChild(opt);
        });
    },

    // Renderizar lista de produtos
    renderizarProdutos: function(filtro) {
        var container = document.getElementById('listaProdutos');
        var lista = filtro ? this.produtos.filter(function(p) {
            return p.nome.toLowerCase().includes(filtro.toLowerCase());
        }) : this.produtos;

        if (lista.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📦</div>
                    <h3>${filtro ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}</h3>
                    <p>${filtro ? 'Tente outro termo de busca' : 'Clique em "Fazer Entrada no Estoque" para adicionar produtos'}</p>
                </div>
            `;
            return;
        }

        var html = '';
        var self = this;

        lista.forEach(function(p) {
            var statusClass = 'ok';
            if (p.quantidade === 0) {
                statusClass = 'baixo';
            } else if (p.quantidade < p.quantidadeIdeal) {
                statusClass = 'medio';
            }

            html += `
                <div class="estoque-item" data-id="${p.id}">
                    <div class="produto-nome">
                        ${p.nome}
                        ${p.categoria ? '<small>' + p.categoria + '</small>' : ''}
                    </div>
                    <div class="quantidade ${statusClass}">${p.quantidade}</div>
                    <div style="text-align:center;">
                        <button class="btn-retirada" onclick="EstoqueSystem.abrirModalRetirada('${p.id}')">FAZER RETIRADA</button>
                    </div>
                    <div class="produto-actions">
                        <button class="btn-icon edit" onclick="EstoqueSystem.abrirModalEditar('${p.id}')" title="Editar">✏️</button>
                        <button class="btn-icon delete" onclick="EstoqueSystem.abrirModalExcluir('${p.id}')" title="Excluir">🗑️</button>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    },

    // Renderizar histórico de retiradas
    renderizarHistorico: function(filtro) {
        var container = document.getElementById('listaHistorico');
        var lista = filtro ? this.historico.filter(function(h) {
            return h.produtoNome.toLowerCase().includes(filtro.toLowerCase());
        }) : this.historico;

        // Ordenar por data (mais recente primeiro)
        lista.sort(function(a, b) {
            return new Date(b.data) - new Date(a.data);
        });

        if (lista.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <h3>Nenhuma retirada registrada</h3>
                    <p>O histórico de retiradas aparecerá aqui</p>
                </div>
            `;
            return;
        }

        var html = '';
        lista.forEach(function(h) {
            html += `
                <div class="historico-item">
                    <div class="produto-nome">${h.produtoNome}</div>
                    <div style="text-align:center; font-weight: 600; color: #dc2626;">${h.quantidade}</div>
                    <div>${h.retiradoPor}</div>
                    <div>${h.autorizadoPor}</div>
                    <div style="text-align:right; color: #6b7280;">${EstoqueSystem.formatarData(h.data)}</div>
                </div>
            `;
        });

        container.innerHTML = html;
    },

    // Atualizar estatísticas
    atualizarEstatisticas: function() {
        var total = this.produtos.length;
        var baixos = 0;
        var zerados = 0;

        this.produtos.forEach(function(p) {
            if (p.quantidade === 0) {
                zerados++;
            } else if (p.quantidade < p.quantidadeIdeal) {
                baixos++;
            }
        });

        // Retiradas do mês atual
        var hoje = new Date();
        var mesAtual = hoje.getMonth();
        var anoAtual = hoje.getFullYear();
        var retiradasMes = this.historico.filter(function(h) {
            var d = new Date(h.data);
            return d.getMonth() === mesAtual && d.getFullYear() === anoAtual;
        }).length;

        document.getElementById('totalProdutos').textContent = total;
        document.getElementById('produtosBaixos').textContent = baixos;
        document.getElementById('produtosZerados').textContent = zerados;
        document.getElementById('totalRetiradas').textContent = retiradasMes;

        // Mostrar/ocultar alerta
        var alerta = document.getElementById('alertaEstoqueBaixo');
        var produtosCriticos = baixos + zerados;
        if (produtosCriticos > 0) {
            alerta.classList.remove('hidden');
            document.getElementById('qtdProdutosBaixos').textContent = produtosCriticos;
        } else {
            alerta.classList.add('hidden');
        }
    },

    // Formatar data
    formatarData: function(dataStr) {
        var d = new Date(dataStr);
        return d.toLocaleDateString('pt-BR');
    },

    // Gerar ID único
    gerarId: function() {
        return 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
};

// ============================================================================
// FUNÇÕES GLOBAIS (chamadas pelo HTML)
// ============================================================================

// Trocar tab
function trocarTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(function(btn) {
        btn.classList.remove('active');
    });
    document.querySelector('[data-tab="' + tab + '"]').classList.add('active');

    document.getElementById('tabEstoque').style.display = tab === 'estoque' ? 'block' : 'none';
    document.getElementById('tabHistorico').style.display = tab === 'historico' ? 'block' : 'none';
}

// Filtrar produtos
function filtrarProdutos() {
    var termo = document.getElementById('buscaProduto').value;
    EstoqueSystem.renderizarProdutos(termo);
    EstoqueSystem.renderizarHistorico(termo);
}

// Filtrar produtos com estoque baixo
function filtrarBaixoEstoque() {
    // Filtrar apenas produtos com quantidade abaixo do ideal
    var container = document.getElementById('listaProdutos');
    var lista = EstoqueSystem.produtos.filter(function(p) {
        return p.quantidade < p.quantidadeIdeal;
    });

    if (lista.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">✅</div>
                <h3>Tudo certo!</h3>
                <p>Todos os produtos estão com estoque adequado</p>
            </div>
        `;
        return;
    }

    var html = '';
    lista.forEach(function(p) {
        var statusClass = p.quantidade === 0 ? 'baixo' : 'medio';

        html += `
            <div class="estoque-item" data-id="${p.id}">
                <div class="produto-nome">
                    ${p.nome}
                    ${p.categoria ? '<small>' + p.categoria + '</small>' : ''}
                </div>
                <div class="quantidade ${statusClass}">${p.quantidade}</div>
                <div style="text-align:center;">
                    <button class="btn-retirada" onclick="EstoqueSystem.abrirModalRetirada('${p.id}')">FAZER RETIRADA</button>
                </div>
                <div class="produto-actions">
                    <button class="btn-icon edit" onclick="EstoqueSystem.abrirModalEditar('${p.id}')" title="Editar">✏️</button>
                    <button class="btn-icon delete" onclick="EstoqueSystem.abrirModalExcluir('${p.id}')" title="Excluir">🗑️</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// ============================================================================
// MODAL: ENTRADA NO ESTOQUE
// ============================================================================

function abrirModalEntrada() {
    // Reset
    EstoqueSystem.tipoEntradaSelecionado = null;
    document.getElementById('tipoEntradaContainer').style.display = 'grid';
    document.getElementById('formEntrada').style.display = 'none';
    document.getElementById('btnAdicionarEstoque').disabled = true;
    
    document.querySelectorAll('.tipo-card').forEach(function(card) {
        card.classList.remove('selected');
    });

    // Limpar campos
    document.getElementById('nomeProduto').value = '';
    document.getElementById('quantidadeEntrada').value = '1';
    document.getElementById('quantidadeIdeal').value = '10';
    document.getElementById('categoriaProduto').value = '';
    document.getElementById('selectProdutoExistente').value = '';

    document.getElementById('modalEntrada').classList.add('show');
}

function selecionarTipoEntrada(tipo) {
    EstoqueSystem.tipoEntradaSelecionado = tipo;
    
    document.querySelectorAll('.tipo-card').forEach(function(card) {
        card.classList.remove('selected');
    });
    document.querySelector('[data-tipo="' + tipo + '"]').classList.add('selected');

    // Mostrar formulário
    document.getElementById('formEntrada').style.display = 'block';
    document.getElementById('btnAdicionarEstoque').disabled = false;

    if (tipo === 'existente') {
        document.getElementById('grupoProdutoExistente').style.display = 'block';
        document.getElementById('grupoNomeProduto').style.display = 'none';

        // Popular select de produtos existentes
        var select = document.getElementById('selectProdutoExistente');
        select.innerHTML = '<option value="">Selecione...</option>';
        EstoqueSystem.produtos.forEach(function(p) {
            var opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = p.nome + ' (Estoque: ' + p.quantidade + ')';
            select.appendChild(opt);
        });
    } else {
        document.getElementById('grupoProdutoExistente').style.display = 'none';
        document.getElementById('grupoNomeProduto').style.display = 'block';
    }
}

function adicionarAoEstoque() {
    var tipo = EstoqueSystem.tipoEntradaSelecionado;
    var quantidade = parseInt(document.getElementById('quantidadeEntrada').value) || 0;
    var quantidadeIdeal = parseInt(document.getElementById('quantidadeIdeal').value) || 10;

    if (quantidade < 1) {
        alert('⚠️ Informe uma quantidade válida!');
        return;
    }

    if (tipo === 'existente') {
        // Adicionar a produto existente
        var produtoId = document.getElementById('selectProdutoExistente').value;
        if (!produtoId) {
            alert('⚠️ Selecione um produto!');
            return;
        }

        var produto = EstoqueSystem.produtos.find(function(p) { return p.id === produtoId; });
        if (produto) {
            produto.quantidade += quantidade;
            produto.quantidadeIdeal = quantidadeIdeal;
            produto.atualizadoEm = new Date().toISOString();
        }
    } else {
        // Criar novo produto
        var nome = document.getElementById('nomeProduto').value.trim();
        if (!nome) {
            alert('⚠️ Informe o nome do produto!');
            return;
        }

        // Verificar se já existe
        var existe = EstoqueSystem.produtos.find(function(p) {
            return p.nome.toLowerCase() === nome.toLowerCase();
        });

        if (existe) {
            alert('⚠️ Já existe um produto com este nome!\nUse a opção "Produto que já tenho cadastrado" para aumentar a quantidade.');
            return;
        }

        var novoProduto = {
            id: EstoqueSystem.gerarId(),
            nome: nome,
            quantidade: quantidade,
            quantidadeIdeal: quantidadeIdeal,
            categoria: document.getElementById('categoriaProduto').value,
            criadoEm: new Date().toISOString(),
            atualizadoEm: new Date().toISOString()
        };

        EstoqueSystem.produtos.push(novoProduto);
    }

    // Salvar e atualizar
    EstoqueSystem.salvarDados();
    EstoqueSystem.renderizarProdutos();
    EstoqueSystem.atualizarEstatisticas();

    fecharModal('modalEntrada');
    alert('✅ Produto adicionado ao estoque com sucesso!');

    // Marcar tarefa do onboarding (se existir)
    if (typeof OnboardingSystem !== 'undefined') {
        OnboardingSystem.completeTask('estoque');
    }
}

// ============================================================================
// MODAL: RETIRADA
// ============================================================================

EstoqueSystem.abrirModalRetirada = function(produtoId) {
    var produto = this.produtos.find(function(p) { return p.id === produtoId; });
    if (!produto) return;

    this.produtoRetiradaId = produtoId;

    document.getElementById('retiradaProdutoNome').textContent = produto.nome;
    document.getElementById('retiradaEstoqueAtual').textContent = produto.quantidade;
    document.getElementById('quantidadeRetirada').value = '1';
    document.getElementById('quantidadeRetirada').max = produto.quantidade;
    document.getElementById('profissionalRetirada').value = '';

    document.getElementById('modalRetirada').classList.add('show');
};

function confirmarRetirada() {
    var quantidade = parseInt(document.getElementById('quantidadeRetirada').value) || 0;
    var profissional = document.getElementById('profissionalRetirada').value;

    if (quantidade < 1) {
        alert('⚠️ Informe uma quantidade válida!');
        return;
    }

    if (!profissional) {
        alert('⚠️ Selecione o profissional responsável!');
        return;
    }

    var produto = EstoqueSystem.produtos.find(function(p) { 
        return p.id === EstoqueSystem.produtoRetiradaId; 
    });

    if (!produto) return;

    if (quantidade > produto.quantidade) {
        alert('⚠️ Quantidade de retirada maior que o estoque disponível!');
        return;
    }

    // Reduzir estoque
    produto.quantidade -= quantidade;
    produto.atualizadoEm = new Date().toISOString();

    // Registrar no histórico
    var user = EstoqueSystem.getCurrentUser();
    var registro = {
        id: 'ret_' + Date.now(),
        produtoId: produto.id,
        produtoNome: produto.nome,
        quantidade: quantidade,
        retiradoPor: profissional,
        autorizadoPor: user ? user.name : profissional,
        data: new Date().toISOString()
    };

    EstoqueSystem.historico.push(registro);

    // Salvar e atualizar
    EstoqueSystem.salvarDados();
    EstoqueSystem.renderizarProdutos();
    EstoqueSystem.renderizarHistorico();
    EstoqueSystem.atualizarEstatisticas();

    fecharModal('modalRetirada');
    alert('✅ Retirada registrada com sucesso!');
}

// ============================================================================
// MODAL: EDITAR
// ============================================================================

EstoqueSystem.abrirModalEditar = function(produtoId) {
    var produto = this.produtos.find(function(p) { return p.id === produtoId; });
    if (!produto) return;

    document.getElementById('editarProdutoId').value = produtoId;
    document.getElementById('editarNomeProduto').value = produto.nome;
    document.getElementById('editarQuantidade').value = produto.quantidade;
    document.getElementById('editarQuantidadeIdeal').value = produto.quantidadeIdeal;
    document.getElementById('editarCategoria').value = produto.categoria || '';

    document.getElementById('modalEditar').classList.add('show');
};

function salvarEdicao() {
    var produtoId = document.getElementById('editarProdutoId').value;
    var nome = document.getElementById('editarNomeProduto').value.trim();
    var quantidadeIdeal = parseInt(document.getElementById('editarQuantidadeIdeal').value) || 10;
    var categoria = document.getElementById('editarCategoria').value;

    if (!nome) {
        alert('⚠️ Informe o nome do produto!');
        return;
    }

    var produto = EstoqueSystem.produtos.find(function(p) { return p.id === produtoId; });
    if (!produto) return;

    produto.nome = nome;
    produto.quantidadeIdeal = quantidadeIdeal;
    produto.categoria = categoria;
    produto.atualizadoEm = new Date().toISOString();

    // Salvar e atualizar
    EstoqueSystem.salvarDados();
    EstoqueSystem.renderizarProdutos();
    EstoqueSystem.atualizarEstatisticas();

    fecharModal('modalEditar');
    alert('✅ Produto atualizado com sucesso!');
}

// ============================================================================
// MODAL: EXCLUIR
// ============================================================================

EstoqueSystem.abrirModalExcluir = function(produtoId) {
    var produto = this.produtos.find(function(p) { return p.id === produtoId; });
    if (!produto) return;

    document.getElementById('excluirProdutoId').value = produtoId;
    document.getElementById('excluirProdutoNome').textContent = produto.nome;

    document.getElementById('modalExcluir').classList.add('show');
};

function confirmarExclusao() {
    var produtoId = document.getElementById('excluirProdutoId').value;

    // Remover produto
    EstoqueSystem.produtos = EstoqueSystem.produtos.filter(function(p) {
        return p.id !== produtoId;
    });

    // Remover histórico relacionado
    EstoqueSystem.historico = EstoqueSystem.historico.filter(function(h) {
        return h.produtoId !== produtoId;
    });

    // Salvar e atualizar
    EstoqueSystem.salvarDados();
    EstoqueSystem.renderizarProdutos();
    EstoqueSystem.renderizarHistorico();
    EstoqueSystem.atualizarEstatisticas();

    fecharModal('modalExcluir');
    alert('✅ Produto excluído com sucesso!');
}

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

function fecharModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

async function logout() {
    const confirmado = await mostrarConfirmacao(
        'Deseja realmente sair do sistema?',
        'Sair',
        'Sim, Sair',
        'Cancelar'
    );
    
    if (confirmado) {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }
}

// Fechar modais ao clicar fora
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('show');
    }
});

// Fechar modais com ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.show').forEach(function(modal) {
            modal.classList.remove('show');
        });
    }
});

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    EstoqueSystem.init();
});

// Expor globalmente
window.EstoqueSystem = EstoqueSystem;
