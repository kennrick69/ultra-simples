# Prompt Autônomo — Ultra Simples

> Execute com: `claude --dangerously-skip-permissions`
> Ao abrir o Claude Code no diretório do projeto, ordene: **"Leia o arquivo prompt-autonomo.md e execute tudo."**

---

## Missão

Você é um engenheiro sênior contratado para **terminar o produto Ultra Simples** de forma autônoma. Seu trabalho é transformar o estado atual do projeto em um SaaS odontológico completo, funcional e visualmente consistente, pronto para ser comercializado.

**Você não para.** Ao encontrar uma dúvida técnica ou uma decisão de produto, você toma a melhor decisão baseada no contexto deste documento e na lógica do próprio código. Se absolutamente precisar de informação que só o dono do produto tem (ex: credenciais externas, decisão comercial), **anote a dúvida e continue**. Ao final de tudo, entregue a lista completa de pendências humanas de uma só vez.

---

## Identidade do Projeto

**Nome:** Ultra Simples  
**Produto:** SaaS de gestão de clínicas odontológicas  
**Diferencial:** foco em Equiparação Hospitalar e simplicidade operacional  
**Alma do produto:** módulo de **Casos Protéticos** — jamais remova, degrade ou simplifique este módulo  

**Repositório:** `github.com:kennrick69/ultra-simples.git` (SSH)  
**Deploy:** Railway — push para `main` faz redeploy automático  
**URL de produção:** `https://ultra-simples-production.up.railway.app`  

> **ALERTA CRÍTICO:** O projeto **Dental Ultra** (`dentist-backend-v2-production.up.railway.app`) é um produto SEPARADO e INDEPENDENTE. Jamais confunda os dois. Nunca toque em arquivos fora deste repositório. Qualquer referência a `dentist-backend-v2`, `dental-ultra.tokens.css`, `dental-ultra.ui.css` ou `dental-ultra.ui.js` no código é **lixo herdado** — remova ao reformular páginas.

---

## Arquitetura

```
ultra-simples/
└── backend/
    ├── server.js              # API Express (~5000 linhas) + serve o frontend
    ├── package.json
    └── frontend/
        ├── index.html         # Landing page (marketing)
        ├── cadastro.html      # Cadastro público
        ├── login.html         # Login principal (/login)
        ├── js/auth.js         # Autenticação do login público
        └── area-dentistas/    # App principal (autenticado)
            ├── dashboard.html
            ├── agenda.html
            ├── pacientes.html
            ├── prontuario.html
            ├── plano-tratamento.html
            ├── casos-proteticos.html   ← ALMA DO PRODUTO
            ├── financeiro.html
            ├── estoque.html
            ├── nota-fiscal.html
            ├── relatorios.html
            ├── configuracoes.html
            ├── login.html             ← ainda com CSS legado
            ├── js/
            │   ├── auth-check.js      # Verificação de auth em todas as páginas
            │   └── auth.js            # Login/cadastro da área interna
            └── css/
```

**Backend + Frontend no mesmo serviço Railway.** O Express serve `frontend/` via `express.static`. Não há CDN ou serviço separado de frontend.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Backend | Node.js + Express + PostgreSQL |
| Auth | JWT (30 dias) + bcrypt |
| Frontend | HTML + CSS + JS vanilla |
| CSS Framework | Tailwind CSS via CDN (`https://cdn.tailwindcss.com`) |
| Ícones | Lucide Icons via unpkg (`https://unpkg.com/lucide@latest`) |
| Fonte | Inter (Google Fonts) pesos 400–800 |
| Deploy | Railway (push to main = redeploy) |

---

## Variáveis de Ambiente

> **Regra:** NUNCA modifique variáveis existentes. Só adicione novas se necessário. Valores ficam no painel do Railway, nunca no código.

| Variável | Uso |
|----------|-----|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Assinatura dos tokens JWT |
| `PORT` | Porta do Express (padrão 3001) |
| `NODE_ENV` | `production` no Railway |
| `FRONTEND_URL` | `https://ultra-simples-production.up.railway.app` |
| `EMAIL_PHP_URL` | `https://dentalultra.com.br/api/enviar-email.php` (infra compartilhada) |
| `EMAIL_CHAVE_SECRETA` | Chave do PHP mailer (compartilhada com Dental Ultra) |

---

## Identidade Visual — OBRIGATÓRIO EM TODAS AS PÁGINAS

Toda página nova ou reformulada **deve obrigatoriamente** usar esta identidade. Sem exceções.

