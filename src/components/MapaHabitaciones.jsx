// MapaHabitaciones.jsx
// Muestra un plano visual de habitaciones. Cada una puede estar libre u ocupada.
// El color indica su estado: verde = disponible, rojo = ocupada.

import React from "react";
import { Card } from "react-bootstrap";

function MapaHabitaciones({ habitaciones, onSelectHabitacion }) {
  return (
    <div className="d-flex flex-wrap justify-content-center gap-3 mt-4">
      {habitaciones.map((hab) => (
        <Card
          key={hab.id}
          style={{
            width: "90px",
            height: "90px",
            cursor: "pointer",
            backgroundColor: hab.disponible ? "#28a745" : "#dc3545",
            color: "white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontWeight: "bold",
            borderRadius: "10px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
            transition: "transform 0.2s ease",
          }}
          onClick={() => onSelectHabitacion(hab)}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1.0)")}
        >
          {hab.nombre}
        </Card>
      ))}
    </div>
  );
}

export default MapaHabitaciones;