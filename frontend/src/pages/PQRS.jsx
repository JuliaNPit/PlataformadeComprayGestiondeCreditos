import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function PQRS() {
  const [tickets, setTickets] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [form, setForm] = useState({ type: "QUEJA", title: "", description: "" });
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const cargarTickets = async () => {
    try {
      const res = await api.get("/pqrs");
      setTickets(res.data.tickets);
    } catch {}
  };

  useEffect(() => { cargarTickets(); }, []);

  const handleSubmit = async () => {
    if (!form.title || !form.description) return setError("Completa todos los campos");
    setCargando(true);
    setError("");
    try {
      await api.post("/pqrs", form);
      setForm({ type: "QUEJA", title: "", description: "" });
      setMostrarFormulario(false);
      cargarTickets();
    } catch (err) {
      setError(err.response?.data?.error || "Error al crear el ticket");
    } finally {
      setCargando(false);
    }
  };

  const colorEstado = (estado) => {
    const colores = {
      ABIERTO: "bg-yellow-100 text-yellow-700",
      EN_REVISION: "bg-blue-100 text-blue-700",
      RESUELTO: "bg-green-100 text-green-700",
      CERRADO: "bg-gray-100 text-gray-600"
    };
    return colores[estado] || "bg-gray-100 text-gray-600";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-lg mx-auto">
        <button onClick={() => navigate("/dashboard")} className="text-blue-600 mb-4">
          ← Volver
        </button>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Soporte / PQRS</h1>
          <button
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            + Nuevo ticket
          </button>
        </div>

        {mostrarFormulario && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="font-semibold text-gray-700 mb-4">Nuevo ticket</h2>
            <select
              value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-3 mb-3"
            >
              <option value="PETICION">Petición</option>
              <option value="QUEJA">Queja</option>
              <option value="RECLAMO">Reclamo</option>
              <option value="SUGERENCIA">Sugerencia</option>
            </select>
            <input
              type="text"
              placeholder="Título"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-3 mb-3"
            />
            <textarea
              placeholder="Describe tu situación..."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="w-full border border-gray-300 rounded-lg p-3 mb-3"
            />
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <button
              onClick={handleSubmit}
              disabled={cargando}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium disabled:opacity-50"
            >
              {cargando ? "Enviando..." : "Enviar ticket"}
            </button>
          </div>
        )}

        <div className="space-y-3">
          {tickets.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-8 text-center text-gray-400">
              No tienes tickets abiertos
            </div>
          ) : (
            tickets.map(ticket => (
              <div key={ticket.id} className="bg-white rounded-xl shadow p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-mono text-gray-400">{ticket.ticketNumber}</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${colorEstado(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </div>
                <p className="font-medium text-gray-800">{ticket.title}</p>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{ticket.description}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(ticket.createdAt).toLocaleDateString("es-CO")}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}