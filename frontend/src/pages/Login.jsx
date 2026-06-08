import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Login = () => {
  const { login } = useAuth();
  const [form, setForm] = useState({ code: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.token, res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-uptc-negro flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="bg-uptc-amarillo w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-uptc-negro font-bold text-2xl">U</span>
          </div>
          <h1 className="text-2xl font-bold text-uptc-negro">Créditos UPTC</h1>
          <p className="text-gray-500 text-sm mt-1">Seccional Sogamoso</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Código Estudiantil</label>
            <input type="text" name="code" value={form.code} onChange={handleChange}
              placeholder="Ej: 202012345"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-uptc-amarillo"
              required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input type="password" name="password" value={form.password} onChange={handleChange}
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-uptc-amarillo"
              required />
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
          )}
          <button type="submit" disabled={loading}
            className="w-full bg-uptc-negro hover:bg-uptc-gris-oscuro text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-60">
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
        <p className="text-center text-xs text-gray-400 mt-6">Solo estudiantes activos registrados en el SIRA</p>
      </div>
    </div>
  );
};

export default Login;
