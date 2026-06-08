#!/bin/bash
PAGES="$HOME/Documents/proyectos/PlataformadeComprayGestiondeCreditos/frontend/src/pages"

# 1. Login.jsx — correcto
cat > "$PAGES/Login.jsx" << 'EOF'
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
EOF

# 2. Dashboard.jsx — correcto
cat > "$PAGES/Dashboard.jsx" << 'EOF'
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
      <p className="text-gray-500 text-sm mb-6">Bienvenido, {user?.name}. Administra tus créditos académicos.</p>
      <div className="bg-uptc-amarillo rounded-2xl p-6 mb-6 flex items-center justify-between">
        <div>
          <p className="text-uptc-negro text-sm font-medium opacity-75 mb-1">Saldo disponible</p>
          {loading ? (
            <p className="text-4xl font-bold text-uptc-negro">Cargando...</p>
          ) : (
            <p className="text-5xl font-bold text-uptc-negro">{saldo} <span className="text-2xl opacity-75">créditos</span></p>
          )}
          <p className="text-uptc-negro text-sm opacity-75 mt-2">Código: {user?.code}</p>
        </div>
        <button onClick={() => navigate('/pagos')}
          className="bg-uptc-negro text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-uptc-gris-oscuro transition-colors flex-shrink-0">
          + Comprar Más
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[
          { path: '/pagos',          icon: '💳', label: 'Comprar',    desc: 'Recargar créditos' },
          { path: '/transferencias', icon: '↗️', label: 'Transferir', desc: 'Enviar a otro estudiante' },
          { path: '/historial',      icon: '📋', label: 'Historial',  desc: 'Ver mis transacciones' },
          { path: '/pqrs',           icon: '🎫', label: 'Soporte',    desc: 'Quejas y solicitudes' },
        ].map(item => (
          <button key={item.path} onClick={() => navigate(item.path)}
            className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow text-left border-l-4 border-uptc-amarillo">
            <div className="text-3xl mb-2">{item.icon}</div>
            <h3 className="font-semibold text-uptc-negro">{item.label}</h3>
            <p className="text-gray-500 text-sm">{item.desc}</p>
          </button>
        ))}
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold text-uptc-negro mb-4">Mi cuenta</h3>
        <div className="space-y-3 text-sm">
          {[
            { label: 'Nombre', value: user?.name },
            { label: 'Código', value: user?.code },
            { label: 'Rol',    value: user?.role },
          ].map(row => (
            <div key={row.label} className="flex justify-between border-b border-gray-100 pb-2 last:border-0 last:pb-0">
              <span className="text-gray-500">{row.label}</span>
              <span className="font-medium text-uptc-negro">{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </StudentLayout>
  );
};

export default Dashboard;
EOF

# 3. AdminLayout.jsx — simplificado sin rutas inexistentes
cat > "$PAGES/AdminLayout.jsx" << 'EOF'
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-64 bg-uptc-negro flex flex-col flex-shrink-0">
        <div className="px-5 py-5 border-b border-uptc-gris-oscuro">
          <div className="flex items-center gap-3">
            <div className="bg-uptc-amarillo w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-uptc-negro font-bold text-base">U</span>
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-tight">UPTC</p>
              <p className="text-uptc-amarillo text-xs">Admin Panel</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <p className="text-gray-600 text-xs uppercase tracking-wider px-2 mb-3">Panel de Control</p>
          <button onClick={() => navigate('/admin')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${
              location.pathname === '/admin'
                ? 'bg-uptc-amarillo text-uptc-negro font-medium'
                : 'text-gray-400 hover:bg-uptc-gris-oscuro hover:text-white'
            }`}>
            <span>📊</span> Dashboard
          </button>
          <p className="text-gray-600 text-xs uppercase tracking-wider px-2 mt-5 mb-3">Vista estudiante</p>
          <button onClick={() => navigate('/dashboard')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-uptc-gris-oscuro hover:text-white transition-colors text-left">
            <span>👤</span> Ir al Dashboard
          </button>
        </nav>
        <div className="px-3 py-4 border-t border-uptc-gris-oscuro">
          <div className="px-3 py-2 mb-2">
            <p className="text-white text-sm font-medium truncate">{user?.name}</p>
            <p className="text-uptc-amarillo text-xs">Administrador</p>
          </div>
          <button onClick={() => { logout(); navigate('/login'); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-uptc-gris-oscuro hover:text-white transition-colors text-left">
            <span>🚪</span> Cerrar Sesión
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-end gap-3">
          <div className="w-8 h-8 rounded-full bg-uptc-amarillo flex items-center justify-center">
            <span className="text-uptc-negro font-bold text-xs">
              {user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </span>
          </div>
          <span className="text-sm text-gray-600 font-medium">Admin</span>
        </header>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
EOF

echo "✅ Login.jsx, Dashboard.jsx y AdminLayout.jsx corregidos"
