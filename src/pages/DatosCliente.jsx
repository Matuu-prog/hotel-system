import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Container, Card, Form, Button } from "react-bootstrap";
import NavbarUsuario from "../components/NavBarUsuario";

export default function DatosCliente() {
  const { state } = useLocation();
  const navigate = useNavigate();

  // Si no viene state, volvemos a habitaciones
  if (!state?.roomId || !state?.startDate || !state?.endDate) {
    navigate("/habitaciones");
  }

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

    navigate("/pago", {
      state: {
        roomId: state.roomId,
        startDate: state.startDate,
        endDate: state.endDate,
        cliente: form,
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
              Reserva seleccionada: Habitación #{state?.roomId} — del {state?.startDate} al {state?.endDate}
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
