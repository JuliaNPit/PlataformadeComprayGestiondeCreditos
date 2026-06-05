const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middlewares/auth.middleware');
const adminController = require('./admin.controller');

router.use(authMiddleware);

// Solo admins — el middleware ya verifica el token,
// aquí verificamos el rol
router.use((req, res, next) => {
  if (req.usuario.rol !== 'ADMIN') {
    return res.status(403).json({ error: 'Acceso restringido a administradores' });
  }
  next();
});

router.get('/metricas', adminController.obtenerMetricas);
router.get('/usuarios', adminController.obtenerUsuarios);
router.get('/transacciones', adminController.obtenerTransacciones);
router.patch('/usuarios/:id/toggle', adminController.toggleUsuario);

module.exports = router;