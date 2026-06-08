const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middlewares/auth.middleware');
const pqrsController = require('./pqrs.controller');

router.use(authMiddleware);

router.post('/', pqrsController.crearTicket);
router.get('/', pqrsController.obtenerMisTickets);

router.get('/admin/todos', pqrsController.obtenerTodosLosTickets);
router.patch('/:id/responder', pqrsController.responderTicket);

router.get('/:id', pqrsController.obtenerTicketPorId);

module.exports = router;
