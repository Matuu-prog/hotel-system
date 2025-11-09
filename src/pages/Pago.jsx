import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Container, Card, Form, Button } from "react-bootstrap";
import NavbarUsuario from "../components/NavBarUsuario";

export default function Pago() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state?.roomId || !state?.startDate || !state?.endDate || !state?.cliente) {
    navigate("/habitaciones");
  }

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
    const out = [];
    let cur = new Date(start);
    const fin = new Date(end);
    while (cur <= fin) {
      out.push(cur.toISOString().split("T")[0]);
      cur.setDate(cur.getDate() + 1);
    }
    return out;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const error = validar();
    if (error) {
      alert(error);
      return;
    }

    // Simular pago OK → persistir reserva con datos del cliente
    const habitaciones = JSON.parse(localStorage.getItem("habitaciones")) || [];
    const idx = habitaciones.findIndex((h) => String(h.id) === String(state.roomId));
    if (idx !== -1) {
      const fechas = rangeToArray(state.startDate, state.endDate);
      const prev = new Set(habitaciones[idx].reservedDates || []);
      fechas.forEach((d) => prev.add(d));
      habitaciones[idx] = {
        ...habitaciones[idx],
        reservedDates: Array.from(prev),
        ultimaReserva: {
          cliente: state.cliente,
          startDate: state.startDate,
          endDate: state.endDate,
          pago: {
            titular: form.titular,
            // Nunca guardes datos sensibles reales. Aquí es solo demo:
            masked: `**** **** **** ${form.numero.slice(-4)}`,
          },
        },
      };
      localStorage.setItem("habitaciones", JSON.stringify(habitaciones));
    }

    alert("✅ Pago procesado. ¡Reserva confirmada!");
    navigate("/habitaciones");
  };

  return (
    <>
      <NavbarUsuario />
      <Container className="mt-5">
        <Card className="shadow-sm">
          <Card.Body>
            <h3 className="mb-3">Pago</h3>

            <p className="text-muted">
              Habitación #{state?.roomId} — del {state?.startDate} al {state?.endDate}<br />
              Cliente: {state?.cliente?.nombre} — {state?.cliente?.email}
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
