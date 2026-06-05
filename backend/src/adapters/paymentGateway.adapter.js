const simularPago = async ({ monto, metodo, transaccionId }) => {
  await new Promise(resolve => setTimeout(resolve, 1500));

  if (monto <= 0) {
    return {
      aprobado: false,
      codigoRespuesta: 'FONDOS_INSUFICIENTES',
      mensaje: 'Transacción rechazada por la entidad bancaria',
      transaccionId
    };
  }

  return {
    aprobado: true,
    codigoRespuesta: 'APROBADO',
    mensaje: 'Pago procesado exitosamente',
    transaccionId,
    metodo,
    monto
  };
};

module.exports = { simularPago };