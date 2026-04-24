# Ultra Simples — Sistema de Gestão Odontológica

Software web completo para gestão de clínicas odontológicas, com foco em **Equiparação Hospitalar**.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Backend | Node.js + Express + PostgreSQL |
| Autenticação | JWT + bcrypt |
| Frontend | HTML / CSS / JavaScript vanilla |
| Deploy | Railway (backend + frontend no mesmo serviço) |

---

## URLs

| Ambiente | URL |
|----------|-----|
| Backend (produção) | https://ultra-simples-production.up.railway.app |
| Health check | https://ultra-simples-production.up.railway.app/health |

> **Atenção — não confundir projetos:**
> - Os links `dentist-backend-v2-production.up.railway.app` e similares encontrados dentro dos arquivos do frontend pertencem ao projeto **Dental Ultra** (projeto separado) e **não** correspondem ao Ultra Simples.
> - Arquivos com prefixo `dental-ultra.*` (ex: `dental-ultra.tokens.css`, `dental-ultra.ui.css`) são código herdado e **não devem ser usados** em páginas novas ou reformuladas.
> - **Nunca modificar** arquivos fora deste repositório (`ultra-simples/`). O projeto Dental Ultra é independente e não deve ser tocado aqui.

---

## Estrutura do projeto

```
ultra-simples/
├── README.md
└── backend/
    ├── server.js              # API principal (Node.js/Express — ~5000 linhas)
    ├── package.json
    ├── deploy-railway.bat     # Script de deploy (Windows)
    └── frontend/
        ├── index.html         # Landing page (marketing)
        ├── calculadora.html   # Calculadora de impostos
        ├── quiz.html          # Quiz Equiparação Hospitalar
        ├── admin.html         # Painel admin
        ├── cadastro.html      # Cadastro de usuários
        ├── css/               # Estilos globais
        ├── js/                # Scripts gerais
        └── area-dentistas/    # Sistema dental (app principal)
            ├── login.html
            ├── dashboard.html
            ├── agenda.html
            ├── pacientes.html
            ├── prontuario.html
            ├── plano-tratamento.html
            ├── nota-fiscal.html
            ├── casos-proteticos.html
            ├── financeiro.html
            ├── estoque.html
            ├── relatorios.html
            ├── configuracoes.html
            ├── css/
            └── js/
                ├── config.js
                ├── api.js
                ├── auth.js
                ├── agenda-multi.js
                ├── modal-paciente.js
                ├── nfse-integration.js
                └── ...
```

---

## Módulos

| Módulo | Status |
|--------|--------|
| Autenticação (JWT, multi-usuário, confirmação de email) | ✅ Funcionando |
| Pacientes (cadastro completo, convênio, menores, estrangeiros) | ✅ Funcionando |
| Agenda (multi-profissional, encaixe, confirmação por link/WhatsApp) | ✅ Funcionando |
| Prontuário digital (anamnese, odontograma, receitas, atestados) | 🔄 Em desenvolvimento |
| Plano de tratamento | ✅ Funcionando |
| Casos protéticos (laboratórios, rastreamento de status, arquivos) | ✅ Funcionando |
| Financeiro (movimentações, orçamentos, parcelamento) | ✅ Funcionando |
| NFSe (emissão de notas, webservice de prefeituras) | ✅ Funcionando |
| Retornos automáticos (3, 6, 12 meses) | ✅ Funcionando |
| Estoque | ✅ Funcionando |
| Dashboard com métricas | ✅ Funcionando |
| Configurações da clínica | ✅ Funcionando |
| Relatórios contábeis / DMED | ⏳ Pendente |
| Integração Hotmart (licenciamento) | ⏳ Pendente |

---

## Identidade visual

> **Requisito obrigatório:** Todas as páginas e componentes novos ou reformulados devem obrigatoriamente seguir esta identidade visual. Nenhuma cor, fonte ou estilo fora deste padrão deve ser introduzido.

### Tipografia
- **Fonte:** Inter (Google Fonts) — pesos 400, 500, 600, 700, 800
- **Fallback:** `system-ui, sans-serif`

### Paleta de cores

