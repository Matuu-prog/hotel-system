// main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-datepicker/dist/react-datepicker.css';
import Operador from "./pages/Operador.jsx";

// Páginas
import App from "./App.jsx";
import Hub from "./pages/Hub.jsx";
import Usuario from "./pages/Usuario.jsx";
import Habitaciones from "./pages/Habitaciones.jsx";
import Reservar from "./pages/Reservar.jsx";
import Admin from "./pages/Admin";

import OperadorLogin from "./pages/OperadorLogin";
import RegistrarOperador from "./pages/RegistrarOperador";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      {/* Página base */}
      <Route path="/" element={<App />} />

      {/* Roles */}
      <Route path="/hub" element={<Hub />} />
      <Route path="/usuario" element={<Usuario />} />
      <Route path="/admin" element={<Admin />} />

      {/* Futuras rutas */}
      <Route path="/servicios" element={<h1>Sección Servicios</h1>} />
      <Route path="/reservar" element={<Reservar />} />
      <Route path="/operador" element={<Operador />} />

      <Route path="/habitaciones" element={<Habitaciones />} />

      <Route path="/operador-login" element={<OperadorLogin />} />
        <Route path="/registrar-operador" element={<RegistrarOperador />} />
    
    </Routes>
  </BrowserRouter>
);