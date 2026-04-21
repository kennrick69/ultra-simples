// ==============================================================================
// MODAL DE CADASTRO DE PACIENTE - COMPONENTE REUTILIZÁVEL
// Pode ser usado em: Área de Pacientes, Agendamento, Nota Fiscal
// ==============================================================================

// Estilos do modal (serão injetados automaticamente)
var MODAL_PACIENTE_STYLES = `
.modal-paciente-bg {
    display: none;
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.6);
    z-index: 2000;
    align-items: center;
    justify-content: center;
    padding: 20px;
}
.modal-paciente-bg.open { display: flex; }
.modal-paciente-box {
    background: #fff;
    border-radius: 16px;
    width: 100%;
    max-width: 900px;
    max-height: 90vh;
    overflow: visible;
    display: flex;
    flex-direction: column;
    position: relative;
    margin: 20px;
}
.modal-paciente-header {
    padding: 20px 24px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: linear-gradient(135deg, #0891b2, #06b6d4);
    color: #fff;
    position: relative;
    overflow: visible;
    border-radius: 16px 16px 0 0;
}
.modal-paciente-header h2 { margin: 0; font-size: 20px; display: flex; align-items: center; gap: 10px; }
.modal-paciente-close {
    position: absolute;
    top: -12px;
    right: -12px;
    width: 32px;
    height: 32px;
    background: #6b7280;
    border: 3px solid white;
    border-radius: 50%;
    font-size: 18px;
    cursor: pointer;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    transition: all 0.2s;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    line-height: 1;
}
.modal-paciente-close:hover { background: #ef4444; transform: scale(1.1); }

/* Radio buttons para Sexo - Compacto */
.mp-sexo-radios {
    display: flex;
    gap: 8px;
    padding: 4px 0;
}
.mp-sexo-radio {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 8px 16px;
    border: 2px solid #e0e0e0;
    border-radius: 20px;
    transition: all 0.2s;
    font-size: 14px;
}
.mp-sexo-radio:hover { border-color: #0891b2; background: #ecfeff; }
.mp-sexo-radio input[type="radio"] {
    display: none;
}
.mp-sexo-radio.selected {
    border-color: #0891b2;
    background: #0891b2;
    color: #fff;
}
.mp-sexo-radio.selected span { color: #fff; }
.mp-sexo-radio span { font-weight: 500; color: #333; }
.modal-paciente-body {
    padding: 24px;
    overflow-y: auto;
    flex: 1;
    max-height: calc(90vh - 140px);
}
.mp-aviso-nfe {
    background: linear-gradient(135deg, #dbeafe, #bfdbfe);
    border: 2px solid #3b82f6;
    border-radius: 10px;
    padding: 12px 16px;
    margin-bottom: 16px;
    font-size: 12px;
    color: #1e40af;
    font-weight: 500;
}
.mp-aviso-nfe .required { color: #e53935; font-weight: bold; }
.mp-aviso-nfe.aviso-amarelo {
    background: linear-gradient(135deg, #fef3c7, #fde68a);
    border-color: #f59e0b;
    color: #92400e;
}

/* Seção NFS-e destacada */
.mp-section-nfse {
    background: linear-gradient(135deg, #ecfdf5, #d1fae5);
    border: 2px solid #10b981;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 16px;
}
.mp-badge-obrigatorio {
    background: #10b981;
    color: white;
    padding: 2px 10px;
    border-radius: 20px;
    font-size: 10px;
    font-weight: 700;
}

/* Box dados incompletos */
.mp-dados-incompletos-box {
    background: #eff6ff;
    border: 2px solid #3b82f6;
    border-radius: 8px;
    padding: 12px 16px;
    margin-bottom: 16px;
}
.mp-dados-incompletos-check {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
}
.mp-dados-incompletos-check input {
    width: 20px;
    height: 20px;
    cursor: pointer;
    accent-color: #3b82f6;
}
.mp-dados-incompletos-text strong {
    display: block;
    color: #1e40af;
    font-size: 13px;
}
.mp-dados-incompletos-text span {
    font-size: 11px;
    color: #3b82f6;
}

/* CPF + Estrangeiro inline */
.mp-cpf-estrangeiro-row {
    display: flex;
    gap: 12px;
    align-items: flex-end;
}
.mp-estrangeiro-inline {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    background: #fef3c7;
    border: 2px solid #f59e0b;
    border-radius: 8px;
    cursor: pointer;
    white-space: nowrap;
    font-size: 12px;
    color: #92400e;
    font-weight: 600;
    height: 38px;
}
.mp-estrangeiro-inline:hover {
    background: #fde68a;
}
.mp-estrangeiro-inline input {
    width: 16px;
    height: 16px;
    cursor: pointer;
}

/* Menor de idade box reformulado */
.mp-menor-box {
    background: #fef3c7;
    border: 2px solid #f59e0b;
    border-radius: 8px;
    padding: 12px 16px;
}
.mp-menor-check {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
}
.mp-menor-check input {
    width: 20px;
    height: 20px;
    cursor: pointer;
}
.mp-menor-text strong {
    display: block;
    color: #92400e;
    font-size: 13px;
}
.mp-menor-text span {
    font-size: 11px;
    color: #b45309;
}

/* Recados box */
.mp-recados-box {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 8px;
    padding: 12px;
    margin-top: 12px;
}
.mp-recados-title {
    font-size: 12px;
    color: #166534;
    font-weight: 600;
    margin-bottom: 10px;
}
.mp-recados-title span {
    font-weight: 400;
    font-size: 11px;
}

/* Responsável - Busca ou Novo */
.mp-resp-ou-novo {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px dashed #e0e0e0;
}
.mp-resp-ou-novo span {
    color: #999;
    font-size: 12px;
}
.mp-btn-novo-resp {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}
.mp-btn-novo-resp:hover {
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    transform: translateY(-1px);
}
.mp-resp-campos-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #e0e0e0;
}
.mp-resp-campos-header span {
    font-weight: 600;
    color: #1e40af;
}
.mp-btn-voltar-busca {
    background: none;
    border: 1px solid #cbd5e1;
    color: #64748b;
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 11px;
    cursor: pointer;
}
.mp-btn-voltar-busca:hover {
    background: #f1f5f9;
}
.mp-mesmo-endereco-box {
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
    border-radius: 6px;
    padding: 10px 12px;
    margin-top: 12px;
}
.mp-mesmo-endereco-check {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 13px;
    color: #065f46;
    font-weight: 500;
}
.mp-mesmo-endereco-check input {
    width: 16px;
    height: 16px;
    cursor: pointer;
}
.mp-resp-aviso-nfe {
    background: #e3f2fd;
    border: 1px solid #2196f3;
    border-radius: 8px;
    padding: 10px 14px;
    margin-bottom: 16px;
    font-size: 12px;
    color: #1565c0;
}
.mp-section {
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #eee;
}
.mp-section:last-child { border-bottom: none; margin-bottom: 0; }
.mp-section-title {
    font-size: 13px;
    font-weight: 700;
    color: #0891b2;
    margin-bottom: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    display: flex;
    align-items: center;
    gap: 8px;
}
.mp-section-title .section-required {
    font-size: 10px;
    font-weight: 500;
    color: #ff9800;
    text-transform: none;
    letter-spacing: 0;
}
.mp-row { display: grid; gap: 12px; margin-bottom: 12px; }
.mp-row-2 { grid-template-columns: 1fr 1fr; }
.mp-row-3 { grid-template-columns: 1fr 1fr 1fr; }
.mp-row-4 { grid-template-columns: 1fr 1fr 1fr 1fr; }
.mp-row-5 { grid-template-columns: 1fr 1fr 1fr 1fr 1fr; }
.mp-field { }
.mp-field label {
    display: block;
    font-weight: 600;
    margin-bottom: 4px;
    font-size: 12px;
    color: #333;
}
.mp-field label .required { color: #e53935; }
.mp-field input, .mp-field select, .mp-field textarea {
    width: 100%;
    padding: 8px 10px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 13px;
    transition: border-color 0.2s;
    box-sizing: border-box;
}
.mp-field input:focus, .mp-field select:focus, .mp-field textarea:focus {
    outline: none;
    border-color: #0891b2;
}
.mp-field input[type="checkbox"] {
    width: auto;
    margin-right: 8px;
}
.mp-field input.loading {
    background: #f5f5f5 url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><circle cx="25" cy="25" r="20" fill="none" stroke="%230891b2" stroke-width="4" stroke-dasharray="80" stroke-linecap="round"><animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite"/></circle></svg>') no-repeat right 10px center;
    background-size: 20px;
}
.mp-field input.cpf-valido {
    border-color: #22c55e !important;
    background: #f0fdf4 url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2322c55e"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>') no-repeat right 10px center;
    background-size: 18px;
}
.mp-field input.cpf-invalido {
    border-color: #ef4444 !important;
    background: #fef2f2 url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ef4444"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>') no-repeat right 10px center;
    background-size: 18px;
}

/* Checkbox Menor de Idade */
.mp-menor-box {
    background: #fff3e0;
    border: 2px solid #ff9800;
    border-radius: 10px;
    padding: 12px 16px;
    margin-bottom: 12px;
}
.mp-menor-check {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
}
.mp-menor-check input {
    width: 18px;
    height: 18px;
    cursor: pointer;
}
.mp-menor-check span {
    font-weight: 600;
    color: #e65100;
    font-size: 14px;
}
.mp-menor-info {
    font-size: 11px;
    color: #f57c00;
    margin-top: 4px;
    margin-left: 28px;
}

/* Checkbox Paciente Estrangeiro */
.mp-estrangeiro-box {
    background: #e3f2fd;
    border: 2px solid #2196f3;
    border-radius: 10px;
    padding: 12px 16px;
    margin-bottom: 12px;
}
.mp-estrangeiro-check {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
}
.mp-estrangeiro-check input {
    width: 18px;
    height: 18px;
    cursor: pointer;
}
.mp-estrangeiro-check span {
    font-weight: 600;
    color: #1565c0;
    font-size: 14px;
}
.mp-estrangeiro-info {
    font-size: 11px;
    color: #1976d2;
    margin-top: 4px;
    margin-left: 28px;
}

/* Container para checkboxes lado a lado */
.mp-checkboxes-row {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
}
.mp-checkboxes-row .mp-estrangeiro-box,
.mp-checkboxes-row .mp-menor-box {
    flex: 1;
    margin-bottom: 0;
}

/* Campos extras estrangeiro */
.mp-estrangeiro-fields {
    background: #e3f2fd;
    border: 2px solid #2196f3;
    border-radius: 10px;
    padding: 12px 16px;
    margin-bottom: 16px;
}

/* Seção Responsável */
.mp-responsavel {
    display: none;
    background: #f3e5f5;
    border: 2px solid #9c27b0;
    border-radius: 12px;
    padding: 20px;
    margin-top: 16px;
}
.mp-responsavel.show { display: block; }
.mp-responsavel .mp-section-title { color: #7b1fa2; }

/* Busca de responsável */
.mp-resp-busca-wrapper {
    position: relative;
}
.mp-resp-resultados {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: #fff;
    border: 2px solid #9c27b0;
    border-top: none;
    border-radius: 0 0 8px 8px;
    max-height: 200px;
    overflow-y: auto;
    z-index: 100;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
.mp-resp-resultados.show { display: block; }
.mp-resp-item {
    padding: 12px;
    cursor: pointer;
    border-bottom: 1px solid #eee;
    transition: background 0.2s;
}
.mp-resp-item:hover { background: #f3e5f5; }
.mp-resp-item:last-child { border-bottom: none; }
.mp-resp-item-nome { font-weight: 600; color: #333; }
.mp-resp-item-cpf { font-size: 12px; color: #666; }

/* Responsável selecionado */
.mp-resp-selecionado {
    display: none;
    background: #e8f5e9;
    border: 2px solid #4caf50;
    border-radius: 8px;
    padding: 12px;
    margin-top: 12px;
}
.mp-resp-selecionado.show { display: block; }
.mp-resp-selecionado-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.mp-resp-selecionado-info { }
.mp-resp-selecionado-nome { font-weight: 600; color: #2e7d32; font-size: 15px; }
.mp-resp-selecionado-cpf { font-size: 13px; color: #388e3c; }
.mp-resp-trocar {
    background: #ff5722;
    color: #fff;
    border: none;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
}
.mp-resp-trocar:hover { background: #e64a19; }

/* Aviso de cadastro */
.mp-resp-aviso {
    display: none;
    background: #fff8e1;
    border: 2px solid #ffc107;
    border-radius: 8px;
    padding: 12px;
    margin-top: 12px;
    font-size: 13px;
    color: #f57f17;
}
.mp-resp-aviso.show { display: block; }

/* Footer */
.modal-paciente-footer {
    padding: 16px 24px;
    border-top: 1px solid #eee;
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    background: #f8fafc;
    border-radius: 0 0 16px 16px;
}
.modal-paciente-footer button {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}
.mp-btn-cancel { background: #f3f4f6; color: #374151; border: 1px solid #d1d5db; }
.mp-btn-cancel:hover { background: #e5e7eb; }
.mp-btn-save { background: linear-gradient(135deg, #0891b2, #06b6d4); color: #fff; }
.mp-btn-save:hover { box-shadow: 0 4px 12px rgba(8,145,178,0.4); transform: translateY(-1px); }
.mp-btn-save:disabled { background: #ccc; cursor: not-allowed; transform: none; box-shadow: none; }

.mp-error {
    background: #ffebee;
    color: #c62828;
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 16px;
    display: none;
}

/* Parentesco row */
.mp-parentesco-row {
    display: none;
    margin-top: 12px;
}
.mp-parentesco-row.show { display: block; }

@media (max-width: 900px) {
    .mp-row-2, .mp-row-3, .mp-row-4, .mp-row-5 { grid-template-columns: 1fr 1fr; }
    .modal-paciente-box { max-width: 100%; border-radius: 12px; }
}
@media (max-width: 600px) {
    .mp-row-2, .mp-row-3, .mp-row-4, .mp-row-5 { grid-template-columns: 1fr; }
    .mp-checkboxes-row { flex-direction: column; }
}
`;