| Token | Hex | Uso |
|-------|-----|-----|
| Primária (teal-600) | `#0D9488` | Botões, links, destaques, ícones |
| Primária hover (teal-700) | `#0F766E` | Hover de botões e links |
| Primária clara (teal-100) | fundo de ícones | Background de ícones decorativos |
| Texto principal | `#111827` | Body, títulos, header |
| Texto secundário | `#6B7280` | Subtítulos, descrições, labels |
| Fundo secundário | `#F9FAFB` | Seções alternadas |
| Branco | `#FFFFFF` | Cards, fundo padrão |
| Footer | `#111827` | Background do rodapé |
| CTA section | `teal-700` | Background da seção de preço/CTA final |

### Gradiente do mockup
```css
background: linear-gradient(135deg, #0D9488 0%, #0F766E 100%);
```

### Ícones
- Biblioteca: **Lucide Icons** (via unpkg CDN)
- Ícone da marca: `tooth` (dente)

### Componentes e estilo
- **Framework CSS:** Tailwind CSS (via CDN)
- **Bordas arredondadas:** `rounded-lg` (botões), `rounded-xl` (cards), `rounded-2xl` (mockup)
- **Sombras:** `shadow-sm` (botões), `shadow-lg` (hover de cards), `shadow-2xl` (mockup hero)
- **Animação de entrada:** fade-in + translateY(24px) com transition de 0.7s (ativada por IntersectionObserver)
- **Header:** fixo, `bg-white/95` com `backdrop-blur`, borda inferior `border-gray-100`

### Textos-chave (copy)
- **Tagline:** *"Software odontológico que não complica sua rotina."*
- **Sub-headline:** *"Agenda, prontuário, WhatsApp e financeiro em um só lugar. Pensado para quem quer atender, não administrar planilhas."*
- **CTA primário:** *"Começar grátis por 14 dias"*
- **CTA secundário:** *"Ver demonstração"*
- **CTA final:** *"Criar minha conta grátis"*
- **Apoio do CTA:** *"Sem cartão de crédito. Cancele quando quiser."*

---

## Banco de dados — tabelas principais

`dentistas` · `pacientes` · `agendamentos` · `profissionais` · `usuarios`
`prontuarios` · `anamnese` · `plano_tratamento` · `receitas` · `atestados` · `odontograma_geral`
`casos_proteticos` · `laboratorios` · `casos_mensagens` · `casos_arquivos`
`financeiro` · `notas_fiscais` · `orcamentos` · `retornos` · `tabela_precos`
`config_clinica` · `config_prefeituras`

---

## Variáveis de ambiente (backend)

> **Regra obrigatória:** **Nunca modificar ou remover** variáveis já existentes. Se uma nova funcionalidade precisar de uma variável nova, apenas adicioná-la. Qualquer alteração de valor é feita exclusivamente no painel do Railway, nunca no código.

Todas as variáveis usadas em `backend/server.js`. **Nenhum valor real** deve aparecer aqui — apenas nomes, finalidade e exemplo placeholder. Segredos ficam no painel do Railway.

### Obrigatórias
```env
DATABASE_URL=postgresql://user:password@host/db   # Conexão PostgreSQL
JWT_SECRET=sua-chave-secreta                      # Assinatura dos tokens JWT (expira em 30d)
PORT=3001                                         # Porta do servidor Express
NODE_ENV=production                               # "production" no Railway
```

### Envio de email (fluxo de confirmação de cadastro)
```env
FRONTEND_URL=https://ultra-simples-production.up.railway.app               # Base do link de confirmação — mesmo host do backend (Express serve o frontend)
EMAIL_PHP_URL=https://dentalultra.com.br/api/enviar-email.php              # PHP mailer (infra compartilhada com o projeto Dental Ultra)
EMAIL_CHAVE_SECRETA=DENTAL_ULTRA_EMAIL_2024_SECRETKEY                      # Chave compartilhada — igual à do Dental Ultra
```

> **Infra de email reutilizada:** o Ultra Simples usa o mesmo PHP mailer e a mesma chave secreta do Dental Ultra — é infraestrutura compartilhada, não código copiado. Por isso os valores aparecem aqui (não são segredos de produção diferentes). O email remetente/assunto/HTML são identidade Ultra Simples.
> **Suporte no rodapé dos emails:** `suporte@dentalultra.com.br` (enquanto não houver caixa de suporte própria do Ultra Simples).
> **Defaults em `server.js`:** `FRONTEND_URL` → `https://ultra-simples-production.up.railway.app` (mesmo host do backend — Express serve o frontend na mesma porta); `EMAIL_PHP_URL` e `EMAIL_CHAVE_SECRETA` já apontam para a infra do Dental Ultra. Se qualquer um ficar vazio, `enviarEmail()` retorna `false` sem request e o usuário precisa ser ativado manualmente.