### Paleta de cores
| Token | Hex | Uso |
|-------|-----|-----|
| Primária | `#0D9488` | Botões, links, ícones, bordas ativas |
| Primária hover | `#0F766E` | Hover de botões |
| Texto principal | `#111827` | Títulos, body |
| Texto secundário | `#6B7280` | Labels, descrições |
| Fundo | `#F9FAFB` | Background das páginas |
| Branco | `#FFFFFF` | Cards, formulários |

### Gradiente
```css
background: linear-gradient(135deg, #0D9488 0%, #0F766E 100%);
```

### Padrão de imports (head de cada página)
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://unpkg.com/lucide@latest"></script>
```

### Sidebar padrão (todas as páginas da área interna)
Sidebar fixa à esquerda (220px), teal como cor ativa, Lucide icons, sem emoji.  
Links da sidebar: Dashboard, Pacientes, Agenda, Prontuário, Casos Protéticos, Estoque, Notas Fiscais, Financeiro, Orçamentos, Relatórios, Tabela de Preços, Configurações.  
Rodapé da sidebar: nome do dentista + CRO + botão Sair.

---

## Banco de Dados — Convenções

> Erros silenciosos acontecem ao usar nomes em inglês. Consulte sempre.

**Regra geral:** colunas no banco = `snake_case` **português**. Nunca inglês.

### Tabela `dentistas`
| Coluna | ⚠️ Não é |
|--------|---------|
| `nome` | `name` |
| `senha` | `password` |
| `clinica` | `clinic` |
| `especialidade` | `specialty` |
| `plano` | `subscription_plan` |

### Tabela `agendamentos`
- Coluna `horario` (TIME) — a API retorna como `hora` em alguns endpoints

### Tabela `pacientes`
- `tel_recados` e `nome_recado` permanecem em snake_case no body da API (exceção)

### LocalStorage (frontend)
- Token JWT: `auth_token` (principal) e `token` (compatibilidade)
- Dados do dentista: `current_dentista` e `dentista` (ambos devem ser salvos no login)

---

## Estado Atual do Projeto

### Concluído ✅
- Landing page (`index.html`) com identidade visual correta
- Cadastro (`cadastro.html`) com modal de sucesso + banner de erro inline
- Login (`/login`) reformulado com identidade teal
- Confirmação de email (`confirmar-email.html`) com 4 estados + Lucide
- Dashboard (`area-dentistas/dashboard.html`) reformulado com identidade teal
- `auth-check.js` corrigido para API do Ultra Simples
- `area-dentistas/js/auth.js` corrigido para API do Ultra Simples
- Fluxo completo: cadastro → email → confirmação → login testado e funcionando

### Em andamento / Pendente 🔄⏳
- `area-dentistas/login.html` — usa CSS herdado do Dental Ultra
- Todas as demais páginas de `area-dentistas/` — auditoria e reformulação visual
- Módulo prontuário — anamnese, odontograma, receitas, atestados
- Modal de orçamentos flutuante
- Assinatura digital por WhatsApp
- Retornos com lembretes (lógica existe, interface precisa de revisão)
- Termo de consentimento digital
- Relatórios contábeis e DMED
- Importação de dados CSV/Excel
- Integração Hotmart (licenciamento/vendas)
- Remoção dos arquivos legados: `dental-ultra.tokens.css`, `dental-ultra.ui.css`, `dental-ultra.ui.js`

---

## O Que Você Deve Fazer — Ordem de Prioridade

### 1. Reformulação visual de todas as páginas (alta prioridade)

Para cada página em `area-dentistas/`, **em ordem**:

1. **`login.html`** — redirecionar para `/login` (a página principal já está pronta) **ou** reformular com identidade teal. Optar pelo redirecionamento se funcionar.
2. **`pacientes.html`** — reformular sidebar e paleta, manter toda a lógica de cadastro
3. **`agenda.html`** — reformular sidebar e paleta, manter lógica multi-profissional
4. **`prontuario.html`** — reformular + verificar/completar anamnese, odontograma, receitas, atestados
5. **`casos-proteticos.html`** — reformular sidebar e paleta. **NÃO altere a lógica de negócio deste módulo.**
6. **`financeiro.html`** — reformular
7. **`estoque.html`** — reformular
8. **`nota-fiscal.html`** — reformular
9. **`relatorios.html`** — reformular + implementar exportação DMED se o endpoint existir
10. **`configuracoes.html`** — reformular
11. **`paciente-detalhe.html`** — reformular
12. **`plano-tratamento.html`** — reformular
13. **`odontograma.html`** — reformular
14. **`assinar.html`** — reformular (assinatura digital)
15. **`usuarios.html`** — reformular

**Regra para reformulação:**
- Mantenha 100% da lógica JavaScript e chamadas de API existentes
- Substitua apenas CSS/layout para identidade teal
- Substitua emoji por ícones Lucide
- Remova qualquer import de `dental-ultra.*.css` ou `dental-ultra.*.js`
- Padronize a sidebar em todas as páginas (mesmo componente HTML)
- Chame `lucide.createIcons()` após DOMContentLoaded

### 2. Completar módulos faltantes

**Prontuário digital** — verifique se os endpoints já existem em `server.js` para:
- Anamnese (formulário de saúde do paciente)
- Odontograma (mapa dental interativo)
- Receitas (prescrição médica)
- Atestados (documento de comparecimento)

Se o endpoint existir mas a UI estiver incompleta, implemente a UI.  
Se o endpoint não existir, implemente backend + UI.

**Modal de orçamentos** — verificar `orcamentos-modal.js` e conectar à interface principal.

**Retornos com lembretes** — a lógica de retornos já existe. Verificar se a interface permite criar/editar/notificar retornos pelo WhatsApp.

**Termo de consentimento digital** — página simples de geração de PDF ou modal de assinatura antes de procedimentos.

**Importação CSV/Excel** — endpoint `POST /api/pacientes/importar` com parsing de CSV/XLSX para a tabela `pacientes`.

### 3. Limpeza de código legado

- Remover imports de `dental-ultra.tokens.css`, `dental-ultra.ui.css`, `dental-ultra.ui.js` de **todas** as páginas
- Verificar se alguma página ainda aponta a API para `dentist-backend-v2-production.up.railway.app` e corrigir
- Remover o diretório `area-dentistas/area-dentistas/` (cópia duplicada aninhada)

### 4. Segurança (implementar no código — variáveis ficam com o usuário)

Itens que **você pode implementar diretamente** sem precisar de credenciais:

- **Rate limiting:** instalar `express-rate-limit` via npm e aplicar em `/api/auth/login` e `/api/auth/register` (máx. 10 tentativas por 15 minutos por IP)
- **CORS:** mudar `origin: '*'` para `origin: process.env.ALLOWED_ORIGIN || 'https://ultra-simples-production.up.railway.app'` em `server.js`
- **Substituir email legado:** trocar `suporte@dentalultra.com.br` nos templates de email por `process.env.EMAIL_SUPORTE || 'contato@ultrasimples.com.br'` — quando a variável for configurada no Railway, o email correto passa a ser usado automaticamente

---

## Regras de Trabalho Autônomo

1. **Nunca pergunte sobre algo que pode ser inferido do código** — leia o `server.js`, os HTMLs existentes e o README antes de assumir que algo não existe.

2. **Ao encontrar código quebrado ou incompleto**, corrija usando o padrão do restante do projeto. Não deixe pendente.

3. **Ao implementar algo novo**, siga exatamente o padrão das páginas já reformuladas (`login.html`, `cadastro.html`, `dashboard.html`, `confirmar-email.html`).

4. **Commits frequentes** — faça `git add` + `git commit` + `git push` a cada grupo lógico de mudanças. Mensagens de commit em português, claras e descritivas.

5. **Não toque em:**
   - Variáveis de ambiente existentes no Railway
   - A lógica de negócio de `casos-proteticos.html`
   - Arquivos fora do repositório `ultra-simples/`

6. **Ao final do trabalho**, crie um arquivo `RELATORIO-AUTONOMO.md` na raiz do projeto com:
   - O que foi feito (lista de mudanças)
   - O que ficou pendente e por quê
   - **Lista de perguntas/ações que precisam do dono do produto** (ex: configurar variável X no Railway, contratar domínio, etc.)

---

## Referências Rápidas

| O que precisa | Onde buscar |
|---------------|-------------|
| Contexto completo do projeto | `README.md` |
| Histórico e roadmap | `PROGRESSO.md` |
| Lógica da API | `backend/server.js` |
| Padrão visual atual | `area-dentistas/dashboard.html` (referência) |
| Padrão de auth | `area-dentistas/js/auth-check.js` |
| Testes pendentes | `area-dentistas/TESTES-PENDENTES.md` |

---

## Início

Antes de começar, faça:

```bash
cd /Users/ricardodoerner/ultra-simples
git status
git log --oneline -5
```

Leia `PROGRESSO.md` e `README.md` inteiros. Depois leia o `server.js` para entender todos os endpoints disponíveis. Com esse contexto, execute o plano acima do início ao fim.
