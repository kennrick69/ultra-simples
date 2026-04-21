// ============================================
// ORÇAMENTOS MODAL - Standalone (incluir em qualquer página)
// ============================================
(function() {
    const style = document.createElement('style');
    style.textContent = `
        .modal-orc-overlay { position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:600;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity 0.25s; }
        .modal-orc-overlay.open { opacity:1;pointer-events:auto; }
        .modal-orc { background:white;border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,0.2);width:92%;max-width:720px;max-height:88vh;display:flex;flex-direction:column;transform:translateY(20px) scale(0.97);transition:transform 0.25s;overflow:hidden; }
        .modal-orc-overlay.open .modal-orc { transform:translateY(0) scale(1); }
        .modal-orc-header { padding:16px 24px;background:linear-gradient(135deg,#1FA2FF,#12D8FA);color:white;display:flex;justify-content:space-between;align-items:center;flex-shrink:0; }
        .modal-orc-header h3 { margin:0;font-size:17px;font-weight:700; }
        .modal-orc-close { background:rgba(255,255,255,0.2);border:none;color:white;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center; }
        .modal-orc-close:hover { background:rgba(255,255,255,0.35); }
        .modal-orc-body { padding:20px 24px;overflow-y:auto;flex:1; }
        .modal-orc-footer { padding:14px 24px;border-top:1px solid #e5e7eb;display:flex;justify-content:flex-end;gap:8px;flex-shrink:0;flex-wrap:wrap; }
        .orc-lista-item { display:flex;align-items:center;padding:12px;border:1px solid #e5e7eb;border-radius:10px;margin-bottom:6px;cursor:pointer;transition:all 0.15s;gap:10px; }
        .orc-lista-item:hover { background:#f0f9ff;border-color:#93c5fd;transform:translateX(2px); }
        .orc-id { background:#1FA2FF;color:white;padding:3px 8px;border-radius:6px;font-size:11px;font-weight:700;flex-shrink:0; }
        .orc-info { flex:1; }
        .orc-pac { font-weight:600;font-size:13px;color:#1f2937; }
        .orc-date { font-size:11px;color:#6b7280;margin-top:1px; }
        .orc-total { font-weight:800;font-size:14px;color:#1e5080;flex-shrink:0; }
        .orc-status { padding:3px 8px;border-radius:20px;font-size:10px;font-weight:700;text-transform:uppercase;flex-shrink:0; }
        .orc-status.aberto { background:#fef3c7;color:#b45309; }
        .orc-status.aprovado_parcial { background:#dbeafe;color:#1d4ed8; }
        .orc-status.aprovado_total { background:#d1fae5;color:#15803d; }
        .orc-status.assinado { background:#d1fae5;color:#15803d;border:1px solid #86efac; }
        .orc-status.vencido { background:#fee2e2;color:#dc2626; }
        .orc-detalhe-table { width:100%;border-collapse:collapse;margin:10px 0; }
        .orc-detalhe-table th { background:#f1f5f9;padding:8px 10px;text-align:left;font-size:11px;color:#64748b;font-weight:700;border-bottom:2px solid #e2e8f0; }
        .orc-detalhe-table td { padding:8px 10px;border-bottom:1px solid #f1f5f9;font-size:13px; }
        .orc-detalhe-total { display:flex;justify-content:space-between;padding:12px 16px;background:#f0f9ff;border-radius:10px;margin-top:10px; }
        .orc-detalhe-total .label { font-size:12px;color:#374151; }
        .orc-detalhe-total .valor { font-size:18px;font-weight:800;color:#1e5080; }
        .orc-check { width:18px;height:18px;accent-color:#22c55e; }
        .orc-assinatura-badge { display:flex;align-items:center;gap:10px;padding:12px 16px;background:#f0fdf4;border:1px solid #86efac;border-radius:12px;margin-top:14px; }
        .orc-assinatura-badge .icon { font-size:28px; }
        .orc-assinatura-badge .asi-info { flex:1; }
        .orc-assinatura-badge .asi-info .title { font-size:13px;font-weight:700;color:#16a34a; }
        .orc-assinatura-badge .asi-info .detail { font-size:11px;color:#6b7280;margin-top:2px; }
        .orc-assinatura-img { max-width:200px;max-height:80px;border:1px solid #e5e7eb;border-radius:8px;cursor:pointer;transition:transform 0.2s; }
        .orc-assinatura-img:hover { transform:scale(1.05); }
        .orc-img-ampliada-overlay { position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);z-index:700;display:flex;align-items:center;justify-content:center;cursor:pointer; }
        .orc-img-ampliada-overlay img { max-width:90%;max-height:80vh;background:white;padding:20px;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,0.3); }
        .orc-footer-btn { padding:8px 16px;border-radius:8px;font-size:12px;cursor:pointer;font-weight:600;font-family:'Inter',sans-serif;border:1px solid #d1d5db;background:white;transition:all 0.15s; }
        .orc-footer-btn:hover { filter:brightness(0.95); }
    `;
    document.head.appendChild(style);

    const API_URL = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : 'https://dentist-backend-v2-production.up.railway.app';
    let _orcamentoAtual = null;

    function _apiCall(endpoint, method, body) {
        if (typeof window.apiCall === 'function') return window.apiCall(endpoint, method, body);
        const token = localStorage.getItem('token');
        if (!token) { window.location.href = 'login.html'; return Promise.reject(); }
        const opts = { method: method || 'GET', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token } };
        if (body) opts.body = JSON.stringify(body);
        return fetch(API_URL + endpoint, opts).then(r => {
            if (r.status === 401) { localStorage.clear(); window.location.href = 'login.html'; return; }
            return r.json();
        });
    }

    function _toast(msg, tipo) {
        if (typeof window.mostrarToast === 'function') return window.mostrarToast(msg, tipo);
        let t = document.getElementById('orc-toast-fb');
        if (!t) { t = document.createElement('div'); t.id = 'orc-toast-fb'; t.style.cssText = 'position:fixed;bottom:20px;right:20px;padding:12px 20px;border-radius:10px;color:white;font-size:13px;font-weight:600;z-index:999;opacity:0;transform:translateY(10px);transition:all 0.3s;pointer-events:none;'; document.body.appendChild(t); }
        const colors = { success: '#22c55e', error: '#ef4444', info: '#1FA2FF' };
        t.style.background = colors[tipo] || colors.info;
        t.textContent = msg; t.style.opacity = '1'; t.style.transform = 'translateY(0)';
        setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateY(10px)'; }, 3000);
    }

    function _createModal() {
        if (document.getElementById('modal-orc-overlay')) return;
        const overlay = document.createElement('div');
        overlay.className = 'modal-orc-overlay';
        overlay.id = 'modal-orc-overlay';
        overlay.onclick = e => { if (e.target === overlay) window.fecharModalOrcamentos(); };
        overlay.innerHTML = '<div class="modal-orc"><div class="modal-orc-header"><h3 id="modal-orc-title">\uD83D\uDCB0 Or\u00e7amentos</h3><button class="modal-orc-close" onclick="fecharModalOrcamentos()">\u2715</button></div><div class="modal-orc-body" id="modal-orc-body"><div style="text-align:center;padding:40px;color:#9ca3af;">Carregando...</div></div><div class="modal-orc-footer" id="modal-orc-footer"></div></div>';
        document.body.appendChild(overlay);
    }

    const statusLabel = { aberto: 'Aberto', aprovado_parcial: 'Parcial', aprovado_total: 'Aprovado', assinado: '\u270d\ufe0f Assinado', vencido: 'Vencido' };
    function _fmtReal(v) { return 'R$ ' + parseFloat(v).toFixed(2).replace('.',','); }

    function _getBaseUrl() {
        var loc = window.location;
        var path = loc.pathname.substring(0, loc.pathname.lastIndexOf('/') + 1);
        return loc.origin + path;
    }

    // ===== PUBLIC FUNCTIONS =====

    window.abrirModalOrcamentos = function() {
        _createModal();
        document.getElementById('modal-orc-overlay').classList.add('open');
        window.carregarListaOrcamentos();
    };

    window.fecharModalOrcamentos = function() {
        var el = document.getElementById('modal-orc-overlay');
        if (el) el.classList.remove('open');
    };

    window.carregarListaOrcamentos = async function(pacienteId) {
        var body = document.getElementById('modal-orc-body');
        var footer = document.getElementById('modal-orc-footer');
        var title = document.getElementById('modal-orc-title');
        title.textContent = '\uD83D\uDCB0 Or\u00e7amentos';
        footer.innerHTML = '';
        try {
            var url = '/api/orcamentos';
            if (pacienteId) url += '?pacienteId=' + pacienteId;
            var data = await _apiCall(url);
            if (!data.success || !data.orcamentos.length) {
                body.innerHTML = '<div style="text-align:center;padding:40px;"><div style="font-size:48px;opacity:0.3;margin-bottom:12px;">\uD83D\uDCCB</div><p style="color:#9ca3af;">Nenhum or\u00e7amento encontrado</p></div>';
                return;
            }
            var html = '<div style="margin-bottom:12px;display:flex;gap:8px;"><input type="text" id="orc-busca" placeholder="\uD83D\uDD0D Buscar paciente..." style="flex:1;padding:10px 14px;border:1px solid #e5e7eb;border-radius:10px;font-size:13px;font-family:Inter,sans-serif;" oninput="filtrarOrcamentos()"></div><div id="orc-lista">';
            data.orcamentos.forEach(function(o) {
                html += '<div class="orc-lista-item" onclick="abrirDetalheOrcamento(' + o.id + ')" data-nome="' + (o.pacienteNome||'').toLowerCase() + '">';
                html += '<span class="orc-id">#' + String(o.id).padStart(3,'0') + '</span>';
                html += '<div class="orc-info"><div class="orc-pac">' + (o.pacienteNome || 'Paciente') + '</div>';
                html += '<div class="orc-date">' + new Date(o.criadoEm).toLocaleDateString('pt-BR') + ' \u00b7 ' + (o.dentistaNome || '') + '</div></div>';
                html += '<span class="orc-status ' + o.status + '">' + (statusLabel[o.status] || o.status) + '</span>';
                html += '<span class="orc-total">' + _fmtReal(o.total) + '</span></div>';
            });
            html += '</div>';
            body.innerHTML = html;
        } catch(e) {
            body.innerHTML = '<p style="color:#ef4444;text-align:center;">Erro ao carregar or\u00e7amentos</p>';
        }
    };

    window.filtrarOrcamentos = function() {
        var busca = document.getElementById('orc-busca').value.toLowerCase();
        document.querySelectorAll('#orc-lista .orc-lista-item').forEach(function(el) {
            el.style.display = el.dataset.nome.includes(busca) ? '' : 'none';
        });
    };

    window.abrirDetalheOrcamento = async function(id) {
        var body = document.getElementById('modal-orc-body');
        var footer = document.getElementById('modal-orc-footer');
        var title = document.getElementById('modal-orc-title');
        body.innerHTML = '<div style="text-align:center;padding:40px;color:#9ca3af;">Carregando...</div>';
        try {
            var data = await _apiCall('/api/orcamentos/' + id);
            if (!data.success) throw new Error();
            var o = data.orcamento;
            var itens = data.itens;
            _orcamentoAtual = Object.assign({}, o, { itens: itens });
            window.orcamentoAtual = _orcamentoAtual;
            var total = itens.reduce(function(s, i) { return s + i.valor; }, 0);
            var aprovado = itens.filter(function(i) { return i.aprovado; }).reduce(function(s, i) { return s + i.valor; }, 0);
            title.textContent = '\uD83D\uDCB0 Or\u00e7amento #' + String(o.id).padStart(3,'0');

            var h = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px;">';
            h += '<div style="padding:8px 12px;background:#f8fafc;border-radius:8px;"><span style="font-size:11px;color:#6b7280;">Paciente</span><br><strong style="font-size:14px;">' + (o.pacienteNome||'-') + '</strong></div>';
            h += '<div style="padding:8px 12px;background:#f8fafc;border-radius:8px;"><span style="font-size:11px;color:#6b7280;">Dentista</span><br><strong style="font-size:14px;">' + (o.dentistaNome||'-') + (o.dentistaCro ? ' \u00b7 CRO ' + o.dentistaCro : '') + '</strong></div>';
            h += '<div style="padding:8px 12px;background:#f8fafc;border-radius:8px;"><span style="font-size:11px;color:#6b7280;">Data</span><br><strong>' + new Date(o.criadoEm).toLocaleDateString('pt-BR') + '</strong></div>';
            h += '<div style="padding:8px 12px;background:#f8fafc;border-radius:8px;"><span style="font-size:11px;color:#6b7280;">Status</span><br><span class="orc-status ' + o.status + '">' + (statusLabel[o.status] || o.status) + '</span></div>';
            h += '</div>';

            h += '<table class="orc-detalhe-table"><thead><tr><th style="width:40px;">\u2713</th><th>Dente</th><th>Procedimento</th><th style="text-align:right;">Valor</th></tr></thead><tbody>';
            itens.forEach(function(i) {
                h += '<tr><td><input type="checkbox" class="orc-check" ' + (i.aprovado ? 'checked' : '') + ' onchange="toggleItemOrcamento(' + i.id + ',this.checked)"></td>';
                h += '<td><strong>' + (i.dente||'-') + '</strong></td><td>' + i.procedimento + '</td>';
                h += '<td style="text-align:right;font-weight:700;">' + _fmtReal(i.valor) + '</td></tr>';
            });
            h += '</tbody></table>';

            h += '<div class="orc-detalhe-total"><div><div class="label">Total Geral</div><div class="valor">' + _fmtReal(total) + '</div></div>';
            h += '<div style="text-align:right;"><div class="label">Aprovado</div><div class="valor" style="color:#22c55e;" id="orc-total-aprovado">' + _fmtReal(aprovado) + '</div></div></div>';

            // Assinatura badge
            if (o.assinaturaData) {
                h += '<div class="orc-assinatura-badge"><div class="icon">\u2705</div><div class="asi-info"><div class="title">Assinado digitalmente</div>';
                h += '<div class="detail">' + (o.assinaturaNome ? 'Por: ' + o.assinaturaNome + ' \u00b7 ' : '') + new Date(o.assinaturaData).toLocaleString('pt-BR') + '</div></div>';
                if (o.assinaturaImagem) h += '<img src="' + o.assinaturaImagem + '" class="orc-assinatura-img" onclick="ampliarAssinatura(this.src)" title="Clique para ampliar">';
                h += '</div>';
            }
            // Termo badge
            if (o.termoConsentimento) {
                var termoCor = o.termoAceito ? '#f0fdf4' : '#fefce8';
                var termoBorder = o.termoAceito ? '#86efac' : '#fde68a';
                var termoIcon = o.termoAceito ? '\uD83D\uDCDC\u2705' : '\uD83D\uDCDC\u23F3';
                var termoTxt = o.termoAceito ? 'Termo de consentimento aceito' : 'Termo de consentimento vinculado (aguardando aceite)';
                h += '<div style="display:flex;align-items:center;gap:10px;padding:10px 16px;background:' + termoCor + ';border:1px solid ' + termoBorder + ';border-radius:12px;margin-top:8px;cursor:pointer;" onclick="verTermoOrcamento()">';
                h += '<span style="font-size:20px;">' + termoIcon + '</span>';
                h += '<span style="font-size:12px;font-weight:600;color:#374151;">' + termoTxt + '</span>';
                h += '<span style="font-size:10px;color:#7c3aed;margin-left:auto;">clique para ver</span></div>';
            }

            h += '<div style="margin-top:12px;"><label style="font-size:12px;font-weight:600;color:#374151;">Forma de pagamento</label>';
            h += '<input type="text" id="orc-forma-pgto" value="' + (o.formaPagamento||'').replace(/"/g,'&quot;') + '" placeholder="Ex: 3x no cart\u00e3o" style="width:100%;padding:8px 12px;border:1px solid #e5e7eb;border-radius:8px;font-size:13px;margin-top:4px;font-family:Inter,sans-serif;"></div>';
            h += '<div style="margin-top:8px;"><label style="font-size:12px;font-weight:600;color:#374151;">Observa\u00e7\u00f5es</label>';
            h += '<textarea id="orc-obs" placeholder="Observa\u00e7\u00f5es..." style="width:100%;padding:8px 12px;border:1px solid #e5e7eb;border-radius:8px;font-size:13px;margin-top:4px;min-height:50px;font-family:Inter,sans-serif;">' + (o.observacoes||'') + '</textarea></div>';

            body.innerHTML = h;

            // Footer
            var f = '<button class="orc-footer-btn" style="color:#ef4444;border-color:#fecaca;margin-right:auto;" onclick="excluirOrcamentoModal(' + o.id + ')">\uD83D\uDDD1\uFE0F Excluir</button>';
            f += '<button class="orc-footer-btn" onclick="carregarListaOrcamentos()">\u2190 Voltar</button>';
            f += '<button class="orc-footer-btn" style="background:#7c3aed;color:white;border-color:#7c3aed;" onclick="enviarLinkAssinatura(' + o.id + ')">\u270d\ufe0f Enviar p/ Assinar</button>';
            f += '<button class="orc-footer-btn" style="background:#25D366;color:white;border-color:#25D366;" onclick="enviarOrcWhatsApp()">\uD83D\uDCF1 WhatsApp</button>';
            f += '<button class="orc-footer-btn" style="background:#1e5080;color:white;border-color:#1e5080;" onclick="imprimirOrcamento()">\uD83D\uDDA8\uFE0F Imprimir</button>';
            f += '<button class="orc-footer-btn" style="background:#1FA2FF;color:white;border-color:#1FA2FF;" onclick="salvarAlteracoesOrcamento(' + o.id + ')">\uD83D\uDCBE Salvar</button>';
            footer.innerHTML = f;
        } catch(e) {
            body.innerHTML = '<p style="color:#ef4444;text-align:center;">Erro ao carregar or\u00e7amento</p>';
        }
    };

    window.toggleItemOrcamento = function(itemId, aprovado) {
        if (!_orcamentoAtual) return;
        var item = _orcamentoAtual.itens.find(function(i) { return i.id === itemId; });
        if (item) item.aprovado = aprovado;
        var totalAprovado = _orcamentoAtual.itens.filter(function(i) { return i.aprovado; }).reduce(function(s, i) { return s + i.valor; }, 0);
        var el = document.getElementById('orc-total-aprovado');
        if (el) el.textContent = _fmtReal(totalAprovado);
    };

    window.salvarAlteracoesOrcamento = async function(orcId) {
        try {
            var itensAprovados = _orcamentoAtual.itens.map(function(i) { return { id: i.id, aprovado: i.aprovado }; });
            var formaPagamento = (document.getElementById('orc-forma-pgto') || {}).value || '';
            var observacoes = (document.getElementById('orc-obs') || {}).value || '';
            await _apiCall('/api/orcamentos/' + orcId, 'PUT', { itensAprovados: itensAprovados, formaPagamento: formaPagamento, observacoes: observacoes });
            _toast('Or\u00e7amento salvo!', 'success');
        } catch(e) { _toast('Erro ao salvar', 'error'); }
    };

    window.excluirOrcamentoModal = async function(id) {
        if (!confirm('Excluir este or\u00e7amento permanentemente?')) return;
        try {
            await _apiCall('/api/orcamentos/' + id, 'DELETE');
            _toast('Or\u00e7amento exclu\u00eddo', 'success');
            window.carregarListaOrcamentos();
        } catch(e) { _toast('Erro ao excluir', 'error'); }
    };

    // ===== ASSINATURA DIGITAL =====

    window.enviarLinkAssinatura = async function(orcId) {
        if (!_orcamentoAtual) return;
        // Show dialog to select consent term before sending
        try {
            var termos = [];
            try {
                var tData = await _apiCall('/api/termos');
                termos = (tData && tData.termos) ? tData.termos : [];
                // Auto-populate if empty
                if (termos.length === 0) {
                    await _apiCall('/api/termos/popular-padrao', 'POST');
                    var tData2 = await _apiCall('/api/termos');
                    termos = (tData2 && tData2.termos) ? tData2.termos : [];
                }
            } catch(e) {}

            // Create selection dialog
            var existing = document.getElementById('orc-termo-dialog');
            if (existing) existing.remove();

            var dlg = document.createElement('div');
            dlg.id = 'orc-termo-dialog';
            dlg.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:700;display:flex;align-items:center;justify-content:center;';
            dlg.onclick = function(e) { if (e.target === dlg) dlg.remove(); };

            var opts = '<option value="">Sem termo de consentimento</option>';
            termos.forEach(function(t) {
                opts += '<option value="' + t.id + '">[' + (t.categoria||'Geral') + '] ' + t.titulo + '</option>';
            });

            dlg.innerHTML = '<div style="background:white;border-radius:20px;padding:24px;max-width:560px;width:92%;max-height:80vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3);">' +
                '<h3 style="margin:0 0 4px;font-size:16px;color:#7c3aed;">\uD83D\uDCDC Enviar para Assinatura</h3>' +
                '<p style="font-size:12px;color:#6b7280;margin:0 0 14px;">Selecione um termo de consentimento para enviar junto com o or\u00e7amento</p>' +
                '<div style="margin-bottom:12px;"><label style="font-size:11px;font-weight:600;color:#374151;">Modelo de Termo</label>' +
                '<select id="orc-termo-select" onchange="previewTermoSelecionado()" style="width:100%;padding:8px 10px;border:1px solid #e5e7eb;border-radius:8px;font-size:13px;font-family:Inter,sans-serif;margin-top:4px;">' + opts + '</select></div>' +
                '<div id="orc-termo-preview" style="display:none;margin-bottom:12px;"><label style="font-size:11px;font-weight:600;color:#374151;">Texto do Termo <span style="font-size:10px;color:#9ca3af;">(edit\u00e1vel para este envio)</span></label>' +
                '<textarea id="orc-termo-texto" style="width:100%;padding:10px;border:1px solid #e5e7eb;border-radius:8px;font-size:12px;font-family:Inter,sans-serif;min-height:200px;line-height:1.6;margin-top:4px;"></textarea></div>' +
                '<div style="display:flex;gap:8px;justify-content:flex-end;">' +
                '<button onclick="document.getElementById(\'orc-termo-dialog\').remove()" style="padding:8px 16px;border:1px solid #d1d5db;background:white;border-radius:8px;font-size:12px;cursor:pointer;font-weight:600;">Cancelar</button>' +
                '<button onclick="confirmarEnvioAssinatura(' + orcId + ')" style="padding:8px 16px;border:none;background:#7c3aed;color:white;border-radius:8px;font-size:12px;cursor:pointer;font-weight:600;">\u270d\ufe0f Enviar via WhatsApp</button>' +
                '</div></div>';
            document.body.appendChild(dlg);

            // Store termos for preview
            window._termosDisponiveis = termos;
        } catch(e) {
            _toast('Erro: ' + (e.message || ''), 'error');
        }
    };

    window.previewTermoSelecionado = function() {
        var sel = document.getElementById('orc-termo-select');
        var preview = document.getElementById('orc-termo-preview');
        var textarea = document.getElementById('orc-termo-texto');
        if (!sel || !preview || !textarea) return;
        var termoId = parseInt(sel.value);
        if (!termoId) { preview.style.display = 'none'; return; }
        var termo = (window._termosDisponiveis || []).find(function(t) { return t.id === termoId; });
        if (termo) {
            textarea.value = termo.conteudo;
            preview.style.display = 'block';
        }
    };

    window.confirmarEnvioAssinatura = async function(orcId) {
        var termoTexto = null;
        var sel = document.getElementById('orc-termo-select');
        if (sel && sel.value) {
            termoTexto = document.getElementById('orc-termo-texto').value;
        }
        // Save termo to orcamento
        if (termoTexto) {
            try { await _apiCall('/api/orcamentos/' + orcId + '/termo', 'PUT', { termoConsentimento: termoTexto }); } catch(e) {}
        }
        // Close dialog
        var dlg = document.getElementById('orc-termo-dialog');
        if (dlg) dlg.remove();
        // Generate link and send
        try {
            var data = await _apiCall('/api/orcamentos/' + orcId + '/gerar-link', 'POST');
            if (!data.success) throw new Error(data.erro || 'Erro');
            var linkBase = _getBaseUrl() + 'assinar.html?token=' + data.token;
            var o = _orcamentoAtual;
            var total = o.itens.reduce(function(s, i) { return s + i.valor; }, 0);
            var msg = '\uD83D\uDCCB *Or\u00e7amento Odontol\u00f3gico #' + String(o.id).padStart(3,'0') + '*\n\n';
            msg += 'Ol\u00e1 ' + (o.pacienteNome || '') + '! Segue seu or\u00e7amento:\n\n';
            o.itens.forEach(function(i, idx) {
                msg += (idx+1) + '. ' + (i.dente ? 'Dente ' + i.dente + ' - ' : '') + i.procedimento + ' \u2014 R$ ' + i.valor.toFixed(2).replace('.',',') + '\n';
            });
            msg += '\n*Total: R$ ' + total.toFixed(2).replace('.',',') + '*\n';
            if (o.formaPagamento) msg += 'Pagamento: ' + o.formaPagamento + '\n';
            if (termoTexto) msg += '\n\uD83D\uDCDC _Inclui Termo de Consentimento para leitura e aceite_\n';
            msg += '\n\u270d\ufe0f *Clique no link abaixo para ' + (termoTexto ? 'aceitar o termo e ' : '') + 'assinar:*\n' + linkBase;
            msg += '\n\n_V\u00e1lido por ' + (o.validadeDias || 30) + ' dias_';
            var cel = (o.pacienteCelular || '').replace(/\D/g, '');
            window.open(cel ? 'https://wa.me/55' + cel + '?text=' + encodeURIComponent(msg) : 'https://wa.me/?text=' + encodeURIComponent(msg), '_blank');
            _toast('Link enviado com ' + (termoTexto ? 'termo + ' : '') + 'assinatura!', 'success');
        } catch(e) {
            _toast('Erro ao gerar link: ' + (e.message || ''), 'error');
        }
    };

    window.ampliarAssinatura = function(src) {
        var overlay = document.createElement('div');
        overlay.className = 'orc-img-ampliada-overlay';
        overlay.onclick = function() { overlay.remove(); };
        overlay.innerHTML = '<img src="' + src + '">';
        document.body.appendChild(overlay);
    };

    window.verTermoOrcamento = function() {
        if (!_orcamentoAtual || !_orcamentoAtual.termoConsentimento) return;
        var overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:700;display:flex;align-items:center;justify-content:center;';
        overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };
        overlay.innerHTML = '<div style="background:white;border-radius:20px;padding:24px;max-width:560px;width:92%;max-height:80vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3);">' +
            '<h3 style="margin:0 0 12px;font-size:16px;color:#7c3aed;">\uD83D\uDCDC Termo de Consentimento</h3>' +
            '<div style="font-size:12px;line-height:1.7;color:#374151;padding:14px;background:#faf5ff;border:1px solid #e9d5ff;border-radius:10px;white-space:pre-wrap;">' +
            _orcamentoAtual.termoConsentimento.replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</div>' +
            '<div style="text-align:right;margin-top:12px;"><button onclick="this.closest(\'div[style]\').parentElement.remove()" style="padding:8px 16px;border:1px solid #d1d5db;background:white;border-radius:8px;font-size:12px;cursor:pointer;font-weight:600;">Fechar</button></div></div>';
        document.body.appendChild(overlay);
    };

    // ===== IMPRESS\u00c3O COM ASSINATURA =====

    window.imprimirOrcamento = function() {
        if (!_orcamentoAtual) return;
        var o = _orcamentoAtual;
        var itens = o.itens;
        var total = itens.reduce(function(s, i) { return s + i.valor; }, 0);

        var assinaturaHtml = '';
        if (o.assinaturaData && o.assinaturaImagem) {
            assinaturaHtml = '<div style="margin-top:40px;padding:16px;background:#f0fdf4;border:1px solid #86efac;border-radius:8px;">' +
                '<div style="font-size:13px;font-weight:700;color:#16a34a;margin-bottom:8px;">\u2705 Assinatura Digital</div>' +
                '<div style="display:flex;align-items:center;gap:20px;">' +
                '<img src="' + o.assinaturaImagem + '" style="max-width:200px;max-height:80px;border:1px solid #d1d5db;border-radius:6px;">' +
                '<div style="font-size:12px;color:#374151;">' +
                (o.assinaturaNome ? '<strong>' + o.assinaturaNome + '</strong><br>' : '') +
                'Assinado em: ' + new Date(o.assinaturaData).toLocaleString('pt-BR') +
                '</div></div></div>';
        } else {
            assinaturaHtml = '<div style="margin-top:60px;display:flex;justify-content:space-between;">' +
                '<div style="border-top:1px solid #1f2937;padding-top:8px;width:200px;text-align:center;font-size:12px;">Paciente</div>' +
                '<div style="border-top:1px solid #1f2937;padding-top:8px;width:200px;text-align:center;font-size:12px;">Dentista</div></div>';
        }

        var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Or\u00e7amento #' + String(o.id).padStart(3,'0') + '</title>' +
            '<style>body{font-family:Arial,sans-serif;padding:40px;color:#1f2937;}' +
            'h1{font-size:20px;color:#1e5080;margin-bottom:4px;}' +
            '.info{display:flex;gap:40px;margin:20px 0;font-size:13px;color:#374151;}' +
            'table{width:100%;border-collapse:collapse;margin:20px 0;}' +
            'th{background:#f1f5f9;padding:10px;text-align:left;font-size:12px;border-bottom:2px solid #e2e8f0;}' +
            'td{padding:10px;border-bottom:1px solid #f1f5f9;font-size:13px;}' +
            '.total-row{background:#f0f9ff;font-weight:700;font-size:15px;}' +
            '</style></head><body>' +
            '<h1>Or\u00e7amento Odontol\u00f3gico #' + String(o.id).padStart(3,'0') + '</h1>' +
            '<div class="info"><div><strong>Paciente:</strong> ' + (o.pacienteNome||'-') + '</div>' +
            '<div><strong>Dentista:</strong> ' + (o.dentistaNome||'-') + (o.dentistaCro ? ' - CRO ' + o.dentistaCro : '') + '</div>' +
            '<div><strong>Data:</strong> ' + new Date(o.criadoEm).toLocaleDateString('pt-BR') + '</div></div>' +
            '<table><thead><tr><th>Dente</th><th>Procedimento</th><th style="text-align:right;">Valor</th></tr></thead><tbody>';
        itens.forEach(function(i) {
            html += '<tr><td>' + (i.dente||'-') + '</td><td>' + i.procedimento + '</td><td style="text-align:right;">' + _fmtReal(i.valor) + '</td></tr>';
        });
        html += '<tr class="total-row"><td colspan="2">TOTAL</td><td style="text-align:right;">' + _fmtReal(total) + '</td></tr></tbody></table>';
        if (o.formaPagamento) html += '<p><strong>Forma de pagamento:</strong> ' + o.formaPagamento + '</p>';
        if (o.observacoes) html += '<p><strong>Obs:</strong> ' + o.observacoes + '</p>';
        html += '<p style="margin-top:20px;font-size:12px;color:#6b7280;">Validade: ' + (o.validadeDias||30) + ' dias</p>';
        // Termo de consentimento na impressão
        if (o.termoConsentimento) {
            html += '<div style="margin-top:30px;page-break-inside:avoid;">';
            html += '<h2 style="font-size:16px;color:#7c3aed;margin-bottom:8px;">\uD83D\uDCDC Termo de Consentimento</h2>';
            html += '<div style="font-size:11px;line-height:1.7;color:#374151;padding:12px;border:1px solid #e9d5ff;border-radius:6px;white-space:pre-wrap;">';
            html += o.termoConsentimento.replace(/</g,'&lt;').replace(/>/g,'&gt;');
            html += '</div>';
            if (o.termoAceito) html += '<div style="margin-top:8px;font-size:12px;color:#16a34a;font-weight:700;">\u2705 Termo aceito pelo paciente na assinatura digital</div>';
            html += '</div>';
        }
        html += assinaturaHtml;
        html += '<div style="margin-top:20px;font-size:11px;color:#6b7280;text-align:center;">Dental Ultra \u00b7 ' + new Date().toLocaleDateString('pt-BR') + '</div>';
        html += '</body></html>';
        var win = window.open('','_blank');
        win.document.write(html); win.document.close();
        setTimeout(function() { win.print(); }, 500);
    };

    // ===== WHATSAPP (or\u00e7amento simples) =====

    window.enviarOrcWhatsApp = function() {
        if (!_orcamentoAtual) return;
        var o = _orcamentoAtual;
        var itens = o.itens;
        var total = itens.reduce(function(s, i) { return s + i.valor; }, 0);
        var msg = '*Or\u00e7amento Odontol\u00f3gico #' + String(o.id).padStart(3,'0') + '*\n';
        msg += 'Paciente: ' + o.pacienteNome + '\n';
        msg += 'Data: ' + new Date(o.criadoEm).toLocaleDateString('pt-BR') + '\n\n';
        itens.forEach(function(i, idx) {
            msg += (idx+1) + '. ' + (i.dente ? 'Dente ' + i.dente + ' - ' : '') + i.procedimento + ' \u2014 R$ ' + i.valor.toFixed(2).replace('.',',') + '\n';
        });
        msg += '\n*TOTAL: R$ ' + total.toFixed(2).replace('.',',') + '*\n';
        if (o.formaPagamento) msg += 'Pagamento: ' + o.formaPagamento + '\n';
        msg += '\nValidade: ' + (o.validadeDias||30) + ' dias';
        var cel = (o.pacienteCelular || '').replace(/\D/g, '');
        window.open(cel ? 'https://wa.me/55' + cel + '?text=' + encodeURIComponent(msg) : 'https://wa.me/?text=' + encodeURIComponent(msg), '_blank');
    };

    document.addEventListener('keydown', function(e) { if (e.key === 'Escape') window.fecharModalOrcamentos(); });
})();
