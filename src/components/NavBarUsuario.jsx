import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

function NavbarUsuario() {
  const navigate = useNavigate();
  const location = useLocation();
  const [usuarioActual, setUsuarioActual] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("usuarioActual"));
    setUsuarioActual(user);
  }, [location.pathname]); // refresca al cambiar de ruta

  const handleLogout = () => {
    localStorage.removeItem("usuarioActual");
    setUsuarioActual(null);
    navigate("/");
  };

  const panelLink =
    usuarioActual?.rol === "superadmin" || usuarioActual?.rol === "admin"
      ? "/admin"
      : usuarioActual?.rol === "operador"
      ? "/operador"
      : null;

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/">Hotel Paradise 🏖️</Navbar.Brand>
        <Navbar.Toggle aria-controls="nav" />
        <Navbar.Collapse id="nav">
          <Nav className="ms-auto align-items-center">
            <Nav.Link as={Link} to="/">Inicio</Nav.Link>
            <Nav.Link as={Link} to="/habitaciones">Habitaciones</Nav.Link>
            <Nav.Link as={Link} to="/servicios">Servicios</Nav.Link>

            {/* Mostrar UN SOLO panel según rol */}
            {panelLink && (
              <Nav.Link as={Link} to={panelLink}>
                Panel
              </Nav.Link>
            )}

            {!usuarioActual ? (
              <Nav.Link as={Link} to="/login">Iniciar sesión</Nav.Link>
            ) : (
              <>
                <span className="text-light mx-2">
                  👤 {usuarioActual.nombre}
                  {usuarioActual.rol === "superadmin" && (
                    <span style={{ color: "gold" }}> ⭐</span>
                  )}
                </span>
                <Button variant="outline-light" size="sm" onClick={handleLogout}>
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
