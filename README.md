# Ultra Simples — Sistema de Gestão Odontológica

Software web completo para gestão de clínicas odontológicas, com foco em **Equiparação Hospitalar**.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Backend | Node.js + Express + PostgreSQL |
| Autenticação | JWT + bcrypt |
| Frontend | HTML / CSS / JavaScript vanilla |
| Deploy | Railway (backend) + Hostinger (frontend) |

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

```env
DATABASE_URL=postgresql://user:password@host/db
JWT_SECRET=sua-chave-secreta
PORT=3001
NODE_ENV=production
```

---

## Como rodar localmente

```bash
# Backend
cd backend
npm install
node server.js

# Frontend
cd backend/frontend
npm install
node server.js
```

---

## Deploy

- **Backend:** push para o GitHub → Railway faz redeploy automático
- **Frontend:** upload manual para Hostinger

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