---

## Fluxo de cadastro e confirmação de email

### 1. Cadastro — `POST /api/auth/register`

**Body:** `{ name, cro, email, password, clinic?, specialty?, telefone? }`

**Validação:**
- `name`, `cro`, `email`, `password` obrigatórios → senão `400`
- `password.length >= 6` → senão `400`

**Lógica:**
1. `SELECT FROM dentistas WHERE email` (lowercase)
2. Se existe + `email_confirmado = false` → gera novo `token_confirmacao` + `token_expira` (agora + 24h), atualiza registro, reenvia email, responde `200 { aguardandoConfirmacao: true }`
3. Se existe + confirmado → `400 "Email já cadastrado"`
4. Se não existe → `bcrypt.hash(password, 10)`, gera token (32 chars alfanuméricos via `gerarToken()`), `INSERT` com `email_confirmado=false`, envia email, responde `201 { aguardandoConfirmacao: true, emailEnviado }`

**Email enviado:** template HTML com identidade Ultra Simples (teal `#0D9488`/`#0F766E`, Inter), link `${FRONTEND_URL}/area-dentistas/confirmar-email.html?token=${token}`.

### 2. Confirmação — `GET /api/auth/confirmar-email?token=...`

1. Busca `dentistas` por `token_confirmacao`
2. Verifica `token_expira > now()` → senão `400 "Token expirado"`
3. `UPDATE dentistas SET email_confirmado=true, token_confirmacao=NULL, token_expira=NULL`
4. Responde `{ success: true, nome }`

Página `area-dentistas/confirmar-email.html` (e versão raiz em `frontend/confirmar-email.html`) consome esse endpoint e mostra 4 estados: Loading / Success / Error / NoToken.

### 3. Reenvio manual — `POST /api/auth/reenviar-confirmacao`

**Body:** `{ email }`
- Se email não existe → `400`
- Se já confirmado → `400 "Email já confirmado. Faça login."`
- Senão: gera novo token, atualiza, envia email

### 4. Login — `POST /api/auth/login`

Se `email_confirmado === false` → `403 { emailNaoConfirmado: true, email }` (o frontend mostra botão "Reenviar confirmação").

### Colunas do banco usadas no fluxo (tabela `dentistas`)

| Coluna | Tipo | Uso |
|--------|------|-----|
| `name`, `cro`, `email`, `password` | text | Identidade e hash bcrypt |
| `clinic`, `specialty`, `telefone` | text | Dados opcionais |
| `email_confirmado` | boolean | `false` enquanto pendente, `true` após confirmação |
| `token_confirmacao` | text | Token aleatório de 32 chars, `NULL` após confirmar |
| `token_expira` | timestamp | Expira em 24h a partir da criação/reenvio |
| `subscription_active`, `ativo` | boolean | Login bloqueia com `403 "Conta desativada"` se `false` |

---

## Como rodar localmente

Um único processo Node serve **backend + frontend** (o Express serve a pasta `frontend/` com `express.static`).

```bash
cd backend
npm install
node server.js
```

Depois acesse:
- `http://localhost:<PORT>/` → landing (`frontend/index.html`)
- `http://localhost:<PORT>/cadastro` → tela de cadastro
- `http://localhost:<PORT>/login` → tela de login
- `http://localhost:<PORT>/area-dentistas/dashboard.html` → app principal (após login)

> Para testar o fluxo de cadastro localmente, defina `FRONTEND_URL=http://localhost:<PORT>` antes de iniciar — senão o link do email vai continuar apontando para o domínio do Railway.

---

## Deploy

- **Tudo junto no Railway:** push para o GitHub → Railway faz redeploy automático de backend **e** frontend no mesmo serviço.
- O Express serve o frontend estático via `app.use(express.static(path.join(__dirname, 'frontend')))` em `server.js`, então não existe deploy separado de frontend.
- Rotas estáticas definidas em `server.js`: `GET /cadastro`, `GET /login`, `GET /termos`, `GET /privacidade` (redirecionam para os HTMLs correspondentes).

