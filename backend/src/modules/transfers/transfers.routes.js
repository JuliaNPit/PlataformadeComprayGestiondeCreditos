const express = require('express');
const router = express.Router();
const transfersController = require('./transfers.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// POST /api/transfers
router.post('/', transfersController.transferir);

module.exports = router;