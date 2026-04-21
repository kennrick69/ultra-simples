// ==================== CONTROLLER NFSE ====================
const ipmService = require('../services/ipmService');

// ===== EMITIR NOTA =====
exports.emitirNota = async (req, res) => {
    try {
        console.log('📤 Recebendo requisição para emitir nota...');
        
        const {
            // Credenciais da prefeitura
            usuario_prefeitura,
            senha_prefeitura,
            
            // Dados do prestador (dentista)
            cnpj,
            inscricao_municipal,
            razao_social,
            
            // Dados do serviço
            descricao,
            valor_servicos,
            codigo_servico,
            aliquota_iss,
            
            // Dados do tomador (paciente)
            tomador
        } = req.body;
        
        // Validação básica
        if (!usuario_prefeitura || !senha_prefeitura) {
            return res.status(400).json({
                success: false,
                erro: 'Credenciais da prefeitura são obrigatórias'
            });
        }
        
        if (!cnpj || !inscricao_municipal) {
            return res.status(400).json({
                success: false,
                erro: 'CNPJ e Inscrição Municipal são obrigatórios'
            });
        }
        
        if (!descricao || !valor_servicos || !codigo_servico) {
            return res.status(400).json({
                success: false,
                erro: 'Descrição, valor e código do serviço são obrigatórios'
            });
        }
        
        // Montar dados da nota
        const dadosNota = {
            prestador: {
                cnpj: cnpj.replace(/\D/g, ''),
                inscricao_municipal,
                razao_social
            },
            servico: {
                descricao,
                valor_servicos: parseFloat(valor_servicos),
                codigo_servico,
                aliquota_iss: aliquota_iss || 3.5
            },
            tomador: {
                cpf_cnpj: tomador.cpf_cnpj?.replace(/\D/g, ''),
                razao_social: tomador.razao_social || tomador.nome,
                endereco: tomador.endereco
            }
        };
        
        console.log('📝 Dados da nota preparados');
        
        // Emitir nota via serviço IPM
        const resultado = await ipmService.emitirNota(
            dadosNota,
            usuario_prefeitura,
            senha_prefeitura
        );
        
        console.log('✅ Nota emitida com sucesso!');
        
        res.json({
            success: true,
            mensagem: 'Nota emitida com sucesso!',
            ...resultado
        });
        
    } catch (error) {
        console.error('❌ Erro ao emitir nota:', error);
        
        res.status(500).json({
            success: false,
            erro: error.message,
            detalhes: error.detalhes || null
        });
    }
};

// ===== CONSULTAR NOTA =====
exports.consultarNota = async (req, res) => {
    try {
        const { numero } = req.params;
        const { usuario_prefeitura, senha_prefeitura, inscricao_municipal } = req.query;
        
        if (!usuario_prefeitura || !senha_prefeitura) {
            return res.status(400).json({
                success: false,
                erro: 'Credenciais da prefeitura são obrigatórias'
            });
        }
        
        console.log(`🔍 Consultando nota ${numero}...`);
        
        const resultado = await ipmService.consultarNota(
            numero,
            inscricao_municipal,
            usuario_prefeitura,
            senha_prefeitura
        );
        
        res.json({
            success: true,
            ...resultado
        });
        
    } catch (error) {
        console.error('❌ Erro ao consultar nota:', error);
        
        res.status(500).json({
            success: false,
            erro: error.message
        });
    }
};

// ===== CANCELAR NOTA =====
exports.cancelarNota = async (req, res) => {
    try {
        const {
            numero_nota,
            motivo_cancelamento,
            usuario_prefeitura,
            senha_prefeitura,
            inscricao_municipal
        } = req.body;
        
        if (!usuario_prefeitura || !senha_prefeitura) {
            return res.status(400).json({
                success: false,
                erro: 'Credenciais da prefeitura são obrigatórias'
            });
        }
        
        if (!numero_nota) {
            return res.status(400).json({
                success: false,
                erro: 'Número da nota é obrigatório'
            });
        }
        
        console.log(`🗑️ Cancelando nota ${numero_nota}...`);
        
        const resultado = await ipmService.cancelarNota(
            numero_nota,
            motivo_cancelamento || 'Cancelamento solicitado',
            inscricao_municipal,
            usuario_prefeitura,
            senha_prefeitura
        );
        
        console.log('✅ Nota cancelada com sucesso!');
        
        res.json({
            success: true,
            mensagem: 'Nota cancelada com sucesso!',
            ...resultado
        });
        
    } catch (error) {
        console.error('❌ Erro ao cancelar nota:', error);
        
        res.status(500).json({
            success: false,
            erro: error.message
        });
    }
};

// ===== TESTAR CONEXÃO =====
exports.testarConexao = async (req, res) => {
    try {
        const { usuario_prefeitura, senha_prefeitura } = req.query;
        
        if (!usuario_prefeitura || !senha_prefeitura) {
            return res.status(400).json({
                success: false,
                erro: 'Credenciais da prefeitura são obrigatórias'
            });
        }
        
        console.log('🔌 Testando conexão com prefeitura...');
        
        const resultado = await ipmService.testarConexao(
            usuario_prefeitura,
            senha_prefeitura
        );
        
        res.json({
            success: true,
            mensagem: 'Conexão com prefeitura OK!',
            ...resultado
        });
        
    } catch (error) {
        console.error('❌ Erro ao testar conexão:', error);
        
        res.status(500).json({
            success: false,
            erro: error.message
        });
    }
};

// ===== VALIDAR CREDENCIAIS =====
exports.validarCredenciais = async (req, res) => {
    try {
        const { usuario_prefeitura, senha_prefeitura } = req.body;
        
        if (!usuario_prefeitura || !senha_prefeitura) {
            return res.status(400).json({
                success: false,
                erro: 'Usuário e senha são obrigatórios'
            });
        }
        
        console.log('🔑 Validando credenciais...');
        
        const valido = await ipmService.validarCredenciais(
            usuario_prefeitura,
            senha_prefeitura
        );
        
        if (valido) {
            res.json({
                success: true,
                mensagem: 'Credenciais válidas!'
            });
        } else {
            res.status(401).json({
                success: false,
                erro: 'Credenciais inválidas'
            });
        }
        
    } catch (error) {
        console.error('❌ Erro ao validar credenciais:', error);
        
        res.status(500).json({
            success: false,
            erro: error.message
        });
    }
};

module.exports = exports;
