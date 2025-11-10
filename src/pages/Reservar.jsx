import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container, Card, Form, Button, Row, Col, Alert } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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

// Utils
const toYMD = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
const rangeToArray = (start, end) => {
  const out = [];
  const cur = new Date(start);
  const fin = new Date(end);
  while (cur <= fin) {
    out.push(toYMD(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
};
const hasOverlap = (newStart, newEnd, reservedDates = []) => {
  if (!newStart || !newEnd) return false;
  const setReserved = new Set(reservedDates);
  for (const day of rangeToArray(newStart, newEnd)) {
    if (setReserved.has(day)) return true;
  }
  return false;
};

export default function Reservar() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const preselectedId = query.get("roomId");
  const preStart = query.get("start");
  const preEnd = query.get("end");

  // Estado
  const [habitaciones, setHabitaciones] = useState([]);
  const [roomId, setRoomId] = useState(preselectedId || "");
  const [startDate, setStartDate] = useState(preStart ? new Date(preStart) : null);
  const [endDate, setEndDate] = useState(preEnd ? new Date(preEnd) : null);
  const [msg, setMsg] = useState({ type: "", text: "" });

  // Datos del cliente
  const [cliente, setCliente] = useState({
    nombre: "",
    email: "",
    telefono: "",
    documento: "",
  });

  // Cargar habitaciones
  useEffect(() => {
    const disponibles = ensureHabitaciones();
    setHabitaciones(disponibles);
  }, []);

  // Habitación seleccionada
  const selectedRoom = useMemo(
    () => habitaciones.find((h) => String(h.id) === String(roomId)),
    [habitaciones, roomId]
  );

  // Fechas ocupadas para bloquear en DatePicker
  const reservedDatesAsDate = useMemo(() => {
    if (!selectedRoom?.reservedDates) return [];
    return selectedRoom.reservedDates.map((d) => {
      const [y, m, day] = d.split("-").map(Number);
      return new Date(y, m - 1, day);
    });
  }, [selectedRoom]);

  // Cambio de fechas (rango)
  const onDatesChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
    setMsg({ type: "", text: "" });
  };

  // Validación básica de datos de cliente
  const validateCliente = () => {
    if (!isValidName(cliente.nombre)) {
      return { ok: false, text: "Ingresá tu nombre completo (solo letras)." };
    }
    if (!isValidEmail(cliente.email)) {
      return { ok: false, text: "Ingresá un email válido." };
    }
    if (!isValidPhone(cliente.telefono)) {
      return { ok: false, text: "Ingresá un teléfono válido (solo números)." };
    }
    if (!isValidDocument(cliente.documento)) {
      return {
        ok: false,
        text: "Ingresá un documento válido (solo números, mínimo 6 dígitos).",
      };
    }

    return { ok: true };
  };

  const handleSubmit = (e) => {
  e.preventDefault();
  setMsg({ type: "", text: "" });

  if (!roomId) {
    setMsg({ type: "danger", text: "Seleccioná una habitación." });
    return;
  }
  if (!startDate || !endDate) {
    setMsg({ type: "danger", text: "Seleccioná un rango de fechas." });
    return;
  }

  // Validar solapamiento
  if (hasOverlap(startDate, endDate, selectedRoom?.reservedDates)) {
    setMsg({
      type: "danger",
      text: "❌ Las fechas seleccionadas se superponen con reservas existentes. Elegí otro rango.",
    });
    return;
  }

  const clienteNormalizado = {
    nombre: cliente.nombre.trim(),
    email: cliente.email.trim(),
    telefono: cliente.telefono.trim(),
    documento: cliente.documento.trim(),
  };

  // (Opcional) Podés guardar un "hold" temporal si querés, pero para simplificar
  // solo navegamos con los datos. La reserva se consolidará post-pago.

  navigate("/reserva/info", {
    state: {
      roomId: String(roomId),
      start: toYMD(startDate),
      end: toYMD(endDate),
      cliente: clienteNormalizado,
    },
  });
};

  return (
    <>
      <NavbarUsuario />
      <Container className="mt-5">
        <Card className="shadow-sm">
          <Card.Body>
            <h3 className="mb-4">Completar reserva</h3>

            {msg.text && (
              <Alert variant={msg.type} className="mb-4">
                {msg.text}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Row className="g-4">
                {/* Selección de habitación */}
                <Col md={6}>
                  <Form.Label>Habitación</Form.Label>
                  <Form.Select
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    required
                  >
                    <option value="">Seleccioná una habitación</option>
                    {habitaciones.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.nombre} — ${h.precio || 0}/noche
                      </option>
                    ))}
                  </Form.Select>
                  {selectedRoom && (
                    <Form.Text muted>{selectedRoom.descripcion}</Form.Text>
                  )}
                </Col>

                {/* Fechas */}
                <Col md={6}>
                  <Form.Label>Fechas</Form.Label>
                  <div>
                    <DatePicker
                      selectsRange
                      startDate={startDate}
                      endDate={endDate}
                      onChange={onDatesChange}
                      excludeDates={reservedDatesAsDate}
                      minDate={new Date()}
                      monthsShown={2}
                      dateFormat="dd/MM/yyyy"
                      inline
                    />
                  </div>
                  <Form.Text muted>
                    Las fechas bloqueadas ya están reservadas.
                  </Form.Text>
                </Col>
              </Row>

              <hr className="my-4" />

              {/* Datos del cliente */}
              <Row className="g-3">
                <Col md={6}>
                  <Form.Label>Nombre completo</Form.Label>
                  <Form.Control
                    value={cliente.nombre}
                    onChange={(e) =>
                      setCliente((c) => ({ ...c, nombre: sanitizeName(e.target.value) }))
                    }
                    inputMode="text"
                    autoComplete="name"
                    required
                  />
                </Col>
                <Col md={6}>
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={cliente.email}
                    onChange={(e) =>
                      setCliente((c) => ({ ...c, email: e.target.value.trim() }))
                    }
                    autoComplete="email"
                    required
                  />
                </Col>
                <Col md={6}>
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control
                    value={cliente.telefono}
                    onChange={(e) =>
                      setCliente((c) => ({ ...c, telefono: sanitizePhone(e.target.value) }))
                    }
                    placeholder="+5491112345678"
                    inputMode="tel"
                    required
                  />
                </Col>
                <Col md={6}>
                  <Form.Label>Documento</Form.Label>
                  <Form.Control
                    value={cliente.documento}
                    onChange={(e) =>
                      setCliente((c) => ({ ...c, documento: sanitizeNumeric(e.target.value) }))
                    }
                    placeholder="DNI / Pasaporte"
                    inputMode="numeric"
                    required
                  />
                </Col>
              </Row>

              <div className="mt-4 d-flex gap-2">
                <Button type="submit" variant="primary">
                  Confirmar datos
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
