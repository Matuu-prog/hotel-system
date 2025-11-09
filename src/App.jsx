import { Routes, Route } from "react-router-dom";
import Usuario from "./pages/Usuario";
import Operador from "./pages/Operador";
import Admin from "./pages/Admin";
import Habitaciones from "./pages/Habitaciones";
import Reservar from "./pages/Reservar";
import Servicios from "./pages/Servicios";
import Login from "./pages/Login";
import RutaPrivada from "./components/RutaPrivada";
import DatosCliente from "./pages/DatosCliente";
import Pago from "./pages/Pago";


function App() {
  return (
    <Routes>
      <Route path="/" element={<Usuario />} />
      <Route path="/usuario" element={<Usuario />} />
      <Route path="/habitaciones" element={<Habitaciones />} />
      <Route path="/servicios" element={<Servicios />} />
      <Route path="/login" element={<Login />} />
      <Route path="/reservar" element={<Reservar />} />
<Route path="/datos-cliente" element={<DatosCliente />} />
<Route path="/pago" element={<Pago />} />

      {/* Protegidas */}
      <Route
        path="/admin"
        element={
          <RutaPrivada roles={["admin"]}>
            <Admin />
          </RutaPrivada>
        }
      />
      <Route
        path="/operador"
        element={
          <RutaPrivada roles={["operador"]}>
            <Operador />
          </RutaPrivada>
        }
      />

      <Route path="*" element={<h2>Página no encontrada</h2>} />
    </Routes>
  );
}

export default App;