import RoleCard from "../components/RoleCard";
import { Container, Row, Col } from "react-bootstrap";

/**
 * Página principal del sistema (HUB).
 * Permite elegir un rol para navegar.
 */
function Hub() {
  const roles = [
    {
      title: "Usuario Comercial",
      description: "Ver habitaciones, servicios y realizar reservas.",
      icon: "👤",
      path: "/usuario",
    },
    {
      title: "Operador",
      description: "Consultar, procesar pagos y gestionar reservas.",
      icon: "🧾",
      path: "/operador",
    },
    {
      title: "Administrador",
      description: "Administrar habitaciones y operadores.",
      icon: "⚙️",
      path: "/admin",
    },
  ];

  return (
    <Container className="text-center mt-5">
      <h1 className="mb-4">🏨 Sistema de Gestión Hotelera</h1>
      <h4 className="mb-5">Selecciona un rol para continuar</h4>

      <Row className="justify-content-center">
        {roles.map((role) => (
          <Col key={role.title} md={3} className="mb-4">
            <RoleCard {...role} />
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default Hub;