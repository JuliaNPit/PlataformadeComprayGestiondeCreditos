const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getSaldo = async (userId) => {
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
    select: { balance: true, updatedAt: true }
  });

  if (!wallet) throw new Error('Billetera no encontrada');

  return { balance: wallet.balance, updatedAt: wallet.updatedAt };
};

const getHistorial = async (userId, filtros = {}) => {
  const { tipo, fechaInicio, fechaFin, page = 1, limit = 10 } = filtros;

  const where = { OR: [{ senderId: userId }, { receiverId: userId }] };

  if (tipo) where.type = tipo;
  if (fechaInicio || fechaFin) {
    where.createdAt = {};
    if (fechaInicio) where.createdAt.gte = new Date(fechaInicio);
    if (fechaFin) where.createdAt.lte = new Date(fechaFin);
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: Number(limit),
      include: {
        sender: { select: { name: true, code: true } },
        receiver: { select: { name: true, code: true } }
      }
    }),
    prisma.transaction.count({ where })
  ]);

  return { transactions, total, page: Number(page), totalPages: Math.ceil(total / limit) };
};

module.exports = { getSaldo, getHistorial };