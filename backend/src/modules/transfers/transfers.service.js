const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const transferir = async (senderUserId, { destinatarioCode, cantidad }) => {
  if (!destinatarioCode || !cantidad) {
    throw new Error('Código del destinatario y cantidad son obligatorios');
  }
  if (cantidad <= 0) {
    throw new Error('La cantidad debe ser mayor a cero');
  }

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

  const result = await prisma.$transaction(async (tx) => {
    // Descontar al remitente
    await tx.wallet.update({
      where: { userId: senderUserId },
      data: { balance: { decrement: cantidad } }
    });

    // Sumar al destinatario
    await tx.wallet.update({
      where: { userId: destinatario.id },
      data: { balance: { increment: cantidad } }
    });

    // Crear el registro Transfer
    const transfer = await tx.transfer.create({
      data: {
        senderId: senderUserId,
        receiverId: destinatario.id,
        amount: cantidad,
        status: 'COMPLETED'
      }
    });

    // Transacción del remitente
    await tx.transaction.create({
      data: {
        type: 'TRANSFER_SENT',
        amount: cantidad,
        status: 'COMPLETED',
        walletId: senderWallet.id,
        transferId: transfer.id,
        description: `Transferencia enviada de ${cantidad} crédito(s) a ${destinatario.name}`
      }
    });

    // Transacción del destinatario
    await tx.transaction.create({
      data: {
        type: 'TRANSFER_RECEIVED',
        amount: cantidad,
        status: 'COMPLETED',
        walletId: destinatario.wallet.id,
        transferId: transfer.id,
        description: `Transferencia recibida de ${cantidad} crédito(s)`
      }
    });

    return transfer;
  });

  return {
    mensaje: 'Transferencia realizada exitosamente',
    transaccionId: result.id,
    cantidad,
    destinatario: { nombre: destinatario.name, code: destinatario.code }
  };
};

module.exports = { transferir };