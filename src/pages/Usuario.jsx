// Usuario.jsx
// Página principal para el rol "Usuario Comercial".
// Incluye la Navbar superior y el carrusel de imágenes del hotel.

import { useState } from "react";
import NavbarUsuario from "../components/NavBarUsuario";
import CarouselHotel from "../components/CarouselHotel";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import InfoExtraHotel from "../components/InfoExtraHotel";


function Usuario() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    mensaje: "",
  });
  const [mensajeConfirmacion, setMensajeConfirmacion] = useState("");
  const [mensajeError, setMensajeError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setMensajeConfirmacion("");
    setMensajeError("");

    const nombre = formData.nombre.trim();
    const email = formData.email.trim();
    const mensaje = formData.mensaje.trim();

    if (!nombre || !email || !mensaje) {
      setMensajeError("Por favor completá todos los campos antes de enviar.");
      return;
    }

    const nuevoMensaje = {
      id: Date.now(),
      nombre,
      email,
      mensaje,
      enviadoEn: new Date().toISOString(),
      respuesta: "",
      respondidoEn: null,
      respondidoPor: null,
    };

    try {
      const prev = JSON.parse(localStorage.getItem("mensajesContacto") || "[]");
      const actualizados = [nuevoMensaje, ...prev];
      localStorage.setItem("mensajesContacto", JSON.stringify(actualizados));
      setFormData({ nombre: "", email: "", mensaje: "" });
      setMensajeConfirmacion("¡Gracias por tu mensaje! Nuestro equipo te responderá a la brevedad.");
    } catch (error) {
      console.error("No se pudo guardar el mensaje de contacto", error);
      setMensajeError("Ocurrió un problema al enviar el mensaje. Intentalo nuevamente.");
    }
  };

  return (
    <>
      <NavbarUsuario />
      <CarouselHotel />
      <InfoExtraHotel />
      <Container className="mt-4">
        <div className="p-5 text-center bg-dark text-light rounded-4 shadow-lg">
          <h2 className="fw-semibold">Bienvenido a Hotel Paradise 🌴</h2>
          <p className="mt-3 text-secondary">
            Explorá nuestras habitaciones, servicios y hacé tu reserva fácilmente desde nuestra página.
          </p>
        </div>
      </Container>
      <Container className="my-5">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <div className="p-4 p-sm-5 bg-dark text-light rounded-4 shadow-lg">
              <h3 className="text-center mb-3">Contacto</h3>
              <p className="text-center text-secondary">
                ¿Tenés consultas o comentarios? Completá el formulario y nuestro equipo se comunicará con vos a la brevedad.
              </p>
              {mensajeConfirmacion && (
                <Alert variant="success" className="text-start">
                  {mensajeConfirmacion}
                </Alert>
              )}
              {mensajeError && (
                <Alert variant="danger" className="text-start">
                  {mensajeError}
                </Alert>
              )}
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="contactoNombre" className="mb-3">
                  <Form.Label className="text-light">Nombre</Form.Label>
                  <Form.Control
                    type="text"
                    name="nombre"
                    placeholder="Tu nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    className="bg-dark text-light border-secondary"
                    required
                  />
                </Form.Group>
                <Form.Group controlId="contactoEmail" className="mb-3">
                  <Form.Label className="text-light">Correo electrónico</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="nombre@ejemplo.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="bg-dark text-light border-secondary"
                    required
                  />
                </Form.Group>
                <Form.Group controlId="contactoMensaje" className="mb-4">
                  <Form.Label className="text-light">Mensaje</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="mensaje"
                    placeholder="¿En qué podemos ayudarte?"
                    value={formData.mensaje}
                    onChange={handleChange}
                    className="bg-dark text-light border-secondary"
                    required
                  />
                </Form.Group>
                <div className="d-grid">
                  <Button variant="light" type="submit" className="fw-semibold">
                    Enviar mensaje
                  </Button>
                </div>
              </Form>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default Usuario;