---

## Dicionário de campos — banco de dados e API

> **Por que existe esta seção:** erros como usar `dentista.name` em vez de `dentista.nome` ou `d.clinic` em vez de `d.clinica` causam bugs silenciosos (retornam `undefined`). Este dicionário é a referência definitiva. **Antes de escrever qualquer query SQL ou acessar qualquer campo de resposta da API, consulte aqui.**

### Regra geral
- Colunas no **banco de dados** → sempre `snake_case` em português
- Campos na **API (req.body)** → geralmente `camelCase`, exceto onde indicado
- Campos na **API (res.json)** → geralmente `camelCase`
- **Nunca usar nomes em inglês** (`name`, `password`, `clinic`, `specialty`) — as colunas são em português

---

### Tabela `dentistas`

| Coluna no banco | Tipo | Notas |
|----------------|------|-------|
| `id` | SERIAL PK | |
| `nome` | VARCHAR 255 | ⚠️ Não é `name` |
| `cro` | VARCHAR 50 | |
| `email` | VARCHAR 255 UNIQUE | Sempre salvo em lowercase |
| `senha` | VARCHAR 255 | ⚠️ Não é `password` — hash bcrypt |
| `clinica` | VARCHAR 255 | ⚠️ Não é `clinic` |
| `especialidade` | VARCHAR 255 | ⚠️ Não é `specialty` |
| `telefone` | VARCHAR 20 | |
| `ativo` | BOOLEAN | Default `true` |
| `plano` | VARCHAR 50 | ⚠️ Não é `subscription_plan`. Default `'premium'` |
| `email_confirmado` | BOOLEAN | Default `false` |
| `token_confirmacao` | VARCHAR 64 | `NULL` após confirmar |
| `token_expira` | TIMESTAMP | Expira em 24h |
| `criado_em` | TIMESTAMP | |
| `atualizado_em` | TIMESTAMP | |

**Resposta da API (login/verify):**
```json
{ "id": "string", "nome": "string", "cro": "string", "email": "string",
  "clinica": "string", "especialidade": "string", "plano": "string" }
```

---

### Tabela `pacientes`

| Coluna no banco | Tipo | Notas |
|----------------|------|-------|
| `id` | SERIAL PK | |
| `dentista_id` | INTEGER FK | |
| `nome` | VARCHAR 255 | |
| `cpf` | VARCHAR 14 | |
| `data_nascimento` | DATE | API: `dataNascimento` |
| `sexo` | VARCHAR 20 | |
| `telefone` / `celular` | VARCHAR 20 | |
| `email` | VARCHAR 255 | |
| `endereco`, `numero`, `complemento`, `bairro`, `cidade`, `estado`, `cep` | VARCHAR | |
| `convenio` | VARCHAR 100 | |
| `numero_convenio` | VARCHAR 50 | API: `numeroConvenio` |
| `menor_idade` | BOOLEAN | API: `menorIdade` |
| `responsavel_nome` | VARCHAR 255 | API: `responsavelNome` |
| `responsavel_cpf` | VARCHAR 14 | API: `responsavelCpf` |
| `responsavel_telefone` | VARCHAR 20 | API: `responsavelTelefone` |
| `responsavel_email` | VARCHAR 255 | API: `responsavelEmail` |
| `responsavel_parentesco` | VARCHAR 50 | API: `responsavelParentesco` |
| `estrangeiro` | BOOLEAN | |
| `passaporte` | VARCHAR 50 | |
| `pais` / `nacionalidade` | VARCHAR 100 | |
| `tel_recados` / `nome_recado` | VARCHAR | API: snake_case (exceção) |
| `ativo` | BOOLEAN | Soft delete |
| `criado_em` | TIMESTAMP | API: `criadoEm` |

---

### Tabela `agendamentos`

| Coluna no banco | Tipo | Notas |
|----------------|------|-------|
| `id` | SERIAL PK | |
| `dentista_id` | INTEGER FK | |
| `paciente_id` | INTEGER FK | Opcional |
| `paciente_nome` | VARCHAR 255 | |
| `data` | DATE | |
| `horario` | TIME | ⚠️ Coluna é `horario`, API retorna como `hora` |
| `duracao` | INTEGER | Default 60 (minutos) |
| `procedimento` | VARCHAR 255 | |
| `valor` | DECIMAL 10,2 | |
| `status` | VARCHAR 50 | Default `'confirmado'` |
| `encaixe` | BOOLEAN | Default `false` |
| `codigo_confirmacao` | VARCHAR 10 | Único, gerado automaticamente |
| `rotulo` | VARCHAR 50 | |
| `profissional_id` | INTEGER | ID da tabela `profissionais` |
| `paciente_telefone` | VARCHAR 30 | |
| `criado_em` | TIMESTAMP | |

