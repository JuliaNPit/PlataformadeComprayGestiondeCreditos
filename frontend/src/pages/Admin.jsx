import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const colorEstado = (estado) => ({
  ABIERTO:     "bg-yellow-100 text-yellow-700",
  EN_REVISION: "bg-blue-100 text-blue-700",
  RESUELTO:    "bg-green-100 text-green-700",
  CERRADO:     "bg-gray-100 text-gray-600",
}[estado] || "bg-gray-100 text-gray-600");

export default function Admin() {
  const { loading: authLoading } = useAuth();
  const [metricas, setMetricas] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [transacciones, setTransacciones] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [tab, setTab] = useState("metricas");

  // Modal responder ticket
  const [ticketSeleccionado, setTicketSeleccionado] = useState(null);
  const [respuesta, setRespuesta] = useState({ message: "", status: "EN_REVISION" });
  const [enviando, setEnviando] = useState(false);
  const [errorRespuesta, setErrorRespuesta] = useState("");

  useEffect(() => {
    if (authLoading) return;
    api.get("/admin/metricas").then(res => setMetricas(res.data.metricas)).catch(() => {});
    api.get("/admin/usuarios").then(res => setUsuarios(res.data.usuarios)).catch(() => {});
    api.get("/admin/transacciones").then(res => setTransacciones(res.data.transacciones)).catch(() => {});
    api.get("/pqrs/admin/todos").then(res => setTickets(res.data.tickets)).catch(() => {});
  }, [authLoading]);

  const toggleUsuario = async (id) => {
    try {
      await api.patch(`/admin/usuarios/${id}/toggle`);
      const res = await api.get("/admin/usuarios");
      setUsuarios(res.data.usuarios);
    } catch {}
  };

  const handleResponder = async () => {
    if (!respuesta.message) return setErrorRespuesta("Escribe un mensaje");
    setEnviando(true); setErrorRespuesta("");
    try {
      await api.patch(`/pqrs/${ticketSeleccionado.id}/responder`, respuesta);
      const res = await api.get("/pqrs/admin/todos");
      setTickets(res.data.tickets);
      setTicketSeleccionado(null);
      setRespuesta({ message: "", status: "EN_REVISION" });
    } catch (err) {
      setErrorRespuesta(err.response?.data?.error || "Error al responder");
    } finally { setEnviando(false); }
  };

  const tabLabels = { metricas: "Métricas", usuarios: "Usuarios", transacciones: "Transacciones", pqrs: `PQRS ${tickets.filter(t => t.status === 'ABIERTO').length > 0 ? `(${tickets.filter(t => t.status === 'ABIERTO').length})` : ''}` };

  if (authLoading) return <AdminLayout><div className="flex items-center justify-center h-64 text-gray-500">Cargando...</div></AdminLayout>;

  return (
    <AdminLayout>
      <h1 className="text-2xl font-semibold text-uptc-negro mb-1">Panel de Administración</h1>
      <p className="text-gray-500 text-sm mb-6">Monitorea y gestiona todo el sistema de créditos académicos UPTC</p>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["metricas", "usuarios", "transacciones", "pqrs"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg font-medium transition text-sm ${
              tab === t
                ? "bg-uptc-amarillo text-uptc-negro"
                : "bg-white text-gray-600 border border-gray-200 hover:border-uptc-amarillo"
            }`}>
            {tabLabels[t]}
          </button>
        ))}
      </div>

      {/* Métricas */}
      {tab === "metricas" && metricas && (
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Total Usuarios",          valor: metricas.totalUsuarios },
            { label: "Total Transacciones",     valor: metricas.totalTransacciones },
            { label: "Transacciones Hoy",       valor: metricas.transaccionesHoy },
            { label: "Créditos en Circulación", valor: metricas.creditosEnCirculacion },
          ].map(m => (
            <div key={m.label} className="bg-white rounded-xl shadow-sm p-6 border-t-4 border-uptc-amarillo">
              <p className="text-sm text-gray-500">{m.label}</p>
              <p className="text-3xl font-bold text-uptc-negro mt-1">{m.valor}</p>
            </div>
          ))}
        </div>
      )}

      {/* Usuarios */}
      {tab === "usuarios" && (
        <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-uptc-negro text-uptc-amarillo uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Código</th>
                <th className="px-4 py-3 text-left">Saldo</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-left">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {usuarios.map(u => (
                <tr key={u.id} className="hover:bg-uptc-gris-claro transition-colors">
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-gray-500">{u.code}</td>
                  <td className="px-4 py-3">{u.wallet?.balance ?? 0} cr.</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {u.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleUsuario(u.id)}
                      className="text-xs text-uptc-amarillo-hover hover:underline font-medium">
                      {u.isActive ? "Desactivar" : "Activar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Transacciones */}
      {tab === "transacciones" && (
        <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-uptc-negro text-uptc-amarillo uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Usuario</th>
                <th className="px-4 py-3 text-left">Créditos</th>
                <th className="px-4 py-3 text-left">Método</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-left">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transacciones.map(t => (
                <tr key={t.id} className="hover:bg-uptc-gris-claro transition-colors">
                  <td className="px-4 py-3 font-medium">{t.user?.name}</td>
                  <td className="px-4 py-3">{t.credits}</td>
                  <td className="px-4 py-3 text-gray-500">{t.method}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      t.status === "APROBADO" ? "bg-green-100 text-green-700" :
                      t.status === "PENDIENTE"  ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                    }`}>{t.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{new Date(t.createdAt).toLocaleDateString("es-CO")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* PQRS */}
      {tab === "pqrs" && (
        <div className="space-y-3">
          {tickets.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-400">No hay tickets</div>
          ) : tickets.map(ticket => (
            <button key={ticket.id} onClick={() => { setTicketSeleccionado(ticket); setRespuesta({ message: "", status: ticket.status === 'ABIERTO' ? 'EN_REVISION' : ticket.status }); }}
              className="w-full bg-white rounded-xl shadow-sm p-4 border-l-4 border-uptc-amarillo text-left hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <span className="text-xs font-mono text-gray-400">{ticket.ticketNumber}</span>
                  <span className="text-xs text-gray-500 ml-2">· {ticket.user?.name} ({ticket.user?.code})</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${colorEstado(ticket.status)}`}>{ticket.status}</span>
              </div>
              <p className="font-medium text-uptc-negro text-sm">{ticket.title}</p>
              <p className="text-xs text-gray-500 mt-1 line-clamp-1">{ticket.description}</p>
              <div className="flex justify-between mt-2">
                <span className="text-xs text-gray-400">{new Date(ticket.createdAt).toLocaleDateString("es-CO")}</span>
                {ticket.updates?.length > 0 && <span className="text-xs text-blue-600">{ticket.updates.length} respuesta(s)</span>}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Modal responder ticket */}
      {ticketSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          onClick={e => e.target === e.currentTarget && setTicketSeleccionado(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
            <div className="p-5 border-b border-gray-100 flex justify-between items-start">
              <div>
                <span className="text-xs font-mono text-gray-400">{ticketSeleccionado.ticketNumber}</span>
                <h2 className="font-semibold text-uptc-negro mt-1">{ticketSeleccionado.title}</h2>
                <p className="text-xs text-gray-500 mt-0.5">{ticketSeleccionado.user?.name} · {ticketSeleccionado.user?.code}</p>
              </div>
              <button onClick={() => setTicketSeleccionado(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Descripción */}
              <div className="bg-uptc-gris-claro rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Solicitud del estudiante</p>
                <p className="text-sm text-gray-800">{ticketSeleccionado.description}</p>
              </div>

              {/* Historial de respuestas */}
              {ticketSeleccionado.updates?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Historial</p>
                  {ticketSeleccionado.updates.map((u, i) => (
                    <div key={i} className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-medium text-blue-700">Soporte UPTC</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${colorEstado(u.status)}`}>{u.status}</span>
                      </div>
                      <p className="text-sm text-gray-800">{u.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(u.createdAt).toLocaleDateString("es-CO", { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Formulario respuesta */}
              {ticketSeleccionado.status !== 'CERRADO' && (
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-sm font-medium text-uptc-negro mb-3">Responder</p>
                  <select value={respuesta.status} onChange={e => setRespuesta({ ...respuesta, status: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-uptc-amarillo">
                    <option value="EN_REVISION">En revisión</option>
                    <option value="RESUELTO">Resuelto</option>
                    <option value="CERRADO">Cerrado</option>
                  </select>
                  <textarea value={respuesta.message} onChange={e => setRespuesta({ ...respuesta, message: e.target.value })}
                    placeholder="Escribe tu respuesta al estudiante..."
                    rows={3} className="w-full border border-gray-300 rounded-lg p-3 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-uptc-amarillo" />
                  {errorRespuesta && <p className="text-red-500 text-xs mb-2">{errorRespuesta}</p>}
                  <button onClick={handleResponder} disabled={enviando}
                    className="w-full bg-uptc-amarillo hover:bg-uptc-amarillo-hover text-uptc-negro py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors">
                    {enviando ? "Enviando..." : "Enviar respuesta"}
                  </button>
                </div>
              )}
              {ticketSeleccionado.status === 'CERRADO' && (
                <div className="bg-gray-50 rounded-xl p-3 text-center text-sm text-gray-500">Ticket cerrado</div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100">
              <button onClick={() => setTicketSeleccionado(null)}
                className="w-full border border-gray-300 text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}