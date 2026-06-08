import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import StudentLayout from "./StudentLayout";
import api from "../services/api";

const colorEstado = (estado) => ({
  ABIERTO:     "bg-yellow-100 text-yellow-700",
  EN_REVISION: "bg-blue-100 text-blue-700",
  RESUELTO:    "bg-green-100 text-green-700",
  CERRADO:     "bg-gray-100 text-gray-600",
}[estado] || "bg-gray-100 text-gray-600");

const iconoEstado = (estado) => ({
  ABIERTO: "🟡", EN_REVISION: "🔵", RESUELTO: "✅", CERRADO: "⬛"
}[estado] || "⬜");

export default function PQRS() {
  const { loading: authLoading } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [ticketSeleccionado, setTicketSeleccionado] = useState(null);
  const [form, setForm] = useState({ type: "QUEJA", title: "", description: "" });
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const cargarTickets = async () => {
    try {
      const res = await api.get("/pqrs");
      setTickets(res.data.tickets);
    } catch {}
  };

  useEffect(() => { if (!authLoading) cargarTickets(); }, [authLoading]);

  const handleSubmit = async () => {
    if (!form.title || !form.description) return setError("Completa todos los campos");
    setCargando(true); setError("");
    try {
      await api.post("/pqrs", form);
      setForm({ type: "QUEJA", title: "", description: "" });
      setMostrarFormulario(false);
      cargarTickets();
    } catch (err) {
      setError(err.response?.data?.error || "Error al crear el ticket");
    } finally { setCargando(false); }
  };

  const abrirTicket = async (ticket) => {
    try {
      const res = await api.get(`/pqrs/${ticket.id}`);
      setTicketSeleccionado(res.data.ticket);
    } catch { setTicketSeleccionado(ticket); }
  };

  if (authLoading) return <StudentLayout><div className="flex items-center justify-center h-64 text-gray-500">Cargando...</div></StudentLayout>;

  return (
    <StudentLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-uptc-negro mb-1">Soporte / PQRS</h1>
          <p className="text-gray-500 text-sm">Gestiona tus solicitudes y quejas</p>
        </div>
        <button onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="bg-uptc-amarillo text-uptc-negro px-4 py-2 rounded-lg text-sm font-medium hover:bg-uptc-amarillo-hover transition-colors">
          + Nuevo ticket
        </button>
      </div>

      {mostrarFormulario && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border-t-4 border-uptc-amarillo max-w-lg">
          <h2 className="font-semibold text-uptc-negro mb-4">Nuevo ticket</h2>
          <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
            className="w-full border border-gray-300 rounded-lg p-3 mb-3 focus:outline-none focus:ring-2 focus:ring-uptc-amarillo">
            <option value="PETICION">Petición</option>
            <option value="QUEJA">Queja</option>
            <option value="RECLAMO">Reclamo</option>
            <option value="SUGERENCIA">Sugerencia</option>
          </select>
          <input type="text" placeholder="Título" value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            className="w-full border border-gray-300 rounded-lg p-3 mb-3 focus:outline-none focus:ring-2 focus:ring-uptc-amarillo" />
          <textarea placeholder="Describe tu situación..." value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            rows={4} className="w-full border border-gray-300 rounded-lg p-3 mb-3 focus:outline-none focus:ring-2 focus:ring-uptc-amarillo" />
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <div className="flex gap-3">
            <button onClick={handleSubmit} disabled={cargando}
              className="flex-1 bg-uptc-amarillo hover:bg-uptc-amarillo-hover text-uptc-negro py-3 rounded-lg font-medium disabled:opacity-50 transition-colors">
              {cargando ? "Enviando..." : "Enviar ticket"}
            </button>
            <button onClick={() => setMostrarFormulario(false)}
              className="px-4 py-3 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3 max-w-lg">
        {tickets.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-400">No tienes tickets abiertos</div>
        ) : tickets.map(ticket => (
          <button key={ticket.id} onClick={() => abrirTicket(ticket)}
            className="w-full bg-white rounded-xl shadow-sm p-4 border-l-4 border-uptc-amarillo text-left hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-mono text-gray-400">{ticket.ticketNumber}</span>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${colorEstado(ticket.status)}`}>
                {iconoEstado(ticket.status)} {ticket.status}
              </span>
            </div>
            <p className="font-medium text-uptc-negro">{ticket.title}</p>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{ticket.description}</p>
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-400">{new Date(ticket.createdAt).toLocaleDateString("es-CO")}</p>
              {ticket.updates?.length > 0 && (
                <span className="text-xs text-blue-600 font-medium">{ticket.updates.length} respuesta(s)</span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Modal detalle ticket */}
      {ticketSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          onClick={e => e.target === e.currentTarget && setTicketSeleccionado(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
            {/* Header modal */}
            <div className="p-5 border-b border-gray-100 flex justify-between items-start">
              <div>
                <span className="text-xs font-mono text-gray-400">{ticketSeleccionado.ticketNumber}</span>
                <h2 className="font-semibold text-uptc-negro mt-1">{ticketSeleccionado.title}</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${colorEstado(ticketSeleccionado.status)}`}>
                  {ticketSeleccionado.status}
                </span>
                <button onClick={() => setTicketSeleccionado(null)}
                  className="text-gray-400 hover:text-gray-600 text-xl leading-none ml-2">×</button>
              </div>
            </div>

            {/* Contenido scrolleable */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Descripción original */}
              <div className="bg-uptc-gris-claro rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Tu solicitud</p>
                <p className="text-sm text-gray-800">{ticketSeleccionado.description}</p>
                <p className="text-xs text-gray-400 mt-2">{new Date(ticketSeleccionado.createdAt).toLocaleDateString("es-CO", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              </div>

              {/* Respuestas del admin */}
              {ticketSeleccionado.updates?.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Respuestas</p>
                  {ticketSeleccionado.updates.map((update, i) => (
                    <div key={i} className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-medium text-blue-700">👤 Soporte UPTC</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colorEstado(update.status)}`}>
                          → {update.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-800">{update.message}</p>
                      <p className="text-xs text-gray-400 mt-2">{new Date(update.createdAt).toLocaleDateString("es-CO", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-400 text-sm">
                  {ticketSeleccionado.status === 'ABIERTO' ? '⏳ Tu ticket está en espera de revisión' : 'Sin respuestas aún'}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100">
              <button onClick={() => setTicketSeleccionado(null)}
                className="w-full bg-uptc-negro text-white py-2.5 rounded-lg text-sm font-medium hover:bg-uptc-gris-oscuro transition-colors">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </StudentLayout>
  );
}