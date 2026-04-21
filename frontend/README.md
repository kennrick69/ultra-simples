# 🚀 Backend NFSe - Integração Pomerode/SC

Backend Node.js para integração direta com o sistema de NFSe da Prefeitura de Pomerode-SC (provedor IPM/AtendeNet).

## 📋 Funcionalidades

- ✅ **Emitir Nota Fiscal** - Emissão automática de NFSe
- ✅ **Consultar Nota** - Consulta de notas emitidas
- ✅ **Cancelar Nota** - Cancelamento de notas
- ✅ **Validar Credenciais** - Teste de conexão com prefeitura
- ✅ **100% Gratuito** - Sem custos por nota

## 🛠️ Tecnologias

- **Node.js** 18+
- **Express** - Framework web
- **Axios** - Requisições HTTP
- **xml2js** - Parser XML
- **CORS** - Comunicação com frontend

## 📦 Instalação

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env

# 3. Iniciar servidor
npm start
```

## 🌐 Endpoints da API

### 1. Status do Servidor
```
GET /
GET /health
```

### 2. Emitir Nota Fiscal
```
POST /api/nfse/emitir
```

**Body:**
```json
{
  "usuario_prefeitura": "12345678000190",
  "senha_prefeitura": "senha123",
  "cnpj": "12345678000190",
  "inscricao_municipal": "12345",
  "razao_social": "Clínica Odontológica LTDA",
  "descricao": "Implante dentário unitário no elemento 16...",
  "valor_servicos": 5000.00,
  "codigo_servico": "04.02",
  "aliquota_iss": 3.5,
  "tomador": {
    "cpf_cnpj": "12345678909",
    "razao_social": "João da Silva",
    "nome": "João da Silva"
  }
}
```

**Resposta:**
```json
{
  "success": true,
  "mensagem": "Nota emitida com sucesso!",
  "numero_nota": "123456",
  "codigo_verificacao": "ABC123",
  "data_emissao": "2026-01-25T10:00:00Z",
  "numero_rps": "12345678",
  "serie_rps": "1"
}
```

### 3. Consultar Nota
```
GET /api/nfse/consultar/:numero
```

**Query Params:**
- `usuario_prefeitura`
- `senha_prefeitura`
- `inscricao_municipal`

### 4. Cancelar Nota
```
POST /api/nfse/cancelar
```

**Body:**
```json
{
  "numero_nota": "123456",
  "motivo_cancelamento": "Erro na emissão",
  "usuario_prefeitura": "12345678000190",
  "senha_prefeitura": "senha123",
  "inscricao_municipal": "12345"
}
```

### 5. Validar Credenciais
```
POST /api/nfse/validar-credenciais
```

**Body:**
```json
{
  "usuario_prefeitura": "12345678000190",
  "senha_prefeitura": "senha123"
}
```

## 🔐 Segurança

- Credenciais enviadas via Basic Auth
- HTTPS obrigatório em produção
- Validação de dados antes de enviar
- Logs de todas as requisições
- Timeout de 30 segundos por requisição

## 🚀 Deploy no Railway

1. Criar conta em [railway.app](https://railway.app)
2. Conectar repositório GitHub
3. Deploy automático!

**Variáveis de ambiente no Railway:**
```
PORT=3001
NODE_ENV=production
```

## 📝 Códigos de Serviço Comuns

| Código | Descrição |
|--------|-----------|
| 04.02 | Próteses e implantes |
| 04.03 | Radiologia e exames |
| 04.06 | Aplicação de anestesia |
| 04.14 | Tratamento de fraturas |

## ⚠️ Observações Importantes

### Liberação na Prefeitura

Antes de usar, o dentista deve liberar acesso ao WebService:

1. Acessar: https://nfse-pomerode.atende.net
2. Login com usuário/senha
3. Menu → "Emissão de NFS-e por WebService"
4. Clicar "Liberar Acesso ao Usuário"
5. Confirmar

### Credenciais

- **Usuário:** CNPJ do dentista (com formatação)
- **Senha:** Mesma senha do portal da prefeitura

### Formato XML

O sistema usa o padrão ABRASF com adaptações do IPM.

## 🐛 Troubleshooting

### Erro: "Acesso negado"
- Verificar se liberou WebService na prefeitura
- Confirmar usuário e senha

### Erro: "Código de serviço inválido"
- Verificar se o código está cadastrado
- Consultar lista no portal da prefeitura

### Erro: "Timeout"
- Verificar conexão com internet
- Prefeitura pode estar offline

## 📞 Suporte

Em caso de dúvidas sobre integração:
- Prefeitura de Pomerode: (47) 3387-7271
- Email: [email protected]

## 📄 Licença

MIT License - Uso livre para fins comerciais

---

**Desenvolvido com ❤️ para dentistas brasileiros**
