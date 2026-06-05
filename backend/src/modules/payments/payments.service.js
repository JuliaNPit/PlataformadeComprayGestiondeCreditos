const { PrismaClient } = require('@prisma/client');
const { simularPago } = require('../../adapters/paymentGateway.adapter');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

const PRECIOS = {
  1: 4500,
  5: 21000,
  10: 40000,
  20: 75000
};

const iniciarCompra = async (usuarioId, { cantidadCreditos, metodo }) => {
  const metodosValidos = ['PSE', 'NEQUI', 'TARJETA'];
  if (!metodosValidos.includes(metodo)) {
    throw new Error('Método de pago no válido. Use: PSE, NEQUI o TARJETA');
  }

  const precio = PRECIOS[cantidadCreditos];
  if (!precio) {
    throw new Error('Cantidad no válida. Opciones: 1, 5, 10, 20');
  }

  const transaccionId = uuidv4();

  await prisma.transaccion.create({
    data: {
      id: transaccionId,
      tipo: 'COMPRA',
      monto: cantidadCreditos,
      estado: 'PENDIENTE',
      descripcion: `Compra de ${cantidadCreditos} crédito(s) vía ${metodo}`,
      usuarioId,
      metadatos: JSON.stringify({ metodo, precioPesos: precio })
    }
  });

  const respuesta = await simularPago({ monto: precio, metodo, transaccionId });

  if (!respuesta.aprobado) {
    await prisma.transaccion.update({
      where: { id: transaccionId },
      data: { estado: 'FALLIDA' }
    });
    throw new Error(respuesta.mensaje);
  }

  const [, wallet] = await prisma.$transaction([
    prisma.transaccion.update({
      where: { id: transaccionId },
      data: { estado: 'COMPLETADA' }
    }),
    prisma.wallet.update({
      where: { usuarioId },
      data: { saldo: { increment: cantidadCreditos } }
    })
  ]);

  return {
    transaccionId,
    creditosComprados: cantidadCreditos,
    precioPagado: precio,
    metodo,
    nuevoSaldo: wallet.saldo,
    estado: 'COMPLETADA'
  };
};

const obtenerOpciones = () => {
  return Object.entries(PRECIOS).map(([creditos, precio]) => ({
    creditos: parseInt(creditos),
    precio,
    descripcion: `${creditos} crédito(s) — $${precio.toLocaleString('es-CO')}`
  }));
};

module.exports = { iniciarCompra, obtenerOpciones };