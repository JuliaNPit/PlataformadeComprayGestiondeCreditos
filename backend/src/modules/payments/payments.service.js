const { PrismaClient } = require('@prisma/client');
const { simularPago } = require('../../adapters/paymentGateway.adapter');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();
const PRECIOS = { 1: 4500, 5: 21000, 10: 40000, 20: 75000 };

const iniciarCompra = async (userId, { cantidadCreditos, metodo }) => {
  const metodosValidos = ['PSE', 'NEQUI', 'TARJETA'];
  if (!metodosValidos.includes(metodo)) {
    throw new Error('Método de pago no válido. Use: PSE, NEQUI o TARJETA');
  }
  const precio = PRECIOS[cantidadCreditos];
  if (!precio) throw new Error('Cantidad no válida. Opciones: 1, 5, 10, 20');

  const transaccionId = uuidv4();

  await prisma.payment.create({
    data: { id: transaccionId, userId, amount: precio, credits: cantidadCreditos, method: metodo, status: 'PENDING' }
  });

  const respuesta = await simularPago({ monto: precio, metodo, transaccionId });

  if (!respuesta.aprobado) {
    await prisma.payment.update({ where: { id: transaccionId }, data: { status: 'REJECTED' } });
    throw new Error(respuesta.mensaje);
  }

  const [, walletActualizado] = await prisma.$transaction([
    prisma.payment.update({ where: { id: transaccionId }, data: { status: 'APPROVED' } }),
    prisma.wallet.update({ where: { userId }, data: { balance: { increment: cantidadCreditos } } })
  ]);

  return { transaccionId, creditosComprados: cantidadCreditos, precioPagado: precio, metodo, nuevoSaldo: walletActualizado.balance, estado: 'APROBADO' };
};

const obtenerOpciones = () => {
  return Object.entries(PRECIOS).map(([creditos, precio]) => ({
    creditos: parseInt(creditos),
    precio,
    descripcion: `${creditos} crédito(s) — $${precio.toLocaleString('es-CO')}`
  }));
};

module.exports = { iniciarCompra, obtenerOpciones };
