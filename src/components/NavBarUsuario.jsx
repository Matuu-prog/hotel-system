// NavbarUsuario.jsx
// Navbar del rol "Usuario Comercial" — muestra enlaces a distintas secciones del sitio.
// Usa React-Bootstrap y React Router para navegación sin recargar la página.

import { Navbar, Nav, Container } from "react-bootstrap";
import { Link } from "react-router-dom";

function NavbarUsuario() {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container>
        {/* Logo o nombre del hotel */}
        <Navbar.Brand as={Link} to="/hub">
          🏨 Hotel Paradise
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="navbar-usuario" />
        <Navbar.Collapse id="navbar-usuario">
          <Nav className="ms-auto">
            {/* Enlaces principales */}
            <Nav.Link as={Link} to="/hub">Inicio</Nav.Link>
            <Nav.Link as={Link} to="/habitaciones">Habitaciones</Nav.Link>
            <Nav.Link as={Link} to="/servicios">Servicios</Nav.Link>
            <Nav.Link as={Link} to="/reservar">Hacer una Reserva</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavbarUsuario;