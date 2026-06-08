const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');

const snsClient = new SNSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const enviarSMS = async ({ telefono, mensaje }) => {
  // Nota: El número debe estar en formato internacional E.164 (Ej: +573001234567)
  const params = {
    Message: mensaje,
    PhoneNumber: telefono,
  };

  try {
    const command = new PublishCommand(params);
    const data = await snsClient.send(command);
    console.log(`📱 SMS AWS enviado a ${telefono} - ID: ${data.MessageId}`);
    return data;
  } catch (error) {
    console.error('❌ Error al enviar SMS por AWS SNS:', error.message);
  }
};

const templatesSMS = {
  compraExitosa: (creditos, saldo) => `UPTC: Compraste ${creditos} creditos. Saldo actual: ${saldo}.`,
  transferenciaRecibida: (cantidad, remitente) => `UPTC: Recibiste ${cantidad} creditos de ${remitente}.`,
};

module.exports = { enviarSMS, templatesSMS };