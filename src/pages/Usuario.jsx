// Usuario.jsx
// Página principal para el rol "Usuario Comercial".
// Incluye la Navbar superior y el carrusel de imágenes del hotel.

import NavbarUsuario from "../components/NavBarUsuario";
import CarouselHotel from "../components/CarouselHotel";
import { Container, Row, Col, Form, Button } from "react-bootstrap";

function Usuario() {
  return (
    <>
      <NavbarUsuario />
      <CarouselHotel />
      <Container className="mt-4 text-center">
        <h2>Bienvenido a Hotel Paradise 🌴</h2>
        <p>
          Explorá nuestras habitaciones, servicios y hacé tu reserva fácilmente desde nuestra página.
        </p>
      </Container>
      <Container className="my-5">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <h3 className="text-center mb-3">Contacto</h3>
            <p className="text-center text-muted">
              ¿Tenés consultas o comentarios? Completá el formulario y nuestro equipo se comunicará con vos a la brevedad.
            </p>
            <Form>
              <Form.Group controlId="contactoNombre" className="mb-3">
                <Form.Label>Nombre</Form.Label>
                <Form.Control type="text" placeholder="Tu nombre" required />
              </Form.Group>
              <Form.Group controlId="contactoEmail" className="mb-3">
                <Form.Label>Correo electrónico</Form.Label>
                <Form.Control type="email" placeholder="nombre@ejemplo.com" required />
              </Form.Group>
              <Form.Group controlId="contactoMensaje" className="mb-4">
                <Form.Label>Mensaje</Form.Label>
                <Form.Control as="textarea" rows={4} placeholder="¿En qué podemos ayudarte?" required />
              </Form.Group>
              <div className="d-grid">
                <Button variant="primary" type="submit">
                  Enviar mensaje
                </Button>
              </div>
            </Form>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default Usuario;