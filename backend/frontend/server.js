// ==================== BACKEND NFSE - INTEGRAÇÃO POMERODE ====================
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const nfseRoutes = require('./routes/nfse');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ===== MIDDLEWARES =====
app.use(cors());
app.use(express.json());

// ===== LOGGING =====
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// ===== ROTAS =====
app.get('/', (req, res) => {
    res.json({
        message: 'Backend NFSe - Integração Pomerode/SC',
        version: '1.0.0',
        status: 'online',
        endpoints: {
            emitir: 'POST /api/nfse/emitir',
            consultar: 'GET /api/nfse/consultar/:numero',
            cancelar: 'POST /api/nfse/cancelar',
            status: 'GET /api/nfse/status'
        }
    });
});

app.use('/api/nfse', nfseRoutes);

// ===== HEALTH CHECK =====
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ===== ERROR HANDLER =====
app.use((err, req, res, next) => {
    console.error('Erro:', err);
    res.status(500).json({
        success: false,
        erro: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// ===== START SERVER =====
app.listen(PORT, () => {
    console.log(`🚀 Backend NFSe rodando na porta ${PORT}`);
    console.log(`📍 http://localhost:${PORT}`);
    console.log(`✅ Pronto para emitir notas em Pomerode-SC!`);
});

module.exports = app;
