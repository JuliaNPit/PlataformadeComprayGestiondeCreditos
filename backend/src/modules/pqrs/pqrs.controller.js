const pqrsService = require('./pqrs.service');

const crearTicket = async (req, res) => {
  try {
    const { type, title, description } = req.body;
    const ticket = await pqrsService.crearTicket(req.user.userId, { type, title, description });
    res.status(201).json({ mensaje: 'Ticket creado exitosamente', ticket });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const obtenerMisTickets = async (req, res) => {
  try {
    const tickets = await pqrsService.obtenerMisTickets(req.user.userId);
    res.json({ tickets });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const obtenerTicketPorId = async (req, res) => {
  try {
    const ticket = await pqrsService.obtenerTicketPorId(req.user.userId, req.params.id);
    res.json({ ticket });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

// Admin
const obtenerTodosLosTickets = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Acceso denegado' });
    const tickets = await pqrsService.obtenerTodosLosTickets();
    res.json({ tickets });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const responderTicket = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Acceso denegado' });
    const { message, status } = req.body;
    const ticket = await pqrsService.responderTicket(req.params.id, { message, status });
    res.json({ mensaje: 'Ticket actualizado', ticket });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { crearTicket, obtenerMisTickets, obtenerTicketPorId, obtenerTodosLosTickets, responderTicket };