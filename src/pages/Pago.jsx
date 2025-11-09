import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Container, Card, Form, Button } from "react-bootstrap";
import NavbarUsuario from "../components/NavBarUsuario";

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

  useEffect(() => {
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

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const validar = () => {
    if (!form.titular.trim()) return "Ingresá el titular";
    if (!/^\d{13,19}$/.test(form.numero)) return "Número de tarjeta inválido";
    if (!/^\d{2}\/\d{2}$/.test(form.vencimiento)) return "Vencimiento inválido (MM/AA)";
    if (!/^\d{3,4}$/.test(form.cvv)) return "CVV inválido";
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

    const habitaciones = JSON.parse(localStorage.getItem("habitaciones")) || [];
 const habitacionIdx = habitaciones.findIndex((h) => String(h.id) === String(reserva.roomId));
    const fechas = rangeToArray(reserva.start, reserva.end);

    let roomNombre = reserva.roomName || `Habitación ${reserva.roomId}`;
    let precioUnitario = 0;

    if (habitacionIdx !== -1) {
      const habitacion = habitaciones[habitacionIdx];
      roomNombre = habitacion?.nombre || roomNombre;
      precioUnitario = Number(habitacion?.precio ?? habitacion?.tarifa ?? 0);

      const prev = new Set(habitacion.reservedDates || []);
      fechas.forEach((d) => prev.add(d));
       habitaciones[habitacionIdx] = {
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
      localStorage.setItem("habitaciones", JSON.stringify(habitaciones));
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

            <Form onSubmit={onSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Titular</Form.Label>
                <Form.Control name="titular" value={form.titular} onChange={onChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Número de tarjeta</Form.Label>
                <Form.Control name="numero" value={form.numero} onChange={onChange} placeholder="Solo números" required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Vencimiento (MM/AA)</Form.Label>
                <Form.Control name="vencimiento" value={form.vencimiento} onChange={onChange} placeholder="MM/AA" required />
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label>CVV</Form.Label>
                <Form.Control name="cvv" value={form.cvv} onChange={onChange} placeholder="3 o 4 dígitos" required />
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
