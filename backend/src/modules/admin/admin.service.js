const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const obtenerMetricas = async () => {
  const [totalUsuarios, totalTransacciones, transaccionesHoy, creditosEnCirculacion] = await Promise.all([
    prisma.usuario.count(),
    prisma.transaccion.count(),
    prisma.transaccion.count({
      where: {
        creadoEn: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    }),
    prisma.wallet.aggregate({
      _sum: { saldo: true }
    })
  ]);

  return {
    totalUsuarios,
    totalTransacciones,
    transaccionesHoy,
    creditosEnCirculacion: creditosEnCirculacion._sum.saldo || 0
  };
};

const obtenerUsuarios = async () => {
  return await prisma.usuario.findMany({
    select: {
      id: true,
      nombre: true,
      email: true,
      codigoEstudiantil: true,
      rol: true,
      activo: true,
      creadoEn: true,
      wallet: {
        select: { saldo: true }
      }
    },
    orderBy: { creadoEn: 'desc' }
  });
};

const obtenerTransacciones = async () => {
  return await prisma.transaccion.findMany({
    include: {
      usuario: {
        select: { nombre: true, codigoEstudiantil: true }
      }
    },
    orderBy: { creadoEn: 'desc' },
    take: 100
  });
};

const toggleUsuario = async (usuarioId) => {
  const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
  if (!usuario) throw new Error('Usuario no encontrado');

  return await prisma.usuario.update({
    where: { id: usuarioId },
    data: { activo: !usuario.activo }
  });
};

module.exports = { obtenerMetricas, obtenerUsuarios, obtenerTransacciones, toggleUsuario };