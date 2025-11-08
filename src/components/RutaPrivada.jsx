// components/RutaPrivada.jsx
import { Navigate } from "react-router-dom";

function RutaPrivada({ children, roles }) {
  const usuarioActual = JSON.parse(localStorage.getItem("usuarioActual"));

  // No logueado → a /login
  if (!usuarioActual) return <Navigate to="/login" replace />;

  // Superadmin tiene acceso a todo
  if (usuarioActual.rol === "superadmin") return children;

  // Si se especificaron roles, validamos
  if (Array.isArray(roles) && roles.length > 0) {
    if (!roles.includes(usuarioActual.rol)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}

export default RutaPrivada;