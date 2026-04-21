// ==============================================================================
// MODAL DE AGENDAMENTO - DENTAL ULTRA
// Modal popup com detalhes e ações do agendamento
// ==============================================================================

var ModalAgendamento = {
    agendamentoAtual: null,
    
    // Estilos do modal
    styles: `
        .modal-agendamento-overlay {
            display: none;
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 2000;
            align-items: flex-start;
            justify-content: center;
            padding: 60px 20px 20px;
        }
        .modal-agendamento-overlay.show { display: flex; }
        
        .modal-agendamento-wrapper {
            position: relative;
            width: 100%;
            max-width: 420px;
        }
        
        .modal-agendamento {
            background: #fff;
            border-radius: 16px;
            width: 100%;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            animation: slideDown 0.3s ease;
            overflow: visible;
            position: relative;
        }
        
        @keyframes slideDown {
            from { transform: translateY(-30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        
        .modal-ag-header {
            padding: 20px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }
        
        .modal-ag-header-left {
            display: flex;
            gap: 15px;
        }
        
        .modal-ag-avatar {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: #e5e7eb;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            color: #6b7280;
        }
        
        .modal-ag-info h3 {
            margin: 0 0 5px 0;
            font-size: 18px;
            color: #1f2937;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .modal-ag-info h3 a {
            color: #2d7a5f;
            font-size: 14px;
            text-decoration: none;
        }
        
        .modal-ag-info h3 a:hover {
            text-decoration: underline;
        }
        
        .modal-ag-telefone {
            color: #6b7280;
            font-size: 14px;
            margin: 0 0 5px 0;
        }
        
        .modal-ag-datetime {
            color: #9ca3af;
            font-size: 13px;
            margin: 0;
        }
        
        .modal-ag-actions-top {
            display: flex;
            gap: 8px;
        }
        
        .modal-ag-btn-icon {
            width: 36px;
            height: 36px;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }
        
        .modal-ag-btn-copy {
            background: #f3f4f6;
            color: #6b7280;
        }
        
        .modal-ag-btn-copy:hover { background: #e5e7eb; }
        
        .modal-ag-btn-edit {
            background: #dbeafe;
            color: #2563eb;
        }
        
        .modal-ag-btn-edit:hover { background: #bfdbfe; }
        
        .modal-ag-btn-delete {
            background: #fee2e2;
            color: #dc2626;
        }
        
        .modal-ag-btn-delete:hover { background: #fecaca; }
        
        .modal-ag-body {
            padding: 0 20px 20px;
        }
        
        .modal-ag-status-row {
            margin-bottom: 15px;
        }
        
        .modal-ag-status-select {
            width: 100%;
            padding: 12px 15px;
            border: 2px solid #e5e7eb;
            border-radius: 10px;
            font-size: 14px;
            cursor: pointer;
            background: #fff;
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 15px center;
        }
        
        .modal-ag-status-select.confirmado { border-color: #22c55e; color: #16a34a; }
        .modal-ag-status-select.cancelado { border-color: #ef4444; color: #dc2626; }
        .modal-ag-status-select.pendente { border-color: #f59e0b; color: #d97706; }
        .modal-ag-status-select.aguardando { border-color: #3b82f6; color: #2563eb; }
        .modal-ag-status-select.atendido { border-color: #8b5cf6; color: #7c3aed; }
        .modal-ag-status-select.faltou { border-color: #6b7280; color: #4b5563; }
        
        .modal-ag-whatsapp-btns {
            display: flex;
            gap: 10px;
            margin-bottom: 15px;
        }
        
        .modal-ag-whatsapp-btn {
            flex: 1;
            padding: 10px 12px;
            border: 2px solid #25D366;
            border-radius: 10px;
            background: #fff;
            color: #25D366;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            transition: all 0.2s;
        }
        
        .modal-ag-whatsapp-btn:hover {
            background: #25D366;
            color: #fff;
        }
        
        .modal-ag-whatsapp-btn.recados {
            border-color: #f59e0b;
            color: #d97706;
        }
        
        .modal-ag-whatsapp-btn.recados:hover {
            background: #f59e0b;
            color: #fff;
        }
        
        .modal-ag-whatsapp-btn svg {
            width: 18px;
            height: 18px;
        }
        
        .modal-ag-row {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 0;
            border-bottom: 1px solid #f3f4f6;
        }
        
        .modal-ag-row:last-child { border-bottom: none; }
        
        .modal-ag-row-icon {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            background: #f3f4f6;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
        }
        
        .modal-ag-row-content {
            flex: 1;
        }
        
        .modal-ag-row-label {
            font-size: 12px;
            color: #9ca3af;
        }
        
        .modal-ag-row-value {
            font-size: 14px;
            color: #1f2937;
        }
        
        .modal-ag-row-action {
            color: #2d7a5f;
            font-size: 13px;
            text-decoration: none;
            cursor: pointer;
        }
        
        .modal-ag-row-action:hover { text-decoration: underline; }
        
        .modal-ag-obs {
            margin-top: 15px;
        }
        
        .modal-ag-obs-label {
            font-size: 12px;
            color: #9ca3af;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        
        .modal-ag-obs-input {
            width: 100%;
            padding: 10px 12px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 14px;
            resize: none;
            min-height: 60px;
        }
        
        .modal-ag-obs-input:focus {
            outline: none;
            border-color: #2d7a5f;
        }
        
        .modal-ag-tags {
            margin-top: 15px;
        }
        
        .modal-ag-tags-label {
            font-size: 12px;
            color: #9ca3af;
            margin-bottom: 8px;
        }
        
        .modal-ag-tags-row {
            display: flex;
            gap: 10px;
        }
        
        .modal-ag-tags-select {
            flex: 1;
            padding: 10px 12px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 14px;
        }
        
        .modal-ag-btn-salvar {
            padding: 10px 16px;
            background: linear-gradient(135deg, #2d7a5f, #3d9970);
            color: #fff;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            white-space: nowrap;
        }
        
        .modal-ag-btn-salvar:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(45, 122, 95, 0.3);
        }
        
        .modal-ag-close {
            position: absolute;
            top: -45px;
            right: 0;
            background: #fff;
            border: none;
            font-size: 24px;
            color: #6b7280;
            cursor: pointer;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10;
            transition: all 0.2s;
            line-height: 1;
            box-shadow: 0 2px 10px rgba(0,0,0,0.15);
        }
        
        .modal-ag-close:hover { 
            background: #fee2e2;
            color: #dc2626;
            transform: scale(1.1);
        }
    `,

    // Inicializar
    init: function() {
        this.injectStyles();
    },

    // Injetar estilos
    injectStyles: function() {
        if (!document.getElementById('modal-agendamento-styles')) {
            var style = document.createElement('style');
            style.id = 'modal-agendamento-styles';
            style.textContent = this.styles;
            document.head.appendChild(style);
        }
    },

    // Abrir modal
    abrir: function(agendamento, paciente) {
        this.init();
        this.agendamentoAtual = agendamento;
        
        // Formatar data
        var dataObj = new Date(agendamento.data + 'T00:00:00');
        var dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
        var meses = ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];
        var dataFormatada = dias[dataObj.getDay()] + ', ' + dataObj.getDate() + ' de ' + meses[dataObj.getMonth()] + ' • ' + agendamento.horaInicio + ' - ' + agendamento.horaFim;
        
        // Telefone formatado
        var telefone = paciente.celular || paciente.telefone || 'Não informado';
        
        // Status atual
        var status = agendamento.status || 'pendente';
        
        // Obter iniciais do paciente
        var iniciais = paciente.nome.split(' ').map(function(n) { return n[0]; }).join('').substring(0, 2).toUpperCase();
        
        var html = `
            <div class="modal-agendamento-overlay show" id="modalAgendamentoOverlay" onclick="ModalAgendamento.fecharSeClicouFora(event)">
                <div class="modal-agendamento-wrapper" onclick="event.stopPropagation()">
                    <button class="modal-ag-close" onclick="ModalAgendamento.fechar()" title="Fechar">×</button>
                    <div class="modal-agendamento">
                        <div class="modal-ag-header" style="background: ${this.getStatusColor(status)}15;">
                            <div class="modal-ag-header-left">
                                <div class="modal-ag-avatar" style="background: ${this.getStatusColor(status)}30; color: ${this.getStatusColor(status)};">
                                    ${iniciais}
                                </div>
                                <div class="modal-ag-info">
                                    <h3>
                                        ${paciente.nome}
                                        <a href="paciente-detalhe.html?id=${paciente.id}" title="Ver ficha completa">↗</a>
                                    </h3>
                                    <p class="modal-ag-telefone">${this.formatarTelefone(telefone)}</p>
                                    <p class="modal-ag-datetime">${dataFormatada}</p>
                                </div>
                            </div>
                            <div class="modal-ag-actions-top">
                                <button class="modal-ag-btn-icon modal-ag-btn-copy" onclick="ModalAgendamento.copiarDados()" title="Copiar dados">
                                    📋
                                </button>
                                <button class="modal-ag-btn-icon modal-ag-btn-edit" onclick="ModalAgendamento.editar()" title="Editar">
                                    ✏️
                                </button>
                                <button class="modal-ag-btn-icon modal-ag-btn-delete" onclick="ModalAgendamento.excluir()" title="Excluir">
                                🗑️
                            </button>
                        </div>
                    </div>
                    
                    <div class="modal-ag-body">
                        <div class="modal-ag-status-row">
                            <select class="modal-ag-status-select ${status}" id="agStatusSelect" onchange="ModalAgendamento.alterarStatus(this.value)">
                                <option value="pendente" ${status === 'pendente' ? 'selected' : ''}>⏳ Pendente</option>
                                <option value="confirmado" ${status === 'confirmado' ? 'selected' : ''}>✅ Confirmado</option>
                                <option value="aguardando" ${status === 'aguardando' ? 'selected' : ''}>🏥 Aguardando atendimento</option>
                                <option value="atendido" ${status === 'atendido' ? 'selected' : ''}>✔️ Atendido</option>
                                <option value="faltou" ${status === 'faltou' ? 'selected' : ''}>❌ Paciente faltou</option>
                                <option value="cancelado" ${status === 'cancelado' ? 'selected' : ''}>🚫 Cancelado</option>
                            </select>
                        </div>
                        
                        <div class="modal-ag-whatsapp-btns">
                            <button class="modal-ag-whatsapp-btn" onclick="ModalAgendamento.abrirWhatsApp()">
                                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                Confirmar consulta
                            </button>
                            <button class="modal-ag-whatsapp-btn recados" onclick="ModalAgendamento.enviarRecados()">
                                📞 Avisar recados
                            </button>
                        </div>
                        
                        <div class="modal-ag-row">
                            <div class="modal-ag-row-icon">👨‍⚕️</div>
                            <div class="modal-ag-row-content">
                                <div class="modal-ag-row-label">Profissional</div>
                                <div class="modal-ag-row-value">${agendamento.dentista || 'Não definido'}</div>
                            </div>
                        </div>
                        
                        <div class="modal-ag-row">
                            <div class="modal-ag-row-icon">🦷</div>
                            <div class="modal-ag-row-content">
                                <div class="modal-ag-row-label">Procedimento</div>
                                <div class="modal-ag-row-value">${agendamento.procedimento || 'Consulta'}</div>
                            </div>
                        </div>
                        
                        <div class="modal-ag-row">
                            <div class="modal-ag-row-icon">📅</div>
                            <div class="modal-ag-row-content">
                                <div class="modal-ag-row-label">Alerta de retorno</div>
                                <div class="modal-ag-row-value">${agendamento.alertaRetorno || 'Não configurado'}</div>
                            </div>
                            <span class="modal-ag-row-action" onclick="ModalAgendamento.configurarRetorno()">Configurar</span>
                        </div>
                        
                        <div class="modal-ag-obs">
                            <div class="modal-ag-obs-label">
                                📝 Observação da consulta
                            </div>
                            <textarea class="modal-ag-obs-input" id="agObservacao" placeholder="Adicione uma observação...">${agendamento.observacao || ''}</textarea>
                        </div>
                        
                        <div class="modal-ag-tags">
                            <div class="modal-ag-tags-label">🏷️ Rótulo</div>
                            <div class="modal-ag-tags-row">
                                <select class="modal-ag-tags-select" id="agRotulo">
                                    <option value="">Selecione um rótulo...</option>
                                    <option value="primeira_consulta" ${agendamento.rotulo === 'primeira_consulta' ? 'selected' : ''}>🆕 Primeira consulta</option>
                                    <option value="retorno" ${agendamento.rotulo === 'retorno' ? 'selected' : ''}>🔄 Retorno</option>
                                    <option value="urgencia" ${agendamento.rotulo === 'urgencia' ? 'selected' : ''}>🚨 Urgência</option>
                                    <option value="procedimento" ${agendamento.rotulo === 'procedimento' ? 'selected' : ''}>🦷 Procedimento</option>
                                    <option value="avaliacao" ${agendamento.rotulo === 'avaliacao' ? 'selected' : ''}>📋 Avaliação</option>
                                </select>
                                <button class="modal-ag-btn-salvar" onclick="ModalAgendamento.salvarAlteracoes()">💾 Salvar</button>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
            </div>
        `;
        
        // Remover modal existente
        this.fechar();
        
        // Adicionar novo modal
        document.body.insertAdjacentHTML('beforeend', html);
        
        // Salvar referência do paciente
        this.pacienteAtual = paciente;
    },

    // Fechar modal
    fechar: function() {
        var modal = document.getElementById('modalAgendamentoOverlay');
        if (modal) modal.remove();
    },

    // Fechar se clicou fora
    fecharSeClicouFora: function(event) {
        if (event.target.classList.contains('modal-agendamento-overlay')) {
            this.salvarAlteracoes();
            this.fechar();
        }
    },

    // Obter cor do status
    getStatusColor: function(status) {
        var cores = {
            pendente: '#f59e0b',
            confirmado: '#22c55e',
            cancelado: '#ef4444',
            aguardando: '#3b82f6',
            atendido: '#8b5cf6',
            faltou: '#6b7280'
        };
        return cores[status] || '#6b7280';
    },

    // Formatar telefone
    formatarTelefone: function(tel) {
        if (!tel || tel === 'Não informado') return tel;
        var nums = tel.replace(/\D/g, '');
        if (nums.length === 11) {
            return '+55 ' + nums.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (nums.length === 10) {
            return '+55 ' + nums.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
        return tel;
    },

    // Alterar status
    alterarStatus: function(novoStatus) {
        var select = document.getElementById('agStatusSelect');
        select.className = 'modal-ag-status-select ' + novoStatus;
        
        if (this.agendamentoAtual) {
            this.agendamentoAtual.status = novoStatus;
        }
        
        // Disparar evento de atualização
        document.dispatchEvent(new CustomEvent('agendamentoAtualizado', {
            detail: { agendamento: this.agendamentoAtual, campo: 'status', valor: novoStatus }
        }));
    },

    // Abrir WhatsApp para confirmar consulta
    abrirWhatsApp: function() {
        console.log('Modal: abrirWhatsApp chamado');
        console.log('pacienteAtual:', this.pacienteAtual);
        console.log('agendamentoAtual:', this.agendamentoAtual);
        
        if (!this.pacienteAtual) {
            console.log('Erro: pacienteAtual nulo');
            return;
        }
        
        var celular = this.pacienteAtual.celular;
        console.log('Celular encontrado:', celular);
        
        if (!celular) {
            if (typeof mostrarAviso === 'function') {
                mostrarAviso('Paciente nao possui celular cadastrado!');
            } else {
                alert('Paciente nao possui celular cadastrado!');
            }
            return;
        }
        
        if (typeof WhatsAppIntegration !== 'undefined') {
            var clinica = WhatsAppIntegration.getClinicaData();
            console.log('Clinica:', clinica);
            WhatsAppIntegration.enviarConfirmacao(this.pacienteAtual, this.agendamentoAtual, clinica);
        } else {
            console.log('WhatsAppIntegration nao encontrado, abrindo direto');
            var numero = celular.replace(/\D/g, '');
            if (!numero.startsWith('55')) numero = '55' + numero;
            window.open('https://wa.me/' + numero, '_blank');
        }
    },

    // Enviar mensagem para telefone de recados
    enviarRecados: function() {
        console.log('Modal: enviarRecados chamado');
        
        if (!this.pacienteAtual) {
            console.log('Erro: pacienteAtual nulo');
            return;
        }
        
        var telefoneRecados = this.pacienteAtual.telefone;
        console.log('Telefone recados:', telefoneRecados);
        
        if (!telefoneRecados) {
            if (typeof mostrarAviso === 'function') {
                mostrarAviso('Paciente nao possui telefone de recados cadastrado!');
            } else {
                alert('Paciente nao possui telefone de recados cadastrado!');
            }
            return;
        }
        
        if (typeof WhatsAppIntegration !== 'undefined') {
            var clinica = WhatsAppIntegration.getClinicaData();
            WhatsAppIntegration.enviarRecados(this.pacienteAtual, this.agendamentoAtual, clinica);
        } else {
            var numero = telefoneRecados.replace(/\D/g, '');
            if (!numero.startsWith('55')) numero = '55' + numero;
            window.open('https://wa.me/' + numero, '_blank');
        }
    },

    // Copiar dados
    copiarDados: function() {
        var texto = this.pacienteAtual.nome + '\n';
        texto += 'Tel: ' + (this.pacienteAtual.celular || this.pacienteAtual.telefone || '') + '\n';
        texto += 'Data: ' + this.agendamentoAtual.data + ' ' + this.agendamentoAtual.horaInicio;
        
        navigator.clipboard.writeText(texto).then(function() {
            alert('✅ Dados copiados!');
        });
    },

    // Editar agendamento
    editar: function() {
        // Disparar evento para abrir modal de edição
        document.dispatchEvent(new CustomEvent('editarAgendamento', {
            detail: { agendamento: this.agendamentoAtual, paciente: this.pacienteAtual }
        }));
        this.fechar();
    },

    // Excluir agendamento
    excluir: async function() {
        var confirmado = await mostrarConfirmacao(
            'Tem certeza que deseja excluir este agendamento?',
            'Excluir Agendamento',
            'Sim, Excluir',
            'Cancelar'
        );
        
        if (confirmado) {
            document.dispatchEvent(new CustomEvent('excluirAgendamento', {
                detail: { agendamento: this.agendamentoAtual }
            }));
            this.fechar();
        }
    },

    // Configurar retorno - Modal personalizado ao invés de prompt()
    configurarRetorno: function() {
        var self = this;
        
        // Criar modal se não existir
        if (!document.getElementById('modalRetornoConfig')) {
            var modalHTML = `
                <div class="modal-bg" id="modalRetornoConfig" style="z-index:2000;">
                    <div class="modal-box" style="max-width:350px;overflow:visible;">
                        <div class="modal-header" style="background:linear-gradient(135deg,#ff9800,#f57c00);padding:16px 20px;">
                            <h2 style="font-size:16px;">📅 Configurar Retorno</h2>
                            <button class="modal-close" onclick="document.getElementById('modalRetornoConfig').classList.remove('open')" style="border-color:#f57c00;color:#f57c00;">×</button>
                        </div>
                        <div class="modal-body" style="padding:20px;">
                            <p style="margin-bottom:16px;font-size:14px;color:#666;">Em quantos dias o paciente deve retornar?</p>
                            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;">
                                <button type="button" class="btn-retorno-dias" onclick="ModalAgendamento.setRetornoDias(7)" style="padding:10px 16px;border:2px solid #e5e7eb;border-radius:8px;background:#fff;cursor:pointer;font-weight:600;">7 dias</button>
                                <button type="button" class="btn-retorno-dias" onclick="ModalAgendamento.setRetornoDias(15)" style="padding:10px 16px;border:2px solid #e5e7eb;border-radius:8px;background:#fff;cursor:pointer;font-weight:600;">15 dias</button>
                                <button type="button" class="btn-retorno-dias" onclick="ModalAgendamento.setRetornoDias(30)" style="padding:10px 16px;border:2px solid #e5e7eb;border-radius:8px;background:#fff;cursor:pointer;font-weight:600;">30 dias</button>
                                <button type="button" class="btn-retorno-dias" onclick="ModalAgendamento.setRetornoDias(60)" style="padding:10px 16px;border:2px solid #e5e7eb;border-radius:8px;background:#fff;cursor:pointer;font-weight:600;">60 dias</button>
                                <button type="button" class="btn-retorno-dias" onclick="ModalAgendamento.setRetornoDias(90)" style="padding:10px 16px;border:2px solid #e5e7eb;border-radius:8px;background:#fff;cursor:pointer;font-weight:600;">90 dias</button>
                            </div>
                            <div style="display:flex;gap:8px;align-items:center;">
                                <input type="number" id="retornoDiasInput" placeholder="Outro" min="1" max="365" style="flex:1;padding:10px;border:2px solid #e5e7eb;border-radius:8px;font-size:14px;">
                                <span style="color:#666;">dias</span>
                            </div>
                        </div>
                        <div style="padding:0 20px 20px;display:flex;gap:10px;">
                            <button onclick="document.getElementById('modalRetornoConfig').classList.remove('open')" style="flex:1;padding:10px;border:none;border-radius:8px;background:#e5e7eb;cursor:pointer;font-weight:600;">Cancelar</button>
                            <button onclick="ModalAgendamento.confirmarRetorno()" style="flex:1;padding:10px;border:none;border-radius:8px;background:linear-gradient(135deg,#ff9800,#f57c00);color:#fff;cursor:pointer;font-weight:600;">Confirmar</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        // Abrir modal
        document.getElementById('retornoDiasInput').value = '';
        document.getElementById('modalRetornoConfig').classList.add('open');
    },
    
    setRetornoDias: function(dias) {
        document.getElementById('retornoDiasInput').value = dias;
    },
    
    confirmarRetorno: function() {
        var dias = parseInt(document.getElementById('retornoDiasInput').value);
        if (!dias || isNaN(dias) || dias < 1) {
            if (typeof mostrarAviso === 'function') mostrarAviso('Informe a quantidade de dias!');
            return;
        }
        
        var dataRetorno = new Date();
        dataRetorno.setDate(dataRetorno.getDate() + dias);
        
        if (this.agendamentoAtual) {
            this.agendamentoAtual.alertaRetorno = dataRetorno.toLocaleDateString('pt-BR');
            
            // Atualizar display
            var row = document.querySelector('.modal-ag-row:nth-child(3) .modal-ag-row-value');
            if (row) row.textContent = 'Para ' + dataRetorno.toLocaleDateString('pt-BR');
        }
        
        // Adicionar à lista de retornos pendentes
        if (this.pacienteAtual && typeof adicionarRetorno === 'function') {
            var dataISO = dataRetorno.toISOString().split('T')[0];
            adicionarRetorno(
                this.pacienteAtual.id,
                this.pacienteAtual.nome,
                dataISO,
                this.agendamentoAtual.procedimento || 'Retorno'
            );
        }
        
        document.getElementById('modalRetornoConfig').classList.remove('open');
        if (typeof mostrarSucesso === 'function') mostrarSucesso('Retorno agendado para ' + dataRetorno.toLocaleDateString('pt-BR'));
    },

    // Alterar rótulo
    alterarRotulo: function(rotulo) {
        if (this.agendamentoAtual) {
            this.agendamentoAtual.rotulo = rotulo;
        }
    },

    // Salvar alterações
    salvarAlteracoes: function() {
        if (!this.agendamentoAtual) return;
        
        var observacao = document.getElementById('agObservacao');
        if (observacao) {
            this.agendamentoAtual.observacao = observacao.value;
        }
        
        var rotulo = document.getElementById('agRotulo');
        if (rotulo) {
            this.agendamentoAtual.rotulo = rotulo.value;
        }
        
        // Disparar evento de salvamento
        document.dispatchEvent(new CustomEvent('salvarAgendamento', {
            detail: { agendamento: this.agendamentoAtual }
        }));
        
        // Feedback visual
        mostrarSucesso('Alterações salvas com sucesso!');
    }
};

// Expor globalmente
window.ModalAgendamento = ModalAgendamento;
