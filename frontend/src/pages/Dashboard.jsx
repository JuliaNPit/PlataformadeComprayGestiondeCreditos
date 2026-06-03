import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [saldo, setSaldo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-blue-900 text-white px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-400 w-8 h-8 rounded-full flex items-center justify-center">
            <span className="text-blue-900 font-bold text-sm">U</span>
          </div>
          <span className="font-semibold">Créditos UPTC</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-blue-200">{user?.name}</span>
          <button
            onClick={handleLogout}
            className="text-sm bg-blue-800 hover:bg-blue-700 px-3 py-1 rounded-lg transition-colors"
          >
            Salir
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Tarjeta de saldo */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-2xl p-6 shadow-lg">
          <p className="text-blue-200 text-sm mb-1">Saldo disponible</p>
          {loading ? (
            <div className="text-4xl font-bold">Cargando...</div>
          ) : (
            <div className="text-5xl font-bold">{saldo} <span className="text-2xl text-blue-200">créditos</span></div>
          )}
          <p className="text-blue-200 text-sm mt-2">Código: {user?.code}</p>
        </div>

        {/* Acciones rápidas */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/transferencias')}
            className="bg-white rounded-xl p-6 shadow hover:shadow-md transition-shadow text-left"
          >
            <div className="text-3xl mb-2">↗️</div>
            <h3 className="font-semibold text-gray-800">Transferir</h3>
            <p className="text-gray-500 text-sm">Enviar créditos a otro estudiante</p>
          </button>

          <button
            onClick={() => navigate('/historial')}
            className="bg-white rounded-xl p-6 shadow hover:shadow-md transition-shadow text-left"
          >
            <div className="text-3xl mb-2">📋</div>
            <h3 className="font-semibold text-gray-800">Historial</h3>
            <p className="text-gray-500 text-sm">Ver mis transacciones</p>
          </button>
        </div>

        {/* Info del estudiante */}
        <div className="bg-white rounded-xl p-6 shadow">
          <h3 className="font-semibold text-gray-800 mb-3">Mi cuenta</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Nombre</span>
              <span className="font-medium">{user?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Código</span>
              <span className="font-medium">{user?.code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Rol</span>
              <span className="font-medium">{user?.role}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;