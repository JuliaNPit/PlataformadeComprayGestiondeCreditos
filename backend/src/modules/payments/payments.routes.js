const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middlewares/auth.middleware');
const paymentsController = require('./payments.controller');

router.use(authMiddleware);

router.get('/opciones', paymentsController.obtenerOpciones);
router.post('/iniciar', paymentsController.iniciarCompra);

module.exports = router;