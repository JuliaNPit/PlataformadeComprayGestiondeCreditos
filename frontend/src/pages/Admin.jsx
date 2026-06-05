import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Admin() {
  const [metricas, setMetricas] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [transacciones, setTransacciones] = useState([]);
  const [tab, setTab] = useState("metricas");
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/admin/metricas").then(res => setMetricas(res.data.metricas)).catch(() => {});
    api.get("/admin/usuarios").then(res => setUsuarios(res.data.usuarios)).catch(() => {});
    api.get("/admin/transacciones").then(res => setTransacciones(res.data.transacciones)).catch(() => {});
  }, []);

  const toggleUsuario = async (id) => {
    try {
      await api.patch(`/admin/usuarios/${id}/toggle`);
      const res = await api.get("/admin/usuarios");
      setUsuarios(res.data.usuarios);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate("/dashboard")} className="text-blue-600 mb-4">
          ← Volver
        </button>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Panel Administrativo</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {["metricas", "usuarios", "transacciones"].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition ${
                tab === t ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Métricas */}
        {tab === "metricas" && metricas && (
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Total Usuarios", valor: metricas.totalUsuarios, color: "blue" },
              { label: "Total Transacciones", valor: metricas.totalTransacciones, color: "green" },
              { label: "Transacciones Hoy", valor: metricas.transaccionesHoy, color: "yellow" },
              { label: "Créditos en Circulación", valor: metricas.creditosEnCirculacion, color: "purple" }
            ].map(m => (
              <div key={m.label} className="bg-white rounded-xl shadow p-6">
                <p className="text-sm text-gray-500">{m.label}</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{m.valor}</p>
              </div>
            ))}
          </div>
        )}

        {/* Usuarios */}
        {tab === "usuarios" && (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
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
                  <tr key={u.id}>
                    <td className="px-4 py-3 font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-gray-500">{u.code}</td>
                    <td className="px-4 py-3">{u.wallet?.balance ?? 0} créditos</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        u.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {u.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleUsuario(u.id)}
                        className="text-xs text-blue-600 hover:underline"
                      >
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
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
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
                  <tr key={t.id}>
                    <td className="px-4 py-3 font-medium">{t.user?.name}</td>
                    <td className="px-4 py-3">{t.credits}</td>
                    <td className="px-4 py-3 text-gray-500">{t.method}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        t.status === "APPROVED" ? "bg-green-100 text-green-700" :
                        t.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(t.createdAt).toLocaleDateString("es-CO")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}