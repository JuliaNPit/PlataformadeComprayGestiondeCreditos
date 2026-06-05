const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middlewares/auth.middleware');
const notificationsController = require('./notifications.controller');

router.use(authMiddleware);

router.get('/', notificationsController.obtenerMisNotificaciones);
router.put('/:id/leer', notificationsController.marcarLeida);
router.put('/leer/todas', notificationsController.marcarTodasLeidas);

module.exports = router;