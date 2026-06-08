const nodemailer = require('nodemailer');

// Crea una cuenta de prueba en Ethereal automáticamente
const crearTransporter = async () => {
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

const enviarEmail = async ({ to, subject, html }) => {
  try {
    const transporter = await crearTransporter();
    const info = await transporter.sendMail({
      from: '"Créditos UPTC" <no-reply@uptc.edu.co>',
      to,
      subject,
      html,
    });
    // URL para ver el email en Ethereal (solo en desarrollo)
    console.log(`📧 Email enviado: ${nodemailer.getTestMessageUrl(info)}`);
    return info;
  } catch (error) {
    // El email falla silenciosamente — no debe romper el flujo principal
    console.error('Error al enviar email:', error.message);
  }
};

// Templates de email
const templates = {
  compraCreditosExitosa: ({ nombre, creditos, precio, metodo, nuevoSaldo }) => ({
    subject: '✅ Compra de créditos exitosa — UPTC',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:24px;">
        <div style="background:#1A1A1A;padding:16px 24px;border-radius:8px 8px 0 0;">
          <h2 style="color:#C8A400;margin:0;">Créditos UPTC</h2>
          <p style="color:#888;margin:4px 0 0;font-size:13px;">Seccional Sogamoso</p>
        </div>
        <div style="background:#fff;border:1px solid #e0ddd4;padding:24px;border-radius:0 0 8px 8px;">
          <p style="color:#1A1A1A;">Hola <strong>${nombre}</strong>,</p>
          <p style="color:#555;">Tu compra de créditos fue procesada exitosamente.</p>
          <div style="background:#FFF9E6;border-left:4px solid #C8A400;padding:16px;border-radius:4px;margin:16px 0;">
            <p style="margin:0;font-size:13px;color:#888;">Créditos comprados</p>
            <p style="margin:4px 0 0;font-size:28px;font-weight:bold;color:#1A1A1A;">${creditos} créditos</p>
          </div>
          <table style="width:100%;font-size:13px;color:#555;border-collapse:collapse;">
            <tr><td style="padding:6px 0;">Valor pagado</td><td style="text-align:right;font-weight:bold;color:#1A1A1A;">$${precio?.toLocaleString('es-CO')}</td></tr>
            <tr><td style="padding:6px 0;">Método</td><td style="text-align:right;">${metodo}</td></tr>
            <tr style="border-top:1px solid #e0ddd4;"><td style="padding:8px 0;font-weight:bold;color:#1A1A1A;">Nuevo saldo</td><td style="text-align:right;font-weight:bold;color:#C8A400;font-size:16px;">${nuevoSaldo} créditos</td></tr>
          </table>
          <p style="font-size:12px;color:#aaa;margin-top:24px;">Este es un correo automático, no responder.</p>
        </div>
      </div>
    `,
  }),

  transferenciaEnviada: ({ nombre, destinatario, cantidad, nuevoSaldo }) => ({
    subject: '↗️ Transferencia de créditos enviada — UPTC',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:24px;">
        <div style="background:#1A1A1A;padding:16px 24px;border-radius:8px 8px 0 0;">
          <h2 style="color:#C8A400;margin:0;">Créditos UPTC</h2>
        </div>
        <div style="background:#fff;border:1px solid #e0ddd4;padding:24px;border-radius:0 0 8px 8px;">
          <p style="color:#1A1A1A;">Hola <strong>${nombre}</strong>,</p>
          <p style="color:#555;">Transferiste <strong>${cantidad} crédito(s)</strong> a <strong>${destinatario}</strong>.</p>
          <div style="background:#FFF9E6;border-left:4px solid #C8A400;padding:16px;border-radius:4px;margin:16px 0;">
            <p style="margin:0;font-size:13px;color:#888;">Saldo restante</p>
            <p style="margin:4px 0 0;font-size:28px;font-weight:bold;color:#1A1A1A;">${nuevoSaldo} créditos</p>
          </div>
          <p style="font-size:12px;color:#aaa;margin-top:24px;">Este es un correo automático, no responder.</p>
        </div>
      </div>
    `,
  }),

  transferenciaRecibida: ({ nombre, remitente, cantidad, nuevoSaldo }) => ({
    subject: '↙️ Recibiste créditos — UPTC',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:24px;">
        <div style="background:#1A1A1A;padding:16px 24px;border-radius:8px 8px 0 0;">
          <h2 style="color:#C8A400;margin:0;">Créditos UPTC</h2>
        </div>
        <div style="background:#fff;border:1px solid #e0ddd4;padding:24px;border-radius:0 0 8px 8px;">
          <p style="color:#1A1A1A;">Hola <strong>${nombre}</strong>,</p>
          <p style="color:#555;"><strong>${remitente}</strong> te transfirió <strong>${cantidad} crédito(s)</strong>.</p>
          <div style="background:#FFF9E6;border-left:4px solid #C8A400;padding:16px;border-radius:4px;margin:16px 0;">
            <p style="margin:0;font-size:13px;color:#888;">Nuevo saldo</p>
            <p style="margin:4px 0 0;font-size:28px;font-weight:bold;color:#1A1A1A;">${nuevoSaldo} créditos</p>
          </div>
          <p style="font-size:12px;color:#aaa;margin-top:24px;">Este es un correo automático, no responder.</p>
        </div>
      </div>
    `,
  }),

  ticketActualizado: ({ nombre, ticketNumber, titulo, nuevoEstado, mensaje }) => ({
    subject: `📋 Tu ticket ${ticketNumber} fue actualizado — UPTC`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:24px;">
        <div style="background:#1A1A1A;padding:16px 24px;border-radius:8px 8px 0 0;">
          <h2 style="color:#C8A400;margin:0;">Créditos UPTC</h2>
        </div>
        <div style="background:#fff;border:1px solid #e0ddd4;padding:24px;border-radius:0 0 8px 8px;">
          <p style="color:#1A1A1A;">Hola <strong>${nombre}</strong>,</p>
          <p style="color:#555;">Tu ticket <strong>${ticketNumber}</strong> — "${titulo}" fue actualizado.</p>
          <div style="background:#FFF9E6;border-left:4px solid #C8A400;padding:16px;border-radius:4px;margin:16px 0;">
            <p style="margin:0;font-size:13px;color:#888;">Nuevo estado</p>
            <p style="margin:4px 0 0;font-size:18px;font-weight:bold;color:#1A1A1A;">${nuevoEstado}</p>
          </div>
          <div style="background:#f9f9f9;padding:12px;border-radius:4px;">
            <p style="margin:0;font-size:13px;color:#888;">Respuesta del equipo de soporte:</p>
            <p style="margin:8px 0 0;color:#1A1A1A;">${mensaje}</p>
          </div>
          <p style="font-size:12px;color:#aaa;margin-top:24px;">Este es un correo automático, no responder.</p>
        </div>
      </div>
    `,
  }),
};

module.exports = { enviarEmail, templates };
