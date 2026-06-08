const { PrismaClient } = require('@prisma/client');
const { enviarEmail, templates } = require('../notifications/email.service');
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
  if (!tiposValidos.includes(type)) throw new Error('Tipo no válido');
  if (!title || !description) throw new Error('El título y la descripción son obligatorios');
  const ticketNumber = generarNumeroTicket();
  return await prisma.pQRS.create({
    data: { ticketNumber, type, title, description, status: 'ABIERTO', userId }
  });
};

const obtenerMisTickets = async (userId) => {
  return await prisma.pQRS.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { updates: { orderBy: { createdAt: 'asc' } } }
  });
};

const obtenerTicketPorId = async (userId, ticketId) => {
  const ticket = await prisma.pQRS.findUnique({
    where: { id: ticketId },
    include: { updates: { orderBy: { createdAt: 'asc' } } }
  });
  if (!ticket) throw new Error('Ticket no encontrado');
  if (ticket.userId !== userId) throw new Error('No tienes permiso para ver este ticket');
  return ticket;
};

const obtenerTodosLosTickets = async () => {
  return await prisma.pQRS.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, code: true, email: true } },
      updates: { orderBy: { createdAt: 'asc' } }
    }
  });
};

const responderTicket = async (ticketId, { message, status }) => {
  const estadosValidos = ['ABIERTO', 'EN_REVISION', 'RESUELTO', 'CERRADO'];
  if (!estadosValidos.includes(status)) throw new Error('Estado no válido');
  if (!message) throw new Error('El mensaje es obligatorio');

  const ticketActual = await prisma.pQRS.findUnique({
    where: { id: ticketId },
    include: { user: true }
  });
  if (!ticketActual) throw new Error('Ticket no encontrado');

  const [, ticket] = await prisma.$transaction([
    prisma.pQRSUpdate.create({
      data: { pqrsId: ticketId, message, status }
    }),
    prisma.pQRS.update({
      where: { id: ticketId },
      data: {
        status,
        resolvedAt: status === 'RESUELTO' || status === 'CERRADO' ? new Date() : null
      },
      include: { updates: { orderBy: { createdAt: 'asc' } } }
    })
  ]);

  // Email al estudiante
  if (ticketActual.user?.email) {
    const { subject, html } = templates.ticketActualizado({
      nombre: ticketActual.user.name,
      ticketNumber: ticketActual.ticketNumber,
      titulo: ticketActual.title,
      nuevoEstado: status,
      mensaje: message
    });
    await enviarEmail({ to: ticketActual.user.email, subject, html });
  }

  return ticket;
};

module.exports = { crearTicket, obtenerMisTickets, obtenerTicketPorId, obtenerTodosLosTickets, responderTicket };
