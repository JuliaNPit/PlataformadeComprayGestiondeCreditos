import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Transferencias = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ destinatarioCode: '', cantidad: '' });
  const [error, setError] = useState('');
  const [exito, setExito] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setExito(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.destinatarioCode || !form.cantidad) {
      setError('Todos los campos son obligatorios');
      return;
    }
    if (Number(form.cantidad) <= 0) {
      setError('La cantidad debe ser mayor a cero');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/transfers', {
        destinatarioCode: form.destinatarioCode,
        cantidad: Number(form.cantidad)
      });
      setExito(res.data);
      setForm({ destinatarioCode: '', cantidad: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Error al realizar la transferencia');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-900 text-white px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate('/dashboard')} className="text-blue-200 hover:text-white">
          ← Volver
        </button>
        <h1 className="font-semibold">Transferir Créditos</h1>
      </nav>

      <div className="max-w-md mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="text-center mb-6">
            <div className="text-5xl mb-2">↗️</div>
            <h2 className="text-xl font-bold text-blue-900">Nueva Transferencia</h2>
            <p className="text-gray-500 text-sm">Envía créditos a otro estudiante</p>
          </div>

          {exito && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
              <p className="text-green-700 font-semibold text-sm">✅ Transferencia exitosa</p>
              <p className="text-green-600 text-sm mt-1">
                Enviaste <strong>{exito.cantidad} crédito(s)</strong> a <strong>{exito.destinatario.nombre}</strong>
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="mt-3 text-green-700 underline text-sm"
              >
                Volver al Dashboard
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código del destinatario
              </label>
              <input
                type="text"
                name="destinatarioCode"
                value={form.destinatarioCode}
                onChange={handleChange}
                placeholder="Ej: 202054321"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad de créditos
              </label>
              <input
                type="number"
                name="cantidad"
                value={form.cantidad}
                onChange={handleChange}
                placeholder="Ej: 2"
                min="1"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-900 hover:bg-blue-800 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-60"
            >
              {loading ? 'Procesando...' : 'Transferir Créditos'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Transferencias;