// HTML do modal
var MODAL_PACIENTE_HTML = `
<div class="modal-paciente-bg" id="modalPacienteGlobal">
    <div class="modal-paciente-box">
        <div class="modal-paciente-header">
            <h2>👤 Cadastrar Novo Paciente</h2>
            <button class="modal-paciente-close" onclick="ModalPaciente.fechar()">×</button>
        </div>
        <div class="modal-paciente-body">
            <div class="mp-error" id="mpError"></div>
            
            <div class="mp-aviso-nfe" id="mpAvisoNfe">
                📋 <strong>Campos obrigatórios para NFS-e</strong><br>
                <span style="font-size:11px;">Os campos marcados com <span class="required">*</span> são necessários para emissão da nota fiscal.</span>
            </div>
            
            <!-- ═══════════════════════════════════════════════════════════════ -->
            <!-- SEÇÃO 1: DADOS OBRIGATÓRIOS PARA NFS-e -->
            <!-- ═══════════════════════════════════════════════════════════════ -->
            <div class="mp-section mp-section-nfse">
                <div class="mp-section-title" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
                    <span>🧾 Dados para Nota Fiscal</span>
                    <span class="mp-badge-obrigatorio">OBRIGATÓRIO</span>
                </div>
                
                <!-- Checkbox: Informará dados pessoalmente -->
                <div class="mp-dados-incompletos-box" id="mpDadosIncompletosBox">
                    <label class="mp-dados-incompletos-check">
                        <input type="checkbox" id="mpDadosIncompletos" onchange="ModalPaciente.toggleDadosIncompletos()">
                        <div class="mp-dados-incompletos-text">
                            <strong>📝 Paciente informará dados pessoalmente</strong>
                            <span>Permite salvar apenas com nome e telefone</span>
                        </div>
                    </label>
                </div>
                
                <!-- Nome Completo (100%) - Exibido quando NÃO marca checkbox -->
                <div class="mp-row" id="mpCampoNomeCompleto">
                    <div class="mp-field">
                        <label>Nome Completo <span class="required">*</span></label>
                        <input type="text" id="mpNome" placeholder="Nome completo do paciente" required>
                    </div>
                </div>
                
                <!-- Nome + Telefone (50/50) - Exibido quando MARCA checkbox -->
                <div class="mp-row mp-row-2" id="mpCampoNomeTelefone" style="display:none;">
                    <div class="mp-field">
                        <label>Nome Completo <span class="required">*</span></label>
                        <input type="text" id="mpNomeSimples" placeholder="Nome completo do paciente">
                    </div>
                    <div class="mp-field">
                        <label>Telefone <span class="required">*</span></label>
                        <input type="tel" id="mpTelefoneSimples" placeholder="(00) 00000-0000">
                        <small style="color:#888;font-size:10px;">Para contato quando vier ao consultório</small>
                    </div>
                </div>
                
                <!-- Campos que podem ser preenchidos depois -->
                <div id="mpCamposObrigatorios">
                    <!-- CPF + Estrangeiro inline -->
                    <div class="mp-row" style="margin-bottom:12px;">
                        <div class="mp-cpf-estrangeiro-row">
                            <div class="mp-field" style="flex:1;">
                                <label id="mpDocLabel">CPF <span class="required mp-obrigatorio">*</span></label>
                                <input type="text" id="mpCpf" placeholder="000.000.000-00" maxlength="14">
                            </div>
                            <label class="mp-estrangeiro-inline">
                                <input type="checkbox" id="mpEstrangeiro" onchange="ModalPaciente.toggleEstrangeiro()">
                                <span>🌍 Estrangeiro</span>
                            </label>
                        </div>
                    </div>
                    
                    <!-- Campos extras estrangeiro -->
                    <div class="mp-estrangeiro-fields" id="mpEstrangeiroFields" style="display:none;">
                        <div class="mp-row mp-row-2">
                            <div class="mp-field">
                                <label>País de Origem</label>
                                <input type="text" id="mpPais" placeholder="Ex: Estados Unidos, Argentina...">
                            </div>
                            <div class="mp-field">
                                <label>Nacionalidade</label>
                                <input type="text" id="mpNacionalidade" placeholder="Ex: Americana, Argentina...">
                            </div>
                        </div>
                    </div>
                    
                    <!-- Email -->
                    <div class="mp-row" style="margin-bottom:12px;">
                        <div class="mp-field">
                            <label>Email <span class="required mp-obrigatorio">*</span></label>
                            <input type="email" id="mpEmail" placeholder="email@exemplo.com" required>
                            <small style="color:#888;font-size:10px;">Necessário para envio da NFS-e</small>
                        </div>
                    </div>
                    
                    <!-- Endereço -->
                    <div class="mp-row mp-row-4" style="margin-bottom:8px;">
                        <div class="mp-field">
                            <label>CEP <span class="required mp-obrigatorio">*</span></label>
                            <input type="text" id="mpCep" placeholder="00000-000" maxlength="9">
                        </div>
                        <div class="mp-field" style="grid-column: span 2;">
                            <label>Endereço <span class="required mp-obrigatorio">*</span></label>
                            <input type="text" id="mpEndereco" placeholder="Rua, Avenida...">
                        </div>
                        <div class="mp-field">
                            <label>Número <span class="required mp-obrigatorio">*</span></label>
                            <input type="text" id="mpNumero" placeholder="Nº">
                        </div>
                    </div>
                    <div class="mp-row mp-row-4">
                        <div class="mp-field">
                            <label>Bairro <span class="required mp-obrigatorio">*</span></label>
                            <input type="text" id="mpBairro" placeholder="Bairro">
                        </div>
                        <div class="mp-field">
                            <label>Cidade <span class="required mp-obrigatorio">*</span></label>
                            <input type="text" id="mpCidade" placeholder="Cidade">
                        </div>
                        <div class="mp-field">
                            <label>Estado <span class="required mp-obrigatorio">*</span></label>
                            <select id="mpEstado">
                                <option value="">UF</option>
                                <option value="AC">AC</option><option value="AL">AL</option><option value="AP">AP</option>
                                <option value="AM">AM</option><option value="BA">BA</option><option value="CE">CE</option>
                                <option value="DF">DF</option><option value="ES">ES</option><option value="GO">GO</option>
                                <option value="MA">MA</option><option value="MT">MT</option><option value="MS">MS</option>
                                <option value="MG">MG</option><option value="PA">PA</option><option value="PB">PB</option>
                                <option value="PR">PR</option><option value="PE">PE</option><option value="PI">PI</option>
                                <option value="RJ">RJ</option><option value="RN">RN</option><option value="RS">RS</option>
                                <option value="RO">RO</option><option value="RR">RR</option><option value="SC">SC</option>
                                <option value="SP">SP</option><option value="SE">SE</option><option value="TO">TO</option>
                            </select>
                        </div>
                        <div class="mp-field">
                            <label>Complemento</label>
                            <input type="text" id="mpComplemento" placeholder="Apto, Sala...">
                        </div>
                    </div>
                    
                    <!-- Menor de Idade -->
                    <div class="mp-menor-box" style="margin-top:16px;">
                        <label class="mp-menor-check">
                            <input type="checkbox" id="mpMenorIdade" onchange="ModalPaciente.toggleResponsavel()">
                            <div class="mp-menor-text">
                                <strong>⚠️ Menor de Idade / Incapaz</strong>
                                <span>NFS-e será emitida no CPF do responsável legal</span>
                            </div>
                        </label>
                    </div>
                    
                    <!-- Dados do Responsável (aparece se menor de idade) -->
                    <div class="mp-responsavel" id="mpResponsavelSection">
                        <div class="mp-section-title">👨‍👩‍👧 Dados do Responsável Legal</div>
                        
                        <div class="mp-resp-aviso-nfe">
                            ℹ️ Para menores de idade, a NFS-e será emitida em nome do <strong>responsável legal</strong>.
                        </div>
                        
                        <!-- Buscar responsável existente -->
                        <div id="mpRespBuscaArea">
                            <div class="mp-field">
                                <label>Buscar Responsável Existente</label>
                                <div class="mp-resp-busca-wrapper">
                                    <input type="text" id="mpRespBusca" placeholder="Digite nome ou CPF para buscar..." oninput="ModalPaciente.buscarResponsavel()" autocomplete="off">
                                    <div class="mp-resp-resultados" id="mpRespResultados"></div>
                                </div>
                            </div>
                            
                            <!-- Botão para cadastrar novo -->
                            <div class="mp-resp-ou-novo">
                                <span>ou</span>
                                <button type="button" class="mp-btn-novo-resp" onclick="ModalPaciente.mostrarCamposResponsavel()">
                                    ➕ Cadastrar Novo Responsável
                                </button>
                            </div>
                        </div>
                        
                        <!-- Responsável selecionado da busca -->
                        <div class="mp-resp-selecionado" id="mpRespSelecionado">
                            <div class="mp-resp-selecionado-header">
                                <div class="mp-resp-selecionado-info">
                                    <div class="mp-resp-selecionado-nome" id="mpRespSelNome">-</div>
                                    <div class="mp-resp-selecionado-cpf" id="mpRespSelCpf">CPF: -</div>
                                </div>
                                <button type="button" class="mp-resp-trocar" onclick="ModalPaciente.trocarResponsavel()">✕ Trocar</button>
                            </div>
                            <input type="hidden" id="mpRespId">
                        </div>
                        
                        <!-- Campos manuais (aparecem ao clicar "Cadastrar Novo") -->
                        <div id="mpRespCamposManuais" style="display:none;">
                            <div class="mp-resp-campos-header">
                                <span>📝 Novo Responsável</span>
                                <button type="button" class="mp-btn-voltar-busca" onclick="ModalPaciente.voltarBuscaResponsavel()">← Voltar para busca</button>
                            </div>
                            
                            <div class="mp-row mp-row-2">
                                <div class="mp-field">
                                    <label>Nome do Responsável <span class="required">*</span></label>
                                    <input type="text" id="mpRespNome" placeholder="Nome completo">
                                </div>
                                <div class="mp-field">
                                    <label>CPF do Responsável <span class="required">*</span></label>
                                    <input type="text" id="mpRespCpf" placeholder="000.000.000-00" maxlength="14">
                                </div>
                            </div>
                            
                            <div class="mp-row mp-row-3">
                                <div class="mp-field">
                                    <label>Telefone</label>
                                    <input type="tel" id="mpRespTelefone" placeholder="(00) 00000-0000">
                                </div>
                                <div class="mp-field">
                                    <label>Email</label>
                                    <input type="email" id="mpRespEmail" placeholder="email@exemplo.com">
                                </div>
                                <div class="mp-field">
                                    <label>Parentesco <span class="required">*</span></label>
                                    <select id="mpRespParentescoNovo">
                                        <option value="">Selecione...</option>
                                        <option value="Pai">Pai</option>
                                        <option value="Mãe">Mãe</option>
                                        <option value="Avô">Avô</option>
                                        <option value="Avó">Avó</option>
                                        <option value="Tutor Legal">Tutor Legal</option>
                                        <option value="Curador">Curador</option>
                                        <option value="Outro">Outro</option>
                                    </select>
                                </div>
                            </div>
                            
                            <!-- Checkbox mesmo endereço -->
                            <div class="mp-mesmo-endereco-box">
                                <label class="mp-mesmo-endereco-check">
                                    <input type="checkbox" id="mpRespMesmoEndereco" checked onchange="ModalPaciente.toggleEnderecoResponsavel()">
                                    <span>🏠 Mesmo endereço do paciente</span>
                                </label>
                            </div>
                            
                            <!-- Endereço do responsável (aparece se desmarcar checkbox) -->
                            <div id="mpRespEnderecoArea" style="display:none;">
                                <div class="mp-row mp-row-4" style="margin-top:12px;">
                                    <div class="mp-field">
                                        <label>CEP</label>
                                        <input type="text" id="mpRespCep" placeholder="00000-000" maxlength="9">
                                    </div>
                                    <div class="mp-field" style="grid-column: span 2;">
                                        <label>Endereço</label>
                                        <input type="text" id="mpRespEndereco" placeholder="Rua, Avenida...">
                                    </div>
                                    <div class="mp-field">
                                        <label>Número</label>
                                        <input type="text" id="mpRespNumero" placeholder="Nº">
                                    </div>
                                </div>
                                <div class="mp-row mp-row-4">
                                    <div class="mp-field">
                                        <label>Bairro</label>
                                        <input type="text" id="mpRespBairro" placeholder="Bairro">
                                    </div>
                                    <div class="mp-field">
                                        <label>Cidade</label>
                                        <input type="text" id="mpRespCidade" placeholder="Cidade">
                                    </div>
                                    <div class="mp-field">
                                        <label>Estado</label>
                                        <select id="mpRespEstado">
                                            <option value="">UF</option>
                                            <option value="AC">AC</option><option value="AL">AL</option><option value="AP">AP</option>
                                            <option value="AM">AM</option><option value="BA">BA</option><option value="CE">CE</option>
                                            <option value="DF">DF</option><option value="ES">ES</option><option value="GO">GO</option>
                                            <option value="MA">MA</option><option value="MT">MT</option><option value="MS">MS</option>
                                            <option value="MG">MG</option><option value="PA">PA</option><option value="PB">PB</option>
                                            <option value="PR">PR</option><option value="PE">PE</option><option value="PI">PI</option>
                                            <option value="RJ">RJ</option><option value="RN">RN</option><option value="RS">RS</option>
                                            <option value="RO">RO</option><option value="RR">RR</option><option value="SC">SC</option>
                                            <option value="SP">SP</option><option value="SE">SE</option><option value="TO">TO</option>
                                        </select>
                                    </div>
                                    <div class="mp-field">
                                        <label>Complemento</label>
                                        <input type="text" id="mpRespComplemento" placeholder="Apto...">
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Parentesco (quando seleciona da busca) -->
                        <div class="mp-parentesco-row" id="mpParentescoRow" style="display:none;">
                            <div class="mp-field">
                                <label>Parentesco <span class="required">*</span></label>
                                <select id="mpRespParentesco">
                                    <option value="">Selecione...</option>
                                    <option value="Pai">Pai</option>
                                    <option value="Mãe">Mãe</option>
                                    <option value="Avô">Avô</option>
                                    <option value="Avó">Avó</option>
                                    <option value="Tutor Legal">Tutor Legal</option>
                                    <option value="Curador">Curador</option>
                                    <option value="Outro">Outro</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div> <!-- Fecha mpCamposObrigatorios -->
            </div>
            
            <!-- ═══════════════════════════════════════════════════════════════ -->
            <!-- SEÇÃO 2: DADOS PESSOAIS E SAÚDE -->
            <!-- ═══════════════════════════════════════════════════════════════ -->
            <div class="mp-section">
                <div class="mp-section-title">🩺 Dados Pessoais e Saúde</div>
                <div class="mp-row mp-row-2">
                    <div class="mp-field">
                        <label>Data de Nascimento</label>
                        <input type="date" id="mpNascimento">
                        <small style="color:#888;font-size:10px;">Idade aparecerá no prontuário</small>
                    </div>
                    <div class="mp-field">
                        <label>Sexo</label>
                        <div class="mp-sexo-radios">
                            <label class="mp-sexo-radio" onclick="this.classList.add('selected'); this.parentNode.querySelectorAll('.mp-sexo-radio').forEach(r => r !== this && r.classList.remove('selected'))">
                                <input type="radio" name="mpSexo" value="Masculino"> <span>Homem</span>
                            </label>
                            <label class="mp-sexo-radio" onclick="this.classList.add('selected'); this.parentNode.querySelectorAll('.mp-sexo-radio').forEach(r => r !== this && r.classList.remove('selected'))">
                                <input type="radio" name="mpSexo" value="Feminino"> <span>Mulher</span>
                            </label>
                            <label class="mp-sexo-radio" onclick="this.classList.add('selected'); this.parentNode.querySelectorAll('.mp-sexo-radio').forEach(r => r !== this && r.classList.remove('selected'))">
                                <input type="radio" name="mpSexo" value="Outro"> <span>Outro</span>
                            </label>
                        </div>
                        <input type="hidden" id="mpSexo">
                    </div>
                </div>
                <div class="mp-row mp-row-2">
                    <div class="mp-field">
                        <label>Alergias</label>
                        <input type="text" id="mpAlergias" placeholder="Ex: Penicilina, Látex, Dipirona...">
                    </div>
                    <div class="mp-field">
                        <label>Condições Especiais</label>
                        <input type="text" id="mpCondicoesEspeciais" placeholder="Ex: Diabetes, Hipertensão, Gestante...">
                    </div>
                </div>
            </div>

            <!-- ═══════════════════════════════════════════════════════════════ -->
            <!-- SEÇÃO 3: CONTATOS -->
            <!-- ═══════════════════════════════════════════════════════════════ -->
            <div class="mp-section">
                <div class="mp-section-title">📞 Contatos</div>
                <div class="mp-row mp-row-2">
                    <div class="mp-field">
                        <label>WhatsApp</label>
                        <input type="tel" id="mpCelular" placeholder="(00) 00000-0000">
                        <small style="color:#888;font-size:10px;">Para envio de lembretes</small>
                    </div>
                    <div class="mp-field">
                        <label>Telefone Fixo</label>
                        <input type="tel" id="mpTelefone" placeholder="(00) 0000-0000">
                    </div>
                </div>
                <div class="mp-recados-box">
                    <div class="mp-recados-title">📞 Telefone para Recados <span>(para avisar familiar/cuidador)</span></div>
                    <div class="mp-row mp-row-2">
                        <div class="mp-field">
                            <label>Telefone</label>
                            <input type="tel" id="mpTelRecados" placeholder="(00) 00000-0000">
                        </div>
                        <div class="mp-field">
                            <label>Nome do Contato</label>
                            <input type="text" id="mpNomeRecado" placeholder="Ex: Maria (filha)">
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- ═══════════════════════════════════════════════════════════════ -->
            <!-- SEÇÃO 4: CONVÊNIO -->
            <!-- ═══════════════════════════════════════════════════════════════ -->
            <div class="mp-section">
                <div class="mp-section-title">🏥 Convênio</div>
                <div class="mp-row mp-row-2">
                    <div class="mp-field">
                        <label>Nome do Convênio</label>
                        <input type="text" id="mpConvenio" placeholder="Ex: Unimed, Bradesco Saúde...">
                    </div>
                    <div class="mp-field">
                        <label>Número da Carteirinha</label>
                        <input type="text" id="mpNumConvenio" placeholder="Número do convênio">
                    </div>
                </div>
            </div>
            
            <!-- Campo oculto para RG (mantido para compatibilidade) -->
            <input type="hidden" id="mpRg" value="">
            
            <!-- Campo oculto para observações -->
            <input type="hidden" id="mpObservacoes" value="">
            
        </div>
        <div class="modal-paciente-footer">
            <button class="mp-btn-cancel" onclick="ModalPaciente.fechar()">Cancelar</button>
            <button class="mp-btn-save" id="mpBtnSalvar" onclick="ModalPaciente.salvar()">Salvar Paciente</button>
        </div>
    </div>
</div>
`;

