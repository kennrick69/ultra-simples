# DENTAL ULTRA - LISTA DE TESTES
# ================================
# Data: 11/02/2026
# Testar tudo em janela anônima!

## 1. SIDEBAR PADRONIZADA (todas as páginas)
- [ ] Dashboard: sidebar tem "📋 Orçamentos" e "💲 Tabela de Preços"
- [ ] Agenda: idem
- [ ] Pacientes: idem
- [ ] Prontuário: idem
- [ ] Casos Protéticos: idem
- [ ] Estoque: idem
- [ ] Notas Fiscais: idem
- [ ] Financeiro: idem
- [ ] Relatórios: idem
- [ ] Configurações: idem
- [ ] Usuários: idem
- [ ] Tabela de Preços: idem
- [ ] Clicar "📋 Orçamentos" em qualquer página abre MODAL (não navega)

## 2. MODAL DE ORÇAMENTOS (em qualquer página)
- [ ] Abre por cima da página atual sem perdê-la
- [ ] Lista todos os orçamentos com busca
- [ ] Clicar num orçamento abre detalhe
- [ ] Checkbox aprova/desaprova itens (recalcula total aprovado)
- [ ] Botão "← Voltar" volta pra lista
- [ ] Botão "💾 Salvar" salva alterações
- [ ] Botão "📱 WhatsApp" envia orçamento formatado
- [ ] Botão "🖨️ Imprimir" abre janela de impressão
- [ ] Botão "🗑️ Excluir" exclui com confirmação
- [ ] ESC fecha o modal

## 3. ASSINATURA DIGITAL
- [ ] Botão "✍️ Enviar p/ Assinar" aparece no detalhe do orçamento
- [ ] Clicar gera link e abre WhatsApp com mensagem + link
- [ ] Abrir link (assinar.html?token=xxx) mostra orçamento completo
- [ ] Página responsiva no celular
- [ ] Campo "nome completo" obrigatório
- [ ] Canvas de assinatura funciona com dedo (touch) e mouse
- [ ] Botão "Limpar" limpa o canvas
- [ ] Botão "Confirmar e Assinar" envia assinatura
- [ ] Após assinar: mostra mensagem de sucesso
- [ ] Tentar assinar de novo: mostra "já foi assinado"
- [ ] Link com token inválido: mostra erro
- [ ] No sistema: orçamento muda pra status "✍️ Assinado"
- [ ] Badge verde com nome + data/hora aparece no detalhe
- [ ] Miniatura da assinatura clicável → amplia
- [ ] Imprimir orçamento assinado → PDF com assinatura embarcada

## 4. CONVIDADO COM ACESSO A ORÇAMENTOS
- [ ] Login como convidado/secretária
- [ ] Consegue abrir modal de orçamentos
- [ ] Consegue ver lista e detalhes
- [ ] Consegue aprovar itens e salvar

## 5. BACKEND (server.js)
- [ ] Push pro GitHub e Railway auto-deploy
- [ ] Verificar se colunas novas foram criadas (assinatura_*)
- [ ] Rotas públicas /api/orcamentos/assinar/:token funcionam SEM auth

## DEPLOY CHECKLIST
- [ ] server.js → GitHub push → Railway
- [ ] Todos os .html → Hostinger /area-dentistas/
- [ ] js/orcamentos-modal.js → Hostinger /area-dentistas/js/
- [ ] js/agenda-multi.js → Hostinger /area-dentistas/js/
- [ ] assinar.html → Hostinger /area-dentistas/

## 6. CONTROLE DE RETORNOS

### Na Agenda:
- [ ] Botão "🔄 Retornos" aparece nos botões de ação rápida
- [ ] Badge vermelho com contagem de vencidos aparece quando há retornos vencidos
- [ ] Clicar abre Notificações na aba "🔄 Retornos"
- [ ] Stats mostram: Vencidos / Próx. 30 dias / Em dia
- [ ] Lista mostra retornos ordenados (vencidos primeiro, com visual vermelho)
- [ ] Retornos próximos (≤30 dias) aparecem em amarelo
- [ ] Retornos em dia aparecem em verde
- [ ] Botão 📱 WhatsApp envia mensagem personalizada pro paciente
- [ ] Botão ✅ marca retorno como realizado (pergunta se quer renovar)
- [ ] Se renovar: cria próximo retorno automaticamente (baseado na periodicidade)
- [ ] Botão 🗑️ exclui retorno
- [ ] Botão "➕ Agendar Novo Retorno" abre formulário inline
- [ ] Busca de paciente no formulário funciona (autocomplete)
- [ ] Seleção de periodicidade atualiza data automaticamente (3/6/12/18/24 meses)
- [ ] Motivos pré-definidos: Raio-X controle, Proservação endo, Controle periodontal, etc
- [ ] Salvar retorno funciona e recarrega a lista

