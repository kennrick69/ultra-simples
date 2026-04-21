// ==================== ROTAS NFSE ====================
const express = require('express');
const router = express.Router();
const nfseController = require('../controllers/nfseController');

// ===== EMITIR NOTA =====
router.post('/emitir', nfseController.emitirNota);

// ===== CONSULTAR NOTA =====
router.get('/consultar/:numero', nfseController.consultarNota);

// ===== CANCELAR NOTA =====
router.post('/cancelar', nfseController.cancelarNota);

// ===== TESTAR CONEXÃO =====
router.get('/status', nfseController.testarConexao);

// ===== VALIDAR CREDENCIAIS =====
router.post('/validar-credenciais', nfseController.validarCredenciais);

module.exports = router;
