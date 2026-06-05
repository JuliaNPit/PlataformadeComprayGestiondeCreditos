import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Historial from '../pages/Historial';
import Transferencias from '../pages/Transferencias';
import Pagos from '../pages/Pagos';
import PQRS from '../pages/PQRS';
import Admin from '../pages/Admin';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/historial" element={<PrivateRoute><Historial /></PrivateRoute>} />
        <Route path="/transferencias" element={<PrivateRoute><Transferencias /></PrivateRoute>} />
        <Route path="/pagos" element={<PrivateRoute><Pagos /></PrivateRoute>} />
        <Route path="/pqrs" element={<PrivateRoute><PQRS /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
