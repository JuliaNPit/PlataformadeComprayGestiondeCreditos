const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const sesClient = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const enviarEmail = async ({ to, subject, html }) => {
  const params = {
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Body: {
        Html: { Charset: 'UTF-8', Data: html },
      },
      Subject: { Charset: 'UTF-8', Data: subject },
    },
    Source: process.env.AWS_SES_FROM_EMAIL,
  };

  try {
    const command = new SendEmailCommand(params);
    const data = await sesClient.send(command);
    console.log(`📧 Email AWS enviado a ${to} - ID: ${data.MessageId}`);
    return data;
  } catch (error) {
    console.error('❌ Error al enviar email por AWS SES:', error.message);
  }
};

// Se mantienen tus templates exactos para compatibilidad inmediata
const templates = {
  compraCreditosExitosa: ({ nombre, creditos, precio, metodo, nuevoSaldo }) => ({
    subject: '✅ Compra de créditos exitosa — UPTC',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:24px;">
        <div style="background:#1A1A1A;padding:16px 24px;border-radius:8px 8px 0 0;">
          <h2 style="color:#C8A400;margin:0;">Créditos UPTC</h2>
        </div>
        <div style="background:#fff;border:1px solid #e0ddd4;padding:24px;border-radius:0 0 8px 8px;">
          <p style="color:#1A1A1A;">Hola <strong>${nombre}</strong>,</p>
          <p style="color:#555;">Tu compra de <strong>${creditos} créditos</strong> por $${precio?.toLocaleString('es-CO')} vía ${metodo} fue exitosa.</p>
          <p style="color:#1A1A1A;">Nuevo saldo: <strong>${nuevoSaldo} créditos</strong></p>
        </div>
      </div>
    `,
  }),
  transferenciaEnviada: ({ nombre, destinatario, cantidad, nuevoSaldo }) => ({
    subject: '↗️ Transferencia de créditos enviada — UPTC',
    html: `<p>Hola <strong>${nombre}</strong>, enviaste ${cantidad} crédito(s) a ${destinatario}. Tu nuevo saldo es ${nuevoSaldo}.</p>`,
  }),
  transferenciaRecibida: ({ nombre, remitente, cantidad, nuevoSaldo }) => ({
    subject: '↙️ Recibiste créditos — UPTC',
    html: `<p>Hola <strong>${nombre}</strong>, recibiste ${cantidad} crédito(s) de ${remitente}. Tu nuevo saldo es ${nuevoSaldo}.</p>`,
  }),

  ticketActualizado: ({ nombre, ticketNumber, titulo, nuevoEstado, mensaje }) => ({
    subject: `📋 Tu ticket ${ticketNumber} fue actualizado — UPTC`,
    html: `
      <p>Hola <strong>${nombre}</strong>,</p>
      <p>Tu ticket <strong>${ticketNumber}</strong> ("${titulo}") ha cambiado al estado: <strong>${nuevoEstado}</strong>.</p>
      <p><strong>Respuesta de soporte:</strong> ${mensaje}</p>
    `
  })
};

module.exports = { enviarEmail, templates };