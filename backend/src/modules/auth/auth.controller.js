const authService = require('./auth.service');

const register = async (req, res) => {
  try {
    const { code, email, password, phone } = req.body;
    if (!code || !email || !password || !phone) {
      return res.status(400).json({ error: 'Código, email y contraseña son obligatorios' });
    }
    const result = await authService.register({ code, email, password });
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { code, password } = req.body;
    if (!code || !password) {
      return res.status(400).json({ error: 'Código y contraseña son obligatorios' });
    }
    const result = await authService.login({ code, password });
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

module.exports = { register, login };