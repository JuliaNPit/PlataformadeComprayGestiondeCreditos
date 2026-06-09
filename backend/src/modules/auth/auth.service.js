const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const siraAdapter = require('../../adapters/sira.adapter');

const prisma = new PrismaClient();

const register = async ({ code, email, password, phone }) => {
  // Verificar en SIRA que sea estudiante activo
  const siraData = await siraAdapter.verificarEstudiante(code);
  if (!siraData.activo) {
    throw new Error('El código estudiantil no corresponde a un estudiante activo en el SIRA');
  }

  // Verificar que no exista ya
  const existe = await prisma.user.findUnique({ where: { code } });
  if (existe) {
    throw new Error('Ya existe una cuenta con ese código estudiantil');
  }

  // Crear usuario
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      code,
      email,
      phone,
      name: siraData.nombre,
      program: siraData.programa,
      password: hashedPassword,
      wallet: { create: { balance: 0 } }
    }
  });

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  return { token, user: { id: user.id, name: user.name, code: user.code, role: user.role } };
};

const login = async ({ code, password }) => {
  const user = await prisma.user.findUnique({ where: { code } });
  if (!user) throw new Error('Credenciales inválidas');
  if (!user.isActive) throw new Error('Cuenta suspendida');

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error('Credenciales inválidas');

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  return { token, user: { id: user.id, name: user.name, code: user.code, role: user.role } };
};

module.exports = { register, login };