# Tarefas Manuais — Ultra Simples

Gerado em: 2026-04-27  
Estas tarefas não podem ser realizadas automaticamente e exigem ação direta sua.

---

## 1. DEPLOY NO RAILWAY (URGENTE — sem isso nada funciona)

Todas as correções feitas no `backend/server.js` e nos arquivos de frontend ficam em disco local. Para funcionar em produção você precisa fazer o deploy.

**Como fazer:**

```bash
# Na raiz do projeto:
cd /Users/ricardodoerner/ultra-simples

# Adicionar tudo e fazer commit
git add -A
git commit -m "fix: correções de naming, receitas, atestados, retornos"

# Push para o repositório ligado ao Railway
git push origin main
```

Se o Railway estiver configurado para deploy automático ao push, ele subirá sozinho. Caso contrário, acesse o painel do Railway e clique em "Deploy" manualmente.

**Por que é urgente:** As novas colunas de banco (`ALTER TABLE receitas ADD COLUMN IF NOT EXISTS medicamentos JSONB`, etc.) só são criadas quando o servidor inicia. Enquanto não fizer deploy, receitas, atestados e retornos continuam quebrando em produção.

---

## 2. EXCLUIR ARQUIVOS OBSOLETOS

Existem dois arquivos antigos que podem causar confusão futura:

### 2a. Servidor antigo dentro do frontend (5775 linhas)

```
/Users/ricardodoerner/ultra-simples/backend/frontend/area-dentistas/server.js
```

Este é uma cópia antiga do servidor, com campo `name` em vez de `nome`, `clinic` em vez de `clinica`, etc. Ele **não é servido** pelo servidor real, mas atrapalha buscas de código.

```bash
rm /Users/ricardodoerner/ultra-simples/backend/frontend/area-dentistas/server.js
```

### 2b. Auth helper duplicado

```
/Users/ricardodoerner/ultra-simples/backend/frontend/area-dentistas/frontend-auth.js
```

```bash
rm /Users/ricardodoerner/ultra-simples/backend/frontend/area-dentistas/frontend-auth.js
```

Verifique antes se alguma página ainda carrega este arquivo:

```bash
grep -r "frontend-auth" /Users/ricardodoerner/ultra-simples/backend/frontend/area-dentistas/ --include="*.html"
```

Se nenhuma página referencia ele, pode apagar com segurança.

---

## 3. STORAGE DE ARQUIVOS (upload de imagens/documentos)

Os endpoints `/api/storage/upload` e `/api/storage/download/:id` retornam **501 Not Implemented**. Isso significa que upload de imagens e documentos de pacientes não funciona.

**Onde aparece para o usuário:** Na tela de `paciente-detalhe.html` (aba Documentos) e em `casos-proteticos.html` (upload de fotos do caso protético).

**Para resolver, escolha uma opção:**

### Opção A — Cloudinary (mais fácil, gratuito até 25GB)

1. Crie conta em https://cloudinary.com
2. Pegue `cloud_name`, `api_key`, `api_secret` no dashboard
3. Instale o pacote:
   ```bash
   cd /Users/ricardodoerner/ultra-simples/backend
   npm install cloudinary
   ```
4. Em `server.js`, substitua o stub `POST /api/storage/upload` por:
   ```js
   const cloudinary = require('cloudinary').v2;
   cloudinary.config({ cloud_name: 'SEU_CLOUD', api_key: 'SUA_KEY', api_secret: 'SEU_SECRET' });

   app.post('/api/storage/upload', authMiddleware, async (req, res) => {
       // req.body.file = base64 string
       const result = await cloudinary.uploader.upload(req.body.file, { folder: 'ultra-simples' });
       res.json({ success: true, url: result.secure_url, id: result.public_id });
   });
   ```
5. Também atualize `GET /api/storage/status` para retornar `connected: true`.

### Opção B — Manter localStorage (temporário)

Imagens continuam salvas em base64 no localStorage do navegador. Funciona, mas:
- Dados são perdidos ao limpar o cache
- Não sincroniza entre dispositivos/navegadores
- Não aparece em relatórios do servidor

Nenhuma ação necessária para manter o comportamento atual.

---

## 4. NFS-e — NOTA FISCAL ELETRÔNICA

O módulo `nfse-integration.js` está integrado mas depende de credenciais da prefeitura do seu município.

**O que precisa configurar:**

1. Acesse o portal da prefeitura do município onde a clínica está registrada
2. Solicite credenciais de webservice NFS-e (usuário e senha de contribuinte)
3. Dentro do sistema, na tela de **Nota Fiscal → Configurações NFS-e**, preencha:
   - Usuário da prefeitura
   - Senha da prefeitura
   - CNPJ da clínica
   - Inscrição Municipal
4. Faça uma emissão de teste antes de usar em produção

**Observação:** Cada município tem um sistema diferente. O código atual foi escrito para o padrão ABRASF, que cobre a maioria das prefeituras brasileiras, mas pode precisar de ajustes pontuais dependendo do município.

