import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import NavbarUsuario from "../components/NavBarUsuario";
import { ensureHabitaciones } from "../utils/habitaciones";
import {
  sanitizeName,
  sanitizeCardNumber,
  sanitizeCardExpiry,
  sanitizeCVV,
  isValidName,
  isValidCardNumber,
  isValidExpiry,
  isValidCVV,
} from "../utils/validation";

export default function Pago() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const session = typeof window !== "undefined" ? window.sessionStorage : null;

  const reservaId = useMemo(() => {
    if (state?.reservaId) return state.reservaId;
    const stored = session?.getItem("reservaEnProceso");
    if (stored) return Number(stored);
    return null;
  }, [state, session]);

  const [reserva, setReserva] = useState(null);
  const [habitaciones, setHabitaciones] = useState([]);

  useEffect(() => {
    const disponibles = ensureHabitaciones();
    setHabitaciones(disponibles);

    const reservasGuardadas = JSON.parse(localStorage.getItem("reservas")) || [];

    if (!reservaId) {
      navigate("/habitaciones");
      return;
    }

    const encontrada = reservasGuardadas.find((r) => String(r.id) === String(reservaId));
    if (!encontrada) {
      alert("No pudimos encontrar la reserva. Volvé a iniciar el proceso.");
      session?.removeItem("reservaEnProceso");
      navigate("/habitaciones");
      return;
    }

    setReserva(encontrada);
    session?.setItem("reservaEnProceso", String(encontrada.id));
  }, [reservaId, navigate, session]);

  const [form, setForm] = useState({
    titular: "",
    numero: "",
    vencimiento: "",
    cvv: "",
  });

  const onChange = (e) => {
    const { name, value } = e.target;
    const sanitizers = {
      titular: sanitizeName,
      numero: sanitizeCardNumber,
      vencimiento: sanitizeCardExpiry,
      cvv: sanitizeCVV,
    };
    const sanitizer = sanitizers[name] || ((val) => val);
    setForm((f) => ({ ...f, [name]: sanitizer(value) }));
  };

  const validar = () => {
    if (!isValidName(form.titular)) return "Ingresá el titular (solo letras).";
    if (!isValidCardNumber(form.numero)) return "Número de tarjeta inválido";
    if (!isValidExpiry(form.vencimiento)) return "Vencimiento inválido (MM/AA)";
    if (!isValidCVV(form.cvv)) return "CVV inválido";
    return "";
  };

  const rangeToArray = (start, end) => {
    if (!start || !end) return [];
    const out = [];
    let cur = new Date(start);
    const fin = new Date(end);
    while (cur <= fin) {
      out.push(cur.toISOString().split("T")[0]);
      cur.setDate(cur.getDate() + 1);
    }
    return out;
  };

  const noches = useMemo(() => {
    if (!reserva) return 0;
    const fechas = rangeToArray(reserva.start, reserva.end);
    return Math.max(1, fechas.length - 1);
  }, [reserva]);

  const precioPorNoche = useMemo(() => {
    if (!reserva) return 0;
    const habitacion = habitaciones.find((h) => String(h.id) === String(reserva.roomId));
    if (habitacion) {
      return Number(habitacion.precio ?? habitacion.tarifa ?? 0);
    }
    if (reserva?.pago?.monto && noches > 0) {
      return Math.round(reserva.pago.monto / noches);
    }
    return 0;
  }, [habitaciones, reserva, noches]);

  const subtotalEstimado = useMemo(() => {
    if (!reserva) return 0;
    if (reserva?.pago?.monto && reserva.pago.monto > 0) {
      return reserva.pago.monto;
    }
    return (precioPorNoche || 0) * (noches || 1);
  }, [reserva, precioPorNoche, noches]);


  const onSubmit = (e) => {
    e.preventDefault();
    const error = validar();
    if (error) {
      alert(error);
      return;
    }

    if (!reserva) {
      alert("No hay una reserva para asociar al pago.");
      return;
    }

    const reservas = JSON.parse(localStorage.getItem("reservas")) || [];
    const reservaIdx = reservas.findIndex((r) => String(r.id) === String(reserva.id));
    if (reservaIdx === -1) {
      alert("No pudimos encontrar la reserva. Volvé a iniciar el proceso.");
      session?.removeItem("reservaEnProceso");
      navigate("/habitaciones");
      return;
    }

    const habitacionesActualizadas = ensureHabitaciones();
    const habitacionIdx = habitacionesActualizadas.findIndex(
      (h) => String(h.id) === String(reserva.roomId)
    );
    const fechas = rangeToArray(reserva.start, reserva.end);

    let roomNombre = reserva.roomName || `Habitación ${reserva.roomId}`;
    let precioUnitario = precioPorNoche;

    if (habitacionIdx !== -1) {
      const habitacion = habitacionesActualizadas[habitacionIdx];
      roomNombre = habitacion?.nombre || roomNombre;
      precioUnitario = Number(habitacion?.precio ?? habitacion?.tarifa ?? 0);

      const prev = new Set(habitacion.reservedDates || []);
      fechas.forEach((d) => prev.add(d));
      habitacionesActualizadas[habitacionIdx] = {
        ...habitacion,
        nombre: roomNombre,
        reservedDates: Array.from(prev),
        ultimaReserva: {
          cliente: reserva.cliente,
          startDate: reserva.start,
          endDate: reserva.end,
          pago: {
            titular: form.titular,
            masked: `**** **** **** ${form.numero.slice(-4)}`,
          },
        },
      };
      localStorage.setItem("habitaciones", JSON.stringify(habitacionesActualizadas));
      setHabitaciones(habitacionesActualizadas);
    }

    const montoCalculado =
      reserva?.pago?.monto && reserva.pago.monto > 0
        ? reserva.pago.monto
        : (precioUnitario || 0) * (noches || 1);

    const reservaActualizada = {
      ...reserva,
      roomName: roomNombre,
      pago: {
        estado: "pagado",
        metodo: "Tarjeta",
        monto: montoCalculado,
        fecha: new Date().toISOString(),
        operador: "Reserva online",
        titular: form.titular,
        masked: `**** **** **** ${form.numero.slice(-4)}`,
      },
    };

    reservas[reservaIdx] = reservaActualizada;
    localStorage.setItem("reservas", JSON.stringify(reservas));

    const logs = JSON.parse(localStorage.getItem("logs")) || [];
    const registroLogs = [
      {
        id: Date.now(),
        fecha: new Date().toISOString(),
        operador: "Reserva online",
        accion: "Reserva confirmada",
        roomId: String(reserva.roomId),
        reservaId: reserva.id,
        monto: montoCalculado,
      },
      ...logs,
    ];
    localStorage.setItem("logs", JSON.stringify(registroLogs));

    session?.removeItem("reservaEnProceso");
    setReserva(reservaActualizada);

    alert("✅ Pago procesado. ¡Reserva confirmada!");
    navigate("/habitaciones");
  };

  if (!reserva) {
    return (
      <>
        <NavbarUsuario />
        <Container className="mt-5">
          <Card className="shadow-sm">
            <Card.Body>
              <h3 className="mb-3">Buscando reserva…</h3>
              <p className="text-muted mb-0">Redirigiendo al flujo de reserva.</p>
            </Card.Body>
          </Card>
        </Container>
      </>
    );
  }

  return (
    <>
      <NavbarUsuario />
      <Container className="mt-5">
        <Card className="shadow-sm">
          <Card.Body>
            <h3 className="mb-3">Pago</h3>

            <p className="text-muted">
              {reserva.roomName} — del {reserva.start} al {reserva.end} ({noches} noches)
              <br />
              Cliente: {reserva.cliente?.nombre} — {reserva.cliente?.email}
            </p>

            <Alert variant="light" className="border">
              <div>
                <strong>Tarifa por noche:</strong> ${precioPorNoche.toLocaleString("es-AR")}
              </div>
              <div>
                <strong>Subtotal estimado:</strong> ${subtotalEstimado.toLocaleString("es-AR")}
              </div>
            </Alert>

            <Form onSubmit={onSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Titular</Form.Label>
                <Form.Control
                  name="titular"
                  value={form.titular}
                  onChange={onChange}
                  required
                  autoComplete="cc-name"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Número de tarjeta</Form.Label>
                <Form.Control
                  name="numero"
                  value={form.numero}
                  onChange={onChange}
                  placeholder="Solo números"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Vencimiento (MM/AA)</Form.Label>
                <Form.Control
                  name="vencimiento"
                  value={form.vencimiento}
                  onChange={onChange}
                  placeholder="MM/AA"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  required
                />
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label>CVV</Form.Label>
                <Form.Control
                  name="cvv"
                  value={form.cvv}
                  onChange={onChange}
                  placeholder="3 o 4 dígitos"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  required
                />
              </Form.Group>

              <div className="d-flex gap-2">
                <Button type="submit" variant="primary">Pagar y confirmar</Button>
                <Button variant="secondary" onClick={() => navigate(-1)}>Volver</Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}
