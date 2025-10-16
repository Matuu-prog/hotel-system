import { Routes, Route } from "react-router-dom";
import Hub from "./pages/Hub";
import Usuario from "./pages/Usuario";
import Operador from "./pages/Operador";
import Admin from "./pages/Admin";

/**
 * Define las rutas principales según el rol seleccionado.
 */
function App() {
  return (
    <Routes>
      <Route path="/" element={<Hub />} />
      <Route path="/usuario" element={<Usuario />} />
      <Route path="/operador" element={<Operador />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
}

export default App;