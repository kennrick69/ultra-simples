// ==================== SERVIÇO IPM - INTEGRAÇÃO COM PREFEITURA ====================
const axios = require('axios');
const xml2js = require('xml2js');

// ===== CONFIGURAÇÕES =====
const IPM_CONFIG = {
    // URL do webservice de Pomerode
    url_producao: 'https://nfse-pomerode.atende.net/?pg=rest&service=WNERestServiceNFSe',
    url_homologacao: 'https://nfse-pomerode.atende.net/?pg=rest&service=WNERestServiceNFSe',
    codigo_municipio: '4213203', // Código IBGE de Pomerode-SC
    timeout: 30000 // 30 segundos
};

// ===== BUILDERS XML =====
const xmlBuilder = new xml2js.Builder({
    headless: true,
    renderOpts: { pretty: false }
});

const xmlParser = new xml2js.Parser({
    explicitArray: false,
    ignoreAttrs: true
});

// ===== EMITIR NOTA =====
exports.emitirNota = async (dadosNota, usuario, senha) => {
    try {
        console.log('📝 Montando XML para emissão...');
        
        // Gerar número de RPS (pode ser timestamp ou sequencial)
        const numeroRps = Date.now().toString().slice(-8);
        const serieRps = '1';
        
        // Montar XML no formato IPM
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<GerarNfseEnvio xmlns="http://www.abrasf.org.br/nfse.xsd">
    <Rps>
        <InfDeclaracaoPrestacaoServico>
            <Rps>
                <IdentificacaoRps>
                    <Numero>${numeroRps}</Numero>
                    <Serie>${serieRps}</Serie>
                    <Tipo>1</Tipo>
                </IdentificacaoRps>
                <DataEmissao>${new Date().toISOString().split('T')[0]}</DataEmissao>
                <Status>1</Status>
            </Rps>
            <Competencia>${new Date().toISOString().split('T')[0]}</Competencia>
            <Servico>
                <Valores>
                    <ValorServicos>${dadosNota.servico.valor_servicos.toFixed(2)}</ValorServicos>
                    <IssRetido>2</IssRetido>
                    <ValorIss>0</ValorIss>
                    <BaseCalculo>${dadosNota.servico.valor_servicos.toFixed(2)}</BaseCalculo>
                    <Aliquota>${dadosNota.servico.aliquota_iss}</Aliquota>
                    <ValorLiquidoNfse>${dadosNota.servico.valor_servicos.toFixed(2)}</ValorLiquidoNfse>
                </Valores>
                <IssRetido>2</IssRetido>
                <ItemListaServico>${dadosNota.servico.codigo_servico}</ItemListaServico>
                <CodigoTributacaoMunicipio>${dadosNota.servico.codigo_servico}</CodigoTributacaoMunicipio>
                <Discriminacao>${dadosNota.servico.descricao}</Discriminacao>
                <CodigoMunicipio>${IPM_CONFIG.codigo_municipio}</CodigoMunicipio>
            </Servico>
            <Prestador>
                <CpfCnpj>
                    <Cnpj>${dadosNota.prestador.cnpj}</Cnpj>
                </CpfCnpj>
                <InscricaoMunicipal>${dadosNota.prestador.inscricao_municipal}</InscricaoMunicipal>
            </Prestador>
            <Tomador>
                <IdentificacaoTomador>
                    <CpfCnpj>
                        ${dadosNota.tomador.cpf_cnpj.length === 11 
                            ? `<Cpf>${dadosNota.tomador.cpf_cnpj}</Cpf>`
                            : `<Cnpj>${dadosNota.tomador.cpf_cnpj}</Cnpj>`
                        }
                    </CpfCnpj>
                </IdentificacaoTomador>
                <RazaoSocial>${dadosNota.tomador.razao_social}</RazaoSocial>
            </Tomador>
        </InfDeclaracaoPrestacaoServico>
    </Rps>
</GerarNfseEnvio>`;
        
        console.log('🌐 Enviando requisição para prefeitura...');
        
        // Enviar para o webservice
        const response = await axios.post(
            IPM_CONFIG.url_producao,
            xml,
            {
                headers: {
                    'Content-Type': 'text/xml; charset=utf-8',
                    'SOAPAction': 'GerarNfse',
                    'Authorization': 'Basic ' + Buffer.from(`${usuario}:${senha}`).toString('base64')
                },
                timeout: IPM_CONFIG.timeout
            }
        );
        
        console.log('📥 Resposta recebida da prefeitura');
        
        // Parsear resposta XML
        const resultado = await xmlParser.parseStringPromise(response.data);
        
        // Verificar se houve erro
        if (resultado.GerarNfseResposta?.ListaMensagemRetorno) {
            const erro = resultado.GerarNfseResposta.ListaMensagemRetorno.MensagemRetorno;
            throw new Error(`Erro da prefeitura: ${erro.Mensagem} (Código: ${erro.Codigo})`);
        }
        
        // Extrair dados da nota emitida
        const nfse = resultado.GerarNfseResposta?.Nfse;
        
        if (!nfse) {
            throw new Error('Resposta inválida da prefeitura');
        }
        
        return {
            numero_nota: nfse.InfNfse?.Numero || 'N/A',
            codigo_verificacao: nfse.InfNfse?.CodigoVerificacao || null,
            data_emissao: nfse.InfNfse?.DataEmissao || new Date().toISOString(),
            numero_rps: numeroRps,
            serie_rps: serieRps,
            xml_completo: response.data
        };
        
    } catch (error) {
        console.error('❌ Erro no serviço IPM:', error.message);
        
        if (error.response) {
            // Erro da API
            throw new Error(`Erro da prefeitura: ${error.response.status} - ${error.response.statusText}`);
        } else if (error.request) {
            // Erro de rede
            throw new Error('Erro de conexão com a prefeitura. Verifique sua internet.');
        } else {
            // Outro erro
            throw error;
        }
    }
};

// ===== CONSULTAR NOTA =====
exports.consultarNota = async (numeroNota, inscricaoMunicipal, usuario, senha) => {
    try {
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ConsultarNfseEnvio xmlns="http://www.abrasf.org.br/nfse.xsd">
    <Prestador>
        <InscricaoMunicipal>${inscricaoMunicipal}</InscricaoMunicipal>
    </Prestador>
    <NumeroNfse>${numeroNota}</NumeroNfse>
</ConsultarNfseEnvio>`;
        
        const response = await axios.post(
            IPM_CONFIG.url_producao,
            xml,
            {
                headers: {
                    'Content-Type': 'text/xml; charset=utf-8',
                    'SOAPAction': 'ConsultarNfse',
                    'Authorization': 'Basic ' + Buffer.from(`${usuario}:${senha}`).toString('base64')
                },
                timeout: IPM_CONFIG.timeout
            }
        );
        
        const resultado = await xmlParser.parseStringPromise(response.data);
        
        return {
            nota: resultado.ConsultarNfseResposta?.Nfse || null,
            xml_completo: response.data
        };
        
    } catch (error) {
        throw new Error(`Erro ao consultar nota: ${error.message}`);
    }
};

