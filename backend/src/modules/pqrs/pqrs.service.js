const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const generarNumeroTicket = () => {
  const fecha = new Date();
  const año = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `UPTC-${año}${mes}-${random}`;
};

const crearTicket = async (userId, { type, title, description }) => {
  const tiposValidos = ['PETICION', 'QUEJA', 'RECLAMO', 'SUGERENCIA'];
  if (!tiposValidos.includes(type)) {
    throw new Error('Tipo no válido. Use: PETICION, QUEJA, RECLAMO o SUGERENCIA');
  }
  if (!title || !description) {
    throw new Error('El título y la descripción son obligatorios');
  }

  const ticketNumber = generarNumeroTicket();

  return await prisma.pQRS.create({
    data: { ticketNumber, type, title, description, status: 'ABIERTO', userId }
  });
};

const obtenerMisTickets = async (userId) => {
  return await prisma.pQRS.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
};

const obtenerTicketPorId = async (userId, ticketId) => {
  const ticket = await prisma.pQRS.findUnique({ where: { id: ticketId } });
  if (!ticket) throw new Error('Ticket no encontrado');
  if (ticket.userId !== userId) throw new Error('No tienes permiso para ver este ticket');
  return ticket;
};

module.exports = { crearTicket, obtenerMisTickets, obtenerTicketPorId };