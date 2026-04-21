// ==============================================================================
// INTEGRAÇÃO WHATSAPP - DENTAL ULTRA
// Funções para enviar mensagens e confirmações via WhatsApp
// ==============================================================================

var WhatsAppIntegration = {
    // URL base para links de confirmação
    // Produção: https://dentalultra.com.br/area-dentistas
    baseUrl: 'https://dentalultra.com.br/area-dentistas',
    
    // Configurações padrão (sem emojis para maior compatibilidade)
    config: {
        codigoPais: '55',
        // Saudação baseada no horário
        mensagemOlaManha: 'Bom dia, {nome}! Tudo bem?',
        mensagemOlaTarde: 'Boa tarde, {nome}! Tudo bem?',
        mensagemOlaNoite: 'Boa noite, {nome}! Tudo bem?',
        // Confirmação de consulta
        mensagemConfirmacao: 'Ola, {nome}!\n\nSua consulta esta agendada na *{clinica}* para:\n\n*{data}* as *{hora}*\nDr(a). {dentista}\n\nPor favor, responda:\n*SIM* para confirmar\n*NAO* para cancelar\n\nOu entre em contato: {telefoneClinica}',
        // Lembrete de consulta
        mensagemLembrete: 'Ola, {nome}!\n\nLembramos que voce tem uma consulta *amanha* na {clinica}:\n\n{data} as {hora}\nDr(a). {dentista}\n\nAguardamos voce!',
        // Aniversário
        mensagemAniversario: 'Ola, {nome}!\n\nA equipe da *{clinica}* deseja um FELIZ ANIVERSARIO!\n\nQue seu dia seja repleto de alegrias e muitos sorrisos!\n\nUm grande abraco!',
        // Retorno/Reativação
        mensagemRetorno: 'Ola, {nome}!\n\nFaz um tempo que nao nos vemos! Na *{clinica}*, estamos com saudades.\n\nQue tal agendar uma consulta de rotina? Prevenir e sempre melhor!\n\nEntre em contato: {telefoneClinica}',
        // Mensagem para telefone de recados (familiar/responsável)
        mensagemRecados: 'Ola!\n\n*{paciente}* tem uma consulta agendada na *{clinica}* para:\n\n*{data}* as *{hora}*\nDr(a). {dentista}\n\nVoce esta cadastrado(a) como contato para recados. Por favor, lembre-o(a) de confirmar a presenca!\n\n{assinatura}'
    },
    
    // Obter URL base
    getBaseUrl: function() {
        if (this.baseUrl) return this.baseUrl;
        
        // Tenta pegar do config ou usa o hostname atual
        if (typeof window !== 'undefined') {
            var loc = window.location;
            var host = loc.host;
            
            // Em produção (dentalultra.com.br ou hostinger)
            if (host.indexOf('dentalultra') !== -1 || host.indexOf('hostinger') !== -1) {
                this.baseUrl = 'https://dentalultra.com.br/area-dentistas';
            } else {
                // Desenvolvimento local
                this.baseUrl = loc.protocol + '//' + host + '/area-dentistas';
            }
        }
        return this.baseUrl || '';
    },
    
    // Gerar links de confirmação
    gerarLinkConfirmar: function(codigo) {
        return this.getBaseUrl() + '/confirmar.html?c=' + codigo;
    },
    
    gerarLinkCancelar: function(codigo) {
        return this.getBaseUrl() + '/confirmar.html?x=' + codigo;
    },

    // Formatar número para WhatsApp (suporta nacional e internacional)
    formatarNumero: function(telefone, internacional) {
        if (!telefone) return null;
        
        // Remover tudo que não é número ou +
        var numero = telefone.replace(/[^\d+]/g, '');
        
        // Se começa com +, é internacional - manter como está (removendo o +)
        if (numero.startsWith('+')) {
            numero = numero.substring(1);
            // Validar tamanho mínimo para internacional (pelo menos 10 dígitos)
            if (numero.length < 10) {
                console.log('WhatsApp: numero internacional invalido', numero);
                return null;
            }
            return numero;
        }
        
        // Se o paciente é marcado como estrangeiro ou número não parece brasileiro
        if (internacional) {
            // Não adicionar código do Brasil
            if (numero.length < 10) {
                console.log('WhatsApp: numero internacional invalido', numero);
                return null;
            }
            return numero;
        }
        
        // Número brasileiro - remover apenas dígitos
        numero = telefone.replace(/\D/g, '');
        
        // Se não começar com 55, adicionar
        if (!numero.startsWith('55')) {
            numero = '55' + numero;
        }
        
        // Verificar se tem o tamanho correto (12-13 dígitos: 55 + DDD + número)
        if (numero.length < 12 || numero.length > 13) {
            console.log('WhatsApp: numero invalido', numero, 'tamanho:', numero.length);
            return null;
        }
        
        return numero;
    },

    // Abrir WhatsApp Web/App
    abrirWhatsApp: function(telefone, mensagem, internacional) {
        console.log('WhatsApp: abrindo para', telefone, 'internacional:', internacional);
        var numero = this.formatarNumero(telefone, internacional);
        
        if (!numero) {
            if (typeof mostrarAviso === 'function') {
                mostrarAviso('Numero de telefone invalido!');
            } else {
                alert('Numero de telefone invalido!');
            }
            return false;
        }
        
        var url = 'https://wa.me/' + numero;
        
        if (mensagem) {
            url += '?text=' + encodeURIComponent(mensagem);
        }
        
        window.open(url, '_blank');
        return true;
    },

    // Enviar mensagem simples
    enviarMensagem: function(telefone, mensagem, internacional) {
        return this.abrirWhatsApp(telefone, mensagem, internacional);
    },
    
    // ============================================================
    // Obter saudação baseada no horário atual
    // ============================================================
    getSaudacao: function(nome) {
        var hora = new Date().getHours();
        var primeiroNome = nome ? nome.split(' ')[0] : '';
        
        if (hora >= 5 && hora < 12) {
            return this.config.mensagemOlaManha.replace('{nome}', primeiroNome);
        } else if (hora >= 12 && hora < 18) {
            return this.config.mensagemOlaTarde.replace('{nome}', primeiroNome);
        } else {
            return this.config.mensagemOlaNoite.replace('{nome}', primeiroNome);
        }
    },
    
    // ============================================================
    // Abrir WhatsApp com saudação adequada ao horário
    // ============================================================
    enviarOla: function(paciente) {
        var telefone = paciente.celular || paciente.telefone;
        var internacional = paciente.estrangeiro || paciente.tipo_documento === 'passaporte';
        
        if (!telefone) {
            if (typeof mostrarAviso === 'function') {
                mostrarAviso('Paciente nao possui telefone cadastrado!');
            } else {
                alert('Paciente nao possui telefone cadastrado!');
            }
            return false;
        }
        
        var mensagem = this.getSaudacao(paciente.nome);
        return this.abrirWhatsApp(telefone, mensagem, internacional);
    },
    
    // Enviar para número direto com saudação (para uso em listas)
    enviarOlaDireto: function(telefone, nome, internacional) {
        if (!telefone) {
            if (typeof mostrarAviso === 'function') {
                mostrarAviso('Telefone nao informado!');
            }
            return false;
        }
        
        var mensagem = this.getSaudacao(nome);
        return this.abrirWhatsApp(telefone, mensagem, internacional);
    },

    // Enviar confirmação de consulta (para celular do paciente)
    enviarConfirmacao: function(paciente, agendamento, clinica) {
        var codigo = agendamento.codigoConfirmacao || agendamento.codigo_confirmacao;
        var internacional = paciente.estrangeiro || paciente.tipo_documento === 'passaporte';
        
        // Extrair horário (tentar múltiplos campos)
        var hora = agendamento.horaInicio || agendamento.horario || agendamento.hora || agendamento.hora_inicio || '';
        
        // Extrair dentista
        var dentista = agendamento.dentista || agendamento.profissional || clinica.dentista || clinica.profissional || '';
        // Remover "Dr(a). " se já existir para evitar duplicação
        if (dentista.startsWith('Dr(a).')) dentista = dentista.replace('Dr(a). ', '');
        
        console.log('WhatsApp Confirmacao - Debug:', { hora: hora, dentista: dentista, agendamento: agendamento });
        
        var mensagem = this.config.mensagemConfirmacao
            .replace('{nome}', paciente.nome.split(' ')[0])
            .replace('{clinica}', clinica.nome || 'nossa clinica')
            .replace('{data}', this.formatarData(agendamento.data))
            .replace('{hora}', hora || 'a confirmar')
            .replace('{dentista}', dentista || 'Equipe')
            .replace('{telefoneClinica}', clinica.telefone || '')
            .replace('{linkConfirmar}', codigo ? this.gerarLinkConfirmar(codigo) : '(link indisponivel)')
            .replace('{linkCancelar}', codigo ? this.gerarLinkCancelar(codigo) : '(link indisponivel)');
        
        if (!codigo) {
            console.log('AVISO: Agendamento sem codigo de confirmacao!', agendamento);
        }
        
        return this.abrirWhatsApp(paciente.celular, mensagem, internacional);
    },

    // Enviar mensagem para telefone de recados (familiar/responsável)
    enviarRecados: function(paciente, agendamento, clinica) {
        if (!paciente.telefone) {
            if (typeof mostrarAviso === 'function') {
                mostrarAviso('Paciente nao possui telefone de recados cadastrado!');
            }
            return false;
        }
        
        // Extrair horário
        var hora = agendamento.horaInicio || agendamento.horario || agendamento.hora || '';
        
        // Extrair dentista
        var dentista = agendamento.dentista || agendamento.profissional || clinica.dentista || '';
        
        var mensagem = this.config.mensagemRecados
            .replace('{paciente}', paciente.nome)
            .replace('{clinica}', clinica.nome || 'nossa clinica')
            .replace('{data}', this.formatarData(agendamento.data))
            .replace('{hora}', hora || 'a confirmar')
            .replace('{dentista}', dentista || 'Equipe')
            .replace('{assinatura}', clinica.assinatura || clinica.nome || 'Atenciosamente, Equipe da Clinica');
        
        return this.abrirWhatsApp(paciente.telefone, mensagem);
    },

    // Enviar lembrete
    enviarLembrete: function(paciente, agendamento, clinica) {
        var codigo = agendamento.codigoConfirmacao || agendamento.codigo_confirmacao;
        
        // Extrair horário e dentista
        var hora = agendamento.horaInicio || agendamento.horario || agendamento.hora || '';
        var dentista = agendamento.dentista || agendamento.profissional || clinica.dentista || '';
        
        var mensagem = this.config.mensagemLembrete
            .replace('{nome}', paciente.nome.split(' ')[0])
            .replace('{clinica}', clinica.nome || 'nossa clinica')
            .replace('{data}', this.formatarData(agendamento.data))
            .replace('{hora}', hora || 'a confirmar')
            .replace('{dentista}', dentista || 'Equipe')
            .replace('{linkConfirmar}', codigo ? this.gerarLinkConfirmar(codigo) : '');
        
        return this.abrirWhatsApp(paciente.celular, mensagem);
    },

    // Enviar felicitação de aniversário
    enviarAniversario: function(paciente, clinica) {
        var mensagem = this.config.mensagemAniversario
            .replace('{nome}', paciente.nome.split(' ')[0])
            .replace('{clinica}', clinica.nome || 'nossa clínica');
        
        return this.abrirWhatsApp(paciente.celular, mensagem);
    },

    // Enviar mensagem de retorno
    enviarRetorno: function(paciente, clinica) {
        var mensagem = this.config.mensagemRetorno
            .replace('{nome}', paciente.nome.split(' ')[0])
            .replace('{clinica}', clinica.nome || 'nossa clínica')
            .replace('{telefoneClinica}', clinica.telefone || '');
        
        return this.abrirWhatsApp(paciente.celular, mensagem);
    },

    // Reagendar consulta
    reagendarConsulta: function(paciente, clinica) {
        var mensagem = 'Olá {nome}! 😊\n\nPrecisa reagendar sua consulta na *{clinica}*?\n\nEstamos à disposição para encontrar o melhor horário para você!\n\nQual data e horário seria melhor?'
            .replace('{nome}', paciente.nome.split(' ')[0])
            .replace('{clinica}', clinica.nome || 'nossa clínica');
        
        return this.abrirWhatsApp(paciente.celular, mensagem);
    },

    // Formatar data
    formatarData: function(dataStr) {
        if (!dataStr) return '';
        
        var data = new Date(dataStr + 'T00:00:00');
        var dias = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
        var dia = dias[data.getDay()];
        
        return data.toLocaleDateString('pt-BR') + ' (' + dia + ')';
    },

    // Criar botão WhatsApp (envia "Olá, tudo bem?" automaticamente)
    criarBotaoWhatsApp: function(telefone, nome, tamanho, internacional) {
        tamanho = tamanho || 'normal';
        
        var sizes = {
            small: { width: '28px', height: '28px', fontSize: '14px' },
            normal: { width: '36px', height: '36px', fontSize: '18px' },
            large: { width: '44px', height: '44px', fontSize: '22px' }
        };
        
        var size = sizes[tamanho] || sizes.normal;
        
        var btn = document.createElement('button');
        btn.className = 'btn-whatsapp';
        btn.innerHTML = '<svg viewBox="0 0 24 24" width="' + parseInt(size.fontSize) + '" height="' + parseInt(size.fontSize) + '" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';
        btn.title = 'Enviar WhatsApp';
        btn.style.cssText = `
            width: ${size.width};
            height: ${size.height};
            border-radius: 50%;
            background: #25D366;
            color: white;
            border: none;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            padding: 0;
        `;
        
        btn.onmouseover = function() {
            this.style.background = '#128C7E';
            this.style.transform = 'scale(1.1)';
        };
        
        btn.onmouseout = function() {
            this.style.background = '#25D366';
            this.style.transform = 'scale(1)';
        };
        
        // Armazenar dados no botão para uso no click
        btn.dataset.telefone = telefone || '';
        btn.dataset.nome = nome || '';
        btn.dataset.internacional = internacional ? 'true' : 'false';
        
        btn.onclick = function(e) {
            e.stopPropagation();
            var tel = this.dataset.telefone;
            var nm = this.dataset.nome;
            var intl = this.dataset.internacional === 'true';
            WhatsAppIntegration.enviarOlaDireto(tel, nm, intl);
        };
        
        return btn;
    },

    // Obter dados da clínica (do localStorage ou config)
    getClinicaData: function() {
        var configClinica = JSON.parse(localStorage.getItem('configClinica') || '{}');
        var user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        return {
            nome: configClinica.nome || user.clinic || 'Clínica Odontológica',
            dentista: configClinica.dentista || user.name || '',
            telefone: configClinica.telefone || user.phone || '',
            endereco: configClinica.endereco || '',
            assinatura: configClinica.assinatura || ''
        };
    },
    
    // Salvar configurações da clínica
    salvarConfigClinica: function(config) {
        localStorage.setItem('configClinica', JSON.stringify(config));
    }
};

// Expor globalmente
window.WhatsAppIntegration = WhatsAppIntegration;

// Adicionar estilos globais
(function() {
    var style = document.createElement('style');
    style.textContent = `
        .btn-whatsapp {
            transition: all 0.2s ease !important;
        }
        .btn-whatsapp:hover {
            box-shadow: 0 4px 12px rgba(37, 211, 102, 0.4);
        }
    `;
    document.head.appendChild(style);
})();
