const paymentsService = require('./payments.service');

const iniciarCompra = async (req, res) => {
  try {
    const { cantidadCreditos, metodo } = req.body;
    if (!cantidadCreditos || !metodo) {
      return res.status(400).json({ error: 'Se requieren cantidadCreditos y metodo' });
    }
    const resultado = await paymentsService.iniciarCompra(
      req.user.userId,
      { cantidadCreditos: parseInt(cantidadCreditos), metodo }
    );
    res.json({ mensaje: 'Compra realizada exitosamente', datos: resultado });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const obtenerOpciones = async (req, res) => {
  try {
    const opciones = paymentsService.obtenerOpciones();
    res.json({ opciones });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { iniciarCompra, obtenerOpciones };
