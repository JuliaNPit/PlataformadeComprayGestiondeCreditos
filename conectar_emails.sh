#!/bin/bash
MODULES="$HOME/Documents/proyectos/PlataformadeComprayGestiondeCreditos/backend/src/modules"

# 1. Copiar email.service.js a notifications
cp "$(dirname "$0")/email.service.js" "$MODULES/notifications/email.service.js"
echo "✅ email.service.js copiado"

# 2. payments.service.js — agregar email al confirmar compra
cat > "$MODULES/payments/payments.service.js" << 'JSEOF'
const { PrismaClient } = require('@prisma/client');
const { crearNotificacion } = require('../notifications/notifications.service');
const { enviarEmail, templates } = require('../notifications/email.service');
const prisma = new PrismaClient();

const PRECIOS = { 1: 32500, 2: 65000, 3: 97500, 5: 162500, 10: 325000 };

const obtenerOpciones = () => {
  return Object.entries(PRECIOS).map(([creditos, precio]) => ({
    creditos: Number(creditos), precio
  }));
};

const iniciarCompra = async (userId, { cantidadCreditos, metodo }) => {
  const metodosValidos = ['NEQUI', 'PSE', 'TARJETA'];
  if (!metodosValidos.includes(metodo)) throw new Error('Método de pago no válido');
  const precio = PRECIOS[cantidadCreditos];
  if (!precio) throw new Error('Cantidad de créditos no válida');

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { wallet: true }
  });
  if (!user) throw new Error('Usuario no encontrado');
  if (!user.isActive) throw new Error('Tu cuenta está inactiva');

  const [payment, wallet] = await prisma.$transaction([
    prisma.payment.create({
      data: { userId, credits: cantidadCreditos, amount: precio, method: metodo, status: 'APPROVED' }
    }),
    prisma.wallet.update({
      where: { userId },
      data: { balance: { increment: cantidadCreditos } }
    }),
    prisma.transaction.create({
      data: { walletId: (await prisma.wallet.findUnique({ where: { userId } })).id, type: 'PURCHASE', amount: cantidadCreditos, description: `Compra de ${cantidadCreditos} crédito(s) vía ${metodo}` }
    })
  ]);

  const nuevoSaldo = wallet.balance;

  // Notificación en BD
  await crearNotificacion(userId, {
    type: 'PAYMENT',
    title: 'Compra exitosa',
    message: `Compraste ${cantidadCreditos} crédito(s). Nuevo saldo: ${nuevoSaldo}`
  }).catch(() => {});

  // Email
  if (user.email) {
    const { subject, html } = templates.compraCreditosExitosa({
      nombre: user.name,
      creditos: cantidadCreditos,
      precio,
      metodo,
      nuevoSaldo
    });
    await enviarEmail({ to: user.email, subject, html });
  }

  return { creditosComprados: cantidadCreditos, precioPagado: precio, metodo, nuevoSaldo };
};

module.exports = { obtenerOpciones, iniciarCompra };
JSEOF
echo "✅ payments.service.js actualizado"

# 3. pqrs.service.js — agregar email al responder ticket
cat > "$MODULES/pqrs/pqrs.service.js" << 'JSEOF'
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
JSEOF
echo "✅ pqrs.service.js actualizado con email"

echo ""
echo "✅ Todo listo. Reinicia el backend: node src/index.js"
