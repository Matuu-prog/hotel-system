import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Container, Card, Form, Button, Alert, Row, Col } from "react-bootstrap";
import NavbarUsuario from "../components/NavBarUsuario";
import { ensureHabitaciones } from "../utils/habitaciones";
import {
  sanitizeName,
  sanitizePhone,
  sanitizeNumeric,
  isValidName,
  isValidEmail,
  isValidPhone,
  isValidDocument,
} from "../utils/validation";

const toYMD = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
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

export default function InfoCliente() {
  const { state } = useLocation() || {};
  const navigate = useNavigate();

  useEffect(() => {
    if (!state?.roomId || !state?.start || !state?.end) {
      navigate("/habitaciones");
    }
  }, [state, navigate]);

  const [habitaciones, setHabitaciones] = useState([]);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [dni, setDni] = useState("");
  const [telefono, setTelefono] = useState("");

  useEffect(() => {
    const data = ensureHabitaciones();
    setHabitaciones(data);
  }, []);

  const room = useMemo(
    () => habitaciones.find((h) => String(h.id) === String(state?.roomId)),
    [habitaciones, state?.roomId]
  );

  const noches = useMemo(() => {
    const fechas = rangeToArray(state?.start, state?.end);
    return Math.max(1, fechas.length - 1);
  }, [state?.start, state?.end]);

  const precioBase = Number(room?.precio ?? room?.tarifa ?? 0);
  const subtotal = precioBase * noches;

  const validar = () => {
    if (!isValidName(nombre)) {
      setMsg({ type: "danger", text: "Ingresá un nombre válido (solo letras)." });
      return false;
    }
    if (!isValidEmail(email)) {
      setMsg({ type: "danger", text: "Ingresá un email válido." });
      return false;
    }
    if (!isValidDocument(dni)) {
      setMsg({ type: "danger", text: "Ingresá un DNI válido (solo números)." });
      return false;
    }
    if (!isValidPhone(telefono)) {
      setMsg({ type: "danger", text: "Ingresá un teléfono válido (solo números)." });
      return false;
    }
    return true;
  };

  const handleContinuar = (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });
    if (!validar()) return;

    const reservas = JSON.parse(localStorage.getItem("reservas")) || [];
    const roomName = room?.nombre || `Habitación ${state.roomId}`;

    const clienteNormalizado = {
      nombre: nombre.trim(),
      email: email.trim(),
      dni: dni.trim(),
      telefono: telefono.trim(),
    };

    const nueva = {
      id: Date.now(),
      roomId: String(state.roomId),
      roomName,
      start: state.start,
      end: state.end,
      cliente: clienteNormalizado,
      pago: {
        estado: "pendiente",
        metodo: null,
        monto: subtotal,
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

    navigate("/pago", { state: { reservaId: nueva.id } });
  };

  return (
    <>
      <NavbarUsuario />
      <Container className="mt-5">
        <Card className="shadow-sm">
          <Card.Body>
            <h3 className="mb-3">Información del cliente</h3>

            {room && (
              <Alert variant="info">
                <div>
                  <strong>Habitación:</strong> {room.nombre} — ${precioBase.toLocaleString("es-AR")} por noche
                </div>
                <div>
                  <strong>Estadía:</strong> {state?.start} → {state?.end} ({noches} noche(s))
                </div>
                <div>
                  <strong>Subtotal estimado:</strong> ${subtotal.toLocaleString("es-AR")}
                </div>
              </Alert>
            )}

            {msg.text && <Alert variant={msg.type}>{msg.text}</Alert>}

            <Form onSubmit={handleContinuar}>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Label>Nombre completo</Form.Label>
                  <Form.Control
                    value={nombre}
                    onChange={(e) => setNombre(sanitizeName(e.target.value))}
                    required
                    autoComplete="name"
                  />
                </Col>
                <Col md={6}>
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.trim())}
                    required
                    autoComplete="email"
                  />
                </Col>
                <Col md={6}>
                  <Form.Label>DNI</Form.Label>
                  <Form.Control
                    value={dni}
                    onChange={(e) => setDni(sanitizeNumeric(e.target.value))}
                    required
                    inputMode="numeric"
                  />
                </Col>
                <Col md={6}>
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control
                    value={telefono}
                    onChange={(e) => setTelefono(sanitizePhone(e.target.value))}
                    required
                    inputMode="tel"
                  />
                </Col>
              </Row>

              <div className="mt-4 d-flex gap-2">
                <Button type="submit" variant="primary">
                  Continuar a pago
                </Button>
                <Button variant="secondary" onClick={() => navigate(-1)}>
                  Volver
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}
