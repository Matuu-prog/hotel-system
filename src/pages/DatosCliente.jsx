import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Container, Card, Form, Button } from "react-bootstrap";
import NavbarUsuario from "../components/NavBarUsuario";

export default function DatosCliente() {
  const { state } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!state?.roomId || !state?.startDate || !state?.endDate) {
      navigate("/habitaciones");
    }
  }, [state, navigate]);

  const session = typeof window !== "undefined" ? window.sessionStorage : null;
  const [habitaciones, setHabitaciones] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("habitaciones")) || [];
    setHabitaciones(data);
  }, []);

  const habitacion = useMemo(
    () => habitaciones.find((h) => String(h.id) === String(state?.roomId)),
    [habitaciones, state?.roomId]
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

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    documento: "",
  });

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const validar = () => {
    if (!form.nombre.trim()) return "Ingresá tu nombre";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Email inválido";
    if (!/^\+?\d{7,15}$/.test(form.telefono)) return "Teléfono inválido";
    if (!form.documento.trim()) return "Documento requerido";
    return "";
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const error = validar();
    if (error) {
      alert(error);
      return;
    }

    const reservas = JSON.parse(localStorage.getItem("reservas")) || [];
    const fechas = rangeToArray(state.startDate, state.endDate);
    const noches = Math.max(1, fechas.length - 1);
    const precioBase = Number(habitacion?.precio ?? habitacion?.tarifa ?? 0);
    const montoEstimado = precioBase * noches;

    const roomName = habitacion?.nombre || `Habitación ${state.roomId}`;

    const sessionReservaId = session?.getItem("reservaEnProceso");
    let reservaId = sessionReservaId ? Number(sessionReservaId) : null;
    let reservaIdx = reservaId
      ? reservas.findIndex((r) => String(r.id) === String(reservaId))
      : -1;

    if (reservaIdx !== -1) {
      const existente = reservas[reservaIdx];
      reservas[reservaIdx] = {
        ...existente,
        roomId: String(state.roomId),
        roomName,
        start: state.startDate,
        end: state.endDate,
        cliente: { ...form },
        pago: {
          estado: "pendiente",
          metodo: null,
          monto: montoEstimado,
          fecha: null,
          operador: "Reserva online",
        },
        origen: "web",
      };
      reservaId = existente.id;
    } else {
      const nueva = {
        id: Date.now(),
        roomId: String(state.roomId),
        roomName,
        start: state.startDate,
        end: state.endDate,
        cliente: { ...form },
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
      reservaId = nueva.id;
    }

    localStorage.setItem("reservas", JSON.stringify(reservas));
    session?.setItem("reservaEnProceso", String(reservaId));


    navigate("/pago", {
      state: {
        reservaId,
      },
    });
  };

  return (
    <>
      <NavbarUsuario />
      <Container className="mt-5">
        <Card className="shadow-sm">
          <Card.Body>
            <h3 className="mb-3">Datos del cliente</h3>
            <p className="text-muted">
              Reserva seleccionada: {habitacion?.nombre || `Habitación #${state?.roomId}`} — del {state?.startDate} al {state?.endDate}
            </p>

            <Form onSubmit={onSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre completo</Form.Label>
                <Form.Control name="nombre" value={form.nombre} onChange={onChange} required />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control name="email" type="email" value={form.email} onChange={onChange} required />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Teléfono</Form.Label>
                <Form.Control name="telefono" value={form.telefono} onChange={onChange} placeholder="+549..." required />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Documento</Form.Label>
                <Form.Control name="documento" value={form.documento} onChange={onChange} required />
              </Form.Group>

              <div className="d-flex gap-2">
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
