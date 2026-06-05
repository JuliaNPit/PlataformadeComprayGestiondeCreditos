const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const obtenerMetricas = async () => {
  const [totalUsuarios, totalTransacciones, transaccionesHoy, creditosEnCirculacion] = await Promise.all([
    prisma.user.count(),
    prisma.payment.count(),
    prisma.payment.count({
      where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } }
    }),
    prisma.wallet.aggregate({ _sum: { balance: true } })
  ]);

  return {
    totalUsuarios,
    totalTransacciones,
    transaccionesHoy,
    creditosEnCirculacion: creditosEnCirculacion._sum.balance || 0
  };
};

const obtenerUsuarios = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      code: true,
      role: true,
      isActive: true,
      createdAt: true,
      wallet: { select: { balance: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
};

const obtenerTransacciones = async () => {
  return await prisma.payment.findMany({
    include: {
      user: { select: { name: true, code: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 100
  });
};

const toggleUsuario = async (usuarioId) => {
  const usuario = await prisma.user.findUnique({ where: { id: usuarioId } });
  if (!usuario) throw new Error('Usuario no encontrado');

  return await prisma.user.update({
    where: { id: usuarioId },
    data: { isActive: !usuario.isActive }
  });
};

module.exports = { obtenerMetricas, obtenerUsuarios, obtenerTransacciones, toggleUsuario };