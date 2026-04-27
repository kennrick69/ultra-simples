# Ultra Simples — Progresso do Projeto

Documento vivo de acompanhamento. Atualizar a cada sessão de trabalho.

---

## Status geral

| Área | Status |
|------|--------|
| Identidade visual | ✅ Definida e aplicada |
| Landing page | ✅ Funcionando |
| Cadastro de usuário | ✅ Funcionando |
| Confirmação de email | ✅ Funcionando |
| Login | ✅ Funcionando |
| Área do dentista (app) | 🔄 Em andamento |
| Segurança para produção | ⏳ Pendente |

---

## O que foi feito

### Fundação e documentação
- Repositório clonado e estudado
- README criado com visão completa: stack, URLs, módulos, banco de dados, identidade visual, variáveis de ambiente, fluxo de cadastro, dicionário de campos, checklist de segurança
- Regras documentadas para nunca confundir com o projeto **Dental Ultra** (repositório separado)
- URL Railway correta identificada: `ultra-simples-production.up.railway.app`
- Arquitetura confirmada: backend + frontend no **mesmo serviço Railway** (Express serve `frontend/` via `express.static`)
- Remote git trocado de HTTPS para SSH (elimina pedido de senha no push)

### Identidade visual
- Paleta oficial definida: teal-600 `#0D9488` / teal-700 `#0F766E`, texto `#111827` / `#6B7280`, fundo `#F9FAFB`
- Fonte: Inter (Google Fonts), pesos 400–800
- Ícones: Lucide Icons (ícone da marca: `tooth`)
- Framework CSS: Tailwind CSS via CDN
- Regra obrigatória: toda página nova ou reformulada segue esta identidade — sem exceções

### Páginas reformuladas
- **`/login`** — reescrito do zero com identidade teal. Formulário de cadastro embutido (herdado do Dental Ultra) removido. "Cadastre-se grátis" redireciona para `/cadastro`
- **`/cadastro`** — `alert()` nativo substituído por modal de sucesso profissional e banner de erro inline. Links de Termos e Privacidade abrem modal (não navegam para outra página, preservando dados do formulário)
- **`/area-dentistas/confirmar-email.html`** — reescrito com Tailwind + Lucide + teal, 4 estados (Loading / Sucesso / Erro / Sem Token)

### Bugs corrigidos
- `POST /api/auth/register` retornava 500 — INSERT usava nomes de colunas em inglês (`name`, `password`, `clinic`, `specialty`) mas tabela `dentistas` tem colunas em português (`nome`, `senha`, `clinica`, `especialidade`)
- `GET /api/auth/confirmar-email` retornava `nome: undefined` — usava `dentista.name` em vez de `dentista.nome`, exibindo "Olá Usuário!" na página de confirmação. Corrigido + agora exibe primeiro nome
- `GET /api/auth/verify` retornava `nome`, `clinica`, `especialidade` como `undefined` — mesma família de erro (`d.name`, `d.clinic`, `d.specialty`)
- `FRONTEND_URL` no Railway estava apontando para `localhost:3000` — link de confirmação de email redirecionava para localhost. Corrigido no painel do Railway
- `frontend/js/auth.js` e `area-dentistas/js/auth.js` apontavam para URL da API do **Dental Ultra** — corrigido para `ultra-simples-production.up.railway.app`

### Dicionário de campos
- Varredura completa do banco de dados documentada no README
- Regra geral: colunas no banco sempre `snake_case` português, nunca inglês
- Mapeamento banco → API documentado para todas as tabelas principais
- Inconsistências identificadas e corrigidas

### Fluxo completo testado
- Cadastro → email de confirmação recebido ✅
- Link do email abre página correta com primeiro nome ✅
- Conta confirmada no banco de dados ✅
- Login funcionando ✅

---

## O que falta fazer

### Alta prioridade (bloqueante para lançamento)

- [ ] **Testar login completo** após confirmação — verificar redirecionamento para o dashboard e se `current_dentista` é salvo corretamente no localStorage
- [ ] **Testar fluxo "email não confirmado"** — tentar fazer login sem confirmar e ver se aparece tela de reenvio
- [ ] **Página de dashboard** — reformular com identidade visual Ultra Simples (teal, Inter, Lucide). Atualmente usa CSS herdado do Dental Ultra
- [ ] **Todas as páginas do `area-dentistas/`** — auditoria e reformulação visual completa (agenda, pacientes, prontuário, financeiro, etc.)
- [ ] **Sidebar da área interna** — padronizar componente de navegação lateral em todas as páginas
- [ ] **`area-dentistas/login.html`** — ainda usa CSS do Dental Ultra. Ou redirecionar para `/login` ou reformular

### Média prioridade

- [ ] **Prontuário digital** — módulo em desenvolvimento (anamnese, odontograma, receitas, atestados)
- [ ] **Modal de orçamentos** — flutuante, pendente de implementação
- [ ] **Assinatura digital por WhatsApp** — pendente
- [ ] **Retornos com lembretes** — lógica existe, interface pendente de revisão
- [ ] **Termo de consentimento digital** — pendente
- [ ] **Relatórios contábeis / DMED** — pendente
- [ ] **Importação de dados CSV/Excel** — pendente
- [ ] **Integração Hotmart** (licenciamento/vendas) — pendente

### Baixa prioridade / pós-lançamento

- [ ] **Remover código herdado do Dental Ultra** — `dental-ultra.tokens.css`, `dental-ultra.ui.css`, `dental-ultra.ui.js` não são usados nas páginas reformuladas
- [ ] **Tailwind CSS via build local** — substituir CDN por build otimizado (performance + independência de CDN)
- [ ] **Ícone `tooth` do Lucide** — verificar disponibilidade na versão em uso; substituir se necessário

### Segurança — obrigatório antes de comercializar

Ver checklist completo no `README.md` (seção "Checklist de segurança para produção comercial"). Itens principais:

- [ ] Trocar `JWT_SECRET` por chave forte (mín. 64 chars)
- [ ] Rotacionar senha do PostgreSQL
- [ ] Configurar email próprio (remover dependência do PHP mailer do Dental Ultra)
- [ ] Substituir `suporte@dentalultra.com.br` por email próprio nos templates
- [ ] Restringir CORS (`origin: '*'` → domínio real)
- [ ] Rate limiting nos endpoints de login e cadastro
- [ ] Configurar domínio próprio
- [ ] Revisar Termos e Privacidade com advogado
- [ ] Configurar backups automáticos do PostgreSQL

---

## Pendências técnicas conhecidas

| Item | Detalhe | Arquivo |
|------|---------|---------|
| Coluna `horario` vs `hora` | Tabela usa `horario`, API retorna como `hora` — funciona mas é confuso | `server.js` agendamentos |
| `tel_recados` / `nome_recado` | Únicos campos da tabela `pacientes` em snake_case no body da API (resto é camelCase) | `server.js` pacientes |
| Pasta duplicada `area-dentistas/area-dentistas/` | Cópia aninhada da pasta principal — verificar se pode ser removida | `frontend/` |

---

## Sessões de trabalho

### Sessão 1 — 2026-04-22
Fundação do projeto: clone, README, identidade visual, reformulação do login, correção da URL da API, modais de Termos/Privacidade no cadastro.

### Sessão 2 — 2026-04-24
Testes do fluxo de cadastro: correção do bug 500 no registro (nomes de colunas), FRONTEND_URL no Railway, remoção do formulário duplicado no login, modal de sucesso no cadastro, correção do nome na confirmação de email, dicionário de campos no README.

### Sessão 3 — 2026-04-27
Criação deste documento de progresso.
