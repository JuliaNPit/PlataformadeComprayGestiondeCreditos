// Simulación del Sistema de Información de Registro Académico (SIRA)
// En producción, este módulo haría una llamada HTTP al sistema institucional real.

const estudiantesActivos = [
  { code: '202012345', nombre: 'Juan Esteban León Cárdenas', programa: 'Ingeniería de Sistemas', activo: true },
  { code: '202054321', nombre: 'Julian Leonardo Arias Pita', programa: 'Ingeniería de Sistemas', activo: true },
  { code: '202011111', nombre: 'María García López', programa: 'Ingeniería Industrial', activo: true },
  { code: '202022222', nombre: 'Carlos Pérez Mora', programa: 'Ingeniería de Sistemas', activo: true },
  { code: '202033333', nombre: 'Ana Rodríguez Silva', programa: 'Administración de Empresas', activo: true },
  { code: '202044444', nombre: 'Luis Martínez Torres', programa: 'Ingeniería de Sistemas', activo: false },
];

const verificarEstudiante = async (code) => {
  // Simula una pequeña demora como tendría una llamada real
  await new Promise(resolve => setTimeout(resolve, 100));

  const estudiante = estudiantesActivos.find(e => e.code === code);

  if (!estudiante) {
    return { activo: false, mensaje: 'Código no encontrado en el SIRA' };
  }

  return {
    activo: estudiante.activo,
    nombre: estudiante.nombre,
    programa: estudiante.programa,
    mensaje: estudiante.activo ? 'Estudiante activo' : 'Estudiante inactivo'
  };
};

module.exports = { verificarEstudiante };