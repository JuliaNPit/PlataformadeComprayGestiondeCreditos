import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StudentLayout from './StudentLayout';
import api from '../services/api';

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [saldo, setSaldo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    const fetchSaldo = async () => {
      try {
        const res = await api.get('/wallet/saldo');
        setSaldo(res.data.balance);
      } catch (err) {
        console.error('Error al obtener saldo:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSaldo();
  }, [authLoading]);

  if (authLoading) return (
    <StudentLayout>
      <div className="flex items-center justify-center h-64 text-gray-500">Cargando...</div>
    </StudentLayout>
  );

  return (
    <StudentLayout>
      <h1 className="text-2xl font-semibold text-uptc-negro mb-1">Dashboard</h1>
      <p className="text-gray-500 text-sm mb-6">Bienvenido, {user?.name?.split(' ')[0]}. Administra tus créditos.</p>

      {/* Tarjeta saldo — stack en móvil, row en desktop */}
      <div className="bg-uptc-amarillo rounded-2xl p-5 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-uptc-negro text-sm font-medium opacity-75 mb-1">Saldo disponible</p>
            {loading ? (
              <p className="text-4xl font-bold text-uptc-negro">Cargando...</p>
            ) : (
              <p className="text-5xl font-bold text-uptc-negro">
                {saldo} <span className="text-2xl opacity-75">créditos</span>
              </p>
            )}
            <p className="text-uptc-negro text-sm opacity-75 mt-2">Código: {user?.code}</p>
          </div>
          <button onClick={() => navigate('/pagos')}
            className="bg-uptc-negro text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-uptc-gris-oscuro transition-colors self-start sm:self-auto flex-shrink-0">
            + Comprar Más
          </button>
        </div>
      </div>

      {/* Acciones — 2 columnas siempre, texto truncado en móvil */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { path: '/pagos',          icon: '💳', label: 'Comprar',    desc: 'Recargar créditos' },
          { path: '/transferencias', icon: '↗️', label: 'Transferir', desc: 'Enviar créditos' },
          { path: '/historial',      icon: '📋', label: 'Historial',  desc: 'Ver transacciones' },
          { path: '/pqrs',           icon: '🎫', label: 'Soporte',    desc: 'Quejas y solicitudes' },
        ].map(item => (
          <button key={item.path} onClick={() => navigate(item.path)}
            className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow text-left border-l-4 border-uptc-amarillo">
            <div className="text-2xl mb-2">{item.icon}</div>
            <h3 className="font-semibold text-uptc-negro text-sm">{item.label}</h3>
            <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">{item.desc}</p>
          </button>
        ))}
      </div>

      {/* Info cuenta */}
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h3 className="font-semibold text-uptc-negro mb-4">Mi cuenta</h3>
        <div className="space-y-3 text-sm">
          {[
            { label: 'Nombre', value: user?.name },
            { label: 'Código', value: user?.code },
            { label: 'Rol',    value: user?.role },
          ].map(row => (
            <div key={row.label} className="flex justify-between border-b border-gray-100 pb-2 last:border-0 last:pb-0">
              <span className="text-gray-500">{row.label}</span>
              <span className="font-medium text-uptc-negro text-right">{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </StudentLayout>
  );
};

export default Dashboard;