const transfersService = require('./transfers.service');

const transferir = async (req, res) => {
  try {
    const { destinatarioCode, cantidad } = req.body;
    if (!destinatarioCode || !cantidad) {
      return res.status(400).json({ error: 'Código del destinatario y cantidad son obligatorios' });
    }
    const result = await transfersService.transferir(req.user.userId, {
      destinatarioCode,
      cantidad: Number(cantidad)
    });
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { transferir };