### No Prontuário (Plano de Tratamento):
- [ ] Botão "🔄 Agendar Retorno" aparece no header do plano
- [ ] Clicar abre modal popup com formulário
- [ ] Paciente já vem preenchido automaticamente
- [ ] Formulário com motivo, dente, periodicidade, data, procedimento origem, obs
- [ ] Periodicidade muda a data automaticamente
- [ ] Salvar funciona e mostra toast de confirmação

### Convidado (secretária):
- [ ] Consegue ver retornos na agenda
- [ ] Consegue enviar WhatsApp pro paciente
- [ ] Consegue marcar como realizado

## ============================================
## PENDÊNCIAS FUTURAS
## ============================================

## 7. TERMO DE CONSENTIMENTO DIGITAL
- [ ] Ao clicar "✍️ Enviar p/ Assinar", abre dialog de seleção de termo
- [ ] 5 modelos padrão criados automaticamente no primeiro uso (Endo, Geral, Cirurgia, Implante, Prótese)
- [ ] Dropdown lista todos os modelos com categoria
- [ ] Selecionar modelo mostra preview do texto (editável para aquele envio)
- [ ] Opção "Sem termo" envia só o orçamento
- [ ] Termo é salvo vinculado ao orçamento antes de enviar
- [ ] Mensagem WhatsApp menciona "Inclui Termo de Consentimento"
- [ ] Na página de assinatura (celular): termo aparece ANTES da área de assinatura
- [ ] Texto do termo legível com scroll se longo
- [ ] Checkbox "Li e estou de acordo" OBRIGATÓRIO para habilitar botão de assinar
- [ ] Sem marcar checkbox, botão "Confirmar e Assinar" fica desabilitado
- [ ] Após assinar: termo_aceito = true no banco
- [ ] No modal do dentista: badge "📜✅ Termo aceito" ou "📜⏳ Aguardando aceite"
- [ ] Clicar no badge do termo abre overlay com texto completo
- [ ] Imprimir orçamento com termo: PDF inclui seção do termo + "Aceito pelo paciente"

### 🎨 Ícones Customizados do Odontograma
- [ ] Gerar 35 ícones no ChatGPT usando o doc ICONES-ODONTOGRAMA-PROMPTS.md
- [ ] Salvar PNGs em img/odontograma/ no Hostinger
- [ ] Integrar ícones no SVG do odontograma (substituir emojis por PNGs)
- [ ] Criar legenda visual com todos os ícones e seus significados
- [ ] Testar visualização em tamanho pequeno (32x32) e normal (128x128)

### 📋 DMED (Declaração de Serviços Médicos e de Saúde)
- O sistema NÃO gera nota fiscal direto com a prefeitura
- Fluxo: Dentista gera nota no sistema → secretária emite na prefeitura manualmente
- As notas geradas no sistema devem SALVAR todos os dados (CPF paciente, valor, data, procedimento)
- No ano seguinte, o sistema deve gerar arquivo DMED no padrão TXT da Receita Federal
- Arquivo TXT segue layout específico para upload no site da Receita (e-CAC)
- DMED é obrigatória para PF/PJ que receberam pagamentos de PF por serviços de saúde
- Dados necessários por registro: CPF do responsável pelo pagamento, nome, valor total no ano
- Gerar botão "Exportar DMED [ano]" que monta o TXT automaticamente a partir das notas do sistema

### 🏥 Outras pendências:
- Dashboard com métricas reais (faturamento, orçamentos pendentes, gráficos)
- Auto-popular tabela de preços (25 procedimentos padrão no primeiro acesso)
- Importação de base de dados de outros softwares odontológicos (CSV/Excel)
- Termo de consentimento digital (mesmo fluxo assinatura WhatsApp)
- Receituário digital (prescrição → PDF)
- Relatório de produtividade por dentista