---

## 5. VARIÁVEIS DE AMBIENTE NO RAILWAY

Verifique se estas variáveis estão configuradas no painel do Railway (Settings → Variables):

| Variável | Valor esperado | O que quebra sem ela |
|----------|---------------|----------------------|
| `DATABASE_URL` | URL do PostgreSQL do Railway | Servidor não inicia |
| `JWT_SECRET` | String secreta longa (ex: 64 chars aleatórios) | Login não funciona |
| `PORT` | Deixar em branco (Railway define automaticamente) | — |

**Como verificar:**

```bash
# No Railway CLI (se instalado):
railway variables

# Ou acesse: https://railway.app → seu projeto → Variables
```

Se `JWT_SECRET` não estiver definido, o login vai falhar com erro 500 silencioso.

---

## 6. TESTAR OS FLUXOS CORRIGIDOS (após deploy)

Após o deploy, teste manualmente estes fluxos que foram corrigidos nesta sessão:

### 6a. Receitas (prontuário)
1. Abra um paciente em `prontuario.html`
2. Vá na aba **Receitas**
3. Adicione 2 medicamentos e clique em **Salvar e Imprimir**
4. Recarregue a página — a receita deve aparecer na lista com os medicamentos corretos
5. Clique em **Imprimir** — deve abrir o documento com os medicamentos listados

**O que estava quebrando antes:** O servidor recebia `medicamentos` (array) mas só entendia `medicamento` (string), então salvava em branco.

### 6b. Atestados (prontuário)
1. Abra um paciente em `prontuario.html`
2. Vá na aba **Atestados**
3. Selecione tipo "Atestado Odontológico", preencha dias e conteúdo, salve
4. Recarregue — deve aparecer na lista com o conteúdo correto
5. Clique em **Imprimir** — o conteúdo deve aparecer no documento

**O que estava quebrando antes:** O campo `conteudo` era ignorado pelo servidor (que esperava `motivo`).

### 6c. Retornos (agenda)
1. Abra `agenda-multi.js` (agenda principal)
2. Clique no sino de notificações → aba **Retornos**
3. Adicione um retorno para um paciente
4. O retorno deve aparecer na lista com nome do paciente e data correta
5. O botão WhatsApp deve aparecer se o paciente tem celular

**O que estava quebrando antes:** O servidor recebia `proximoRetorno` mas esperava `dataRetorno`; a lista retornava snake_case sem aliases camelCase.

### 6d. Painel de orçamentos pendentes (agenda)
1. Abra a agenda, clique no sino → aba **Orçamentos**
2. A lista deve aparecer sem erro 500

**O que estava quebrando antes:** Query SQL tentava ler coluna `pacientes.whatsapp` que não existe → 500 em toda chamada.

---

## 7. CONFIGURAÇÃO DE E-MAIL (SMTP) — se aplicável

Se o sistema envia e-mails (confirmação de cadastro, lembretes), verifique se as variáveis de ambiente de SMTP estão configuradas no Railway:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu@email.com
SMTP_PASS=senha_de_app_do_google
```

Se não usa e-mail, ignore este item.

---

## 8. BACKUP DO BANCO ANTES DO PRIMEIRO DEPLOY COM AS CORREÇÕES

As correções adicionam colunas novas via `ALTER TABLE IF NOT EXISTS` — operações seguras que não destroem dados. Mesmo assim, por precaução:

```bash
# No Railway CLI:
railway run pg_dump $DATABASE_URL > backup_antes_deploy_$(date +%Y%m%d).sql

# Ou pelo painel do Railway: seu banco PostgreSQL → Backups → Create Backup
```

---

## 9. REVISAR PERMISSÕES DE USUÁRIOS VINCULADOS

O sistema tem suporte a usuários vinculados (secretárias, auxiliares) em `usuarios.html`. Certifique-se de que as permissões configuradas fazem sentido para o seu fluxo:

- **Usuários com permissão `*`** têm acesso total (igual ao dentista dono)
- **Usuários sem permissão** específica podem ver itens mas não editar

Nenhum código precisa ser alterado — apenas revisar os usuários cadastrados pelo painel de Usuários.

---

## Resumo de Prioridades

| # | Tarefa | Urgência |
|---|--------|----------|
| 1 | Deploy no Railway | 🔴 Crítico |
| 2 | Excluir arquivos obsoletos | 🟡 Recomendado |
| 3 | Configurar storage (se quiser upload de arquivos) | 🟡 Recomendado |
| 4 | Testar os 4 fluxos corrigidos | 🟡 Recomendado |
| 5 | Verificar variáveis de ambiente | 🔴 Crítico |
| 6 | Configurar NFS-e | 🟢 Opcional |
| 7 | Configurar SMTP | 🟢 Opcional |
| 8 | Backup antes do deploy | 🟡 Recomendado |
| 9 | Revisar permissões de usuários | 🟢 Opcional |
