const { PrismaClient } = require('@prisma/client');
const { crearNotificacion } = require('../notifications/notifications.service');
const { enviarEmail, templates } = require('../notifications/emailaws.service');
const { enviarSMS, templatesSMS } = require('../notifications/smsaws.service'); // <--- Importamos SMS

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
  crearNotificacion(userId, {
    type: 'PURCHASE_COMPLETED',
    title: 'Compra exitosa',
    message: `Compraste ${cantidadCreditos} crédito(s). Nuevo saldo: ${nuevoSaldo}`
  }).catch(() => {});

  // 📧 Notificación Email (AWS SES)
  if (user.email) {
    const { subject, html } = templates.compraCreditosExitosa({
      nombre: user.name, creditos: cantidadCreditos, precio, metodo, nuevoSaldo
    });
    enviarEmail({ to: user.email, subject, html }).catch(() => {});
  }

  // 📱 Notificación SMS (AWS SNS)
  if (user.phone) {
    const mensajeSMS = templatesSMS.compraExitosa(cantidadCreditos, nuevoSaldo);
    enviarSMS({ telefono: user.phone, mensaje: mensajeSMS }).catch(() => {});
  }

  return { creditosComprados: cantidadCreditos, precioPagado: precio, metodo, nuevoSaldo };
};

module.exports = { obtenerOpciones, iniciarCompra };