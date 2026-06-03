const walletService = require('./wallet.service');

const getSaldo = async (req, res) => {
  try {
    const result = await walletService.getSaldo(req.user.userId);
    res.json(result);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

const getHistorial = async (req, res) => {
  try {
    const { tipo, fechaInicio, fechaFin, page, limit } = req.query;
    const result = await walletService.getHistorial(req.user.userId, {
      tipo,
      fechaInicio,
      fechaFin,
      page,
      limit
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getSaldo, getHistorial };