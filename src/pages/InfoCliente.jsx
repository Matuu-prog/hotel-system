import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Container, Card, Form, Button, Alert, Row, Col } from "react-bootstrap";
import NavbarUsuario from "../components/NavBarUsuario";

export default function InfoCliente() {
  const { state } = useLocation() || {};
  const navigate = useNavigate();

  // Si llegamos sin state, volvemos a reservar
  useEffect(() => {
    if (!state?.roomId || !state?.start || !state?.end) {
      navigate("/habitaciones");
    }
  }, [state, navigate]);

  const [habitaciones, setHabitaciones] = useState([]);
  const [msg, setMsg] = useState({ type: "", text: "" });

  // Datos del cliente
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [dni, setDni] = useState("");
  const [telefono, setTelefono] = useState("");

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("habitaciones")) || [];
    setHabitaciones(data);
  }, []);

  const room = useMemo(
    () => habitaciones.find((h) => String(h.id) === String(state?.roomId)),
    [habitaciones, state]
  );

const toYMD = (value) => {
    const date = new Date(value);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate()
    ).padStart(2, "0")}`;
  };

  const rangeToArray = (start, end) => {
    if (!start || !end) return [];
    const out = [];
    let current = new Date(start);
    const last = new Date(end);
    while (current <= last) {
      out.push(toYMD(current));
      current.setDate(current.getDate() + 1);
    }
    return out;
  };

  const validar = () => {
    if (!nombre.trim() || !email.trim() || !dni.trim() || !telefono.trim()) {
      setMsg({ type: "danger", text: "Completá todos los campos." });
      return false;
    }
    // Validaciones simples
    const emailOK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOK) {
      setMsg({ type: "danger", text: "Ingresá un email válido." });
      return false;
    }
    const dniOK = /^\d{6,10}$/.test(dni);
    if (!dniOK) {
      setMsg({ type: "danger", text: "Ingresá un DNI válido (solo números)." });
      return false;
    }
    const telOK = /^[\d\s()+-]{6,20}$/.test(telefono);
    if (!telOK) {
      setMsg({ type: "danger", text: "Ingresá un teléfono válido." });
      return false;
    }
    return true;
  };

  const handleContinuar = (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });
    if (!validar()) return;

    // Creamos un registro de reserva en "reservas" con estado pendiente de pago
    const reservas = JSON.parse(localStorage.getItem("reservas")) || [];
    const roomName = room?.nombre || `Habitación ${state.roomId}`;
    const noches = Math.max(1, rangeToArray(state.start, state.end).length - 1);
    const precioBase = Number(room?.precio ?? room?.tarifa ?? 0);
    const montoEstimado = precioBase * noches;
    const nueva = {
      id: Date.now(),
      roomId: String(state.roomId),
      roomName,
      start: state.start,
      end: state.end,
      cliente: { nombre, email, dni, telefono },
      pago: {
        estado: "pendiente",
        metodo: null,
        monto: montoEstimado,
        fecha: null,
        operador: "Reserva online",
      },
      createdAt: new Date().toISOString(),
      origen: "web",
    };

    reservas.push(nueva);
    localStorage.setItem("reservas", JSON.stringify(reservas));
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("reservaEnProceso", String(nueva.id));
    }

    // Navegar a pago con la reserva creada
    navigate("/pago", { state: { reservaId: nueva.id } });

  return (
    <>
      <NavbarUsuario />
      <Container className="mt-5">
        <Card className="shadow-sm">
          <Card.Body>
            <h3 className="mb-3">Información del cliente</h3>

            {room && (
              <Alert variant="info">
                <div><strong>Habitación:</strong> {room.nombre}</div>
                <div><strong>Estadía:</strong> {state?.start} → {state?.end}</div>
              </Alert>
            )}

            {msg.text && <Alert variant={msg.type}>{msg.text}</Alert>}

            <Form onSubmit={handleContinuar}>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Label>Nombre completo</Form.Label>
                  <Form.Control value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                </Col>
                <Col md={6}>
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </Col>
                <Col md={6}>
                  <Form.Label>DNI</Form.Label>
                  <Form.Control value={dni} onChange={(e) => setDni(e.target.value)} required />
                </Col>
                <Col md={6}>
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control value={telefono} onChange={(e) => setTelefono(e.target.value)} required />
                </Col>
              </Row>

              <div className="mt-4 d-flex gap-2">
                <Button type="submit" variant="primary">Continuar a pago</Button>
                <Button variant="secondary" onClick={() => navigate(-1)}>Volver</Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
  }
}
