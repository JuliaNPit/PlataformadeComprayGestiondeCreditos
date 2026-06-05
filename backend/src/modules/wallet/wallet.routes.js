const express = require('express');
const router = express.Router();
const walletController = require('./wallet.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

// Todas las rutas de wallet requieren autenticación
router.use(authMiddleware);

// GET /api/wallet/saldo
router.get('/saldo', walletController.getSaldo);

// GET /api/wallet/historial
router.get('/historial', walletController.getHistorial);

module.exports = router;