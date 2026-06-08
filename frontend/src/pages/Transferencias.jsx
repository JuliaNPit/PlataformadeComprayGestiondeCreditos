import { useState } from 'react';
import StudentLayout from './StudentLayout';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

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
    if (!form.destinatarioCode || !form.cantidad) return setError('Todos los campos son obligatorios');
    if (Number(form.cantidad) <= 0) return setError('La cantidad debe ser mayor a cero');
    setLoading(true);
    try {
      const res = await api.post('/transfers', {
        destinatarioCode: form.destinatarioCode,
        cantidad: Number(form.cantidad),
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
    <StudentLayout>
      <h1 className="text-2xl font-semibold text-uptc-negro mb-1">Transferir Saldo</h1>
      <p className="text-gray-500 text-sm mb-6">Envía créditos académicos a otro estudiante de la UPTC</p>

      <div className="max-w-lg">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          {exito && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <p className="text-green-700 font-semibold text-sm">✅ Transferencia exitosa</p>
              <p className="text-green-600 text-sm mt-1">
                Enviaste <strong>{exito.cantidad} crédito(s)</strong> a{' '}
                <strong>{exito.destinatario.nombre}</strong>
              </p>
              <button onClick={() => navigate('/dashboard')} className="mt-3 text-green-700 underline text-sm">
                Volver al Dashboard
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar destinatario
              </label>
              <input
                type="text"
                name="destinatarioCode"
                value={form.destinatarioCode}
                onChange={handleChange}
                placeholder="Código estudiantil (ej: 202054321)"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-uptc-amarillo"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto a transferir
              </label>
              <input
                type="number"
                name="cantidad"
                value={form.cantidad}
                onChange={handleChange}
                placeholder="Cantidad de créditos (ej: 2)"
                min="1"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-uptc-amarillo"
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
              className="w-full bg-uptc-amarillo hover:bg-uptc-amarillo-hover text-uptc-negro font-semibold py-3 rounded-lg transition-colors disabled:opacity-60"
            >
              {loading ? 'Procesando...' : 'Transferir Créditos'}
            </button>
          </form>
        </div>
      </div>
    </StudentLayout>
  );
};

export default Transferencias;