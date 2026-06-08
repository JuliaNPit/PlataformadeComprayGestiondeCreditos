import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { path: '/dashboard',      label: 'Dashboard',        icon: '📊' },
  { path: '/pagos',          label: 'Comprar Créditos', icon: '💳' },
  { path: '/historial',      label: 'Historial',        icon: '📋' },
  { path: '/transferencias', label: 'Transferir Saldo', icon: '↗️' },
  { path: '/pqrs',           label: 'Soporte / PQRS',   icon: '🎫' },
];

export default function StudentLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const handleNav = (path) => { navigate(path); setSidebarOpen(false); };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-uptc-gris-oscuro">
        <div className="flex items-center gap-3">
          <div className="bg-uptc-amarillo w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-uptc-negro font-bold text-base">U</span>
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">UPTC</p>
            <p className="text-gray-500 text-xs">Créditos Académicos</p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-gray-600 text-xs uppercase tracking-wider px-2 mb-3">Menú principal</p>
        {navLinks.map(link => {
          const active = location.pathname === link.path;
          return (
            <button key={link.path} onClick={() => handleNav(link.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${
                active
                  ? 'bg-uptc-amarillo text-uptc-negro font-medium'
                  : 'text-gray-400 hover:bg-uptc-gris-oscuro hover:text-white'
              }`}>
              <span className="text-base">{link.icon}</span>
              {link.label}
            </button>
          );
        })}

        {user?.role === 'ADMIN' && (
          <>
            <p className="text-gray-600 text-xs uppercase tracking-wider px-2 mt-5 mb-3">Administración</p>
            <button onClick={() => handleNav('/admin')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${
                location.pathname === '/admin'
                  ? 'bg-uptc-amarillo text-uptc-negro font-medium'
                  : 'text-gray-400 hover:bg-uptc-gris-oscuro hover:text-white'
              }`}>
              <span className="text-base">⚙️</span>
              Panel Admin
            </button>
          </>
        )}
      </nav>

      {/* Usuario */}
      <div className="px-3 py-4 border-t border-uptc-gris-oscuro">
        <div className="px-3 py-2 mb-2">
          <p className="text-white text-sm font-medium truncate">{user?.name}</p>
          <p className="text-gray-500 text-xs">{user?.code}</p>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-uptc-gris-oscuro hover:text-white transition-colors text-left">
          <span className="text-base">🚪</span>
          Cerrar Sesión
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-uptc-gris-claro">

      {/* Sidebar desktop — oculto en móvil */}
      <aside className="hidden md:flex w-64 bg-uptc-negro flex-col flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Overlay móvil */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Fondo oscuro */}
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
          {/* Drawer */}
          <aside className="absolute left-0 top-0 h-full w-64 bg-uptc-negro flex flex-col z-50">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          {/* Botón hamburguesa — solo en móvil */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="space-y-1.5">
              <span className="block w-5 h-0.5 bg-gray-600"></span>
              <span className="block w-5 h-0.5 bg-gray-600"></span>
              <span className="block w-5 h-0.5 bg-gray-600"></span>
            </div>
          </button>

          {/* Logo en móvil */}
          <div className="md:hidden flex items-center gap-2">
            <div className="bg-uptc-amarillo w-7 h-7 rounded-md flex items-center justify-center">
              <span className="text-uptc-negro font-bold text-xs">U</span>
            </div>
            <span className="text-uptc-negro font-semibold text-sm">Créditos UPTC</span>
          </div>

          <div className="hidden md:block" /> {/* spacer desktop */}

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-uptc-amarillo flex items-center justify-center">
              <span className="text-uptc-negro font-bold text-xs">
                {user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </span>
            </div>
            <span className="text-sm text-gray-600 font-medium hidden sm:block">{user?.name?.split(' ')[0]}</span>
          </div>
        </header>

        {/* Página */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}