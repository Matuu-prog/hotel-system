// Reservar.jsx
// Formulario para hacer una reserva. Al confirmar, actualiza el estado de disponibilidad en localStorage.

import React, { useEffect, useState } from "react";
import { Container, Form, Button, Card } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import NavbarUsuario from "../components/NavbarUsuario";
import { getHabitaciones, saveHabitaciones } from "../utils/db";

function Reservar() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const habitacion = state?.habitacion;

  const [nombre, setNombre] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  useEffect(() => {
    if (!habitacion) {
      navigate("/habitaciones");
    }
  }, [habitacion, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const habitaciones = getHabitaciones();

    // Cambiar disponibilidad
    const actualizadas = habitaciones.map((h) =>
      h.id === habitacion.id ? { ...h, disponible: false } : h
    );
    saveHabitaciones(actualizadas);

    alert(
      `✅ Reserva confirmada para ${nombre} en habitación ${habitacion.nombre}`
    );
    navigate("/habitaciones");
  };

  return (
    <>
      <NavbarUsuario />
      <Container className="mt-5" style={{ maxWidth: "600px" }}>
        <Card className="shadow-lg border-0 p-4">
          <Card.Title className="mb-4 text-center fs-3">
            Hacer una Reserva
          </Card.Title>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Habitación</Form.Label>
              <Form.Control
                type="text"
                value={`${habitacion?.nombre} (${habitacion?.tipo})`}
                readOnly
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Nombre del huésped</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ej: Mateo Carrizo"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Fecha de Check-In</Form.Label>
              <Form.Control
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Fecha de Check-Out</Form.Label>
              <Form.Control
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                required
              />
            </Form.Group>

            <div className="text-center">
              <Button variant="success" type="submit">
                Confirmar Reserva
              </Button>
            </div>
          </Form>
        </Card>
      </Container>
    </>
  );
}

export default Reservar;