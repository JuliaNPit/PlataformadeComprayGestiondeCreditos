const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./modules/auth/auth.routes');
const walletRoutes = require('./modules/wallet/wallet.routes');
const transfersRoutes = require('./modules/transfers/transfers.routes');
const paymentsRoutes = require('./modules/payments/payments.routes');
const adminRoutes = require('./modules/admin/admin.routes');
const pqrsRoutes = require('./modules/pqrs/pqrs.routes');
const notificationsRoutes = require('./modules/notifications/notifications.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/transfers', transfersRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/pqrs', pqrsRoutes);
app.use('/api/notifications', notificationsRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Plataforma de Créditos UPTC - API funcionando',
    version: '1.0.0',
    status: 'OK'
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;