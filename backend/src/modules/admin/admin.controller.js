const adminService = require('./admin.service');

const obtenerMetricas = async (req, res) => {
  try {
    const metricas = await adminService.obtenerMetricas();
    res.json({ metricas });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await adminService.obtenerUsuarios();
    res.json({ usuarios });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const obtenerTransacciones = async (req, res) => {
  try {
    const transacciones = await adminService.obtenerTransacciones();
    res.json({ transacciones });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const toggleUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await adminService.toggleUsuario(id);
    res.json({ mensaje: `Usuario ${usuario.activo ? 'activado' : 'desactivado'}`, usuario });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { obtenerMetricas, obtenerUsuarios, obtenerTransacciones, toggleUsuario };