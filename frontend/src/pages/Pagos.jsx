import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import StudentLayout from "./StudentLayout";
import api from "../services/api";

export default function Pagos() {
  const { loading: authLoading } = useAuth();
  const [opciones, setOpciones] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [metodo, setMetodo] = useState("NEQUI");
  const [cargando, setCargando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;
    api.get("/payments/opciones").then(res => setOpciones(res.data.opciones)).catch(() => {});
  }, [authLoading]);

  const handleCompra = async () => {
    if (!seleccionado) return setError("Selecciona una cantidad de créditos");
    setCargando(true);
    setError("");
    setResultado(null);
    try {
      const res = await api.post("/payments/iniciar", { cantidadCreditos: seleccionado, metodo });
      setResultado(res.data.datos);
    } catch (err) {
      setError(err.response?.data?.error || "Error al procesar el pago");
    } finally {
      setCargando(false);
    }
  };

  if (authLoading) return (
    <StudentLayout>
      <div className="flex items-center justify-center h-64 text-gray-500">Cargando...</div>
    </StudentLayout>
  );

  return (
    <StudentLayout>
      <h1 className="text-2xl font-semibold text-uptc-negro mb-1">Comprar Créditos</h1>
      <p className="text-gray-500 text-sm mb-6">Selecciona la cantidad y el método de pago</p>

      <div className="max-w-lg">
        {resultado ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <div className="text-4xl mb-3">✅</div>
            <h2 className="text-xl font-bold text-green-700 mb-2">¡Pago exitoso!</h2>
            <p className="text-gray-600">Compraste <strong>{resultado.creditosComprados} crédito(s)</strong></p>
            <p className="text-gray-600">Pagaste <strong>${resultado.precioPagado?.toLocaleString("es-CO")}</strong> vía {resultado.metodo}</p>
            <p className="text-gray-600 mt-2">Nuevo saldo: <strong>{resultado.nuevoSaldo} créditos</strong></p>
            <button onClick={() => navigate("/dashboard")}
              className="mt-4 bg-uptc-negro text-white px-6 py-2 rounded-lg hover:bg-uptc-gris-oscuro transition-colors">
              Ir al Dashboard
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
              <h2 className="font-semibold text-uptc-negro mb-3">Selecciona cantidad</h2>
              <div className="grid grid-cols-2 gap-3">
                {opciones.map(op => (
                  <button key={op.creditos} onClick={() => setSeleccionado(op.creditos)}
                    className={`border-2 rounded-xl p-4 text-center transition ${
                      seleccionado === op.creditos
                        ? "border-uptc-amarillo bg-yellow-50"
                        : "border-gray-200 hover:border-uptc-amarillo"
                    }`}>
                    <div className="text-2xl font-bold text-uptc-negro">{op.creditos}</div>
                    <div className="text-sm text-gray-500">crédito(s)</div>
                    <div className="text-sm font-semibold text-uptc-amarillo-hover mt-1">
                      ${op.precio?.toLocaleString("es-CO")}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
              <h2 className="font-semibold text-uptc-negro mb-3">Método de pago</h2>
              <div className="flex gap-3">
                {["NEQUI", "PSE", "TARJETA"].map(m => (
                  <button key={m} onClick={() => setMetodo(m)}
                    className={`flex-1 border-2 rounded-xl py-3 font-medium transition ${
                      metodo === m
                        ? "border-uptc-amarillo bg-yellow-50 text-uptc-negro"
                        : "border-gray-200 text-gray-600 hover:border-uptc-amarillo"
                    }`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

            <button onClick={handleCompra} disabled={cargando}
              className="w-full bg-uptc-amarillo hover:bg-uptc-amarillo-hover text-uptc-negro py-4 rounded-xl font-semibold text-lg disabled:opacity-50 transition-colors">
              {cargando ? "Procesando pago..." : `Pagar${seleccionado ? ` ${seleccionado} crédito(s)` : ""}`}
            </button>
          </>
        )}
      </div>
    </StudentLayout>
  );
}