const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const crearNotificacion = async (userId, { type, title, message }) => {
  return await prisma.notification.create({
    data: { userId, type, title, message, read: false }
  });
};

const obtenerMisNotificaciones = async (userId) => {
  return await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50
  });
};

const marcarLeida = async (userId, notificationId) => {
  const notif = await prisma.notification.findUnique({ where: { id: notificationId } });
  if (!notif) throw new Error('Notificación no encontrada');
  if (notif.userId !== userId) throw new Error('No tienes permiso');

  return await prisma.notification.update({
    where: { id: notificationId },
    data: { read: true }
  });
};

const marcarTodasLeidas = async (userId) => {
  return await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true }
  });
};

module.exports = { crearNotificacion, obtenerMisNotificaciones, marcarLeida, marcarTodasLeidas };