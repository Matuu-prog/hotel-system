import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function NavbarUsuario() {
  const navigate = useNavigate();
  const [usuarioActual, setUsuarioActual] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("usuarioActual"));
    setUsuarioActual(user);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("usuarioActual");
    setUsuarioActual(null);
    navigate("/"); // volver al inicio
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/">
          Hotel Mirador
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            <Nav.Link as={Link} to="/">
              Inicio
            </Nav.Link>
            <Nav.Link as={Link} to="/habitaciones">
              Habitaciones
            </Nav.Link>
            <Nav.Link as={Link} to="/servicios">
              Servicios
            </Nav.Link>

            {/* Si NO hay usuario logueado → botón Iniciar sesión */}
            {!usuarioActual ? (
              <Nav.Link as={Link} to="/login">
                Iniciar sesión
              </Nav.Link>
            ) : (
              <>
                <span className="text-light me-3">
                  👤 {usuarioActual.nombre}{" "}
                  {usuarioActual.rol === "superadmin" && (
                    <span style={{ color: "gold" }}>⭐</span>
                  )}
                </span>
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={handleLogout}
                >
                  Cerrar sesión
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavbarUsuario;