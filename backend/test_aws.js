require('dotenv').config();
const { enviarEmail } = require('./src/modules/notifications/emailaws.service.js');
const { enviarSMS } = require('./src/modules/notifications/smsaws.service.js');

const probarNotificaciones = async () => {
  console.log('⏳ Probando envío de notificaciones por AWS...');

  // 1. Probar Email
  // Cambia este correo por tu correo personal para verificar que llega
  await enviarEmail({
    to: 'afcardozori@gmail.com', 
    subject: '🧪 Prueba de Integración AWS SES',
    html: '<h2>¡Funciona!</h2><p>El servicio de Amazon SES está correctamente configurado.</p>'
  });

  // 2. Probar SMS
  // Cambia el número. Debe llevar código de país (ej: +57 para Colombia)
  await enviarSMS({
    telefono: '+573150491124', 
    mensaje: 'Prueba desde Plataforma UPTC usando Amazon SNS.'
  });

  console.log('✅ Fin de las pruebas.');
};

probarNotificaciones();