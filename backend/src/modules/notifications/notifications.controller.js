const notificationsService = require('./notifications.service');

const obtenerMisNotificaciones = async (req, res) => {
  try {
    const notificaciones = await notificationsService.obtenerMisNotificaciones(req.user.userId);
    res.json({ notificaciones });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const marcarLeida = async (req, res) => {
  try {
    const notif = await notificationsService.marcarLeida(req.user.userId, req.params.id);
    res.json({ mensaje: 'Notificación marcada como leída', notif });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const marcarTodasLeidas = async (req, res) => {
  try {
    await notificationsService.marcarTodasLeidas(req.user.userId);
    res.json({ mensaje: 'Todas las notificaciones marcadas como leídas' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { obtenerMisNotificaciones, marcarLeida, marcarTodasLeidas };
