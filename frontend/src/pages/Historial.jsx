import { useState, useEffect } from 'react';
import StudentLayout from './StudentLayout';
import api from '../services/api';

const tipoLabel = {
  TRANSFER_SENT:     { label: 'Transferencia enviada',  color: 'text-red-600',              icon: '↗️' },
  TRANSFER_RECEIVED: { label: 'Transferencia recibida', color: 'text-green-600',             icon: '↙️' },
  PURCHASE:          { label: 'Compra de créditos',     color: 'text-uptc-amarillo-hover',   icon: '💳' },
  CONSUMPTION:       { label: 'Consumo restaurante',    color: 'text-orange-600',            icon: '🍽️' },
};

const Historial = () => {
  const [transacciones, setTransacciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({ tipo: '', fechaInicio: '', fechaFin: '' });
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const fetchHistorial = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10, ...filtros };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const res = await api.get('/wallet/historial', { params });
      setTransacciones(res.data.transactions);
      setTotalPaginas(res.data.totalPages);
      setPagina(res.data.page);
    } catch (err) {
      console.error('Error al obtener historial:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistorial(); }, []);

  const formatFecha = (fecha) =>
    new Date(fecha).toLocaleDateString('es-CO', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  return (
    <StudentLayout>
      <h1 className="text-2xl font-semibold text-uptc-negro mb-1">Historial de Transferencias</h1>
      <p className="text-gray-500 text-sm mb-6">Consulta todas tus transacciones realizadas</p>

      {/* Filtros */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
        <form onSubmit={e => { e.preventDefault(); fetchHistorial(1); }} className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Tipo</label>
            <select
              value={filtros.tipo}
              onChange={e => setFiltros({ ...filtros, tipo: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-uptc-amarillo"
            >
              <option value="">Todos</option>
              <option value="TRANSFER_SENT">Enviadas</option>
              <option value="TRANSFER_RECEIVED">Recibidas</option>
              <option value="PURCHASE">Compras</option>
              <option value="CONSUMPTION">Consumos</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Desde</label>
            <input type="date" value={filtros.fechaInicio}
              onChange={e => setFiltros({ ...filtros, fechaInicio: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-uptc-amarillo"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Hasta</label>
            <input type="date" value={filtros.fechaFin}
              onChange={e => setFiltros({ ...filtros, fechaFin: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-uptc-amarillo"
            />
          </div>
          <button type="submit"
            className="bg-uptc-negro text-white px-4 py-2 rounded-lg text-sm hover:bg-uptc-gris-oscuro transition-colors">
            Filtrar
          </button>
          <button type="button"
            onClick={() => { setFiltros({ tipo: '', fechaInicio: '', fechaFin: '' }); fetchHistorial(1); }}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300 transition-colors">
            Limpiar
          </button>
        </form>
      </div>

      {/* Lista */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando transacciones...</div>
        ) : transacciones.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No hay transacciones para mostrar</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {transacciones.map(tx => {
              const tipo = tipoLabel[tx.type] || { label: tx.type, color: 'text-gray-600', icon: '•' };
              const esSalida = tx.type === 'TRANSFER_SENT' || tx.type === 'CONSUMPTION';
              return (
                <div key={tx.id} className="px-6 py-4 flex justify-between items-center hover:bg-uptc-gris-claro transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{tipo.icon}</span>
                    <div>
                      <p className={`font-medium text-sm ${tipo.color}`}>{tipo.label}</p>
                      <p className="text-gray-500 text-xs">{tx.description}</p>
                      <p className="text-gray-400 text-xs">{formatFecha(tx.createdAt)}</p>
                    </div>
                  </div>
                  <span className={`font-bold text-lg ${esSalida ? 'text-red-600' : 'text-green-600'}`}>
                    {esSalida ? '-' : '+'}{tx.amount}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => fetchHistorial(pagina - 1)} disabled={pagina === 1}
            className="px-4 py-2 bg-white rounded-lg shadow-sm text-sm disabled:opacity-40 hover:bg-gray-50">
            ← Anterior
          </button>
          <span className="px-4 py-2 bg-uptc-amarillo text-uptc-negro rounded-lg shadow-sm text-sm font-medium">
            {pagina} / {totalPaginas}
          </span>
          <button onClick={() => fetchHistorial(pagina + 1)} disabled={pagina === totalPaginas}
            className="px-4 py-2 bg-white rounded-lg shadow-sm text-sm disabled:opacity-40 hover:bg-gray-50">
            Siguiente →
          </button>
        </div>
      )}
    </StudentLayout>
  );
};

export default Historial;