---

### Tabela `profissionais` (agenda)

| Coluna no banco | Tipo | Notas |
|----------------|------|-------|
| `id` | SERIAL PK | |
| `dentista_id` | INTEGER FK | Dono da clínica |
| `nome` | VARCHAR 255 | |
| `cro` | VARCHAR 30 | |
| `especialidade` | VARCHAR 100 | Default `'Clínico Geral'` |
| `cor` | VARCHAR 20 | Default `'#2d7a5f'` |
| `intervalo_minutos` | INTEGER | Default 30 |
| `hora_entrada` / `hora_saida` | TIME | Default `08:00` / `18:00` |
| `almoco_inicio` / `almoco_fim` | TIME | Default `12:00` / `13:00` |
| `ativo` | BOOLEAN | Default `true` |

---

### Outras tabelas (referência de nomes)

| Tabela | Colunas principais |
|--------|-------------------|
| `prontuarios` | `id`, `dentista_id`, `paciente_id`, `data`, `descricao`, `procedimento`, `dente`, `valor` |
| `financeiro` | `id`, `dentista_id`, `paciente_id`, `tipo`, `descricao`, `valor`, `data`, `status`, `forma_pagamento`, `parcelas` |
| `notas_fiscais` | `id`, `dentista_id`, `paciente_id`, `numero`, `valor`, `data_emissao`, `descricao_servico`, `status`, `xml`, `pdf_url` |
| `laboratorios` | `id`, `dentista_id`, `nome`, `cnpj`, `telefone`, `whatsapp`, `email`, `responsavel_tecnico`, `cro_responsavel` |
| `casos_proteticos` | `id`, `dentista_id`, `paciente_id`, `laboratorio_id`, `codigo`, `tipo_trabalho`, `material`, `cor_shade`, `urgencia`, `data_envio`, `data_prometida`, `status`, `valor_combinado`, `valor_pago` |
| `config_clinica` | `id`, `dentista_id`, `nome_clinica`, `nome_dentista`, `telefone`, `whatsapp`, `endereco`, `assinatura`, `hora_abre`, `hora_fecha`, `intervalo_padrao` |
| `usuarios_vinculados` | `id`, `dentista_id`, `nome`, `email`, `senha`, `cargo`, `permissoes` (JSONB) |

---

## Checklist de segurança para produção comercial

> **Executar obrigatoriamente antes de lançar o produto para clientes reais.**
> Nenhum item abaixo é opcional — são requisitos mínimos de segurança e conformidade.

| # | Item | Onde | Status |
|---|------|------|--------|
| 1 | Trocar `JWT_SECRET` por uma chave forte e aleatória (mín. 64 chars) | Railway → Variables | ⏳ Pendente |
| 2 | Trocar senha do PostgreSQL (rotacionar `DATABASE_URL`) | Railway → PostgreSQL → Credentials | ⏳ Pendente |
| 3 | Configurar infra de email própria (SMTP ou serviço como Resend/SendGrid) e remover dependência do PHP mailer do Dental Ultra (`EMAIL_PHP_URL`, `EMAIL_CHAVE_SECRETA`) | Railway → Variables + server.js | ⏳ Pendente |
| 4 | Substituir `suporte@dentalultra.com.br` nos 3 templates de email por endereço próprio do Ultra Simples | `backend/server.js` linhas dos templates HTML | ⏳ Pendente |
| 5 | Restringir CORS — trocar `origin: '*'` por domínio real da aplicação | `backend/server.js` middleware CORS | ⏳ Pendente |
| 6 | Ativar rate limiting no Express (ex: `express-rate-limit`) nos endpoints de login e cadastro para evitar brute force | `backend/server.js` | ⏳ Pendente |
| 7 | Configurar domínio próprio (`app.ultrasimples.com.br` ou similar) e remover exposição direta do subdomínio Railway | Railway → Networking | ⏳ Pendente |
| 8 | Substituir Tailwind CSS via CDN por build local (performance + não depender de CDN externo) | Todos os HTMLs | ⏳ Pendente |
| 9 | Revisar e publicar Termos de Uso e Política de Privacidade com advogado | `frontend/termos.html`, `frontend/privacidade.html` | ⏳ Pendente |
| 10 | Remover arquivos e código herdado do Dental Ultra (`dental-ultra.tokens.css`, `dental-ultra.ui.css`, `dental-ultra.ui.js`) — não estão em uso nas páginas reformuladas | `frontend/area-dentistas/css/` e `js/` | ⏳ Pendente |
| 11 | Configurar backups automáticos do PostgreSQL | Railway → PostgreSQL ou serviço externo | ⏳ Pendente |
| 12 | Configurar caixa de suporte própria (`suporte@ultrasimples.com.br`) | Provedor de email | ⏳ Pendente |