// ===== CANCELAR NOTA =====
exports.cancelarNota = async (numeroNota, motivoCancelamento, inscricaoMunicipal, usuario, senha) => {
    try {
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<CancelarNfseEnvio xmlns="http://www.abrasf.org.br/nfse.xsd">
    <Pedido>
        <InfPedidoCancelamento>
            <IdentificacaoNfse>
                <Numero>${numeroNota}</Numero>
                <Prestador>
                    <InscricaoMunicipal>${inscricaoMunicipal}</InscricaoMunicipal>
                </Prestador>
            </IdentificacaoNfse>
            <CodigoCancelamento>1</CodigoCancelamento>
        </InfPedidoCancelamento>
    </Pedido>
</CancelarNfseEnvio>`;
        
        const response = await axios.post(
            IPM_CONFIG.url_producao,
            xml,
            {
                headers: {
                    'Content-Type': 'text/xml; charset=utf-8',
                    'SOAPAction': 'CancelarNfse',
                    'Authorization': 'Basic ' + Buffer.from(`${usuario}:${senha}`).toString('base64')
                },
                timeout: IPM_CONFIG.timeout
            }
        );
        
        const resultado = await xmlParser.parseStringPromise(response.data);
        
        return {
            cancelado: true,
            data_cancelamento: new Date().toISOString(),
            xml_completo: response.data
        };
        
    } catch (error) {
        throw new Error(`Erro ao cancelar nota: ${error.message}`);
    }
};

// ===== TESTAR CONEXÃO =====
exports.testarConexao = async (usuario, senha) => {
    try {
        // Fazer uma requisição simples para verificar conexão
        const response = await axios.get(
            IPM_CONFIG.url_producao.replace('?pg=rest&service=WNERestServiceNFSe', ''),
            {
                headers: {
                    'Authorization': 'Basic ' + Buffer.from(`${usuario}:${senha}`).toString('base64')
                },
                timeout: 10000
            }
        );
        
        return {
            online: true,
            servidor: 'Pomerode-SC (IPM)',
            timestamp: new Date().toISOString()
        };
        
    } catch (error) {
        throw new Error('Não foi possível conectar com a prefeitura');
    }
};

// ===== VALIDAR CREDENCIAIS =====
exports.validarCredenciais = async (usuario, senha) => {
    try {
        await exports.testarConexao(usuario, senha);
        return true;
    } catch (error) {
        return false;
    }
};

module.exports = exports;
