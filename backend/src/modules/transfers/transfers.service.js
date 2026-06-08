const { PrismaClient } = require('@prisma/client');
const { enviarEmail, templates } = require('../notifications/emailaws.service');
const { enviarSMS, templatesSMS } = require('../notifications/smsaws.service'); // <--- Importamos SMS
const prisma = new PrismaClient();

const transferir = async (senderUserId, { destinatarioCode, cantidad }) => {
  if (!destinatarioCode || !cantidad) throw new Error('Código del destinatario y cantidad son obligatorios');
  if (cantidad <= 0) throw new Error('La cantidad debe ser mayor a cero');

  const destinatario = await prisma.user.findUnique({
    where: { code: destinatarioCode },
    include: { wallet: true }
  });
  if (!destinatario) throw new Error('El destinatario no existe en el sistema');
  if (!destinatario.isActive) throw new Error('El destinatario no es un estudiante activo');
  if (destinatario.id === senderUserId) throw new Error('No puedes transferirte créditos a ti mismo');

  const senderWallet = await prisma.wallet.findUnique({ where: { userId: senderUserId } });
  if (!senderWallet) throw new Error('Billetera del remitente no encontrada');
  if (senderWallet.balance < cantidad) throw new Error('Saldo insuficiente para realizar la transferencia');

  const sender = await prisma.user.findUnique({ where: { id: senderUserId } });

  const result = await prisma.$transaction(async (tx) => {
    await tx.wallet.update({ where: { userId: senderUserId }, data: { balance: { decrement: cantidad } } });
    await tx.wallet.update({ where: { userId: destinatario.id }, data: { balance: { increment: cantidad } } });
    const transfer = await tx.transfer.create({
      data: { senderId: senderUserId, receiverId: destinatario.id, amount: cantidad, status: 'COMPLETED' }
    });
    await tx.transaction.create({
      data: { type: 'TRANSFER_SENT', amount: cantidad, status: 'COMPLETED', walletId: senderWallet.id, transferId: transfer.id, description: `Transferencia enviada de ${cantidad} crédito(s) a ${destinatario.name}` }
    });
    await tx.transaction.create({
      data: { type: 'TRANSFER_RECEIVED', amount: cantidad, status: 'COMPLETED', walletId: destinatario.wallet.id, transferId: transfer.id, description: `Transferencia recibida de ${cantidad} crédito(s)` }
    });
    return transfer;
  });

  const senderSaldoNuevo = senderWallet.balance - cantidad;
  const destinatarioSaldoNuevo = destinatario.wallet.balance + cantidad;

  // ==========================================
  // NOTIFICACIONES AL REMITENTE (QUIEN ENVÍA)
  // ==========================================
  if (sender?.email) {
    const { subject, html } = templates.transferenciaEnviada({
      nombre: sender.name, destinatario: destinatario.name, cantidad, nuevoSaldo: senderSaldoNuevo
    });
    enviarEmail({ to: sender.email, subject, html }).catch(() => {});
  }
  // Notificación SMS no incluida para quien envía en las templates, pero si quieres puedes agregarla después.

  // ==========================================
  // NOTIFICACIONES AL DESTINATARIO (QUIEN RECIBE)
  // ==========================================
  if (destinatario?.email) {
    const { subject, html } = templates.transferenciaRecibida({
      nombre: destinatario.name, remitente: sender.name, cantidad, nuevoSaldo: destinatarioSaldoNuevo
    });
    enviarEmail({ to: destinatario.email, subject, html }).catch(() => {});
  }
  
  if (destinatario?.phone) {
    const mensajeSMS = templatesSMS.transferenciaRecibida(cantidad, sender.name);
    enviarSMS({ telefono: destinatario.phone, mensaje: mensajeSMS }).catch(() => {});
  }

  return {
    mensaje: 'Transferencia realizada exitosamente',
    transaccionId: result.id,
    cantidad,
    destinatario: { nombre: destinatario.name, code: destinatario.code }
  };
};

module.exports = { transferir };