---

## Pendências e testes

Ver arquivo: `backend/frontend/area-dentistas/TESTES-PENDENTES.md`

---

## Histórico de evoluções

### [2026-04-22]
- Repositório clonado e documentado
- README criado com visão completa do projeto
- URL Railway correta identificada: `ultra-simples-production.up.railway.app`
- Identidade visual documentada (cores, tipografia, ícones, componentes)
- `frontend/login.html` reformulado para seguir identidade visual (teal, Inter, Tailwind, Lucide)
- `frontend/js/auth.js` corrigido: URL da API apontando para o backend correto do Ultra Simples
- **Arquitetura confirmada:** backend e frontend rodam juntos no **mesmo serviço Railway** (Express serve `frontend/` via `express.static`). Não há Hostinger separado para o frontend. Stack e seção "Deploy" do README corrigidas.
- **Auditoria e correção completa do fluxo de cadastro/confirmação de email** (contaminação Dental Ultra → Ultra Simples):
  - `backend/server.js`: função `enviarEmail()` agora aborta cedo com warning se `EMAIL_PHP_URL` ou `EMAIL_CHAVE_SECRETA` estiverem vazios, evitando request falho silencioso
  - `backend/server.js`: 3 templates HTML de email (cadastro novo, reenvio em cadastro existente, endpoint `/api/auth/reenviar-confirmacao`) reescritos com identidade Ultra Simples — texto "Ultra Simples", cores teal `#0D9488`/`#0F766E`, fonte Inter, placeholders `[dente]`/`[OK]` removidos, assunto atualizado
  - `backend/server.js`: `FRONTEND_URL` default = `https://ultra-simples-production.up.railway.app` (mesmo host do backend). `EMAIL_PHP_URL` e `EMAIL_CHAVE_SECRETA` **mantidos** com valores do Dental Ultra — decisão explícita do usuário de reutilizar a infra compartilhada (PHP mailer em `dentalultra.com.br/api/enviar-email.php`) enquanto o Ultra Simples não tem a sua própria
  - `backend/server.js`: banner de startup trocado de `"DENTAL ULTRA API - VERSÃO 6.0"` para `"ULTRA SIMPLES API - VERSÃO 1.0"`
  - Rodapé dos emails: suporte mantido como `suporte@dentalultra.com.br` (compartilhado, enquanto não houver caixa própria)
  - `backend/frontend/area-dentistas/js/auth.js`: URL da API estava hardcoded para `dentist-backend-v2-production.up.railway.app` (Dental Ultra) → corrigido para `ultra-simples-production.up.railway.app`. Header atualizado para "ULTRA SIMPLES v1.0"
  - `backend/frontend/area-dentistas/confirmar-email.html` e `backend/frontend/confirmar-email.html`: reescritos completamente. Antes apontavam para a API do Dental Ultra (quebrava confirmação). Agora usam Tailwind + Lucide + Inter + teal, API correta, 4 estados (Loading/Success/Error/NoToken) com ícones Lucide (`loader`, `check`, `x`)
  - README: seção "Fluxo de cadastro" + tabela de colunas do banco adicionadas; seção "Variáveis de ambiente" expandida com todas as env vars usadas no backend; seção "Como rodar localmente" corrigida (um único processo serve tudo)
- **Pendências (não-bloqueantes):**
  - Caixa de suporte própria — quando existir, substituir `suporte@dentalultra.com.br` nos 3 templates de email