// ==============================================================================
// OBJETO PRINCIPAL DO MODAL
// ==============================================================================

var ModalPaciente = {
    callback: null,
    isOpen: false,
    responsavelSelecionado: null,
    modoResponsavelManual: false,
    pacientesCache: [],
    modoEdicao: false,
    pacienteEditandoId: null,
    avisoIncompleto: false,

    // Modal de confirmação para cadastro incompleto
    mostrarConfirmacaoIncompleto: function(nomePaciente) {
        return new Promise(function(resolve) {
            // Criar overlay do modal
            var overlay = document.createElement('div');
            overlay.id = 'modalConfirmIncompleto';
            overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:3000;display:flex;align-items:center;justify-content:center;padding:20px;';
            
            overlay.innerHTML = `
                <div style="background:#fff;border-radius:16px;max-width:450px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.3);overflow:hidden;">
                    <div style="background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;padding:20px;text-align:center;">
                        <div style="font-size:48px;margin-bottom:10px;">⚠️</div>
                        <h3 style="margin:0;font-size:20px;">Cadastro Incompleto</h3>
                    </div>
                    <div style="padding:24px;">
                        <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.5;">
                            O paciente <strong>"${nomePaciente}"</strong> será salvo sem CPF e/ou CEP.
                        </p>
                        <div style="background:#fef3c7;border-radius:8px;padding:16px;margin-bottom:20px;">
                            <p style="margin:0 0 8px;color:#92400e;font-size:14px;font-weight:600;">
                                📋 O que isso significa:
                            </p>
                            <ul style="margin:0;padding-left:20px;color:#92400e;font-size:13px;line-height:1.6;">
                                <li>Paciente pode ser agendado normalmente</li>
                                <li>Ficará marcado como "Cadastro Incompleto"</li>
                                <li><strong>Não poderá emitir NFS-e</strong> até completar dados</li>
                            </ul>
                        </div>
                        <label style="display:flex;align-items:flex-start;gap:12px;cursor:pointer;padding:12px;background:#f9fafb;border-radius:8px;border:2px solid #e5e7eb;transition:all 0.2s;" id="lblConfirmCheck">
                            <input type="checkbox" id="chkConfirmIncompleto" style="width:20px;height:20px;margin-top:2px;cursor:pointer;">
                            <span style="color:#374151;font-size:14px;line-height:1.4;">
                                Estou ciente e quero salvar este paciente com cadastro incompleto
                            </span>
                        </label>
                    </div>
                    <div style="padding:16px 24px 24px;display:flex;gap:12px;">
                        <button id="btnCancelIncompleto" style="flex:1;padding:12px;border:2px solid #e5e7eb;background:#fff;border-radius:8px;font-size:15px;cursor:pointer;transition:all 0.2s;">
                            Voltar e Completar
                        </button>
                        <button id="btnConfirmIncompleto" disabled style="flex:1;padding:12px;border:none;background:#d1d5db;color:#fff;border-radius:8px;font-size:15px;font-weight:600;cursor:not-allowed;transition:all 0.2s;">
                            Salvar Incompleto
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(overlay);
            
            var chk = document.getElementById('chkConfirmIncompleto');
            var btnConfirm = document.getElementById('btnConfirmIncompleto');
            var btnCancel = document.getElementById('btnCancelIncompleto');
            var lblCheck = document.getElementById('lblConfirmCheck');
            
            // Habilitar botão quando marcar checkbox
            chk.addEventListener('change', function() {
                if (chk.checked) {
                    btnConfirm.disabled = false;
                    btnConfirm.style.background = '#f59e0b';
                    btnConfirm.style.cursor = 'pointer';
                    lblCheck.style.borderColor = '#f59e0b';
                    lblCheck.style.background = '#fffbeb';
                } else {
                    btnConfirm.disabled = true;
                    btnConfirm.style.background = '#d1d5db';
                    btnConfirm.style.cursor = 'not-allowed';
                    lblCheck.style.borderColor = '#e5e7eb';
                    lblCheck.style.background = '#f9fafb';
                }
            });
            
            // Botão cancelar
            btnCancel.addEventListener('click', function() {
                document.body.removeChild(overlay);
                resolve(false);
            });
            
            // Hover no botão cancelar
            btnCancel.addEventListener('mouseenter', function() {
                btnCancel.style.background = '#f3f4f6';
            });
            btnCancel.addEventListener('mouseleave', function() {
                btnCancel.style.background = '#fff';
            });
            
            // Botão confirmar
            btnConfirm.addEventListener('click', function() {
                if (!chk.checked) return;
                document.body.removeChild(overlay);
                resolve(true);
            });
            
            // Fechar ao clicar fora
            overlay.addEventListener('click', function(e) {
                if (e.target === overlay) {
                    document.body.removeChild(overlay);
                    resolve(false);
                }
            });
            
            // Focar no checkbox
            setTimeout(function() { chk.focus(); }, 100);
        });
    },

    // Inicializar (chamar uma vez no carregamento da página)
    init: function() {
        // Injetar estilos
        if (!document.getElementById('modal-paciente-styles')) {
            var style = document.createElement('style');
            style.id = 'modal-paciente-styles';
            style.textContent = MODAL_PACIENTE_STYLES;
            document.head.appendChild(style);
        }

        // Injetar HTML
        if (!document.getElementById('modalPacienteGlobal')) {
            var div = document.createElement('div');
            div.innerHTML = MODAL_PACIENTE_HTML;
            document.body.appendChild(div.firstElementChild);

            // Fechar ao clicar fora
            document.getElementById('modalPacienteGlobal').addEventListener('click', function(e) {
                if (e.target === this) ModalPaciente.fechar();
            });

            // Fechar com ESC
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && ModalPaciente.isOpen) ModalPaciente.fechar();
            });

            // Fechar resultados ao clicar fora
            document.addEventListener('click', function(e) {
                var resultados = document.getElementById('mpRespResultados');
                var busca = document.getElementById('mpRespBusca');
                if (resultados && busca && !resultados.contains(e.target) && e.target !== busca) {
                    resultados.classList.remove('show');
                }
            });

            // Máscaras de input
            this.setupMascaras();
        }
    },

    // Abrir modal
    abrir: function(callbackFn) {
        this.init();
        this.limpar();
        this.modoEdicao = false;
        this.pacienteEditandoId = null;
        this.callback = callbackFn || null;
        this.carregarPacientesParaBusca();
        document.getElementById('modalPacienteGlobal').classList.add('open');
        document.querySelector('#modalPacienteGlobal .modal-paciente-header h2').innerHTML = '👤 Novo Paciente';
        document.getElementById('mpBtnSalvar').textContent = 'Salvar Paciente';
        this.isOpen = true;
        document.getElementById('mpNome').focus();
    },

    // Abrir modal para EDIÇÃO
    abrirEdicao: function(paciente, callbackFn) {
        this.init();
        this.limpar();
        this.modoEdicao = true;
        this.pacienteEditandoId = paciente.id;
        this.callback = callbackFn || null;
        this.carregarPacientesParaBusca();
        
        // Preencher campos com dados do paciente
        document.getElementById('mpNome').value = paciente.nome || '';
        document.getElementById('mpCpf').value = paciente.cpf || paciente.passaporte || '';
        document.getElementById('mpRg').value = paciente.rg || '';
        
        // Data de nascimento (converter de ISO para input date)
        if (paciente.dataNascimento) {
            var data = paciente.dataNascimento.split('T')[0];
            document.getElementById('mpNascimento').value = data;
        }
        
        document.getElementById('mpSexo').value = paciente.sexo || '';
        document.getElementById('mpTelefone').value = paciente.telefone || '';
        document.getElementById('mpCelular').value = paciente.celular || '';
        document.getElementById('mpEmail').value = paciente.email || '';
        document.getElementById('mpTelRecados').value = paciente.tel_recados || '';
        document.getElementById('mpNomeRecado').value = paciente.nome_recado || '';
        document.getElementById('mpCep').value = paciente.cep || '';
        document.getElementById('mpEndereco').value = paciente.endereco || '';
        document.getElementById('mpNumero').value = paciente.numero || '';
        document.getElementById('mpComplemento').value = paciente.complemento || '';
        document.getElementById('mpBairro').value = paciente.bairro || '';
        document.getElementById('mpCidade').value = paciente.cidade || '';
        document.getElementById('mpEstado').value = paciente.estado || '';
        document.getElementById('mpConvenio').value = paciente.convenio || '';
        document.getElementById('mpNumConvenio').value = paciente.numeroConvenio || '';
        document.getElementById('mpObservacoes').value = paciente.observacoes || '';
        
        // Checkbox de menor de idade
        if (paciente.menorIdade) {
            document.getElementById('mpMenorIdade').checked = true;
            document.getElementById('mpResponsavelSection').classList.add('show');
            // TODO: Preencher responsável se existir
        }
        
        // Checkbox de estrangeiro
        if (paciente.estrangeiro) {
            document.getElementById('mpEstrangeiro').checked = true;
            document.getElementById('mpEstrangeiroFields').classList.add('show');
            document.getElementById('mpPais').value = paciente.pais || '';
            document.getElementById('mpNacionalidade').value = paciente.nacionalidade || '';
        }
        
        // Atualizar título e botão
        document.querySelector('#modalPacienteGlobal .modal-paciente-header h2').innerHTML = '✏️ Editar Paciente';
        document.getElementById('mpBtnSalvar').textContent = 'Salvar Alterações';
        
        document.getElementById('modalPacienteGlobal').classList.add('open');
        this.isOpen = true;
        document.getElementById('mpNome').focus();
    },

    // Fechar modal
    fechar: function() {
        document.getElementById('modalPacienteGlobal').classList.remove('open');
        this.isOpen = false;
        this.callback = null;
        this.responsavelSelecionado = null;
    },

    // Limpar formulário
    limpar: function() {
        var campos = ['mpNome','mpNomeSimples','mpTelefoneSimples','mpCpf','mpRg','mpNascimento','mpSexo','mpTelefone','mpCelular','mpEmail','mpTelRecados','mpNomeRecado',
                      'mpCep','mpEndereco','mpNumero','mpComplemento','mpBairro','mpCidade','mpEstado',
                      'mpConvenio','mpNumConvenio','mpObservacoes','mpAlergias','mpCondicoesEspeciais',
                      'mpRespBusca','mpRespParentesco','mpRespId','mpRespNome','mpRespCpf','mpRespTelefone','mpRespEmail','mpRespParentescoNovo',
                      'mpRespCep','mpRespEndereco','mpRespNumero','mpRespBairro','mpRespCidade','mpRespEstado','mpRespComplemento'];
        
        campos.forEach(function(id) {
            var el = document.getElementById(id);
            if (el) el.value = '';
        });

        document.getElementById('mpMenorIdade').checked = false;
        
        // Resetar seção do responsável
        var respSection = document.getElementById('mpResponsavelSection');
        if (respSection) respSection.style.display = 'none';
        
        var respBuscaArea = document.getElementById('mpRespBuscaArea');
        if (respBuscaArea) respBuscaArea.style.display = 'block';
        
        var respSelecionado = document.getElementById('mpRespSelecionado');
        if (respSelecionado) respSelecionado.classList.remove('show');
        
        var parentescoRow = document.getElementById('mpParentescoRow');
        if (parentescoRow) parentescoRow.style.display = 'none';
        
        var camposManuais = document.getElementById('mpRespCamposManuais');
        if (camposManuais) camposManuais.classList.remove('show');
        
        var mesmoEndereco = document.getElementById('mpRespMesmoEndereco');
        if (mesmoEndereco) mesmoEndereco.checked = true;
        
        var enderecoResp = document.getElementById('mpRespEnderecoArea');
        if (enderecoResp) enderecoResp.style.display = 'none';
        
        document.getElementById('mpError').style.display = 'none';
        
        // Limpar checkbox de estrangeiro
        var chkEstrangeiro = document.getElementById('mpEstrangeiro');
        if (chkEstrangeiro) chkEstrangeiro.checked = false;
        var fieldsEstrangeiro = document.getElementById('mpEstrangeiroFields');
        if (fieldsEstrangeiro) fieldsEstrangeiro.style.display = 'none';
        
        this.responsavelSelecionado = null;
        this.modoResponsavelManual = false;
        this.modoEdicao = false;
        this.pacienteEditandoId = null;
        this.avisoIncompleto = false;
        
        // Resetar checkbox de dados incompletos
        var chkIncompleto = document.getElementById('mpDadosIncompletos');
        if (chkIncompleto) {
            chkIncompleto.checked = false;
            this.toggleDadosIncompletos();
        }
    },

    // Carregar pacientes para busca de responsável
    carregarPacientesParaBusca: async function() {
        try {
            var res = await apiCall('/api/pacientes');
            if (res && res.success) {
                this.pacientesCache = res.pacientes || [];
            }
        } catch (e) {
            console.error('Erro ao carregar pacientes:', e);
        }
    },

    // Toggle seção de responsável
    toggleResponsavel: function() {
        var checked = document.getElementById('mpMenorIdade').checked;
        var section = document.getElementById('mpResponsavelSection');
        
        if (checked) {
            section.style.display = 'block';
            // Resetar para estado inicial
            document.getElementById('mpRespBuscaArea').style.display = 'block';
            document.getElementById('mpRespCamposManuais').classList.remove('show');
            document.getElementById('mpRespSelecionado').classList.remove('show');
            document.getElementById('mpParentescoRow').style.display = 'none';
            this.responsavelSelecionado = null;
            this.modoResponsavelManual = false;
            document.getElementById('mpRespBusca').focus();
        } else {
            section.style.display = 'none';
            this.responsavelSelecionado = null;
            this.modoResponsavelManual = false;
        }
    },
    
    // Toggle campos de paciente estrangeiro
    toggleEstrangeiro: function() {
        var checked = document.getElementById('mpEstrangeiro').checked;
        var fields = document.getElementById('mpEstrangeiroFields');
        
        // Mudar label do documento
        var docLabel = document.getElementById('mpDocLabel');
        var rgLabel = document.getElementById('mpRgLabel');
        
        if (checked) {
            fields.classList.add('show');
            docLabel.innerHTML = 'Passaporte <span class="required mp-obrigatorio">*</span>';
            rgLabel.textContent = 'Nº Identidade Estrangeira';
            document.getElementById('mpCpf').placeholder = 'Número do passaporte';
        } else {
            fields.classList.remove('show');
            docLabel.innerHTML = 'CPF <span class="required mp-obrigatorio">*</span>';
            rgLabel.textContent = 'RG';
            document.getElementById('mpCpf').placeholder = '000.000.000-00';
        }
    },
    
    // Toggle dados incompletos - quando paciente não quer informar tudo
    toggleDadosIncompletos: function() {
        var checked = document.getElementById('mpDadosIncompletos').checked;
        var camposObrigatorios = document.getElementById('mpCamposObrigatorios');
        var campoNomeCompleto = document.getElementById('mpCampoNomeCompleto');
        var campoNomeTelefone = document.getElementById('mpCampoNomeTelefone');
        var aviso = document.getElementById('mpAvisoNfe');
        
        if (checked) {
            // Modo simplificado: Nome + Telefone lado a lado
            campoNomeCompleto.style.display = 'none';
            campoNomeTelefone.style.display = 'grid';
            camposObrigatorios.style.display = 'none';
            
            // Copiar valor do nome se já preenchido
            var nomeAtual = document.getElementById('mpNome').value;
            if (nomeAtual) {
                document.getElementById('mpNomeSimples').value = nomeAtual;
            }
            
            // Atualizar aviso
            if (aviso) {
                aviso.innerHTML = '⚠️ <strong>Cadastro simplificado ativo</strong><br><span style="font-size:11px;">Apenas nome e telefone obrigatórios. Complete os dados antes de emitir NFS-e.</span>';
                aviso.classList.add('aviso-amarelo');
            }
        } else {
            // Modo completo: Nome 100% + todos os campos
            campoNomeCompleto.style.display = 'block';
            campoNomeTelefone.style.display = 'none';
            camposObrigatorios.style.display = 'block';
            
            // Copiar valor do nome simples de volta
            var nomeSimples = document.getElementById('mpNomeSimples').value;
            if (nomeSimples) {
                document.getElementById('mpNome').value = nomeSimples;
            }
            
            // Copiar telefone para o campo de celular
            var telSimples = document.getElementById('mpTelefoneSimples').value;
            if (telSimples) {
                document.getElementById('mpCelular').value = telSimples;
            }
            
            // Restaurar aviso
            if (aviso) {
                aviso.innerHTML = '📋 <strong>Campos obrigatórios para NFS-e</strong><br><span style="font-size:11px;">Os campos marcados com <span class="required">*</span> são necessários para emissão da nota fiscal.</span>';
                aviso.classList.remove('aviso-amarelo');
            }
        }
    },

    // Buscar responsável
    buscarResponsavel: function() {
        var termo = document.getElementById('mpRespBusca').value.trim().toLowerCase();
        var resultados = document.getElementById('mpRespResultados');
        var aviso = document.getElementById('mpRespAviso');
        
        if (termo.length < 2) {
            resultados.classList.remove('show');
            aviso.classList.remove('show');
            return;
        }
        
        // Filtrar pacientes (excluir menores de idade)
        var encontrados = this.pacientesCache.filter(function(p) {
            // Não mostrar pacientes que são menores de idade
            if (p.menorIdade) return false;
            
            var nomeMatch = p.nome && p.nome.toLowerCase().includes(termo);
            var cpfMatch = p.cpf && p.cpf.replace(/\D/g, '').includes(termo.replace(/\D/g, ''));
            return nomeMatch || cpfMatch;
        });
        
        if (encontrados.length === 0) {
            resultados.classList.remove('show');
            aviso.classList.add('show');
            return;
        }
        
        aviso.classList.remove('show');
        
        // Renderizar resultados
        var html = '';
        encontrados.slice(0, 5).forEach(function(p) {
            html += '<div class="mp-resp-item" onclick="ModalPaciente.selecionarResponsavel(\'' + p.id + '\')">';
            html += '<div class="mp-resp-item-nome">' + p.nome + '</div>';
            html += '<div class="mp-resp-item-cpf">CPF: ' + (p.cpf || 'Não informado') + '</div>';
            html += '</div>';
        });
        
        resultados.innerHTML = html;
        resultados.classList.add('show');
    },

    // Selecionar responsável
    selecionarResponsavel: function(id) {
        var paciente = this.pacientesCache.find(function(p) { return p.id === id; });
        
        if (!paciente) return;
        
        this.responsavelSelecionado = paciente;
        this.modoResponsavelManual = false;
        
        // Atualizar UI
        document.getElementById('mpRespSelNome').textContent = '✅ ' + paciente.nome;
        document.getElementById('mpRespSelCpf').textContent = 'CPF: ' + (paciente.cpf || 'Não informado');
        
        // Esconder busca, mostrar selecionado
        document.getElementById('mpRespBuscaArea').style.display = 'none';
        document.getElementById('mpRespResultados').classList.remove('show');
        document.getElementById('mpRespSelecionado').classList.add('show');
        document.getElementById('mpParentescoRow').style.display = 'block';
        document.getElementById('mpRespCamposManuais').classList.remove('show');
        
        // Focar no parentesco
        document.getElementById('mpRespParentesco').focus();
    },

    // Trocar responsável (voltar para busca)
    trocarResponsavel: function() {
        this.responsavelSelecionado = null;
        this.modoResponsavelManual = false;
        document.getElementById('mpRespSelecionado').classList.remove('show');
        document.getElementById('mpParentescoRow').style.display = 'none';
        document.getElementById('mpRespBuscaArea').style.display = 'block';
        document.getElementById('mpRespBusca').value = '';
        document.getElementById('mpRespBusca').focus();
    },
    
    // Mostrar campos manuais para novo responsável
    mostrarCamposResponsavel: function() {
        document.getElementById('mpRespBuscaArea').style.display = 'none';
        document.getElementById('mpRespCamposManuais').classList.add('show');
        document.getElementById('mpRespSelecionado').classList.remove('show');
        document.getElementById('mpParentescoRow').style.display = 'none';
        this.responsavelSelecionado = null;
        this.modoResponsavelManual = true;
        document.getElementById('mpRespNome').focus();
    },
    
    // Voltar para busca de responsável
    voltarBuscaResponsavel: function() {
        document.getElementById('mpRespCamposManuais').classList.remove('show');
        document.getElementById('mpRespBuscaArea').style.display = 'block';
        this.modoResponsavelManual = false;
        // Limpar campos manuais
        document.getElementById('mpRespNome').value = '';
        document.getElementById('mpRespCpf').value = '';
        document.getElementById('mpRespTelefone').value = '';
        document.getElementById('mpRespEmail').value = '';
        document.getElementById('mpRespParentescoNovo').value = '';
        document.getElementById('mpRespMesmoEndereco').checked = true;
        document.getElementById('mpRespEnderecoArea').style.display = 'none';
    },
    
    // Toggle endereço do responsável
    toggleEnderecoResponsavel: function() {
        var mesmoEndereco = document.getElementById('mpRespMesmoEndereco').checked;
        var enderecoArea = document.getElementById('mpRespEnderecoArea');
        
        if (mesmoEndereco) {
            enderecoArea.style.display = 'none';
        } else {
            enderecoArea.style.display = 'block';
        }
    },

    // Buscar CEP via ViaCEP
    buscarCep: async function() {
        var cepInput = document.getElementById('mpCep');
        var cep = cepInput.value.replace(/\D/g, '');
        
        if (cep.length !== 8) return;
        
        // Adicionar classe de loading
        cepInput.classList.add('loading');
        
        try {
            var response = await fetch('https://viacep.com.br/ws/' + cep + '/json/');
            var data = await response.json();
            
            cepInput.classList.remove('loading');
            
            if (data.erro) {
                alert('CEP não encontrado');
                return;
            }
            
            // Preencher campos
            document.getElementById('mpEndereco').value = data.logradouro || '';
            document.getElementById('mpBairro').value = data.bairro || '';
            document.getElementById('mpCidade').value = data.localidade || '';
            document.getElementById('mpEstado').value = data.uf || '';
            
            // Focar no número
            document.getElementById('mpNumero').focus();
            
        } catch (error) {
            cepInput.classList.remove('loading');
            console.error('Erro ao buscar CEP:', error);
        }
    },

    // Salvar paciente
    salvar: async function() {
        var btn = document.getElementById('mpBtnSalvar');
        var errDiv = document.getElementById('mpError');
        
        // Verificar se checkbox de dados incompletos está marcado
        var aceitaIncompleto = document.getElementById('mpDadosIncompletos') && document.getElementById('mpDadosIncompletos').checked;
        
        // Validar nome (SEMPRE obrigatório) - pegar do campo correto
        var nome;
        if (aceitaIncompleto) {
            nome = document.getElementById('mpNomeSimples').value.trim();
        } else {
            nome = document.getElementById('mpNome').value.trim();
        }
        
        if (!nome || nome.length < 2) {
            errDiv.textContent = '❌ Nome do paciente é obrigatório (mínimo 2 caracteres)';
            errDiv.style.display = 'block';
            var campoNome = aceitaIncompleto ? document.getElementById('mpNomeSimples') : document.getElementById('mpNome');
            campoNome.focus();
            return;
        }
        
        // Se modo simplificado, validar telefone
        if (aceitaIncompleto) {
            var telSimples = document.getElementById('mpTelefoneSimples').value.trim();
            if (!telSimples) {
                errDiv.textContent = '❌ Telefone é obrigatório no cadastro simplificado';
                errDiv.style.display = 'block';
                document.getElementById('mpTelefoneSimples').focus();
                return;
            }
        }

        var estrangeiro = document.getElementById('mpEstrangeiro').checked;
        var cpf = document.getElementById('mpCpf').value.trim();
        var cep = document.getElementById('mpCep').value.trim();
        var endereco = document.getElementById('mpEndereco').value.trim();
        var numero = document.getElementById('mpNumero').value.trim();
        var bairro = document.getElementById('mpBairro').value.trim();
        var cidade = document.getElementById('mpCidade').value.trim();
        var estado = document.getElementById('mpEstado').value;

        // Se NÃO aceitou dados incompletos, validar todos os campos obrigatórios
        if (!aceitaIncompleto) {
            // Validar CPF/Passaporte
            if (!cpf) {
                errDiv.textContent = estrangeiro ? '❌ Passaporte é obrigatório' : '❌ CPF é obrigatório';
                errDiv.style.display = 'block';
                document.getElementById('mpCpf').focus();
                return;
            }
            
            // Validar endereço
            if (!cep) {
                errDiv.textContent = '❌ CEP é obrigatório';
                errDiv.style.display = 'block';
                document.getElementById('mpCep').focus();
                return;
            }
            if (!endereco) {
                errDiv.textContent = '❌ Endereço é obrigatório';
                errDiv.style.display = 'block';
                document.getElementById('mpEndereco').focus();
                return;
            }
            if (!numero) {
                errDiv.textContent = '❌ Número é obrigatório';
                errDiv.style.display = 'block';
                document.getElementById('mpNumero').focus();
                return;
            }
            if (!bairro) {
                errDiv.textContent = '❌ Bairro é obrigatório';
                errDiv.style.display = 'block';
                document.getElementById('mpBairro').focus();
                return;
            }
            if (!cidade) {
                errDiv.textContent = '❌ Cidade é obrigatória';
                errDiv.style.display = 'block';
                document.getElementById('mpCidade').focus();
                return;
            }
            if (!estado) {
                errDiv.textContent = '❌ Estado é obrigatório';
                errDiv.style.display = 'block';
                document.getElementById('mpEstado').focus();
                return;
            }
            
            // Validar email (obrigatório para NFS-e)
            var email = document.getElementById('mpEmail').value.trim();
            if (!email) {
                errDiv.textContent = '❌ Email é obrigatório para emissão de NFS-e';
                errDiv.style.display = 'block';
                document.getElementById('mpEmail').focus();
                return;
            }
            // Validar formato do email
            var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                errDiv.textContent = '❌ Email inválido. Verifique o formato (ex: nome@email.com)';
                errDiv.style.display = 'block';
                document.getElementById('mpEmail').focus();
                return;
            }
            
            // Validar responsável se menor de idade (apenas no modo completo)
            var menorIdade = document.getElementById('mpMenorIdade').checked;
            if (menorIdade) {
                // Verificar se tem responsável selecionado da busca
                if (this.responsavelSelecionado) {
                    // Validar apenas parentesco
                    var parentesco = document.getElementById('mpRespParentesco').value;
                    if (!parentesco) {
                        errDiv.textContent = '❌ Selecione o parentesco do responsável';
                        errDiv.style.display = 'block';
                        document.getElementById('mpRespParentesco').focus();
                        return;
                    }
                } else if (this.modoResponsavelManual) {
                    // Validar campos manuais
                    var respNome = document.getElementById('mpRespNome').value.trim();
                    var respCpf = document.getElementById('mpRespCpf').value.trim();
                    var parentesco = document.getElementById('mpRespParentescoNovo').value;
                    
                    if (!respNome) {
                        errDiv.textContent = '❌ Nome do responsável é obrigatório';
                        errDiv.style.display = 'block';
                        document.getElementById('mpRespNome').focus();
                        return;
                    }
                    
                    if (!respCpf) {
                        errDiv.textContent = '❌ CPF do responsável é obrigatório';
                        errDiv.style.display = 'block';
                        document.getElementById('mpRespCpf').focus();
                        return;
                    }
                    
                    if (!parentesco) {
                        errDiv.textContent = '❌ Selecione o parentesco do responsável';
                        errDiv.style.display = 'block';
                        document.getElementById('mpRespParentescoNovo').focus();
                        return;
                    }
                } else {
                    // Nenhum responsável informado
                    errDiv.textContent = '❌ Informe os dados do responsável legal';
                    errDiv.style.display = 'block';
                    return;
                }
            }
        }

        // Verificar menor de idade (para montar dados)
        var menorIdade = document.getElementById('mpMenorIdade').checked;

        errDiv.style.display = 'none';
        btn.disabled = true;
        btn.textContent = 'Salvando...';

        // Verificar se está no modo simplificado
        var modoSimplificado = document.getElementById('mpDadosIncompletos').checked;
        var nomeParaSalvar = nome;
        var celularParaSalvar = document.getElementById('mpCelular').value.trim() || null;
        
        if (modoSimplificado) {
            nomeParaSalvar = document.getElementById('mpNomeSimples').value.trim() || nome;
            celularParaSalvar = document.getElementById('mpTelefoneSimples').value.trim() || celularParaSalvar;
        }

        // Montar dados
        var dados = {
            nome: nomeParaSalvar,
            cpf: estrangeiro ? null : (cpf || null),
            passaporte: estrangeiro ? (cpf || null) : null,
            rg: document.getElementById('mpRg').value.trim() || null,
            dataNascimento: document.getElementById('mpNascimento').value || null,
            sexo: document.getElementById('mpSexo').value || null,
            telefone: document.getElementById('mpTelefone').value.trim() || null,
            celular: celularParaSalvar,
            email: document.getElementById('mpEmail').value.trim() || null,
            cep: cep || null,
            endereco: endereco || null,
            numero: numero || null,
            complemento: document.getElementById('mpComplemento').value.trim() || null,
            bairro: bairro || null,
            cidade: cidade || null,
            estado: estado || null,
            convenio: document.getElementById('mpConvenio').value.trim() || null,
            numeroConvenio: document.getElementById('mpNumConvenio').value.trim() || null,
            observacoes: document.getElementById('mpObservacoes').value.trim() || null,
            alergias: document.getElementById('mpAlergias').value.trim() || null,
            condicoesEspeciais: document.getElementById('mpCondicoesEspeciais').value.trim() || null,
            menorIdade: menorIdade,
            estrangeiro: estrangeiro,
            pais: estrangeiro ? (document.getElementById('mpPais').value.trim() || null) : null,
            nacionalidade: estrangeiro ? (document.getElementById('mpNacionalidade').value.trim() || null) : null,
            tipo_documento: estrangeiro ? 'passaporte' : 'cpf'
        };

        // Dados do responsável (do paciente selecionado OU campos manuais)
        if (menorIdade) {
            if (this.responsavelSelecionado) {
                // Responsável selecionado da busca
                dados.responsavelNome = this.responsavelSelecionado.nome;
                dados.responsavelCpf = this.responsavelSelecionado.cpf;
                dados.responsavelRg = this.responsavelSelecionado.rg || null;
                dados.responsavelTelefone = this.responsavelSelecionado.celular || this.responsavelSelecionado.telefone || null;
                dados.responsavelEmail = this.responsavelSelecionado.email || null;
                dados.responsavelParentesco = document.getElementById('mpRespParentesco').value;
                
                // Montar endereço completo do responsável
                var endResp = [];
                if (this.responsavelSelecionado.endereco) endResp.push(this.responsavelSelecionado.endereco);
                if (this.responsavelSelecionado.numero) endResp.push(this.responsavelSelecionado.numero);
                if (this.responsavelSelecionado.bairro) endResp.push(this.responsavelSelecionado.bairro);
                if (this.responsavelSelecionado.cidade) endResp.push(this.responsavelSelecionado.cidade);
                if (this.responsavelSelecionado.estado) endResp.push(this.responsavelSelecionado.estado);
                dados.responsavelEndereco = endResp.join(', ') || null;
            } else if (this.modoResponsavelManual) {
                // Responsável cadastrado manualmente
                dados.responsavelNome = document.getElementById('mpRespNome').value.trim();
                dados.responsavelCpf = document.getElementById('mpRespCpf').value.trim();
                dados.responsavelTelefone = document.getElementById('mpRespTelefone').value.trim() || null;
                dados.responsavelEmail = document.getElementById('mpRespEmail').value.trim() || null;
                dados.responsavelParentesco = document.getElementById('mpRespParentescoNovo').value;
                
                // Verificar se usa mesmo endereço do paciente
                var mesmoEndereco = document.getElementById('mpRespMesmoEndereco').checked;
                if (mesmoEndereco) {
                    // Usar endereço do paciente
                    var endResp = [];
                    if (endereco) endResp.push(endereco);
                    if (numero) endResp.push(numero);
                    if (bairro) endResp.push(bairro);
                    if (cidade) endResp.push(cidade);
                    if (estado) endResp.push(estado);
                    dados.responsavelEndereco = endResp.join(', ') || null;
                } else {
                    // Usar endereço específico do responsável
                    var endResp = [];
                    var respEnd = document.getElementById('mpRespEndereco').value.trim();
                    var respNum = document.getElementById('mpRespNumero').value.trim();
                    var respBairro = document.getElementById('mpRespBairro').value.trim();
                    var respCidade = document.getElementById('mpRespCidade').value.trim();
                    var respEstado = document.getElementById('mpRespEstado').value;
                    if (respEnd) endResp.push(respEnd);
                    if (respNum) endResp.push(respNum);
                    if (respBairro) endResp.push(respBairro);
                    if (respCidade) endResp.push(respCidade);
                    if (respEstado) endResp.push(respEstado);
                    dados.responsavelEndereco = endResp.join(', ') || null;
                }
            }
        }

        try {
            // Chamar API - POST para novo, PUT para edição
            var url = '/api/pacientes';
            var method = 'POST';
            
            if (this.modoEdicao && this.pacienteEditandoId) {
                url = '/api/pacientes/' + this.pacienteEditandoId;
                method = 'PUT';
            }
            
            var res = await apiCall(url, method, dados);
            
            console.log('Resposta do servidor:', res);

            btn.disabled = false;
            btn.textContent = this.modoEdicao ? 'Salvar Alterações' : 'Salvar Paciente';

            if (res && (res.success || res.paciente || res.id)) {
                // Chamar callback com o paciente criado/atualizado
                if (this.callback && typeof this.callback === 'function') {
                    this.callback(res.paciente || res);
                }
                this.fechar();
                
                // Mostrar mensagem de sucesso
                var msg = this.modoEdicao ? 'Paciente atualizado com sucesso!' : 'Paciente cadastrado com sucesso!';
                if (typeof mostrarSucesso === 'function') {
                    mostrarSucesso(msg);
                } else {
                    alert('✅ ' + msg);
                }
            } else {
                errDiv.textContent = res && res.erro ? res.erro : 'Erro ao cadastrar paciente';
                errDiv.style.display = 'block';
                console.error('Erro resposta:', res);
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
            btn.disabled = false;
            btn.textContent = 'Salvar Paciente';
            errDiv.textContent = 'Erro de conexão com o servidor: ' + (error.message || error);
            errDiv.style.display = 'block';
        }
    },

    // Configurar máscaras de input
   setupMascaras: function() {
        // Máscara de CPF com validação
        var cpfInputs = ['mpCpf'];
        cpfInputs.forEach(function(id) {
            var el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', function(e) {
                    // Se estrangeiro, não aplicar máscara de CPF
                    var isEstrangeiro = document.getElementById('mpEstrangeiro') && document.getElementById('mpEstrangeiro').checked;
                    if (isEstrangeiro) {
                        // Passaporte: aceita letras e números, sem formatação
                        return;
                    }
                    var v = e.target.value.replace(/\D/g, '');
                    if (v.length > 11) v = v.slice(0, 11);
                    if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
                    else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
                    else if (v.length > 3) v = v.replace(/(\d{3})(\d{1,3})/, '$1.$2');
                    e.target.value = v;
                    // Remover classe de erro ao digitar
                    e.target.classList.remove('cpf-invalido', 'cpf-valido');
                });
                
                // Validar CPF ao sair do campo
                el.addEventListener('blur', function(e) {
                    // Se estrangeiro, não validar como CPF
                    var isEstrangeiro = document.getElementById('mpEstrangeiro') && document.getElementById('mpEstrangeiro').checked;
                    if (isEstrangeiro) {
                        e.target.classList.remove('cpf-invalido', 'cpf-valido');
                        return;
                    }
                    var cpf = e.target.value.replace(/\D/g, '');
                    if (cpf.length === 0) {
                        e.target.classList.remove('cpf-invalido', 'cpf-valido');
                        return;
                    }
                    if (cpf.length === 11 && ModalPaciente.validarCPF(cpf)) {
                        e.target.classList.remove('cpf-invalido');
                        e.target.classList.add('cpf-valido');
                    } else if (cpf.length > 0) {
                        e.target.classList.remove('cpf-valido');
                        e.target.classList.add('cpf-invalido');
                    }
                });
            }
        });

        // Máscara de telefone
        var telInputs = ['mpTelefone', 'mpCelular', 'mpTelRecados'];
        telInputs.forEach(function(id) {
            var el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', function(e) {
                    var v = e.target.value.replace(/\D/g, '');
                    if (v.length > 11) v = v.slice(0, 11);
                    if (v.length > 10) v = v.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
                    else if (v.length > 6) v = v.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
                    else if (v.length > 2) v = v.replace(/(\d{2})(\d{0,5})/, '($1) $2');
                    e.target.value = v;
                });
            }
        });

        // Máscara de CEP com busca automática
        var cepEl = document.getElementById('mpCep');
        if (cepEl) {
            // Função para aplicar máscara e buscar
            function handleCep(e) {
                var v = e.target.value.replace(/\D/g, '');
                if (v.length > 8) v = v.slice(0, 8);
                if (v.length > 5) v = v.replace(/(\d{5})(\d{1,3})/, '$1-$2');
                e.target.value = v;
                
                // Buscar CEP automaticamente quando completar 8 dígitos
                if (v.length === 8) {
                    ModalPaciente.buscarCep();
                }
            }
            
            cepEl.addEventListener('input', handleCep);
            cepEl.addEventListener('change', handleCep);
            cepEl.addEventListener('blur', function(e) {
                var v = e.target.value.replace(/\D/g, '');
                if (v.length === 8) {
                    ModalPaciente.buscarCep();
                }
            });
            // Também buscar ao colar
            cepEl.addEventListener('paste', function(e) {
                setTimeout(function() {
                    var v = cepEl.value.replace(/\D/g, '');
                    if (v.length >= 8) {
                        cepEl.value = v.slice(0,5) + '-' + v.slice(5,8);
                        ModalPaciente.buscarCep();
                    }
                }, 100);
            });
        }
        
        // Handler para radio buttons de Sexo
        var sexoRadios = document.querySelectorAll('input[name="mpSexo"]');
        var sexoHidden = document.getElementById('mpSexo');
        sexoRadios.forEach(function(radio) {
            radio.addEventListener('change', function() {
                if (sexoHidden) {
                    sexoHidden.value = this.value;
                }
                // Atualizar visual dos labels
                document.querySelectorAll('.mp-sexo-radio').forEach(function(label) {
                    label.classList.remove('selected');
                });
                this.closest('.mp-sexo-radio').classList.add('selected');
            });
        });
    },
    
    // Validar CPF (algoritmo oficial)
    validarCPF: function(cpf) {
        cpf = cpf.replace(/\D/g, '');
        
        if (cpf.length !== 11) return false;
        
        // CPFs inválidos conhecidos
        if (/^(\d)\1{10}$/.test(cpf)) return false;
        
        // Validar primeiro dígito verificador
        var soma = 0;
        for (var i = 0; i < 9; i++) {
            soma += parseInt(cpf.charAt(i)) * (10 - i);
        }
        var resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpf.charAt(9))) return false;
        
        // Validar segundo dígito verificador
        soma = 0;
        for (var i = 0; i < 10; i++) {
            soma += parseInt(cpf.charAt(i)) * (11 - i);
        }
        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpf.charAt(10))) return false;
        
        return true;
    }
};

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { ModalPaciente.init(); });
} else {
    ModalPaciente.init();
}
